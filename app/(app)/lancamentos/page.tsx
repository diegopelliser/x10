"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { FilterBar } from "@/components/layout/FilterBar";
import { getLancamentosLista, deleteLancamento } from "@/lib/queries";
import { formatarMoeda, nomeMes } from "@/lib/categories";
import type { Lancamento, Unidade } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const tipoCor: Record<string, string> = {
  receita: "var(--success)",
  imposto: "var(--warning)",
  custo:   "var(--danger)",
  despesa: "var(--danger)",
};

const tipoLabel: Record<string, string> = {
  receita: "Receita",
  imposto: "Imposto",
  custo:   "Custo",
  despesa: "Despesa",
};

export default function LancamentosPage() {
  const hoje = new Date();
  const [mes, setMes]         = useState(hoje.getMonth() + 1);
  const [ano, setAno]         = useState(hoje.getFullYear());
  const [unidade, setUnidade] = useState<Unidade | "TODOS">("TODOS");
  const [rows, setRows]       = useState<Lancamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletando, setDeletando] = useState<Lancamento | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await getLancamentosLista(mes, ano, unidade));
    } finally {
      setLoading(false);
    }
  }, [mes, ano, unidade]);

  useEffect(() => { carregar(); }, [carregar]);

  const confirmarDelete = async () => {
    if (!deletando) return;
    try {
      await deleteLancamento(deletando.id);
      toast.success("Lançamento excluído.");
      setDeletando(null);
      carregar();
    } catch {
      toast.error("Erro ao excluir lançamento.");
    }
  };

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-start justify-between gap-4 mb-6">
        <FilterBar
          mes={mes} ano={ano} unidade={unidade}
          onMesChange={setMes} onAnoChange={setAno} onUnidadeChange={setUnidade}
          title="Lançamentos"
        />
        <Link href="/lancamentos/novo">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-150 flex-shrink-0"
            style={{ background: "var(--gold)", color: "var(--bg-base)", fontFamily: "var(--font-jakarta)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--gold-light)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--gold)")}
          >
            <Plus size={15} />
            Novo Lançamento
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 animate-fade-in">
          <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
               style={{ borderColor: "rgba(200,168,75,0.4)", borderTopColor: "var(--gold)" }} />
          <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>Carregando...</span>
        </div>
      ) : (
        <div className="card-financial rounded-2xl overflow-hidden animate-fade-up">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
                Nenhum lançamento em {nomeMes(mes)} / {ano}
              </p>
              <Link href="/lancamentos/novo">
                <span className="text-xs cursor-pointer" style={{ color: "var(--gold)" }}>
                  + Adicionar o primeiro lançamento
                </span>
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Unidade", "Tipo", "Categoria", "Descrição", "Valor", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold tracking-widest uppercase"
                        style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.id}
                      className="transition-colors duration-100 hover:bg-white/[0.02]"
                      style={{ borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <td className="px-4 py-3 text-xs font-semibold"
                        style={{ color: "var(--gold)", fontFamily: "var(--font-jakarta)" }}>
                      {row.unidade}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{
                              color: tipoCor[row.tipo] ?? "var(--foreground)",
                              background: `${tipoCor[row.tipo] ?? "#fff"}15`,
                              fontFamily: "var(--font-jakarta)",
                            }}>
                        {tipoLabel[row.tipo]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--foreground)", fontFamily: "var(--font-jakarta)" }}>
                      {row.categoria}
                    </td>
                    <td className="px-4 py-3 text-xs max-w-[200px] truncate"
                        style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}>
                      {row.descricao ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium tabular text-right"
                        style={{
                          color: row.tipo === "receita" ? "var(--success)" : "var(--foreground)",
                          fontVariantNumeric: "tabular-nums",
                          fontFamily: "var(--font-jakarta)",
                        }}>
                      {formatarMoeda(row.valor)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Link href={`/lancamentos/${row.id}/editar`}>
                          <button
                            className="p-1.5 rounded-lg transition-all duration-150 cursor-pointer"
                            style={{ color: "var(--muted-foreground)" }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.color = "var(--foreground)";
                              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)";
                              (e.currentTarget as HTMLElement).style.background = "transparent";
                            }}
                          >
                            <Pencil size={13} />
                          </button>
                        </Link>
                        <button
                          onClick={() => setDeletando(row)}
                          className="p-1.5 rounded-lg transition-all duration-150 cursor-pointer"
                          style={{ color: "var(--muted-foreground)" }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.color = "var(--danger)";
                            (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)";
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)";
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={!!deletando} onOpenChange={open => !open && setDeletando(null)}>
        <DialogContent style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--font-cormorant)", color: "var(--foreground)" }}>
              Excluir lançamento?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm py-2" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}>
            <strong style={{ color: "var(--foreground)" }}>{deletando?.categoria}</strong>
            {" — "}{formatarMoeda(deletando?.valor ?? 0)}.
            Esta ação não pode ser desfeita.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeletando(null)}
                    style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "transparent" }}>
              Cancelar
            </Button>
            <Button onClick={confirmarDelete}
                    style={{ background: "var(--danger)", color: "white", border: "none" }}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
