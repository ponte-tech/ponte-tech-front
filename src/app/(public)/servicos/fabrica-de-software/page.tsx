import { Inter, Roboto_Mono } from "next/font/google";
import s from "../servico.module.css";
import { ContatoForm } from "../contato-form";

const inter = Inter({ subsets: ["latin"], weight: ["400","500","600","700"], variable: "--font-inter", display: "swap" });
const mono = Roboto_Mono({ subsets: ["latin"], weight: ["400","500"], variable: "--font-mono", display: "swap" });

const arrow = <span className={s.ico}><svg viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></span>;
const logos = ["Bentec","Multilog","Leroy","Banco BTG","APISUL","Comerc Energia","Matrix Energia"];
const wa = "https://wa.me/5511915788441";

export default function FabricaPage() {
  return (
    <div className={`${inter.variable} ${mono.variable} ${s.shell}`}>
      <div className={s.page}>

        <nav className={s.nav}>
          <a className={s.logo} href="/"><img className={s.logoImg} src="/assets/landing/logo-negative.svg" alt="Ponte Tech" width={74} height={28}/></a>
          <div className={s.navLinks}>
            <a href="/#quem">Quem Somos</a><a href="/#servicos">Servi&ccedil;os</a><a href="/#academy">Academy</a><a href="#contato">Contato</a>
          </div>
          <a className={`${s.btn} ${s.btnP} ${s.btnSm} ${s.navCta}`} href="#contato">Fale conosco</a>
        </nav>

        {/* HERO — O cliente entende em 5 segundos */}
        <section className={s.hero}>
          <div className={s.heroGlow}/>
          <span className={s.pill}><span className={s.star}>&#10022;</span> F&aacute;brica de Software</span>
          <h1>Criamos o sistema<br/>que sua empresa precisa.</h1>
          <p className={s.heroSub}>Voc&ecirc; explica o problema. A gente constr&oacute;i a solu&ccedil;&atilde;o. Pre&ccedil;o combinado, prazo cumprido.</p>
          <div className={s.heroCtas}>
            <a className={`${s.btn} ${s.btnP}`} href="#contato">Pedir or&ccedil;amento gr&aacute;tis {arrow}</a>
            <a className={`${s.btn} ${s.btnG}`} href={wa} target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>
          </div>
        </section>

        <div className={s.logos}>
          <p>Empresas que j&aacute; confiaram na gente</p>
          <div className={s.logosRow}>{logos.map(l=><span key={l}>{l}</span>)}</div>
        </div>

        <div className={s.metrics}>
          <div className={s.metric}><div className={s.metricVal}>200+</div><div className={s.metricLbl}>Sistemas entregues</div></div>
          <div className={s.metric}><div className={s.metricVal}>98%</div><div className={s.metricLbl}>No prazo</div></div>
          <div className={s.metric}><div className={s.metricVal}>12 anos</div><div className={s.metricLbl}>De mercado</div></div>
          <div className={s.metric}><div className={s.metricVal}>9.2</div><div className={s.metricLbl}>Nota dos clientes</div></div>
        </div>

        {/* O QUE FAZEMOS — linguagem simples */}
        <section className={`${s.sec} ${s.secC}`}>
          <span className={s.pill}><span className={s.star}>&#10022;</span> O que fazemos</span>
          <h2 className={s.secH}>Construímos qualquer tipo de sistema</h2>
          <p className={s.secP}>Aplicativos, plataformas web, sistemas internos, integrações. Se roda em computador ou celular, a gente faz.</p>

          <div className={s.bento}>
            <div className={`${s.bentoCard} ${s.bentoWide}`}>
              <div className={s.bentoIcon}>&#128187;</div>
              <h3>Sistemas web e aplicativos</h3>
              <p>Plataformas que seus clientes e sua equipe usam no dia a dia. Bonitas, rápidas e fáceis de usar.</p>
            </div>
            <div className={s.bentoCard}>
              <div className={s.bentoIcon}>&#128260;</div>
              <h3>Integrações</h3>
              <p>Conectamos seus sistemas entre si. ERP, CRM, pagamentos, WhatsApp — tudo conversando.</p>
            </div>
            <div className={s.bentoCard}>
              <div className={s.bentoIcon}>&#128202;</div>
              <h3>Pain&eacute;is e relat&oacute;rios</h3>
              <p>Dashboards para voc&ecirc; acompanhar os n&uacute;meros do neg&oacute;cio em tempo real.</p>
            </div>
            <div className={s.bentoCard}>
              <div className={s.bentoIcon}>&#128274;</div>
              <h3>Seguran&ccedil;a</h3>
              <p>Seus dados e os dados dos seus clientes protegidos. Seguimos todas as normas (LGPD).</p>
            </div>
            <div className={s.bentoCard}>
              <div className={s.bentoIcon}>&#128736;</div>
              <h3>Manuten&ccedil;&atilde;o</h3>
              <p>Depois de pronto, cuidamos do sistema. Corre&ccedil;&otilde;es, melhorias, suporte t&eacute;cnico.</p>
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section id="processo" className={`${s.sec} ${s.secC}`}>
          <span className={s.pill}><span className={s.star}>&#10022;</span> Como funciona</span>
          <h2 className={s.secH}>Simples e direto</h2>
          <p className={s.secP}>Sem burocracia. Voc&ecirc; sabe o que vai receber e quanto vai pagar antes de come&ccedil;ar.</p>

          <div className={s.steps}>
            <div className={s.step}><div className={s.stepNum}>01</div><h4>Voc&ecirc; explica</h4><p>Conta o que precisa. A gente entende o problema e prop&otilde;e uma solu&ccedil;&atilde;o.</p></div>
            <div className={s.step}><div className={s.stepNum}>02</div><h4>A gente or&ccedil;a</h4><p>Voc&ecirc; recebe o pre&ccedil;o e o prazo antes de decidir. Sem surpresas.</p></div>
            <div className={s.step}><div className={s.stepNum}>03</div><h4>Constru&iacute;mos</h4><p>Entregamos partes funcionais a cada 2 semanas. Voc&ecirc; acompanha tudo.</p></div>
            <div className={s.step}><div className={s.stepNum}>04</div><h4>Entregamos</h4><p>Sistema no ar, funcionando. E continuamos cuidando depois.</p></div>
          </div>
        </section>

        {/* POR QUE A PONTE TECH */}
        <section className={s.sec}>
          <div className={s.split}>
            <div className={s.splitText}>
              <span className={s.pill}><span className={s.star}>&#10022;</span> Por que a Ponte Tech</span>
              <h2 className={s.secH}>Sem enrola&ccedil;&atilde;o. Sem surpresas.</h2>
              <p className={s.secP}>Fazemos isso h&aacute; 12 anos. Sabemos entregar no prazo e no or&ccedil;amento.</p>
              <ul className={s.checkList}>
                <li className={s.checkItem}><span className={s.checkIcon}>&#10003;</span><div><strong>Pre&ccedil;o fechado</strong><span>Voc&ecirc; sabe quanto vai pagar antes de assinar. Sem hora extra surpresa.</span></div></li>
                <li className={s.checkItem}><span className={s.checkIcon}>&#10003;</span><div><strong>Prazo cumprido</strong><span>98% dos projetos entregues na data combinada.</span></div></li>
                <li className={s.checkItem}><span className={s.checkIcon}>&#10003;</span><div><strong>Voc&ecirc; acompanha tudo</strong><span>Acesso ao andamento do projeto em tempo real. Sem caixa preta.</span></div></li>
                <li className={s.checkItem}><span className={s.checkIcon}>&#10003;</span><div><strong>Equipe experiente</strong><span>Nossos programadores passam por avalia&ccedil;&atilde;o rigorosa antes de entrar no seu projeto.</span></div></li>
              </ul>
            </div>
            <div className={s.splitVisual}>
              <div className={s.statCard}><div className={s.statVal}>98%</div><div className={s.statLbl}>No prazo</div></div>
              <div className={s.statCard}><div className={s.statVal}>200+</div><div className={s.statLbl}>Sistemas</div></div>
              <div className={s.statCard}><div className={s.statVal}>0</div><div className={s.statLbl}>Surpresas</div></div>
              <div className={s.statCard}><div className={s.statVal}>9.2</div><div className={s.statLbl}>Nota</div></div>
            </div>
          </div>
        </section>

        {/* DEPOIMENTOS */}
        <section className={`${s.sec} ${s.secC}`}>
          <h2 className={s.secH}>O que nossos clientes falam</h2>
          <div className={s.quotes}>
            <div className={s.quote}>
              <div className={s.quoteWho}><div className={`${s.quoteAvatar} ${s.ga}`}>RM</div><div><div className={s.quoteName}>Rodrigo Menezes</div><div className={s.quoteRole}>CTO, Nexora</div></div></div>
              <p className={s.quoteText}>&ldquo;Entregaram nosso sistema em 90 dias. Tudo dentro do combinado, sem surpresas no valor.&rdquo;</p>
            </div>
            <div className={s.quote}>
              <div className={s.quoteWho}><div className={`${s.quoteAvatar} ${s.gb}`}>LF</div><div><div className={s.quoteName}>Lucas Fontes</div><div className={s.quoteRole}>Gerente, Lumena Digital</div></div></div>
              <p className={s.quoteText}>&ldquo;A cada duas semanas eu via o sistema evoluindo. Comunica&ccedil;&atilde;o clara e sem enrola&ccedil;&atilde;o.&rdquo;</p>
            </div>
            <div className={s.quote}>
              <div className={s.quoteWho}><div className={`${s.quoteAvatar} ${s.gc}`}>BC</div><div><div className={s.quoteName}>Bruno Cavalcanti</div><div className={s.quoteRole}>Eng. Manager, Prisma Tech</div></div></div>
              <p className={s.quoteText}>&ldquo;T&iacute;nhamos um projeto parado h&aacute; meses. A Ponte Tech resolveu em 8 semanas.&rdquo;</p>
            </div>
          </div>
        </section>

        {/* FORM */}
        <ContatoForm />

        {/* CTA */}
        <section className={s.cta}>
          <div className={s.ctaBox}>
            <h2>Precisa de um sistema?</h2>
            <p>Conta o que voc&ecirc; precisa. A gente responde em at&eacute; 48h com pre&ccedil;o e prazo.</p>
            <div className={s.ctaBtns}>
              <a className={`${s.btn} ${s.btnP}`} href="#contato">Pedir or&ccedil;amento gr&aacute;tis {arrow}</a>
              <a className={`${s.btn} ${s.btnG}`} href={wa} target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>
            </div>
          </div>
        </section>

        <footer className={s.footer}>
          <div className={s.footerGrid}>
            <div className={s.footerBrand}>
              <a className={s.logo} href="/"><img className={s.logoImg} src="/assets/landing/logo-negative.svg" alt="Ponte Tech" width={74} height={28}/></a>
              <p className={s.brandBlurb}>Tecnologia de alto n&iacute;vel para empresas que n&atilde;o aceitam menos.</p>
              <div className={s.socials}>
                <a className={s.social} href="https://www.linkedin.com/company/pontetech" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><img src="/assets/landing/linkedin.svg" alt=""/></a>
                <a className={s.social} href="https://www.instagram.com/pontetechoficial/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><img src="/assets/landing/instagram.svg" alt=""/></a>
                <a className={s.social} href="https://github.com/ponte-tech" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><img src="/assets/landing/github.svg" alt=""/></a>
              </div>
            </div>
            <div><h4>Empresa</h4><ul><li><a href="/#quem">Quem Somos</a></li><li><a href="/#servicos">Servi&ccedil;os</a></li><li><a href="/#academy">Academy</a></li><li><a href="#contato">Contato</a></li></ul></div>
            <div><h4>Servi&ccedil;os</h4><ul><li><a href="/servicos/fabrica-de-software">F&aacute;brica de Software</a></li><li><a href="/servicos/outsourcing">Outsourcing</a></li><li><a href="/servicos/saas">SaaS</a></li></ul></div>
            <div><h4>Legal</h4><ul><li><a href="#">Privacidade</a></li><li><a href="#">Termos</a></li></ul></div>
          </div>
          <div className={s.footerBottom}><span>&copy; 2025 Ponte Tech. Todos os direitos reservados.</span><span>Seus dados tratados com seguran&ccedil;a.</span></div>
        </footer>

        <a className={s.waFab} href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
          <svg viewBox="0 0 48 48" fill="none"><path d="M24 4C12.954 4 4 12.954 4 24c0 3.535.922 6.855 2.535 9.738L4 44l10.572-2.47A19.92 19.92 0 0024 44c11.046 0 20-8.954 20-20S35.046 4 24 4zm0 36.5a16.42 16.42 0 01-8.387-2.302l-.602-.357-6.236 1.458 1.487-6.09-.39-.622A16.4 16.4 0 017.5 24c0-9.113 7.387-16.5 16.5-16.5S40.5 14.887 40.5 24 33.113 40.5 24 40.5zm9.038-12.35c-.495-.248-2.93-1.446-3.385-1.611-.455-.165-.786-.248-1.117.248-.33.495-1.283 1.611-1.573 1.942-.29.33-.578.372-1.073.124-.495-.248-2.09-.77-3.982-2.457-1.473-1.312-2.467-2.934-2.757-3.43-.29-.495-.03-.763.218-1.01.224-.223.495-.578.743-.868.248-.29.33-.495.495-.826.165-.33.083-.62-.042-.868-.124-.248-1.117-2.693-1.53-3.688-.403-.97-.813-.838-1.117-.853-.29-.014-.62-.017-.95-.017-.33 0-.868.124-1.323.62-.455.495-1.737 1.694-1.737 4.134 0 2.44 1.778 4.797 2.027 5.127.248.33 3.502 5.348 8.487 7.5 1.186.511 2.112.817 2.834 1.046 1.19.379 2.274.325 3.13.197.955-.143 2.93-1.198 3.343-2.355.413-1.157.413-2.149.29-2.355-.124-.207-.455-.33-.95-.578z" fill="currentColor"/></svg>
        </a>
      </div>
    </div>
  );
}
