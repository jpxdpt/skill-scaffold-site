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

1. **Tema dark-first.** CSS custom properties em `globals.css` via `@theme`. Tudo deriva dos
   tokens do brief: `--bg --surface --text --accent --muted` (muted = text @ 40-60%).

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

### Tipografia por setor (sugestão)
- Restaurante/hotel/luxo: Instrument Serif / Cormorant + Inter.
- Arquitetura/B2B/tech: Georgia / Fraunces + Inter ou Geist.
- Clínica/wellness: serif suave + sans humanista.

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

---

## PARTE E — BACKOFFICE (CMS, sempre)

- **/admin/login:** form → `POST /api/admin/auth` → `bcrypt.compare` → `signToken()` → set cookie.
- **(protected)/layout:** `await isAuthenticated()` senão `redirect('/admin/login')`.
  Sidebar **branca** (light theme — o admin é utilitário): Dashboard + {Entidade} + Logout.
- **Editor por TABS** para a entidade:
  - **Geral** — campos de texto (nome, subtitulo, descricao, regiao/localização, preço).
  - **Galeria** — upload + reordenar (ordem) + toggle `wide` + alt.
  - **Media** — vídeo/imagem da hero.
  - **Features/Includes** — ícone (Phosphor) + label + descrição + ordem.
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
```

## Checklist de entrega
- [ ] schema + migration + seed com 1 entidade real preenchida.
- [ ] Frontend responsivo com coreografia de scroll completa.
- [ ] Backoffice: login + CRUD + upload funcionais.
- [ ] `prefers-reduced-motion` respeitado; vídeo com poster; imagens lazy.
- [ ] Sem libs fora do stack bloqueado (ou justificadas).
