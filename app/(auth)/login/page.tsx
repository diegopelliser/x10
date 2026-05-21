"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router   = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email ou senha incorretos.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
      background: "#0B1829",
      overflow: "auto",
    }}>
      {/* Gradiente de fundo sutil */}
      <div style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        backgroundImage: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(200,168,75,0.08) 0%, transparent 70%)",
      }} />

      <div style={{ position: "relative", width: "100%", maxWidth: "22rem" }}>
        {/* Card */}
        <div style={{
          background: "#0D1F3C",
          border: "1px solid rgba(200,168,75,0.18)",
          borderRadius: "1rem",
          padding: "2.5rem 2rem",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2rem" }}>
            <div style={{ position: "relative", width: "144px", height: "80px", marginBottom: "0.75rem" }}>
              <Image src="/logo.png" alt="X10 Investimentos" fill style={{ objectFit: "contain" }} />
            </div>
            <p style={{
              fontSize: "10px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#8A95A3",
              fontFamily: "var(--font-jakarta)",
            }}>
              Controle Financeiro
            </p>
          </div>

          {/* Título */}
          <h1 style={{
            textAlign: "center",
            fontSize: "1.5rem",
            fontWeight: 300,
            color: "#F5F7FA",
            fontFamily: "var(--font-cormorant)",
            marginBottom: "0.25rem",
          }}>
            Acesso ao Sistema
          </h1>
          <p style={{
            textAlign: "center",
            fontSize: "0.875rem",
            color: "#8A95A3",
            fontFamily: "var(--font-jakarta)",
            marginBottom: "2rem",
          }}>
            Entre com suas credenciais
          </p>

          {/* Formulário */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label htmlFor="email" style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 500,
                marginBottom: "6px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#8A95A3",
                fontFamily: "var(--font-jakarta)",
              }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="seu@email.com"
                style={{
                  width: "100%",
                  padding: "0.625rem 1rem",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  outline: "none",
                  background: "#132338",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "#F5F7FA",
                  fontFamily: "var(--font-jakarta)",
                  boxSizing: "border-box",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "#C8A84B")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
              />
            </div>

            <div>
              <label htmlFor="password" style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 500,
                marginBottom: "6px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#8A95A3",
                fontFamily: "var(--font-jakarta)",
              }}>
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "0.625rem 1rem",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  outline: "none",
                  background: "#132338",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "#F5F7FA",
                  fontFamily: "var(--font-jakarta)",
                  boxSizing: "border-box",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "#C8A84B")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
              />
            </div>

            {error && (
              <p style={{
                fontSize: "0.875rem",
                textAlign: "center",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.5rem",
                color: "#EF4444",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                fontFamily: "var(--font-jakarta)",
              }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.625rem",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
                marginTop: "0.5rem",
                background: loading ? "rgba(200,168,75,0.5)" : "#C8A84B",
                color: "#0B1829",
                fontFamily: "var(--font-jakarta)",
                cursor: loading ? "not-allowed" : "pointer",
                border: "none",
                transition: "background 0.15s",
              }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        {/* Logo Necton */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-necton.png"
            alt="Necton — Uma empresa BTG Pactual"
            style={{ width: "180px", height: "auto", opacity: 0.6, objectFit: "contain" }}
          />
        </div>
      </div>
    </div>
  );
}
