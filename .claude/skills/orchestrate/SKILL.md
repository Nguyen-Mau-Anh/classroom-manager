---
name: orchestrate
description: Start autonomous AI development orchestration. Runs stories through dev, test, and review pipeline automatically. Use when user says "orchestrate", "start orchestration", "run development", or "process stories".
allowed-tools: Bash, Read, Write, Glob
---

# Orchestrate - AI Development Automation

Autonomous orchestration that processes stories through the full development pipeline.

## Commands

| User Says | Action |
|-----------|--------|
| `/orchestrate` | Start full orchestration |
| `/orchestrate --dry-run` | Preview what would run |
| `/orchestrate status` | Show sprint status |
| `/orchestrate review` | List stories for review |
| `/orchestrate approve <id>` | Approve a completed story |

## Execution

When invoked, run the orchestrator CLI:

```bash
python3 -m orchestrator start
```

### With Arguments

- `--dry-run` → `python3 -m orchestrator start --dry-run`
- `status` → `python3 -m orchestrator status`
- `review` → `python3 -m orchestrator review`
- `approve <id>` → `python3 -m orchestrator approve <id>`

## Prerequisites

Before running, verify:

1. **sprint-status.yaml exists** - If not, tell user to run:
   ```
   /bmad:bmm:workflows:sprint-planning
   ```

2. **Stories are ready** - Check for `ready-for-dev` or `drafted` status

## What It Does

The orchestrator:
1. Reads `sprint-status.yaml` for actionable stories
2. For each story, spawns Claude agents:
   - **Phase 1**: Dev agent implements the story
   - **Phase 2**: TEA agent runs tests
   - **Phase 3**: Code review
3. Updates story status after each phase
4. Marks completed stories for user review

## Error Handling

If orchestrator fails:
- No sprint-status.yaml → Suggest running sprint-planning workflow
- No actionable stories → Show current status
- Claude spawn fails → Show error and continue to next story

## Output

After running, summarize:
- Stories processed
- Success/failure for each phase
- Stories ready for review
- Any errors encountered
