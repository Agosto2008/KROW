import { pool } from '../database/Conexion';
import { Empresa } from '../models/Empresa';
import { ResultSetHeader, RowDataPacket, Pool, PoolConnection } from 'mysql2/promise';

interface EmpresaRow extends Empresa, RowDataPacket {}
type DbClient = Pool | PoolConnection;

export class EmpresaRepository {

  //este metodo encuentra a todas las empresas listadas y devuelve un arreglo de ellas 
  async findAll(): Promise<EmpresaRow[]> {
    const [rows] = await pool.query<EmpresaRow[]>('SELECT * FROM Empresa ORDER BY fecha_registro DESC');
    return rows;
  }

  //Busca a una empresa por medio de su ID correspondiente 
  async findById(id: number): Promise<EmpresaRow | null> {
    const [rows] = await pool.query<EmpresaRow[]>('SELECT * FROM Empresa WHERE id_empresa = ?', [id]);
    return rows[0] ?? null;
  }

  //este metodo se encarga de buscar una empresa pero por el id de la cuenta 
  async findByCuentaId(cuentaId: number): Promise<EmpresaRow | null> {
    const [rows] = await pool.query<EmpresaRow[]>('SELECT * FROM Empresa WHERE cuenta_id = ?', [cuentaId]);
    return rows[0] ?? null;
  }

  //se encarga de crear el una empresa con su respectivo ID
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

  //se encarga de actualizar el estado de una empresa
  async update(id: number, data: Partial<Empresa>): Promise<void> {
    const campos = Object.keys(data);
    if (campos.length === 0) return;
    const setClause = campos.map((c) => `${c} = ?`).join(', ');
    const valores = campos.map((c) => (data as any)[c]);
    await pool.query(`UPDATE Empresa SET ${setClause} WHERE id_empresa = ?`, [...valores, id]);
  }
  //este metodo elimina a una empresa por medio de su ID 
  async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM Empresa WHERE id_empresa = ?', [id]);
  }
}

export const empresaRepository = new EmpresaRepository();