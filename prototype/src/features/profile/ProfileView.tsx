import type { Dispatch } from "react";
import { ArrowRight } from "lucide-react";
import { FactStatus } from "../../components/ui";
import type { AppAction } from "../../app/state";
import type { DemoState } from "../../domain/model";

export function ProfileView({ state, dispatch }: { state: DemoState; dispatch: Dispatch<AppAction> }) {
  const facts = state.facts;
  const confirmed = facts.filter((fact) => fact.status === "confirmed").length;
  const inferred = facts.filter((fact) => fact.status === "inferred").length;
  return <div className="feature-view"><div className="return-today"><button type="button" onClick={() => dispatch({ type: "set-view", view: "today" })}>← 回到今天</button></div><div className="profile-view-head"><div><p className="eyebrow">职业事实 · 当前有效</p><h1>记住你<br /><em>真正做过什么。</em></h1><p className="object-description">这里不是一份静态简历。每条内容都有来源、状态和会影响什么，之后会随着机会和结果继续修正。</p></div><div className="profile-count"><strong>{confirmed}</strong><span>已确认</span><strong>{inferred}</strong><span>待你确认</span></div></div>{facts.length ? <div className="profile-facts">{facts.map((fact) => <article key={fact.id} className={`fact-review ${fact.status}`}><div className="fact-review-top"><FactStatus status={fact.status} /><small>{fact.source}</small></div><h2>{fact.label}</h2><p>{fact.detail}</p><div className="fact-consequence"><span>会影响</span>{fact.consequence}</div>{fact.status === "inferred" && <div className="fact-actions"><button type="button" onClick={() => dispatch({ type: "reject-fact", id: fact.id })}>不是这样</button><button type="button" className="button-primary" onClick={() => dispatch({ type: "confirm-fact", id: fact.id })}>确认这条事实 <ArrowRight size={14} /></button></div>}</article>)}</div> : <div className="lifecycle-empty"><p className="eyebrow">还没有职业事实</p><h2>事实会从你的材料和对话中产生。</h2><p>返回今天，从一份简历或一次访谈开始。</p></div>}</div>;
}
