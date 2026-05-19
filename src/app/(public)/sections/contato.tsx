"use client";

import { useState } from "react";
import styles from "../landing.module.css";
import { ChevronRight, Star } from "../_shared/icons";
import { Pill } from "../_shared/pill";

type FormState = {
  email: string;
  telefone: string;
  comentario: string;
};

const INITIAL: FormState = { email: "", telefone: "", comentario: "" };

export const Contato = () => {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [sent, setSent] = useState(false);

  const update = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((s) => ({ ...s, [field]: e.target.value }));

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
    setForm(INITIAL);
  };

  return (
    <section id="contato-form" className={`${styles.contato} ${styles.section}`}>
      <Pill><Star />Fale conosco</Pill>
      <h2>Envie sua mensagem</h2>
      <p className={styles.sub}>
        Preencha o formulário e nossa equipe entra em contato para entender seu desafio e propor o próximo passo.
      </p>

      <form className={styles.contatoCard} onSubmit={onSubmit} noValidate>
        <div className={styles.fieldRow}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="voce@empresa.com"
              value={form.email}
              onChange={update("email")}
              className={styles.input}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Telefone</span>
            <input
              type="tel"
              required
              autoComplete="tel"
              placeholder="(11) 99999-0000"
              value={form.telefone}
              onChange={update("telefone")}
              className={styles.input}
            />
          </label>
        </div>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Comentário</span>
          <textarea
            required
            rows={5}
            placeholder="Conte um pouco sobre o seu projeto…"
            value={form.comentario}
            onChange={update("comentario")}
            className={styles.textarea}
            style={{ resize: "none" }}
          />
        </label>

        <div className={styles.contatoActions}>
          {sent && (
            <span className={styles.contatoStatus} role="status">
              Mensagem enviada. Em breve entraremos em contato.
            </span>
          )}
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
            Enviar mensagem
            <ChevronRight />
          </button>
        </div>
      </form>
    </section>
  );
};
