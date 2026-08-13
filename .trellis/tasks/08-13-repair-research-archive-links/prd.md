# 修复研究归档后的文档链接

## Goal

修复研究任务归档后因相对路径变化造成的文档引用失效，确保 `docs/` 阶段报告与归档任务之间仍可互相追溯。

## Scope

* 更新 `docs/work/milestones/2026-08-13-ai-reference-system-research.md` 中指向研究任务的链接，使其指向 `.trellis/tasks/archive/2026-08/...`。
* 更新归档任务 `prd.md` 中指向阶段报告的晋升链接，使其从归档后的目录正确回到 `docs/work/milestones/`。
* 扫描本次任务相关 Markdown 链接，确认目标文件存在；不修改研究正文、产品文档或历史任务链接。

## Acceptance Criteria

* [x] 阶段报告 YAML `related` 中的四个研究链接和任务 PRD 链接全部指向现存归档文件。
* [x] 归档任务 PRD 中的 `Documentation Promotion` 链接指向现存 `docs/work` 阶段报告。
* [x] 不再存在本次任务的旧未归档路径引用。
* [x] Git diff 只包含链接维护和本任务状态文件；完成后任务提交、归档并记录 session journal。

## Constraints

* 保持项目脱敏约定，不引入原项目名称、源码绝对路径或内部标识。
* 不改变本次研究结论和已接受产品路线。
