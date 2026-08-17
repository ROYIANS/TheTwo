import { CheckIcon, PencilSimpleIcon, XIcon } from "@phosphor-icons/react";
import { useState, type Dispatch } from "react";
import type { AppAction } from "../../app/state";
import { Button } from "../../components/Button";
import { FactStatus } from "../../components/ui";
import type { CareerFact } from "../../domain/model";

export function FactCard({ fact, dispatch }: { fact: CareerFact; dispatch: Dispatch<AppAction> }) {
  const [editing, setEditing] = useState(false);
  const [detail, setDetail] = useState(fact.detail);

  const save = () => {
    if (!detail.trim()) return;
    dispatch({ type: "update-fact", id: fact.id, detail: detail.trim() });
    setEditing(false);
  };

  return <article className={`fact-review ${fact.status}`}>
    <div className="fact-review-top"><FactStatus status={fact.status} /><small>{fact.source}</small></div>
    <h2>{fact.label}</h2>
    {editing ? <div className="fact-edit"><textarea aria-label={`修改${fact.label}`} value={detail} onChange={(event) => setDetail(event.target.value)} /><div><Button type="button" onClick={() => { setDetail(fact.detail); setEditing(false); }}><XIcon size={14} />取消</Button><Button type="button" className="button-primary" onClick={save}><CheckIcon size={14} />改完确认</Button></div></div> : <p>{fact.detail}</p>}
    <div className="fact-consequence"><span>会影响</span>{fact.consequence}</div>
    {!editing && <div className="fact-actions">
      <Button type="button" onClick={() => setEditing(true)}><PencilSimpleIcon size={14} />修改</Button>
      {fact.status === "inferred" && <><Button type="button" onClick={() => dispatch({ type: "reject-fact", id: fact.id })}>不对</Button><Button type="button" className="button-primary" onClick={() => dispatch({ type: "confirm-fact", id: fact.id })}>确认</Button></>}
    </div>}
  </article>;
}
