# Prototype 文案全面改写 · 温柔有人情味

## Goal

把当前 prototype 中所有静态展示文本（标题、副标题、描述、按钮文字、状态文案、说明文字、Agent 回复等）重新写过，使整体语气从"AI 生成的信息架构输出"转变为"真诚、温柔、靠近求职者的人的说话方式"，没有 AI 腔，没有过于工整的对称排比，让用户感觉这是一个懂他的人在和他说话。

## 当前问题

- 大量文案结构上过于工整，四字短语叠加、段首全是主观祈使句
- 标题过于"信息架构化"，像在描述功能而非和用户说话
- 按钮文字太正式，缺少人味
- 状态说明文字套路感强��如"只有你确认过的事实才会参与后续判断"——正确但无温度
- Agent 回复听起来像说明书而非真实对话

## 改写范围（已确认需要改的文件��

- `LoginScreen.tsx` — 登录页全部文案
- `OnboardingView.tsx` — 欢迎页、访谈页、导入页、分析页、事实确认页、方向页
- `TodayView.tsx` — 今天页（主任务文字、空状态）
- `ProfileView.tsx` — 职业事实页
- `FactCard.tsx` — 事实卡片
- `OpportunityIntakeView.tsx` — 机会接入页
- `OpportunityView.tsx` — 机会研究台（研究中/研究完成/生命周期各阶段）
- `OpportunitiesView.tsx` — 机会集合页 + 比较视图
- `ApplicationPackageView.tsx` — 申请决策包页
- `InterviewView.tsx` — 面试页
- `AgentDrawer.tsx` — Agent 对话面板
- `demo-content.ts` — agentReplies 等

## 风格参考：当代文学编辑视角（A型为主）

参考：用户的"当代中文小说创作者·提示词系统 v2.0"，核心提取如下：

**句式**：短句为主，节奏有呼吸感，长短句交织。避免连续四字短语堆叠。
**情绪处理**：克制。不命名情绪，不解释"系统会为你……"，让句子本身承载感受。
**留白**：不说完，不过度解释，信任用户能理解。
**具体**：用具体词而非抽象词。"你还有 3 条事实等待确认"比"职业上下文尚未完整"好。
**克制**：删掉所有"只有……才能……"式的告诫语气。

**A型（冷静叙事）为主基调**，适合 UI copy：短句、停顿、克制直接。
在关键时刻（onboarding 入口、今天的主任务、申请决定）可以有 B 型片段：一句有呼吸感的长句，不解释，留白。

**不是**把 UI 写成小说。按钮文字仍要可操作、可理解。但**标题、描述、状态说明、Agent 回复**可以更文学性。

## 确定的改写方向

- **不说教**：删掉"只有/才会/应该"的系统语气
- **不解释自己**：减少"AI 会……""系统会……"的主体句式
- **有呼吸感**：标题和副标题的句子长短要交织，不全是四字对称
- **具体不抽象**：用"3 条事实"不用"职业上下文"，用"这份机会"不用"当前对象"
- **承认现实**：求职本来就难，等待本来就累，文案可以知道这一点
- **留白**：关键位置少说一句，比多说一句更有力
- 允许改结构和展现形式，不限于原来的标题+副标题+描述三段式

## 已决定

- **风格锚点**：A 型为主（冷静叙事）——短句、克制、具体
- **边界**：标题/描述/说明文字走文学感；按钮和状态标签保持功能清晰
- **Agent 回复**：也改写，对话体、口语、有停顿感，像真人在说话而非输出报告
- **参考系统**：用户"当代中文小说创作者·提示词系统 v2.0"

## 已决定（完整）

- **风格锚点**：A 型为主（冷静叙事）——短句、克制、具体
- **边界**：标题/描述/说明文字走文学感；按钮和状态标签保持功能清晰
- **Agent 回复**：也改写，对话体、口语、有停顿感
- **工作方式**：全量改，一次改完所有有文案的文件，用户走查确认
- **范围**：15 个文件（见下）

## 改写文件清单（15 个）

1. `prototype/src/App.tsx` — context 标签、toast、页脚
2. `prototype/src/features/auth/LoginScreen.tsx` — 登录页
3. `prototype/src/features/onboarding/OnboardingView.tsx` — Onboarding 全流程
4. `prototype/src/features/today/TodayView.tsx` — 今天页
5. `prototype/src/features/profile/ProfileView.tsx` — 职业事实页
6. `prototype/src/features/profile/FactCard.tsx` — 事实卡片
7. `prototype/src/features/opportunity/OpportunityIntakeView.tsx` — 机会接入
8. `prototype/src/features/opportunity/OpportunityView.tsx` — 机会研究台
9. `prototype/src/features/opportunity/OpportunitiesView.tsx` — 机会集合+比较
10. `prototype/src/features/application/ApplicationPackageView.tsx` — 申请决策包
11. `prototype/src/features/interview/InterviewView.tsx` — 面试页
12. `prototype/src/features/agent/AgentDrawer.tsx` — Agent 面板
13. `prototype/src/app/state.ts` — lifecycleNote 字符串 + agentReplyFor
14. `prototype/src/data/demo-content.ts` — agentReplies + conversationStarter
15. `prototype/src/components/ui.tsx` — ReturnToday、ObjectTrail 节点标签

## Open Questions

无。所有决策已收敛。

## Acceptance Criteria

- [ ] 所有页面文案改写完成，通过 pnpm check + pnpm build
- [ ] 不破坏原有交互逻辑，只改文字和展示顺序
- [ ] 人工走查：登录、onboarding、today、机会研究台、申请包、面试五个主流程文案无"AI 腔"

## Out of Scope

- 交互逻辑、状态机、样式、布局不在本轮改写范围（除非���案改写导致结构调整）
- 不改 demo 数据内容（demoFacts、demoEvidence 等的字段内容）
- 不改组件结构，只改文字

## Technical Notes

- 全部 `.tsx` 组件文件 + `demo-content.ts` 的 `agentReplies`
- 使用 Phosphor Icons，图标本身不改
- 目前无测试，改写后通过 `pnpm check` 和 `pnpm build` 即可
