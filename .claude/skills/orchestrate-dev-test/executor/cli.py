"""CLI interface for orchestrate-dev-test Layer 2."""

import typer
import signal
import sys
from pathlib import Path
from typing import Optional
from rich.console import Console

from .runner import DevTestRunner

# Global runner instance for cleanup
_runner_instance = None

app = typer.Typer(
    name="orchestrate-dev-test",
    help="Layer 2: Development + parallel test design + test execution",
    invoke_without_command=True,
)
console = Console()


def get_project_root() -> Path:
    """
    Get the project root directory.

    Handles the case where we're running from inside .claude/skills/orchestrate-dev-test
    when called via subprocess delegation from Layer 3.
    """
    cwd = Path.cwd()

    # Check if we're inside .claude/skills/ directory
    parts = cwd.parts
    if '.claude' in parts and 'skills' in parts:
        claude_idx = parts.index('.claude')
        project_root = Path(*parts[:claude_idx])
        return project_root

    return cwd


def cleanup_and_exit(signum=None, frame=None):
    """Cleanup handler for signals and exit."""
    global _runner_instance

    if signum is not None:
        console.print(f"\n[yellow]Received signal {signum}, cleaning up...[/yellow]")

    if _runner_instance and hasattr(_runner_instance, 'spawner'):
        try:
            _runner_instance.spawner._cleanup_all_processes()
        except Exception as e:
            console.print(f"[red]Cleanup error: {e}[/red]")

    if signum is not None:
        sys.exit(1 if signum == signal.SIGINT else 0)


@app.callback(invoke_without_command=True)
def run_pipeline(
    ctx: typer.Context,
    story_id: Optional[str] = typer.Argument(
        None,
        help="Story ID to develop and test (runs next story from backlog if not provided)"
    ),
):
    """
    Layer 2: Development + parallel test design + test execution.

    Usage:
        /orchestrate-dev-test                  # Run next story from backlog
        /orchestrate-dev-test 1-2-user-auth    # Run specific story
    """
    # Skip if a subcommand was invoked
    if ctx.invoked_subcommand is not None:
        return

    global _runner_instance

    # Register signal handlers for cleanup
    signal.signal(signal.SIGINT, cleanup_and_exit)
    signal.signal(signal.SIGTERM, cleanup_and_exit)

    project_root = get_project_root()
    runner = DevTestRunner(project_root)
    _runner_instance = runner

    console.print(f"\n[bold]Orchestrate Dev Test - Layer 2[/bold]")
    console.print(f"Project: {project_root.name}")
    if story_id:
        console.print(f"Story: {story_id}")
    else:
        console.print("Story: (next from backlog)")
    console.print("=" * 50)

    try:
        result = runner.run(story_id=story_id)

        # Explicit cleanup before exit
        cleanup_and_exit()

        if result.success:
            console.print(f"\n[bold green]L2 Pipeline completed successfully![/bold green]")
            console.print(f"Ready for L3: {result.ready_for_l3}")
            raise typer.Exit(0)
        else:
            console.print(f"\n[bold red]L2 Pipeline failed: {result.error}[/bold red]")
            raise typer.Exit(1)

    except KeyboardInterrupt:
        console.print(f"\n[yellow]Interrupted by user, cleaning up...[/yellow]")
        cleanup_and_exit()
        raise typer.Exit(1)

    except Exception as e:
        console.print(f"\n[bold red]Unexpected error: {e}[/bold red]")
        cleanup_and_exit()
        raise


def main():
    """Entry point."""
    app()


if __name__ == "__main__":
    main()
