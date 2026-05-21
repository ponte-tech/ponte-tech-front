import { Inter, Roboto_Mono } from "next/font/google";
import s from "../servico.module.css";
import { ContatoForm } from "../contato-form";

const inter = Inter({ subsets: ["latin"], weight: ["400","500","600","700"], variable: "--font-inter", display: "swap" });
const mono = Roboto_Mono({ subsets: ["latin"], weight: ["400","500"], variable: "--font-mono", display: "swap" });

const arrow = <span className={s.ico}><svg viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></span>;
const wa = "https://wa.me/5511915788441";

export default function SaasPage() {
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

        {/* HERO */}
        <section className={s.hero}>
          <div className={s.heroGlow}/>
          <span className={s.pill}><span className={s.star}>&#10022;</span> Nossos Produtos</span>
          <h1>Sistemas prontos<br/>para usar.</h1>
          <p className={s.heroSub}>Al&eacute;m de criar sistemas sob medida, desenvolvemos produtos pr&oacute;prios. A mesma qualidade, prontos para voc&ecirc; come&ccedil;ar hoje.</p>
          <div className={s.heroCtas}>
            <a className={`${s.btn} ${s.btnP}`} href="#produtos">Ver produtos {arrow}</a>
            <a className={`${s.btn} ${s.btnG}`} href="#contato">Agendar demonstra&ccedil;&atilde;o</a>
          </div>
        </section>

        <div className={s.metrics}>
          <div className={s.metric}><div className={s.metricVal}>3</div><div className={s.metricLbl}>Produtos no mercado</div></div>
          <div className={s.metric}><div className={s.metricVal}>99.9%</div><div className={s.metricLbl}>No ar, sempre</div></div>
          <div className={s.metric}><div className={s.metricVal}>12 anos</div><div className={s.metricLbl}>De experi&ecirc;ncia</div></div>
          <div className={s.metric}><div className={s.metricVal}>200+</div><div className={s.metricLbl}>Projetos entregues</div></div>
        </div>

        {/* POR QUE */}
        <section className={`${s.sec} ${s.secC}`}>
          <span className={s.pill}><span className={s.star}>&#10022;</span> Diferencial</span>
          <h2 className={s.secH}>Feitos por quem entende de software</h2>
          <p className={s.secP}>Nossos produtos s&atilde;o constru&iacute;dos pela mesma equipe que cria sistemas para grandes empresas. Isso significa mais qualidade, seguran&ccedil;a e estabilidade.</p>

          <div className={s.bento}>
            <div className={s.bentoCard}>
              <div className={s.bentoIcon}>&#128170;</div>
              <h3>Qualidade profissional</h3>
              <p>Mesma engenharia que usamos pra BTG, Leroy e Multilog. N&atilde;o &eacute; sistema amador.</p>
            </div>
            <div className={s.bentoCard}>
              <div className={s.bentoIcon}>&#128640;</div>
              <h3>Sempre melhorando</h3>
              <p>Atualizações toda semana. Novas funcionalidades baseadas no que os clientes pedem.</p>
            </div>
            <div className={s.bentoCard}>
              <div className={s.bentoIcon}>&#128296;</div>
              <h3>Suporte humano</h3>
              <p>Quando voc&ecirc; precisa de ajuda, fala com quem construiu o sistema. Sem robôs.</p>
            </div>
          </div>
        </section>

        {/* PRODUTOS */}
        <section id="produtos" className={`${s.sec} ${s.secC}`}>
          <span className={s.pill}><span className={s.star}>&#10022;</span> Produtos</span>
          <h2 className={s.secH}>3 plataformas para 3 mercados</h2>
          <p className={s.secP}>Cada uma resolve um problema real, de forma simples e eficiente.</p>

          <div className={s.products}>
            <article className={s.product}>
              <span className={`${s.pill} ${s.pillMuted}`}>Cl&iacute;nicas</span>
              <h3>Dentrixa</h3>
              <p>Sistema completo para cl&iacute;nicas odontol&oacute;gicas. Agenda com confirma&ccedil;&atilde;o autom&aacute;tica pelo WhatsApp, ficha do paciente digital, controle financeiro. Menos faltas, mais organiza&ccedil;&atilde;o.</p>
              <div className={s.tags}>
                {["Agenda","WhatsApp","Financeiro","Prontu\u00e1rio"].map(t=><span key={t} className={`${s.pill} ${s.pillMuted}`}>{t}</span>)}
              </div>
              <a className={`${s.btn} ${s.btnP}`} href="https://www.dentrixa.com/" target="_blank" rel="noopener noreferrer">Conhecer {arrow}</a>
            </article>

            <article className={`${s.product} ${s.productFeat}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/landing/Logo-magus.svg" alt="MAGUS" width={120} height={28} style={{marginBottom:4}}/>
              <span className={`${s.pill} ${s.pillMuted}`}>Vendas</span>
              <h3>MAGUS</h3>
              <p>Intelig&ecirc;ncia artificial que atende seus potenciais clientes automaticamente. Responde em 30 segundos, 24 horas por dia, e s&oacute; passa pro vendedor quem realmente quer comprar.</p>
              <div className={s.tags}>
                {["IA","WhatsApp","CRM","24/7"].map(t=><span key={t} className={`${s.pill} ${s.pillMuted}`}>{t}</span>)}
              </div>
              <a className={`${s.btn} ${s.btnP}`} href="https://www.magus-app.com/" target="_blank" rel="noopener noreferrer">Conhecer {arrow}</a>
            </article>

            <article className={s.product}>
              <span className={`${s.pill} ${s.pillMuted}`}>Im&oacute;veis</span>
              <h3>Cretor</h3>
              <p>Plataforma para corretores de im&oacute;veis. Organiza todos os seus contatos, cria an&uacute;ncios com intelig&ecirc;ncia artificial e mostra quantos neg&oacute;cios voc&ecirc; tem em andamento.</p>
              <div className={s.tags}>
                {["CRM","IA","An\u00fancios","Funil"].map(t=><span key={t} className={`${s.pill} ${s.pillMuted}`}>{t}</span>)}
              </div>
              <a className={`${s.btn} ${s.btnP}`} href="https://danielkrammes.com/" target="_blank" rel="noopener noreferrer">Conhecer {arrow}</a>
            </article>
          </div>
        </section>

        {/* GARANTIAS */}
        <section className={s.sec}>
          <div className={`${s.split} ${s.splitReverse}`}>
            <div className={s.splitText}>
              <span className={s.pill}><span className={s.star}>&#10022;</span> Garantias</span>
              <h2 className={s.secH}>Pode confiar.</h2>
              <p className={s.secP}>12 anos de mercado e 200+ projetos entregues est&atilde;o por tr&aacute;s de cada produto.</p>
              <ul className={s.checkList}>
                <li className={s.checkItem}><span className={s.checkIcon}>&#10003;</span><div><strong>Sempre no ar</strong><span>99.9% de disponibilidade. Se cair, a gente resolve na hora.</span></div></li>
                <li className={s.checkItem}><span className={s.checkIcon}>&#10003;</span><div><strong>Seus dados protegidos</strong><span>Seguimos todas as normas de privacidade (LGPD) desde o primeiro dia.</span></div></li>
                <li className={s.checkItem}><span className={s.checkIcon}>&#10003;</span><div><strong>Suporte de gente</strong><span>Fale direto com quem fez o sistema. Sem fila, sem script.</span></div></li>
                <li className={s.checkItem}><span className={s.checkIcon}>&#10003;</span><div><strong>Conecta com tudo</strong><span>Integra com as ferramentas que voc&ecirc; j&aacute; usa.</span></div></li>
              </ul>
            </div>
            <div className={s.splitVisual}>
              <div className={s.statCard}><div className={s.statVal}>3</div><div className={s.statLbl}>Produtos</div></div>
              <div className={s.statCard}><div className={s.statVal}>99.9%</div><div className={s.statLbl}>No ar</div></div>
              <div className={s.statCard}><div className={s.statVal}>200+</div><div className={s.statLbl}>Projetos</div></div>
              <div className={s.statCard}><div className={s.statVal}>12a</div><div className={s.statLbl}>Mercado</div></div>
            </div>
          </div>
        </section>

        {/* DEPOIMENTOS */}
        <section className={`${s.sec} ${s.secC}`}>
          <h2 className={s.secH}>O que nossos clientes falam</h2>
          <div className={s.quotes}>
            <div className={s.quote}>
              <div className={s.quoteWho}><div className={`${s.quoteAvatar} ${s.ga}`}>FA</div><div><div className={s.quoteName}>Felipe Assun&ccedil;&atilde;o</div><div className={s.quoteRole}>CEO, Orbitech</div></div></div>
              <p className={s.quoteText}>&ldquo;Usamos o MAGUS e nossas vendas subiram 40% em 3 meses. Produto excelente, suporte r&aacute;pido.&rdquo;</p>
            </div>
            <div className={s.quote}>
              <div className={s.quoteWho}><div className={`${s.quoteAvatar} ${s.gb}`}>RM</div><div><div className={s.quoteName}>Rodrigo Menezes</div><div className={s.quoteRole}>CTO, Nexora</div></div></div>
              <p className={s.quoteText}>&ldquo;D&aacute; pra sentir que foi feito por gente que entende do assunto. Qualidade muito acima da m&eacute;dia.&rdquo;</p>
            </div>
            <div className={s.quote}>
              <div className={s.quoteWho}><div className={`${s.quoteAvatar} ${s.gc}`}>CD</div><div><div className={s.quoteName}>Camila Duarte</div><div className={s.quoteRole}>Head of Product, Stratix</div></div></div>
              <p className={s.quoteText}>&ldquo;Tive um problema e resolvi em 15 minutos falando direto com o programador. Em outros sistemas levaria dias.&rdquo;</p>
            </div>
          </div>
        </section>

        {/* FORM */}
        <ContatoForm />

        {/* CTA */}
        <section className={s.cta}>
          <div className={s.ctaBox}>
            <h2>Quer experimentar?</h2>
            <p>Demonstra&ccedil;&atilde;o gratuita, sem cart&atilde;o, sem compromisso.</p>
            <div className={s.ctaBtns}>
              <a className={`${s.btn} ${s.btnP}`} href="#contato">Agendar demonstra&ccedil;&atilde;o {arrow}</a>
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
