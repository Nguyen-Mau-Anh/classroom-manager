"""Claude CLI spawner for isolated agent execution."""

import subprocess
import time
from pathlib import Path
from dataclasses import dataclass
from typing import Optional

from .config import DevConfig, StageConfig


@dataclass
class TaskResult:
    """Result from a Claude CLI invocation."""
    success: bool
    output: str
    error: Optional[str] = None
    exit_code: int = 0
    duration_seconds: float = 0.0


class ClaudeSpawner:
    """
    Spawn Claude CLI processes for isolated task execution.

    Each spawn creates a new Claude process via `claude --print`,
    ensuring full context isolation from the parent.

    Prompts are loaded from config file (docs/orchestrate-dev.config.yaml)
    making them easy to customize per project.
    """

    def __init__(
        self,
        project_root: Path,
        timeout_seconds: int = 600,
        config: Optional[DevConfig] = None,
    ):
        self.project_root = Path(project_root)
        self.timeout_seconds = timeout_seconds
        self.config = config

    def set_config(self, config: DevConfig) -> None:
        """Set the config after initialization."""
        self.config = config

    def build_prompt_from_config(
        self,
        stage_name: str,
        **kwargs
    ) -> Optional[str]:
        """
        Build prompt from config stage definition.

        Args:
            stage_name: Name of the stage (e.g., 'create-story', 'validate')
            **kwargs: Variables to substitute in the prompt template
                      (story_id, story_file, errors, files_changed)

        Returns:
            Formatted prompt string or None if stage not found
        """
        if not self.config:
            raise ValueError("Config not set. Call set_config() first.")

        stage = self.config.stages.get(stage_name)
        if not stage or not stage.prompt:
            return None

        # Inject autonomy instructions
        kwargs["autonomy"] = self.config.autonomy_instructions

        # Format the prompt template
        try:
            return stage.prompt.format(**kwargs).strip()
        except KeyError as e:
            # If a variable is missing, leave it as placeholder
            prompt = stage.prompt
            kwargs_with_defaults = {
                "autonomy": self.config.autonomy_instructions,
                "story_id": kwargs.get("story_id", "{story_id}"),
                "story_file": kwargs.get("story_file", "{story_file}"),
                "errors": kwargs.get("errors", "{errors}"),
                "files_changed": kwargs.get("files_changed", "{files_changed}"),
            }
            return prompt.format(**kwargs_with_defaults).strip()

    def spawn_with_prompt(
        self,
        prompt: str,
        timeout: Optional[int] = None,
    ) -> TaskResult:
        """
        Spawn Claude CLI with a pre-built prompt.

        Args:
            prompt: The complete prompt to send
            timeout: Override timeout in seconds

        Returns:
            TaskResult with output and success status
        """
        actual_timeout = timeout or self.timeout_seconds

        # Build command as list (safe - no shell injection)
        # Use --permission-mode bypassPermissions for automated execution
        cmd = ["claude", "--print", "--permission-mode", "bypassPermissions", "-p", prompt]

        start_time = time.time()

        try:
            result = subprocess.run(
                cmd,
                cwd=str(self.project_root),
                capture_output=True,
                text=True,
                timeout=actual_timeout,
            )

            duration = time.time() - start_time

            return TaskResult(
                success=result.returncode == 0,
                output=result.stdout,
                error=result.stderr if result.stderr else None,
                exit_code=result.returncode,
                duration_seconds=duration,
            )

        except subprocess.TimeoutExpired:
            duration = time.time() - start_time
            return TaskResult(
                success=False,
                output="",
                error=f"Task timed out after {actual_timeout} seconds",
                exit_code=-1,
                duration_seconds=duration,
            )

        except Exception as e:
            duration = time.time() - start_time
            return TaskResult(
                success=False,
                output="",
                error=str(e),
                exit_code=-1,
                duration_seconds=duration,
            )

    def spawn_stage(
        self,
        stage_name: str,
        timeout: Optional[int] = None,
        **kwargs
    ) -> TaskResult:
        """
        Spawn Claude CLI for a specific stage using config prompts.

        Args:
            stage_name: Name of the stage (e.g., 'create-story', 'develop')
            timeout: Override timeout in seconds
            **kwargs: Variables for prompt template

        Returns:
            TaskResult with output and success status
        """
        prompt = self.build_prompt_from_config(stage_name, **kwargs)

        if not prompt:
            return TaskResult(
                success=False,
                output="",
                error=f"No prompt found for stage: {stage_name}",
                exit_code=-1,
                duration_seconds=0.0,
            )

        # Get timeout from stage config if not overridden
        if timeout is None and self.config:
            stage = self.config.stages.get(stage_name)
            if stage:
                timeout = stage.timeout

        return self.spawn_with_prompt(prompt, timeout)
