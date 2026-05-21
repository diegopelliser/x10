import { createClient } from "@supabase/supabase-js";

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key);

export type Unidade = "GDI" | "POA" | "OUTROS";
export type Tipo    = "receita" | "custo" | "despesa" | "imposto";

export interface Lancamento {
  id:           string;
  mes:          number;
  ano:          number;
  unidade:      Unidade;
  tipo:         Tipo;
  categoria:    string;
  descricao:    string | null;
  valor:        number;
  centro_custo: string | null;
  created_at:   string;
  updated_at:   string;
}

export interface LancamentoInsert {
  mes:          number;
  ano:          number;
  unidade:      Unidade;
  tipo:         Tipo;
  categoria:    string;
  descricao?:   string;
  valor:        number;
  centro_custo?: string;
}
