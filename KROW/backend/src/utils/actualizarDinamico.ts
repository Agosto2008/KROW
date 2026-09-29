import { pool, } from '../database/Conexion';
import { Pool, PoolConnection } from 'mysql2/promise';

type DbClient = Pool | PoolConnection;

/**
 * Construye un UPDATE dinamico SEGURO.
 *
 * - `permitidas` es la whitelist de columnas: cualquier clave del body que no
 *   este en la lista se ignora (esto bloquea ataques como enviar
 *   {"verificada": true} o {"empresa_id": 999} en un PUT).
 * - Solo se interpolan nombres de columna YA validados contra la whitelist;
 *   los valores van siempre parametrizados con `?`.
 *
 * Devuelve el numero de campos realmente actualizados (0 si el body no
 * contenia nada valido).
 */
export async function actualizarDinamico(
    tabla: string,
    columnaId: string,
    id: number,
    data: Record<string, unknown>,
    permitidas: readonly string[],
    connection: DbClient = pool
): Promise<number> {
    const campos = Object.keys(data).filter(
        (c) => permitidas.includes(c) && data[c] !== undefined
    );
    if (campos.length === 0) return 0;

    const setClause = campos.map((c) => `${c} = ?`).join(', ');
    const valores = campos.map((c) => data[c]);
    await connection.query(`UPDATE ${tabla} SET ${setClause} WHERE ${columnaId} = ?`, [
        ...valores,
        id,
    ]);
    return campos.length;
}
