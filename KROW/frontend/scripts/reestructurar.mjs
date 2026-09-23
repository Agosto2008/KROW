/**
 * Reestructura el frontend a core/ + shared/ + layout/ + features/ y reescribe
 * TODOS los imports relativos afectados por la mudanza.
 *
 * Uso: node scripts/reestructurar.mjs   (desde frontend/)
 */
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = process.cwd();
const APP = path.join(RAIZ, 'src', 'app');

/** Devuelve la ruta NUEVA (relativa a src/app) para una ruta VIEJA (relativa a src/app). */
function nuevaRuta(vieja) {
  const reglas = [
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
  for (const [viejo, nuevo] of reglas) {
    if (vieja.startsWith(viejo)) return nuevo + vieja.slice(viejo.length);
  }
  return vieja; // core/ y archivos raiz no se mueven
}

/** Lista todos los archivos bajo src/app. */
function listar(dir, salida = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) listar(p, salida);
    else salida.push(p);
  }
  return salida;
}

const todos = listar(APP);

// mapa: ruta vieja ABSOLUTA -> ruta nueva ABSOLUTA
const mapa = new Map();
for (const abs of todos) {
  const rel = path.relative(APP, abs).split(path.sep).join('/');
  const nuevoRel = nuevaRuta(rel);
  mapa.set(abs, path.join(APP, ...nuevoRel.split('/')));
}

// 1) Mover directorios vaciando los viejos (mismo contenido, sin duplicados)
const moverDe = new Set();
for (const [vieja, nueva] of mapa) {
  if (vieja !== nueva) moverDe.add(path.dirname(vieja));
}
for (const [vieja, nueva] of mapa) {
  if (vieja === nueva) continue;
  fs.mkdirSync(path.dirname(nueva), { recursive: true });
  fs.renameSync(vieja, nueva);
}
for (const d of moverDe) {
  // borra los directorios viejos que quedaron vacios (hojas primero)
  let actual = d;
  while (actual.startsWith(APP) && actual !== APP) {
    try {
      if (fs.readdirSync(actual).length === 0) {
        fs.rmdirSync(actual);
        actual = path.dirname(actual);
        continue;
      }
    } catch { /* ya no existe */ }
    break;
  }
}

// 2) Reescribir imports relativos en todos los .ts (y app.routes.ts ya esta incluido)
const RE = /(from\s+|import\s*\(\s*|export\s+\*\s+from\s+)(['"])(\.\.?\/[^'"]+)\2/g;
let reescritos = 0;

for (const abs of listar(APP)) {
  if (!abs.endsWith('.ts')) continue;
  const viejoAbs = [...mapa.entries()].find(([, n]) => n === abs)?.[0] ?? abs;
  const texto = fs.readFileSync(abs, 'utf8');
  const dirVieja = path.dirname(viejoAbs);
  const dirNueva = path.dirname(abs);

  const salida = texto.replace(RE, (m, pref, comilla, spec) => {
    // resuelve el destino VIEJO absoluto
    const destinoViejoAbs = path.resolve(dirVieja, spec);
    // ¿existe el mapa para ese destino? si no, no se movio (dejar igual)
    let destinoNuevoAbs = mapa.get(destinoViejoAbs);
    if (!destinoNuevoAbs) {
      // puede ser un import a un archivo que no esta en src/app (raro) o ya movido
      destinoNuevoAbs = destinoViejoAbs;
    }
    let rel = path.relative(dirNueva, destinoNuevoAbs).split(path.sep).join('/');
    if (!rel.startsWith('.')) rel = './' + rel;
    if (rel === spec) return m;
    reescritos++;
    return `${pref}${comilla}${rel}${comilla}`;
  });

  if (salida !== texto) fs.writeFileSync(abs, salida, 'utf8');
}

console.log(`Movidos: ${[...mapa.values()].filter((v, i) => v !== [...mapa.keys()][i]).length} archivos`);
console.log(`Imports reescritos: ${reescritos}`);
