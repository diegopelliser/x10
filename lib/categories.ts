import type { Tipo } from "./supabase";

export const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
] as const;

export const MESES_ABREV = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
] as const;

export const UNIDADES = [
  { value: "GDI",    label: "Garibaldi (GDI)" },
  { value: "POA",    label: "Porto Alegre (POA)" },
  { value: "OUTROS", label: "Outros" },
] as const;

export const CATEGORIAS_POR_TIPO: Record<Tipo, string[]> = {
  receita: [
    "Assessoria de Investimentos",
    "Comissões Corban",
    "Comissões Consórcios",
    "Comissões V&P",
    "Rendimentos Financeiros",
    "Outras Receitas",
  ],
  imposto: [
    "Simples Nacional (DAS)",
    "ISS sobre Faturamento",
    "INSS sobre Salários",
    "FGTS",
    "Impostos Retidos",
    "Outros Impostos",
  ],
  custo: [
    "Comissões de Vendedores",
    "Remuneração de Estagiários",
    "Outros Custos Variáveis",
  ],
  despesa: [
    "Folha de Pagamento",
    "Pró-labore",
    "13º Salário / Férias",
    "Encargos Sociais",
    "Aluguel",
    "Energia / Internet / Condomínio",
    "Tecnologia e Software",
    "Honorários Contábeis",
    "Honorários Jurídicos",
    "Marketing e Eventos",
    "Bens e Materiais",
    "Outras Despesas",
  ],
};

export const TODAS_CATEGORIAS = Object.values(CATEGORIAS_POR_TIPO).flat();

export const TIPOS: { value: Tipo; label: string; cor: string }[] = [
  { value: "receita",  label: "Receita",  cor: "#22C55E" },
  { value: "imposto",  label: "Imposto",  cor: "#F59E0B" },
  { value: "custo",    label: "Custo",    cor: "#EF4444" },
  { value: "despesa",  label: "Despesa",  cor: "#EF4444" },
];

export function isDeducao(tipo: Tipo) {
  return tipo !== "receita";
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style:    "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(valor);
}

export function formatarMoedaCompacto(valor: number): string {
  if (Math.abs(valor) >= 1_000_000)
    return `R$ ${(valor / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (Math.abs(valor) >= 1_000)
    return `R$ ${(valor / 1_000).toFixed(0)}k`;
  return formatarMoeda(valor);
}

export function nomeMes(mes: number): string {
  return MESES[mes - 1] ?? "";
}

export function nomeMesAbrev(mes: number): string {
  return MESES_ABREV[mes - 1] ?? "";
}
