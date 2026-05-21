"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { MESES, UNIDADES } from "@/lib/categories";
import type { Unidade } from "@/lib/supabase";

interface FilterBarProps {
  mes: number;
  ano: number;
  unidade: Unidade | "TODOS";
  onMesChange:     (mes: number) => void;
  onAnoChange:     (ano: number) => void;
  onUnidadeChange: (u: Unidade | "TODOS") => void;
  title?: string;
}

// Período com dados importados
const MIN = { mes: 9, ano: 2025 };
const MAX = { mes: 3, ano: 2026 };

function periodoEmNumero(mes: number, ano: number) {
  return ano * 12 + mes;
}

function navegar(mes: number, ano: number, delta: -1 | 1): { mes: number; ano: number } {
  let m = mes + delta;
  let a = ano;
  if (m < 1)  { m = 12; a -= 1; }
  if (m > 12) { m = 1;  a += 1; }
  return { mes: m, ano: a };
}

const unidadeOpts = [
  { value: "TODOS", label: "Consolidado" },
  ...UNIDADES,
];

export function FilterBar({
  mes, ano, unidade,
  onMesChange, onAnoChange, onUnidadeChange,
  title,
}: FilterBarProps) {
  const atual  = periodoEmNumero(mes, ano);
  const minNum = periodoEmNumero(MIN.mes, MIN.ano);
  const maxNum = periodoEmNumero(MAX.mes, MAX.ano);

  const podePrev = atual > minNum;
  const podeNext = atual < maxNum;

  const handlePrev = () => {
    if (!podePrev) return;
    const { mes: m, ano: a } = navegar(mes, ano, -1);
    onMesChange(m);
    onAnoChange(a);
  };

  const handleNext = () => {
    if (!podeNext) return;
    const { mes: m, ano: a } = navegar(mes, ano, 1);
    onMesChange(m);
    onAnoChange(a);
  };

  const labelPeriodo = `${MESES[mes - 1]} ${ano}`;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
      {title && (
        <h1 className="text-2xl font-semibold flex-1"
            style={{ fontFamily: "var(--font-cormorant)", color: "var(--foreground)" }}>
          {title}
        </h1>
      )}

      <div className="flex items-center gap-2 flex-wrap shrink-0">
        {/* Seletor de unidade */}
        <div className="flex rounded-lg overflow-hidden"
             style={{ border: "1px solid var(--border)" }}>
          {unidadeOpts.map(opt => (
            <button
              key={opt.value}
              onClick={() => onUnidadeChange(opt.value as Unidade | "TODOS")}
              className="px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer"
              style={{
                background: unidade === opt.value ? "var(--gold)" : "transparent",
                color:      unidade === opt.value ? "var(--bg-base)" : "var(--muted-foreground)",
                fontFamily: "var(--font-jakarta)",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Navegador de período */}
        <div className="flex items-center rounded-lg overflow-hidden"
             style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
          <button
            onClick={handlePrev}
            disabled={!podePrev}
            className="flex items-center justify-center w-8 h-8 transition-all duration-150"
            style={{
              color:   podePrev ? "var(--foreground)" : "var(--muted-foreground)",
              opacity: podePrev ? 1 : 0.35,
              cursor:  podePrev ? "pointer" : "not-allowed",
            }}
          >
            <ChevronLeft size={14} />
          </button>

          <span
            className="px-3 text-xs font-semibold select-none"
            style={{
              color:       "var(--foreground)",
              fontFamily:  "var(--font-jakarta)",
              minWidth:    112,
              textAlign:   "center",
            }}
          >
            {labelPeriodo}
          </span>

          <button
            onClick={handleNext}
            disabled={!podeNext}
            className="flex items-center justify-center w-8 h-8 transition-all duration-150"
            style={{
              color:   podeNext ? "var(--foreground)" : "var(--muted-foreground)",
              opacity: podeNext ? 1 : 0.35,
              cursor:  podeNext ? "pointer" : "not-allowed",
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
