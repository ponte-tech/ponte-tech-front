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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const Contato = () => {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const maskPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits.length ? `(${digits}` : "";
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const update = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const value = field === "telefone" ? maskPhone(e.target.value) : e.target.value;
    setForm((s) => ({ ...s, [field]: value }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/public/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          telefone: form.telefone,
          comentario: form.comentario,
          origem: "landing-page",
        }),
      });

      if (!res.ok) throw new Error("Erro ao enviar mensagem");

      setSent(true);
      setForm(INITIAL);
    } catch {
      setError("Erro ao enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
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
              pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
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
          {error && (
            <span className={styles.contatoStatus} role="alert" style={{ color: "#ef4444" }}>
              {error}
            </span>
          )}
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={loading}>
            {loading ? "Enviando..." : "Enviar mensagem"}
            {!loading && <ChevronRight />}
          </button>
        </div>
      </form>
    </section>
  );
};
