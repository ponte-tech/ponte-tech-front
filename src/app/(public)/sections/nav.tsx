"use client";

import { useState, useEffect } from "react";
import styles from "../landing.module.css";
import { Logo } from "../_shared/icons";

export const Nav = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <nav className={styles.nav}>
        <Logo />
        <div className={styles.navLinks}>
          <a href="#quem">Quem Somos</a>
          <a href="#servicos">Servi&ccedil;os</a>
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

      {/* Backdrop */}
      {open && <div className={styles.mobileBackdrop} onClick={close} />}
    </>
  );
};
