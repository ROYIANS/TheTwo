## Project Agent Policy

- Keep repository conversations focused on project work. Briefly redirect unrelated casual chat; product discussion, clarification, critique, status, and retrospective are project work.
- Before project planning, research, or edits, enter the Trellis workflow with `trellis-start` or `trellis-continue` and bind the work to an active task.
- Read `.trellis/spec/guides/index.md` before acting; it points to the current workflow, documentation, and skill-routing rules.
- Trellis owns task state, PRDs, execution, checks, commits, archives, journals, and spec updates. Skills under `.agents/skills/` are methods used inside the active Trellis phase, not a competing workflow.
- Use write-through persistence: after every confirmed decision, scope change, accepted assumption, research conclusion, identified risk, or next action, update the active task or authoritative `docs/` before continuing. On start/resume and before task switch, handoff, or finish, reconcile chat intent, task files, accepted docs, and Git state.
- When `.codegraph/` exists, use `codegraph explore` or `codegraph node` before `rg`, filesystem search, or broad file reads to locate or understand code. Fall back when CodeGraph is unavailable, has no indexed match, or the target is documentation/configuration rather than indexed source.

<!-- TRELLIS:START -->
# Trellis Instructions

These instructions are for AI assistants working in this project.

This project is managed by Trellis. The working knowledge you need lives under `.trellis/`:

- `.trellis/workflow.md` — development phases, when to create tasks, skill routing
- `.trellis/spec/` — package- and layer-scoped coding guidelines (read before writing code in a given layer)
- `.trellis/workspace/` — per-developer journals and session traces
- `.trellis/tasks/` — active and archived tasks (PRDs, research, jsonl context)

If a Trellis command is available on your platform (e.g. `/trellis:finish-work`, `/trellis:continue`), prefer it over manual steps. Not every platform exposes every command.

If you're using Codex or another agent-capable tool, additional project-scoped helpers may live in:
- `.agents/skills/` — reusable Trellis skills
- `.codex/agents/` — optional custom subagents

Managed by Trellis. Edits outside this block are preserved; edits inside may be overwritten by a future `trellis update`.

<!-- TRELLIS:END -->
