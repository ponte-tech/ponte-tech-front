import styles from "../landing.module.css";
import { ChevronRight, DotsGrid, Star } from "../_shared/icons";
import { Pill } from "../_shared/pill";
import { empresas } from "../_shared/data";

export const Hero = () => (
  <section className={styles.hero}>
    <div className={styles.heroEllipse} />
    <div className={styles.heroDarken} />
    <div className={styles.heroComposition} />

    <div className={styles.heroContent}>
      <Pill><Star />Empresa de Tecnologia Sênior</Pill>
      <h1>Tecnologia que impulsiona o seu negócio.</h1>
      <p className={styles.heroBody}>
        Desenvolvimento de software e<br className={styles.brMobile} /> alocação consultiva de<br className={styles.brMobile} /> especialistas para empresas que<br className={styles.brMobile} /> exigem escala e segurança.
      </p>
      <div className={styles.heroCtas}>
        <a className={`${styles.btn} ${styles.btnPrimary}`} href="#contato">
          Fale com um especialista
          <ChevronRight />
        </a>
        <a className={`${styles.btn} ${styles.btnGhost}`} href="#servicos">
          Conheça nossos serviços
          <DotsGrid />
        </a>
      </div>
    </div>

    <div className={styles.heroCompanies}>
      <p className={styles.label}>Empresas que confiam na nossa tecnologia</p>
      <div className={styles.logosMarquee} aria-hidden={false}>
        <div className={styles.logosTrack}>
          {[...empresas, ...empresas].map((b, i) => (
            <span key={`${b}-${i}`} className={styles.brand}>{b}</span>
          ))}
        </div>
      </div>
    </div>
  </section>
);
