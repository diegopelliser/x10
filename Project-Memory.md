# Project Memory — X10 Investimentos · Controle Financeiro
**Última atualização:** 2026-05-07
**Sessões registradas:** 4

---

## Problema / Objetivo Original

Substituir o controle financeiro em Excel por um sistema web premium. O gestor (Diego, único usuário) precisava de:
- DRE Gerencial mensal com visão consolidada e por unidade
- Dashboard executivo com KPIs e evolução histórica
- CRUD de lançamentos manuais
- Importação dos dados históricos do Excel (7 meses: Set/2025 a Mar/2026)

---

## O que foi construído

### Stack
- **Next.js** (App Router) + TypeScript
- **Tailwind CSS v4** — sem tailwind.config.ts, tokens via `@theme` e `:root` em globals.css
- **shadcn/ui** (Dialog, Button, Sonner/Toast)
- **Supabase** (PostgreSQL) — projeto: `x10-financeiro`, ID: `lmawejgdzsliukdjlkyb`, região: sa-east-1
- **Recharts** — ComposedChart (dashboard) + LineChart (análises)
- **Fontes:** Cormorant Garamond (headings) + Plus Jakarta Sans (body/UI)

### Design System
Arquivo de referência: `design-system.md`
Tokens principais em `app/globals.css`:
- `--bg-base: #0B1829` · `--bg-card: #132338` · `--bg-hover: #1A3A5C`
- `--gold: #C8A84B` · `--gold-light: #E2C76A`
- `--success: #22C55E` · `--danger: #EF4444` · `--warning: #F59E0B`
- Classes utilitárias: `.card-financial`, `.card-kpi-gold`, `.animate-fade-up`, `.stagger-1..5`

### Banco de Dados
Tabela única: `lancamentos`
```
id, mes, ano, unidade (GDI|POA|OUTROS), tipo (receita|custo|despesa|imposto),
categoria, descricao, valor, created_at, updated_at
```

### Páginas

| Rota | Descrição |
|------|-----------|
| `/dashboard` | KPIs (Receita, Custos, Resultado, Margem) + gráfico evolução histórica + top receitas/despesas |
| `/dre` | DRE Gerencial estruturada por seções + exportar PDF |
| `/lancamentos` | Lista filtrada + editar + excluir (com Dialog de confirmação) |
| `/lancamentos/novo` | Formulário com validação inline |
| `/lancamentos/[id]/editar` | Formulário pré-preenchido via `getLancamentoById` |
| `/analises` | 5 abas: **Executivo** (padrão), Receitas, Despesas, Comissões, Evolução por linha |

### Componentes

```
components/
  layout/
    Sidebar.tsx       — fixa 240px, 4 itens: Dashboard, DRE, Análises, Lançamentos
    FilterBar.tsx     — unidade (GDI/POA/Consolidado) + Ano + Mês (nessa ordem)
  dashboard/
    KPICard.tsx       — variantes: gold, success, danger, default
    EvolutionChart.tsx — barras receita/deduções + linha resultado (Recharts)
  dre/
    DRETable.tsx      — seções expansíveis com totais e margem
  analises/
    TabExecutivo.tsx  — top 5 receitas + top 5 despesas + gráfico evolução com toggle (aba padrão)
    TabReceitas.tsx   — categorias expansíveis com % do total + barra + % por item dentro da categoria
    TabDespesas.tsx   — seções ordenadas por valor desc, categorias com % da seção + barra
    TabComissoes.tsx  — tabela de assessores com KPIs de comissão
    TabEvolucao.tsx   — LineChart por categoria + drill-down em › para ver sub-linhas (descricao) ao longo do tempo
```

### Queries (`lib/queries.ts`)
- `getDRE(mes, ano, unidade)` — DRE completa
- `getEvolucao(unidade)` — evolução histórica apenas dos meses com dados (sem meses futuros vazios)
- `getTopCategorias(mes, ano, tipo, limit, unidade)` — top N categorias
- `getLancamentosLista`, `getLancamentoById`, `upsertLancamento`, `updateLancamento`, `deleteLancamento`
- `getDetalheReceitas` — agrupado por categoria com itens individuais
- `getDetalheDespesas` — agrupado por tipo → categoria → itens, seções ordenadas por total desc
- `getComissoes` — assessores com valor e % do total
- `getEvolucaoCategorias(tipo, unidade)` — evolução por categoria, apenas meses com dados
- `getEvolucaoDescricoes(tipo, categoria, unidade)` — drill-down: evolução das sub-linhas (descricao) dentro de uma categoria

### Script de Importação Node.js (sessão 4)
- Para novos meses: `node scripts/import-mes.js` (a criar) ou inline via Node REPL
- Usa biblioteca `xlsx` (instalada como devDependency)
- Mapeamento de categorias Excel → tipos do sistema em `CAT_MAP`
- Centros de custo sem "POA" no nome → unidade GDI; "AI Inv POA" → POA
- Valores negativos no Excel = despesa/custo/imposto; positivos = receita (todos armazenados como `abs(valor)`)
- Linhas de totalização ignoradas: "Total geral", "RECEITA TOTAL:", "DESPESAS TOTAL:", "SALDO FINAL:"
- Carry-forward vertical de centro_custo e categoria (células mescladas no Excel)
- Abril/2026 importado com 106 lançamentos

### Script de Importação Python (`scripts/import_excel.py`)
- Lê 7 abas do Excel: Setembro, Outubro, Novembro, DEZEMBRO 2025, JANEIRO 2026, FEVEREIRO 2026, MARÇO 2026
- Carry-forward de unidade (col A) e categoria (col B) — ambas só preenchidas na 1ª linha do grupo
- Valores positivos = receita, negativos = despesa/custo/imposto (usa `abs(valor)`)
- Ignora linhas de totalização: TOTAL, SALDO FINAL, SALDO CONSORCIOS, etc.
- Limpa o período antes de reinserir (sem duplicatas)
- Dependências: `pip install openpyxl supabase python-dotenv`
- Usar dentro do venv: `source .venv/bin/activate && python3 scripts/import_excel.py`

### Script de Auditoria (`scripts/audit_excel.py`)
- Lê o Excel sem tocar no banco
- Mostra: abas encontradas, totais por aba, estrutura raw das primeiras linhas
- Útil para diagnosticar divergências antes de reimportar

---

## Decisões Técnicas Registradas

| Decisão | Razão |
|---------|-------|
| Tailwind v4 sem config.ts | Versão instalada usa CSS-native via `@theme` |
| Plus Jakarta Sans (não Inter) | Mais distintiva, melhor para dados financeiros |
| Valores no banco sempre positivos | Sinal (+ / -) determina tipo na importação |
| `getLancamentoById` busca direta por UUID | Evita iterar 12 meses em paralelo |
| `LancamentoInsert` como tipo de input | Resolve conflito `string | undefined` vs `string | null` |
| FilterBar: Ano antes de Mês | Decisão de UX — contexto mais amplo primeiro |

---

## Problemas Resolvidos

| Problema | Solução |
|----------|---------|
| `npm run dev` falha com `require-hook` | Usar `node node_modules/next/dist/bin/next dev` |
| Script Python ignorava todas as despesas | `valor <= 0` filtrava tudo negativo — corrigido com `abs(valor)` |
| Unidade/categoria vazias em linhas do Excel | Carry-forward vertical das variáveis `unidade_atual` e `categoria_atual` |
| Linhas de totalização importadas (TOTAL, SALDO) | Filtro por descrição + DELETE direto no Supabase |
| Nomes de abas errados (Dezembro, Janeiro...) | Corrigido para DEZEMBRO 2025, JANEIRO 2026, etc. |
| Build TypeScript com `string | undefined` | Usar tipo `LancamentoInsert` nas funções de escrita |
| `recharts` e `supabase-js` não instalados | `npm install recharts @supabase/supabase-js` |
| **Comissões de Vendedores com 0 registros** | Dois bugs encadeados: (1) `"iss" in "comissões"` = True em Python → tudo classificado como ISS; fix: checar CATS_CUSTO antes de CATS_IMPOSTO. (2) `"comissão" in "comissões"` = False em Unicode (ã ≠ õ) → caia em "Outros Custos"; fix: usar `"comiss" in n` |
| **Verticais de negócio (Centro de Custo) perdidos** | Col A do Excel mapeia para unidade (GDI/POA) mas descarta o nome do vertical. Fix: adicionado campo `centro_custo TEXT` no Supabase + carry-forward no script de importação. Verticais: Robôs Quantum, X10 Assessoria, Consórcios, Corban, Vida e Previdência, AI Inv POA, Imobiliário |
| Consórcios/Corban/V&P mapeados como OUTROS | Eram verticais GDI — adicionados em UNIDADES_GDI no script de importação |

---

## Categorias do Sistema

**Receita:** Assessoria de Investimentos, Comissões Corban, Comissões Consórcios, Comissões V&P, Rendimentos Financeiros, Outras Receitas

**Imposto:** Simples Nacional (DAS), ISS sobre Faturamento, INSS sobre Salários, FGTS, Impostos Retidos, Outros Impostos

**Custo:** Comissões de Vendedores, Remuneração de Estagiários, Outros Custos Variáveis

**Despesa:** Folha de Pagamento, Pró-labore, 13º Salário / Férias, Encargos Sociais, Aluguel, Energia / Internet / Condomínio, Tecnologia e Software, Honorários Contábeis, Honorários Jurídicos, Marketing e Eventos, Bens e Materiais, Outras Despesas

---

## Banco de Dados — Schema Atual

Tabela: `lancamentos`
```
id, mes, ano, unidade (GDI|POA|OUTROS), tipo (receita|custo|despesa|imposto),
categoria, descricao, valor, centro_custo (TEXT, nullable), created_at, updated_at
```

`centro_custo` = vertical de negócio (Robôs Quantum, X10 Assessoria de Investimentos, Consórcios, Corban, Vida e Previdência, AI Inv POA, Imobiliário)

---

## Limpeza de Dados Realizada (sessão 4)

Erros de importação corrigidos diretamente no Supabase via MCP:

| Mês | Problema | Ação |
|-----|----------|------|
| Out/2025 | Pró-labore R$35.479,98 classificado como receita | Removido |
| Out/2025 | Governo Federal R$23.814,26 em Outras Despesas (era IRPJ Trimestral) | Reclassificado → imposto / Outros Impostos |
| Nov/2025 | 6 entradas "RESULTADO FINAL:" como receita + Pró-labore receita | Removidos (7 registros) |
| Nov/2025 | "RESULTADO FINAL:" em despesa/Pró-labore R$9.326,02 | Removido |
| Dez/2025 | Software/Licença de Uso R$33.447,63 como receita | Removido |
| Jan/2026 | Software/Licença de Uso R$32.364,31 como despesa | Removido |
| Fev/2026 | Software/Licença de Uso R$27.207,93 como receita | Removido |
| Mar/2026 | Software/Licença de Uso R$529,14 como despesa | Removido |

**Padrão identificado:** O Excel do Anderson inclui linhas "RESULTADO FINAL:" e totalizadores que devem ser ignorados. A importação Node.js já trata esse filtro. Para o script Python antigo, verificar se as mesmas linhas são filtradas.

---

## Próximos Passos Identificados

- [ ] Criar script reutilizável `scripts/import-mes.js` para facilitar importação de meses futuros
- [ ] Considerar filtro por `centro_custo` no FilterBar (além de GDI/POA/TODOS)
- [ ] Considerar página de configurações para gerenciar categorias
- [ ] Avaliar DFC (Demonstração de Fluxo de Caixa) como próxima feature
- [ ] Verificar responsividade mobile (375px e 768px)
- [ ] Alertas automáticos na aba Executivo (margem abaixo de 15%, comissões > 30%, etc.)

---

## Histórico de Sessões

### Sessão 1 — 2026-05-06
**Foco:** MVP completo — setup, banco, importação, dashboard, DRE, lançamentos
**Resultado:** Sistema funcionando com dados históricos importados
**Arquivos tocados:** Todos os arquivos base criados do zero

### Sessão 2 — 2026-05-06
**Foco:** Análises detalhadas, melhoria de UX nos filtros, limpeza de dados
**Resultado:** Página /analises com 4 abas, FilterBar com Ano→Mês, remoção de totalizadores do banco
**Arquivos tocados:** FilterBar.tsx, Sidebar.tsx, queries.ts, analises/page.tsx, TabReceitas/Despesas/Comissoes/Evolucao.tsx, import_excel.py

### Sessão 3 — 2026-05-07
**Foco:** Correção de bugs na importação de dados — Comissões de Vendedores + Centro de Custo
**Resultado:** 169 comissões de vendedores (R$ 242.666) agora corretamente classificadas; campo `centro_custo` adicionado ao banco com 7 verticais de negócio; TabComissoes exibe breakdown por vertical
**Arquivos tocados:** scripts/import_excel.py, lib/supabase.ts, lib/queries.ts, app/analises/page.tsx, components/analises/TabComissoes.tsx, Project-Memory.md

### Sessão 4 — 2026-05-07
**Foco:** Reconciliação de dados, novas features em análises, importação Abril/2026
**Resultado:**
- Dev server: corrigido Turbopack (→ `next dev --webpack`); pnpm approve-builds necessário para msw/sharp/unrs-resolver
- Limpeza de dados: 12 registros removidos/reclassificados no Supabase (totalizadores e lançamentos incorretos de Out-Mar)
- Nova aba **Executivo** em /analises com top 5 receitas + top 5 despesas + gráfico evolução
- TabReceitas: percentual por item dentro da categoria + barra proporcional
- TabDespesas: percentual por seção (% do total) e por categoria (% da seção) + barras; seções ordenadas por valor desc
- TabEvolucao: drill-down em › por categoria → mostra evolução das sub-linhas (descricao) ao longo do tempo
- getEvolucao e getEvolucaoCategorias: agora mostram apenas meses com dados reais (sem meses futuros vazios)
- Nova query: `getEvolucaoDescricoes(tipo, categoria, unidade)`
- Sidebar: logo aumentado (w-full h-48), texto "X10 Investimentos" removido, "Controle Financeiro" centralizado
- Importação Abril/2026: 106 lançamentos via Node.js + biblioteca xlsx
**Arquivos tocados:** package.json, components/layout/Sidebar.tsx, lib/queries.ts, app/analises/page.tsx, components/analises/TabExecutivo.tsx (novo), TabReceitas.tsx, TabDespesas.tsx, TabEvolucao.tsx, Project-Memory.md
