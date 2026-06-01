# research-playbook.md — Como investigar o negócio e buscar imagens REAIS

O valor desta skill está aqui: usar **conteúdo e imagens verdadeiras** do negócio,
não placeholders genéricos. Ferramentas: `WebSearch`, `WebFetch`, e download via
`curl`/`Invoke-WebRequest` (Bash/PowerShell).

---

## Recolha de factos

Faz 3-6 WebSearches direcionados. Queries úteis (substitui `{negócio}` + `{local}`):
- `{negócio} {local}` — visão geral, site oficial.
- `{negócio} site oficial` / `{negócio} official website`.
- `{negócio} menu` / `serviços` / `preços` / `horário`.
- `{negócio} sobre` / `história` / `quem somos`.
- `{negócio} reviews tripadvisor` / `google maps` — rating + nº de avaliações (vira stat).

Com `WebFetch` na **página oficial**, extrai:
- Nome oficial + tagline/slogan exatos.
- Descrição na voz da marca (2-3 frases — reusa o tom deles, não inventes).
- Serviços/produtos principais → viram as **Features/Includes** (com ícone Phosphor adequado).
- Localização, contactos, horário → footer + CTA.
- **Paleta da marca:** inspeciona o CSS/logo do site oficial (cores hex dominantes) →
  mapeia para `--bg --surface --text --accent`. Se o site for claro, escurece para o
  dark-first mantendo o `--accent` da marca.
- **Tom** (elegante / energético / técnico / luxuoso / acolhedor).
- 4 **stats/destaques credíveis** (anos de atividade, nº de pratos/quartos/projetos, rating,
  nº de avaliações). Só usa números que encontraste — não inventes.

> ❗ Factos verificáveis (morada, telefone, preços, rating) **nunca** são inventados.
> Se não encontras, deixa vazio e regista em "campos por preencher" no relatório final.

---

## Recolha de imagens  ⭐

### Prioridade de fontes (alto → baixo)
1. **Site oficial** — meta `og:image`, `<img>` de hero/galeria, CDN próprio. Melhor qualidade e legitimidade.
2. **Google Business / Maps** — fotos do estabelecimento.
3. **TripAdvisor / Zomato / TheFork** — restaurantes/hotéis (fotos de pratos, espaço).
4. **Instagram / Facebook oficiais** — `og:image` dos posts/perfil.
5. **Wikimedia Commons** — para marcos/locais públicos (licença livre, ideal).
6. **Unsplash / Pexels** — ⚠️ **só fallback de ambiente** (ex: "comida italiana" genérica)
   quando o research de imagens reais falha. Nunca é a 1ª escolha.

### Como obter o URL direto do ficheiro
- `WebFetch` na página → procura `og:image`, `twitter:image`, ou `<img src>` de alta-res.
- Preferir URLs que acabam em `.jpg/.jpeg/.png/.webp` ou CDN de imagem.
- Evitar: logos minúsculos, sprites, ícones, tracking pixels, imagens < 10KB.

### Download (Windows / multiplataforma)
```powershell
# PowerShell
Invoke-WebRequest -Uri "<URL>" -OutFile "public/images/hero.jpg" -UseBasicParsing
```
```bash
# Bash/curl (com user-agent para evitar bloqueios simples)
curl -L -A "Mozilla/5.0" "<URL>" -o public/images/hero.jpg
```
Depois **valida cada ficheiro**: existe, > 10KB, e abre como imagem (content-type `image/*`).
Descarta e tenta a próxima candidata se falhar (hotlink protection, 403, HTML em vez de imagem).

### Seleção
- **1 hero:** landscape, maior resolução, representativa (fachada, prato-assinatura, interior).
- **6-10 galeria:** mistura `wide`/normal; variedade (espaço, produto, detalhe, equipa).
- Renomeia: `hero.jpg`, `galeria-01.jpg`, … Gera `alt` descritivo em PT para cada uma.

### MANIFEST.json (obrigatório)
`public/images/MANIFEST.json`:
```json
[
  { "file": "hero.jpg", "role": "hero",
    "sourceUrl": "https://…/foto.jpg", "sourcePage": "https://…",
    "alt": "Sala principal do restaurante ao entardecer", "credit": "Site oficial" }
]
```

### ⚖️ Nota legal (inclui sempre no relatório final ao utilizador)
> As imagens recolhidas de terceiros (TripAdvisor, redes sociais, etc.) são usadas como
> **placeholder de protótipo/demonstração**. Antes de pôr o site em produção, substitui-as
> por imagens **próprias ou licenciadas**. O MANIFEST guarda a origem de cada uma para
> facilitar a substituição/atribuição. Não contornes proteções técnicas nem ToS dos sites.

Se `--no-images` ou o research de imagens falhar totalmente: usa gradientes/cor sólida da
marca como fundo da hero + cartões de galeria com placeholder, e **assinala claramente** que
não foram encontradas imagens reais.

---

## Erros comuns a evitar
- Descarregar a **página HTML** em vez do ficheiro de imagem (verifica content-type).
- Usar o **logo** como hero (é pequeno e tem fundo transparente).
- Inventar morada/telefone/rating "para encher".
- Ir direto a Unsplash sem tentar as fontes reais primeiro.
- Esquecer o `alt` (acessibilidade) e o MANIFEST (rastreabilidade).
