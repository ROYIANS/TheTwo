# Documentation Workflow

权威正文：[`docs/README.md`](../../../docs/README.md)。

## Capture Checklist

* 任务范围和验收写入当前 `prd.md`；
* 调研写入当前任务 `research/`；
* 当前产品上下文写入 `docs/product/`；
* 当前契约写入 `docs/specs/`；
* 重要选择写入 `docs/decisions/`；
* 讨论过程写入 `docs/work/`；
* 原始输入写入 `docs/evidence/`；
* AI 执行约束写入 `.trellis/spec/`，并引用公开正文。

## Rules

* `docs/` 默认全部适合公开；私密开发材料放入 Git 忽略的 `private/`。
* AI 对话默认整理为结构化纪要，不直接倾倒原文。
* 不在 `.trellis/spec/` 复制公开规范全文。
* 没有正文时不创建空目录。
* 路径使用英文 `kebab-case`，正文默认中文。
* 持久化采用 write-through：关键事件发生后立即更新既有权威载体，不等待 `trellis-finish-work` 或会话日志。
* checkpoint 不创建新体系；任务态写入 `prd.md`，研究写入 `research/`，accepted 事实与决定晋升到 `docs/`。

完成标准：每份新材料有唯一权威位置，相关文档通过相对链接可追溯。
