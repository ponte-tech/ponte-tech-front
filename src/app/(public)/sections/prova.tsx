import styles from "../landing.module.css";
import { Testimonial } from "../_shared/testimonial";
import { testimonialsRow1, testimonialsRow2 } from "../_shared/data";

export const Prova = () => (
  <section className={`${styles.prova} ${styles.section}`}>
    <h2>Impacto que transforma negócios</h2>
    <div className={styles.provaWrap}>
      <div className={styles.provaGrid}>
        {testimonialsRow1.map((t) => <Testimonial key={t.initials} t={t} />)}
      </div>
      <div className={styles.provaGrid}>
        {testimonialsRow2.map((t) => <Testimonial key={t.initials} t={t} />)}
      </div>
    </div>
  </section>
);
