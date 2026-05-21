"use client";

import { useState, useEffect, useCallback } from "react";
import { FilterBar } from "@/components/layout/FilterBar";
import { DRETable } from "@/components/dre/DRETable";
import { getDRE, type DRE } from "@/lib/queries";
import type { Unidade } from "@/lib/supabase";

export default function DREPage() {
  const hoje = new Date();
  const [mes, setMes]         = useState(hoje.getMonth() + 1);
  const [ano, setAno]         = useState(hoje.getFullYear());
  const [unidade, setUnidade] = useState<Unidade | "TODOS">("TODOS");
  const [dre, setDre]         = useState<DRE | null>(null);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      setDre(await getDRE(mes, ano, unidade));
    } finally {
      setLoading(false);
    }
  }, [mes, ano, unidade]);

  useEffect(() => { carregar(); }, [carregar]);

  const handlePrint = () => window.print();

  return (
    <div className="p-6 max-w-3xl">
      <FilterBar
        mes={mes} ano={ano} unidade={unidade}
        onMesChange={setMes} onAnoChange={setAno} onUnidadeChange={setUnidade}
        title="DRE Gerencial"
      />

      {loading ? (
        <div className="flex items-center gap-3 animate-fade-in">
          <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
               style={{ borderColor: "rgba(200,168,75,0.4)", borderTopColor: "var(--gold)" }} />
          <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>Carregando...</span>
        </div>
      ) : dre ? (
        <DRETable dre={dre} onPrint={handlePrint} />
      ) : (
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Sem dados para o período selecionado.
        </p>
      )}
    </div>
  );
}
