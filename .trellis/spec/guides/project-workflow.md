# Project Workflow

权威正文：[`docs/specs/development-process.md`](../../../docs/specs/development-process.md)。

## Entry Checklist

* [ ] 已运行 `trellis-start` 或 `trellis-continue`；
* [ ] 会改变仓库、产品方向或长期知识的工作已绑定活动任务；
* [ ] 已读取任务 `prd.md` 和相关研究；
* [ ] 当前请求与活动任务范围一致；不一致时先保存并切换任务。
* [ ] 已核对当前请求、活动任务、PRD、accepted docs 与 Git 状态；发现漂移时先修正文档或任务状态。
* [ ] 仓库存在 `.codegraph/` 且需要定位或理解代码时，已先使用 `codegraph explore` / `codegraph node`；无索引结果或目标是文档、配置时再回退。

## Phase Checklist

* 规划：不清晰或多方案时使用 `trellis-brainstorm`，用户回答后立即更新 PRD。
* 执行：写代码前使用 `trellis-before-dev`；以 PRD 和 accepted spec 为边界。
* 检查：使用 `trellis-check`，修复后重新运行适用检查。
* 学习：用 `trellis-update-spec` 或 `trellis-break-loop` 固化可复用知识。
* 完成：先提交任务工作，再用 `trellis-finish-work` 归档并记录日志。

## Write-Through Checklist

以下事件发生后，在下一项实质动作或对外回复前完成落盘：

* 用户确认决定、改变范围或接受假设：更新当前任务 `prd.md`；
* 调研形成可使用的结论：更新当前任务 `research/`；
* 当前产品事实或系统契约被接受：更新 `docs/product/` 或 `docs/specs/`；
* 形成重要且有后果的选择：更新 `docs/decisions/`；
* 发现风险、未决问题或下一动作：写入当前任务，不等待收尾日志；
* 切换任务、handoff、长时间操作或结束会话：核对并保存决定、未决问题、风险和下一动作。

若当前无法写入，应停止依赖该结论继续工作并明确报告。不要创建平行聊天转储或独立 checkpoint 体系；更新已有权威载体。

## Work Focus

保持项目会话工作聚焦。与项目无关的闲聊简短重定向；产品讨论、澄清、质疑、状态和复盘属于项目工作。

完成标准：关键决定、研究、风险和未决事项已在下一项实质动作前落盘；恢复时对账结果一致，而不是依赖聊天上下文。
