import styles from "../landing.module.css";
import { Logo } from "../_shared/icons";

export const Footer = () => (
  <footer className={styles.footer}>
    <div className={styles.footerGrid}>
      <div className={styles.footerBrand}>
        <Logo />
        <p className={styles.brandBlurb}>Tecnologia de alto nível para empresas que não aceitam menos.</p>
        <div className={styles.socials}>
          <a
            className={styles.social}
            href="https://www.linkedin.com/company/pontetech"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <img src="/assets/landing/linkedin.svg" alt="" aria-hidden="true" />
          </a>
          <a
            className={styles.social}
            href="https://www.instagram.com/pontetechoficial/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <img src="/assets/landing/instagram.svg" alt="" aria-hidden="true" />
          </a>
          <a
            className={styles.social}
            href="https://github.com/ponte-tech"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <img src="/assets/landing/github.svg" alt="" aria-hidden="true" />
          </a>
        </div>
      </div>
      <div>
        <h4>Empresa</h4>
        <ul>
          <li><a href="#">Quem Somos</a></li>
          <li><a href="#">Serviços</a></li>
          <li><a href="#">Ponte Academy</a></li>
          <li><a href="#">Contato</a></li>
        </ul>
      </div>
      <div>
        <h4>Serviços</h4>
        <ul>
          <li><a href="#">Fábrica de Software</a></li>
          <li><a href="#">Outsourcing</a></li>
          <li><a href="#">SaaS</a></li>
        </ul>
      </div>
      <div>
        <h4>Legal</h4>
        <ul>
          <li><a href="#">Política de Privacidade</a></li>
          <li><a href="#">Termos de Uso</a></li>
          <li><a href="#">Acessibilidade</a></li>
          <li><a href="#">FAQ</a></li>
        </ul>
      </div>
    </div>
    <div className={styles.footerBottom}>
      <span>© 2025 Ponte Tech. Todos os direitos reservados.</span>
      <span>Tratamos seus dados com segurança e transparência.</span>
    </div>
  </footer>
);
