"use client";

import { useState } from "react";
import s from "./servico.module.css";

type FormState = { email: string; telefone: string; comentario: string };
const INITIAL: FormState = { email: "", telefone: "", comentario: "" };

export const ContatoForm = () => {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [sent, setSent] = useState(false);

  const update = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
    setForm(INITIAL);
  };

  return (
    <section id="contato" className={`${s.sec} ${s.secC} ${s.formSection}`}>
      <span className={s.pill}>
        <span className={s.star}>&#10022;</span> Fale conosco
      </span>
      <h2 className={s.secH}>Envie sua mensagem</h2>
      <p className={s.secP}>
        Preencha o formul&aacute;rio e nossa equipe responde em at&eacute; 48h.
      </p>

      <form className={s.formCard} onSubmit={onSubmit} noValidate>
        <div className={s.formRow}>
          <label className={s.formField}>
            <span className={s.formLabel}>Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="voce@empresa.com"
              value={form.email}
              onChange={update("email")}
              className={s.formInput}
            />
          </label>
          <label className={s.formField}>
            <span className={s.formLabel}>Telefone</span>
            <input
              type="tel"
              required
              autoComplete="tel"
              placeholder="(11) 99999-0000"
              value={form.telefone}
              onChange={update("telefone")}
              className={s.formInput}
            />
          </label>
        </div>

        <label className={s.formField}>
          <span className={s.formLabel}>Coment&aacute;rio</span>
          <textarea
            required
            rows={5}
            placeholder="Conte um pouco sobre o que voc&ecirc; precisa..."
            value={form.comentario}
            onChange={update("comentario")}
            className={s.formTextarea}
            style={{ resize: "none" }}
          />
        </label>

        <div className={s.formActions}>
          {sent && (
            <span className={s.formStatus} role="status">
              Mensagem enviada. Em breve entraremos em contato.
            </span>
          )}
          <button type="submit" className={`${s.btn} ${s.btnP}`}>
            Enviar mensagem
            <span className={s.ico}>
              <svg viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        </div>
      </form>
    </section>
  );
};
