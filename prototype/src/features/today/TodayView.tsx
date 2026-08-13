import { ArrowRight, BrainCircuit, BriefcaseBusiness, CalendarDays, Database, Plus, Sparkles } from "lucide-react";
import type { Dispatch } from "react";
import type { DemoState } from "../../domain/model";
import { availableLifeStages, type AppAction } from "../../app/state";
import { ObjectHeader, ObjectTrail, PrimaryButton, StatusPill, TraceList } from "../../components/ui";
import { researchTrace } from "../../data/demo-content";

export function TodayView({ state, dispatch }: { state: DemoState; dispatch: Dispatch<AppAction> }) {
  const hasOpportunity = Boolean(state.opportunity);
  const confirmedCount = state.facts.filter((fact) => fact.status === "confirmed").length;
  return <div className="today-view"><ObjectHeader eyebrow={hasOpportunity ? "你的职业现场" : "上下文已建立"} title={hasOpportunity ? <>今天，先把一个<br /><em>重要机会看清楚。</em></> : <>你的职业现场<br /><em>刚刚建立。</em></>} description={hasOpportunity ? "现在最值得做的不是生成一份更漂亮的材料，而是确认一条会改变判断的未知。" : `${state.userName || "你"}，你已经有一组可以工作的职业事实。下一步，把一个真实机会带进来。`} status={<StatusPill tone="positive">{confirmedCount} 条已确认事实</StatusPill>}><div className="object-links"><button type="button" onClick={() => dispatch({ type: "set-view", view: "profile" })}><Database size={14} />查看职业事实 <ArrowRight size={13} /></button>{hasOpportunity && <button type="button" onClick={() => dispatch({ type: "set-view", view: "opportunity" })}><BriefcaseBusiness size={14} />打开当前机会 <ArrowRight size={13} /></button>}</div></ObjectHeader>{hasOpportunity ? <OpportunityToday state={state} dispatch={dispatch} /> : <EmptyToday dispatch={dispatch} />}</div>;
}

function EmptyToday({ dispatch }: { dispatch: Dispatch<AppAction> }) {
  return <div className="empty-today"><section className="empty-primary"><span className="focus-mark"><Plus size={15} /></span><p className="eyebrow">下一件真实的事</p><h2>带入一个你正在考虑的机会</h2><p>职位名称、职责或截图都可以。先把你看到的原始语境保留下来，AI 才能和你的职业事实放在一起看。</p><PrimaryButton onClick={() => dispatch({ type: "load-opportunity" })}>带入第一份机会</PrimaryButton></section><div className="empty-secondary"><div><CalendarDays size={17} /><strong>这里还没有面试</strong><span>当机会产生真实进程后，它会从对象关系中出现。</span></div><div><BrainCircuit size={17} /><strong>AI 还没有开始研究</strong><span>你可以随时让它解释，但不会在没有对象时制造结论。</span></div></div></div>;
}

function OpportunityToday({ state, dispatch }: { state: DemoState; dispatch: Dispatch<AppAction> }) {
  const task = nextTask(state, dispatch);
  return <div className="today-object-layout"><section className="today-focus"><span className="focus-mark"><BriefcaseBusiness size={15} /></span><p className="eyebrow">当前机会 · {state.opportunity?.company}</p><h2>{task.title}</h2><p>{task.description}</p><PrimaryButton onClick={task.onAction}>{task.action}</PrimaryButton></section><aside className="today-trace"><div className="trace-heading"><span><Sparkles size={16} />AI 当前任务</span><StatusPill tone={state.research.status === "done" ? "positive" : state.research.status === "running" ? "warning" : "neutral"}>{state.research.status === "done" ? "已完成" : state.research.status === "running" ? "处理中" : "待开始"}</StatusPill></div><TraceList steps={researchTrace} current={state.research.step} status={state.research.status} /></aside><div className="today-rail"><div><h3>这份机会留下的对象</h3><span>只显示已经发生的关系</span></div><ObjectTrail current={state.lifeStage} available={availableLifeStages(state)} onStage={(stage) => dispatch({ type: "set-life-stage", stage })} /></div></div>;
}

function nextTask(state: DemoState, dispatch: Dispatch<AppAction>): { title: string; description: string; action: string; onAction: () => void } {
  if (state.lifeStage === "discover") return { title: "先让研究真正开始", description: "机会对象已经由你确认。下一步把职业事实、职位语境和公开证据放进同一条可追溯的判断。", action: "开始这次研究", onAction: () => dispatch({ type: "start-research" }) };
  if (state.research.status !== "done") return { title: "让 AI 展开这份机会的证据", description: "研究过程会逐步显示输入、来源、未知和建议；完成前不会出现预置结论。", action: "查看研究进度", onAction: () => dispatch({ type: "set-view", view: "opportunity" }) };
  if (!state.communication) return { title: "问清会改变判断的事", description: "研究已完成，最有价值的下一步是生成一份只存在于当前机会里的沟通草稿。", action: "准备沟通草稿", onAction: () => dispatch({ type: "create-communication" }) };
  if (!state.decision) return { title: "你准备把这份机会推进到哪？", description: "沟通草稿已经准备好。现在由你决定是否申请、暂缓或放弃，系统建议不会替你选择。", action: "回看建议并决定", onAction: () => dispatch({ type: "set-view", view: "opportunity" }) };
  if (!state.application && state.decision === "apply") return { title: "把申请作为一条事件留下", description: "确认你已经亲自投递后，材料、渠道和当时的建议会与机会绑定。", action: "记录我的申请", onAction: () => dispatch({ type: "record-application" }) };
  if (state.application && !state.interviewEvent) return { title: "记录真实的面试邀请", description: "面试对象只在现实中发生后产生。系统不会预演一个不存在的进程。", action: "记录面试邀请", onAction: () => dispatch({ type: "create-interview" }) };
  if (state.interviewEvent?.status !== "recorded") return { title: "准备并记录这次面试", description: "打开面试事件，先看它要验证的未知，结束后再把现场信息带回来。", action: "打开面试事件", onAction: () => dispatch({ type: "set-view", view: "interview" }) };
  if (!state.offer && !state.outcome) return { title: "把面试回应放回机会", description: "你可以记录收到的 Offer，也可以记录未继续的结果；两者都会成为新的现实证据。", action: "打开面试记录", onAction: () => dispatch({ type: "set-view", view: "interview" }) };
  if (state.offer && !state.outcome) return { title: "记录这份机会的最终结果", description: "Offer 条款或拒绝原因都应该和原来的建议、决定分开保存。", action: "开始结果复盘", onAction: () => dispatch({ type: "create-outcome" }) };
  if (state.outcome && !state.strategyUpdate) return { title: "确认一条新的策略理解", description: "复盘会形成新的策略版本，不会把后来发生的事改写成当初就知道。", action: "回看结果复盘", onAction: () => dispatch({ type: "set-view", view: "opportunity" }) };
  return { title: "这份机会已经留下完整关系", description: "你可以回看当时的证据、决定和结果，也可以把新的策略带到下一份机会。", action: "回看结果复盘", onAction: () => dispatch({ type: "set-view", view: "opportunity" }) };
}
