"use client";

import { useState, useEffect } from "react";
import styles from "../landing.module.css";
import { Logo } from "../_shared/icons";

const produtos = [
  { name: "Dentrixa", desc: "Gestão para clínicas odontológicas", href: "https://app.dentrixa.com.br/" },
  { name: "MAGUS", desc: "IA de qualificação de leads", href: "https://www.magus-app.com/" },
  { name: "Cretor", desc: "Plataforma para corretores", href: "https://danielkrammes.com/" },
  { name: "Casa Digital", desc: "Captação de leads imobiliários", href: "https://dev.casa-digital.net/" },
];

export const Nav = () => {
  const [open, setOpen] = useState(false);
  const [produtosOpen, setProdutosOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const close = () => { setOpen(false); setProdutosOpen(false); };

  return (
    <>
      <nav className={styles.nav}>
        <Logo />
        <div className={styles.navLinks}>
          <a href="#quem">Quem Somos</a>
          <a href="#servicos">Servi&ccedil;os</a>
          <div className={styles.navDropdown}>
            <button className={styles.navDropdownTrigger}>
              Produtos
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <div className={styles.navDropdownMenu}>
              {produtos.map((p) => (
                <a key={p.name} href={p.href} target="_blank" rel="noopener noreferrer" className={styles.navDropdownItem}>
                  <span className={styles.navDropdownName}>{p.name}</span>
                  <span className={styles.navDropdownDesc}>{p.desc}</span>
                </a>
              ))}
            </div>
          </div>
          <a href="#academy">Ponte Academy</a>
          <a href="#contato-form">Contato</a>
        </div>
        <div className={styles.navCta} style={{ display: "flex", gap: "12px" }}>
          <a className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm} ${styles.hideOnMobile}`} href="/login">
            &Aacute;rea logada
          </a>
          <a className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm} ${styles.hideOnMobile}`} href="#contato-form">
            Fale com um especialista
          </a>
        </div>
        <button
          className={styles.burger}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          <span className={`${styles.burgerLine} ${open ? styles.burgerOpen : ""}`} />
          <span className={`${styles.burgerLine} ${open ? styles.burgerOpen : ""}`} />
          <span className={`${styles.burgerLine} ${open ? styles.burgerOpen : ""}`} />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div className={`${styles.mobileDrawer} ${open ? styles.mobileDrawerOpen : ""}`}>
        <div className={styles.mobileDrawerLinks}>
          <a href="#quem" onClick={close}>Quem Somos</a>
          <a href="#servicos" onClick={close}>Servi&ccedil;os</a>
          <button
            className={styles.mobileSubTrigger}
            onClick={() => setProdutosOpen((v) => !v)}
          >
            Produtos
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transform: produtosOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {produtosOpen && (
            <div className={styles.mobileSubMenu}>
              {produtos.map((p) => (
                <a key={p.name} href={p.href} target="_blank" rel="noopener noreferrer" onClick={close}>
                  <span className={styles.mobileSubName}>{p.name}</span>
                  <span className={styles.mobileSubDesc}>{p.desc}</span>
                </a>
              ))}
            </div>
          )}
          <a href="#academy" onClick={close}>Ponte Academy</a>
          <a href="#contato-form" onClick={close}>Contato</a>
        </div>
        <div className={styles.mobileDrawerCtas}>
          <a className={`${styles.btn} ${styles.btnGhost}`} href="/login" onClick={close}>
            &Aacute;rea logada
          </a>
          <a className={`${styles.btn} ${styles.btnPrimary}`} href="#contato-form" onClick={close}>
            Fale com um especialista
          </a>
        </div>
      </div>

      {open && <div className={styles.mobileBackdrop} onClick={close} />}
    </>
  );
};
