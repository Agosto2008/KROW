import dotenv from 'dotenv';
import type { SignOptions } from 'jsonwebtoken';

// Carga .env una sola vez y valida que existan las variables obligatorias.
// Si falta alguna, el servidor NO arranca (evita errores crypticos en runtime).
dotenv.config();

const REQUERIDAS = ['DATABASE_URL', 'JWT_SECRET'] as const;

const faltantes = REQUERIDAS.filter((nombre) => !process.env[nombre]);

if (faltantes.length > 0) {
    console.error(
        `Faltan variables de entorno en backend/.env: ${faltantes.join(', ')}. ` +
            'Copia .env.example como .env y rellenalas.'
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
