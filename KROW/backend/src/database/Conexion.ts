import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool(process.env.DATABASE_URL!);

export async function testConnection(): Promise<void> {
    try {
        await pool.query('SELECT 1');
        console.log('Conexión a MySQL establecida');
    } catch (error) {
        console.error('Error al conectar a MySQL:', error);
        process.exit(1);
    }
}