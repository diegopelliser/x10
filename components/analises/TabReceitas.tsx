"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatarMoeda } from "@/lib/categories";
import type { DetalheCategoria } from "@/lib/queries";

interface Props {
  categorias: DetalheCategoria[];
  loading: boolean;
}

export function TabReceitas({ categorias, loading }: Props) {
  const [abertos, setAbertos] = useState<Set<string>>(new Set());
  const total = categorias.reduce((s, c) => s + c.total, 0);

  const toggle = (cat: string) =>
    setAbertos(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });

  if (loading) return <Skeleton />;

  if (categorias.length === 0)
    return (
      <p className="text-sm py-8 text-center" style={{ color: "var(--muted-foreground)" }}>
        Sem receitas no período selecionado.
      </p>
    );

  return (
    <div className="space-y-2">
      {categorias.map(({ categoria, total: catTotal, itens }) => {
        const pct   = total > 0 ? (catTotal / total) * 100 : 0;
        const aberto = abertos.has(categoria);

        return (
          <div key={categoria} className="card-financial rounded-xl overflow-hidden">
            {/* Header da categoria */}
            <button
              onClick={() => toggle(categoria)}
              className="w-full flex items-center gap-3 px-5 py-4 transition-colors duration-150 cursor-pointer"
              style={{ background: "transparent" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ color: "var(--muted-foreground)", flexShrink: 0 }}>
                {aberto ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium truncate"
                        style={{ color: "var(--foreground)", fontFamily: "var(--font-jakarta)" }}>
                    {categoria}
                  </span>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {pct.toFixed(1)}%
                    </span>
                    <span className="text-sm font-semibold tabular"
                          style={{ color: "var(--success)", fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-jakarta)" }}>
                      {formatarMoeda(catTotal)}
                    </span>
                  </div>
                </div>
                {/* Barra de proporção */}
                <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="h-full rounded-full transition-all duration-700"
                       style={{ width: `${Math.min(pct, 100)}%`, background: "var(--success)", opacity: 0.6 }} />
                </div>
              </div>
            </button>

            {/* Itens expandidos */}
            {aberto && (
              <div style={{ borderTop: "1px solid var(--border)" }}>
                {itens.map((item, i) => {
                  const itemPct = catTotal > 0 ? (item.valor / catTotal) * 100 : 0;
                  return (
                  <div key={i}
                       className="px-5 py-2.5"
                       style={{ borderBottom: i < itens.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none" }}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                              style={{ background: "rgba(200,168,75,0.1)", color: "var(--gold)", fontFamily: "var(--font-jakarta)" }}>
                          {item.unidade}
                        </span>
                        <span className="text-xs truncate max-w-[240px]"
                              style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}>
                          {item.descricao}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                        <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                          {itemPct.toFixed(1)}%
                        </span>
                        <span className="text-xs font-medium tabular"
                              style={{ color: "var(--foreground)", fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-jakarta)" }}>
                          {formatarMoeda(item.valor)}
                        </span>
                      </div>
                    </div>
                    <div className="h-0.5 rounded-full overflow-hidden ml-10" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <div className="h-full rounded-full transition-all duration-700"
                           style={{ width: `${Math.min(itemPct, 100)}%`, background: "var(--success)", opacity: 0.35 }} />
                    </div>
                  </div>
                  );
                })}

                {/* Subtotal */}
                <div className="flex items-center justify-between px-5 py-2.5"
                     style={{ background: "rgba(34,197,94,0.04)", borderTop: "1px solid rgba(34,197,94,0.1)" }}>
                  <span className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>
                    {itens.length} {itens.length === 1 ? "lançamento" : "lançamentos"}
                  </span>
                  <span className="text-xs font-bold tabular"
                        style={{ color: "var(--success)", fontVariantNumeric: "tabular-nums" }}>
                    {formatarMoeda(catTotal)}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Total geral */}
      <div className="flex items-center justify-between px-5 py-3 rounded-xl mt-4"
           style={{ background: "rgba(200,168,75,0.06)", border: "1px solid rgba(200,168,75,0.2)" }}>
        <span className="text-sm font-semibold" style={{ color: "var(--foreground)", fontFamily: "var(--font-jakarta)" }}>
          Total de Receitas
        </span>
        <span className="text-base font-bold tabular"
              style={{ color: "var(--success)", fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-jakarta)" }}>
          {formatarMoeda(total)}
        </span>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map(i => (
        <div key={i} className="card-financial rounded-xl h-16 animate-pulse"
             style={{ background: "var(--bg-card)" }} />
      ))}
    </div>
  );
}
