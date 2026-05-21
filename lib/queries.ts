import { supabase, type Lancamento, type LancamentoInsert, type Unidade } from "./supabase";

// ─── Tipos de retorno ────────────────────────────────────────

export interface DRELinhaItem {
  descricao: string;
  unidade:   string;
  valor:     number;
}

export interface DRELinha {
  categoria: string;
  valor:     number;
  itens:     DRELinhaItem[];
}

export interface DRESecao {
  titulo:   string;
  linhas:   DRELinha[];
  total:    number;
  tipo:     "receita" | "deducao" | "total";
}

export interface DRE {
  receitaBruta:    number;
  linhasReceita:   DRELinha[];
  impostos:        number;
  linhasImpostos:  DRELinha[];
  receitaLiquida:  number;
  custosVariaveis: number;
  linhasCustos:    DRELinha[];
  despesasFixas:   number;
  linhasDespesas:  DRELinha[];
  resultadoLiquido: number;
  margemLiquida:    number;
}

export interface EvolucaoMes {
  mes:      string;  // "Set", "Out" ...
  mesNum:   number;
  ano:      number;
  receita:  number;
  deducoes: number;
  resultado: number;
}

// ─── Queries ─────────────────────────────────────────────────

function filtroUnidade(unidade: Unidade | "TODOS") {
  if (unidade === "TODOS") return null;
  return unidade;
}

export async function getLancamentos(
  mes: number,
  ano: number,
  unidade: Unidade | "TODOS" = "TODOS"
): Promise<Lancamento[]> {
  let q = supabase
    .from("lancamentos")
    .select("*")
    .eq("mes", mes)
    .eq("ano", ano)
    .order("tipo")
    .order("categoria");

  const u = filtroUnidade(unidade);
  if (u) q = q.eq("unidade", u);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Lancamento[];
}

export async function getDRE(
  mes: number,
  ano: number,
  unidade: Unidade | "TODOS" = "TODOS"
): Promise<DRE> {
  const rows = await getLancamentos(mes, ano, unidade);

  const soma = (tipo: string, cat?: string) =>
    rows
      .filter(r => r.tipo === tipo && (cat ? r.categoria === cat : true))
      .reduce((s, r) => s + Number(r.valor), 0);

  const porCategoria = (tipo: string): DRELinha[] => {
    const cats = [...new Set(rows.filter(r => r.tipo === tipo).map(r => r.categoria))];
    return cats.map(c => {
      const catRows = rows.filter(r => r.tipo === tipo && r.categoria === c);
      return {
        categoria: c,
        valor: catRows.reduce((s, r) => s + Number(r.valor), 0),
        itens: catRows
          .map(r => ({ descricao: r.descricao ?? c, unidade: r.unidade, valor: Number(r.valor) }))
          .sort((a, b) => b.valor - a.valor),
      };
    }).filter(l => l.valor > 0).sort((a, b) => b.valor - a.valor);
  };

  const receitaBruta    = soma("receita");
  const impostos        = soma("imposto");
  const custosVariaveis = soma("custo");
  const despesasFixas   = soma("despesa");
  const receitaLiquida  = receitaBruta - impostos;
  const resultadoLiquido = receitaLiquida - custosVariaveis - despesasFixas;
  const margemLiquida   = receitaBruta > 0
    ? (resultadoLiquido / receitaBruta) * 100
    : 0;

  return {
    receitaBruta,
    linhasReceita:   porCategoria("receita"),
    impostos,
    linhasImpostos:  porCategoria("imposto"),
    receitaLiquida,
    custosVariaveis,
    linhasCustos:    porCategoria("custo"),
    despesasFixas,
    linhasDespesas:  porCategoria("despesa"),
    resultadoLiquido,
    margemLiquida,
  };
}

export async function getEvolucao(
  _meses: number,
  unidade: Unidade | "TODOS" = "TODOS"
): Promise<EvolucaoMes[]> {
  let q = supabase
    .from("lancamentos")
    .select("mes, ano, tipo, valor");

  const u = filtroUnidade(unidade);
  if (u) q = q.eq("unidade", u);

  const { data, error } = await q;
  if (error) throw error;

  const rows = (data ?? []) as Pick<Lancamento, "mes" | "ano" | "tipo" | "valor">[];
  const MESES_ABREV = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

  // Deriva os períodos diretamente dos dados existentes, ordenados cronologicamente
  const periodos = [...new Set(rows.map(r => `${r.ano}-${String(r.mes).padStart(2, "0")}`))]
    .sort()
    .map(key => ({ ano: Number(key.slice(0, 4)), mes: Number(key.slice(5)) }));

  return periodos.map(({ mes, ano }) => {
    const mRows = rows.filter(r => r.mes === mes && r.ano === ano);
    const receita  = mRows.filter(r => r.tipo === "receita").reduce((s, r) => s + Number(r.valor), 0);
    const deducoes = mRows.filter(r => r.tipo !== "receita").reduce((s, r) => s + Number(r.valor), 0);
    return {
      mes:       MESES_ABREV[mes - 1],
      mesNum:    mes,
      ano,
      receita,
      deducoes,
      resultado: receita - deducoes,
    };
  });
}

export async function getTopCategorias(
  mes: number,
  ano: number,
  tipo: "receita" | "deducao",
  limit = 5,
  unidade: Unidade | "TODOS" = "TODOS"
): Promise<DRELinha[]> {
  const rows = await getLancamentos(mes, ano, unidade);
  const filtered = tipo === "receita"
    ? rows.filter(r => r.tipo === "receita")
    : rows.filter(r => r.tipo !== "receita");

  const map = new Map<string, number>();
  for (const r of filtered) {
    map.set(r.categoria, (map.get(r.categoria) ?? 0) + Number(r.valor));
  }

  return [...map.entries()]
    .map(([categoria, valor]) => ({ categoria, valor, itens: [] }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, limit);
}

export async function getLancamentosLista(
  mes: number,
  ano: number,
  unidade: Unidade | "TODOS" = "TODOS"
): Promise<Lancamento[]> {
  return getLancamentos(mes, ano, unidade);
}

// ─── Tipos para análises ─────────────────────────────────────

export interface DetalheItem {
  descricao: string;
  unidade:   string;
  valor:     number;
}

export interface DetalheCategoria {
  categoria: string;
  total:     number;
  itens:     DetalheItem[];
}

export interface DetalheSecao {
  tipo:       string;
  label:      string;
  total:      number;
  categorias: DetalheCategoria[];
}

export interface ComissaoAssessor {
  assessor:   string;
  valor:      number;
  percentual: number;
}

export interface ComissaoVertical {
  vertical:   string;
  valor:      number;
  percentual: number;
}

export interface EvolucaoCategoria {
  mes:        string;
  mesNum:     number;
  ano:        number;
  categorias: Record<string, number>;
}

// ─── Análises ─────────────────────────────────────────────────

export async function getDetalheReceitas(
  mes: number,
  ano: number,
  unidade: Unidade | "TODOS" = "TODOS"
): Promise<DetalheCategoria[]> {
  const rows = await getLancamentos(mes, ano, unidade);
  const receitas = rows.filter(r => r.tipo === "receita");

  const map = new Map<string, DetalheItem[]>();
  for (const r of receitas) {
    const key = r.categoria;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push({ descricao: r.descricao ?? r.categoria, unidade: r.unidade, valor: Number(r.valor) });
  }

  return [...map.entries()]
    .map(([categoria, itens]) => ({
      categoria,
      total: itens.reduce((s, i) => s + i.valor, 0),
      itens: itens.sort((a, b) => b.valor - a.valor),
    }))
    .sort((a, b) => b.total - a.total);
}

export async function getDetalheDespesas(
  mes: number,
  ano: number,
  unidade: Unidade | "TODOS" = "TODOS"
): Promise<DetalheSecao[]> {
  const rows = await getLancamentos(mes, ano, unidade);
  const tiposLabel: Record<string, string> = {
    imposto: "Impostos",
    custo:   "Custos Variáveis",
    despesa: "Despesas Fixas",
  };

  const secoes: DetalheSecao[] = [];

  for (const [tipo, label] of Object.entries(tiposLabel)) {
    const filtered = rows.filter(r => r.tipo === tipo);
    if (filtered.length === 0) continue;

    const catMap = new Map<string, DetalheItem[]>();
    for (const r of filtered) {
      if (!catMap.has(r.categoria)) catMap.set(r.categoria, []);
      catMap.get(r.categoria)!.push({ descricao: r.descricao ?? r.categoria, unidade: r.unidade, valor: Number(r.valor) });
    }

    const categorias: DetalheCategoria[] = [...catMap.entries()]
      .map(([categoria, itens]) => ({
        categoria,
        total: itens.reduce((s, i) => s + i.valor, 0),
        itens: itens.sort((a, b) => b.valor - a.valor),
      }))
      .sort((a, b) => b.total - a.total);

    secoes.push({
      tipo,
      label,
      total: categorias.reduce((s, c) => s + c.total, 0),
      categorias,
    });
  }

  return secoes.sort((a, b) => b.total - a.total);
}

export async function getComissoes(
  mes: number,
  ano: number,
  unidade: Unidade | "TODOS" = "TODOS"
): Promise<{
  assessores:    ComissaoAssessor[];
  porVertical:   ComissaoVertical[];
  totalComissoes: number;
  receitaBruta:   number;
}> {
  const rows = await getLancamentos(mes, ano, unidade);

  const comissoes    = rows.filter(r => r.tipo === "custo" && r.categoria === "Comissões de Vendedores");
  const totalComissoes = comissoes.reduce((s, r) => s + Number(r.valor), 0);
  const receitaBruta   = rows.filter(r => r.tipo === "receita").reduce((s, r) => s + Number(r.valor), 0);

  // Agrupado por assessor
  const mapAssessor = new Map<string, number>();
  for (const r of comissoes) {
    const nome = r.descricao ?? "Sem nome";
    mapAssessor.set(nome, (mapAssessor.get(nome) ?? 0) + Number(r.valor));
  }
  const assessores: ComissaoAssessor[] = [...mapAssessor.entries()]
    .map(([assessor, valor]) => ({
      assessor,
      valor,
      percentual: totalComissoes > 0 ? (valor / totalComissoes) * 100 : 0,
    }))
    .sort((a, b) => b.valor - a.valor);

  // Agrupado por vertical (centro_custo)
  const mapVertical = new Map<string, number>();
  for (const r of comissoes) {
    const v = r.centro_custo ?? "Sem vertical";
    mapVertical.set(v, (mapVertical.get(v) ?? 0) + Number(r.valor));
  }
  const porVertical: ComissaoVertical[] = [...mapVertical.entries()]
    .map(([vertical, valor]) => ({
      vertical,
      valor,
      percentual: totalComissoes > 0 ? (valor / totalComissoes) * 100 : 0,
    }))
    .sort((a, b) => b.valor - a.valor);

  return { assessores, porVertical, totalComissoes, receitaBruta };
}

export async function getEvolucaoCategorias(
  tipo: "receita" | "custo" | "despesa" | "imposto",
  unidade: Unidade | "TODOS" = "TODOS",
  _meses = 7
): Promise<EvolucaoCategoria[]> {
  let q = supabase
    .from("lancamentos")
    .select("mes, ano, categoria, valor")
    .eq("tipo", tipo);

  const u = filtroUnidade(unidade);
  if (u) q = q.eq("unidade", u);

  const { data, error } = await q;
  if (error) throw error;

  const rows = (data ?? []) as Pick<Lancamento, "mes" | "ano" | "categoria" | "valor">[];
  const MESES_ABREV = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

  const periodos = [...new Set(rows.map(r => `${r.ano}-${String(r.mes).padStart(2, "0")}`))]
    .sort()
    .map(key => ({ ano: Number(key.slice(0, 4)), mes: Number(key.slice(5)) }));

  return periodos.map(({ mes, ano }) => {
    const mRows = rows.filter(r => r.mes === mes && r.ano === ano);
    const categorias: Record<string, number> = {};
    for (const r of mRows) {
      categorias[r.categoria] = (categorias[r.categoria] ?? 0) + Number(r.valor);
    }
    return { mes: MESES_ABREV[mes - 1], mesNum: mes, ano, categorias };
  });
}

export async function getEvolucaoDescricoes(
  tipo: "receita" | "custo" | "despesa" | "imposto",
  categoria: string,
  unidade: Unidade | "TODOS" = "TODOS"
): Promise<EvolucaoCategoria[]> {
  let q = supabase
    .from("lancamentos")
    .select("mes, ano, descricao, valor")
    .eq("tipo", tipo)
    .eq("categoria", categoria);

  const u = filtroUnidade(unidade);
  if (u) q = q.eq("unidade", u);

  const { data, error } = await q;
  if (error) throw error;

  const rows = (data ?? []) as Pick<Lancamento, "mes" | "ano" | "descricao" | "valor">[];
  const MESES_ABREV = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

  const periodos = [...new Set(rows.map(r => `${r.ano}-${String(r.mes).padStart(2, "0")}`))]
    .sort()
    .map(key => ({ ano: Number(key.slice(0, 4)), mes: Number(key.slice(5)) }));

  return periodos.map(({ mes, ano }) => {
    const mRows = rows.filter(r => r.mes === mes && r.ano === ano);
    const categorias: Record<string, number> = {};
    for (const r of mRows) {
      const key = r.descricao ?? "Sem descrição";
      categorias[key] = (categorias[key] ?? 0) + Number(r.valor);
    }
    return { mes: MESES_ABREV[mes - 1], mesNum: mes, ano, categorias };
  });
}

export async function getLancamentoById(id: string): Promise<Lancamento | null> {
  const { data, error } = await supabase
    .from("lancamentos")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Lancamento;
}

export async function upsertLancamento(data: LancamentoInsert) {
  const { error } = await supabase.from("lancamentos").insert(data);
  if (error) throw error;
}

export async function updateLancamento(id: string, data: Partial<LancamentoInsert>) {
  const { error } = await supabase.from("lancamentos").update(data).eq("id", id);
  if (error) throw error;
}

export async function deleteLancamento(id: string) {
  const { error } = await supabase.from("lancamentos").delete().eq("id", id);
  if (error) throw error;
}
