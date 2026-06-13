# material-playbook.md — Padrões visuais & animações extraídos de wearemateria.com

Esta referência documenta as técnicas reais usadas no site **wearemateria.com**
(Materia Creative Agency, Guimarães) — uma agência portuguesa que combina WordPress +
Elementor + Slider Revolution + TRX Addons com um sistema visual dark premium.

Cada técnica está descrita com o princípio, a implementação (Next.js + Tailwind + GSAP ou
Framer Motion), quando usar, e notas de engenharia reversa.

> **Objetivo:** não copiar o site, mas extrair os **padrões de profissionalismo** que o
> tornam premium e adaptá-los ao stack bloqueado do scaffold-site.

---

## Índice

1. [M1 — Letras 3D com parallax de rato (M/E/C/W)](#m1--letras-3d-com-parallax-de-rato)
2. [M2 — Grain overlay animado (ruído CSS steps)](#m2--grain-overlay-animado)
3. [M3 — Header full-width com blur no scroll](#m3--header-full-width-com-blur-no-scroll)
4. [M4 — Logo hover com letras stagger](#m4--logo-hover-com-letras-stagger)
5. [M5 — Social sidebar sticky vertical](#m5--social-sidebar-sticky-vertical)
6. [M6 — Preloader com anel rotativo gradiente](#m6--preloader-com-anel-rotativo-gradiente)
7. [M7 — Secção de vídeo com tabs animadas (layoutId)](#m7--seccao-de-video-com-tabs-animadas)
8. [M8 — Client logo marquee infinito](#m8--client-logo-marquee-infinito)
9. [M9 — Badges com grayscale-to-color hover](#m9--badges-com-grayscale-to-color-hover)
10. [M10 — Spotlight radial que segue o rato](#m10--spotlight-radial-que-segue-o-rato)

---

## M1 — Letras 3D com parallax de rato

### O que é
Uma letra gigante (M, E, C, W) composta por **3 camadas SVG/HTML** que se movem a
velocidades diferentes conforme o rato mexe dentro do card. No hover, o fundo fica branco,
a letra vira preta, e as camadas de outline desaparecem. Um spotlight amarelo segue o rato.

### Técnica
3 `<span>` sobrepostos com `position: absolute`, cada um com um `transform: translate()`
que varia com `mouseX * factor` e `mouseY * factor`:

| Layer | Fator X/Y | Efeito |
|---|---|---|
| Back (outline fino) | `mouse * 48` | Maior deslocamento, mais "longe" |
| Middle (outline médio) | `mouse * 32` | Deslocamento médio |
| Front (preenchida) | `mouse * 16` | Deslocamento mais próximo, cor muda no hover |

Mouse tracking com `onMouseMove` → `getBoundingClientRect()` → normaliza para `-0.5` a `+0.5`.

### Quando usar
Secções de serviços/diferenciais com letras/ícones grandes. Ideal para agências, estúdios
criativos, portfolios. Funciona em grid 2×2 ou 4×1.

### Implementação (Framer Motion / React)
```tsx
'use client'
import { useRef, useState } from 'react'

function LetterCard({ letter, label }: { letter: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [hover, setHover] = useState(false)

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setMouse({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    })
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setMouse({ x: 0, y: 0 }) }}
      className="group border border-white/10 bg-[#101010] hover:bg-white transition-all duration-500 cursor-pointer p-8 flex flex-col items-center justify-center min-h-[350px] relative overflow-hidden"
    >
      {/* Spotlight */}
      <div className="absolute pointer-events-none transition-opacity duration-300"
        style={{
          opacity: hover ? 1 : 0,
          background: 'radial-gradient(circle, rgba(255,199,44,0.12) 0%, transparent 70%)',
          width: '200%', height: '200%',
          left: `${50 + mouse.x * 20}%`, top: `${50 + mouse.y * 20}%`,
          transform: 'translate(-50%, -50%)',
        }}
      />
      {/* Layer 3 — back */}
      <span className="absolute text-[10rem] font-bold leading-none select-none pointer-events-none"
        style={{
          color: 'transparent',
          WebkitTextStroke: '1px rgba(255,255,255,0.06)',
          transform: `translate(${12 + mouse.x * 48}px, ${-8 + mouse.y * 48}px)`,
          opacity: hover ? 0 : 1, transition: 'opacity 0.4s',
        }}
      >{letter}</span>
      {/* Layer 2 — middle */}
      <span className="absolute text-[10rem] font-bold leading-none select-none pointer-events-none"
        style={{
          color: 'transparent',
          WebkitTextStroke: '1.5px rgba(255,255,255,0.12)',
          transform: `translate(${6 + mouse.x * 32}px, ${-4 + mouse.y * 32}px)`,
          opacity: hover ? 0 : 1, transition: 'opacity 0.4s',
        }}
      >{letter}</span>
      {/* Layer 1 — front */}
      <span className="absolute text-[10rem] font-bold leading-none select-none pointer-events-none"
        style={{
          color: hover ? '#000' : '#fff',
          transform: `translate(${mouse.x * 16}px, ${mouse.y * 16}px)`,
          transition: 'color 0.4s',
        }}
      >{letter}</span>
      <h3 className="mt-auto pt-16 text-sm font-medium tracking-wide text-center relative z-10 whitespace-pre-line"
        style={{ color: hover ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.6)', transition: 'color 0.4s' }}
      >{label}</h3>
    </div>
  )
}
```

### Variações
- **GSAP:** em vez de React state, usa `gsap.quickTo()` para performance em cards com muitos layers.
- **Mobile:** desliga o tracking em `pointer: coarse` (touch não tem hover position).
- **Entrada:** adicionar `ScrollTrigger` no container para as letras só aparecerem com scroll.

---

## M2 — Grain overlay animado

### O que é
Uma textura de ruído (PNG com `feTurbulence` ou imagem real) sobreposta a todo o site,
com uma animação CSS `steps(2)` que faz o ruído "flickrar" lentamente — dá textura de filme
ao fundo escuro.

### Técnica
```css
.noise-overlay {
  pointer-events: none;
  position: fixed; z-index: 9999;
  height: 300%; width: 300%;
  left: -50%; top: -100%;
  opacity: 0.15;
  background-image: url('/textures/noise.png');
  animation: ruido 1s steps(2) infinite;
  backface-visibility: hidden;
  will-change: transform;
}

@keyframes ruido {
  0%   { transform: translate3d(0, 9rem, 0); }
  10%  { transform: translate3d(-1rem, -4rem, 0); }
  20%  { transform: translate3d(-8rem, 2rem, 0); }
  30%  { transform: translate3d(9rem, -9rem, 0); }
  40%  { transform: translate3d(-2rem, 7rem, 0); }
  50%  { transform: translate3d(-9rem, -4rem, 0); }
  60%  { transform: translate3d(2rem, 6rem, 0); }
  70%  { transform: translate3d(7rem, -8rem, 0); }
  80%  { transform: translate3d(-9rem, 1rem, 0); }
  90%  { transform: translate3d(6rem, -5rem, 0); }
  100% { transform: translate3d(-7rem, 0, 0); }
}
```

### Diferença para o S4 existente
A skill atual (S4) usa um grain estático com `mix-blend-mode: overlay` e `opacity: 0.035`.
A **versão Materia** usa CSS `steps(2)` com `translate3d` complexo que dá **movimento visível**
ao ruído — mais cinematográfico, mais caro visualmente.

### Quando usar
Sempre — é um custo de performance quase nulo (CSS-only) e o resultado é premium
imediato. Em sites dark, usar `opacity: 0.08–0.15`; em light, `opacity: 0.025–0.04`.

---

## M3 — Header full-width com blur no scroll

### O que é
Um header que ocupa **toda a largura** (não pill flutuante) com `backdrop-filter: blur(20px)`
ativado apenas após scroll. A transição entre `bg-transparent` e `bg-materia-bg/40` é suave.

### Diferença para a S2 existente
A skill atual (S2) usa uma **navbar pill flutuante** centrada. O Materia usa um **header
full-width** com `backdrop-filter: saturate(180%) blur(20px)` — mais próximo de sites como
Apple / Stripe.

### Quando usar
Alternativa à S2 quando o cliente quer um header mais corporativo e menos "design agência".

### Implementação
```tsx
const [scrolled, setScrolled] = useState(false)
useEffect(() => {
  const onScroll = () => setScrolled(window.scrollY > 50)
  window.addEventListener('scroll', onScroll, { passive: true })
  return () => window.removeEventListener('scroll', onScroll)
}, [])

// JSX:
<header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
  scrolled
    ? 'bg-[#101010]/40 backdrop-blur-[20px] backdrop-saturate-[180%]'
    : 'bg-transparent'
}`}>
```

---

## M4 — Logo hover com letras stagger

### O que é
O logo "Materia" é um SVG onde cada letra (`M`, `a`, `t`, `e`, `r`, `i`, `a`) tem um
`transform: translateY(-2rem)` no hover, com **delay escalonado** (0.025s increments).
Algumas letras mudam de cor (branco → amarelo) enquanto saltam.

### Técnica
```tsx
<svg width="130" height="46" viewBox="0 0 260 92">
  <text x="0" y="70" fontFamily="..." fontSize="60" fontWeight="700" fill="white">
    <tspan className="letter-m inline-block transition-all duration-300
      group-hover:-translate-y-7 group-hover:fill-transparent"
      style={{ transitionDelay: '0.025s' }}>M</tspan>
    <tspan ... style={{ transitionDelay: '0.05s' }}>a</tspan>
    <tspan ... style={{ transitionDelay: '0.075s' }}>t</tspan>
    {/* ... stagger até 0.2s */}
  </text>
</svg>
```

### Princípio
Cada letra é um `tspan` com `display: inline-block` (para aceitar transform).
Usar `transitionDelay` crescente para criar o efeito de "onde" (onda).

### Quando usar
Qualquer logo em texto. Não funciona em logos de imagem. Ótimo para headers de agências
e estúdios.

---

## M5 — Social sidebar sticky vertical

### O que é
Ícones de redes sociais fixos à **esquerda** do ecrã, alinhados verticalmente ao centro,
com `position: fixed`. Cada ícone tem borda arredondada e hover que aumenta a opacidade
e escala.

### Implementação
```tsx
<div className="fixed left-5 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-4">
  {SOCIALS.map((s) => (
    <a key={s.href} href={s.href} target="_blank"
      className="w-10 h-10 flex items-center justify-center
        border border-white/15 rounded-full text-white/40
        hover:text-white hover:border-white/40 hover:bg-white/5
        transition-all duration-300 hover:scale-110"
    >
      <s.icon size={16} />
    </a>
  ))}
</div>
```

### Quando usar
Sites de agências criativas, portfolios, media. **Não usar** em sites de comércio ou
restauração (distrai do CTA principal).

---

## M6 — Preloader com anel rotativo gradiente

### O que é
Um preloader alternativo ao contador + SplitText (T3). Consiste num anel circular com
múltiplas sombras interiores coloridas (vermelho, azul, amarelo) que rodam 360º. O logo
da marca fica ao centro.

### Técnica
```css
.preloader-ring {
  width: 350px; height: 350px;
  border-radius: 100%;
  box-shadow:
    0 -10px 20px 20px #e73623bf inset,
    30px 8px 16px 10px #00267752 inset,
    10px 6px 24px #ef4a81 inset,
    0px 30px 34px #ffc72c inset,
    0 2px 0px #ffc72c,
    0 10px 30px #41b6e636,
    /* ... mais layers de cor */;
  filter: blur(3px);
  animation: spin 3s linear infinite;
}
@keyframes spin { 100% { transform: rotate(360deg); } }
```

### Diferença para o T3 existente
O T3 usa SplitText + barra de progresso fake. O M6 é **puramente CSS** — sem JS, sem
contador, sem palavras rotativas. Mais leve, mais abstrato, mais "design agência".

### Quando usar
Quando o setor é criativo (agência, estúdio, portfolio) e a marca quer parecer mais
minimalista. Para restaurantes/clínicas, o T3 (contador + palavras) é mais adequado.

---

## M7 — Secção de vídeo com tabs animadas

### O que é
Tabs de categoria (Comercial, Institucional, Produto, Streaming) com um **indicador
animado** que se move entre as tabs com uma spring animation (via `layoutId` do Framer
Motion ou `morph` do GSAP).

### Implementação (Framer Motion)
```tsx
const [activeTab, setActiveTab] = useState('comercial')

// JSX:
<button onClick={() => setActiveTab('comercial')} className="relative px-6 py-2">
  {activeTab === 'comercial' && (
    <motion.span layoutId="tabIndicator"
      className="absolute inset-0 bg-gradient-to-r from-[#ffc72c] to-[#e63422]"
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    />
  )}
  <span className="relative z-10">Comercial</span>
</button>
```

### Técnica
O `layoutId` do Framer Motion (ou `Flip` do GSAP) rastreia a posição do indicador e
anima-o suavemente de uma tab para outra. O conteúdo muda com `AnimatePresence` +
`mode: "wait"`.

### Variações
- **GSAP:** usar `Flip.fit()` para animar o indicador entre tabs.
- **Cada tab pode ter cor própria** (ex.: commercial→yellow/red,
  institutional→blue, product→green).

---

## M8 — Client logo marquee infinito

### O que é
Uma fila horizontal de logos/nomes de clientes que se desloca infinitamente da direita
para a esquerda, sem pausa. O conteúdo é duplicado para dar a ilusão de continuidade.

### Implementação (Framer Motion)
```tsx
const doubled = [...CLIENTS, ...CLIENTS, ...CLIENTS]

return (
  <motion.div
    animate={{ x: [0, -1920] }}
    transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
    className="flex gap-16 items-center"
  >
    {doubled.map((client, i) => (
      <span key={i} className="text-sm uppercase tracking-widest text-white/30 whitespace-nowrap">
        {client}
      </span>
    ))}
  </motion.div>
)
```

### Implementação (CSS puro — mais leve)
```css
.marquee-track {
  display: flex;
  animation: marquee 30s linear infinite;
}
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

### Quando usar
Secção de "clientes/parceiros" em agências, portfolios, B2B. O marquee transmite
credibilidade sem ocupar muito espaço vertical.

---

## M9 — Badges com grayscale-to-color hover

### O que é
Logos de parceiros/prémios que aparecem em grayscale com baixa opacidade e, no hover,
recuperam a cor e opacidade total. Efeito muito subtil mas que "premia" a interação.

### Implementação
```css
.award-badge {
  filter: grayscale(1);
  opacity: 0.4;
  transition: all 0.5s ease;
}
.award-badge:hover {
  filter: grayscale(0);
  opacity: 1;
}
```

### Princípio
Começa **apagado** (o utilizador vê que está lá mas não lê). No hover, ganha cor —
recompensa a curiosidade. Funciona melhor em grids densos (6+ badges).

---

## M10 — Spotlight radial que segue o rato

### O que é
Um gradiente radial circular que segue a posição do rato dentro de um card/section.
Dá a sensação de uma **luz de holofote** a acompanhar o cursor.

### Implementação
```tsx
<div
  className="absolute pointer-events-none transition-opacity duration-300"
  style={{
    opacity: hover ? 1 : 0,
    background: 'radial-gradient(circle, rgba(255,199,44,0.1) 0%, transparent 70%)',
    width: '200%', height: '200%',
    left: `${50 + mouse.x * 20}%`,
    top: `${50 + mouse.y * 20}%`,
    transform: 'translate(-50%, -50%)',
  }}
/>
```

### Quando usar
Combinado com M1 (letras 3D) em cards de serviço. Também pode ser usado em hero sections
com texto grande para um efeito de "revelação".

---

## Comparação com o stack atual do scaffold-site

| Técnica | Já existe? | Onde se encaixa |
|---|---|---|
| M1 — Letras 3D parallax | ❌ Não | PARTE D, novo item T11 |
| M2 — Grain animado CSS | Parcial (S4 estático) | PARTE C S4 — substituir/expandir |
| M3 — Header full-width blur | ❌ (S2 é pill) | PARTE C S2 — alternativa |
| M4 — Logo stagger | ❌ Não | PARTE C S2 (dentro da navbar) |
| M5 — Social sidebar | ❌ Não | Novo componente opcional |
| M6 — Preloader anel | ❌ (T3 é contador) | PARTE D T3 — alternativa visual |
| M7 — Tabs vídeo | ❌ Não | Novo padrão de secção |
| M8 — Marquee clientes | ❌ Não | Novo padrão de secção |
| M9 — Grayscale badges | ❌ Não | PARTE C, micro-detalhe |
| M10 — Spotlight rato | ❌ Não | PARTE D, acoplado a M1 |

---

## Como integrar na SKILL.md

### Proposta de inserção na PARTE D (Coreografia de Scroll)

Adicionar após o T7:

```markdown
#### NÚCLEO (extraído de wearemateria.com) — gerar quando o setor for criativo/agência
- **T11 — Letras com parallax 3D (Mouse-track):** letter card com 3 layers sobrepostas
  a moverem-se a velocidades diferentes (back:×48, middle:×32, front:×16). Spotlight
  radial no hover. Background do card inverte (escuro→claro). Ver `reference/material-playbook.md` §M1.
  Implementação: `components/ParallaxLetterCard.tsx`.
- **T12 — Header full-width com blur (alternativa à S2):** em vez da pill flutuante,
  header `fixed top-0 inset-x-0` com `backdrop-filter: blur(20px)` no scroll.
  Ver `reference/material-playbook.md` §M3.
```

### Proposta de inserção na PARTE C (Sistema Visual)

- **S4 (expandir):** grain overlay pode ser **estático** (versão atual) ou **animado**
  (versão Materia, com CSS `steps(2)`). Oferecer ambas no snippet, comentar a diferença.

### Proposta de novos componentes-assinatura opcionais

```markdown
**S5 — Social sidebar (opcional):** `fixed left-5 top-1/2 -translate-y-1/2` com 4-5
ícones redondos. Usar em sites criativos (agências, portfolios). Não usar em conversão.
Ver `reference/material-playbook.md` §M5.

**S6 — Preloader anel (alternativa ao S1/T3):** `preloader-ring` CSS com box-shadows
multicolor + rotação `spin 3s`. Mais minimalista que o contador. Ver M6.
```

---

## Notas de engenharia reversa

Estas observações vieram da análise direta do HTML/CSS/JS de wearemateria.com:

| Descoberta | Detalhe |
|---|---|
| Tema WordPress | **Qwery** (ThemeRex), não custom |
| Page Builder | Elementor 3.15.3 |
| Slider | Slider Revolution 6.6.15 |
| Animações scroll | Classe `qwery-fadeinup` (fadeInUp) e `qwery-fadein` |
| Transições | `cubic-bezier(0.39, 0.575, 0.565, 1)` — custom easing |
| Fonte | **Lanord** (self-hosted, pesos 300/400/500/700) |
| Paleta | `#101010` bg, `#ffc72c` yellow, `#e63422` red, `#F9F9F9` text |
| Ruído | PNG textura + `@keyframes ruido` com `steps(2)` |
| Lazy loading | Native WP + placeholder base64 + `opacity` transition |
| Preloader | Box-shadow multicolor + `filter: blur(3px)` + `spin 3s` |
| Ícones sociais | SVGs custom (Instagram, YouTube, LinkedIn, email) |
| Sticky socials | Rotacionados 90°, `.social_name` hidden |
| Smooth scroll | Desativado no WP (`smooth_scroll:""`) — usa anchor nativo |

---

## Regras de bom gosto extraídas do wearemateria.com

1. **O fundo escuro nunca é preto puro** — usam `#101010` (quase preto), que é mais
   cinematográfico e permite que elementos escuros respirem.
2. **As transições são lentas mas não aborrecidas** — `0.5s–0.8s` com `cubic-bezier`
   custom, nunca `ease-in-out` genérico.
3. **O ruído dá textura a tudo** — sem ele, o site seria "só mais um site dark".
4. **Os ícones sociais são SVGs custom** — nunca Font Awesome genérico. Dá identidade.
5. **Cada secção tem uma "assinatura" visual** — não são templates repetidos. A secção
   de Design tem grid, a de Vídeo tem tabs, a de Marketing tem parallax mockups.
6. **Só há animação onde ela serve o conteúdo** — não há animações decorativas gratuitas.
7. **O hover "recompensa"** — badges ficam coloridos, letras viram branco/preto,
   imagens escalam. O utilizador sente que descobriu algo.
