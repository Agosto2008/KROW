import { pool } from '../database/Conexion';
import { Empresa } from '../models/Empresa';
import { ResultSetHeader, RowDataPacket, Pool, PoolConnection } from 'mysql2/promise';

interface EmpresaRow extends Empresa, RowDataPacket {}
type DbClient = Pool | PoolConnection;

export class EmpresaRepository {
  async findAll(): Promise<EmpresaRow[]> {
    const [rows] = await pool.query<EmpresaRow[]>('SELECT * FROM Empresa ORDER BY fecha_registro DESC');
    return rows;
  }

  async findById(id: number): Promise<EmpresaRow | null> {
    const [rows] = await pool.query<EmpresaRow[]>('SELECT * FROM Empresa WHERE id_empresa = ?', [id]);
    return rows[0] ?? null;
  }

  async findByCuentaId(cuentaId: number): Promise<EmpresaRow | null> {
    const [rows] = await pool.query<EmpresaRow[]>('SELECT * FROM Empresa WHERE cuenta_id = ?', [cuentaId]);
    return rows[0] ?? null;
  }

  async create(
    data: Pick<Empresa, 'cuenta_id' | 'nombre'> & Partial<Empresa>,
    connection: DbClient = pool
  ): Promise<number> {
    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO Empresa (cuenta_id, nombre, descripcion, propuesta_empresa, telefono, ubicacion)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.cuenta_id, data.nombre, data.descripcion ?? null, data.propuesta_empresa ?? null,
       data.telefono ?? null, data.ubicacion ?? null]
    );
    return result.insertId;
  }

  async update(id: number, data: Partial<Empresa>): Promise<void> {
    const campos = Object.keys(data);
    if (campos.length === 0) return;
    const setClause = campos.map((c) => `${c} = ?`).join(', ');
    const valores = campos.map((c) => (data as any)[c]);
    await pool.query(`UPDATE Empresa SET ${setClause} WHERE id_empresa = ?`, [...valores, id]);
  }

  async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM Empresa WHERE id_empresa = ?', [id]);
  }
}

export const empresaRepository = new EmpresaRepository();