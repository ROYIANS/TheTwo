import { ArrowRightIcon, BrainIcon, BriefcaseIcon, CalendarDotsIcon, DatabaseIcon, PlusIcon, SparkleIcon } from "@phosphor-icons/react";
import type { Dispatch } from "react";
import type { DemoState, OpportunityWorkspace } from "../../domain/model";
import { availableLifeStages, type AppAction } from "../../app/state";
import { Button } from "../../components/Button";
import { ObjectHeader, ObjectTrail, PrimaryButton, StatusPill, TraceList } from "../../components/ui";
import { researchTrace } from "../../data/demo-content";

export function TodayView({ state, active, dispatch }: { state: DemoState; active: OpportunityWorkspace | null; dispatch: Dispatch<AppAction> }) {
  const confirmedCount = state.facts.filter((fact) => fact.status === "confirmed").length;
  return <div className="today-view"><ObjectHeader eyebrow={active ? "今天" : "刚刚开始"} title={active ? <>今天，先把一件<br /><em>事情推进一步。</em></> : <>有 {confirmedCount} 条事实<br /><em>在这里了。</em></>} description={active ? "几个机会可以同时在这里。今天只给你一件最值得推进的事。" : `下一步，把一个真实的机会带进来看看。`} status={<StatusPill tone="positive">{confirmedCount} 条已确认事实</StatusPill>}><div className="object-links"><Button tone="quiet" type="button" onClick={() => dispatch({ type: "set-view", view: "profile" })}><DatabaseIcon size={14} />查看职业事实 <ArrowRightIcon size={13} /></Button>{state.opportunities.length > 0 && <Button tone="quiet" type="button" onClick={() => dispatch({ type: "set-view", view: "opportunities" })}><BriefcaseIcon size={14} />全部机会 · {state.opportunities.length} <ArrowRightIcon size={13} /></Button>}<Button type="button" onClick={() => dispatch({ type: "load-opportunity" })}><PlusIcon size={14} />新建机会 <ArrowRightIcon size={13} /></Button></div></ObjectHeader>{active ? <OpportunityToday workspace={active} dispatch={dispatch} /> : <EmptyToday dispatch={dispatch} />}</div>;
}

function EmptyToday({ dispatch }: { dispatch: Dispatch<AppAction> }) {
  return <div className="empty-today"><section className="empty-primary"><span className="focus-mark"><PlusIcon size={15} /></span><p className="eyebrow">下一件真实的事</p><h2>带入一个你正在考虑的机会</h2><p>职位名称、职责描述，粘贴进来就行。先把原始内容留着，再和你的职业事实一起看。</p><PrimaryButton onClick={() => dispatch({ type: "load-opportunity" })}>带入第一份机会</PrimaryButton></section><div className="empty-secondary"><div><CalendarDotsIcon size={17} /><strong>这里还没有面试</strong><span>等机会真的走到那一步，它就会出现在这里。</span></div><div><BrainIcon size={17} /><strong>AI 还没有东西可以分析</strong><span>带一个机会进来，它才开始工作。</span></div></div></div>;
}

function OpportunityToday({ workspace, dispatch }: { workspace: OpportunityWorkspace; dispatch: Dispatch<AppAction> }) {
  const task = nextTask(workspace, dispatch);
  return <div className="today-object-layout"><section className="today-focus"><span className="focus-mark"><BriefcaseIcon size={15} /></span><p className="eyebrow">当前机会 · {workspace.opportunity.company}</p><h2>{task.title}</h2><p>{task.description}</p><PrimaryButton onClick={task.onAction}>{task.action}</PrimaryButton></section><aside className="today-trace"><div className="trace-heading"><span><SparkleIcon size={16} />AI 当前任务</span><StatusPill tone={workspace.research.status === "done" ? "positive" : workspace.research.status === "running" ? "warning" : "neutral"}>{workspace.research.status === "done" ? "已完成" : workspace.research.status === "running" ? "处理中" : "待开始"}</StatusPill></div><TraceList steps={researchTrace} current={workspace.research.step} status={workspace.research.status} /></aside><div className="today-rail"><div><h3>这份机会留下的对象</h3><span>只显示已经发生的关系</span></div><ObjectTrail current={workspace.lifeStage} available={availableLifeStages(workspace)} onStage={(stage) => dispatch({ type: "set-life-stage", stage })} /></div></div>;
}

function nextTask(workspace: OpportunityWorkspace, dispatch: Dispatch<AppAction>): { title: string; description: string; action: string; onAction: () => void } {
  if (workspace.lifeStage === "discover") return { title: "让研究开始", description: "机会已经在这里了。下一步把职业事实、职位材料和公开信息放进同一条判断。", action: "开始这次研究", onAction: () => dispatch({ type: "start-research" }) };
  if (workspace.research.status !== "done") return { title: "研究正在进行", description: "过程是透明的。完成前不会有结论出现。", action: "查看研究进度", onAction: () => dispatch({ type: "set-view", view: "opportunity" }) };
  if (!workspace.communication) return { title: "把材料和决定放进同一份文件", description: "研究已经完成。下一步生成定制简历、沟通草稿、风险清单和申请决定工作面。", action: "生成申请决策包", onAction: () => dispatch({ type: "start-application-package" }) };
  if (!workspace.decision) return { title: "审核完再做决定", description: "申请决策包已经准备好了。看完事实、风险和表达边界，再选择申请、暂缓还是放弃。", action: "打开申请决策包", onAction: () => dispatch({ type: "set-view", view: "application" }) };
  if (workspace.decision !== "apply") return { title: `这份机会已${workspace.decision === "hold" ? "暂缓" : "放弃"}`, description: "建议、材料和你的理由都还在。现实有变化的时候可以重新打开。", action: "回看材料与理由", onAction: () => dispatch({ type: "set-view", view: "application" }) };
  if (!workspace.application) return { title: "检查材料，记录你亲自投递", description: "决定已经保存。完成审核、导出材料，再到外部平台完成投递并记录。", action: "继续审核申请包", onAction: () => dispatch({ type: "set-view", view: "application" }) };
  if (workspace.application && !workspace.interviewEvent) return { title: "等到真的收到面试通知", description: "面试只在你记录真实邀请后出现。", action: "记录面试邀请", onAction: () => dispatch({ type: "create-interview" }) };
  if (workspace.interviewEvent?.status !== "recorded") return { title: "准备并记录这次面试", description: "先看要验证什么，面试结束后再把现场信息带回来。", action: "打开面试事件", onAction: () => dispatch({ type: "set-view", view: "interview" }) };
  if (!workspace.offer && !workspace.outcome) return { title: "面试之后发生了什么", description: "可以记录收到的 Offer，也可以记录没有继续；两者都是真实的证据。", action: "打开面试记录", onAction: () => dispatch({ type: "set-view", view: "interview" }) };
  if (workspace.offer && !workspace.outcome) return { title: "记录这份机会的最终结果", description: "Offer 条款或没有继续的原因，和最初的建议、决定分开保存。", action: "开始结果复盘", onAction: () => dispatch({ type: "create-outcome" }) };
  if (workspace.outcome && !workspace.strategyUpdate) return { title: "确认一条新的理解", description: "复盘会形成新的版本，不会把后来发生的事改写成当初就知道。", action: "回看结果复盘", onAction: () => dispatch({ type: "set-view", view: "opportunity" }) };
  return { title: "这份机会已经走完了", description: "可以回看当时的证据、决定和结果，也可以切换到另一份机会继续。", action: "回看结果复盘", onAction: () => dispatch({ type: "set-view", view: "opportunity" }) };
}
