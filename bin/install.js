#!/usr/bin/env node
// Instala a skill scaffold-site no Claude Code, multiplataforma (Windows/macOS/Linux).
// Uso:  npx github:jpxdpt/skill-scaffold-site
//   ou (se publicado no npm):  npx scaffold-site-skill

const fs = require("fs");
const os = require("os");
const path = require("path");

const SKILL = "scaffold-site";
const source = path.join(__dirname, "..", "skills", SKILL);
const skillsDir = path.join(os.homedir(), ".claude", "skills");
const dest = path.join(skillsDir, SKILL);

function main() {
  if (!fs.existsSync(source)) {
    console.error(`✗ Não encontrei a skill em ${source}`);
    process.exit(1);
  }

  fs.mkdirSync(skillsDir, { recursive: true });

  const replacing = fs.existsSync(dest);
  if (replacing) {
    // Windows pode dar EPERM/EBUSY (ficheiro bloqueado/read-only) — tenta limpar,
    // mas se falhar seguimos com a cópia por cima (force) na mesma.
    try {
      fs.rmSync(dest, { recursive: true, force: true, maxRetries: 5, retryDelay: 120 });
    } catch {
      /* tolerado: a cópia abaixo sobrepõe os ficheiros existentes */
    }
  }

  fs.cpSync(source, dest, { recursive: true, force: true });

  console.log(`${replacing ? "↻ Atualizada" : "✓ Instalada"}: ${dest}`);
  console.log("Reinicia o Claude Code e usa:  /scaffold-site <nome do negócio>");
}

main();
