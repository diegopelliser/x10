"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { formatarMoeda } from "@/lib/categories";
import type { DRE, DRELinha, DRELinhaItem } from "@/lib/queries";
import { cn } from "@/lib/utils";

interface DRETableProps {
  dre: DRE;
  onPrint?: () => void;
}

const BADGE_COR: Record<string, string> = {
  GDI:    "rgba(200,168,75,0.15)",
  POA:    "rgba(59,130,246,0.15)",
  OUTROS: "rgba(100,100,100,0.15)",
};
const BADGE_TEXT: Record<string, string> = {
  GDI:    "var(--gold)",
  POA:    "#60A5FA",
  OUTROS: "var(--muted-foreground)",
};

function SubLinha({ item }: { item: DRELinhaItem }) {
  return (
    <tr className="transition-colors duration-100 hover:bg-white/[0.015]">
      <td className="py-1.5 pl-14 pr-4">
        <div className="flex items-center gap-2">
          <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                style={{ background: BADGE_COR[item.unidade] ?? BADGE_COR.OUTROS, color: BADGE_TEXT[item.unidade] ?? BADGE_TEXT.OUTROS }}>
            {item.unidade}
          </span>
          <span className="text-xs truncate" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)", maxWidth: 340 }}>
            {item.descricao}
          </span>
        </div>
      </td>
      <td className="py-1.5 pr-6 text-right text-xs tabular"
          style={{ color: "var(--muted-foreground)", fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-jakarta)" }}>
        {formatarMoeda(item.valor)}
      </td>
    </tr>
  );
}

function LinhaItem({
  categoria, valor, cor, itens, aberto, onToggle,
}: DRELinha & { cor?: string; aberto: boolean; onToggle: () => void }) {
  const expansivel = itens.length > 1;
  return (
    <>
      <tr
        className={cn("transition-colors duration-100", expansivel && "cursor-pointer hover:bg-white/[0.02]")}
        onClick={expansivel ? onToggle : undefined}
      >
        <td className="py-2 pl-4 pr-4 text-sm">
          <div className="flex items-center gap-1.5">
            {expansivel ? (
              aberto
                ? <ChevronDown size={14} style={{ color: "var(--gold)", flexShrink: 0 }} />
                : <ChevronRight size={14} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
            ) : (
              <span className="w-3.5 shrink-0" />
            )}
            <span style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}>
              {categoria}
            </span>
          </div>
        </td>
        <td className="py-2 pr-6 text-right text-sm tabular font-medium"
            style={{ color: cor ?? "var(--foreground)", fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-jakarta)" }}>
          {formatarMoeda(valor)}
        </td>
      </tr>
      {aberto && itens.map((item, idx) => (
        <SubLinha key={idx} item={item} />
      ))}
    </>
  );
}

function LinhaTotal({ label, valor, destaque, borda }: {
  label: string; valor: number; destaque?: boolean; borda?: boolean;
}) {
  const cor = valor >= 0 ? "var(--success)" : "var(--danger)";
  return (
    <tr className={cn(borda && "border-t")} style={borda ? { borderColor: "rgba(200,168,75,0.3)" } : {}}>
      <td className="py-3 pl-4 pr-4 font-semibold text-sm"
          style={{ color: destaque ? cor : "var(--foreground)", fontFamily: "var(--font-jakarta)" }}>
        {label}
      </td>
      <td className="py-3 pr-6 text-right font-semibold text-sm tabular"
          style={{ color: destaque ? cor : "var(--foreground)", fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-jakarta)" }}>
        {formatarMoeda(valor)}
      </td>
    </tr>
  );
}

function SecaoHeader({ label, total, cor }: { label: string; total: number; cor: string }) {
  return (
    <tr>
      <td colSpan={2} className="py-2 pl-4 pr-6" style={{ background: "rgba(26,58,92,0.5)" }}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: "var(--gold)", fontFamily: "var(--font-jakarta)" }}>
            {label}
          </span>
          <span className="text-xs font-semibold tabular"
                style={{ color: cor, fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-jakarta)" }}>
            {formatarMoeda(total)}
          </span>
        </div>
      </td>
    </tr>
  );
}

export function DRETable({ dre, onPrint }: DRETableProps) {
  const [abertos, setAbertos] = useState<Set<string>>(new Set());

  const toggleCategoria = (key: string) =>
    setAbertos(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const totalDeducoes = dre.impostos + dre.custosVariaveis + dre.despesasFixas;
  const margemCor     = dre.margemLiquida >= 0 ? "var(--success)" : "var(--danger)";

  const renderLinhas = (linhas: DRELinha[], cor?: string, prefix = "") =>
    linhas.map(l => {
      const key = `${prefix}-${l.categoria}`;
      return (
        <LinhaItem
          key={key}
          {...l}
          cor={cor}
          aberto={abertos.has(key)}
          onToggle={() => toggleCategoria(key)}
        />
      );
    });

  return (
    <div className="card-financial rounded-2xl overflow-hidden animate-fade-up">
      <div className="flex items-center justify-between px-6 py-4"
           style={{ borderBottom: "1px solid var(--border)" }}>
        <h2 className="text-xl font-semibold"
            style={{ fontFamily: "var(--font-cormorant)", color: "var(--foreground)" }}>
          DRE Gerencial
        </h2>
        {onPrint && (
          <button
            onClick={onPrint}
            className="no-print text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-150 cursor-pointer"
            style={{
              border: "1px solid rgba(200,168,75,0.25)",
              color: "var(--gold)",
              background: "transparent",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(200,168,75,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            Exportar PDF
          </button>
        )}
      </div>

      <table className="w-full">
        <tbody>
          {/* RECEITA BRUTA */}
          <SecaoHeader label="Receita Bruta" total={dre.receitaBruta} cor="var(--success)" />
          {renderLinhas(dre.linhasReceita, "var(--foreground)", "rec")}
          {dre.linhasReceita.length === 0 && (
            <tr><td colSpan={2} className="py-2 pl-8 text-sm" style={{ color: "var(--muted-foreground)" }}>Sem lançamentos</td></tr>
          )}

          {/* (–) IMPOSTOS */}
          <SecaoHeader label="(–) Impostos" total={dre.impostos} cor="var(--warning)" />
          {renderLinhas(dre.linhasImpostos, "var(--warning)", "imp")}

          {/* = RECEITA LÍQUIDA */}
          <LinhaTotal label="= Receita Líquida" valor={dre.receitaLiquida} borda />

          {/* (–) CUSTOS VARIÁVEIS */}
          <SecaoHeader label="(–) Custos Variáveis" total={dre.custosVariaveis} cor="var(--danger)" />
          {renderLinhas(dre.linhasCustos, "var(--danger)", "cus")}

          {/* (–) DESPESAS FIXAS */}
          <SecaoHeader label="(–) Despesas Fixas" total={dre.despesasFixas} cor="var(--danger)" />
          {renderLinhas(dre.linhasDespesas, "var(--danger)", "desp")}

          {/* = RESULTADO LÍQUIDO */}
          <LinhaTotal label="= Resultado Líquido" valor={dre.resultadoLiquido} destaque borda />

          {/* Margem */}
          <tr style={{ background: "rgba(200,168,75,0.05)" }}>
            <td className="py-3 pl-4 text-sm font-medium" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}>
              Margem Líquida
            </td>
            <td className="py-3 pr-6 text-right text-sm font-bold tabular"
                style={{ color: margemCor, fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-jakarta)" }}>
              {dre.margemLiquida.toFixed(1)}%
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
