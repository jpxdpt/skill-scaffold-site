#!/usr/bin/env node
// Instala a skill scaffold-site para Claude Code E OpenCode, multiplataforma.
// Uso:  npx github:jpxdpt/skill-scaffold-site
//   ou (se publicado no npm):  npx scaffold-site-skill

const fs = require("fs");
const os = require("os");
const path = require("path");

const SKILL = "scaffold-site";
const home = os.homedir();
const source = path.join(__dirname, "..", "skills", SKILL);

// ~/.claude/skills serve o Claude Code E o OpenCode (que lê este path nativamente).
// ~/.config/opencode/skills é o local nativo do OpenCode — só instalamos lá se ele existir.
const targets = [
  { dest: path.join(home, ".claude", "skills", SKILL), always: true, label: "Claude Code (+ OpenCode via compat)" },
  { dest: path.join(home, ".config", "opencode", "skills", SKILL), needs: path.join(home, ".config", "opencode"), label: "OpenCode (nativo)" },
];

function install(dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const replacing = fs.existsSync(dest);
  if (replacing) {
    // Windows pode dar EPERM/EBUSY; toleramos e copiamos por cima na mesma.
    try {
      fs.rmSync(dest, { recursive: true, force: true, maxRetries: 5, retryDelay: 120 });
    } catch {
      /* ignorado: cpSync com force sobrepõe */
    }
  }
  fs.cpSync(source, dest, { recursive: true, force: true });
  return replacing;
}

function main() {
  if (!fs.existsSync(source)) {
    console.error(`✗ Não encontrei a skill em ${source}`);
    process.exit(1);
  }

  let installed = 0;
  for (const t of targets) {
    if (!t.always && !fs.existsSync(t.needs)) continue;
    const replacing = install(t.dest);
    console.log(`${replacing ? "↻ Atualizada" : "✓ Instalada"}  [${t.label}]  ${t.dest}`);
    installed++;
  }

  console.log(`\n${installed} local(is) instalado(s). Reinicia o agente.`);
  console.log("Claude Code:  /scaffold-site <nome do negócio>");
  console.log("OpenCode:     pede o scaffold ao agente (invoca a skill scaffold-site).");
}

main();
