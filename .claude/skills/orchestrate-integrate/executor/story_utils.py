"""Story file utilities for status tracking and validation."""

import re
import yaml
from pathlib import Path
from typing import Optional, Dict, List, Tuple
from dataclasses import dataclass


@dataclass
class StoryStatus:
    """Story completion status."""
    story_id: str
    status: str  # not-started, in-progress, ready-to-review, done, etc.
    total_tasks: int
    completed_tasks: int
    total_review_items: int
    completed_review_items: int
    high_medium_incomplete: int  # Count of unchecked HIGH/MEDIUM priority items
    is_complete: bool

    def completion_percentage(self) -> float:
        """Calculate overall completion percentage."""
        if self.total_tasks == 0:
            return 100.0
        return (self.completed_tasks / self.total_tasks) * 100.0


class StoryFileManager:
    """Manage story file operations: read, update status, validate."""

    def __init__(self, project_root: Path):
        self.project_root = Path(project_root)

    def read_story_status(self, story_file: Path) -> Optional[StoryStatus]:
        """
        Read story file and parse completion status.

        Returns StoryStatus with checkbox counts and current status.
        """
        if not story_file or not story_file.exists():
            return None

        try:
            content = story_file.read_text()

            # Extract story ID from filename
            story_id = story_file.stem

            # Find status field (usually at bottom: "## Status\ndone")
            status_match = re.search(r'^## Status\s*\n([a-z-]+)', content, re.MULTILINE)
            current_status = status_match.group(1) if status_match else "unknown"

            # Count tasks: ## Tasks or ## Acceptance Criteria sections
            task_pattern = r'^- \[([ x])\] (?!\[AI-Review\])'  # Exclude AI-Review items
            review_pattern = r'^- \[([ x])\] \[AI-Review\]'

            tasks = re.findall(task_pattern, content, re.MULTILINE)
            review_items = re.findall(review_pattern, content, re.MULTILINE)

            completed_tasks = sum(1 for check in tasks if check == 'x')
            completed_review = sum(1 for check in review_items if check == 'x')

            # Count unchecked HIGH/MEDIUM priority review items
            high_medium_incomplete = 0
            for line in content.split('\n'):
                if re.match(r'^- \[ \] \[AI-Review\]\[(HIGH|MEDIUM)\]', line):
                    high_medium_incomplete += 1

            is_complete = (
                completed_tasks == len(tasks) and
                len(tasks) > 0 and
                high_medium_incomplete == 0 and
                current_status == "done"
            )

            return StoryStatus(
                story_id=story_id,
                status=current_status,
                total_tasks=len(tasks),
                completed_tasks=completed_tasks,
                total_review_items=len(review_items),
                completed_review_items=completed_review,
                high_medium_incomplete=high_medium_incomplete,
                is_complete=is_complete,
            )
        except Exception as e:
            print(f"[story_utils] Error reading story status: {e}")
            return None

    def update_story_status(self, story_file: Path, new_status: str) -> bool:
        """
        Update the status field in a story file.

        Args:
            story_file: Path to story markdown file
            new_status: New status value (e.g., "in-progress", "ready-to-review", "done")

        Returns:
            True if updated successfully
        """
        if not story_file or not story_file.exists():
            return False

        try:
            content = story_file.read_text()

            # Replace status field (## Status\nold_status -> ## Status\nnew_status)
            status_pattern = r'^(## Status\s*\n)[a-z-]+(\s*)$'

            if re.search(status_pattern, content, re.MULTILINE):
                # Update existing status
                new_content = re.sub(
                    status_pattern,
                    rf'\g<1>{new_status}\2',
                    content,
                    flags=re.MULTILINE
                )
            else:
                # Add status section if it doesn't exist
                new_content = content.rstrip() + f"\n\n## Status\n{new_status}\n"

            story_file.write_text(new_content)
            print(f"[story_utils] Updated {story_file.name} status: {new_status}")
            return True

        except Exception as e:
            print(f"[story_utils] Error updating story status: {e}")
            return False

    def update_sprint_status(self, story_id: str, new_status: str) -> bool:
        """
        Update sprint-status.yaml with new story status.

        Args:
            story_id: Story identifier (e.g., "1-2-claude-spawner")
            new_status: New status (e.g., "in-progress", "done")

        Returns:
            True if updated successfully
        """
        # Try multiple possible locations
        possible_files = [
            self.project_root / "state/sprint-status.yaml",
            self.project_root / "docs/sprint-status.yaml",
            self.project_root / "sprint-status.yaml",
        ]

        sprint_file = None
        for f in possible_files:
            if f.exists():
                sprint_file = f
                break

        if not sprint_file:
            print(f"[story_utils] sprint-status.yaml not found")
            return False

        try:
            with open(sprint_file, 'r') as f:
                data = yaml.safe_load(f) or {}

            if 'development_status' not in data:
                data['development_status'] = {}

            # Update status
            data['development_status'][story_id] = new_status

            # Update last_updated timestamp
            from datetime import datetime
            data['last_updated'] = datetime.now().isoformat()

            with open(sprint_file, 'w') as f:
                yaml.dump(data, f, default_flow_style=False, sort_keys=False)

            print(f"[story_utils] Updated sprint-status.yaml: {story_id} = {new_status}")
            return True

        except Exception as e:
            print(f"[story_utils] Error updating sprint-status.yaml: {e}")
            return False

    def find_incomplete_stories(self, story_locations: List[str]) -> List[Tuple[str, Path]]:
        """
        Find all incomplete story files.

        Args:
            story_locations: List of location templates (e.g., "state/stories/${story_id}.md")

        Returns:
            List of (story_id, story_file) tuples for incomplete stories
        """
        incomplete = []

        for location_template in story_locations:
            # Replace ${story_id} with * for glob
            pattern = location_template.replace("${story_id}", "*")
            search_path = self.project_root / pattern

            for file_path in search_path.parent.glob(search_path.name):
                if file_path.is_file() and file_path.suffix == '.md':
                    status = self.read_story_status(file_path)

                    if status and not status.is_complete:
                        incomplete.append((status.story_id, file_path))

        return incomplete

    def get_story_epic(self, story_id: str) -> Optional[str]:
        """
        Extract epic ID from story ID.

        Example: "1-2-claude-spawner" -> "epic-1"
        """
        match = re.match(r'^(\d+)-', story_id)
        if match:
            epic_num = match.group(1)
            return f"epic-{epic_num}"
        return None

    def validate_epic_complete(self, epic_id: str, story_locations: List[str]) -> Tuple[bool, List[str]]:
        """
        Check if all stories in an epic are complete.

        Args:
            epic_id: Epic identifier (e.g., "epic-1")
            story_locations: List of story location templates

        Returns:
            Tuple of (all_complete, incomplete_story_ids)
        """
        epic_num = epic_id.replace("epic-", "")
        incomplete_stories = []

        for location_template in story_locations:
            pattern = location_template.replace("${story_id}", f"{epic_num}-*")
            search_path = self.project_root / pattern

            for file_path in search_path.parent.glob(search_path.name):
                if file_path.is_file() and file_path.suffix == '.md':
                    status = self.read_story_status(file_path)

                    if status and not status.is_complete:
                        incomplete_stories.append(status.story_id)

        return (len(incomplete_stories) == 0, incomplete_stories)
