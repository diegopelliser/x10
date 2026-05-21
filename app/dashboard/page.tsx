"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, DollarSign, TrendingDown, Percent } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { EvolutionChart } from "@/components/dashboard/EvolutionChart";
import { FilterBar } from "@/components/layout/FilterBar";
import { getDRE, getEvolucao, getTopCategorias, type DRE, type EvolucaoMes, type DRELinha } from "@/lib/queries";
import { formatarMoeda } from "@/lib/categories";
import type { Unidade } from "@/lib/supabase";

export default function DashboardPage() {
  const hoje = new Date();
  const [mes, setMes]         = useState(hoje.getMonth() + 1);
  const [ano, setAno]         = useState(hoje.getFullYear());
  const [unidade, setUnidade] = useState<Unidade | "TODOS">("TODOS");

  const [dre, setDre]             = useState<DRE | null>(null);
  const [evolucao, setEvolucao]   = useState<EvolucaoMes[]>([]);
  const [topReceitas, setTopReceitas] = useState<DRELinha[]>([]);
  const [topDespesas, setTopDespesas] = useState<DRELinha[]>([]);
  const [loading, setLoading]     = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [dreData, evolData, recData, despData] = await Promise.all([
        getDRE(mes, ano, unidade),
        getEvolucao(7, unidade),
        getTopCategorias(mes, ano, "receita", 5, unidade),
        getTopCategorias(mes, ano, "deducao", 5, unidade),
      ]);
      setDre(dreData);
      setEvolucao(evolData);
      setTopReceitas(recData);
      setTopDespesas(despData);
    } finally {
      setLoading(false);
    }
  }, [mes, ano, unidade]);

  useEffect(() => { carregar(); }, [carregar]);

  const dreAnterior = dre; // placeholder para variação futura

  return (
    <div className="p-6 max-w-7xl">
      <FilterBar
        mes={mes} ano={ano} unidade={unidade}
        onMesChange={setMes} onAnoChange={setAno} onUnidadeChange={setUnidade}
        title="Dashboard"
      />

      {loading && (
        <div className="flex items-center gap-3 mb-6 animate-fade-in">
          <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
               style={{ borderColor: "rgba(200,168,75,0.4)", borderTopColor: "var(--gold)" }} />
          <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>Carregando...</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          label="Receita Total"
          valor={dre?.receitaBruta ?? 0}
          icon={TrendingUp}
          variante="gold"
          delay={0}
        />
        <KPICard
          label="Custos e Despesas"
          valor={(dre?.impostos ?? 0) + (dre?.custosVariaveis ?? 0) + (dre?.despesasFixas ?? 0)}
          icon={DollarSign}
          variante="default"
          delay={50}
        />
        <KPICard
          label="Resultado Líquido"
          valor={dre?.resultadoLiquido ?? 0}
          icon={TrendingDown}
          variante={(dre?.resultadoLiquido ?? 0) >= 0 ? "success" : "danger"}
          delay={100}
        />
        <KPICard
          label="Margem Líquida"
          valor={dre?.margemLiquida ?? 0}
          icon={Percent}
          formato="percentual"
          variante={(dre?.margemLiquida ?? 0) >= 0 ? "success" : "danger"}
          delay={150}
        />
      </div>

      {/* Gráfico de Evolução */}
      <div className="mb-6 animate-fade-up stagger-3">
        <EvolutionChart data={evolucao} />
      </div>

      {/* Top Receitas e Despesas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TopCard title="Top Receitas" linhas={topReceitas} total={dre?.receitaBruta ?? 0} cor="var(--success)" delay={250} />
        <TopCard title="Top Deduções" linhas={topDespesas} total={(dre?.impostos ?? 0) + (dre?.custosVariaveis ?? 0) + (dre?.despesasFixas ?? 0)} cor="var(--danger)" delay={300} />
      </div>
    </div>
  );
}

function TopCard({ title, linhas, total, cor, delay }: {
  title: string;
  linhas: DRELinha[];
  total: number;
  cor: string;
  delay: number;
}) {
  return (
    <div className="card-financial rounded-2xl p-5 animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
      <p className="text-xs font-semibold tracking-widest uppercase mb-4"
         style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}>
        {title}
      </p>

      {linhas.length === 0 ? (
        <p className="text-sm py-4 text-center" style={{ color: "var(--muted-foreground)" }}>
          Sem dados
        </p>
      ) : (
        <ul className="space-y-3">
          {linhas.map(({ categoria, valor }) => {
            const pct = total > 0 ? (valor / total) * 100 : 0;
            return (
              <li key={categoria}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium truncate max-w-[160px]"
                        style={{ color: "var(--foreground)", fontFamily: "var(--font-jakarta)" }}>
                    {categoria}
                  </span>
                  <span className="text-xs tabular ml-2 flex-shrink-0"
                        style={{ color: "var(--foreground)", fontVariantNumeric: "tabular-nums" }}>
                    {formatarMoeda(valor)}
                  </span>
                </div>
                {/* Barra de proporção */}
                <div className="h-1 rounded-full overflow-hidden"
                     style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="h-full rounded-full transition-all duration-700"
                       style={{ width: `${Math.min(pct, 100)}%`, background: cor, opacity: 0.7 }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
