import styles from "../landing.module.css";
import { Star } from "../_shared/icons";
import { Pill } from "../_shared/pill";

export const Produtos = () => (
  <section id="quem" className={`${styles.produtos} ${styles.section}`}>
    <div className={styles.mandalaSmall} />
    <h2>Produtos que transformam operações</h2>
    <p className={styles.sub}>
      A Pote Tech é uma empresa de tecnologia especializada em desenvolvimento de software sob demanda, outsourcing e squads dedicados. Transformamos desafios de negócio em soluções digitais escaláveis, unindo estratégia, tecnologia e execução de alto nível para acelerar resultados. Mais do que desenvolver sistemas, atuamos como parceiros tecnológicos, criando produtos, plataformas e equipes que impulsionam o crescimento dos nossos clientes.
    </p>

    <div className={styles.produtosGrid}>
      <article className={styles.pcard}>
        <div className={styles.topSpacer} />
        <Pill><Star />SaaS</Pill>
        <h3>Dentrixa - Solução para clinicas odontologicas</h3>
        <p>Plataforma de gestão de leads e relacionamento para o setor imobiliário. Converta mais com inteligência.</p>
        <a className={`${styles.btn} ${styles.btnPrimary}`} href="https://www.dentrixa.com/" target="_blank" rel="noopener noreferrer">Ver mais detalhes</a>
      </article>

      <article className={`${styles.pcard} ${styles.pcardFeatured}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.magusLogo}
          src="/assets/landing/Logo-magus.svg"
          alt="MAGUS"
          width={172}
          height={39}
        />
        <Pill><Star />IA Service</Pill>
        <h3>MAGUS — IA de Leads</h3>
        <p>Motor de inteligência artificial para qualificação automática de leads e predição de conversão.</p>
        <a className={`${styles.btn} ${styles.btnPrimary}`} href="https://www.magus-app.com/" target="_blank" rel="noopener noreferrer">
          Ver mais detalhes
        </a>
      </article>

      <article className={styles.pcard}>
        <div className={styles.topSpacer} />
        <Pill><Star />SaaS</Pill>
        <h3>Cretor — Plataforma inteligente para corretores</h3>
        <p>Gestão financeira integrada e automatizada para empresas de tecnologia em crescimento.</p>
        <a className={`${styles.btn} ${styles.btnPrimary}`} href="https://danielkrammes.com/" target="_blank" rel="noopener noreferrer">Ver mais detalhes</a>
      </article>
    </div>
  </section>
);
