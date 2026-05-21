"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatarMoeda } from "@/lib/categories";
import type { DetalheSecao } from "@/lib/queries";

const TIPO_COR: Record<string, string> = {
  imposto: "var(--warning)",
  custo:   "var(--danger)",
  despesa: "var(--danger)",
};

interface Props {
  secoes: DetalheSecao[];
  loading: boolean;
}

export function TabDespesas({ secoes, loading }: Props) {
  const [secoesAbertas, setSecoesAbertas] = useState<Set<string>>(new Set(secoes.map(s => s.tipo)));
  const [catsAbertas,   setCatsAbertas]   = useState<Set<string>>(new Set());

  const toggleSecao = (tipo: string) =>
    setSecoesAbertas(prev => { const n = new Set(prev); n.has(tipo) ? n.delete(tipo) : n.add(tipo); return n; });

  const toggleCat = (key: string) =>
    setCatsAbertas(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const totalGeral = secoes.reduce((s, sec) => s + sec.total, 0);

  if (loading) return <Skeleton />;

  if (secoes.length === 0)
    return (
      <p className="text-sm py-8 text-center" style={{ color: "var(--muted-foreground)" }}>
        Sem despesas no período selecionado.
      </p>
    );

  return (
    <div className="space-y-3">
      {secoes.map(secao => {
        const cor         = TIPO_COR[secao.tipo] ?? "var(--danger)";
        const secaoAberta = secoesAbertas.has(secao.tipo);

        return (
          <div key={secao.tipo} className="card-financial rounded-xl overflow-hidden">
            {/* Header da seção (tipo) */}
            <button
              onClick={() => toggleSecao(secao.tipo)}
              className="w-full flex items-center gap-3 px-5 py-3 cursor-pointer"
              style={{ background: "rgba(26,58,92,0.5)" }}
            >
              <span style={{ color: "var(--muted-foreground)", flexShrink: 0 }}>
                {secaoAberta ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold tracking-widest uppercase text-left"
                        style={{ color: "var(--gold)", fontFamily: "var(--font-jakarta)" }}>
                    {secao.label}
                  </span>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {totalGeral > 0 ? ((secao.total / totalGeral) * 100).toFixed(1) : "0.0"}%
                    </span>
                    <span className="text-xs font-bold tabular"
                          style={{ color: cor, fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-jakarta)" }}>
                      {formatarMoeda(secao.total)}
                    </span>
                  </div>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="h-full rounded-full transition-all duration-700"
                       style={{ width: `${totalGeral > 0 ? Math.min((secao.total / totalGeral) * 100, 100) : 0}%`, background: cor, opacity: 0.5 }} />
                </div>
              </div>
            </button>

            {secaoAberta && (
              <div>
                {secao.categorias.map(({ categoria, total: catTotal, itens }) => {
                  const catKey    = `${secao.tipo}::${categoria}`;
                  const catAberta = catsAbertas.has(catKey);

                  return (
                    <div key={catKey} style={{ borderTop: "1px solid var(--border)" }}>
                      <button
                        onClick={() => toggleCat(catKey)}
                        className="w-full flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors"
                        style={{ background: "transparent" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <span style={{ color: "var(--muted-foreground)", flexShrink: 0, marginLeft: 8 }}>
                          {catAberta ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-medium truncate text-left"
                                  style={{ color: "var(--foreground)", fontFamily: "var(--font-jakarta)" }}>
                              {categoria}
                            </span>
                            <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                                {secao.total > 0 ? ((catTotal / secao.total) * 100).toFixed(1) : "0.0"}%
                              </span>
                              <span className="text-xs font-semibold tabular"
                                    style={{ color: cor, fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-jakarta)" }}>
                                {formatarMoeda(catTotal)}
                              </span>
                            </div>
                          </div>
                          <div className="h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                            <div className="h-full rounded-full transition-all duration-700"
                                 style={{ width: `${secao.total > 0 ? Math.min((catTotal / secao.total) * 100, 100) : 0}%`, background: cor, opacity: 0.4 }} />
                          </div>
                        </div>
                      </button>

                      {catAberta && (
                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.03)" }}>
                          {itens.map((item, i) => (
                            <div key={i}
                                 className="flex items-center justify-between py-2"
                                 style={{
                                   paddingLeft: "3.5rem", paddingRight: "1.25rem",
                                   borderBottom: i < itens.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none",
                                 }}>
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0"
                                      style={{ background: "rgba(200,168,75,0.08)", color: "var(--gold)", fontFamily: "var(--font-jakarta)" }}>
                                  {item.unidade}
                                </span>
                                <span className="text-xs truncate max-w-[260px]"
                                      style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}>
                                  {item.descricao}
                                </span>
                              </div>
                              <span className="text-xs tabular flex-shrink-0 ml-3"
                                    style={{ color: "var(--foreground)", fontVariantNumeric: "tabular-nums" }}>
                                {formatarMoeda(item.valor)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <div className="flex items-center justify-between px-5 py-3 rounded-xl mt-2"
           style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
        <span className="text-sm font-semibold" style={{ color: "var(--foreground)", fontFamily: "var(--font-jakarta)" }}>
          Total de Deduções
        </span>
        <span className="text-base font-bold tabular"
              style={{ color: "var(--danger)", fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-jakarta)" }}>
          {formatarMoeda(totalGeral)}
        </span>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="card-financial rounded-xl h-12 animate-pulse"
             style={{ background: "var(--bg-card)" }} />
      ))}
    </div>
  );
}
