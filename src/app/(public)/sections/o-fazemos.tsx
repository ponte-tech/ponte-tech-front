import styles from "../landing.module.css";
import { ChevronRight, Star } from "../_shared/icons";
import { Pill } from "../_shared/pill";

export const OFazemos = () => (
  <section id="servicos" className={`${styles.oFazemos} ${styles.section}`}>
    <Pill><Star />O que fazemos</Pill>
    <h2>Soluções ponta a ponta para o ciclo de vida do seu software</h2>
    <p className={styles.sub}>
      Do levantamento de requisitos à sustentação em produção — cobrimos cada etapa com especialistas validados.
    </p>

    <div className={styles.oFazemosGrid}>
      <article className={styles.scard}>
        <span className={styles.num}>01</span>
        <div className={styles.toprow} />
        <h3>Fábrica de Software</h3>
        <p className={styles.desc}>
          Desenvolvemos soluções digitais completas com escopo fechado e previsível. Do conceito ao código, com metodologias ágeis e stack de ponta.
        </p>
        <div className={styles.tags}>
          {["React", "Node.js", "Python", "AWS"].map((t) => (
            <Pill key={t} muted>{t}</Pill>
          ))}
        </div>
        <a className={`${styles.btn} ${styles.btnGhost}`} href="/servicos/fabrica-de-software">
          Saiba mais
          <ChevronRight />
        </a>
      </article>

      <article className={styles.scard}>
        <span className={styles.num}>02</span>
        <div className={styles.toprow}><Pill accent><Star />Validado por Ponte Academy</Pill></div>
        <h3>Outsourcing</h3>
        <p className={styles.desc}>
          Alocação consultiva de especialistas validados pelo Ponte Academy. Cobrimos todo o ciclo de desenvolvimento, da análise à sustentação.
        </p>
        <div className={styles.tags}>
          {["React", "Java", "DevOps", "Cloud"].map((t) => (
            <Pill key={t} muted>{t}</Pill>
          ))}
        </div>
        <a className={`${styles.btn} ${styles.btnGhost}`} href="/servicos/outsourcing">
          Saiba mais
          <ChevronRight />
        </a>
      </article>

      <article className={styles.scard}>
        <span className={styles.num}>03</span>
        <div className={styles.toprow} />
        <h3>SaaS</h3>
        <p className={styles.desc}>
          Produtos próprios resilientes e escaláveis. CRM, IA de Leads e Financeiro — construídos com a mesma exigência que aplicamos nos projetos dos nossos clientes.
        </p>
        <div className={styles.tags}>
          {["CRM", "IA", "Financeiro"].map((t) => (
            <Pill key={t} muted>{t}</Pill>
          ))}
        </div>
        <a className={`${styles.btn} ${styles.btnGhost}`} href="/servicos/saas">
          Saiba mais
          <ChevronRight />
        </a>
      </article>
    </div>
  </section>
);
