# X10 Investimentos — Sistema de Design
## Cores, Tipografia, Componentes e Padrões Visuais

---

## Conceito Visual

**Aesthetic:** Refinado / Executivo  
**Referência:** Relatório anual de empresa Fortune 500 + ferramenta SaaS moderna  
**Tom:** Autoridade sem arrogância. Clareza sem frieza. Profissional sem esterilidade.

---

## Paleta de Cores

### Cores Primárias

```css
/* globals.css */
:root {
  /* Navy — cor dominante, backgrounds escuros, texto primário */
  --navy:       #0D1F3C;
  --navy-mid:   #1A3A5C;
  --navy-light: #2A4A6C;

  /* Gold — cor de acento, destaque, CTAs principais */
  --gold:       #C8A84B;
  --gold-light: #E2C76A;
  --gold-bg:    rgba(200, 168, 75, 0.08);

  /* Blue — informação, links, elementos secundários */
  --blue:       #2E6DA4;
  --blue-light: #4A89C0;

  /* Neutros */
  --white:      #FFFFFF;
  --off-white:  #F5F7FA;
  --gray-lt:    #E2E8F0;
  --gray:       #8A95A3;
  --dark:       #1C2B3A;
}
```

### Cores por Nível

```css
:root {
  --level-1-color: #E74C3C;  /* Vermelho — Intuitivo (atenção) */
  --level-1-bg:    #FDEDEC;

  --level-2-color: #E67E22;  /* Laranja — Estruturado (desenvolver) */
  --level-2-bg:    #FEF9E7;

  --level-3-color: #2E86AB;  /* Azul — Estratégico (evoluir) */
  --level-3-bg:    #EBF5FB;

  --level-4-color: #27AE60;  /* Verde — Adaptativo (referência) */
  --level-4-bg:    #EAFAF1;
}
```

### Cores por Dimensão

```css
:root {
  --dim-D1: #2E6DA4;  /* Azul — Inteligência de Decisão */
  --dim-D2: #27AE60;  /* Verde — Qualidade do Desenvolvimento */
  --dim-D3: #9B59B6;  /* Roxo — Liderança Habilitadora */
  --dim-D4: #E67E22;  /* Laranja — Cultura de Aprendizado */
  --dim-D5: #C8A84B;  /* Dourado — Prontidão para o Futuro */
}
```

---

## Tipografia

```css
/* Importar no layout.tsx via next/font/google */
/* Display: Cormorant Garamond — elegante, autoridade, diferenciação */
/* Body: Outfit — limpo, legível, moderno */

@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Outfit:wght@300;400;500;600&display=swap');

:root {
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-body:    'Outfit', system-ui, sans-serif;
}
```

### Escala Tipográfica

| Token | Font | Size | Weight | Uso |
|-------|------|------|--------|-----|
| `display-xl` | Display | 48px | 600 | Título hero da welcome screen |
| `display-lg` | Display | 36px | 600 | Títulos de seção principais |
| `display-md` | Display | 24px | 600 | Títulos de cards, nome do participante |
| `display-sm` | Display | 18px | 600 | Sub-títulos |
| `body-lg` | Body | 16px | 400 | Texto de questões |
| `body-md` | Body | 14px | 400 | Texto de opções, descrições |
| `body-sm` | Body | 12px | 400 | Labels, metadados |
| `label` | Body | 11px | 600 | Labels em caps, badges |

```css
/* Exemplos de uso */
.text-display-xl {
  font-family: var(--font-display);
  font-size: 48px;
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.text-label {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
```

---

## Componentes de UI

### LevelBadge

```tsx
// Usado para exibir o nível do participante em qualquer contexto
interface LevelBadgeProps {
  level: 1 | 2 | 3 | 4;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  showTagline?: boolean;
}

// Aparência:
// ┌──────────────────────────────────┐
// │  N3  Estratégico                 │
// │      Dados e reflexão sustentam  │
// └──────────────────────────────────┘
// Border e número coloridos pela cor do nível
```

**CSS Tailwind:**
```html
<!-- LevelBadge tamanho lg -->
<div class="inline-flex items-center gap-3 px-4 py-3 rounded-xl border-2"
     style="border-color: {levelColor}20; background: {levelColor}10">
  <span class="font-display text-4xl font-bold" style="color: {levelColor}">
    N{level.number}
  </span>
  <div>
    <p class="font-semibold text-base text-white">Nível {level.number} — {level.name}</p>
    <p class="text-xs opacity-75">{level.tagline}</p>
  </div>
</div>
```

---

### ScoreBar

```tsx
// Barra de progresso com animação para score de dimensão
interface ScoreBarProps {
  score: number;    // 1.0 - 5.0
  color: string;    // cor da dimensão
  label?: string;
  animated?: boolean;
}

// Aparência:
// Desenvolvimento  3.2  ████████░░  Nível 2
//                       ↑ fill width = (score/5) * 100%
```

**CSS:**
```css
.score-bar-bg {
  height: 6px;
  background: var(--gray-lt);
  border-radius: 3px;
  overflow: hidden;
}

.score-bar-fill {
  height: 6px;
  border-radius: 3px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  /* width calculado via style inline: `${(score / 5) * 100}%` */
}
```

---

### QuestionOption

```tsx
// Botão de opção de questão — estado: default | selected
// Texto da opção mais longo → padding maior

// Default:
// ┌─────────────────────────────────┐
// │ A  Texto da opção...            │  ← border: gray-lt
// └─────────────────────────────────┘

// Selected:
// ┌─────────────────────────────────┐
// │ A  Texto da opção...            │  ← border: navy, bg: navy/4%
// └─────────────────────────────────┘
//   ↑ badge muda para navy/gold

// Hover: translate-x-[3px], border-color: blue
```

**Tailwind classes:**
```html
<button
  class="w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left cursor-pointer
         transition-all duration-200 hover:border-blue-500 hover:bg-blue-50/30 hover:translate-x-1
         data-[selected=true]:border-navy data-[selected=true]:bg-navy/5"
>
  <span class="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center
               text-xs font-semibold text-gray-400
               data-[selected=true]:bg-navy data-[selected=true]:text-gold data-[selected=true]:border-navy">
    {letter}
  </span>
  <span class="text-sm leading-relaxed">{optionText}</span>
</button>
```

---

### Header Fixo

```tsx
// Header presente em todas as telas exceto results (onde há versão diferente)
// Sempre sticky top-0 com z-index alto

// ┌─────────────────────────────────────────────────┐
// │ X10 Investimentos                               │  ← background: navy
// │                                                 │  ← border-bottom: 3px gold
// ├─────────────────────────────────────────────────┤
// │ ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ← progress bar: gold
// └─────────────────────────────────────────────────┘
```

---

### SectionIntro Card

```tsx
// Tela exibida antes de cada bloco de questões
// Fundo: navy com borda gold no topo

// ┌─────────────────────────────────┐
// │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ ← 4px solid gold
// │                                 │
// │     📊                          │ ← ícone 40px
// │  DIMENSÃO 1 · D1                │ ← gold label em caps
// │  Inteligência de Decisão        │ ← font-display 30px
// │  Como você usa dados para...    │ ← body text 14px gray
// │                                 │
// │  [5 questões a seguir]          │ ← tag gold semitransparente
// │                                 │
// └─────────────────────────────────┘
```

---

### ResultsHero

```tsx
// Header dos resultados — background: navy, borda gold no topo

// ┌─────────────────────────────────┐
// │ Relatório · 06/05/2026          │ ← gold small text
// │ Nome do Usuário                 │ ← font-display 32px
// │ Cargo · Empresa                 │ ← gray-lt 13px
// │                                 │
// │ ┌──────────────────────────┐    │
// │ │ N3  Estratégico          │    │ ← LevelBadge lg
// │ │     Dados e reflexão...  │    │
// │ └──────────────────────────┘    │
// │                                 │
// │ 📊3.2  🌱2.8  🧭3.5  🔄2.6  🚀2.1│ ← score grid 5 cols
// └─────────────────────────────────┘
```

---

## Espaçamento e Layout

```css
:root {
  --radius-sm:  6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  
  --shadow-sm: 0 2px 8px rgba(13,31,60,0.08);
  --shadow-md: 0 4px 24px rgba(13,31,60,0.12);
  --shadow-lg: 0 8px 40px rgba(13,31,60,0.18);
  
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Container principal — máximo 760px centralizado */
.container-pmda {
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

/* Mobile: padding lateral reduzido */
@media (max-width: 640px) {
  .container-pmda {
    padding: 24px 16px 60px;
  }
}
```

---

## Animações

```css
/* Entrada de tela — todas as telas usam este */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-up {
  animation: fadeUp 0.4s ease both;
}

/* Loading spinner */
@keyframes spin {
  to { transform: rotate(360deg); }
}
.loading-spinner {
  width: 56px;
  height: 56px;
  border: 3px solid var(--gray-lt);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Pulse para indicadores ativos */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* Barra de score — animada na entrada dos resultados */
/* Usar delay escalonado por dimensão: delay = index * 150ms */
.score-bar-fill {
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  animation-delay: calc(var(--dim-index) * 150ms);
}
```

---

## Radar Chart — Configuração Recharts

```tsx
// Configuração exata para o gráfico radar das 5 dimensões
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';

const radarData = dimensions.map(d => ({
  subject: d.shortLabel,     // "Decisão", "Desenvolvimento", etc.
  score: d.average,          // 1.0 - 5.0
  fullMark: 5,
}));

<ResponsiveContainer width="100%" height={280}>
  <RadarChart data={radarData} outerRadius={100}>
    <PolarGrid stroke="#E2E8F0" />
    <PolarAngleAxis
      dataKey="subject"
      tick={{
        fill: '#1C2B3A',
        fontSize: 12,
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 500,
      }}
    />
    <Radar
      name="Score"
      dataKey="score"
      stroke="#C8A84B"
      fill="#C8A84B"
      fillOpacity={0.2}
      strokeWidth={2}
    />
    <Tooltip
      contentStyle={{
        background: '#0D1F3C',
        border: '1px solid #C8A84B',
        borderRadius: 8,
        fontFamily: "'Outfit', sans-serif",
        fontSize: 12,
        color: 'white',
      }}
      formatter={(value: number) => [`${value.toFixed(1)} / 5.0`, 'Score']}
    />
  </RadarChart>
</ResponsiveContainer>
```

---

## Responsividade

### Breakpoints

```css
/* Mobile first */
/* sm: 640px  (smartphones landscape) */
/* md: 768px  (tablets) */
/* lg: 1024px (desktop) */

/* score-grid: 5 colunas em md+, 3+2 em sm, 1 coluna em mobile */
.score-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);  /* md+ */
}
@media (max-width: 640px) {
  .score-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* form-row: 2 colunas em md+, 1 coluna em mobile */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;  /* md+ */
}
@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
```

### Prioridade Mobile

O diagnóstico será feito principalmente em smartphone. Prioridades:
1. Texto legível sem zoom (min 14px)
2. Opções de questão com área de toque generosa (min 44px height)
3. Botões "Próxima" e "Anterior" acessíveis com polegar
4. Radar chart legível em tela pequena (reduzir para height=220 em mobile)
5. Scroll natural — não usar overflow hidden em mobile

---

## Tailwind Config Customizado

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0D1F3C',
          mid: '#1A3A5C',
          light: '#2A4A6C',
        },
        gold: {
          DEFAULT: '#C8A84B',
          light: '#E2C76A',
        },
        blue: {
          DEFAULT: '#2E6DA4',
          light: '#4A89C0',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        sm: '0 2px 8px rgba(13,31,60,0.08)',
        md: '0 4px 24px rgba(13,31,60,0.12)',
        lg: '0 8px 40px rgba(13,31,60,0.18)',
      },
      borderRadius: {
        DEFAULT: '12px',
        lg: '16px',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

---

## Print / PDF

```css
/* Estilos para print — activados via window.print() ou @react-pdf/renderer */
@media print {
  .no-print { display: none !important; }
  
  .results-hero {
    background: var(--navy) !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  .page-break { page-break-before: always; }
  
  body { font-size: 11px; }
  
  .container-pmda { max-width: 100%; padding: 0; }
}
```

---

## Checklist de Design (para Claude Code verificar)

- [ ] Fonts carregadas corretamente (Cormorant Garamond + Outfit)
- [ ] Progress bar animada e precisa
- [ ] Opções de questão com hover e selected state visualmente distintos
- [ ] Score cards no ResultsHero com número grande e legível
- [ ] Radar chart com tooltip funcional
- [ ] Score bars animadas na entrada dos resultados (delay escalonado)
- [ ] LevelBadge com cores corretas por nível
- [ ] Header fixo em todas as telas
- [ ] Botão "Próxima" desabilitado quando nenhuma opção selecionada
- [ ] Responsivo em iPhone SE (375px) e iPad (768px)
- [ ] Loading screen com steps animados
- [ ] Seção de AI analysis renderizando HTML corretamente (dangerouslySetInnerHTML)
- [ ] Print/PDF funcionando com cores preservadas
