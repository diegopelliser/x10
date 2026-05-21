"use client";

import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { EvolucaoMes } from "@/lib/queries";
import { formatarMoedaCompacto } from "@/lib/categories";

interface EvolutionChartProps {
  data: EvolucaoMes[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 text-xs shadow-xl"
         style={{
           background: "var(--bg-surface)",
           border: "1px solid rgba(200,168,75,0.3)",
           fontFamily: "var(--font-jakarta)",
         }}>
      <p className="font-semibold mb-2" style={{ color: "var(--gold)" }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: "var(--muted-foreground)" }}>{p.name}:</span>
          <span className="font-medium tabular" style={{ color: "var(--foreground)", fontVariantNumeric: "tabular-nums" }}>
            {formatarMoedaCompacto(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export function EvolutionChart({ data }: EvolutionChartProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 rounded-2xl card-financial">
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Sem dados disponíveis</p>
      </div>
    );
  }

  return (
    <div className="card-financial p-5 rounded-2xl">
      <p className="text-xs font-semibold tracking-widest uppercase mb-4"
         style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}>
        Evolução Mensal
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
            vertical={false}
          />
          <XAxis
            dataKey="mes"
            tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontFamily: "var(--font-jakarta)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={v => formatarMoedaCompacto(v)}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontFamily: "var(--font-jakarta)" }}
            axisLine={false}
            tickLine={false}
            width={72}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{
              fontSize: 11,
              fontFamily: "var(--font-jakarta)",
              color: "var(--muted-foreground)",
              paddingTop: 8,
            }}
          />
          <Bar
            dataKey="receita"
            name="Receita"
            fill="rgba(34,197,94,0.65)"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
          <Bar
            dataKey="deducoes"
            name="Deduções"
            fill="rgba(239,68,68,0.55)"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
          <Line
            type="monotone"
            dataKey="resultado"
            name="Resultado"
            stroke="#C8A84B"
            strokeWidth={2}
            dot={{ fill: "#C8A84B", strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: "#E2C76A" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
