# scaffold-site — Claude Code skill

Dá o **nome de um negócio** e o Claude Code constrói um website single-page com hero
cinematográfica + backoffice (CMS), usando **informação e imagens reais** que vai buscar à
web sobre esse negócio (site oficial, Google, TripAdvisor, Instagram…).

Stack gerado: **Next.js (App Router) + TypeScript + Tailwind v4 + GSAP + ScrollTrigger +
Lenis + Prisma/SQLite + JWT**.

## Instalar

A skill é instalada em `~/.claude/skills/scaffold-site` (a localização global de skills do
Claude Code), por isso fica disponível em **qualquer projeto** nesse PC.

### Windows
```powershell
git clone <URL-DO-REPO> scaffold-site-skill
cd scaffold-site-skill
powershell -ExecutionPolicy Bypass -File install.ps1
```

### macOS / Linux
```bash
git clone <URL-DO-REPO> scaffold-site-skill
cd scaffold-site-skill
bash install.sh
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
install.ps1 / install.sh         # copiam a skill para ~/.claude/skills
```

## Atualizar

Faz `git pull` e corre o script de install outra vez (substitui a versão anterior).

## Nota legal

As imagens recolhidas de terceiros são **placeholders de protótipo**. Antes de produção,
substitui-as por imagens próprias ou licenciadas — o `MANIFEST.json` gerado guarda a origem
de cada uma para facilitar atribuição/substituição.
