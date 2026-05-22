import { Inter, Roboto_Mono } from "next/font/google";
import s from "../servico.module.css";
import landing from "../../landing.module.css";
import { ContatoForm } from "../contato-form";
import { Pill } from "../../_shared/pill";
import { ChevronRight, Star } from "../../_shared/icons";
import { WhatsappFab } from "../../_shared/whatsapp-fab";
import { Reveal } from "../../_shared/reveal";
import { CountUp } from "../../_shared/count-up";
import { IconClock, IconDollar, IconTarget, IconUsers, IconCap, IconUser, IconChartUp } from "../../_shared/bento-icons";
import { MobileNav } from "../mobile-nav";

const inter = Inter({ subsets: ["latin"], weight: ["400","500","600","700"], variable: "--font-inter", display: "swap" });
const mono = Roboto_Mono({ subsets: ["latin"], weight: ["400","500"], variable: "--font-mono", display: "swap" });

import { empresas } from "../../_shared/data";
const wa = "https://wa.me/5511915788441";

export default function OutsourcingPage() {
  return (
    <div className={`${inter.variable} ${mono.variable} ${s.shell}`}>
      <div className={s.page}>

        <nav className={s.nav}>
          <a className={s.logo} href="/"><img className={s.logoImg} src="/assets/landing/logo-negative.svg" alt="Ponte Tech" width={74} height={28}/></a>
          <div className={s.navLinks}>
            <a href="/#quem">Quem Somos</a><a href="/#servicos">Servi&ccedil;os</a><a href="/#academy">Academy</a><a href="#contato-form">Contato</a>
          </div>
          <div className={s.navCta} style={{ display: "flex", gap: "12px" }}>
            <a className={`${landing.btn} ${landing.btnGhost} ${landing.btnSm} ${s.hideOnMobile}`} href="/login">&Aacute;rea logada</a>
            <a className={`${landing.btn} ${landing.btnPrimary} ${landing.btnSm} ${s.hideOnMobile}`} href="#contato-form">Fale conosco</a>
          </div>
          <MobileNav />
        </nav>

        {/* HERO — dor: contratar tecnologia é demorado e arriscado */}
        <section className={s.hero}>
          <div className={s.heroGlow}/>
          <Pill><Star />Aloca&ccedil;&atilde;o de Tecnologia</Pill>
          <h1>O profissional certo<br/>para o seu time.</h1>
          <p className={s.heroSub}>Contratar tecnologia &eacute; demorado, caro e arriscado. A gente encontra o profissional que se encaixa na cultura da sua empresa e entrega resultado desde o primeiro dia.</p>
          <div className={s.heroCtas}>
            <a className={`${landing.btn} ${landing.btnPrimary}`} href="#contato-form">Encontrar meu time<ChevronRight /></a>
            <a className={`${landing.btn} ${landing.btnGhost}`} href={wa} target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>
          </div>
        </section>

        <div className={s.logos}>
          <p>Empresas que j&aacute; montaram times com a gente</p>
          <div className={s.logosMarquee}>
            <div className={s.logosTrack}>{[...empresas, ...empresas].map((e, i)=>(
              <span key={`${e.name}-${i}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.logo} alt={e.name} className={s.brandLogo}/>
                {e.name}
              </span>
            ))}</div>
          </div>
        </div>

        <div className={s.metrics}>
          <div className={s.metric}><div className={s.metricVal}><CountUp value="3 dias"/></div><div className={s.metricLbl}>Para apresentar candidatos</div></div>
          <div className={s.metric}><div className={s.metricVal}><CountUp value="95%"/></div><div className={s.metricLbl}>Permanecem no projeto</div></div>
          <div className={s.metric}><div className={s.metricVal}><CountUp value="12 anos"/></div><div className={s.metricLbl}>Recrutando para tecnologia</div></div>
          <div className={s.metric}><div className={s.metricVal}><CountUp value="R$0"/></div><div className={s.metricLbl}>Taxa de entrada</div></div>
        </div>

        {/* DOR DO CLIENTE — por que é tão difícil contratar */}
        <section className={`${s.sec} ${s.secC}`}>
          <Pill><Star />O problema</Pill>
          <h2 className={s.secH}>Contratar tecnologia est&aacute; cada vez mais dif&iacute;cil</h2>
          <p className={s.secP}>Vagas que ficam meses abertas. Profissionais que passam na entrevista mas n&atilde;o performam. Gente que sai em 3 meses. Voc&ecirc; j&aacute; viveu isso?</p>

          <div className={s.bento}>
            <Reveal className={s.bentoCard}>
              <div className={s.bentoIcon}><IconClock /></div>
              <h3>Meses para contratar, semanas para perder</h3>
              <p>O mercado de tecnologia tem uma das maiores taxas de turnover. Voc&ecirc; gasta tempo e dinheiro recrutando, treinando, e quando a pessoa est&aacute; pronta... pede demiss&atilde;o.</p>
            </Reveal>
            <Reveal className={s.bentoCard} delay={80}>
              <div className={s.bentoIcon}><IconDollar /></div>
              <h3>Custo alto de erro</h3>
              <p>Uma contrata&ccedil;&atilde;o errada custa at&eacute; 3x o sal&aacute;rio anual. Al&eacute;m do financeiro, trava o projeto inteiro.</p>
            </Reveal>
            <Reveal className={s.bentoCard} delay={160}>
              <div className={s.bentoIcon}><IconTarget /></div>
              <h3>Curr&iacute;culo n&atilde;o conta a hist&oacute;ria toda</h3>
              <p>O profissional pode ser tecnicamente bom mas n&atilde;o se encaixar na sua cultura. E isso s&oacute; aparece depois.</p>
            </Reveal>
          </div>
        </section>

        {/* A SOLUÇÃO — hunting com fit cultural */}
        <section className={`${s.sec} ${s.secC}`}>
          <Pill><Star />Nossa abordagem</Pill>
          <h2 className={s.secH}>Hunting com base na cultura da sua empresa</h2>
          <p className={s.secP}>N&atilde;o mandamos curr&iacute;culos. Entendemos quem voc&ecirc; &eacute;, como seu time trabalha, e encontramos profissionais que se encaixam de verdade.</p>

          <div className={s.bento}>
            <Reveal className={s.bentoCard}>
              <div className={s.bentoIcon}><IconUsers /></div>
              <h3>Fit cultural primeiro</h3>
              <p>Antes de avaliar c&oacute;digo, entendemos sua cultura, seus valores e o jeito do seu time trabalhar. S&oacute; apresentamos quem faz sentido.</p>
            </Reveal>
            <Reveal className={s.bentoCard} delay={80}>
              <div className={s.bentoIcon}><IconCap /></div>
              <h3>Avalia&ccedil;&atilde;o t&eacute;cnica real</h3>
              <p>Todo profissional passa por desafios pr&aacute;ticos avaliados pelo nosso Ponte Academy. N&atilde;o confiamos em autodeclara&ccedil;&atilde;o.</p>
            </Reveal>
            <Reveal className={s.bentoCard} delay={160}>
              <div className={s.bentoIcon}><IconUser /></div>
              <h3>Profissional individual</h3>
              <p>Precisa de um perfil espec&iacute;fico? Alocamos um especialista que se integra ao seu time existente como se fosse da casa.</p>
            </Reveal>
            <Reveal className={`${s.bentoCard} ${s.bentoWide}`} delay={240}>
              <div className={s.bentoIcon}><IconUsers /></div>
              <h3>Squads completos</h3>
              <p>Precisa de um time inteiro? Montamos equipes completas de tecnologia &mdash; do l&iacute;der t&eacute;cnico ao QA &mdash; dedicadas exclusivamente ao seu projeto. Gerenciados por n&oacute;s, integrados a voc&ecirc;.</p>
            </Reveal>
            <Reveal className={s.bentoCard} delay={320}>
              <div className={s.bentoIcon}><IconChartUp /></div>
              <h3>Escala quando precisar</h3>
              <p>Demanda urgente? Montamos time em at&eacute; 2 semanas. Diminuiu? Reduza sem multa, sem burocracia.</p>
            </Reveal>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section id="processo" className={`${s.sec} ${s.secC}`}>
          <Pill><Star />Como funciona</Pill>
          <h2 className={s.secH}>Do briefing ao primeiro resultado em dias</h2>
          <p className={s.secP}>Enquanto outras empresas levam semanas mandando curr&iacute;culos, a gente entrega profissionais validados e alinhados com seu time.</p>

          <div className={s.steps}>
            <div className={s.step}><div className={s.stepNum}>01</div><h4>Entendemos sua empresa</h4><p>Cultura, valores, como o time trabalha, que perfil faz sentido. N&atilde;o &eacute; s&oacute; uma lista de requisitos t&eacute;cnicos.</p></div>
            <div className={s.step}><div className={s.stepNum}>02</div><h4>Hunting personalizado</h4><p>Buscamos e avaliamos profissionais com fit t&eacute;cnico e cultural. Em 3 dias, voc&ecirc; tem candidatos na mesa.</p></div>
            <div className={s.step}><div className={s.stepNum}>03</div><h4>Voc&ecirc; escolhe</h4><p>Entrevista, conhece, decide. S&oacute; entra no time quem voc&ecirc; aprovar.</p></div>
            <div className={s.step}><div className={s.stepNum}>04</div><h4>Acompanhamento cont&iacute;nuo</h4><p>Checkpoints regulares, feedback estruturado. Se algo n&atilde;o funcionar, trocamos sem custo.</p></div>
          </div>
        </section>

        {/* POR QUE — diferenciais que resolvem a dor */}
        <section className={s.sec}>
          <div className={s.split}>
            <div className={s.splitText}>
              <Pill><Star />Por que a Ponte Tech</Pill>
              <h2 className={s.secH}>Contrata&ccedil;&atilde;o de tecnologia sem dor de cabe&ccedil;a.</h2>
              <p className={s.secP}>Resolvemos os problemas que voc&ecirc; j&aacute; teve com outsourcing: gente que n&atilde;o se encaixa, rotatividade alta e surpresas no valor.</p>
              <ul className={s.checkList}>
                <li className={s.checkItem}><span className={s.checkIcon}>&#10003;</span><div><strong>Hunting com fit cultural</strong><span>Avaliamos compet&ecirc;ncia t&eacute;cnica e alinhamento com sua cultura. O profissional chega pronto para fazer parte do time.</span></div></li>
                <li className={s.checkItem}><span className={s.checkIcon}>&#10003;</span><div><strong>95% ficam no projeto</strong><span>Quando a escolha &eacute; certa desde o in&iacute;cio, as pessoas ficam. Sem rotatividade, sem retrabalho.</span></div></li>
                <li className={s.checkItem}><span className={s.checkIcon}>&#10003;</span><div><strong>Troca garantida</strong><span>Se por qualquer motivo n&atilde;o funcionar, trocamos sem custo extra e sem burocracia.</span></div></li>
                <li className={s.checkItem}><span className={s.checkIcon}>&#10003;</span><div><strong>Valor mensal fixo, sem surpresas</strong><span>Sem taxa de entrada, sem multa de sa&iacute;da, sem reajuste escondido. Voc&ecirc; sabe exatamente quanto vai pagar.</span></div></li>
              </ul>
            </div>
            <div className={s.splitVisual}>
              <div className={s.statCard}><div className={s.statVal}><CountUp value="3 dias"/></div><div className={s.statLbl}>Primeiro candidato</div></div>
              <div className={s.statCard}><div className={s.statVal}><CountUp value="95%"/></div><div className={s.statLbl}>Permanecem</div></div>
              <div className={s.statCard}><div className={s.statVal}><CountUp value="R$0"/></div><div className={s.statLbl}>Taxa de entrada</div></div>
              <div className={s.statCard}><div className={s.statVal}><CountUp value="R$0"/></div><div className={s.statLbl}>Multa de sa&iacute;da</div></div>
            </div>
          </div>
        </section>

        {/* DEPOIMENTOS */}
        <section className={`${s.sec} ${s.secC}`}>
          <h2 className={s.secH}>Quem contratou com a gente, recomenda</h2>
          <div className={s.quotes}>
            <Reveal className={s.quote}>
              <div className={s.quoteWho}><div className={`${s.quoteAvatar} ${s.ga}`}><img src="/assets/camila-duarte.png" alt="" aria-hidden="true"/></div><div><div className={s.quoteName}>Camila Duarte</div><div className={s.quoteRole}>Head of Product, Stratix</div></div></div>
              <p className={s.quoteText}>&ldquo;Colocaram dois profissionais no nosso time de plataforma. A diferen&ccedil;a foi imediata &mdash; se integraram r&aacute;pido, entenderam nossa cultura e come&ccedil;aram a entregar resultado desde a primeira semana.&rdquo;</p>
            </Reveal>
            <Reveal className={s.quote} delay={100}>
              <div className={s.quoteWho}><div className={`${s.quoteAvatar} ${s.gb}`}><img src="/assets/thiago-kato.png" alt="" aria-hidden="true"/></div><div><div className={s.quoteName}>Thiago Kato</div><div className={s.quoteRole}>Diretor de TI, Vaultex Group</div></div></div>
              <p className={s.quoteText}>&ldquo;J&aacute; tentamos 3 empresas de outsourcing. Com as outras, os profissionais chegavam e a gente precisava ensinar tudo do zero. Com a Ponte Tech, chegam prontos e alinhados com o nosso jeito de trabalhar.&rdquo;</p>
            </Reveal>
            <Reveal className={s.quote} delay={200}>
              <div className={s.quoteWho}><div className={`${s.quoteAvatar} ${s.gc}`}><img src="/assets/felipe-assuncao.png" alt="" aria-hidden="true"/></div><div><div className={s.quoteName}>Felipe Assun&ccedil;&atilde;o</div><div className={s.quoteRole}>CEO, Orbitech</div></div></div>
              <p className={s.quoteText}>&ldquo;Precisamos montar um time de tecnologia do zero em 3 semanas para um projeto cr&iacute;tico. A Ponte Tech entregou a equipe completa no prazo, j&aacute; integrada e produzindo.&rdquo;</p>
            </Reveal>
          </div>
        </section>

        {/* FORM */}
        <ContatoForm origem="lp-outsourcing" />

        {/* CTA */}
        <section className={s.cta}>
          <div className={s.ctaBox}>
            <h2>Precisa montar seu time de tecnologia?</h2>
            <p>Conta o perfil que precisa. Em 3 dias apresentamos candidatos com fit t&eacute;cnico e cultural.</p>
            <div className={s.ctaBtns}>
              <a className={`${landing.btn} ${landing.btnPrimary}`} href="#contato-form">Encontrar meu time<ChevronRight /></a>
              <a className={`${landing.btn} ${landing.btnGhost}`} href={wa} target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>
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
            <div><h4>Empresa</h4><ul><li><a href="/#quem">Quem Somos</a></li><li><a href="/#servicos">Servi&ccedil;os</a></li><li><a href="/#academy">Academy</a></li><li><a href="#contato-form">Contato</a></li></ul></div>
            <div><h4>Servi&ccedil;os</h4><ul><li><a href="/servicos/fabrica-de-software">F&aacute;brica de Software</a></li><li><a href="/servicos/outsourcing">Outsourcing</a></li><li><a href="/servicos/saas">SaaS</a></li></ul></div>
            <div><h4>Legal</h4><ul><li><a href="#">Privacidade</a></li><li><a href="#">Termos</a></li></ul></div>
          </div>
          <div className={s.footerBottom}><span>&copy; 2025 Ponte Tech. Todos os direitos reservados.</span><span>Seus dados tratados com seguran&ccedil;a.</span></div>
        </footer>
      </div>
      <WhatsappFab />
    </div>
  );
}
