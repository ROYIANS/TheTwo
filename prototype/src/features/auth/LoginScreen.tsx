import { ArrowRightIcon } from "@phosphor-icons/react";

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return <main className="login-screen"><div className="login-wordmark">择途</div><section className="login-panel" aria-labelledby="login-title"><div className="login-intro"><p className="eyebrow">只属于你的职业空间</p><h1 id="login-title">从你真正<br /><em>做过的事</em>开始。</h1><p>你的经历、正在看的机会、还没想清楚的问题，都可以放在这里。</p></div><div className="login-enter"><p>这是一个本地演示空间</p><strong>先带点东西进来</strong><button type="button" className="button-primary" onClick={onLogin}>进入我的空间 <ArrowRightIcon size={15} /></button><small>不会连接外部服务，也不会替你发送或投递。</small></div></section><div className="login-foot"><span>你说了算</span><span>AI 帮你整理，不帮你决定</span></div></main>;
}
