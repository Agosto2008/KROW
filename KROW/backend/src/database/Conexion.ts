import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Pool de conexiones: reutiliza conexiones en vez de abrir una nueva por cada query
export const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'krow_db_in5bm',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export async function testConnection(): Promise<void> {
    try {
        const conn = await pool.getConnection();
        console.log('Conexión a MySQL establecida');
        conn.release();
    } catch (error) {
        console.error('Error al conectar a MySQL:', error);
        process.exit(1);
    }
}