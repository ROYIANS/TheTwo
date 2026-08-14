import type { Dispatch } from "react";
import { ArrowRightIcon, CompassIcon } from "@phosphor-icons/react";
import type { AppAction } from "../../app/state";
import type { DemoState } from "../../domain/model";
import { FactCard } from "./FactCard";

export function ProfileView({ state, dispatch }: { state: DemoState; dispatch: Dispatch<AppAction> }) {
  const facts = state.facts;
  const confirmed = facts.filter((fact) => fact.status === "confirmed").length;
  const inferred = facts.filter((fact) => fact.status === "inferred").length;
  return <div className="feature-view"><div className="return-today"><button type="button" onClick={() => dispatch({ type: "set-view", view: "today" })}>← 回到今天</button></div><div className="profile-view-head"><div><p className="eyebrow">职业事实</p><h1>记住你<br /><em>真正做过什么。</em></h1><p className="object-description">不是静态简历。每条都有来源，你可以改、也可以否定。</p>{state.direction && <button type="button" className="profile-direction-link" onClick={() => dispatch({ type: "edit-direction" })}><CompassIcon size={15} /><span><strong>{state.direction.title}</strong><small>调整方向、底线与偏好</small></span><ArrowRightIcon size={14} /></button>}</div><div className="profile-count"><strong>{confirmed}</strong><span>已确认</span><strong>{inferred}</strong><span>待你确认</span></div></div>{facts.length ? <div className="profile-facts">{facts.map((fact) => <FactCard key={fact.id} fact={fact} dispatch={dispatch} />)}</div> : <div className="lifecycle-empty"><p className="eyebrow">还没有职业事实</p><h2>事实从材料和对话里来。</h2><p>回到今天，从一份简历或一次对话开始。</p></div>}</div>;
}
