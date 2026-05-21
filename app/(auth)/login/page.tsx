"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
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
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Padrão de fundo sutil */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(ellipse 80% 60% at 50% -10%, rgba(200,168,75,0.08) 0%, transparent 70%)`,
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div
          className="rounded-2xl px-8 py-10"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid rgba(200,168,75,0.18)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-36 h-20 mb-3">
              <Image
                src="/logo.png"
                alt="X10 Investimentos"
                fill
                className="object-contain"
              />
            </div>
            <p
              className="text-[10px] tracking-widest uppercase"
              style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}
            >
              Controle Financeiro
            </p>
          </div>

          {/* Título */}
          <h1
            className="text-center text-2xl font-light mb-1"
            style={{ color: "var(--foreground)", fontFamily: "var(--font-cormorant)" }}
          >
            Acesso ao Sistema
          </h1>
          <p
            className="text-center text-sm mb-8"
            style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}
          >
            Entre com suas credenciais
          </p>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium mb-1.5 tracking-wide"
                style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}
              >
                EMAIL
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="seu@email.com"
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                  fontFamily: "var(--font-jakarta)",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--gold)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium mb-1.5 tracking-wide"
                style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}
              >
                SENHA
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                  fontFamily: "var(--font-jakarta)",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--gold)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>

            {error && (
              <p
                className="text-sm text-center py-2 px-3 rounded-lg"
                style={{
                  color: "var(--danger)",
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  fontFamily: "var(--font-jakarta)",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all mt-2"
              style={{
                background: loading ? "rgba(200,168,75,0.5)" : "var(--gold)",
                color: "var(--bg-base)",
                fontFamily: "var(--font-jakarta)",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
