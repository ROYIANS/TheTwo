import { ArrowRightIcon, CalendarDotsIcon, CheckCircleIcon, SparkleIcon } from "@phosphor-icons/react";
import { useState, type Dispatch } from "react";
import type { AppAction } from "../../app/state";
import type { OpportunityWorkspace } from "../../domain/model";
import { ObjectHeader, PrimaryButton, ReturnToday, StatusPill } from "../../components/ui";
import { AgentContextEntry } from "../agent/AgentWorkspace";

export function InterviewView({ workspace, dispatch, onOpenAgent }: { workspace: OpportunityWorkspace; dispatch: Dispatch<AppAction>; onOpenAgent: () => void }) {
  const event = workspace.interviewEvent;
  if (!event) return null;
  return <InterviewContent workspace={workspace} dispatch={dispatch} onOpenAgent={onOpenAgent} />;
}

function InterviewContent({ workspace, dispatch, onOpenAgent }: { workspace: OpportunityWorkspace; dispatch: Dispatch<AppAction>; onOpenAgent: () => void }) {
  const event = workspace.interviewEvent!;
  const recorded = event.status === "recorded";
  const [notes, setNotes] = useState(event.notes ?? "");
  return <div className="feature-view"><ReturnToday onClick={() => dispatch({ type: "set-view", view: "today" })} /><ObjectHeader eyebrow={`关联事件 · ${event.scheduledAt}`} title={<>把一次面试，<br /><em>变成下一次的证据。</em></>} description="准备要验证的未知，记录真实回应，再由你决定这些信息如何改变当前机会。" status={<StatusPill tone={recorded ? "positive" : "info"}>{recorded ? "已记录" : "待发生"}</StatusPill>}><div className="object-links"><button type="button" onClick={() => dispatch({ type: "set-view", view: "opportunity" })}><CalendarDotsIcon size={14} />回到当前机会 <ArrowRightIcon size={13} /></button></div></ObjectHeader><AgentContextEntry label={recorded ? "复盘这次面试" : "准备这次面试"} detail={recorded ? "把现场信息与原来的未知逐条对照，不用结果倒推当初。" : "只围绕这次需要验证的问题准备，不做通用题库。"} context={`${workspace.opportunity.company} · 面试事件`} onOpen={onOpenAgent} /><div className="interview-layout"><section className="interview-event"><div className="event-summary"><span className="calendar-icon"><CalendarDotsIcon size={19} /></span><div><p className="eyebrow">{workspace.opportunity.company} · {event.title}</p><h2>{event.scheduledAt}</h2><p>{event.purpose}</p></div></div><div className="interview-prompts">{event.prompts.map((prompt) => <div key={prompt}><CheckCircleIcon size={14} /><span>{prompt}</span></div>)}</div>{recorded ? <div className="interview-result"><span>你记录的现场信息</span><p>{event.notes}</p><div className="interview-result-actions"><PrimaryButton onClick={() => dispatch({ type: "create-offer" })}>记录收到 Offer</PrimaryButton><button type="button" onClick={() => dispatch({ type: "create-outcome" })}>记录未继续并复盘</button></div></div> : <div className="interview-note-form"><label htmlFor="interview-note">面试后，你实际听到了什么？</label><textarea id="interview-note" value={notes} placeholder="记录对方的回应、你的观察和仍未确认的地方……" onChange={(event) => setNotes(event.target.value)} /><div className="input-helper"><span>{notes.trim().length} 字 · 会进入当前机会</span><button type="button" onClick={() => setNotes("对方确认岗位有架构决策空间，但需要长期高强度到岗；正式人员管理边界仍不清楚。")}>填入演示记录</button></div><PrimaryButton disabled={notes.trim().length < 12} onClick={() => dispatch({ type: "record-interview", notes })}>保存这次面试记录</PrimaryButton></div>}</section><aside className="interview-aside"><div className="interview-principle"><SparkleIcon size={17} /><h3>这不是成败评分</h3><p>事件的价值在于产生新的可验证信息，而不是给你贴上“通过”或“失败”的标签。</p></div><div className="interview-timeline"><h3>这次事件连接什么</h3><div><CheckCircleIcon size={14} /><span>原机会与研究建议</span></div><div><CheckCircleIcon size={14} /><span>团队授权与工作方式未知</span></div><div><CheckCircleIcon size={14} /><span>之后的 Offer 或结果复盘</span></div></div></aside></div></div>;
}
