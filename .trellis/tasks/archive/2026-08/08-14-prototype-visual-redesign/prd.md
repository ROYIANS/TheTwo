# 重塑 prototype 视觉语言与 Agent 交互

## Goal

将择途 prototype 从通用 AI 助手界面重塑为面向中国求职者的“职业档案工作台”：用户管理事实、证据、决定和行动，AI 退居为当前档案的注脚与辅助工具。视觉应冷静、可信、有编辑感，同时保留刚完成的温暖人性化文案。

## What I Already Know

* 目标用户是在高压力决策场景中整理职业事实、研究机会、制作申请材料并记录行动的中国求职者。
* 当前主链已经覆盖材料导入、事实确认、方向设定、职位研究、定制申请包、决定、导出和投递记录。
* 当前同质化由三项共同造成：暖灰绿画布接近 Claude 的暖白背景；橙红承担全局主色；右侧聊天抽屉、气泡、composer 和浮动“问 AI”入口复现助手范式。
* 最近截图显示页面已具备纸张、铅字和档案感，但 coral 仍贯穿标题、CTA、焦点、当前状态和 Agent；右下角浮动入口在桌面与手机均持续抢占注意力。
* 前端是 React + TypeScript + Vite 的纯内存 prototype，不接入后端、模型、数据库或第三方服务。
* 全局图标统一使用 `@phosphor-icons/react`，交互和状态连续性不得因视觉重构退化。

## Confirmed Direction

* 采用“苔痕纸墨 / 档案工作台”方向：冷苔中性色为基底，深绿承担主要行动，珊瑚红只表达风险、待确认和退出等语义。
* 把 Agent 的结构性去同质化纳入本轮，而不是只做 CSS 换肤：取消全局浮动按钮，让入口出现在需要解释或研究的上下文中；对话使用底部工作台而非右侧聊天抽屉。
* 保留现有中文宋体标题与无衬线正文的组合，但重新建立字号、留白和密度节奏，不引入网络字体依赖。

## Open Questions

* 无。

## Requirements

* 建立明确且可复用的颜色角色：主行动、风险、警告、信息、成功和中性色各自独立，不再由 coral 贯穿全局。
* 页面应呈现“档案馆 / 编辑工作台”而非“AI 助手 / 聊天产品”的视觉与交互哲学。
* 减少重复卡片、同质边框和相同间距，强化主档案、侧注、证据、决定等不同信息类型的层级。
* Agent 入口覆盖事实、研究、申请包和面试四类工作现场，分别使用与当前动作一致的措辞；登录、今日概览、机会列表和比较页不显示入口。
* 保持所有 MVP 流程、输入、审核失效、导出和投递记录行为不变。
* 桌面、平板和手机均需有针对性的布局，不出现横向溢出、遮挡或不可达操作。
* 所有动画只服务于状态变化和层级进入，并尊重 `prefers-reduced-motion`。
* 页面、工作台、文本域和局部滚动区使用同一套方正、低干扰的全局滚动条样式，并保留清晰的悬停反馈。

## Acceptance Criteria

* [x] 首屏、今日、职业事实、机会研究、申请包和登录页共享同一套清晰的视觉语言。
* [x] 主要 CTA 使用深绿；coral 仅用于风险、待确认、危险或退出语义。
* [x] 全局不再出现持续悬浮的“问 AI”按钮。
* [x] 事实、研究、申请包和面试页提供就地 Agent 入口，入口措辞和已读取上下文与当前任务相符。
* [x] 登录、今日概览、机会列表和比较页不显示 Agent 入口。
* [x] Agent 对话不再采用 Claude 式右侧聊天抽屉结构。
* [x] 桌面 `1440x1000`、平板 `900x900`、手机 `390x844` 无横向溢出和内容遮挡。
* [x] 键盘焦点清晰，移动端有可见关闭操作，`Escape` 可关闭 Agent 层。
* [x] `corepack pnpm check`、`corepack pnpm build` 和 `git diff --check` 通过。
* [x] 浏览器控制台无 warning/error，核心 MVP 主链仍可完成。
* [x] Chromium 与 Firefox 标准属性均获得统一滚动条配色，页面和 Agent 局部滚动区继承同一规则。

## Definition of Done

* 视觉系统、应用壳、Agent 入口和 Agent 工作台完成实现。
* 关键页面完成桌面、平板、手机截图核验。
* 产品行为回归和工程质量检查通过。
* 可复用视觉与交互决策写入 prototype 前端规范。

## Technical Approach

* 以 `prototype/src/styles.css` 的语义变量和组件层级为主要改造面；调整 `prototype/src/App.tsx`，并以 `prototype/src/features/agent/AgentWorkspace.tsx` 取代旧的 Drawer 结构。
* 采用冷苔绿中性色、纸白、墨色、深绿主行动、蓝色信息与受限 coral 风险色，避免单一暖色贯穿。
* 将 Agent 从全局悬浮助手改为上下文入口和底部工作台，保留现有消息状态与发送逻辑。
* 不安装新依赖，不修改 lockfile，不接入真实 AI。

## Decision (ADR-lite)

**Context**: 当前视觉同时在色温、主色贯穿和 Agent 结构上接近 Claude，单独换色只能解决表层相似。

**Decision**: 用户选择完整方案 A：采用“职业档案工作台”作为统一视觉概念，选择苔痕纸墨配色，并将 Agent 结构去同质化纳入同一轮。

**Consequences**: 需要同时改 CSS 和多个工作现场的少量组件结构，回归面大于纯换色；但能形成稳定品牌识别，并避免后续再做一次重复视觉返工。Agent 不再全局常驻，入口仅在事实、研究、申请包和面试现场按上下文出现。

## Out of Scope

* 真实后端、模型、数据库、联网研究或文件解析服务。
* 修改 MVP 功能范围、领域状态模型或已完成的文案基调。
* 引入新的图标库、UI 框架、CSS 框架或网络字体。
* 暗色主题与多主题切换。

## Technical Notes

* 设计上下文来源：`C:\Users\12946\AppData\Local\Temp\handoff-thetwo-visual-redesign.md`。
* 相关实现：`prototype/src/styles.css`、`prototype/src/styles/product-interaction-overrides.css`、`prototype/src/styles/visual-redesign.css`、`prototype/src/App.tsx`、`prototype/src/features/agent/AgentWorkspace.tsx`。
* 规范：`.trellis/spec/prototype/frontend/index.md` 与 `.trellis/spec/prototype/frontend/conventions.md`。
* 当前截图：`private/prototype-mvp-desktop.png`、`private/prototype-mvp-tablet.png`、`private/prototype-mvp-mobile.png`。
* 本轮验证截图：`private/visual-redesign-login.png`、`private/visual-redesign-profile.png`、`private/visual-redesign-research.png`、`private/visual-redesign-application.png`、`private/visual-redesign-interview.png`、`private/visual-redesign-agent-desktop.png`、`private/visual-redesign-agent-mobile.png`。
* 验证结果：桌面、平板、手机均满足 `scrollWidth === clientWidth`；Agent 发送后消息记录增加，打开时锁定页面滚动，`Escape` 关闭后恢复；控制台无 warning/error。
