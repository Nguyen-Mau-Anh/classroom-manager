"""Test execution handler for orchestrate-dev-test.

Runs smoke and critical SQA tests with fix loop support.
"""

import subprocess
from pathlib import Path
from typing import Optional
from dataclasses import dataclass

from .config import DevTestConfig


@dataclass
class TestResult:
    """Result of a test execution."""
    success: bool
    tests_run: int
    tests_passed: int
    tests_failed: int
    output: str
    error: Optional[str] = None


class TestRunner:
    """Run tests with fix loop support."""

    def __init__(self, project_root: Path, config: DevTestConfig):
        self.project_root = Path(project_root)
        self.config = config

    def run_smoke_tests(self, story_id: str) -> TestResult:
        """Run P0 smoke tests."""
        smoke_config = self.config.test_execution.smoke or {}
        command = smoke_config.get("command", "npm run test:smoke")
        timeout = smoke_config.get("timeout", 600)

        # Try to run story-specific tests first
        story_test_path = self.project_root / "tests" / "smoke" / story_id
        if story_test_path.exists():
            command = f"{command} -- {story_test_path}"

        return self._run_tests(command, timeout)

    def run_critical_sqa_tests(self, story_id: str) -> TestResult:
        """Run P1 critical SQA tests."""
        sqa_config = self.config.test_execution.critical_sqa or {}
        command = sqa_config.get("command", "npm run test:sqa:critical")
        timeout = sqa_config.get("timeout", 900)

        # Try to run story-specific tests first
        story_test_path = self.project_root / "tests" / "sqa" / "critical" / story_id
        if story_test_path.exists():
            command = f"{command} -- {story_test_path}"

        return self._run_tests(command, timeout)

    def _run_tests(self, command: str, timeout: int) -> TestResult:
        """Execute test command and parse results."""
        print(f"[test_runner] Running: {command}")

        try:
            result = subprocess.run(
                command,
                shell=True,
                cwd=str(self.project_root),
                capture_output=True,
                text=True,
                timeout=timeout,
            )

            output = result.stdout + result.stderr

            # Parse test counts from output
            tests_run, tests_passed, tests_failed = self._parse_test_output(output)

            success = result.returncode == 0 and tests_failed == 0

            return TestResult(
                success=success,
                tests_run=tests_run,
                tests_passed=tests_passed,
                tests_failed=tests_failed,
                output=output,
                error=None if success else output,
            )

        except subprocess.TimeoutExpired as e:
            return TestResult(
                success=False,
                tests_run=0,
                tests_passed=0,
                tests_failed=0,
                output=e.stdout.decode() if e.stdout else "",
                error=f"Tests timed out after {timeout}s",
            )
        except Exception as e:
            return TestResult(
                success=False,
                tests_run=0,
                tests_passed=0,
                tests_failed=0,
                output="",
                error=str(e),
            )

    def _parse_test_output(self, output: str) -> tuple[int, int, int]:
        """
        Parse test counts from various test framework outputs.

        Returns (tests_run, tests_passed, tests_failed)
        """
        import re

        # Jest pattern: "Tests: X passed, Y failed, Z total"
        jest_match = re.search(
            r'Tests:\s*(?:(\d+)\s*passed)?,?\s*(?:(\d+)\s*failed)?,?\s*(\d+)\s*total',
            output
        )
        if jest_match:
            passed = int(jest_match.group(1) or 0)
            failed = int(jest_match.group(2) or 0)
            total = int(jest_match.group(3) or 0)
            return total, passed, failed

        # Playwright pattern: "X passed, Y failed"
        playwright_match = re.search(
            r'(\d+)\s*passed.*?(\d+)\s*failed',
            output
        )
        if playwright_match:
            passed = int(playwright_match.group(1))
            failed = int(playwright_match.group(2))
            return passed + failed, passed, failed

        # Vitest pattern: "Tests: X passed, Y failed, Z total"
        vitest_match = re.search(
            r'✓\s*(\d+).*✗\s*(\d+)',
            output
        )
        if vitest_match:
            passed = int(vitest_match.group(1))
            failed = int(vitest_match.group(2))
            return passed + failed, passed, failed

        # Generic pattern: count checkmarks and X marks
        passed = len(re.findall(r'[✓✔]', output))
        failed = len(re.findall(r'[✗✘✕]', output))

        if passed or failed:
            return passed + failed, passed, failed

        # Default: assume success if no failures detected
        return 0, 0, 0

    def check_test_framework(self) -> Optional[str]:
        """Detect which test framework the project uses."""
        # Check for config files
        if (self.project_root / "jest.config.js").exists():
            return "jest"
        if (self.project_root / "jest.config.ts").exists():
            return "jest"
        if (self.project_root / "playwright.config.ts").exists():
            return "playwright"
        if (self.project_root / "playwright.config.js").exists():
            return "playwright"
        if (self.project_root / "vitest.config.ts").exists():
            return "vitest"
        if (self.project_root / "cypress.config.ts").exists():
            return "cypress"
        if (self.project_root / "cypress.config.js").exists():
            return "cypress"

        # Check package.json
        package_json = self.project_root / "package.json"
        if package_json.exists():
            try:
                import json
                data = json.loads(package_json.read_text())
                deps = {
                    **data.get("dependencies", {}),
                    **data.get("devDependencies", {}),
                }

                if "jest" in deps:
                    return "jest"
                if "@playwright/test" in deps:
                    return "playwright"
                if "vitest" in deps:
                    return "vitest"
                if "cypress" in deps:
                    return "cypress"

            except Exception:
                pass

        return None
