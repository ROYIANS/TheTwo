import { ArrowRightIcon, BrainIcon, CheckCircleIcon, QuestionIcon, SparkleIcon } from "@phosphor-icons/react";
import type { Dispatch, ReactNode } from "react";
import { availableLifeStages, type AppAction } from "../../app/state";
import type { EvidenceItem, LifeStage, OpportunityWorkspace } from "../../domain/model";
import { researchTrace } from "../../data/demo-content";
import { EvidenceRow, ObjectHeader, ObjectTrail, PrimaryButton, StatusPill, TraceList } from "../../components/ui";

export function OpportunityView({ workspace, dispatch }: { workspace: OpportunityWorkspace; dispatch: Dispatch<AppAction> }) {
  const { opportunity, research } = workspace;
  const evidence = research.evidence;
  const selected = evidence.find((item) => item.id === workspace.selectedEvidenceId) ?? evidence[0];
  const isResearching = workspace.lifeStage === "research";
  const status = workspace.decision ? decisionLabel(workspace.decision) : research.status === "done" ? "建议谨慎投入" : research.status === "running" ? "研究进行中" : "等待研究";
  return <div className="feature-view opportunity-detail-view"><ObjectHeader eyebrow={`当前机会 · ${stageLabel(workspace.lifeStage)}`} title={<>{opportunity.company}<br /><em>{opportunity.role}</em></>} description={`${opportunity.salary} · ${opportunity.location} · ${opportunity.direction}`} status={<StatusPill tone={workspace.decision ? "positive" : research.status === "done" ? "warning" : "neutral"}>{status}</StatusPill>}><div className="object-links"><button type="button" onClick={() => dispatch({ type: "set-view", view: "opportunities" })}><CheckCircleIcon size={14} />全部机会 <ArrowRightIcon size={13} /></button><button type="button" onClick={() => dispatch({ type: "set-view", view: "profile" })}><CheckCircleIcon size={14} />参与判断的职业事实 <ArrowRightIcon size={13} /></button><button type="button" onClick={() => dispatch({ type: "set-view", view: "today" })}><SparkleIcon size={14} />回到今天 <ArrowRightIcon size={13} /></button></div></ObjectHeader><ObjectTrail current={workspace.lifeStage} available={availableLifeStages(workspace)} onStage={(stage) => dispatch({ type: "set-life-stage", stage })} />{isResearching ? <ResearchStage workspace={workspace} selected={selected} evidence={evidence} dispatch={dispatch} /> : <LifecycleStage workspace={workspace} dispatch={dispatch} />}</div>;
}

function ResearchStage({ workspace, selected, evidence, dispatch }: { workspace: OpportunityWorkspace; selected?: EvidenceItem; evidence: EvidenceItem[]; dispatch: Dispatch<AppAction> }) {
  const complete = workspace.research.status === "done";
  return <div className={`opportunity-workspace ${complete ? "research-complete" : "research-in-progress"}`}>
    <section className="research-main">
      {complete ? <>
        <div className="conclusion-block">
          <div><p className="eyebrow"><span className="focus-dot" />当前建议</p><h2>能力匹配，但现实条件仍需确认</h2><p>岗位方向与你的复杂前端和工程化经历一致。建议先确认实际工作方式，再决定是否投入完整申请。</p></div>
          <strong className="conclusion-word">谨慎<br />投入</strong>
        </div>
        {selected && <section className="evidence-section">
          <div className="section-heading"><div><p className="eyebrow">判断依据</p><h2>先看证据与未知</h2></div><span>{evidence.length} 条来源</span></div>
          <div className="evidence-layout">
            <div className="evidence-list">{evidence.map((item) => <EvidenceRow key={item.id} evidence={item} selected={item.id === selected.id} onClick={() => dispatch({ type: "set-evidence", id: item.id })} />)}</div>
            <div className="evidence-detail"><StatusPill tone={selected.tone === "support" ? "positive" : selected.tone === "neutral" ? "info" : "warning"}>{toneLabel(selected.tone)}</StatusPill><h3>{selected.title}</h3><p>{selected.excerpt}</p><div className="impact-line"><span>影响判断</span>{selected.impact}</div><div className="linked-question"><QuestionIcon size={15} /><span>它连接到一个未知：<strong>团队实际工作方式</strong></span></div></div>
          </div>
        </section>}
      </> : <>
        <div className="research-empty"><span className="focus-mark"><BrainIcon size={15} /></span><p className="eyebrow">研究尚未完成</p><h2>证据会在分析完成后<br /><em>成为这个机会的一部分。</em></h2><p>现在你看到的是任务输入和公开步骤，不是预置结论。可以继续下一步，也可以随时质疑当前范围。</p></div>
        <div className="analysis-surface compact"><div className="trace-heading"><span><BrainIcon size={16} />研究任务</span><StatusPill tone={workspace.research.status === "running" ? "warning" : "neutral"}>{workspace.research.status === "running" ? "处理中" : "待开始"}</StatusPill></div><TraceList steps={researchTrace} current={workspace.research.step} status={workspace.research.status} /><PrimaryButton onClick={() => workspace.research.status === "running" ? dispatch({ type: "advance-research" }) : dispatch({ type: "start-research" })}>{workspace.research.status === "running" ? "继续下一步" : "开始研究"}</PrimaryButton></div>
      </>}
    </section>
    <aside className="opportunity-side">
      <section className="next-object"><p className="eyebrow"><span className="focus-dot" />下一动作</p><h3>{complete ? "问清实际工作方式" : "先让研究走完"}</h3><p>{complete ? "这不是自动发送的消息。AI 可以帮你准备，发送、语气和时机仍由你控制。" : "研究完成前不会生成公司结论，也不会把演示证据混进当前机会。"}</p>{complete && <PrimaryButton onClick={() => dispatch({ type: "create-communication" })}>准备沟通草稿</PrimaryButton>}</section>
      <section className="decision-object"><p className="eyebrow"><QuestionIcon size={14} />用户决定</p><h3>{workspace.decision ? `已选择${decisionLabel(workspace.decision)}` : "这份机会值得投入多少？"}</h3><p>{workspace.decision ? "你的决定和系统建议分开保存，之后可以在结果中回看。" : "理解建议之后，由你选择申请、暂缓或放弃。"}</p><div className="decision-actions"><button type="button" disabled={!complete} onClick={() => dispatch({ type: "set-decision", decision: "apply" })}>申请</button><button type="button" disabled={!complete} onClick={() => dispatch({ type: "set-decision", decision: "hold" })}>暂缓</button><button type="button" disabled={!complete} onClick={() => dispatch({ type: "set-decision", decision: "decline" })}>放弃</button></div></section>
      {complete && <section className="research-trace-summary"><div className="trace-heading"><span><BrainIcon size={16} />研究过程记录</span><StatusPill tone="positive">已完成</StatusPill></div><p>需要回看建议如何形成时，再检查本次输入、步骤和产出。</p><TraceList steps={researchTrace} current={workspace.research.step} status={workspace.research.status} /></section>}
    </aside>
  </div>;
}

function LifecycleStage({ workspace, dispatch }: { workspace: OpportunityWorkspace; dispatch: Dispatch<AppAction> }) {
  const stage = workspace.lifeStage;
  if (stage === "discover") return <LifecycleObject label="机会对象" title="这份机会刚刚进入你的现实" description="原始职位材料、来源、当前方向和职业事实已经连接。它还没有证据和建议，下一步才会产生研究任务。" items={["职位原文与来源已保留", "公司、岗位和方向已经由你确认", "后续对象尚未发生"]} action="启动研究任务" onAction={() => dispatch({ type: "start-research" })} note="启动后会产生一条可见的 AI 任务；证据只在任务完成后进入机会。" />;
  if (stage === "communicate" && workspace.communication) return <LifecycleObject label={`沟通草稿 · ${workspace.communication.createdAt}`} title="先问清会改变判断的事" description={workspace.communication.summary} items={workspace.communication.questions} action={workspace.decision === "apply" ? "记录我的申请" : "先确认我要申请"} onAction={() => workspace.decision === "apply" ? dispatch({ type: "record-application" }) : dispatch({ type: "set-decision", decision: "apply" })} note={workspace.decisionRecord ? `系统建议仍是“${workspace.decisionRecord.advisory}”；你的决定是“${decisionLabel(workspace.decisionRecord.choice)}”，两者分开保存。` : "草稿不会自动发送。作出申请决定后，才会产生申请对象。"} secondary={!workspace.application && workspace.decision === "apply" ? <button type="button" onClick={() => dispatch({ type: "record-application" })}>确认已经亲自投递</button> : undefined} />;
  if (stage === "applied" && workspace.application) return <LifecycleObject label={`申请记录 · ${workspace.application.createdAt}`} title="申请已成为一条可回看的事件" description={`通过${workspace.application.channel}记录；当时使用的材料、用户决定和研究建议仍连接在这份机会下。`} items={[...workspace.application.materials, workspace.application.followUp]} action="记录收到面试邀请" onAction={() => dispatch({ type: "create-interview" })} note="面试只在你记录真实邀请后出现，不由系统预演。" />;
  if (stage === "interview" && workspace.interviewEvent) {
    const event = workspace.interviewEvent;
    const recorded = event.status === "recorded";
    return <LifecycleObject label={`面试事件 · ${event.scheduledAt}`} title={recorded ? "面试已经带回新的现实信息" : "这次面试要验证什么"} description={recorded && event.notes ? event.notes : event.purpose} items={recorded ? [event.purpose, ...event.prompts] : event.prompts} action={recorded ? "打开面试记录" : "准备并记录面试"} onAction={() => dispatch({ type: "set-view", view: "interview" })} note={recorded ? "面试记录仍连接着原机会、研究建议和用户决定；你可以从记录中继续生成 Offer 或结果复盘。" : "先围绕未知项准备问题，真实回应发生后再记录，不预演面试结论。"} />;
  }
  if (stage === "offer" && workspace.offer) return <LifecycleObject label={`Offer · ${workspace.offer.createdAt}`} title="把条款放回你的生活里比较" description={workspace.offer.summary} items={workspace.offer.terms} action="记录最终结果" onAction={() => dispatch({ type: "create-outcome" })} note="Offer 不会覆盖研究时的建议；它是新的现实信息，会产生新的比较。" />;
  if (stage === "outcome" && workspace.outcome) return <LifecycleObject label={`结果复盘 · ${workspace.outcome.createdAt}`} title={workspace.outcome.title} description={workspace.outcome.detail} items={[`本次学习：${workspace.outcome.learning}`, workspace.strategyUpdate ? `已确认的新策略：${workspace.strategyUpdate}` : "策略回写仍待你确认"]} action={workspace.strategyUpdate ? "复盘已经确认" : "确认这条策略回写"} onAction={() => dispatch({ type: "record-strategy-update" })} disabled={Boolean(workspace.strategyUpdate)} note="回写会形成新的策略版本，不会把后来发生的事改写成当初就知道。" />;
  return <div className="lifecycle-empty"><p className="eyebrow">{stageLabel(stage)}</p><h2>这个对象尚未发生。</h2><p>返回已有对象，从一次真实动作继续推进。</p></div>;
}

function LifecycleObject({ label, title, description, items, action, note, onAction, secondary, disabled = false }: { label: string; title: string; description: string; items: string[]; action: string; note: string; onAction: () => void; secondary?: ReactNode; disabled?: boolean }) {
  return <div className="lifecycle-object"><section><p className="eyebrow">{label}</p><h2>{title}</h2><p>{description}</p><div className="object-list">{items.map((item) => <div key={item}><CheckCircleIcon size={15} /><span>{item}</span></div>)}</div><div className="lifecycle-actions"><PrimaryButton onClick={onAction} disabled={disabled}>{action}</PrimaryButton>{secondary}</div></section><aside className="lifecycle-note"><SparkleIcon size={16} /><strong>这一步如何改变现场</strong><p>{note}</p></aside></div>;
}

export function stageLabel(stage: LifeStage) { return ({ discover: "带入", research: "研究", communicate: "沟通", applied: "申请", interview: "面试", offer: "Offer", outcome: "结果" })[stage]; }
export function decisionLabel(decision: Exclude<OpportunityWorkspace["decision"], null>) { return decision === "apply" ? "申请" : decision === "hold" ? "暂缓" : "放弃"; }
function toneLabel(tone: EvidenceItem["tone"]) { return tone === "support" ? "支持判断" : tone === "risk" ? "风险信号" : tone === "conflict" ? "来源冲突" : "背景事实"; }
