import { ArrowRightIcon, CheckCircleIcon, DownloadSimpleIcon, FileTextIcon, ShieldWarningIcon, SparkleIcon, XIcon } from "@phosphor-icons/react";
import { useState, type Dispatch } from "react";
import type { AppAction } from "../../app/state";
import { ObjectHeader, PrimaryButton, StatusPill, TraceList } from "../../components/ui";
import { applicationTrace } from "../../data/demo-content";
import type { OpportunityWorkspace, UserDecision } from "../../domain/model";
import { AgentContextEntry } from "../agent/AgentWorkspace";

export function ApplicationPackageView({ workspace, dispatch, onOpenAgent }: { workspace: OpportunityWorkspace; dispatch: Dispatch<AppAction>; onOpenAgent: () => void }) {
  const applicationPackage = workspace.applicationPackage;
  const [choice, setChoice] = useState<Exclude<UserDecision, null>>(workspace.decision ?? "apply");
  const [reason, setReason] = useState(workspace.decisionRecord?.reason ?? "");
  const [exported, setExported] = useState("");

  if (!applicationPackage) return <div className="feature-view"><ObjectHeader eyebrow="申请决策包" title={<>这份材料<br /><em>还没有开始生成。</em></>} description="先回到机会判断，确认研究证据后再准备申请材料。" /><PrimaryButton onClick={() => dispatch({ type: "set-view", view: "opportunity" })}>回到机会判断</PrimaryButton></div>;

  if (applicationPackage.status === "running") return <div className="feature-view application-generating"><ObjectHeader eyebrow="正在准备" title={<>把事实和风险<br /><em>放进同一份材料。</em></>} description="正在从已确认职业事实、当前方向、职位要求和研究证据生成草稿。完成前不会记录申请决定。" status={<StatusPill tone="warning">生成中</StatusPill>} /><section className="analysis-surface"><TraceList steps={applicationTrace} current={applicationPackage.step} status={applicationPackage.status} /><button type="button" className="button-quiet cancel-generation" onClick={() => dispatch({ type: "cancel-application-package" })}><XIcon size={14} />取消并回到机会</button></section></div>;

  const reviewed = applicationPackage.reviewItems.filter((item) => item.checked).length;
  const reviewComplete = reviewed === applicationPackage.reviewItems.length;
  const applicationRecorded = Boolean(workspace.application);
  const saveDecision = () => dispatch({ type: "set-decision", decision: choice, reason });
  const updateText = (field: "title" | "headline" | "summary" | "experience" | "communication", value: string) => {
    setExported("");
    dispatch({ type: "update-application-text", field, value });
  };
  const exportResume = () => {
    downloadText(`${safeName(workspace.opportunity.company)}-定制简历.txt`, resumeText(workspace));
    dispatch({ type: "mark-application-exported" });
    setExported("定制简历已导出到浏览器下载目录。");
  };
  const exportPackage = () => {
    downloadText(`${safeName(workspace.opportunity.company)}-申请决策包.md`, packageText(workspace));
    dispatch({ type: "mark-application-exported" });
    setExported("完整申请决策包已导出到浏览器下载目录。");
  };

  return <div className="feature-view application-package-view">
    <ObjectHeader eyebrow={`申请决策包 · ${workspace.opportunity.company}`} title={<>准备好再行动，<br /><em>不是生成完就行动。</em></>} description="定制表达、沟通草稿、风险和你的决定都在同一份材料里。对外的每一步仍由你亲自完成。" status={<StatusPill tone={applicationRecorded || reviewComplete ? "positive" : "warning"}>{applicationRecorded ? "申请已记录" : `${reviewed}/${applicationPackage.reviewItems.length} 项已审核`}</StatusPill>}>
      <div className="object-links"><button type="button" onClick={() => dispatch({ type: "set-view", view: "opportunity" })}>回到机会判断 <ArrowRightIcon size={13} /></button><button type="button" onClick={() => dispatch({ type: "set-view", view: "today" })}>回到今天 <ArrowRightIcon size={13} /></button></div>
    </ObjectHeader>

    {applicationRecorded && <div className="application-locked" role="status"><CheckCircleIcon size={16} weight="fill" /><span><strong>这份申请已经成为历史快照</strong>材料、审核结果和决定已锁定；你仍可以回看和导出，但不会无痕改写当时使用的版本。</span></div>}
    <AgentContextEntry label="检查这份申请材料" detail="一起看表达是否越过事实、遗漏风险，或把未知说得太确定。" context={`${workspace.opportunity.company} · 申请决策包`} onOpen={onOpenAgent} />
    <div className="application-layout">
      <main className="application-editor">
        <section className="application-section resume-editor"><div className="application-section-head"><div><span><FileTextIcon size={15} />岗位定制简历</span><h2>只重排和解释已确认事实</h2></div><button type="button" onClick={exportResume}><DownloadSimpleIcon size={15} />导出简历</button></div><label><span>文件标题</span><input disabled={applicationRecorded} value={applicationPackage.resume.title} onChange={(event) => updateText("title", event.target.value)} /></label><label><span>定位标题</span><input disabled={applicationRecorded} value={applicationPackage.resume.headline} onChange={(event) => updateText("headline", event.target.value)} /></label><label><span>职业摘要</span><textarea disabled={applicationRecorded} value={applicationPackage.resume.summary} onChange={(event) => updateText("summary", event.target.value)} /></label><label><span>重点经历</span><textarea disabled={applicationRecorded} className="resume-experience" value={applicationPackage.resume.experience} onChange={(event) => updateText("experience", event.target.value)} /></label></section>

        <section className="application-section communication-editor"><div className="application-section-head"><div><span><SparkleIcon size={15} />初次沟通草稿</span><h2>先问清会改变判断的事</h2></div><StatusPill tone="info">不会自动发送</StatusPill></div><textarea disabled={applicationRecorded} aria-label="编辑初次沟通草稿" value={applicationPackage.communicationDraft} onChange={(event) => updateText("communication", event.target.value)} /><small>{applicationPackage.communicationDraft.trim().length} 字 · 发送渠道和时机由你决定</small></section>

        <section className="application-section review-section"><div className="application-section-head"><div><span><CheckCircleIcon size={15} />逐项审核</span><h2>确认材料没有替你越界</h2></div><strong>{reviewed}/{applicationPackage.reviewItems.length}</strong></div><div className="application-checklist">{applicationPackage.reviewItems.map((item) => <label key={item.id} className={`${item.checked ? "checked" : ""} ${applicationRecorded ? "is-disabled" : ""}`.trim()}><input disabled={applicationRecorded} type="checkbox" checked={item.checked} onChange={() => dispatch({ type: "toggle-application-review", id: item.id })} /><span>{item.checked ? <CheckCircleIcon size={17} weight="fill" /> : <CheckCircleIcon size={17} />}</span><strong>{item.label}</strong></label>)}</div><button type="button" className="export-package" disabled={!reviewComplete} onClick={exportPackage}><DownloadSimpleIcon size={16} />导出完整申请决策包</button>{exported && <p className="export-feedback" role="status">{exported}</p>}</section>
      </main>

      <aside className="application-context">
        <section><p className="eyebrow">判断依据</p>{workspace.research.evidence.slice(0, 3).map((item) => <div className="context-item" key={item.id}><strong>{item.title}</strong><small>{item.impact}</small></div>)}</section>
        <section><p className="eyebrow">申请时重点强调</p>{applicationPackage.emphasis.map((item) => <div className="context-item" key={item}>{item}</div>)}</section>
        <section><p className="eyebrow"><ShieldWarningIcon size={14} />风险与未知</p>{applicationPackage.risks.map((item) => <div className="context-item risk" key={item}>{item}</div>)}</section>
        <section><p className="eyebrow">表达边界</p>{applicationPackage.boundaries.map((item) => <div className="context-item" key={item}>{item}</div>)}</section>
        <section><p className="eyebrow">需要向招聘方确认</p>{applicationPackage.questions.map((item) => <div className="context-item" key={item}>{item}</div>)}</section>
        <section className="application-decision"><p className="eyebrow">你的最终决定</p><h2>建议谨慎投入。<br />你怎么选？</h2><div className="decision-segments">{(["apply", "hold", "decline"] as const).map((item) => <button disabled={applicationRecorded} type="button" className={choice === item ? "selected" : ""} key={item} onClick={() => setChoice(item)}>{item === "apply" ? "申请" : item === "hold" ? "暂缓" : "放弃"}</button>)}</div><label><span>记录你的理由</span><textarea disabled={applicationRecorded} value={reason} placeholder="说明这次选择最重要的依据……" onChange={(event) => setReason(event.target.value)} /></label><button type="button" className="button-primary" disabled={applicationRecorded || reason.trim().length < 8} onClick={saveDecision}>保存我的决定</button>{workspace.decisionRecord && <div className="saved-decision"><CheckCircleIcon size={15} /><span><strong>已保存：{workspace.decisionRecord.choice === "apply" ? "申请" : workspace.decisionRecord.choice === "hold" ? "暂缓" : "放弃"}</strong><small>{workspace.decisionRecord.reason}</small></span></div>}{applicationRecorded ? <div className="application-recorded"><CheckCircleIcon size={15} weight="fill" />已记录本人投递</div> : workspace.decision === "apply" && choice === "apply" && <button type="button" className="record-application" disabled={!reviewComplete} onClick={() => dispatch({ type: "record-application" })}>确认我已亲自投递</button>}</section>
      </aside>
    </div>
  </div>;
}

function resumeText(workspace: OpportunityWorkspace) {
  const resume = workspace.applicationPackage!.resume;
  return `${resume.title}\n\n${resume.headline}\n\n职业摘要\n${resume.summary}\n\n重点经历\n${resume.experience}\n`;
}

function packageText(workspace: OpportunityWorkspace) {
  const applicationPackage = workspace.applicationPackage!;
  return `# ${applicationPackage.resume.title}\n\n## 当前建议\n谨慎投入\n\n## 用户决定\n${workspace.decisionRecord ? `${workspace.decisionRecord.choice}：${workspace.decisionRecord.reason}` : "尚未决定"}\n\n## 定制简历\n${resumeText(workspace)}\n## 初次沟通草稿\n${applicationPackage.communicationDraft}\n\n## 风险与未知\n${applicationPackage.risks.map((item) => `- ${item}`).join("\n")}\n\n## 表达边界\n${applicationPackage.boundaries.map((item) => `- ${item}`).join("\n")}\n\n## 待确认问题\n${applicationPackage.questions.map((item) => `- ${item}`).join("\n")}\n`;
}

function downloadText(fileName: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function safeName(value: string) { return value.replace(/[\\/:*?"<>|]/g, "-"); }
