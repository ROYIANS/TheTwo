---
title: AI 参考系统研究阶段报告
type: report
status: closed
created: 2026-08-13
updated: 2026-08-13
related:
  - ../../../.trellis/tasks/08-13-research-ai-reference-systems/prd.md
  - ../../../.trellis/tasks/08-13-research-ai-reference-systems/research/recruiting-platform-analysis.md
  - ../../../.trellis/tasks/08-13-research-ai-reference-systems/research/social-simulation-platform-analysis.md
  - ../../../.trellis/tasks/08-13-research-ai-reference-systems/research/java-ai-foundation-analysis.md
  - ../../../.trellis/tasks/08-13-research-ai-reference-systems/research/java-ai-rag-structured-output-evidence.md
---

# AI 参考系统研究阶段报告

## 背景与目标

本阶段对三个本地参考方向进行了静态源码研究：一个招聘平台工具、一个社会模拟系统，以及一组 Java AI 底包构件。目标是理解产品交互、后台任务、AI 调用边界、Agent 编排和生产工程取舍，并提炼能服务择途产品路线及 AI 全栈作品集的经验。

研究只使用脱敏后的中性名称。详细源码证据、文件清单和限制见 `related` 中的任务报告。

## 已知事实与约束

* 择途当前主线仍是用户拥有的职业事实、外部证据、可追溯建议和用户最终决定权。
* 首版边界不包含自动沟通、自动投递或代表用户对外行动。
* 本阶段只做离线静态审计，没有安装依赖、运行服务、调用模型或连接真实外部平台。
* 研究结论不能把第三方框架、远程服务适配器或 Demo 能力包装成自研能力。

## 研究结论

### 招聘平台工具方向

其产品中心是把第三方招聘平台动作封装成 CLI、JSON、MCP 和脚本可调用的本地工具层，重点在登录态复用、职位读取、候选池、沟通记录、招聘者命令和有限自动化。它证明了平台通道、能力矩阵、统一错误信封、`run_id`、checkpoint、停止和 dry-run 等工程契约的价值，但私有接口、浏览器脚本、CDP 和真实外部写操作不应进入择途 MVP。

### 社会模拟方向

其前端、Flask API、图谱构建、模拟进程和报告 Agent 组成了完整 Demo 工作流。最值得吸收的是外部写入的确定性 operation identity、失败后的 reconcile、读取屏障和终态屏障。项目的 JSON 状态、进程内任务管理和轮询体验适合单实例原型，不能等同于跨进程可接管的 durable execution；多 Agent 数量和模拟叙事也不是择途近期价值。

### Java AI 底包方向

最有学习价值的是 Agent 控制面：稳定的执行 ID 与定义快照、ReAct 节点、工具预检、权限和人工审批、取消传播、内外事件投影、SSE/replay 接口以及大工具结果资源化。图执行和模型协议主要由公开第三方框架承担，不能从类数量推断完整自研引擎。

所给构件没有足够证据证明本地 RAG 闭环：能注册 `EmbeddingModel`，旧知识库插件能改写查询并委托远程能力端口，但未发现本地向量库、切分、入库、召回和引用上下文闭环。底层虽有 JSON Schema response-format 构造器，新 Agent 主链却没有 schema 输入、typed decode、业务校验或 repair loop，主要模型适配器还明确报告结构化输出不可用。

## 对择途的迁移分级

### 近期吸收

* provider-neutral 的模型适配接口，模型只产生调用意图，业务运行时掌握副作用执行权；
* tenant-scoped durable job、step、attempt、event、checkpoint 和 artifact；
* 工具审批、幂等 key、取消传播、失败和可恢复状态；
* SSE 事件序号与 `Last-Event-ID` 重放；
* evidence-first 的检索和引用保存；
* token/金额预算、脱敏、限流、熔断和故障注入测试。

### 验证主链后再考虑

* 职业事实与机会证据的图关系投影；
* 用于反例和审稿的少量多视角 Agent；
* 真正 durable queue 建立后的 SSE/WebSocket 实时体验；
* 带参数、反例和敏感性说明的职业路径情景推演；
* 可替换的本地/云模型与检索 provider。

### 不应照搬

* 平台私有接口、浏览器自动化和自动投递/沟通；
* 共享 key、无鉴权单信任域、跨租户缓存和完整 prompt/响应日志；
* 把事件 replay、磁盘状态或等待态重新入队称作执行恢复；
* 同时引入两套工具/插件协议；
* 用多 Agent 数量、Demo 跑通或第三方集成数量代替可恢复性、证据忠实度和评测证据。

## 面向 AI 全栈作品集的学习顺序

1. provider-neutral Java LLM gateway 与版本化结构化输出；
2. PostgreSQL durable job、lease、checkpoint 和重启接管；
3. 工具审批、幂等、取消和 SSE replay；
4. tenant-safe evidence model、引用校验和最小披露；
5. token/金额账本、限流、熔断和离线评测；
6. evidence RAG，再评估是否需要图数据库或通用 Agent runtime。

可信的作品集证据应来自可运行测试和故障注入，例如 provider 超时/限流、worker 重启、重复写、取消、schema 漂移、跨租户访问和引用缺失，而不是只展示框架清单。

## 已确认结论

本阶段没有改变择途已接受的产品路线、MVP 边界或用户权威原则。三个参考方向带来的主要增量是工程契约和学习路线，应在后续独立实现任务中验证，而不是直接晋升为当前产品能力。

## 未决事项与后续动作

* 新建独立任务，设计并实现“可恢复 AI 研究作业最小纵切”：单个机会研究、结构化 LLM adapter、证据保存、状态事件、取消/重试、预算和故障注入。
* 另行比较 Temporal、数据库 worker 和轻量队列的 durable execution 方案；本报告不作最终技术选型。
* 在出现真实代码后，按实际 package/layer 建立 `.trellis/spec/` 规范；本阶段不预设代码风格。

## 证据与限制

详细报告：

* [招聘平台工具审计](../../../.trellis/tasks/08-13-research-ai-reference-systems/research/recruiting-platform-analysis.md)
* [社会模拟系统审计](../../../.trellis/tasks/08-13-research-ai-reference-systems/research/social-simulation-platform-analysis.md)
* [Java AI 底包架构审计](../../../.trellis/tasks/08-13-research-ai-reference-systems/research/java-ai-foundation-analysis.md)
* [RAG 与结构化输出专项核验](../../../.trellis/tasks/08-13-research-ai-reference-systems/research/java-ai-rag-structured-output-evidence.md)

所有结论限定在提供的源码快照和已接受的择途文档范围内。未执行运行时验证，未评价未提供的远端知识库、模型服务或第三方框架内部实现。
