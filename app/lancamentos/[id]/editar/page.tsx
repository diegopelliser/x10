"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { updateLancamento, getLancamentoById } from "@/lib/queries";
import { CATEGORIAS_POR_TIPO, MESES, TIPOS, UNIDADES } from "@/lib/categories";
import type { Tipo, Unidade } from "@/lib/supabase";

interface FormState {
  mes:       string;
  ano:       string;
  unidade:   string;
  tipo:      string;
  categoria: string;
  descricao: string;
  valor:     string;
}

const ANOS = ["2025", "2026", "2027"];

const inputStyle: React.CSSProperties = {
  background:   "var(--bg-hover)",
  border:       "1px solid var(--border)",
  color:        "var(--foreground)",
  fontFamily:   "var(--font-jakarta)",
  borderRadius: "0.5rem",
  padding:      "0.5rem 0.75rem",
  width:        "100%",
  fontSize:     "0.875rem",
  outline:      "none",
};

const inputErrorStyle: React.CSSProperties = {
  ...inputStyle,
  borderColor: "var(--danger)",
};

export default function EditarLancamentoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState<FormState>({
    mes:       "",
    ano:       "",
    unidade:   "GDI",
    tipo:      "receita",
    categoria: "",
    descricao: "",
    valor:     "",
  });
  const [errors, setErrors]   = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarLancamento() {
      try {
        const lancamento = await getLancamentoById(id);

        if (!lancamento) {
          toast.error("Lançamento não encontrado.");
          router.push("/lancamentos");
          return;
        }

        setForm({
          mes:       String(lancamento.mes),
          ano:       String(lancamento.ano),
          unidade:   lancamento.unidade,
          tipo:      lancamento.tipo,
          categoria: lancamento.categoria,
          descricao: lancamento.descricao ?? "",
          valor:     String(lancamento.valor).replace(".", ","),
        });
      } catch {
        toast.error("Erro ao carregar lançamento.");
        router.push("/lancamentos");
      } finally {
        setLoading(false);
      }
    }

    carregarLancamento();
  }, [id, router]);

  const set = (field: keyof FormState, value: string) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === "tipo") {
        next.categoria = CATEGORIAS_POR_TIPO[value as Tipo]?.[0] ?? "";
      }
      return next;
    });
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validar = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.mes)       e.mes       = "Selecione o mês";
    if (!form.unidade)   e.unidade   = "Selecione a unidade";
    if (!form.tipo)      e.tipo      = "Selecione o tipo";
    if (!form.categoria) e.categoria = "Selecione a categoria";
    const num = Number(form.valor.replace(",", "."));
    if (!form.valor || isNaN(num) || num <= 0)
      e.valor = "Informe um valor válido maior que zero";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;
    setSaving(true);
    try {
      await updateLancamento(id, {
        mes:       Number(form.mes),
        ano:       Number(form.ano),
        unidade:   form.unidade as Unidade,
        tipo:      form.tipo as Tipo,
        categoria: form.categoria,
        descricao: form.descricao || undefined,
        valor:     Number(form.valor.replace(",", ".")),
      });
      toast.success("Lançamento atualizado com sucesso!");
      router.push("/lancamentos");
    } catch {
      toast.error("Erro ao atualizar lançamento. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const categorias = CATEGORIAS_POR_TIPO[form.tipo as Tipo] ?? [];

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-3 animate-fade-in">
        <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
             style={{ borderColor: "rgba(200,168,75,0.4)", borderTopColor: "var(--gold)" }} />
        <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>Carregando...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold"
            style={{ fontFamily: "var(--font-cormorant)", color: "var(--foreground)" }}>
          Editar Lançamento
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}>
          Altere os dados do lançamento e salve.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card-financial rounded-2xl p-6 space-y-5 animate-fade-up">

        {/* Mês + Ano */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Mês</Label>
            <select value={form.mes} onChange={e => set("mes", e.target.value)}
                    style={errors.mes ? inputErrorStyle : inputStyle}>
              {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <ErrorMsg msg={errors.mes} />
          </div>
          <div className="space-y-1.5">
            <Label>Ano</Label>
            <select value={form.ano} onChange={e => set("ano", e.target.value)}
                    style={inputStyle}>
              {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        {/* Unidade */}
        <div className="space-y-1.5">
          <Label>Unidade</Label>
          <div className="flex rounded-lg overflow-hidden"
               style={{ border: `1px solid ${errors.unidade ? "var(--danger)" : "var(--border)"}` }}>
            {UNIDADES.map(opt => (
              <button key={opt.value} type="button"
                      onClick={() => set("unidade", opt.value)}
                      className="flex-1 py-2 text-xs font-medium transition-all duration-150 cursor-pointer"
                      style={{
                        background: form.unidade === opt.value ? "var(--gold)" : "transparent",
                        color:      form.unidade === opt.value ? "var(--bg-base)" : "var(--muted-foreground)",
                        fontFamily: "var(--font-jakarta)",
                      }}>
                {opt.value}
              </button>
            ))}
          </div>
          <ErrorMsg msg={errors.unidade} />
        </div>

        {/* Tipo */}
        <div className="space-y-1.5">
          <Label>Tipo</Label>
          <div className="flex rounded-lg overflow-hidden"
               style={{ border: `1px solid ${errors.tipo ? "var(--danger)" : "var(--border)"}` }}>
            {TIPOS.map(opt => (
              <button key={opt.value} type="button"
                      onClick={() => set("tipo", opt.value)}
                      className="flex-1 py-2 text-xs font-medium transition-all duration-150 cursor-pointer"
                      style={{
                        background: form.tipo === opt.value ? opt.cor : "transparent",
                        color:      form.tipo === opt.value ? "white" : "var(--muted-foreground)",
                        fontFamily: "var(--font-jakarta)",
                      }}>
                {opt.label}
              </button>
            ))}
          </div>
          <ErrorMsg msg={errors.tipo} />
        </div>

        {/* Categoria */}
        <div className="space-y-1.5">
          <Label>Categoria</Label>
          <select value={form.categoria} onChange={e => set("categoria", e.target.value)}
                  style={errors.categoria ? inputErrorStyle : inputStyle}>
            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ErrorMsg msg={errors.categoria} />
        </div>

        {/* Descrição */}
        <div className="space-y-1.5">
          <Label>Descrição <span style={{ color: "var(--muted-foreground)", fontWeight: 400 }}>(opcional)</span></Label>
          <input type="text" value={form.descricao}
                 onChange={e => set("descricao", e.target.value)}
                 placeholder="Ex: Folha março — equipe Garibaldi"
                 style={inputStyle} />
        </div>

        {/* Valor */}
        <div className="space-y-1.5">
          <Label>Valor (R$)</Label>
          <input type="text" value={form.valor}
                 onChange={e => set("valor", e.target.value)}
                 placeholder="0,00"
                 style={{ ...(errors.valor ? inputErrorStyle : inputStyle), fontVariantNumeric: "tabular-nums" }} />
          <ErrorMsg msg={errors.valor} />
        </div>

        {/* Ações */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer"
                  style={{ border: "1px solid var(--border)", color: "var(--muted-foreground)", background: "transparent", fontFamily: "var(--font-jakarta)" }}>
            Cancelar
          </button>
          <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer disabled:opacity-60"
                  style={{ background: "var(--gold)", color: "var(--bg-base)", fontFamily: "var(--font-jakarta)" }}>
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold tracking-wide uppercase"
           style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}>
      {children}
    </label>
  );
}

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs" style={{ color: "var(--danger)", fontFamily: "var(--font-jakarta)" }}>{msg}</p>;
}
