"use client";

import { useState, useEffect, useCallback } from "react";
import { FilterBar } from "@/components/layout/FilterBar";
import { TabReceitas }   from "@/components/analises/TabReceitas";
import { TabDespesas }   from "@/components/analises/TabDespesas";
import { TabComissoes }  from "@/components/analises/TabComissoes";
import { TabEvolucao }   from "@/components/analises/TabEvolucao";
import { TabExecutivo }  from "@/components/analises/TabExecutivo";
import {
  getDetalheReceitas, getDetalheDespesas, getComissoes, getEvolucaoCategorias, getTopCategorias,
  type DetalheCategoria, type DetalheSecao, type ComissaoAssessor, type ComissaoVertical,
  type EvolucaoCategoria, type DRELinha,
} from "@/lib/queries";
import type { Unidade } from "@/lib/supabase";
import type { Tipo } from "@/lib/supabase";

type TabId = "executivo" | "receitas" | "despesas" | "comissoes" | "evolucao";
type TipoExec = "receita" | "despesa" | "custo";

const TABS: { id: TabId; label: string }[] = [
  { id: "executivo",  label: "Executivo"  },
  { id: "receitas",   label: "Receitas"   },
  { id: "despesas",   label: "Despesas"   },
  { id: "comissoes",  label: "Comissões"  },
  { id: "evolucao",   label: "Evolução"   },
];

export default function AnalisesPage() {
  const hoje = new Date();
  const [mes, setMes]         = useState(hoje.getMonth() + 1);
  const [ano, setAno]         = useState(hoje.getFullYear());
  const [unidade, setUnidade] = useState<Unidade | "TODOS">("TODOS");
  const [tab, setTab]         = useState<TabId>("executivo");
  const [tipoEvolucao,    setTipoEvolucao]    = useState<Tipo>("receita");
  const [tipoEvolucaoExec, setTipoEvolucaoExec] = useState<TipoExec>("receita");

  const [receitas,    setReceitas]    = useState<DetalheCategoria[]>([]);
  const [despesas,    setDespesas]    = useState<DetalheSecao[]>([]);
  const [comissoes,   setComissoes]   = useState<{ assessores: ComissaoAssessor[]; porVertical: ComissaoVertical[]; totalComissoes: number; receitaBruta: number }>({ assessores: [], porVertical: [], totalComissoes: 0, receitaBruta: 0 });
  const [evolucao,    setEvolucao]    = useState<EvolucaoCategoria[]>([]);

  const [topReceitas,   setTopReceitas]   = useState<DRELinha[]>([]);
  const [topDespesas,   setTopDespesas]   = useState<DRELinha[]>([]);
  const [evolucaoExec,  setEvolucaoExec]  = useState<EvolucaoCategoria[]>([]);

  const [loadingMes,  setLoadingMes]  = useState(true);
  const [loadingEvo,  setLoadingEvo]  = useState(true);
  const [loadingExec, setLoadingExec] = useState(true);

  const carregarMes = useCallback(async () => {
    setLoadingMes(true);
    try {
      const [rec, desp, com] = await Promise.all([
        getDetalheReceitas(mes, ano, unidade),
        getDetalheDespesas(mes, ano, unidade),
        getComissoes(mes, ano, unidade),
      ]);
      setReceitas(rec);
      setDespesas(desp);
      setComissoes(com);
    } finally {
      setLoadingMes(false);
    }
  }, [mes, ano, unidade]);

  const carregarEvolucao = useCallback(async () => {
    setLoadingEvo(true);
    try {
      setEvolucao(await getEvolucaoCategorias(tipoEvolucao, unidade, 7));
    } finally {
      setLoadingEvo(false);
    }
  }, [tipoEvolucao, unidade]);

  const carregarExecutivo = useCallback(async () => {
    setLoadingExec(true);
    try {
      const [topRec, topDesp, evo] = await Promise.all([
        getTopCategorias(mes, ano, "receita",  5, unidade),
        getTopCategorias(mes, ano, "deducao",  5, unidade),
        getEvolucaoCategorias(tipoEvolucaoExec, unidade, 7),
      ]);
      setTopReceitas(topRec);
      setTopDespesas(topDesp);
      setEvolucaoExec(evo);
    } finally {
      setLoadingExec(false);
    }
  }, [mes, ano, unidade, tipoEvolucaoExec]);

  useEffect(() => { carregarMes(); },       [carregarMes]);
  useEffect(() => { carregarEvolucao(); },  [carregarEvolucao]);
  useEffect(() => { carregarExecutivo(); }, [carregarExecutivo]);

  return (
    <div className="p-6 max-w-5xl">
      {/* Header + Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-semibold"
              style={{ fontFamily: "var(--font-cormorant)", color: "var(--foreground)" }}>
            Análises
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}>
            Detalhamento de receitas, despesas e evolução por linha
          </p>
        </div>
        <FilterBar
          mes={mes} ano={ano} unidade={unidade}
          onMesChange={setMes} onAnoChange={setAno} onUnidadeChange={setUnidade}
        />
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit"
           style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer"
                  style={{
                    background: tab === t.id ? "var(--gold)" : "transparent",
                    color:      tab === t.id ? "var(--bg-base)" : "var(--muted-foreground)",
                    fontFamily: "var(--font-jakarta)",
                  }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Conteúdo da aba */}
      <div className="animate-fade-up">
        {tab === "executivo"  && <TabExecutivo topReceitas={topReceitas} topDespesas={topDespesas} evolucao={evolucaoExec} tipoEvolucao={tipoEvolucaoExec} onTipoChange={setTipoEvolucaoExec} loading={loadingExec} />}
        {tab === "receitas"   && <TabReceitas  categorias={receitas} loading={loadingMes} />}
        {tab === "despesas"   && <TabDespesas  secoes={despesas}     loading={loadingMes} />}
        {tab === "comissoes"  && <TabComissoes assessores={comissoes.assessores} porVertical={comissoes.porVertical} totalComissoes={comissoes.totalComissoes} receitaBruta={comissoes.receitaBruta} loading={loadingMes} />}
        {tab === "evolucao"   && <TabEvolucao  dados={evolucao} loading={loadingEvo} tipo={tipoEvolucao} unidade={unidade} onTipoChange={setTipoEvolucao} />}
      </div>
    </div>
  );
}
