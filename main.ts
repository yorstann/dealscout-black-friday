// DealScout — a Black Friday deal finder, handed in for
// black-friday-deal-finder-01 (Node 22, standard library only). The site lives
// in this directory's app/ folder: plain static files a browser opens at
// app/index.html, its forty deals baked into its own files, nothing it runs,
// styles or shows loaded over the network. Each deal links out to its store.
//
// The program hands the site in: it clears the output directory's contents
// (never the directory itself — in the grader /output is a mount, and deleting
// it throws EBUSY), copies app/ and screenshots/ beside this file to /output,
// and writes /output/dossier.json with the vendored make.fun library, which
// the scorer rebuilds byte for byte. Leave vendor/makefun-frontend.ts alone.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

function clearContents(dir) {
  mkdirSync(dir, { recursive: true });
  for (const name of readdirSync(dir)) {
    rmSync(join(dir, name), { recursive: true, force: true });
  }
}

function requireDir(path, label) {
  if (!existsSync(path)) throw new Error(`missing ${label}: ${path}`);
}

function countFiles(dir) {
  let total = 0;
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    total += name.isDirectory() ? countFiles(join(dir, name)) : 1;
  }
  return total;
}

requireDir(join(repoRoot, "app"), "app/");
requireDir(join(repoRoot, "screenshots"), "screenshots/");

clearContents(outDir);
cpSync(join(repoRoot, "app"), join(outDir, "app"), { recursive: true });
cpSync(join(repoRoot, "screenshots"), join(outDir, "screenshots"), { recursive: true });

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outDir, "dossier.json"), dossier);

const appFiles = countFiles(join(outDir, "app"));
const shotFiles = readdirSync(join(outDir, "screenshots")).length;
console.log(`DealScout handed in to ${outDir}: ${appFiles} app files, ${shotFiles} screenshots, dossier ${dossier.length} bytes`);
