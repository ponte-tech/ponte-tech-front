import styles from "../landing.module.css";

export const Numbers = () => (
  <section className={`${styles.numbers} ${styles.section}`}>
    <h2>Impacto real no seu negócio</h2>
    <div className={styles.numbersGrid}>
      <div><div className={styles.nbNum}>150+</div><div className={styles.nbLbl}>Projetos entregues</div></div>
      <div><div className={styles.nbNum}>98%</div><div className={styles.nbLbl}>Índice de satisfação</div></div>
      <div><div className={styles.nbNum}>80+</div><div className={styles.nbLbl}>Especialistas alocados</div></div>
      <div><div className={styles.nbNum}>5 anos</div><div className={styles.nbLbl}>No mercado</div></div>
    </div>
  </section>
);
