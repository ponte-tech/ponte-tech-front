import { Inter, Roboto_Mono } from "next/font/google";
import s from "../servico.module.css";
import landing from "../../landing.module.css";
import { ContatoForm } from "../contato-form";
import { Pill } from "../../_shared/pill";
import { ChevronRight, Star } from "../../_shared/icons";
import { WhatsappFab } from "../../_shared/whatsapp-fab";
import { Reveal } from "../../_shared/reveal";
import { CountUp } from "../../_shared/count-up";
import { IconShieldCheck, IconRocket, IconHeadset } from "../../_shared/bento-icons";
import { MobileNav } from "../mobile-nav";

const inter = Inter({ subsets: ["latin"], weight: ["400","500","600","700"], variable: "--font-inter", display: "swap" });
const mono = Roboto_Mono({ subsets: ["latin"], weight: ["400","500"], variable: "--font-mono", display: "swap" });

const wa = "https://wa.me/5511915788441";

export default function SaasPage() {
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

        {/* HERO */}
        <section className={s.hero}>
          <div className={s.heroGlow}/>
          <Pill><Star />Nossos Produtos</Pill>
          <h1>Sistemas prontos<br/>para usar.</h1>
          <p className={s.heroSub}>Al&eacute;m de criar sistemas sob medida, desenvolvemos produtos pr&oacute;prios. A mesma qualidade, prontos para voc&ecirc; come&ccedil;ar hoje.</p>
          <div className={s.heroCtas}>
            <a className={`${landing.btn} ${landing.btnPrimary}`} href="#produtos">Ver produtos<ChevronRight /></a>
            <a className={`${landing.btn} ${landing.btnGhost}`} href="#contato-form">Agendar demonstra&ccedil;&atilde;o</a>
          </div>
        </section>

        <div className={s.metrics}>
          <div className={s.metric}><div className={s.metricVal}><CountUp value="3"/></div><div className={s.metricLbl}>Produtos no mercado</div></div>
          <div className={s.metric}><div className={s.metricVal}><CountUp value="99.9%"/></div><div className={s.metricLbl}>No ar, sempre</div></div>
          <div className={s.metric}><div className={s.metricVal}><CountUp value="12 anos"/></div><div className={s.metricLbl}>De experi&ecirc;ncia</div></div>
          <div className={s.metric}><div className={s.metricVal}><CountUp value="200+"/></div><div className={s.metricLbl}>Projetos entregues</div></div>
        </div>

        {/* POR QUE */}
        <section className={`${s.sec} ${s.secC}`}>
          <Pill><Star />Diferencial</Pill>
          <h2 className={s.secH}>Feitos por quem entende de software</h2>
          <p className={s.secP}>Nossos produtos s&atilde;o constru&iacute;dos pela mesma equipe que cria sistemas para grandes empresas. Isso significa mais qualidade, seguran&ccedil;a e estabilidade.</p>

          <div className={s.bento}>
            <Reveal className={s.bentoCard}>
              <div className={s.bentoIcon}><IconShieldCheck /></div>
              <h3>Qualidade profissional</h3>
              <p>Mesma engenharia que usamos pra BTG, Leroy e Multilog. N&atilde;o &eacute; sistema amador.</p>
            </Reveal>
            <Reveal className={s.bentoCard} delay={100}>
              <div className={s.bentoIcon}><IconRocket /></div>
              <h3>Sempre melhorando</h3>
              <p>Atualizações toda semana. Novas funcionalidades baseadas no que os clientes pedem.</p>
            </Reveal>
            <Reveal className={s.bentoCard} delay={200}>
              <div className={s.bentoIcon}><IconHeadset /></div>
              <h3>Suporte humano</h3>
              <p>Quando voc&ecirc; precisa de ajuda, fala com quem construiu o sistema. Sem robôs.</p>
            </Reveal>
          </div>
        </section>

        {/* PRODUTOS */}
        <section id="produtos" className={`${s.sec} ${s.secC}`}>
          <Pill><Star />Produtos</Pill>
          <h2 className={s.secH}>3 plataformas para 3 mercados</h2>
          <p className={s.secP}>Cada uma resolve um problema real, de forma simples e eficiente.</p>

          <div className={s.products}>
            <Reveal as="article" className={s.product}>
              <Pill muted>Cl&iacute;nicas</Pill>
              <h3>Dentrixa</h3>
              <p>Sistema completo para cl&iacute;nicas odontol&oacute;gicas. Agenda com confirma&ccedil;&atilde;o autom&aacute;tica pelo WhatsApp, ficha do paciente digital, controle financeiro. Menos faltas, mais organiza&ccedil;&atilde;o.</p>
              <div className={s.tags}>
                {["Agenda","WhatsApp","Financeiro","Prontuário"].map(t=><Pill key={t} muted>{t}</Pill>)}
              </div>
              <a className={`${landing.btn} ${landing.btnPrimary}`} href="https://www.dentrixa.com/" target="_blank" rel="noopener noreferrer">Conhecer<ChevronRight /></a>
            </Reveal>

            <Reveal as="article" className={`${s.product} ${s.productFeat}`} delay={100}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/landing/Logo-magus.svg" alt="MAGUS" width={120} height={28} style={{marginBottom:4}}/>
              <Pill muted>Vendas</Pill>
              <h3>MAGUS</h3>
              <p>Intelig&ecirc;ncia artificial que atende seus potenciais clientes automaticamente. Responde em 30 segundos, 24 horas por dia, e s&oacute; passa pro vendedor quem realmente quer comprar.</p>
              <div className={s.tags}>
                {["IA","WhatsApp","CRM","24/7"].map(t=><Pill key={t} muted>{t}</Pill>)}
              </div>
              <a className={`${landing.btn} ${landing.btnPrimary}`} href="https://www.magus-app.com/" target="_blank" rel="noopener noreferrer">Conhecer<ChevronRight /></a>
            </Reveal>

            <Reveal as="article" className={s.product} delay={200}>
              <Pill muted>Im&oacute;veis</Pill>
              <h3>Cretor</h3>
              <p>Plataforma para corretores de im&oacute;veis. Organiza todos os seus contatos, cria an&uacute;ncios com intelig&ecirc;ncia artificial e mostra quantos neg&oacute;cios voc&ecirc; tem em andamento.</p>
              <div className={s.tags}>
                {["CRM","IA","Anúncios","Funil"].map(t=><Pill key={t} muted>{t}</Pill>)}
              </div>
              <a className={`${landing.btn} ${landing.btnPrimary}`} href="https://danielkrammes.com/" target="_blank" rel="noopener noreferrer">Conhecer<ChevronRight /></a>
            </Reveal>
          </div>
        </section>

        {/* GARANTIAS */}
        <section className={s.sec}>
          <div className={`${s.split} ${s.splitReverse}`}>
            <div className={s.splitText}>
              <Pill><Star />Garantias</Pill>
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
              <div className={s.statCard}><div className={s.statVal}><CountUp value="3"/></div><div className={s.statLbl}>Produtos</div></div>
              <div className={s.statCard}><div className={s.statVal}><CountUp value="99.9%"/></div><div className={s.statLbl}>No ar</div></div>
              <div className={s.statCard}><div className={s.statVal}><CountUp value="200+"/></div><div className={s.statLbl}>Projetos</div></div>
              <div className={s.statCard}><div className={s.statVal}><CountUp value="12a"/></div><div className={s.statLbl}>Mercado</div></div>
            </div>
          </div>
        </section>

        {/* DEPOIMENTOS */}
        <section className={`${s.sec} ${s.secC}`}>
          <h2 className={s.secH}>O que nossos clientes falam</h2>
          <div className={s.quotes}>
            <Reveal className={s.quote}>
              <div className={s.quoteWho}><div className={`${s.quoteAvatar} ${s.ga}`}><img src="/assets/felipe-assuncao.png" alt="" aria-hidden="true"/></div><div><div className={s.quoteName}>Felipe Assun&ccedil;&atilde;o</div><div className={s.quoteRole}>CEO, Orbitech</div></div></div>
              <p className={s.quoteText}>&ldquo;Usamos o MAGUS e nossas vendas subiram 40% em 3 meses. Produto excelente, suporte r&aacute;pido.&rdquo;</p>
            </Reveal>
            <Reveal className={s.quote} delay={100}>
              <div className={s.quoteWho}><div className={`${s.quoteAvatar} ${s.gb}`}><img src="/assets/rodigo-menezes.png" alt="" aria-hidden="true"/></div><div><div className={s.quoteName}>Rodrigo Menezes</div><div className={s.quoteRole}>CTO, Nexora</div></div></div>
              <p className={s.quoteText}>&ldquo;D&aacute; pra sentir que foi feito por gente que entende do assunto. Qualidade muito acima da m&eacute;dia.&rdquo;</p>
            </Reveal>
            <Reveal className={s.quote} delay={200}>
              <div className={s.quoteWho}><div className={`${s.quoteAvatar} ${s.gc}`}><img src="/assets/camila-duarte.png" alt="" aria-hidden="true"/></div><div><div className={s.quoteName}>Camila Duarte</div><div className={s.quoteRole}>Head of Product, Stratix</div></div></div>
              <p className={s.quoteText}>&ldquo;Tive um problema e resolvi em 15 minutos falando direto com o programador. Em outros sistemas levaria dias.&rdquo;</p>
            </Reveal>
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
              <a className={`${landing.btn} ${landing.btnPrimary}`} href="#contato-form">Agendar demonstra&ccedil;&atilde;o<ChevronRight /></a>
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
