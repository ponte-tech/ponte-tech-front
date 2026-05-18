import styles from "../landing.module.css";
import { ChevronRight } from "../_shared/icons";

export const Cta = () => (
  <section id="contato" className={`${styles.cta} ${styles.section}`}>
    <div className={styles.ctaInner}>
      <div className={styles.ctaLeft}>
        <h2>Vamos construir algo extraordinário juntos?</h2>
        <p className={styles.ctaBody}>
          Fale com nossos especialistas e descubra como a Ponte Tech pode acelerar a sua operação de tecnologia.
        </p>
        <div className={styles.ctaCtas}>
          <a className={`${styles.btn} ${styles.btnPrimary}`} href="#">
            Fale com um especialista
            <ChevronRight />
          </a>
          <a className={`${styles.btn} ${styles.btnGhost}`} href="#">
            Contato via WhatsApp
          </a>
        </div>
        <div className={styles.ctaContact}>
          <div className={styles.item}>
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A14 14 0 0 1 4 7a2 2 0 0 1 1-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            +55 11 99999-0000
          </div>
          <div className={styles.item}>
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            contato@pontetech.com.br
          </div>
        </div>
      </div>
      <div className={styles.ctaPattern} />
    </div>
  </section>
);
