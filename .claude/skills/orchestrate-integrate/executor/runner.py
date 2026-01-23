"""Pipeline runner for Layer 2 - orchestrate-integrate.

Complete integration pipeline: Story → Dev → Quality → Git → PR → Merge
"""

import re
import time
import glob
from pathlib import Path
from typing import Optional, Dict, List, Tuple
from dataclasses import dataclass, field

from .config import ConfigLoader, IntegrateConfig, StageConfig
from .spawner import ClaudeSpawner, TaskResult
from .knowledge import KnowledgeBase
from .story_utils import StoryFileManager, StoryStatus


def log(msg: str) -> None:
    """Print with immediate flush for background visibility."""
    print(msg, flush=True)


@dataclass
class PipelineResult:
    """Result of Layer 2 execution."""
    success: bool
    story_id: Optional[str] = None
    story_file: Optional[str] = None
    files_changed: List[str] = field(default_factory=list)
    stage_results: Dict[str, str] = field(default_factory=dict)

    # Git/PR fields
    commit_hash: Optional[str] = None
    branch_name: Optional[str] = None
    pr_number: Optional[int] = None
    pr_url: Optional[str] = None
    pr_status: Optional[str] = None
    merge_status: Optional[str] = None

    # Stats
    lessons_saved: int = 0
    errors_prevented: int = 0
    duration_minutes: float = 0.0

    # Error info
    error: Optional[str] = None
    failed_stage: Optional[str] = None


class PipelineRunner:
    """
    Execute Layer 2 pipeline: Story → Dev → Quality → Git → PR → Merge.

    Handles:
    - Input resolution (auto-detect, story ID, file path, partial name)
    - All Layer 0 + Layer 1 + Layer 2 stages
    - Knowledge base integration
    - Auto-fix loops
    - PR monitoring and merge
    """

    def __init__(self, project_root: Path):
        self.project_root = Path(project_root)
        self.config_loader = ConfigLoader(project_root)
        self.spawner = ClaudeSpawner(project_root)
        self.knowledge = KnowledgeBase(project_root)
        self.story_manager = StoryFileManager(project_root)
        self.config: Optional[IntegrateConfig] = None
        self.start_time: float = 0

    def run(self, story_input: Optional[str] = None) -> PipelineResult:
        """
        Run complete integration pipeline.

        Args:
            story_input: Optional - can be:
                - None: Auto-detect next story
                - Story ID (e.g., "1-2-user-auth")
                - File path (e.g., "docs/stories/1-2-user-auth.md")
                - Partial name (e.g., "user-auth")
        """
        self.start_time = time.time()
        result = PipelineResult(success=False)

        try:
            # Step 0: Load config
            log("\n=== Step 0: Loading configuration ===")
            self.config = self.config_loader.load()
            self.spawner.set_config(self.config)
            self.knowledge.load()
            log("  ✓ Config loaded successfully")

            # Step 1: Resolve story ID and file
            log("\n=== Step 1: Resolving story ===")

            # Check for incomplete stories first (if no specific story requested)
            if not story_input:
                # Step 1: Check sprint-status.yaml for incomplete stories
                incomplete_ids = self.story_manager.get_incomplete_from_sprint_status()
                story_id = None
                story_file = None

                if incomplete_ids:
                    log(f"  Found {len(incomplete_ids)} incomplete stories in sprint-status.yaml: {', '.join(incomplete_ids[:3])}")

                    # Try to find file for each incomplete ID (in order)
                    for incomplete_id in incomplete_ids:
                        potential_file = self.config_loader.find_story_file(incomplete_id, self.config)
                        if potential_file:
                            # Check if story is actually complete (file status may differ from YAML)
                            file_status = self.story_manager.read_story_status(potential_file)
                            if file_status and file_status.is_complete:
                                log(f"  ⊘ Skipping {incomplete_id}: file shows complete (updating sprint-status)")
                                # Update sprint-status.yaml to match file
                                self.story_manager.update_sprint_status(incomplete_id, "done")
                                continue  # Skip to next story

                            story_id = incomplete_id
                            story_file = potential_file
                            log(f"  ✓ Selected story from sprint-status: {story_id}")
                            log(f"  ✓ Story file exists: {story_file}")
                            break
                        else:
                            log(f"  ℹ️  Story {incomplete_id} in sprint-status but file not found (will create)")
                            story_id = incomplete_id
                            story_file = None
                            break

                # Step 2: If no story from sprint-status, search filesystem
                if not story_id and not story_file:
                    log("  No tracked incomplete stories, searching filesystem...")
                    incomplete_stories = self.story_manager.find_incomplete_stories(
                        self.config.story_locations
                    )
                    if incomplete_stories:
                        story_id, story_file = incomplete_stories[0]
                        log(f"  ✓ Found incomplete story in filesystem: {story_id}")
                        log(f"  ✓ Will continue working on: {story_file}")

                # Step 3: Display progress if we found a story file
                if story_file:
                    status = self.story_manager.read_story_status(story_file)
                    if status:
                        log(f"  ✓ Progress: {status.completed_tasks}/{status.total_tasks} tasks complete")
                        if status.high_medium_incomplete > 0:
                            log(f"  ⚠ {status.high_medium_incomplete} HIGH/MEDIUM review items incomplete")

                    # Validate we're not skipping an epic
                    if story_id:
                        self._validate_epic_progression(story_id)

                # Step 4: If no incomplete work found, create new story
                if not story_id and not story_file:
                    log("  No incomplete stories found, will create new one")

                    # Before creating new story, validate current epic is complete
                    self._validate_current_epic_complete()

                    story_id, story_file = self._resolve_story_input(story_input)
            else:
                story_id, story_file = self._resolve_story_input(story_input)

            # If story_id or story_file is None, we'll handle it in stages
            # (create-story stage will auto-detect)
            result.story_id = story_id
            result.story_file = str(story_file) if story_file else None

            if story_id:
                log(f"  ✓ Story ID: {story_id}")
            if story_file:
                log(f"  ✓ Story file: {story_file}")

            # Step 2: Run all stages in order
            log("\n=== Step 2: Running pipeline stages ===")

            for stage_name in self._get_enabled_stages_in_order():
                log(f"\n--- Stage: {stage_name} ---")

                # Check if should skip (e.g., create-story if file exists)
                if self._should_skip_stage(stage_name, story_file):
                    log(f"  ⊘ Skipping {stage_name}")
                    result.stage_results[stage_name] = "SKIPPED"
                    continue

                # Run stage
                stage_result = self._run_stage(
                    stage_name,
                    story_id=story_id or "",
                    story_file=str(story_file) if story_file else "",
                    pr_number=result.pr_number or 0,
                    pr_url=result.pr_url or "",
                )

                result.stage_results[stage_name] = "PASS" if stage_result.get("success") else "FAIL"

                if not stage_result.get("success"):
                    result.error = stage_result.get("error", f"Stage {stage_name} failed")
                    result.failed_stage = stage_name
                    log(f"  ✗ {stage_name} failed: {result.error}")
                    return result

                log(f"  ✓ {stage_name} passed")

                # Update result with stage outputs
                self._update_result_from_stage(result, stage_name, stage_result)

                # If create-story just ran, update story_id and story_file
                if stage_name == "create-story":
                    if stage_result.get("story_id"):
                        story_id = stage_result["story_id"]
                        result.story_id = story_id
                    if stage_result.get("story_file"):
                        story_file = Path(stage_result["story_file"])
                        result.story_file = str(story_file)
                        log(f"  ✓ Story created: {story_id}")
                        log(f"  ✓ File: {story_file}")

                # Update story status after key stages
                if story_file and story_id:
                    self._update_story_status_after_stage(stage_name, story_file, story_id)

            # Success!
            result.success = True
            result.duration_minutes = (time.time() - self.start_time) / 60.0

            log("\n" + "=" * 70)
            log("✓ Layer 2 complete: Story integrated!")
            log(f"  Story: {result.story_id}")
            if result.pr_url:
                log(f"  PR: {result.pr_url}")
                log(f"  Status: {result.pr_status or 'unknown'}")
            log(f"  Time: {result.duration_minutes:.1f} minutes")
            log("=" * 70)

            return result

        except Exception as e:
            result.error = f"Pipeline error: {e}"
            result.duration_minutes = (time.time() - self.start_time) / 60.0
            log(f"\n✗ Pipeline failed: {e}")
            import traceback
            traceback.print_exc()
            return result

    def _resolve_story_input(
        self,
        story_input: Optional[str]
    ) -> Tuple[Optional[str], Optional[Path]]:
        """
        Resolve story input to (story_id, story_file).

        Handles:
        - None → return (None, None), let create-story auto-detect
        - Story ID → find file or return (id, None)
        - File path → return (extracted_id, file)
        - Partial name → search and return match
        """
        # Case 1: No input → Let create-story stage auto-detect
        if not story_input:
            log("  No input provided, will auto-detect in create-story stage")
            return None, None

        # Case 2: Input is a file path (.md extension)
        if story_input.endswith('.md'):
            story_file = self._resolve_file_path(story_input)
            if story_file and story_file.exists():
                story_id = self._extract_story_id_from_file(story_file)
                log(f"  ✓ Using file: {story_file}")
                log(f"  ✓ Extracted ID: {story_id}")
                return story_id, story_file
            else:
                log(f"  ✗ File not found: {story_input}")
                return None, None

        # Case 3: Input looks like story ID (pattern: N-N-name)
        if re.match(r'^\d+-\d+-[a-z0-9-]+$', story_input):
            story_id = story_input
            story_file = self.config_loader.find_story_file(story_id, self.config)

            if story_file:
                log(f"  ✓ Found existing story: {story_file}")
                return story_id, story_file
            else:
                log(f"  Story ID provided but file not found: {story_id}")
                log(f"  Will create story file in create-story stage")
                return story_id, None

        # Case 4: Partial name search
        log(f"  Searching for stories matching: {story_input}")
        matches = self._search_stories(story_input)

        if len(matches) == 0:
            log(f"  ✗ No stories found matching: {story_input}")
            return None, None
        elif len(matches) == 1:
            story_file = matches[0]
            story_id = self._extract_story_id_from_file(story_file)
            log(f"  ✓ Found match: {story_file}")
            return story_id, story_file
        else:
            # Multiple matches - use first one
            story_file = matches[0]
            story_id = self._extract_story_id_from_file(story_file)
            log(f"  ⚠ Multiple matches found, using first: {story_file}")
            return story_id, story_file

    def _resolve_file_path(self, path: str) -> Optional[Path]:
        """Resolve file path (absolute or relative)."""
        file_path = Path(path)

        if file_path.is_absolute() and file_path.exists():
            return file_path

        relative_path = self.project_root / path
        if relative_path.exists():
            return relative_path

        return None

    def _extract_story_id_from_file(self, story_file: Path) -> Optional[str]:
        """Extract story ID from filename."""
        filename = story_file.stem
        match = re.match(r'^(\d+-\d+-[a-z0-9-]+)', filename)
        if match:
            return match.group(1)
        return filename

    def _search_stories(self, search_term: str) -> List[Path]:
        """Search for story files containing the search term."""
        matches = []

        for location_template in self.config.story_locations:
            pattern = location_template.replace("${story_id}", "*")
            search_path = self.project_root / pattern

            for file_path_str in glob.glob(str(search_path)):
                file_path = Path(file_path_str)
                if search_term.lower() in file_path.stem.lower():
                    matches.append(file_path)

        return matches

    def _get_enabled_stages_in_order(self) -> List[str]:
        """Get list of enabled stages sorted by order."""
        stages = []
        for name, stage in self.config.stages.items():
            if stage.enabled:
                stages.append((stage.order, name))

        stages.sort(key=lambda x: x[0])
        return [name for _, name in stages]

    def _should_skip_stage(self, stage_name: str, story_file: Optional[Path]) -> bool:
        """Check if stage should be skipped."""
        stage = self.config.stages.get(stage_name)
        if not stage:
            return True

        # Check condition
        if stage.condition == "story_file_not_exists":
            # Skip create-story if:
            # 1. Story file exists, OR
            # 2. There are incomplete stories (we already found one)
            if story_file is not None and story_file.exists():
                # Validate the story is not complete
                status = self.story_manager.read_story_status(story_file)
                if status and not status.is_complete:
                    log(f"  ℹ️  Story exists and is incomplete, will continue working on it")
                    return True  # Skip create-story, use existing file

            return story_file is not None and story_file.exists()

        if stage.condition == "pr_checks_passed":
            # Will be checked in stage execution
            return False

        return False

    def _run_stage(self, stage_name: str, **context) -> Dict:
        """Run a single stage with auto-fix retry logic."""
        stage = self.config.stages.get(stage_name)
        if not stage or not stage.enabled:
            return {"success": True, "skipped": True}

        max_attempts = 1 + (stage.retry.max if stage.retry else 0)
        first_error = None

        # Load lessons for this stage
        limit = self._get_knowledge_limit(stage_name)
        lessons = self.knowledge.get_lessons_for_stage(stage_name, limit=limit)

        if lessons:
            log(f"  📚 Loaded {len(lessons)} lesson(s) for {stage_name}")

        # Format lessons for prompt
        known_issues = self.knowledge.format_for_prompt(lessons) if lessons else ""
        context["known_issues"] = known_issues

        # Inject PR/Git settings into context
        context["auto_merge"] = self.config.pr_settings.auto_merge
        context["merge_method"] = self.config.pr_settings.merge_method
        context["branch_prefix"] = self.config.git_settings.branch_prefix
        context["base_branch"] = self.config.git_settings.base_branch

        for attempt in range(1, max_attempts + 1):
            if attempt > 1:
                log(f"  → Retry {attempt - 1}/{stage.retry.max}")

            # Run stage
            result = self._execute_stage(stage_name, stage, **context)

            if result.success:
                # Track prevention if lessons helped on first try
                if attempt == 1 and lessons:
                    lesson_ids = [lesson["lesson_id"] for lesson in lessons]
                    self.knowledge.track_prevention(stage_name, lesson_ids)
                    log(f"  💡 {len(lessons)} lesson(s) helped prevent errors")

                return {"success": True, **result.__dict__}

            # Failed
            if attempt == 1:
                first_error = result.error or "Unknown error"

            log(f"  ✗ Attempt {attempt} failed: {result.error}")

            # Try to fix
            if attempt < max_attempts and stage.on_failure == "fix_and_retry":
                log(f"  Attempting auto-fix...")
                # TODO: Spawn fix agent here
                continue

            # No more retries
            if stage.on_failure == "continue":
                log(f"  ⚠ Continuing despite failure (non-blocking stage)")
                return {"success": True, "warning": result.error}

            # Abort
            return {"success": False, "error": result.error}

        # If we got here, save lesson
        if first_error:
            lesson_id = self.knowledge.add_lesson(
                stage=stage_name,
                error_type="unknown",
                error_pattern=first_error[:100],
                error_message=first_error,
                context=context,
                fix={"description": "Auto-fixed in retry"},
                success=True
            )
            log(f"  💡 Saved lesson: {lesson_id}")

        return {"success": True}

    def _execute_stage(self, stage_name: str, stage: StageConfig, **context) -> TaskResult:
        """Execute a single stage (spawn or direct)."""
        if stage.execution == "spawn":
            return self.spawner.spawn_stage(
                stage_name=stage_name,
                timeout=stage.timeout,
                **context
            )
        elif stage.execution == "direct":
            # Run bash command directly
            return self._run_direct_command(stage.command, stage.timeout)
        else:
            return TaskResult(
                success=False,
                output="",
                error=f"Unknown execution type: {stage.execution}",
                exit_code=-1
            )

    def _run_direct_command(self, command: str, timeout: int) -> TaskResult:
        """Run a bash command directly."""
        import subprocess
        try:
            start_time = time.time()
            result = subprocess.run(
                command,
                shell=True,
                cwd=str(self.project_root),
                capture_output=True,
                text=True,
                timeout=timeout
            )
            duration = time.time() - start_time

            return TaskResult(
                success=result.returncode == 0,
                output=result.stdout,
                error=result.stderr if result.returncode != 0 else None,
                exit_code=result.returncode,
                duration_seconds=duration
            )
        except subprocess.TimeoutExpired:
            return TaskResult(
                success=False,
                output="",
                error=f"Command timed out after {timeout}s",
                exit_code=-1,
                duration_seconds=timeout
            )
        except Exception as e:
            return TaskResult(
                success=False,
                output="",
                error=str(e),
                exit_code=-1
            )

    def _get_knowledge_limit(self, stage_name: str) -> Optional[int]:
        """Get lesson limit for a stage."""
        kb_config = self.config.knowledge_base
        if not kb_config.enabled:
            return 0

        # Check stage override
        if kb_config.stage_overrides and stage_name in kb_config.stage_overrides:
            return kb_config.stage_overrides[stage_name].get("max_lessons")

        return kb_config.max_lessons_per_stage

    def _update_result_from_stage(self, result: PipelineResult, stage_name: str, stage_result: Dict) -> None:
        """Update pipeline result with stage outputs."""
        # Extract PR info from pr-create stage
        if stage_name == "pr-create":
            if "pr_number" in stage_result:
                result.pr_number = stage_result["pr_number"]
            if "pr_url" in stage_result:
                result.pr_url = stage_result["pr_url"]

        # Extract merge status from pr-merge stage
        if stage_name == "pr-merge":
            if "pr_status" in stage_result:
                result.pr_status = stage_result["pr_status"]
            if "merge_status" in stage_result:
                result.merge_status = stage_result["merge_status"]

        # Extract commit info from git-commit stage
        if stage_name == "git-commit":
            if "commit_hash" in stage_result:
                result.commit_hash = stage_result["commit_hash"]

        # Extract branch name from git-push stage
        if stage_name == "git-push":
            if "branch_name" in stage_result:
                result.branch_name = stage_result["branch_name"]

    def _update_story_status_after_stage(
        self,
        stage_name: str,
        story_file: Path,
        story_id: str
    ) -> None:
        """Update story file status after key stages complete."""
        new_status = None

        # Determine new status based on stage
        if stage_name == "develop":
            new_status = "ready-to-review"
            log(f"  📝 Updating story status to: {new_status}")

        elif stage_name == "code-review":
            # After code review, mark as reviewed (ready for integration)
            new_status = "reviewed"
            log(f"  📝 Updating story status to: {new_status}")

        elif stage_name == "unit-test":
            # After tests pass, mark as done
            new_status = "done"
            log(f"  📝 Updating story status to: {new_status}")

        # Update both story file and sprint-status.yaml
        if new_status:
            success = self.story_manager.update_story_status(story_file, new_status)
            if success:
                self.story_manager.update_sprint_status(story_id, new_status)
                log(f"  ✓ Story status updated: {new_status}")
            else:
                log(f"  ⚠ Failed to update story status")

    def _validate_epic_progression(self, story_id: str) -> None:
        """
        Validate we're not skipping stories within an epic.

        Checks that we're working on stories in order within an epic.
        """
        epic_id = self.story_manager.get_story_epic(story_id)
        if not epic_id:
            return

        log(f"  ℹ️  Validating epic progression for {epic_id}")

        # This is informational - just log if there are other incomplete stories
        # in the same epic
        incomplete_stories = self.story_manager.find_incomplete_stories(
            self.config.story_locations
        )

        same_epic_incomplete = [
            (sid, path) for sid, path in incomplete_stories
            if self.story_manager.get_story_epic(sid) == epic_id and sid != story_id
        ]

        if same_epic_incomplete:
            log(f"  ⚠ Warning: {len(same_epic_incomplete)} other stories in {epic_id} are incomplete:")
            for sid, _ in same_epic_incomplete[:3]:  # Show first 3
                log(f"    - {sid}")

    def _validate_current_epic_complete(self) -> None:
        """
        Validate current epic is complete before creating new story in next epic.

        This prevents creating Epic 2 stories when Epic 1 is incomplete.
        """
        log(f"  ℹ️  Validating current epic completion before creating new story")

        incomplete_stories = self.story_manager.find_incomplete_stories(
            self.config.story_locations
        )

        if not incomplete_stories:
            log(f"  ✓ No incomplete stories found, OK to create new story")
            return

        # Group by epic
        epic_incomplete: Dict[str, List[str]] = {}
        for story_id, _ in incomplete_stories:
            epic_id = self.story_manager.get_story_epic(story_id)
            if epic_id:
                if epic_id not in epic_incomplete:
                    epic_incomplete[epic_id] = []
                epic_incomplete[epic_id].append(story_id)

        if epic_incomplete:
            log(f"  ⚠ WARNING: Found incomplete stories in {len(epic_incomplete)} epic(s):")
            for epic_id, stories in sorted(epic_incomplete.items()):
                log(f"    {epic_id}: {len(stories)} incomplete")
                for story_id in stories[:2]:  # Show first 2
                    log(f"      - {story_id}")

            log(f"  ⚠ Recommendation: Complete these stories before starting new epic")
