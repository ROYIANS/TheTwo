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

export function LifeRail({ current, onStage }: { current: LifeStage; onStage: (stage: LifeStage) => void }) {
  const stages: Array<{ id: LifeStage; label: string; note: string }> = [
    { id: "discover", label: "带入", note: "一份真实机会" }, { id: "research", label: "研究", note: "证据与未知" }, { id: "communicate", label: "沟通", note: "问清关键问题" }, { id: "applied", label: "申请", note: "材料由你审核" }, { id: "interview", label: "面试", note: "准备与验证" }, { id: "offer", label: "Offer", note: "放回生活比较" }, { id: "outcome", label: "结果", note: "复盘并回写" },
  ];
  const currentIndex = stages.findIndex((stage) => stage.id === current);
  return <div className="life-rail">{stages.map((stage, index) => <button key={stage.id} type="button" className={`life-node ${stage.id === current ? "current" : ""} ${index < currentIndex ? "done" : ""}`} onClick={() => onStage(stage.id)}><span>{index < currentIndex ? <Check size={11} /> : <Circle size={8} />}</span><strong>{stage.label}</strong><small>{stage.note}</small></button>)}</div>;
}

export function FactStatus({ status }: { status: FactStatus }) {
  return <StatusPill tone={status === "confirmed" ? "positive" : status === "inferred" ? "warning" : status === "rejected" ? "neutral" : "info"}>{status === "confirmed" ? "已确认" : status === "inferred" ? "待你确认" : status === "rejected" ? "已否定" : "未知项"}</StatusPill>;
}

export function EvidenceRow({ evidence, selected, onClick }: { evidence: EvidenceItem; selected: boolean; onClick: () => void }) {
  return <button type="button" className={`evidence-object ${selected ? "selected" : ""}`} onClick={onClick}><span className={`evidence-dot evidence-${evidence.tone}`} /><span><small>{evidence.source}</small><strong>{evidence.title}</strong><em>{evidence.summary}</em></span><ChevronRight size={14} /></button>;
}

