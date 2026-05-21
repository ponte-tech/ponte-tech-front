"use client";

import { useState, useEffect } from "react";
import s from "./servico.module.css";
import landing from "../landing.module.css";

export const MobileNav = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        className={s.burger}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
      >
        <span className={`${s.burgerLine} ${open ? s.burgerOpen : ""}`} />
        <span className={`${s.burgerLine} ${open ? s.burgerOpen : ""}`} />
        <span className={`${s.burgerLine} ${open ? s.burgerOpen : ""}`} />
      </button>

      <div className={`${s.mobileDrawer} ${open ? s.mobileDrawerOpen : ""}`}>
        <div className={s.mobileDrawerLinks}>
          <a href="/#quem" onClick={close}>Quem Somos</a>
          <a href="/#servicos" onClick={close}>Servi&ccedil;os</a>
          <a href="/#academy" onClick={close}>Academy</a>
          <a href="#contato-form" onClick={close}>Contato</a>
        </div>
        <div className={s.mobileDrawerCtas}>
          <a className={`${landing.btn} ${landing.btnGhost}`} href="/login" onClick={close} style={{ width: "100%", height: 48, fontSize: 15, justifyContent: "center" }}>
            &Aacute;rea logada
          </a>
          <a className={`${landing.btn} ${landing.btnPrimary}`} href="#contato-form" onClick={close} style={{ width: "100%", height: 48, fontSize: 15, justifyContent: "center" }}>
            Fale conosco
          </a>
        </div>
      </div>

      {open && <div className={s.mobileBackdrop} onClick={close} />}
    </>
  );
};
