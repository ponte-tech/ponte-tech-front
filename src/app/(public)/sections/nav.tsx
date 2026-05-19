import styles from "../landing.module.css";
import { Logo } from "../_shared/icons";

export const Nav = () => (
  <nav className={styles.nav}>
    <Logo />
    <div className={styles.navLinks}>
      <a href="#quem">Quem Somos</a>
      <a href="#servicos">Serviços</a>
      <a href="#academy">Ponte Academy</a>
      <a href="#contato-form">Contato</a>
    </div>
    <a className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm} ${styles.navCta}`} href="#contato-form">
      Fale com um especialista
    </a>
  </nav>
);
