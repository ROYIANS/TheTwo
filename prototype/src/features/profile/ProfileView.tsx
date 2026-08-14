import type { Dispatch } from "react";
import { ArrowRightIcon, CompassIcon } from "@phosphor-icons/react";
import type { AppAction } from "../../app/state";
import type { DemoState } from "../../domain/model";
import { FactCard } from "./FactCard";

export function ProfileView({ state, dispatch }: { state: DemoState; dispatch: Dispatch<AppAction> }) {
  const facts = state.facts;
  const confirmed = facts.filter((fact) => fact.status === "confirmed").length;
  const inferred = facts.filter((fact) => fact.status === "inferred").length;
  return <div className="feature-view"><div className="return-today"><button type="button" onClick={() => dispatch({ type: "set-view", view: "today" })}>← 回到今天</button></div><div className="profile-view-head"><div><p className="eyebrow">职业事实 · 当前有效</p><h1>记住你<br /><em>真正做过什么。</em></h1><p className="object-description">这里不是一份静态简历。每条内容都有来源、状态和会影响什么，你可以随时修改并重新确认。</p>{state.direction && <button type="button" className="profile-direction-link" onClick={() => dispatch({ type: "edit-direction" })}><CompassIcon size={15} /><span><strong>{state.direction.title}</strong><small>调整方向、硬约束与偏好</small></span><ArrowRightIcon size={14} /></button>}</div><div className="profile-count"><strong>{confirmed}</strong><span>已确认</span><strong>{inferred}</strong><span>待你确认</span></div></div>{facts.length ? <div className="profile-facts">{facts.map((fact) => <FactCard key={fact.id} fact={fact} dispatch={dispatch} />)}</div> : <div className="lifecycle-empty"><p className="eyebrow">还没有职业事实</p><h2>事实会从你的材料和对话中产生。</h2><p>返回今天，从一份简历或一次访谈开始。</p></div>}</div>;
}
