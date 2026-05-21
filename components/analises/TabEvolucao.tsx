"use client";

import { useState, useMemo, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { ChevronLeft } from "lucide-react";
import { formatarMoedaCompacto, formatarMoeda } from "@/lib/categories";
import { getEvolucaoDescricoes } from "@/lib/queries";
import type { EvolucaoCategoria } from "@/lib/queries";
import type { Tipo, Unidade } from "@/lib/supabase";

const TIPO_OPTS: { value: Tipo; label: string }[] = [
  { value: "receita", label: "Receitas"  },
  { value: "despesa", label: "Despesas"  },
  { value: "custo",   label: "Custos"    },
  { value: "imposto", label: "Impostos"  },
];

const CORES = [
  "#C8A84B", "#22C55E", "#3B82F6", "#F59E0B",
  "#EC4899", "#8B5CF6", "#06B6D4", "#EF4444",
];

interface Props {
  dados:        EvolucaoCategoria[];
  loading:      boolean;
  tipo:         Tipo;
  unidade:      Unidade | "TODOS";
  onTipoChange: (t: Tipo) => void;
}

export function TabEvolucao({ dados, loading, tipo, unidade, onTipoChange }: Props) {
  const [ocultadas,       setOcultadas]       = useState<Set<string>>(new Set());
  const [categoriaAtiva,  setCategoriaAtiva]  = useState<string | null>(null);
  const [dadosDrill,      setDadosDrill]      = useState<EvolucaoCategoria[]>([]);
  const [loadingDrill,    setLoadingDrill]    = useState(false);

  useEffect(() => {
    setCategoriaAtiva(null);
    setOcultadas(new Set());
  }, [tipo, unidade]);

  useEffect(() => {
    if (!categoriaAtiva) return;
    setLoadingDrill(true);
    getEvolucaoDescricoes(tipo, categoriaAtiva, unidade)
      .then(setDadosDrill)
      .finally(() => setLoadingDrill(false));
  }, [categoriaAtiva, tipo, unidade]);

  const dadosAtivos = categoriaAtiva ? dadosDrill : dados;

  const categorias = useMemo(() => {
    const totais: Record<string, number> = {};
    for (const d of dadosAtivos) {
      for (const [cat, val] of Object.entries(d.categorias)) {
        totais[cat] = (totais[cat] ?? 0) + val;
      }
    }
    return Object.entries(totais)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat]) => cat);
  }, [dadosAtivos]);

  const chartData = useMemo(() =>
    dadosAtivos.map(d => ({
      name: `${d.mes}/${String(d.ano).slice(2)}`,
      ...Object.fromEntries(categorias.map(c => [c, d.categorias[c] ?? 0])),
    }))
  , [dadosAtivos, categorias]);

  const toggleCat = (cat: string) =>
    setOcultadas(prev => { const n = new Set(prev); n.has(cat) ? n.delete(cat) : n.add(cat); return n; });

  const entrarCategoria = (cat: string) => {
    setCategoriaAtiva(cat);
    setOcultadas(new Set());
  };

  const voltar = () => {
    setCategoriaAtiva(null);
    setOcultadas(new Set());
  };

  if (loading) return <Skeleton />;

  return (
    <div className="space-y-4">
      {/* Toggle de tipo */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          {TIPO_OPTS.map(opt => (
            <button key={opt.value} onClick={() => onTipoChange(opt.value)}
                    className="px-4 py-2 text-xs font-medium transition-all duration-150 cursor-pointer"
                    style={{
                      background: tipo === opt.value ? "var(--gold)" : "transparent",
                      color:      tipo === opt.value ? "var(--bg-base)" : "var(--muted-foreground)",
                      fontFamily: "var(--font-jakarta)",
                    }}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Breadcrumb de drill-down */}
        {categoriaAtiva && (
          <div className="flex items-center gap-2">
            <button onClick={voltar}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                    style={{ border: "1px solid var(--border)", color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}>
              <ChevronLeft size={12} />
              Voltar
            </button>
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {TIPO_OPTS.find(o => o.value === tipo)?.label}
            </span>
            <span style={{ color: "var(--muted-foreground)" }}>›</span>
            <span className="text-xs font-semibold" style={{ color: "var(--gold)", fontFamily: "var(--font-jakarta)" }}>
              {categoriaAtiva}
            </span>
          </div>
        )}
      </div>

      {/* Pills de linhas visíveis */}
      {categorias.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categorias.map((cat, idx) => {
            const cor   = CORES[idx % CORES.length];
            const ativa = !ocultadas.has(cat);
            return (
              <div key={cat} className="flex items-center gap-0 rounded-full overflow-hidden"
                   style={{ border: `1px solid ${ativa ? cor : "var(--border)"}` }}>
                {/* Toggle visibilidade */}
                <button onClick={() => toggleCat(cat)}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-all cursor-pointer"
                        style={{
                          background: ativa ? `${cor}18` : "transparent",
                          color:      ativa ? cor : "var(--muted-foreground)",
                          fontFamily: "var(--font-jakarta)",
                        }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: ativa ? cor : "var(--border)" }} />
                  {cat}
                </button>
                {/* Drill-down (só no nível de categoria, não no de descrição) */}
                {!categoriaAtiva && (
                  <button onClick={() => entrarCategoria(cat)}
                          className="px-2 py-1 text-xs transition-all cursor-pointer border-l"
                          style={{
                            borderColor: ativa ? cor : "var(--border)",
                            color: ativa ? cor : "var(--muted-foreground)",
                            background: "transparent",
                            fontFamily: "var(--font-jakarta)",
                          }}
                          title={`Ver detalhe de ${cat}`}>
                    ›
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Gráfico */}
      <div className="card-financial rounded-xl p-5">
        {loadingDrill ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 animate-spin"
                 style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
          </div>
        ) : chartData.length === 0 ? (
          <p className="text-sm py-8 text-center" style={{ color: "var(--muted-foreground)" }}>
            Sem dados para o tipo selecionado.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={340}>
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

      {!categoriaAtiva && categorias.length > 0 && (
        <p className="text-xs" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}>
          Clique em › ao lado de uma categoria para ver o detalhe das linhas que a compõem.
        </p>
      )}
    </div>
  );
}

function Skeleton() {
  return <div className="card-financial rounded-xl h-96 animate-pulse" style={{ background: "var(--bg-card)" }} />;
}
