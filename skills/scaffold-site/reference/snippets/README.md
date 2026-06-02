# snippets/ — implementações de referência (React + GSAP)

Componentes prontos a **copiar e adaptar** para o projeto gerado. Traduzem as técnicas
verificadas do normalisboring.es para o stack Next.js/React desta skill. Adapta cores,
durações e textos ao negócio — não cole cego.

## Pré-requisitos
- `gsap` ≥ 3.13 (SplitText e MorphSVGPlugin já são grátis nesta versão).
- `lenis`. Tailwind v4 com tokens `--bg/--surface/--text/--accent/--stroke` e classe
  `.accent-gradient` (ver `stack-spec.md` PARTE C).
- Regista plugins uma vez no cliente: `gsap.registerPlugin(ScrollTrigger, SplitText, MorphSVGPlugin)`.
  (Cada snippet já regista o que usa.)

## Núcleo (gerar sempre)
| Ficheiro                 | Técnica | Onde usar |
|--------------------------|---------|-----------|
| `LenisProvider.tsx`      | Smooth scroll desktop-only | envolve children no layout |
| `Preloader.tsx`          | T3 loading real+fake + clip-path exit | `app/page.tsx` |
| `SplitTextReveal.tsx`    | T1 texto por linhas/chars | títulos e parágrafos |
| `FlipMedia.tsx`          | T2 clip-path + parallax | todas as imagens de conteúdo |
| `CustomCursor.tsx`       | T4 cursor lerp + expand | layout público |
| `DirectionAwareButton.tsx`| T5 fundo segue o rato | CTAs |
| `LinkRollover.tsx`       | T6 rollover por máscara | nav / links |

## Situacional (só quando o layout pede)
| Ficheiro               | Técnica | Nota |
|------------------------|---------|------|
| `HorizontalScroll.tsx` | T8 scroll horizontal pin | portefólios/galerias; evitar em sites sóbrios |
| `PageTransition.tsx`   | T9 overlay wipe entre rotas | só multi-página; single-page não precisa |

## Regras
- Todos respeitam `prefers-reduced-motion` (degradam para estático) e Lenis/cursor desligam em touch.
- **Zero emojis.** Ícones = Phosphor. Ver `../stack-spec.md` → Regras de bom gosto.
- Movimento lento e contido (`expo.out`/`power3.out`, 0.8–1.4s), nunca bounce/elastic.
