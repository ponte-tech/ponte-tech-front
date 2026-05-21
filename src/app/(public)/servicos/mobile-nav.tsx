"use client";

import { useState, useEffect } from "react";
import s from "./servico.module.css";
import landing from "../landing.module.css";

const produtos = [
  { name: "Dentrixa", desc: "Gestão para clínicas odontológicas", href: "https://app.dentrixa.com.br/" },
  { name: "MAGUS", desc: "IA de qualificação de leads", href: "https://www.magus-app.com/" },
  { name: "Cretor", desc: "Plataforma para corretores", href: "https://danielkrammes.com/" },
  { name: "Casa Digital", desc: "Captação de leads imobiliários", href: "https://dev.casa-digital.net/" },
];

export const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const [produtosOpen, setProdutosOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const close = () => { setOpen(false); setProdutosOpen(false); };

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
          <button
            className={s.mobileSubTrigger}
            onClick={() => setProdutosOpen((v) => !v)}
          >
            Produtos
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transform: produtosOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {produtosOpen && (
            <div className={s.mobileSubMenu}>
              {produtos.map((p) => (
                <a key={p.name} href={p.href} target="_blank" rel="noopener noreferrer" onClick={close}>
                  <span className={s.mobileSubName}>{p.name}</span>
                  <span className={s.mobileSubDesc}>{p.desc}</span>
                </a>
              ))}
            </div>
          )}
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
