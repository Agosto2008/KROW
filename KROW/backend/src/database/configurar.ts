/**
 * Utilidad de base de datos: ejecuta los SQL del proyecto con solo pnpm
 * (sin CLI de MySQL ni Workbench), usando el DATABASE_URL de backend/.env.
 *
 *   pnpm db:setup  -> DB_KROW.sql (DROP + CREATE + tablas) + SEED_KROW.sql
 *   pnpm db:seed   -> solo SEED_KROW.sql (restaura los datos demo)
 */
import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';
import { env } from '../config/env';
 
const modo = process.argv[2];
 
if (modo !== 'setup' && modo !== 'seed') {
    console.error('Uso: pnpm db:setup   (crea la BD desde cero: BORRA datos)');
    console.error('     pnpm db:seed    (restaura los datos demo)');
    process.exit(1);
}
 
const archivos = modo === 'setup' ? ['DB_KROW.sql', 'SEED_KROW.sql'] : ['SEED_KROW.sql'];
 
async function main(): Promise<void> {
    const url = new URL(env.databaseUrl);
    const base = decodeURIComponent(url.pathname.replace(/^\//, ''));
 
    // db:setup va SIN database: DB_KROW.sql hace DROP DATABASE de la propia BD.
    // Ambos SQL traen su USE, y el SEED lo exige si se corre solo.
    const conexion = await mysql.createConnection({
        host: url.hostname,
        port: Number(url.port) || 3306,
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: modo === 'seed' && base ? base : undefined,
        multipleStatements: true,
    });
 
    for (const archivo of archivos) {
        const sql = fs.readFileSync(path.join(__dirname, archivo), 'utf8');
        console.log(`[db] ejecutando ${archivo}...`);
        await conexion.query(sql);
    }
 
    await conexion.end();
    console.log(
        modo === 'setup'
            ? '[db] listo: BD creada con tablas y datos demo.'
            : '[db] listo: datos demo restaurados.'
    );
}
 
main().catch((error: unknown) => {
    const mensaje = error instanceof Error ? error.message : String(error);
    console.error(`[db] ERROR: ${mensaje}`);
    if (mensaje.includes('Unknown database')) {
        console.error('[db] La base no existe: corre "pnpm db:setup" una vez.');
    }
    process.exit(1);
});