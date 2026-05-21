import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
import { formatarMoeda, formatarMoedaCompacto } from "@/lib/categories";
import { cn } from "@/lib/utils";

interface KPICardProps {
  label:      string;
  valor:      number;
  variacao?:  number;   // percentual vs mês anterior
  icon?:      LucideIcon;
  formato?:   "moeda" | "percentual" | "compacto";
  variante?:  "gold" | "success" | "danger" | "default";
  delay?:     number;
}

export function KPICard({
  label, valor, variacao, icon: Icon,
  formato = "moeda", variante = "default", delay = 0,
}: KPICardProps) {
  const cardClass = {
    gold:    "card-kpi-gold",
    success: "card-kpi-success",
    danger:  "card-kpi-danger",
    default: "card-financial",
  }[variante];

  const formatarValor = () => {
    if (formato === "percentual") return `${valor.toFixed(1)}%`;
    if (formato === "compacto")  return formatarMoedaCompacto(valor);
    return formatarMoeda(valor);
  };

  const variacaoPositiva = (variacao ?? 0) >= 0;
  const TrendIcon = variacao === undefined
    ? Minus
    : variacaoPositiva ? TrendingUp : TrendingDown;

  const variacaoCor = variacao === undefined
    ? "var(--muted-foreground)"
    : variacaoPositiva ? "var(--success)" : "var(--danger)";

  return (
    <div
      className={cn("p-5 rounded-2xl relative overflow-hidden animate-fade-up", cardClass)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Corner decorativo */}
      <span className="pointer-events-none absolute -right-5 -top-5 w-20 h-20 rounded-full opacity-10"
            style={{ background: "var(--gold)" }} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold tracking-widest uppercase"
             style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}>
            {label}
          </p>
          {Icon && (
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                 style={{ background: "rgba(200,168,75,0.15)" }}>
              <Icon size={14} style={{ color: "var(--gold)" }} />
            </div>
          )}
        </div>

        {/* Valor principal */}
        <p className="text-3xl font-semibold tabular leading-none mb-2"
           style={{ color: "var(--foreground)", fontFamily: "var(--font-jakarta)", fontVariantNumeric: "tabular-nums" }}>
          {formatarValor()}
        </p>

        {/* Variação */}
        {variacao !== undefined && (
          <div className="flex items-center gap-1.5">
            <TrendIcon size={13} style={{ color: variacaoCor }} />
            <span className="text-xs font-medium tabular"
                  style={{ color: variacaoCor, fontVariantNumeric: "tabular-nums" }}>
              {variacaoPositiva ? "+" : ""}{variacao.toFixed(1)}%
            </span>
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              vs mês anterior
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
