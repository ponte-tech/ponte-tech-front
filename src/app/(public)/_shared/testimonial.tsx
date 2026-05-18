import styles from "../landing.module.css";
import type { TestimonialItem } from "./data";

export const Testimonial = ({ t }: { t: TestimonialItem }) => (
  <article className={styles.testimonial}>
    <div className={styles.who}>
      <div className={`${styles.avatar} ${styles[t.grad]}`}>
        <img src={t.image} alt="" aria-hidden="true" />
      </div>
      <div>
        <div className={styles.name}>{t.name}</div>
        <div className={styles.role}>{t.role}</div>
      </div>
    </div>
    <p className={styles.quote}>{t.quote}</p>
  </article>
);
