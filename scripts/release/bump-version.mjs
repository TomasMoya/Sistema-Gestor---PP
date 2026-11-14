// Lee los commits de un push, decide si corresponde incrementar la versión
// (según el prefijo mayor:/feat:/fix: de mayor prioridad presente) y, si
// corresponde, actualiza package.json y antepone una entrada a versions.md.
//
// Entrada: variable de entorno COMMITS_JSON con el array de commits del push
// (github.event.commits en el workflow).
// Salida: si hubo incremento, escribe el archivo .version-bumped con el
// texto "vX.Y.Z" para que el workflow sepa que debe commitear y pushear.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const PACKAGE_JSON_PATH = join(ROOT, "package.json");
const VERSIONS_MD_PATH = join(ROOT, "versions.md");

const PRIORIDAD = { mayor: 3, feat: 2, fix: 1 };
const INCREMENTO_LABEL = { mayor: "mayor", feat: "menor", fix: "parche" };
const SECCION_LABEL = {
  mayor: "Cambios mayores",
  feat: "Nuevas funcionalidades",
  fix: "Correcciones",
};

function leerCommits() {
  const raw = process.env.COMMITS_JSON;
  if (!raw) {
    throw new Error("Falta la variable de entorno COMMITS_JSON");
  }
  const commits = JSON.parse(raw);
  if (!Array.isArray(commits)) {
    throw new Error("COMMITS_JSON no es un array");
  }
  return commits;
}

function clasificarCommits(commits) {
  const buckets = { mayor: [], feat: [], fix: [] };

  for (const commit of commits) {
    const primeraLinea = (commit.message ?? "").split("\n")[0].trim();
    const match = primeraLinea.match(/^(mayor|feat|fix)\s*:/i);
    if (!match) continue;

    const tipo = match[1].toLowerCase();
    const sha = (commit.id ?? "").slice(0, 7);
    buckets[tipo].push({ sha, message: primeraLinea });
  }

  return buckets;
}

function tipoDeMayorPrioridad(buckets) {
  let mejor = null;
  for (const tipo of Object.keys(buckets)) {
    if (buckets[tipo].length === 0) continue;
    if (!mejor || PRIORIDAD[tipo] > PRIORIDAD[mejor]) mejor = tipo;
  }
  return mejor;
}

function incrementarVersion(versionActual, tipo) {
  const [mayor, menor, parche] = versionActual.split(".").map(Number);

  if (tipo === "mayor") return `${mayor + 1}.0.0`;
  if (tipo === "feat") return `${mayor}.${menor + 1}.0`;
  return `${mayor}.${menor}.${parche + 1}`;
}

function actualizarPackageJson(nuevaVersion) {
  const contenido = readFileSync(PACKAGE_JSON_PATH, "utf8");
  const actualizado = contenido.replace(/"version":\s*"[^"]+"/, `"version": "${nuevaVersion}"`);
  writeFileSync(PACKAGE_JSON_PATH, actualizado);
}

function construirEntrada(versionAnterior, nuevaVersion, tipo, buckets) {
  const fecha = new Date().toISOString().slice(0, 10);
  const totalCommits = buckets.mayor.length + buckets.feat.length + buckets.fix.length;

  const secciones = ["mayor", "feat", "fix"]
    .filter((t) => buckets[t].length > 0)
    .map((t) => {
      const items = buckets[t].map((c) => `- \`${c.sha}\` ${c.message}`).join("\n");
      return `**${SECCION_LABEL[t]}**\n\n${items}`;
    })
    .join("\n\n");

  return [
    `### ${nuevaVersion}`,
    "",
    `${versionAnterior} → ${nuevaVersion} · Incremento ${INCREMENTO_LABEL[tipo]} · ${totalCommits} commits · ${fecha}`,
    "",
    secciones,
    "",
    "---",
    "",
  ].join("\n");
}

function insertarEntradaEnVersionsMd(entrada) {
  const contenido = readFileSync(VERSIONS_MD_PATH, "utf8");
  const marcador = "## Versiones publicadas\n";
  const indice = contenido.indexOf(marcador);

  if (indice === -1) {
    throw new Error('No se encontró el encabezado "## Versiones publicadas" en versions.md');
  }

  const puntoInsercion = indice + marcador.length;
  const actualizado = contenido.slice(0, puntoInsercion) + "\n" + entrada + "\n" + contenido.slice(puntoInsercion);
  writeFileSync(VERSIONS_MD_PATH, actualizado);
}

function main() {
  const commits = leerCommits();
  const buckets = clasificarCommits(commits);
  const tipo = tipoDeMayorPrioridad(buckets);

  if (!tipo) {
    console.log("Ningún commit de este push usa mayor:/feat:/fix: — no se incrementa la versión.");
    return;
  }

  const { version: versionActual } = JSON.parse(readFileSync(PACKAGE_JSON_PATH, "utf8"));
  const nuevaVersion = incrementarVersion(versionActual, tipo);

  actualizarPackageJson(nuevaVersion);
  insertarEntradaEnVersionsMd(construirEntrada(versionActual, nuevaVersion, tipo, buckets));
  writeFileSync(join(ROOT, ".version-bumped"), `v${nuevaVersion}`);

  console.log(`Versión incrementada: ${versionActual} → ${nuevaVersion} (${tipo})`);
}

main();
