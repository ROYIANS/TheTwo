import { ArrowRightIcon, BrainIcon, BriefcaseIcon, CalendarDotsIcon, DatabaseIcon, PlusIcon, SparkleIcon } from "@phosphor-icons/react";
import type { Dispatch } from "react";
import type { DemoState, OpportunityWorkspace } from "../../domain/model";
import { availableLifeStages, type AppAction } from "../../app/state";
import { ObjectHeader, ObjectTrail, PrimaryButton, StatusPill, TraceList } from "../../components/ui";
import { researchTrace } from "../../data/demo-content";

export function TodayView({ state, active, dispatch }: { state: DemoState; active: OpportunityWorkspace | null; dispatch: Dispatch<AppAction> }) {
  const confirmedCount = state.facts.filter((fact) => fact.status === "confirmed").length;
  return <div className="today-view"><ObjectHeader eyebrow={active ? "你的职业现场" : "上下文已建立"} title={active ? <>今天，先把一个<br /><em>重要机会看清楚。</em></> : <>你的职业现场<br /><em>刚刚建立。</em></>} description={active ? "多个机会可以并行存在，但今天仍只给出一个最值得推进的动作。" : `${state.userName || "你"}，你已经有一组可以工作的职业事实。下一步，把一个真实机会带进来。`} status={<StatusPill tone="positive">{confirmedCount} 条已确认事实</StatusPill>}><div className="object-links"><button type="button" onClick={() => dispatch({ type: "set-view", view: "profile" })}><DatabaseIcon size={14} />查看职业事实 <ArrowRightIcon size={13} /></button>{state.opportunities.length > 0 && <button type="button" onClick={() => dispatch({ type: "set-view", view: "opportunities" })}><BriefcaseIcon size={14} />全部机会 · {state.opportunities.length} <ArrowRightIcon size={13} /></button>}<button type="button" onClick={() => dispatch({ type: "load-opportunity" })}><PlusIcon size={14} />新建机会 <ArrowRightIcon size={13} /></button></div></ObjectHeader>{active ? <OpportunityToday workspace={active} dispatch={dispatch} /> : <EmptyToday dispatch={dispatch} />}</div>;
}

function EmptyToday({ dispatch }: { dispatch: Dispatch<AppAction> }) {
  return <div className="empty-today"><section className="empty-primary"><span className="focus-mark"><PlusIcon size={15} /></span><p className="eyebrow">下一件真实的事</p><h2>带入一个你正在考虑的机会</h2><p>职位名称、职责或截图都可以。先把你看到的原始语境保留下来，AI 才能和你的职业事实放在一起看。</p><PrimaryButton onClick={() => dispatch({ type: "load-opportunity" })}>带入第一份机会</PrimaryButton></section><div className="empty-secondary"><div><CalendarDotsIcon size={17} /><strong>这里还没有面试</strong><span>当机会产生真实进程后，它会从对象关系中出现。</span></div><div><BrainIcon size={17} /><strong>AI 还没有开始研究</strong><span>你可以随时让它解释，但不会在没有对象时制造结论。</span></div></div></div>;
}

function OpportunityToday({ workspace, dispatch }: { workspace: OpportunityWorkspace; dispatch: Dispatch<AppAction> }) {
  const task = nextTask(workspace, dispatch);
  return <div className="today-object-layout"><section className="today-focus"><span className="focus-mark"><BriefcaseIcon size={15} /></span><p className="eyebrow">当前机会 · {workspace.opportunity.company}</p><h2>{task.title}</h2><p>{task.description}</p><PrimaryButton onClick={task.onAction}>{task.action}</PrimaryButton></section><aside className="today-trace"><div className="trace-heading"><span><SparkleIcon size={16} />AI 当前任务</span><StatusPill tone={workspace.research.status === "done" ? "positive" : workspace.research.status === "running" ? "warning" : "neutral"}>{workspace.research.status === "done" ? "已完成" : workspace.research.status === "running" ? "处理中" : "待开始"}</StatusPill></div><TraceList steps={researchTrace} current={workspace.research.step} status={workspace.research.status} /></aside><div className="today-rail"><div><h3>这份机会留下的对象</h3><span>只显示已经发生的关系</span></div><ObjectTrail current={workspace.lifeStage} available={availableLifeStages(workspace)} onStage={(stage) => dispatch({ type: "set-life-stage", stage })} /></div></div>;
}

function nextTask(workspace: OpportunityWorkspace, dispatch: Dispatch<AppAction>): { title: string; description: string; action: string; onAction: () => void } {
  if (workspace.lifeStage === "discover") return { title: "先让研究真正开始", description: "机会对象已经由你确认。下一步把职业事实、职位语境和公开证据放进同一条可追溯的判断。", action: "开始这次研究", onAction: () => dispatch({ type: "start-research" }) };
  if (workspace.research.status !== "done") return { title: "让 AI 展开这份机会的证据", description: "研究过程会逐步显示输入、来源、未知和建议；完成前不会出现预置结论。", action: "查看研究进度", onAction: () => dispatch({ type: "set-view", view: "opportunity" }) };
  if (!workspace.communication) return { title: "把材料、风险和决定放在一起", description: "研究已完成。下一步生成可编辑的定制简历、沟通草稿、审核清单和申请决定工作面。", action: "生成申请决策包", onAction: () => dispatch({ type: "start-application-package" }) };
  if (!workspace.decision) return { title: "审核材料，再记录你的决定", description: "申请决策包已经准备好。现在检查事实、风险和表达边界，再选择申请、暂缓或放弃。", action: "打开申请决策包", onAction: () => dispatch({ type: "set-view", view: "application" }) };
  if (workspace.decision !== "apply") return { title: `这份机会已${workspace.decision === "hold" ? "暂缓" : "放弃"}`, description: "系统建议、申请材料和你的理由仍然保留；现实信息变化后可以重新打开并作出新决定。", action: "回看材料与理由", onAction: () => dispatch({ type: "set-view", view: "application" }) };
  if (!workspace.application) return { title: "确认材料后记录亲自投递", description: "申请决定已经保存。完成审核并导出材料后，再记录你亲自在外部平台完成的申请。", action: "继续审核申请包", onAction: () => dispatch({ type: "set-view", view: "application" }) };
  if (workspace.application && !workspace.interviewEvent) return { title: "记录真实的面试邀请", description: "面试对象只在现实中发生后产生。系统不会预演一个不存在的进程。", action: "记录面试邀请", onAction: () => dispatch({ type: "create-interview" }) };
  if (workspace.interviewEvent?.status !== "recorded") return { title: "准备并记录这次面试", description: "打开面试事件，先看它要验证的未知，结束后再把现场信息带回来。", action: "打开面试事件", onAction: () => dispatch({ type: "set-view", view: "interview" }) };
  if (!workspace.offer && !workspace.outcome) return { title: "把面试回应放回机会", description: "你可以记录收到的 Offer，也可以记录未继续的结果；两者都会成为新的现实证据。", action: "打开面试记录", onAction: () => dispatch({ type: "set-view", view: "interview" }) };
  if (workspace.offer && !workspace.outcome) return { title: "记录这份机会的最终结果", description: "Offer 条款或拒绝原因都应该和原来的建议、决定分开保存。", action: "开始结果复盘", onAction: () => dispatch({ type: "create-outcome" }) };
  if (workspace.outcome && !workspace.strategyUpdate) return { title: "确认一条新的策略理解", description: "复盘会形成新的策略版本，不会把后来发生的事改写成当初就知道。", action: "回看结果复盘", onAction: () => dispatch({ type: "set-view", view: "opportunity" }) };
  return { title: "这份机会已经留下完整关系", description: "你可以回看当时的证据、决定和结果，也可以切换到另一份机会继续推进。", action: "回看结果复盘", onAction: () => dispatch({ type: "set-view", view: "opportunity" }) };
}
