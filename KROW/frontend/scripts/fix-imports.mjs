/**
 * Repara los imports relativos tras la reestructuracion.
 *
 * Logica: para cada import relativo de un .ts,
 *   1) se resuelve contra el disco (probando .ts e /index.ts).
 *   2) si EXISTE -> el import ya esta bien, se deja igual.
 *   3) si NO existe -> apunta al arbol viejo; se le aplican las reglas de
 *      mudanza (prefijo viejo -> prefijo nuevo) y se reexpresa relativo
 *      al archivo actual.
 *
 * Uso: node scripts/fix-imports.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = process.cwd();
const APP = path.join(RAIZ, 'src', 'app');

// prefijo VIEJO -> prefijo NUEVO (relativo a src/app)
const REGLAS = [
  ['shader/navbar/', 'layout/navbar/'],
  ['footer/', 'layout/footer/'],
  ['shader/', 'shared/'],
  ['services/', 'core/api/'],
  ['models/', 'core/models/'],
  ['config/', 'core/config/'],
  ['pages/landing/', 'features/public/landing/'],
  ['pages/login/', 'features/public/login/'],
  ['pages/registro-usuario/', 'features/public/registro-usuario/'],
  ['pages/registro-empresa/', 'features/public/registro-empresa/'],
  ['pages/explorar/', 'features/public/explorar/'],
  ['pages/propuesta-detalle/', 'features/public/propuesta-detalle/'],
  ['pages/usuario/', 'features/usuario/'],
  ['pages/empresa/', 'features/empresa/'],
  ['pages/admin/', 'features/admin/'],
];

function migrarRel(relViejo) {
  for (const [viejo, nuevo] of REGLAS) {
    if (relViejo.startsWith(viejo)) return nuevo + relViejo.slice(viejo.length);
  }
  return null;
}

/** ¿Existe este modulo en disco (sin extensión en el spec)? */
function existe(abs) {
  return (
    fs.existsSync(abs) ||
    fs.existsSync(abs + '.ts') ||
    fs.existsSync(path.join(abs, 'index.ts'))
  );
}

function listar(dir, salida = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) listar(p, salida);
    else if (p.endsWith('.ts')) salida.push(p);
  }
  return salida;
}

const RE =
  /(from\s+|import\s*\(\s*|export\s+\*\s+from\s+)(['"])(\.\.?\/[^'"]+)\2/g;

let reparados = 0;
const fallos = [];

for (const abs of listar(APP)) {
  const dir = path.dirname(abs);
  const texto = fs.readFileSync(abs, 'utf8');

  const salida = texto.replace(RE, (m, pref, comilla, spec) => {
    const resuelto = path.resolve(dir, spec);
    if (existe(resuelto)) return m; // ya esta bien

    // apunta al arbol viejo: aplicar reglas de mudanza
    const relViejo = path.relative(APP, resuelto).split(path.sep).join('/');
    const relNuevo = migrarRel(relViejo);
    if (!relNuevo) {
      fallos.push(`${path.relative(RAIZ, abs)} :: ${spec}`);
      return m;
    }
    const destino = path.join(APP, ...relNuevo.split('/'));
    if (!existe(destino)) {
      fallos.push(`${path.relative(RAIZ, abs)} :: ${spec} (destino nuevo no existe: ${relNuevo})`);
      return m;
    }
    let rel = path.relative(dir, destino).split(path.sep).join('/');
    if (!rel.startsWith('.')) rel = './' + rel;
    reparados++;
    return `${pref}${comilla}${rel}${comilla}`;
  });

  if (salida !== texto) fs.writeFileSync(abs, salida, 'utf8');
}

console.log(`Imports reparados: ${reparados}`);
if (fallos.length) {
  console.log(`SIN RESOLVER (${fallos.length}):`);
  for (const f of fallos) console.log('  ' + f);
  process.exitCode = 1;
}
