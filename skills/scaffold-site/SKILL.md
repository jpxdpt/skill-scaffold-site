---
name: scaffold-site
description: Nome de um negócio → website single-page cinematográfico + backoffice (CMS). Faz research na web sobre o negócio, vai buscar imagens REAIS (site oficial, Google, TripAdvisor, Instagram), e gera tudo no stack Next.js + GSAP + ScrollTrigger + Lenis + Prisma/SQLite.
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
- ⚖️ **Nota legal (inclui no relatório):** imagens de terceiros são para **protótipo/demo**.
  Antes de produção, substituir por imagens licenciadas/próprias. Mantém atribuição no MANIFEST.
- Se `--no-images`: salta esta fase, usa gradientes/placeholders e assinala-o.

### Fase 3 — Síntese do Brief (PART A)
Preenche o brief a partir das Fases 1-2. Mapeia o negócio à **entidade principal**:
restaurante→`Prato`/`Menu`, imobiliária→`Imovel`, clínica→`Servico`, hotel→`Quarto`, etc.
Confirma o brief com o utilizador em 1 mensagem curta antes de construir (mostra: marca,
objetivo, entidade, paleta, nº de imagens recolhidas). Avança se aprovado.

### Fase 4 — Scaffold (stack bloqueado)
Constrói segundo `reference/stack-spec.md` — PARTES B (stack), C (visual), D (scroll), E (backoffice).
Espelha a arquitetura: `app/page.tsx` (server, fetch entidade ativa) → `Navbar + Hero +
secções + Footer`; backoffice protegido por JWT com editor por tabs; rotas `/api/admin/*`.
Não introduzas libs fora do stack sem justificar.

### Fase 5 — Seed com conteúdo real
`prisma/seed.ts` cria 1 entidade ativa preenchida com os **factos reais** da Fase 1 e
referencia as **imagens reais** da Fase 2 (paths de `public/images/` + alt do MANIFEST).
Corre migration + seed.

### Fase 6 — Verificar & entregar
- `npm run build` (ou `next dev`) para confirmar que arranca sem erros.
- Respeita `prefers-reduced-motion`; vídeo/hero com `poster`; imagens com lazy load.
- **Relatório final** ao utilizador:
  - O que foi investigado (fontes principais).
  - Quantas imagens reais foram usadas + a nota legal.
  - Campos que ficaram em placeholder (a preencher no backoffice).
  - Como correr o site e entrar no `/admin`.

---

## Princípios

- **Real > genérico.** O valor desta skill é usar conteúdo e imagens verdadeiras do negócio.
  Só cais para stock/placeholder quando o research falha — e dizes que falhou.
- **Não inventes** moradas, telefones, preços, ratings. Vazio honesto > facto falso.
- **A beleza é não-negociável** — o sistema visual e a coreografia de scroll da spec
  aplicam-se sempre, seja qual for o negócio.
- **O backoffice é utilitário** — clareza acima de estética; o dark cinematográfico é só no site público.
