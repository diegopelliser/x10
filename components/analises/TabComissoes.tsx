"use client";

import { formatarMoeda } from "@/lib/categories";
import type { ComissaoAssessor, ComissaoVertical } from "@/lib/queries";

interface Props {
  assessores:     ComissaoAssessor[];
  porVertical:    ComissaoVertical[];
  totalComissoes: number;
  receitaBruta:   number;
  loading:        boolean;
}

export function TabComissoes({ assessores, porVertical, totalComissoes, receitaBruta, loading }: Props) {
  const pctSobreReceita = receitaBruta > 0 ? (totalComissoes / receitaBruta) * 100 : 0;

  if (loading) return <Skeleton />;

  if (assessores.length === 0)
    return (
      <p className="text-sm py-8 text-center" style={{ color: "var(--muted-foreground)" }}>
        Sem comissões de vendedores no período.
      </p>
    );

  return (
    <div className="space-y-4">
      {/* KPIs de comissões */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-financial rounded-xl p-4">
          <p className="text-xs font-semibold tracking-wide uppercase mb-1"
             style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}>
            Total de Comissões
          </p>
          <p className="text-xl font-bold tabular"
             style={{ color: "var(--danger)", fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-jakarta)" }}>
            {formatarMoeda(totalComissoes)}
          </p>
        </div>
        <div className="card-financial rounded-xl p-4">
          <p className="text-xs font-semibold tracking-wide uppercase mb-1"
             style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}>
            % sobre Receita Bruta
          </p>
          <p className="text-xl font-bold tabular"
             style={{ color: pctSobreReceita > 30 ? "var(--danger)" : "var(--warning)", fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-jakarta)" }}>
            {pctSobreReceita.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Breakdown por vertical */}
      {porVertical.length > 1 && (
        <div className="card-financial rounded-xl overflow-hidden">
          <div style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="px-5 py-3">
              <span className="text-xs font-semibold tracking-widest uppercase"
                    style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}>
                Por Vertical / Centro de Custo
              </span>
            </div>
          </div>
          {porVertical.map((v, i) => (
            <div key={v.vertical}
                 className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.02]"
                 style={{ borderBottom: i < porVertical.length - 1 ? "1px solid var(--border)" : "none" }}>
              <span className="flex-1 text-sm font-medium truncate"
                    style={{ color: "var(--foreground)", fontFamily: "var(--font-jakarta)" }}>
                {v.vertical}
              </span>
              <div className="h-1 rounded-full overflow-hidden w-20 flex-shrink-0" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div className="h-full rounded-full" style={{ width: `${Math.min(v.percentual, 100)}%`, background: "var(--gold)", opacity: 0.7 }} />
              </div>
              <span className="text-xs tabular w-10 text-right flex-shrink-0"
                    style={{ color: "var(--muted-foreground)", fontVariantNumeric: "tabular-nums" }}>
                {v.percentual.toFixed(1)}%
              </span>
              <span className="text-sm font-semibold tabular text-right w-28 flex-shrink-0"
                    style={{ color: "var(--danger)", fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-jakarta)" }}>
                {formatarMoeda(v.valor)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tabela de assessores */}
      <div className="card-financial rounded-xl overflow-hidden">
        <div style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="grid px-5 py-3" style={{ gridTemplateColumns: "1fr auto auto" }}>
            {["Assessor / Vendedor", "Valor", "% do Total"].map(h => (
              <span key={h} className="text-xs font-semibold tracking-widest uppercase text-right first:text-left"
                    style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}>
                {h}
              </span>
            ))}
          </div>
        </div>

        {assessores.map((a, i) => (
          <div key={a.assessor}
               className="grid px-5 py-3 items-center transition-colors hover:bg-white/[0.02]"
               style={{
                 gridTemplateColumns: "1fr auto auto",
                 borderBottom: i < assessores.length - 1 ? "1px solid var(--border)" : "none",
               }}>
            <span className="text-sm font-medium truncate pr-4"
                  style={{ color: "var(--foreground)", fontFamily: "var(--font-jakarta)" }}>
              {a.assessor}
            </span>
            <span className="text-sm font-semibold tabular text-right pr-6"
                  style={{ color: "var(--danger)", fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-jakarta)" }}>
              {formatarMoeda(a.valor)}
            </span>
            <div className="flex items-center gap-2 justify-end min-w-[80px]">
              <div className="h-1 rounded-full overflow-hidden w-12" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div className="h-full rounded-full" style={{ width: `${Math.min(a.percentual, 100)}%`, background: "var(--danger)", opacity: 0.6 }} />
              </div>
              <span className="text-xs tabular w-10 text-right"
                    style={{ color: "var(--muted-foreground)", fontVariantNumeric: "tabular-nums" }}>
                {a.percentual.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}

        <div className="grid px-5 py-3 items-center"
             style={{ gridTemplateColumns: "1fr auto auto", background: "rgba(239,68,68,0.04)", borderTop: "1px solid rgba(239,68,68,0.12)" }}>
          <span className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>
            {assessores.length} assessor{assessores.length !== 1 ? "es" : ""}
          </span>
          <span className="text-sm font-bold tabular text-right pr-6"
                style={{ color: "var(--danger)", fontVariantNumeric: "tabular-nums" }}>
            {formatarMoeda(totalComissoes)}
          </span>
          <span className="text-xs text-right" style={{ color: "var(--muted-foreground)" }}>100%</span>
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map(i => <div key={i} className="card-financial rounded-xl h-20 animate-pulse" style={{ background: "var(--bg-card)" }} />)}
      </div>
      <div className="card-financial rounded-xl h-48 animate-pulse" style={{ background: "var(--bg-card)" }} />
    </div>
  );
}
