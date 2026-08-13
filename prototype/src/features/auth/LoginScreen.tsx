import { ArrowRightIcon } from "@phosphor-icons/react";

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return <main className="login-screen"><div className="login-wordmark">择途</div><section className="login-panel" aria-labelledby="login-title"><div className="login-intro"><p className="eyebrow">一个只属于你的职业现场</p><h1 id="login-title">从你真正<br /><em>做过的事</em>开始。</h1><p>把经历、机会和选择放在同一条可以理解、可以修正的时间线上。</p></div><div className="login-enter"><p>这是一个本地演示空间</p><strong>第一次使用，从一份材料开始</strong><button type="button" className="button-primary" onClick={onLogin}>进入我的空间 <ArrowRightIcon size={15} /></button><small>不会连接外部服务，也不会替你发送或投递。</small></div></section><div className="login-foot"><span>用户掌握最终解释权</span><span>AI 负责整理、追问和提醒</span></div></main>;
}
