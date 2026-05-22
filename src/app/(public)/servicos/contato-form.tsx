"use client";

import { useState } from "react";
import s from "./servico.module.css";
import landing from "../landing.module.css";
import { Pill } from "../_shared/pill";
import { ChevronRight, Star } from "../_shared/icons";

type FormState = { email: string; telefone: string; comentario: string };
const INITIAL: FormState = { email: "", telefone: "", comentario: "" };

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const ContatoForm = ({ origem = "lp-servico" }: { origem?: string }) => {
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
    setForm((prev) => ({ ...prev, [field]: value }));
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
          origem,
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
    <section id="contato-form" className={`${s.sec} ${s.secC} ${s.formSection}`}>
      <Pill><Star />Fale conosco</Pill>
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
              pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
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
          {error && (
            <span className={s.formStatus} role="alert" style={{ color: "#ef4444" }}>
              {error}
            </span>
          )}
          <button type="submit" className={`${landing.btn} ${landing.btnPrimary}`} disabled={loading}>
            {loading ? "Enviando..." : "Enviar mensagem"}
            {!loading && <ChevronRight />}
          </button>
        </div>
      </form>
    </section>
  );
};
