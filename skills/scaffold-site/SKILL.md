---
name: scaffold-site
description: >-
  Gera um website single-page cinematográfico + backoffice (CMS) a partir do NOME de um
  negócio. Usar SEMPRE que o utilizador quer criar/construir/fazer um site, página ou
  landing page para uma empresa, marca, restaurante, hotel, clínica, loja, imobiliária,
  estúdio ou qualquer negócio (ex.: "cria um site para o restaurante X", "faz uma landing
  page para a clínica Y", "build a website for Z"). Faz research na web sobre o negócio e
  vai buscar IMAGENS REAIS (site oficial, Google, TripAdvisor, Instagram) em vez de
  placeholders. Stack: Next.js + GSAP + ScrollTrigger + Lenis + Prisma/SQLite + JWT.
trigger: /scaffold-site
---

# /scaffold-site

Dás-me o nome (ou tipo) de um negócio e eu construo um website single-page com hero
cinematográfica + backoffice completo, **usando informação e imagens REAIS** que vou
buscar à web sobre esse negócio — não placeholders genéricos.

## Usage

```
/scaffold-site <nome do negócio>                     # pipeline completo
/scaffold-site "Restaurante O Paço, Arouca"          # com localização ajuda o research
/scaffold-site <nome> --goal reservar                # força objetivo de conversão
/scaffold-site <nome> --no-images                    # salta recolha de imagens (placeholders)
/scaffold-site <nome> --here                          # gera no diretório atual (não cria pasta nova)
/scaffold-site <nome> --research-only                 # só faz research + manifest, não constrói
```

## O que esta skill faz

Transforma **um nome de negócio** num site pronto a editar:
1. **Investiga** o negócio na web (setor, serviços, localização, tom, paleta da marca).
2. **Recolhe imagens reais** do negócio (hero, galeria) de fontes públicas.
3. **Sintetiza um brief** e constrói o site + backoffice no stack bloqueado.
4. **Faz seed** da base de dados com o conteúdo e imagens reais.

> Lê `reference/stack-spec.md` (stack + sistema visual + scroll) e
> `reference/research-playbook.md` (como investigar e buscar imagens) **antes de construir**.
> Componentes de animação prontos em `reference/snippets/` — **copia e adapta** de lá
> (não reescrevas SplitText/cursor/preloader/flip-media do zero).
> ⚠️ Antes de escrever código Next.js: lê `node_modules/next/dist/docs/` — esta versão tem breaking changes.

---

## Pipeline

Cria uma TaskList com estas fases e atualiza à medida que avanças.

### Fase 0 — Intake & desambiguação
- Extrai do input: **nome**, **localização** (se houver), **flags**.
- Se o negócio for ambíguo (nome comum, sem localização) → 1 WebSearch rápido para
  confirmar de qual se trata. Se continuar ambíguo, pergunta ao utilizador (AskUserQuestion)
  qual dos resultados é o correto. Não inventes.
- Infere o **setor** e o **objetivo de conversão** provável:
  restaurante→`reservar`, loja→`comprar`, clínica/serviços→`marcar`, imobiliária/B2B→`contactar`.
  Respeita `--goal` se fornecido.

### Fase 1 — Research (WebSearch + WebFetch)
Segue `reference/research-playbook.md` § "Recolha de factos". Recolhe e guarda num
rascunho estruturado:
- Nome oficial, tagline/slogan, descrição (2-3 frases na voz da marca).
- Setor, serviços/produtos principais (→ vira as *Features/Includes*).
- Localização, contactos, horário (se relevante para o footer/CTA).
- **Paleta da marca** (cores do logo/site oficial → tokens `--bg --surface --text --accent`).
- **Tom** (elegante / energético / técnico / luxuoso…).
- 4 métricas/destaques credíveis (anos, nº de pratos/quartos/projetos, rating, etc.).
- Tipografia que combine com o setor (serif display + sans body).
**Nunca inventes factos verificáveis** (morada, telefone, preços). Se não encontrares, deixa
o campo vazio/placeholder e assinala-o no relatório final.

### Fase 2 — Recolha de imagens REAIS  ⭐ (núcleo desta skill)
Segue `reference/research-playbook.md` § "Recolha de imagens". Resumo:
- Procura imagens do negócio por ordem de prioridade de fonte (site oficial/`og:image` →
  Google Business/Maps → TripAdvisor → Instagram/Facebook → Wikimedia para marcos →
  Unsplash/Pexels como **fallback de ambiente**, nunca como 1ª escolha).
- Para cada candidata, obtém o **URL direto do ficheiro** (não a página). Descarrega para
  `public/images/` com `curl`/`Invoke-WebRequest`. Valida que abriu como imagem real
  (tamanho > 10KB, content-type image/*). Descarta logos minúsculos e ícones.
- Escolhe **1 hero** (landscape, alta resolução) + **6-10 de galeria** (varia wide/tall).
- Escreve `public/images/MANIFEST.json`: para cada imagem → `{ file, sourceUrl, sourcePage, alt, credit, role }`.
- ⚖️ **Legal:** imagens de terceiros são placeholders de **protótipo**. Isto é tratado como
  entregável formal na Fase 6 (`LEGAL_NOTICE.md` no root, com definição de "produção") — não
  apenas uma frase no relatório. Mantém atribuição/origem de cada imagem no MANIFEST.
- Se `--no-images`: salta esta fase, usa gradientes/placeholders e assinala-o.

### Fase 3 — Síntese do Brief (PART A)
Preenche o brief a partir das Fases 1-2. Mapeia o negócio à **entidade principal**:
restaurante→`Prato`/`Menu`, imobiliária→`Imovel`, clínica→`Servico`, hotel→`Quarto`, etc.
Confirma o brief com o utilizador em 1 mensagem curta antes de construir (mostra: marca,
objetivo, entidade, paleta, nº de imagens recolhidas). Avança se aprovado.

### Fase 4 — Diagnóstico + Scaffold (stack bloqueado)

**4a. Diagnóstico ANTES de escrever código (obrigatório):**
- Se vais gerar dentro de um projeto Next.js existente, lê `node_modules/next/dist/docs/`
  para as APIs que vais tocar (App Router, route handlers, `cookies()`, metadata).
- Confirma a versão de Next/Tailwind/Prisma no `package.json` e adapta a sintaxe a ELA
  (não à memória). Anota qualquer breaking change relevante antes de começar.
- Num projeto novo: scaffold base primeiro (`create-next-app` equivalente do stack), confirma
  que `npm run build` passa **vazio**, e só depois adicionas as features. Assim isolas erros
  do scaffold dos erros do teu código.

**4b. Construção:** segundo `reference/stack-spec.md` — PARTES B (stack), C (visual),
D (scroll), E (backoffice). Espelha a arquitetura: `app/page.tsx` (server, fetch entidade
ativa) → `Navbar + Hero + secções + Footer`; backoffice protegido por JWT com editor por
tabs; rotas `/api/admin/*`. Tema **scoped** (dark público / light admin — PARTE C ponto 1).
**Transições:** aplica o NÚCLEO do vocabulário (PARTE D) copiando de `reference/snippets/`
(Preloader, SplitTextReveal, FlipMedia, CustomCursor, DirectionAwareButton, LinkRollover,
LenisProvider); os situacionais (HorizontalScroll, PageTransition) só se o layout pedir.
Não introduzas libs fora do stack sem justificar.
Constrói por camadas e corre `npm run build` ao fim de cada camada grande (schema → frontend →
backoffice) em vez de só no fim — apanhas o erro perto da causa.

### Fase 5 — Seed com conteúdo real
`prisma/seed.ts` cria 1 entidade ativa preenchida com os **factos reais** da Fase 1 e
referencia as **imagens reais** da Fase 2 (paths de `public/images/` + alt do MANIFEST).
⚠️ **Sem emojis** em nenhum campo. O campo `icone` das Features guarda o **nome de um ícone
Phosphor** (ex.: `"ForkKnife"`, `"MapPin"`), nunca um emoji. Corre migration + seed.

### Fase 6 — Verificar & entregar

**6a. Build com ciclo de correção (não desistas no 1º erro):**
- Corre `npm run build`. Se falhar:
  1. Lê o erro e classifica: breaking change do Next (→ consulta `node_modules/next/dist/docs/`),
     erro de tipo, import errado, ou config Tailwind/Prisma.
  2. Corrige a causa e volta a correr. **Até 3 iterações.**
  3. Se ao fim de 3 não resolver, **pára** e reporta ao utilizador: o erro exato, o que tentaste,
     e a tua hipótese. Não entres em loop infinito nem "mascares" o erro (ex.: `// @ts-ignore`,
     desligar strict, apagar a feature) sem o dizer.
- Verifica visualmente o **scoping de tema**: abre `/` (deve estar dark) e `/admin` (deve estar
  claro/legível). Se o admin estiver escuro → bug de tema (PARTE C ponto 1), corrige.
- Respeita `prefers-reduced-motion`; vídeo/hero com `poster`; imagens com lazy load.

**6b. Gera `LEGAL_NOTICE.md` no root do projeto** (entregável obrigatório quando se usaram
imagens de terceiros). Conteúdo:
> ## Aviso sobre imagens
> As imagens em `public/images/` (exceto fallbacks de stock licenciado) foram recolhidas de
> fontes públicas como placeholders de **protótipo**. Ver origem de cada uma em
> `public/images/MANIFEST.json`.
>
> **"Produção" = qualquer site acessível publicamente** (deploy num domínio, link partilhado,
> staging exposto). Antes disso, substitui estas imagens por imagens **próprias ou
> licenciadas** e atualiza o MANIFEST. Correr localmente (`localhost`) não conta como produção.

**6c. Relatório final** ao utilizador:
  - O que foi investigado (fontes principais).
  - Quantas imagens reais foram usadas, de que fontes + apontar para `LEGAL_NOTICE.md`.
  - Campos que ficaram em placeholder (a preencher no backoffice).
  - Estado do build (passou / erros pendentes).
  - Como correr o site e entrar no `/admin`.

---

## Modo Plataforma (multi-sided products)

Quando o negócio for uma **plataforma** (SaaS, marketplace, loyalty, reservas, etc.)
em vez de um site institucional, ativa este modo em complemento ao pipeline normal.

### Deteção automática
Ativa se o input mencionar: reservas, loyalty, multi-tenant, white-label, clientes finais +
gestão + admin, campanha/cupão/reward, ou qualquer produto com 3+ lados distintos.

### Arquitetura multi-sided obrigatória
Identifica os lados antes de construir:

| Lado | Utilizadores | Objetivo |
|------|-------------|---------|
| **Merchant / Backoffice** | Staff, manager do negócio | Gerir operação |
| **Customer App / PWA** | Cliente final | Interagir com a marca |
| **Operator / Super-admin** | Dono da plataforma | Gerir tenants, planos, auditoria |

Para cada lado define: objetivos, utilizadores, ecrãs principais, ações críticas, permissões,
dados visíveis e KPIs relevantes.

### Princípio de eventos auditáveis (sem dependência externa)
Quando a plataforma não pode depender de integrações externas no MVP, o modelo de valor
assenta em **eventos internos controláveis**:
- Regista eventos (criação, confirmação, presença, resgate, pagamento, reativação).
- Cada evento tem: `id`, `tenant_id`, `type`, `actor`, `timestamp`, `payload`, `status`.
- Esses eventos são a fonte de verdade para cobrança, auditoria e analytics.
- Nunca dependa de dados do sistema externo para provar que algo aconteceu.

### Multi-tenancy e white-label
- Isola dados por `tenant_id` em todas as tabelas.
- Branding configurável por tenant: cores, logo, nome, domínio.
- Módulos ativáveis/desativáveis por tenant (feature flags na config).
- MVP: um único DB com row-level isolation; migra para schema-per-tenant se a escala exigir.

### Regras de resposta para especificações de produto
Quando o utilizador pede especificação, PRD ou desenho de produto (não código):
- Nível PRD/SRS estratégico — nunca superficial.
- Para cada problema → solução **e** trade-offs.
- Para cada escolha → justifica este caminho vs alternativas.
- Usa tabelas para comparar opções, pricing, entidades.
- Destaca riscos críticos explicitamente.
- Termina com **"Decisão recomendada"** que sintetiza arquitetura e modelo de negócio.

---

## Princípios

- **Real > genérico.** O valor desta skill é usar conteúdo e imagens verdadeiras do negócio.
  Só cais para stock/placeholder quando o research falha — e dizes que falhou.
- **Não inventes** moradas, telefones, preços, ratings. Vazio honesto > facto falso.
- **A beleza é não-negociável** — o sistema visual e a coreografia de scroll da spec
  aplicam-se sempre, seja qual for o negócio.
- **ZERO emojis na UI.** Nunca uses emojis em títulos, cards, labels, botões ou seed —
  parece amador. Ícones são sempre Phosphor (ver `stack-spec.md` → Regras de bom gosto).
- **Transições contidas e lentas** (vocabulário em `stack-spec.md` PARTE D) — premium, não chamativo.
- **O backoffice é utilitário** — clareza acima de estética; o dark cinematográfico é só no site público.
