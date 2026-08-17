import { ArrowRightIcon, BrainIcon, FileTextIcon, PaperPlaneTiltIcon, SparkleIcon, XIcon } from "@phosphor-icons/react";
import type { AgentMessage } from "../../domain/model";
import { Button } from "../../components/Button";

export function AgentContextEntry({ label, detail, context, onOpen }: { label: string; detail: string; context: string; onOpen: () => void }) {
  return <section className="agent-context-entry" aria-label="职业 Agent 上下文入口">
    <span className="agent-context-mark"><FileTextIcon size={17} /></span>
    <div>
      <small>这份档案的注脚</small>
      <strong>{label}</strong>
      <p>{detail}</p>
    </div>
      <Button tone="plain" type="button" onClick={onOpen} aria-label={`打开 Agent 工作台：${label}，${context}`}>
      <BrainIcon size={16} />
      <span>打开工作台</span>
      <ArrowRightIcon size={14} />
    </Button>
  </section>;
}

export function AgentWorkspace({ context, messages, draft, onDraft, onSend, onClose }: { context: string; messages: AgentMessage[]; draft: string; onDraft: (value: string) => void; onSend: () => void; onClose: () => void }) {
  return <div className="agent-layer">
    <Button type="button" className="agent-scrim" aria-label="关闭 Agent 工作台" onClick={onClose} />
    <aside className="agent-workbench" role="dialog" aria-modal="true" aria-label="职业 Agent 工作台">
      <header className="agent-head">
        <div>
          <span className="agent-icon"><BrainIcon size={17} /></span>
          <span><small>职业档案注脚</small><strong>{context}</strong></span>
        </div>
        <Button type="button" className="icon-button" aria-label="关闭 Agent 工作台" onClick={onClose}><XIcon size={19} /></Button>
      </header>

      <div className="agent-workbench-body">
        <section className="agent-transcript" aria-label="对话记录">
          <div className="agent-section-title"><span>工作记录</span><small>{messages.length} 条</small></div>
          <div className="agent-messages">{messages.map((message, index) => <article key={`${message.time}-${index}`} className={`agent-message ${message.from}`}><span>{message.from === "agent" ? <SparkleIcon size={13} /> : "你"}</span><p>{message.text}</p><small>{message.time}</small></article>)}</div>
        </section>

        <aside className="agent-context-panel">
          <div className="agent-sees"><span>本次可读取</span><strong>职业事实</strong><strong>机会证据</strong><strong>面试记录</strong></div>
          <div className="agent-suggestions"><span>从这里继续</span><Button type="button" onClick={() => onDraft("为什么是这个建议？")}>解释当前建议</Button><Button type="button" onClick={() => onDraft("哪些证据还不够？")}>检查证据缺口</Button><Button type="button" onClick={() => onDraft("帮我准备面试")}>准备下一次沟通</Button></div>
        </aside>
      </div>

      <div className="agent-composer">
        <label htmlFor="agent-message">补一条问题或判断</label>
        <textarea id="agent-message" autoFocus value={draft} placeholder="围绕当前档案继续……" onChange={(event) => onDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); onSend(); } }} />
      <Button tone="icon" type="button" aria-label="发送消息" onClick={onSend}><PaperPlaneTiltIcon size={17} /></Button>
        <small>Enter 发送 · Shift + Enter 换行</small>
      </div>
    </aside>
  </div>;
}
