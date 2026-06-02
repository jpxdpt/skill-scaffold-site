# stack-spec.md — Especificação bloqueada (PARTES B–E)

Esta é a camada que **nunca muda**. Garante que qualquer negócio sai com a mesma
qualidade de engenharia + visual. Só o BRIEF (PART A, na SKILL) varia.

⚠️ Antes de escrever Next.js: lê `node_modules/next/dist/docs/`. Breaking changes vs. memória.

---

## PARTE B — STACK (não negociável)

Next.js (App Router) + React + TypeScript + **Tailwind v4** (`@tailwindcss/postcss`, `@theme`).
- **Animação:** GSAP + ScrollTrigger + **Lenis** (smooth scroll).
- **Dados:** Prisma + **SQLite** (adapter `@prisma/adapter-better-sqlite3`). Entidade + relações via `slug`, campo `ativo`.
- **Auth:** JWT (`jose`) em cookie httpOnly `admin_session`, exp 7d. `bcryptjs` na password.
- **Ícones:** `@phosphor-icons/react`.
- **Pagamento** (se objetivo = comprar/reservar): Stripe.

### Estrutura de ficheiros (espelhar)
```
app/page.tsx                         server component: fetch entidade ativa + relações; export const dynamic='force-dynamic'
app/layout.tsx                       <html lang> + globals.css + fontes + <LenisProvider>
components/{Navbar,Hero,…,Footer}.tsx
components/LenisProvider.tsx          'use client' — ver PARTE D
components/LoadingScreen.tsx          'use client' — assinatura S1 (PARTE C)
components/CustomCursor.tsx           'use client' — assinatura S3 (PARTE C)
app/admin/login/page.tsx
app/admin/(protected)/layout.tsx     sidebar + guard: await isAuthenticated() senão redirect('/admin/login')
app/admin/(protected)/{entidade}/[slug]/page.tsx   editor por tabs
app/admin/(protected)/{entidade}/[slug]/Tab*.tsx
app/api/admin/auth/route.ts          login/logout
app/api/admin/{entidade}/route.ts    + [slug]/route.ts (CRUD)
app/api/admin/upload/route.ts        upload → public/images ou Supabase Storage
lib/db.ts  lib/auth.ts  prisma/schema.prisma  prisma/seed.ts  types/{entidade}.ts
```

### lib/auth.ts (padrão jose)
`signToken()` → `SignJWT({role:'admin'}).setProtectedHeader({alg:'HS256'}).setExpirationTime('7d')`.
`verifyToken` → `jwtVerify`; `isAuthenticated()` lê cookie via `await cookies()`;
`requireAuth(req)` para rotas API; `setSessionCookie` httpOnly + secure em prod + sameSite strict + 7d.

---

## PARTE C — SISTEMA VISUAL (a "beleza", sempre)

1. **Tema dark-first — COM SCOPING OBRIGATÓRIO.** CSS custom properties em `globals.css`.
   ⚠️ No Tailwind v4 o `@theme` injeta as vars em `:root` (global) → **se puseres os tokens
   dark em `@theme` puro, o backoffice herda o dark e parte**. Solução obrigatória:
   - Define os tokens *cromáticos* (bg/surface/text/accent/muted) em **`[data-theme="dark"]`**
     e a variante clara em **`[data-theme="light"]`** (ambos em `globals.css`), e usa
     `@theme inline` apenas para mapear os nomes Tailwind às vars (não para fixar valores de cor).
   - `app/layout.tsx` (site público): `<html data-theme="dark">`.
   - `app/admin/(protected)/layout.tsx` (backoffice): envolve o conteúdo num
     `<div data-theme="light">` **explícito** — nunca confies na herança.
   - Verifica na Fase 6 que o admin NÃO está escuro (ver checklist).

   **Tokens de fallback (usar quando o research NÃO encontra paleta da marca).** Valores HSL
   sem wrapper (Tailwind adiciona `hsl()`). Quase-preto, nunca preto puro:
   ```css
   [data-theme="dark"] {
     --bg:      0 0% 4%;    /* fundo */
     --surface: 0 0% 8%;    /* cartões */
     --text:    0 0% 96%;
     --muted:   0 0% 53%;   /* texto secundário */
     --stroke:  0 0% 12%;   /* bordas/divisores */
     --accent:  /* da marca; se ausente, um tom de marca neutro */ ;
   }
   ```
   Quando o research **encontra** a paleta da marca, sobrepõe `--accent` (e ajusta `--bg`
   se a marca tiver uma base cromática forte), mantendo a estrutura acima.

2. **Título display:** serif, peso 300, `letter-spacing:-0.02em`,
   `font-size: clamp(2.2rem, 8vw, 5.5rem)`. O **último termo** do título sai em `<em>` itálico
   na cor `--accent`. Subtítulo a `0.58em`, `--text` @ 55%.

3. **Overlays sobre media:** gradiente lateral (escuro→transparente, 0→100%) + gradiente
   inferior (escuro→transparente ~45%) para o texto respirar.

4. **CTA pill:** fundo `--accent`, círculo interno + seta "↗".
   Transições `cubic-bezier(0.32,0.72,0,1)`, `active:scale-[0.97]`, hover scale 1.05.

5. **Micro-detalhes:** eyebrow em pill (uppercase, `tracking-[0.22em]`, borda `--accent`@45%);
   linha de 4 stats no fundo da hero; indicador "Scroll" vertical com barra animada
   (`@keyframes scrollLine { 0%{translateY(-100%)} 100%{translateY(200%)} }`, 2s infinite).

6. **Hero:** `min-h-[100dvh]`, vídeo/imagem `object-cover` com `filter: brightness(0.42) saturate(0.75)`,
   `<video autoPlay muted loop playsInline poster=...>` quando há vídeo; senão `<img>` da hero real.

### Componentes-assinatura (GERAR SEMPRE — são o que dá "assinatura" ao site)

Todos respeitam `prefers-reduced-motion` (desligam ou degradam para estático).

**S1. Loading screen cinematográfica** — `components/LoadingScreen.tsx` (`'use client'`),
overlay `fixed inset-0 z-[9999]` com `--bg`. Estado em `app/page.tsx`:
`{isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}`.
- **Contador** 000→100 via `requestAnimationFrame` ao longo de ~2700ms, `String(n).padStart(3,'0')`,
  canto inferior-direito, display serif `text-8xl tabular-nums`.
- **Palavras rotativas** ao centro (3 termos ligados ao negócio, ex.: restaurante →
  ["Sabor","Tradição","Mesa"]), troca cada ~900ms, `font-display italic`.
- **Barra de progresso** no fundo: track `h-[3px]` `--stroke`, preenchimento com
  **accent gradient** (`linear-gradient(90deg, accent →` tom claro `)`), `scaleX(n/100)`,
  `box-shadow: 0 0 8px <accent>/35`.
- **Saída cinematográfica (não fade):** ao chegar a 100, 400ms depois anima
  `clip-path: inset(0 0 0 0)` → `inset(0 0 100% 0)` (cortina a subir), GSAP `power3.inOut`,
  e só então chama `onComplete`.

**S2. Navbar pill flutuante** — `components/Navbar.tsx` (`'use client'`).
`fixed top-0 inset-x-0 z-50 flex justify-center pt-4 md:pt-6`. Pílula interna:
`inline-flex items-center rounded-full backdrop-blur-md border border-white/10 bg-surface px-2 py-2`.
Ganha `shadow-md shadow-black/10` quando `scrollY > 100` (listener passivo).
Conteúdo: logo (círculo com borda accent gradient + iniciais em `font-display italic`) ·
divisor `w-px h-5` `--stroke` · links (`rounded-full px-4 py-2`, ativo `bg-stroke/50`) ·
botão CTA do objetivo de conversão com borda accent gradient no hover.

**S3. Cursor personalizado** — `components/CustomCursor.tsx` (`'use client'`, no layout público).
Dois `div` `fixed pointer-events-none z-[9998]`: um ponto pequeno (segue exato) e um anel
maior (segue com **lerp** ~0.15). Atualiza no `gsap.ticker`:
`ringX += (mouseX - ringX) * 0.15`. Aumenta o anel no hover de links/botões.
Desliga em touch/coarse pointer (`matchMedia('(pointer: coarse)')`) e em reduced-motion.

**S4. Grain overlay global** — uma linha no `app/layout.tsx` (site público): `div`
`fixed inset-0 pointer-events-none z-[1]` com textura `feTurbulence` (SVG data-URI) ou PNG de ruído,
`opacity: 0.035`, `mix-blend-mode: overlay`. Dá textura de filme a todo o site sem custo de perf.
(Não aplicar no backoffice.)

### Tipografia
**Default universal (usar sempre, salvo indicação do research):**
- Display (títulos + palavra em itálico): **Instrument Serif** (italic 400).
- Body: **Inter** (300–700).
- Vars: `--font-display: 'Instrument Serif', serif` · `--font-body: 'Inter', sans-serif`.

Só substitui o default quando o research indicar um setor com identidade própria:
- Arquitetura/B2B/tech: Fraunces / Georgia + Inter ou Geist.
- Clínica/wellness: serif suave + sans humanista.
- Caso a marca tenha tipografia própria identificável → usa-a, com Inter/Instrument Serif de fallback.

### Regras de bom gosto (NÃO-NEGOCIÁVEIS)
- **PROIBIDO usar emojis** em qualquer texto de UI — títulos, cards, eyebrows, botões, labels,
  features, seed da BD. Nada de 🍽️ 🏨 ✨ 🎯 etc. Emoji num título de card é erro, não decoração.
- **Sistema de ícones = Phosphor** (`@phosphor-icons/react`), peso `thin`/`light`, herdam
  `currentColor`. O campo `icone` da BD guarda o **nome do ícone Phosphor** (ex.: `"MapPin"`,
  `"ForkKnife"`, `"Mountains"`), nunca um emoji nem um caractere unicode. No frontend mapeia
  o nome → componente Phosphor. Se não houver ícone adequado, usa **nenhum** (texto limpo) em
  vez de um emoji.
- **Casing com intenção:** eyebrows e labels de secção em `UPPERCASE` com `tracking` largo;
  títulos em sentence case (serif). Contraste de casing cria hierarquia (à normalisboring.es).
- **Contenção > efeito:** muito whitespace, a fotografia domina, a UI cala-se. Sem sombras
  pesadas, sem bordas grossas, sem gradientes garridos fora do `--accent`.
- **Números/stats** em `tabular-nums`. Texto secundário via `--muted`, nunca cinza random.

---

## PARTE D — COREOGRAFIA DE SCROLL (GSAP + ScrollTrigger + Lenis)

### LenisProvider.tsx ('use client', envolve children no layout)
```ts
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
// cleanup: lenis.destroy(); gsap.ticker.remove(...)
// respeitar matchMedia('(prefers-reduced-motion: reduce)') → não iniciar Lenis nem animações
```
Regista plugins client-side: `gsap.registerPlugin(ScrollTrigger)`.

### Hero (on mount)
`gsap.context(() => { timeline defaults power3.out })`:
tag(y20,op0,0.8) → título(y60,op0,1.1) `-=0.4` → subtítulo(y30,op0,0.9) `-=0.6` → cta(y20,op0,0.8) `-=0.5`.
Indicador de scroll esmaece com `window.scrollY`. Cleanup `ctx.revert()`.

### Secções (on scroll)
Cada bloco: `ScrollTrigger` `{ trigger, start:'top 80%', once:true }` →
`from({ y:40, opacity:0, stagger:0.08, ease:'power3.out' })`.
- **Galeria:** parallax leve `yPercent` com `scrub:true`.
- Opcional: 1 secção `pin` (`pinSpacing`) para um momento de destaque.
Sempre `gsap.context` + cleanup.

### Vocabulário de transições (estilo normalisboring.es — contidas, lentas, "premium")
Filosofia: movimento **lento e suave** (durações 0.8–1.4s, `ease: 'expo.out'` ou
`'power3.out'`, NUNCA bounce/elastic). A transição revela conteúdo, não chama atenção a si.

- **T1 — Revelação de texto por máscara (headings):** cada linha do título dentro de um
  wrapper `overflow-hidden`; a linha entra de `y:110%` → `0%` com `ScrollTrigger` e
  `stagger:0.08`. (Para multi-linha, parte o texto por linha; SplitText opcional.) É o efeito
  de "texto que sobe debaixo de uma cortina" — assinatura deste género de site.
- **T2 — Revelação de imagem por clip-path:** ao entrar no viewport, imagem anima
  `clip-path: inset(100% 0 0 0)` → `inset(0 0 0 0)` (cortina vertical), 1.1s `expo.out`,
  com a `<img>` interna a fazer `scale(1.15)`→`scale(1)` em simultâneo (efeito de "lente").
- **T3 — Hover de card de projeto:** imagem `scale(1.04)` + a label do título desliza/fade
  por baixo de uma máscara (overflow-hidden). **Sem emoji, sem ícone** na label — só o nome.
  Cursor cresce (S3). Transição `cubic-bezier(0.32,0.72,0,1)`, ~0.6s.
- **T4 — Transição de página/rota (wipe):** se o site tiver páginas (ex.: detalhe de projeto),
  um painel `fixed inset-0` com `--bg` (ou `--accent`) faz wipe: entra `scaleY(0)`→`1` (origem
  baixo), troca a rota por trás, sai `scaleY(1)`→`0` (origem topo). Liga ao router; em SPA
  usa um overlay controlado por estado. Mantém o Lenis a fazer `scrollTo(0)` no meio do wipe.
- **T5 — Sticky/horizontal:** uma secção `pin` onde o conteúdo se move em `x` com `scrub`
  (galeria horizontal ou texto grande a atravessar). Usar com parcimónia (1 por página).

Todas estas transições degradam para estado final estático sob `prefers-reduced-motion`.

> ⚠️ Não consegui capturar o JS exato do normalisboring.es (transições vivem em runtime).
> Isto codifica as TÉCNICAS do género; se quiseres replicar um momento específico, descreve-o.

---

## PARTE E — BACKOFFICE (CMS, sempre)

- **/admin/login:** form → `POST /api/admin/auth` → `bcrypt.compare` → `signToken()` → set cookie.
- **(protected)/layout:** `await isAuthenticated()` senão `redirect('/admin/login')`.
  Sidebar **branca** (light theme — o admin é utilitário): Dashboard + {Entidade} + Logout.
  ⚠️ Envolve TODO o conteúdo do admin num `<div data-theme="light" className="...">` explícito
  (ver PARTE C ponto 1) — caso contrário herda os tokens dark do site público e fica ilegível.
- **Editor por TABS** para a entidade:
  - **Geral** — campos de texto (nome, subtitulo, descricao, regiao/localização, preço).
  - **Galeria** — upload + reordenar (ordem) + toggle `wide` + alt.
  - **Media** — vídeo/imagem da hero.
  - **Features/Includes** — ícone (campo guarda **nome Phosphor**, ex.: `"MapPin"`; NUNCA
    emoji) + label + descrição + ordem. Selector de ícone Phosphor no admin, não input livre.
  - **Stats** — 4 métricas (label + valor).
  Cada tab faz PATCH à sua fatia. Save otimista + toast de feedback.
- **API:** `requireAuth(req)` no topo de **todas** as rotas `/api/admin/*`. Validação de input.
- **Upload:** guarda em `public/images/` (ou Supabase Storage) e devolve o path.

---

## Modelo de dados (template Prisma — adapta nomes ao setor)
```prisma
model {Entidade} {
  id          Int      @id @default(autoincrement())
  slug        String   @unique
  nome        String
  subtitulo   String
  descricao   String
  regiao      String   // localização / categoria
  // 4 stats genéricos (renomeia ao setor):
  stat1       String
  stat2       String
  stat3       String
  stat4       String
  preco       Float?
  videoPath   String?
  ativo       Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  fotos    Foto[]
  features Feature[]
}
model Foto    { id Int @id @default(autoincrement()) {ent}Id Int  {ent} {Entidade} @relation(fields:[{ent}Id],references:[id],onDelete:Cascade) path String alt String wide Boolean @default(false) ordem Int @default(0) }
model Feature { id Int @id @default(autoincrement()) {ent}Id Int  {ent} {Entidade} @relation(fields:[{ent}Id],references:[id],onDelete:Cascade) icone String label String descricao String ordem Int @default(0) }
// `icone` = nome de ícone Phosphor (ex.: "MapPin"), NUNCA emoji/unicode.
```

## Checklist de entrega
- [ ] schema + migration + seed com 1 entidade real preenchida.
- [ ] Frontend responsivo com coreografia de scroll completa.
- [ ] **Componentes-assinatura (PARTE C):** LoadingScreen (contador+clip-path), Navbar pill,
      CustomCursor, grain overlay — todos com fallback reduced-motion / touch.
- [ ] Backoffice: login + CRUD + upload funcionais.
- [ ] **Tema scoped:** site público dark (`data-theme="dark"`), admin claro
      (`data-theme="light"`) — confirma que `/admin` NÃO está escuro.
- [ ] `prefers-reduced-motion` respeitado; vídeo com poster; imagens lazy.
- [ ] **ZERO emojis** em qualquer texto de UI/seed; ícones = Phosphor (campo `icone` = nome Phosphor).
- [ ] Transições do vocabulário aplicadas (texto por máscara, clip-path em imagens) — contidas, lentas.
- [ ] **`LEGAL_NOTICE.md` no root** do projeto gerado (ver SKILL Fase 6).
- [ ] Sem libs fora do stack bloqueado (ou justificadas).
