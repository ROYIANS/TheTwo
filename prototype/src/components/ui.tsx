import type { ReactNode } from "react";
import { ArrowRight, Check, Circle, ChevronRight } from "lucide-react";
import type { EvidenceItem, FactStatus, LifeStage } from "../domain/model";

export function StatusPill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "positive" | "warning" | "info" }) {
  return <span className={`status-pill status-${tone}`}><span />{children}</span>;
}

export function PrimaryButton({ children, onClick, disabled = false }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return <button type="button" className="button-primary" onClick={onClick} disabled={disabled}>{children}<ArrowRight size={15} /></button>;
}

export function QuietButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button type="button" className="button-quiet" onClick={onClick}>{children}<ChevronRight size={14} /></button>;
}

export function ObjectHeader({ eyebrow, title, description, status, children }: { eyebrow: string; title: ReactNode; description: string; status?: ReactNode; children?: ReactNode }) {
  return <div className="object-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="object-description">{description}</p>{children}</div>{status && <div className="object-status">{status}</div>}</div>;
}

export function ReturnToday({ onClick }: { onClick: () => void }) {
  return <div className="return-today"><button type="button" onClick={onClick}>← 回到今天</button></div>;
}

export function TraceList({ steps, current, status }: { steps: Array<{ title: string; detail: string; input?: string; output?: string }>; current: number; status: "idle" | "running" | "done" }) {
  return <div className="trace-list">{steps.map((step, index) => { const complete = status === "done" || index < current; const active = status === "running" && index === current; return <div key={step.title} className={`trace-step ${complete ? "complete" : ""} ${active ? "active" : ""}`}><span className="trace-marker">{complete ? <Check size={12} /> : active ? <span className="spinner" /> : <Circle size={8} />}</span><div><strong>{step.title}</strong><p>{step.detail}</p>{(active || complete) && <small>{complete ? `产出：${step.output ?? "已记录"}` : `正在读取：${step.input ?? "当前对象"}`}</small>}</div></div>; })}</div>;
}

export function ObjectTrail({ current, available, onStage }: { current: LifeStage; available: LifeStage[]; onStage: (stage: LifeStage) => void }) {
  const objects: Array<{ id: LifeStage; label: string; note: string }> = [
    { id: "discover", label: "机会对象", note: "原始材料已确认" }, { id: "research", label: "研究任务", note: "证据与建议" }, { id: "communicate", label: "沟通草稿", note: "等待本人发送" }, { id: "applied", label: "申请记录", note: "材料与决定快照" }, { id: "interview", label: "面试事件", note: "准备与现场记录" }, { id: "offer", label: "Offer 对象", note: "真实条款" }, { id: "outcome", label: "结果复盘", note: "待确认的策略" },
  ];
  const visible = objects.filter((item) => available.includes(item.id));
  return <div className="object-trail" aria-label="这份机会已产生的关联对象">{visible.map((item, index) => <button key={item.id} type="button" aria-current={item.id === current ? "page" : undefined} className={`object-node ${item.id === current ? "current" : ""}`} onClick={() => onStage(item.id)}><span>{index < visible.length - 1 ? <Check size={11} /> : <Circle size={8} />}</span><strong>{item.label}</strong><small>{item.note}</small></button>)}</div>;
}

export function FactStatus({ status }: { status: FactStatus }) {
  return <StatusPill tone={status === "confirmed" ? "positive" : status === "inferred" ? "warning" : status === "rejected" ? "neutral" : "info"}>{status === "confirmed" ? "已确认" : status === "inferred" ? "待你确认" : status === "rejected" ? "已否定" : "未知项"}</StatusPill>;
}

export function EvidenceRow({ evidence, selected, onClick }: { evidence: EvidenceItem; selected: boolean; onClick: () => void }) {
  return <button type="button" className={`evidence-object ${selected ? "selected" : ""}`} onClick={onClick}><span className={`evidence-dot evidence-${evidence.tone}`} /><span><small>{evidence.source}</small><strong>{evidence.title}</strong><em>{evidence.summary}</em></span><ChevronRight size={14} /></button>;
}
