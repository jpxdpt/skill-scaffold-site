#!/usr/bin/env bash
# install.sh — instala a skill scaffold-site no Claude Code (macOS / Linux)
# Uso:  bash install.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE="$SCRIPT_DIR/skills/scaffold-site"
DEST="$HOME/.claude/skills/scaffold-site"

if [ ! -d "$SOURCE" ]; then
  echo "Erro: não encontrei a skill em $SOURCE" >&2
  exit 1
fi

mkdir -p "$(dirname "$DEST")"

if [ -d "$DEST" ]; then
  echo "A skill já existe em $DEST — a substituir..."
  rm -rf "$DEST"
fi

cp -r "$SOURCE" "$DEST"
echo "✓ Skill instalada em $DEST"
echo "Abre o Claude Code e usa:  /scaffold-site <nome do negócio>"
