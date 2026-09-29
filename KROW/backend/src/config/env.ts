import crypto from 'node:crypto';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import type { SignOptions } from 'jsonwebtoken';
 
// Portabilidad: .env esta en .gitignore y el repo NO trae plantilla. Si al
// arrancar no existe (maquina recien clonada), se genera uno con valores de
// desarrollo, asi `pnpm dev` funciona en cualquier parte sin pasos manuales.
const rutaEnv = path.join(process.cwd(), '.env');
if (!fs.existsSync(rutaEnv)) {
    const secreto = crypto.randomBytes(48).toString('hex');
    fs.writeFileSync(
        rutaEnv,
        [
            '# Generado automaticamente al primer arranque (esta en .gitignore).',
            '# En otra maquina solo hay que editar la password de MySQL.',
            '',
            '# Formato: mysql://usuario:password@host:puerto/nombre_bd',
            'DATABASE_URL=mysql://root@localhost:3306/krow_db_in5bm',
            '',
            'PORT=3000',
            'CORS_ORIGIN=http://localhost:4200',
            '',
            '# Clave aleatoria generada en este equipo (cambiar en produccion).',
            `JWT_SECRET=${secreto}`,
            'JWT_EXPIRES_IN=1h',
            '',
        ].join('\n'),
        'utf8'
    );
    console.warn('[env] Se creo backend/.env con valores por defecto. Revisa DATABASE_URL (password de MySQL).');
}
 
// Carga .env una sola vez y valida que existan las variables obligatorias.
// Si falta alguna, el servidor NO arranca (evita errores crypticos en runtime).
dotenv.config();
 
const REQUERIDAS = ['DATABASE_URL', 'JWT_SECRET'] as const;
 
const faltantes = REQUERIDAS.filter((nombre) => !process.env[nombre]);
 
if (faltantes.length > 0) {
    console.error(
        `Faltan variables de entorno en backend/.env: ${faltantes.join(', ')}. ` +
            'Edita backend/.env (se crea solo al primer arranque).'
    );
    process.exit(1);
}
 
export const env = {
    puerto: Number(process.env.PORT) || 3000,
    corsOrigen: process.env.CORS_ORIGIN || 'http://localhost:4200',
    databaseUrl: process.env.DATABASE_URL as string,
    jwtSecret: process.env.JWT_SECRET as string,
    jwtExpiraEn: (process.env.JWT_EXPIRES_IN || '1h') as SignOptions['expiresIn'],
};
 