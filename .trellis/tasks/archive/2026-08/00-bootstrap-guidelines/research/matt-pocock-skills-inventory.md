# Matt Pocock 与 Trellis 技能盘点

## 来源

`skills-lock.json` 表明下列非 Trellis 技能来自 `mattpocock/skills`。本盘点基于各技能 `SKILL.md` 的 front matter、`ask-matt` 路由说明和关键产物约定。

## Matt Pocock Skills

| 技能 | 原始用途 | 择途中的使用方式 |
|---|---|---|
| `ask-matt` | 在整套技能中选择合适流程 | 仅作路由参考，不改变 Trellis 阶段 |
| `grill-me` | 无仓库状态的强压力访谈 | 用户明确要求时使用，结论写回活动任务 |
| `grill-with-docs` | 带 glossary/ADR 持久化的访谈 | 采用访谈方法，产物映射到 Trellis PRD 和项目 `docs/` |
| `grilling` | 访谈原语 | 压力测试计划、决策或需求边界 |
| `domain-modeling` | 建立 ubiquitous language 与 ADR | 术语按需进入 `docs/product/glossary.md`，决策进入 `docs/decisions/` |
| `research` | 基于一手资料的后台调研 | 写入当前任务 `research/` |
| `prototype` | 用丢弃式实现回答单一设计问题 | 使用独立任务/分支，结论回写原任务 |
| `to-spec` | 将已有讨论发布为 issue spec | 更新 Trellis PRD，确认后晋升公开 spec |
| `to-tickets` | 将方案拆成带阻塞关系的垂直 tickets | 创建 Trellis 子任务，不写 `.scratch/` |
| `implement` | 基于 spec/ticket 实现、TDD、评审并提交 | 仅在 Trellis 执行阶段使用，服从 Trellis 质量门 |
| `tdd` | red-green 的垂直切片开发 | 适合行为实现或 bug 修复时使用 |
| `code-review` | 相对固定点做 Standards + Spec 双轴评审 | 作为 `trellis-check` 的专门补充 |
| `diagnosing-bugs` | 为困难 bug 建立紧反馈环并修复 | 在 debug 任务内使用，补回归测试和复盘 |
| `codebase-design` | deep module、interface、seam 设计词汇 | 设计模块边界时使用 |
| `improve-codebase-architecture` | 扫描模块深化机会 | 真实代码形成后使用 |
| `triage` | 处理外部 issue/PR 状态机 | 只处理外部原始请求，转换为 Trellis 任务 |
| `wayfinder` | 超大模糊工作的决策地图 | 用 Trellis 父子任务表达地图和阻塞关系 |
| `handoff` | 在真实上下文边界生成引用式交接 | 保存到当前任务或 `docs/work/`，避免复制已有材料 |
| `resolving-merge-conflicts` | 按双方意图解决进行中的冲突 | 仅在 merge/rebase 冲突已存在时使用 |
| `wizard` | 为只能由人类完成的外部步骤生成向导 | 凭证、控制台、迁移等真实人机边界 |
| `to-questionnaire` | 为掌握答案的第三方生成问卷 | 阻塞信息在其他人手中时使用 |
| `teach` | 在工作区中持续教学 | 仅用于项目相关知识 |
| `wait-what` | 重新解释未传达清楚的上一条消息 | 沟通修复工具 |
| `writing-for-agents` | 编写 AGENTS.md、skills 等 agent 文档 | 修改 agent 指令时使用 |
| `setup-matt-pocock-skills` | 配置 issue tracker、triage 和 domain docs | 本项目默认不运行，Trellis 与现有 docs 已承担这些职责 |

## Trellis Skills

| 技能 | 用途 |
|---|---|
| `trellis-start` | 初始化会话上下文并路由任务 |
| `trellis-continue` | 恢复活动任务和正确阶段 |
| `trellis-brainstorm` | 创建任务、维护 PRD、研究并收敛需求 |
| `trellis-before-dev` | 实现前加载当前适用规范 |
| `trellis-check` | spec、lint、类型、测试和一致性质量门 |
| `trellis-break-loop` | bug 修复后的根因与预防复盘 |
| `trellis-update-spec` | 将实现和调试知识固化为 code-spec |
| `trellis-finish-work` | 归档任务并记录会话日志 |
| `trellis-spec-bootstarp` | 从真实仓库证据建立项目规范 |
| `trellis-meta` | 修改 Trellis 配置、工作流和平台集成时使用 |

## Integration Rule

Trellis 决定“当前在哪个任务、哪个阶段、产物存在哪里”；Matt 技能决定“这个阶段采用什么思考或执行方法”。发生冲突时，保留技能的方法，替换它的载体和生命周期假设。
