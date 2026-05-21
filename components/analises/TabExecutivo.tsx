"use client";

import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { formatarMoeda, formatarMoedaCompacto } from "@/lib/categories";
import type { DRELinha, EvolucaoCategoria } from "@/lib/queries";

type TipoExec = "receita" | "despesa" | "custo";

const TIPO_OPTS: { value: TipoExec; label: string }[] = [
  { value: "receita", label: "Receitas"        },
  { value: "despesa", label: "Despesas Fixas"  },
  { value: "custo",   label: "Custos Variáveis"},
];

const CORES = [
  "#C8A84B", "#22C55E", "#3B82F6", "#F59E0B",
  "#EC4899", "#8B5CF6", "#06B6D4", "#EF4444",
];

interface Props {
  topReceitas:    DRELinha[];
  topDespesas:    DRELinha[];
  evolucao:       EvolucaoCategoria[];
  tipoEvolucao:   TipoExec;
  onTipoChange:   (t: TipoExec) => void;
  loading:        boolean;
}

export function TabExecutivo({ topReceitas, topDespesas, evolucao, tipoEvolucao, onTipoChange, loading }: Props) {
  const [ocultadas, setOcultadas] = useState<Set<string>>(new Set());

  const categorias = useMemo(() => {
    const cats = new Set<string>();
    for (const d of evolucao) Object.keys(d.categorias).forEach(c => cats.add(c));
    return [...cats].sort();
  }, [evolucao]);

  const chartData = useMemo(() =>
    evolucao.map(d => ({
      name: `${d.mes}/${String(d.ano).slice(2)}`,
      ...Object.fromEntries(categorias.map(c => [c, d.categorias[c] ?? 0])),
    }))
  , [evolucao, categorias]);

  const toggleCat = (cat: string) =>
    setOcultadas(prev => { const n = new Set(prev); n.has(cat) ? n.delete(cat) : n.add(cat); return n; });

  if (loading) return <Skeleton />;

  return (
    <div className="space-y-5">
      {/* Top 5 — lado a lado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TopCard title="Top 5 Receitas" linhas={topReceitas} cor="#22C55E" />
        <TopCard title="Top 5 Despesas" linhas={topDespesas} cor="#EF4444" />
      </div>

      {/* Gráfico de evolução */}
      <div className="card-financial rounded-2xl overflow-hidden">
        <div className="px-5 pt-5 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold"
                  style={{ fontFamily: "var(--font-cormorant)", color: "var(--foreground)" }}>
                Evolução por Linha
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}>
                Últimos 7 meses — selecione as linhas no gráfico
              </p>
            </div>

            {/* Toggle de tipo */}
            <div className="flex rounded-lg overflow-hidden shrink-0"
                 style={{ border: "1px solid var(--border)" }}>
              {TIPO_OPTS.map(opt => (
                <button key={opt.value}
                        onClick={() => { onTipoChange(opt.value); setOcultadas(new Set()); }}
                        className="px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer"
                        style={{
                          background: tipoEvolucao === opt.value ? "var(--gold)" : "transparent",
                          color:      tipoEvolucao === opt.value ? "var(--bg-base)" : "var(--muted-foreground)",
                          fontFamily: "var(--font-jakarta)",
                        }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pills de categorias */}
          {categorias.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {categorias.map((cat, idx) => {
                const cor   = CORES[idx % CORES.length];
                const ativa = !ocultadas.has(cat);
                return (
                  <button key={cat} onClick={() => toggleCat(cat)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer"
                          style={{
                            border:     `1px solid ${ativa ? cor : "var(--border)"}`,
                            background: ativa ? `${cor}18` : "transparent",
                            color:      ativa ? cor : "var(--muted-foreground)",
                            fontFamily: "var(--font-jakarta)",
                          }}>
                    <span className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: ativa ? cor : "var(--border)" }} />
                    {cat}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-5">
          {chartData.length === 0 ? (
            <p className="text-sm py-10 text-center" style={{ color: "var(--muted-foreground)" }}>
              Sem dados para o tipo selecionado.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                       axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => formatarMoedaCompacto(v)} width={72}
                       tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                       axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-card)", border: "1px solid rgba(200,168,75,0.25)",
                    borderRadius: 8, fontFamily: "var(--font-jakarta)", fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--gold)", fontWeight: 600, marginBottom: 4 }}
                  formatter={(value: unknown, name: unknown) => [formatarMoeda(Number(value)), String(name)]}
                />
                {categorias.map((cat, idx) => {
                  if (ocultadas.has(cat)) return null;
                  const cor = CORES[idx % CORES.length];
                  return (
                    <Line key={cat} type="monotone" dataKey={cat}
                          stroke={cor} strokeWidth={2} dot={{ r: 3, fill: cor }}
                          activeDot={{ r: 5 }} />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

function TopCard({ title, linhas, cor }: { title: string; linhas: DRELinha[]; cor: string }) {
  const total = linhas.reduce((s, l) => s + l.valor, 0);

  return (
    <div className="card-financial rounded-2xl overflow-hidden">
      <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <h3 className="text-base font-semibold"
            style={{ fontFamily: "var(--font-cormorant)", color: "var(--foreground)" }}>
          {title}
        </h3>
        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}>
          mês selecionado, consolidado
        </p>
      </div>

      <div className="px-5 py-3 space-y-3">
        {linhas.length === 0 ? (
          <p className="text-sm py-4 text-center" style={{ color: "var(--muted-foreground)" }}>
            Sem dados.
          </p>
        ) : linhas.map((l, idx) => {
          const pct = total > 0 ? (l.valor / total) * 100 : 0;
          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs truncate" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)", maxWidth: 180 }}>
                  {l.categoria}
                </span>
                <span className="text-xs font-semibold tabular shrink-0"
                      style={{ color: "var(--foreground)", fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-jakarta)" }}>
                  {formatarMoeda(l.valor)}
                </span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-hover)" }}>
                <div className="h-full rounded-full transition-all duration-500"
                     style={{ width: `${pct}%`, background: cor, opacity: 0.75 }} />
              </div>
            </div>
          );
        })}
      </div>

      {linhas.length > 0 && (
        <div className="px-5 py-3 flex justify-between items-center"
             style={{ borderTop: "1px solid var(--border)" }}>
          <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}>
            Total
          </span>
          <span className="text-sm font-semibold tabular"
                style={{ color: cor, fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-jakarta)" }}>
            {formatarMoeda(total)}
          </span>
        </div>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-financial rounded-2xl h-64 animate-pulse" style={{ background: "var(--bg-card)" }} />
        <div className="card-financial rounded-2xl h-64 animate-pulse" style={{ background: "var(--bg-card)" }} />
      </div>
      <div className="card-financial rounded-2xl h-96 animate-pulse" style={{ background: "var(--bg-card)" }} />
    </div>
  );
}
