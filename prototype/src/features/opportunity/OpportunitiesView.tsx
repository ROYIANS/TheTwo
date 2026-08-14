import { ArrowRightIcon, BriefcaseIcon, CheckIcon, PlusIcon, ScalesIcon } from "@phosphor-icons/react";
import type { Dispatch } from "react";
import type { AppAction } from "../../app/state";
import type { DemoState, OpportunityWorkspace } from "../../domain/model";
import { ObjectHeader, PrimaryButton, StatusPill } from "../../components/ui";
import { decisionLabel, stageLabel } from "./OpportunityView";

export function OpportunitiesView({ state, dispatch }: { state: DemoState; dispatch: Dispatch<AppAction> }) {
  const compareCount = state.compareOpportunityIds.length;
  return <div className="feature-view opportunities-view">
    <ObjectHeader eyebrow="工作机会" title={<>同时推进，<br /><em>每次只判断一件事。</em></>} description="每个机会保留独立的证据、建议、决定和真实进展。在这里切换和比较，不把求职变成一块看板。" status={<StatusPill tone={state.opportunities.length ? "positive" : "neutral"}>{state.opportunities.length} 个机会</StatusPill>}>
      <div className="object-links"><button type="button" onClick={() => dispatch({ type: "set-view", view: "today" })}>回到今天 <ArrowRightIcon size={13} /></button></div>
    </ObjectHeader>
    <div className="opportunity-collection-actions"><PrimaryButton onClick={() => dispatch({ type: "load-opportunity" })}><PlusIcon size={16} />新建机会</PrimaryButton><button type="button" className="button-quiet" disabled={compareCount < 2} onClick={() => dispatch({ type: "set-view", view: "opportunity-compare" })}><ScalesIcon size={16} />比较已选机会 <span>{compareCount}/3</span></button></div>
    {state.opportunities.length ? <div className="opportunity-list">{state.opportunities.map((workspace) => <OpportunityListItem key={workspace.opportunity.id} workspace={workspace} active={workspace.opportunity.id === state.activeOpportunityId} compared={state.compareOpportunityIds.includes(workspace.opportunity.id)} compareDisabled={!state.compareOpportunityIds.includes(workspace.opportunity.id) && compareCount >= 3} dispatch={dispatch} />)}</div> : <section className="opportunity-list-empty"><BriefcaseIcon size={24} /><h2>这里还没有机会</h2><p>从一段职位材料开始，创建后才有研究和后续对象。</p><PrimaryButton onClick={() => dispatch({ type: "load-opportunity" })}>带入第一个机会</PrimaryButton></section>}
  </div>;
}

function OpportunityListItem({ workspace, active, compared, compareDisabled, dispatch }: { workspace: OpportunityWorkspace; active: boolean; compared: boolean; compareDisabled: boolean; dispatch: Dispatch<AppAction> }) {
  const { opportunity, research } = workspace;
  const advisory = workspace.decision ? `已决定${decisionLabel(workspace.decision)}` : research.status === "done" ? "建议谨慎投入" : research.status === "running" ? "研究进行中" : "等待研究";
  const unknown = research.status === "done" ? "实际工作方式仍需确认" : "研究完成后才能识别关键风险";
  return <article className={`opportunity-list-item ${active ? "active" : ""}`}>
    <button type="button" className="opportunity-list-main" onClick={() => dispatch({ type: "select-opportunity", id: opportunity.id })}>
      <span className="opportunity-company">{opportunity.company}</span><strong>{opportunity.role}</strong><small>{opportunity.salary} · {opportunity.location}</small>
      <span className="opportunity-advisory">{advisory}</span><span className="opportunity-stage">{stageLabel(workspace.lifeStage)} · {unknown}</span><ArrowRightIcon size={17} />
    </button>
    <label className={`compare-toggle ${compared ? "selected" : ""}`}><input type="checkbox" checked={compared} disabled={compareDisabled} onChange={() => dispatch({ type: "toggle-compare-opportunity", id: opportunity.id })} /><span>{compared ? <CheckIcon size={13} /> : null}</span>加入比较</label>
  </article>;
}

export function OpportunityCompareView({ state, dispatch }: { state: DemoState; dispatch: Dispatch<AppAction> }) {
  const selected = state.compareOpportunityIds.map((id) => state.opportunities.find((workspace) => workspace.opportunity.id === id)).filter((workspace): workspace is OpportunityWorkspace => Boolean(workspace));
  return <div className="feature-view opportunity-compare-view">
    <ObjectHeader eyebrow="机会比较" title={<>并排看，<br /><em>不压成一个分数。</em></>} description="比较使用各机会已有的判断快照。未知仍然是未知，不会因为并排展示就被自动填补。" status={<StatusPill tone="info">{selected.length} 个机会</StatusPill>}><div className="object-links"><button type="button" onClick={() => dispatch({ type: "set-view", view: "opportunities" })}>调整比较对象 <ArrowRightIcon size={13} /></button></div></ObjectHeader>
    {selected.length >= 2 ? <div className="comparison-table" style={{ "--compare-count": selected.length } as React.CSSProperties}>
      <div className="comparison-label comparison-head-label">比较维度</div>{selected.map((workspace) => <button type="button" className="comparison-opportunity-head" key={workspace.opportunity.id} onClick={() => dispatch({ type: "select-opportunity", id: workspace.opportunity.id })}><span>{workspace.opportunity.company}</span><strong>{workspace.opportunity.role}</strong><ArrowRightIcon size={15} /></button>)}
      <ComparisonRow label="当前建议" workspaces={selected} render={(workspace) => workspace.decision ? `你已决定${decisionLabel(workspace.decision)}` : workspace.research.status === "done" ? "谨慎投入" : "待研究"} />
      <ComparisonRow label="硬约束" workspaces={selected} render={(workspace) => workspace.research.status === "done" ? "长期高强度到岗需要优先确认" : "尚未形成判断"} tone="risk" />
      <ComparisonRow label="匹配与回报" workspaces={selected} render={(workspace) => workspace.research.status === "done" ? "复杂前端与工程化经验匹配；薪酬达到当前底线" : `${workspace.opportunity.direction} · ${workspace.opportunity.salary}`} />
      <ComparisonRow label="关键证据" workspaces={selected} render={(workspace) => workspace.research.evidence.find((item) => item.tone === "support")?.title ?? "尚无可用证据"} />
      <ComparisonRow label="风险与未知" workspaces={selected} render={(workspace) => workspace.research.status === "done" ? "工作方式、管理边界和项目节奏仍需确认" : "研究还没完成，不能提前判断"} tone="risk" />
      <ComparisonRow label="当前进展" workspaces={selected} render={(workspace) => `${stageLabel(workspace.lifeStage)} · 已产生 ${availableObjectCount(workspace)} 个对象`} />
      <ComparisonRow label="下一动作" workspaces={selected} render={nextActionLabel} tone="action" />
    </div> : <section className="comparison-empty"><ScalesIcon size={25} /><h2>至少选择两个机会</h2><p>回到机会集合，选两个或三个再来比较。</p><PrimaryButton onClick={() => dispatch({ type: "set-view", view: "opportunities" })}>选择比较对象</PrimaryButton></section>}
  </div>;
}

function ComparisonRow({ label, workspaces, render, tone = "neutral" }: { label: string; workspaces: OpportunityWorkspace[]; render: (workspace: OpportunityWorkspace) => string; tone?: "neutral" | "risk" | "action" }) {
  return <><div className={`comparison-label comparison-${tone}`}>{label}</div>{workspaces.map((workspace) => <div className={`comparison-value comparison-${tone}`} key={`${label}-${workspace.opportunity.id}`}>{render(workspace)}</div>)}</>;
}

function availableObjectCount(workspace: OpportunityWorkspace) { return 1 + Number(workspace.research.status !== "idle") + Number(Boolean(workspace.communication)) + Number(Boolean(workspace.application)) + Number(Boolean(workspace.interviewEvent)) + Number(Boolean(workspace.offer)) + Number(Boolean(workspace.outcome)); }
function nextActionLabel(workspace: OpportunityWorkspace) {
  if (workspace.lifeStage === "discover") return "开始研究";
  if (workspace.research.status !== "done") return "完成当前研究";
  if (!workspace.communication) return "确认实际工作方式";
  if (!workspace.decision) return "作出申请、暂缓或放弃决定";
  if (!workspace.application && workspace.decision === "apply") return "记录亲自投递";
  if (workspace.application && !workspace.interviewEvent) return "等待并记录真实回应";
  if (workspace.interviewEvent && !workspace.outcome) return "把面试信息放回判断";
  return "回看结果与策略";
}
