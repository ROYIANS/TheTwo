# 择途文档中心

`docs/` 是择途面向项目成员和开源社区的权威知识库。这里记录当前产品上下文、已经确认的规范、重要决策、阶段性工作和原始证据。

## 文档地图

| 目录 | 回答的问题 | 权威性 |
|---|---|---|
| [`product/`](product/product-brief.md) | 我们为什么做、为谁做、当前产品方向和能力边界是什么？ | 当前产品上下文 |
| [`specs/`](specs/README.md) | 产品或系统现在必须满足什么？ | 当前有效契约 |
| [`decisions/`](decisions/README.md) | 为什么选择这种方案？ | 不可覆写的决策历史 |
| [`work/`](work/README.md) | 我们讨论过什么、正在研究什么？ | 阶段性工作记录 |
| [`evidence/`](evidence/README.md) | 结论基于哪些原始材料？ | 证据，不直接构成需求 |
| [`templates/`](templates/) | 新文档应使用什么结构？ | 写作模板 |

顶层先按文档的生命周期和权威性分类，各目录内部再按产品、体验、AI、工程、运维等领域细分。领域目录只在出现第一份正文时创建。

## 单一事实来源

* `docs/` 保存产品、架构、工程和运维知识的权威正文。
* `.trellis/tasks/` 保存 AI 工作流中的任务状态、研究过程和执行上下文。
* `.trellis/spec/` 保存 AI 必须直接遵守的精炼约束和对 `docs/` 正文的引用。
* Trellis 任务形成长期结论后，应将结论晋升到 `docs/`，而不是在两处长期维护相同正文。
* 发生冲突时，项目知识以 `docs/` 为准；仅服务于 Trellis 自身运行的规则以 `.trellis/` 为准。

当前产品入口：

* [`product/product-brief.md`](product/product-brief.md) 描述产品定位、目标用户、核心承诺和 MVP 概览；
* [`product/product-capability-map.md`](product/product-capability-map.md) 描述完整能力层级、阶段、规划依据、下一步动作和依赖关系。
* [`product/mvp-experience-backbone.md`](product/mvp-experience-backbone.md) 描述第一版从首次进入到申请决定的端到端用户体验与关键状态。

## 文档生命周期

```text
evidence / discussion
  -> proposal
  -> decision
  -> spec
  -> implementation task
  -> result / retrospective
```

不是每次讨论都必须生成决策，也不是每个决策都必须生成独立 spec。只有需要约束后续设计或实现的结论才晋升。

## 文档状态

不同类型使用不同状态，避免用一个含糊的状态集合描述所有文档。

| 类型 | 状态 | 含义 |
|---|---|---|
| product | `draft` | 正在形成，不能视为稳定共识 |
| product | `active` | 当前采用的产品上下文 |
| product | `superseded` | 已被新文档替代 |
| product | `archived` | 仅作历史保留 |
| spec | `draft` | 正在编写 |
| spec | `proposed` | 等待确认 |
| spec | `accepted` | 当前有效并驱动实现 |
| spec | `superseded` | 已由其他 spec 替代 |
| spec | `archived` | 不再适用，仅作历史保留 |
| decision | `proposed` | 等待决策 |
| decision | `accepted` | 已接受 |
| decision | `rejected` | 已明确不采用 |
| decision | `superseded` | 已由后续决策替代 |
| work | `open` | 仍在讨论或推进 |
| work | `closed` | 已结束，结论已记录或晋升 |
| work | `archived` | 仅作历史保留 |

被替代的决策记录不删除，必须通过 `related` 或正文链接指向替代它的新文档。当前规范则直接更新到最新有效状态，并在必要时关联产生变更的决策记录。

## Front Matter

需要生命周期治理的 `product/`、`specs/`、`decisions/` 和 `work/` Markdown 使用 YAML front matter：

```yaml
---
title: 文档标题
type: product | spec | decision | discussion | proposal | report
status: draft
created: YYYY-MM-DD
updated: YYYY-MM-DD
related: []
---
```

`related` 使用仓库内相对路径，记录直接相关的来源、决策、规范或后续材料。

## 命名规则

* 目录和文件名使用 ASCII 英文 `kebab-case`。
* 正文默认使用中文；代码标识符、协议名和不可翻译术语保留英文。
* 长期有效文档使用稳定语义名称，例如 `product-brief.md`、`system-requirements.md`。
* 讨论纪要和阶段报告使用 `YYYY-MM-DD-topic.md`。
* 决策记录使用四位顺序编号，例如 `0001-docs-information-architecture.md`。
* 不在长期规范文件名中加入日期或版本号；历史由 Git 和决策记录追溯。

## AI 讨论规则

AI 讨论默认整理为结构化纪要，至少包含：

* 背景与目标；
* 已知事实；
* 候选方案与主要权衡；
* 已确认结论；
* 未决事项；
* 晋升出的决策或 spec。

只有完整原文具有长期证据价值、适合公开且已移除敏感信息时，才保存到 `evidence/ai-transcripts/`。原始对话永远不能直接成为需求或 spec。

## 公开与私密边界

提交到 `docs/` 的所有内容默认适合公开。少量不宜公开的开发期项目材料放在仓库根目录的 `private/`，该目录被 Git 忽略。

`private/` 不是产品数据目录。未来用户简历、求职记录和模型输入的存储、加密、删除与导出机制必须在产品系统内部单独设计。

## 创建文档

| 要记录的内容 | 使用模板 | 推荐位置 |
|---|---|---|
| AI 讨论、评审或需求探索 | [`discussion.md`](templates/discussion.md) | `work/discussions/` |
| 已确认的重要选择 | [`decision.md`](templates/decision.md) | `decisions/` |
| 驱动设计或实现的当前契约 | [`spec.md`](templates/spec.md) | `specs/<domain>/` |

不要为了目录树完整而创建空目录。新领域出现第一份有效文档时，再创建相应目录并更新本索引。
