import styles from "../landing.module.css";
import { Star } from "../_shared/icons";
import { Pill } from "../_shared/pill";

export const Produtos = () => (
  <section id="quem" className={`${styles.produtos} ${styles.section}`}>
    <div className={styles.mandalaSmall} />
    <h2>Produtos que transformam operações</h2>
    <p className={styles.sub}>
      Nossa expertise não é só em entregar tecnologia para outros — construímos os nossos próprios produtos.
    </p>

    <div className={styles.produtosGrid}>
      <article className={styles.pcard}>
        <div className={styles.topSpacer} />
        <Pill><Star />SaaS</Pill>
        <h3>CRM Imobiliário</h3>
        <p>Plataforma de gestão de leads e relacionamento para o setor imobiliário. Converta mais com inteligência.</p>
        <a className={`${styles.btn} ${styles.btnPrimary}`} href="#">Ver mais detalhes</a>
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
        <a className={`${styles.btn} ${styles.btnPrimary}`} href="#">Ver mais detalhes</a>
      </article>

      <article className={styles.pcard}>
        <div className={styles.topSpacer} />
        <Pill><Star />SaaS</Pill>
        <h3>SaaS Financeiro</h3>
        <p>Gestão financeira integrada e automatizada para empresas de tecnologia em crescimento.</p>
        <a className={`${styles.btn} ${styles.btnPrimary}`} href="#">Ver mais detalhes</a>
      </article>
    </div>
  </section>
);
