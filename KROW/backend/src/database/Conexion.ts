import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Pool de conexiones: reutiliza conexiones existentes para evitar
// abrir y cerrar una conexión nueva en cada consulta.
// La configuración se obtiene desde DATABASE_URL del archivo .env.
export const pool = mysql.createPool(process.env.DATABASE_URL!);

export async function testConnection(): Promise<void> {
    try {
        // Ejecuta una consulta sencilla para comprobar que la conexión funciona.
        await pool.query('SELECT 1');
        console.log('Conexión a MySQL establecida');
    } catch (error) {
        console.error('Error al conectar a MySQL:', error);
        process.exit(1);
    }
}
