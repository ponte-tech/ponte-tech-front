import styles from "../landing.module.css";
import { Check, ChevronRight, Star } from "../_shared/icons";
import { Pill } from "../_shared/pill";
import { trilhas } from "../_shared/data";
import { TrilhaIcon } from "../_shared/trilha-icon";

export const Academy = () => (
  <section id="academy" className={`${styles.academy} ${styles.section}`}>
    <div className={styles.mandala} />
    <h2>Formamos os talentos que impulsionam a nossa entrega</h2>
    <p className={styles.lead}>
      O Ponte Academy é o centro de excelência técnica que sustenta o alto nível da Ponte Tech. Aqui, conhecimento se transforma em diferenciais competitivos.
    </p>
    <div className={styles.leadCta}>
      <a className={`${styles.btn} ${styles.btnPrimary}`} href="#">
        Conheça a Ponte Academy
        <ChevronRight />
      </a>
    </div>

    <div className={styles.features}>
      <div className={styles.feat}>
        <Check />
        Instrutores especialistas do mercado
      </div>
      <div className={styles.feat}>
        <Check />
        Trilhas de carreira para iniciante, pleno e avançado
      </div>
      <div className={styles.feat}>
        <Check />
        Acesso prioritário ao Banco de Talentos
      </div>
    </div>

    <div className={styles.trilhas}>
      {trilhas.map((t) => (
        <div key={t.title} className={styles.trilha}>
          <span className={styles.ico}><TrilhaIcon kind={t.iconKind} /></span>
          <h4>{t.title}</h4>
          <Pill muted><Star />{t.level}</Pill>
        </div>
      ))}
    </div>
  </section>
);
