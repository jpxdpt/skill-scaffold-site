# scaffold-site — Claude Code skill

Dá o **nome de um negócio** e o Claude Code constrói um website single-page com hero
cinematográfica + backoffice (CMS), usando **informação e imagens reais** que vai buscar à
web sobre esse negócio (site oficial, Google, TripAdvisor, Instagram…).

Stack gerado: **Next.js (App Router) + TypeScript + Tailwind v4 + GSAP + ScrollTrigger +
Lenis + Prisma/SQLite + JWT**.

## Instalar

A skill é instalada em `~/.claude/skills/scaffold-site` (a localização global de skills do
Claude Code), por isso fica disponível em **qualquer projeto** nesse PC.

### Recomendado — `npx` (Windows / macOS / Linux, sem clonar)

```bash
npx github:jpxdpt/skill-scaffold-site
```

Um único comando, multiplataforma, sem problemas de execution policy do PowerShell.
Para **atualizar**, corre o mesmo comando outra vez (substitui a versão anterior).

> Se algum dia for publicado no npm, fica também: `npx scaffold-site-skill`.

### Alternativa — clonar + script

```powershell
git clone https://github.com/jpxdpt/skill-scaffold-site.git
cd skill-scaffold-site
powershell -ExecutionPolicy Bypass -File install.ps1   # Windows
# bash install.sh                                       # macOS / Linux
```

Reinicia o Claude Code se já estiver aberto.

## Usar

```
/scaffold-site Restaurante O Paço, Arouca
/scaffold-site "Clínica Dental Sorriso" --goal marcar
/scaffold-site <nome> --research-only      # só investiga + recolhe imagens
/scaffold-site <nome> --no-images          # salta imagens reais
```

## O que está no repo

```
skills/scaffold-site/
  SKILL.md                       # orquestrador (pipeline de 6 fases)
  reference/stack-spec.md        # stack + sistema visual + scroll + backoffice (bloqueado)
  reference/research-playbook.md # como investigar e buscar imagens reais
bin/install.js                   # instalador multiplataforma (usado pelo npx)
install.ps1 / install.sh         # alternativa para quem clona o repo
package.json                     # expõe o bin para o npx
```

## Atualizar

Corre `npx github:jpxdpt/skill-scaffold-site` outra vez (substitui a versão anterior).
Se clonaste, faz `git pull` e corre o script de install.

## Nota legal

As imagens recolhidas de terceiros são **placeholders de protótipo**. Antes de produção,
substitui-as por imagens próprias ou licenciadas — o `MANIFEST.json` gerado guarda a origem
de cada uma para facilitar atribuição/substituição.
