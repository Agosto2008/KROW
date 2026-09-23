import { pool } from '../database/Conexion';
import { Propuesta } from '../models/Propuesta';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

interface PropuestaRow extends Propuesta, RowDataPacket {}

interface FiltrosPropuesta {
  tipo?: string;
  modalidad?: string;
  estado?: string;
  empresa_id?: number;
}

export class PropuestaRepository {

  //busca todas las propuestas y permite asignar filtros especificos sobre los mismos 
  async findAll(filtros: FiltrosPropuesta = {}): Promise<PropuestaRow[]> {
    let sql = 'SELECT * FROM Propuesta WHERE 1=1';
    const params: any[] = [];
    if (filtros.tipo) { sql += ' AND tipo = ?'; params.push(filtros.tipo); }
    if (filtros.modalidad) { sql += ' AND modalidad = ?'; params.push(filtros.modalidad); }
    if (filtros.estado) { sql += ' AND estado = ?'; params.push(filtros.estado); }
    if (filtros.empresa_id) { sql += ' AND empresa_id = ?'; params.push(filtros.empresa_id); }
    sql += ' ORDER BY fecha_publicacion DESC';

    const [rows] = await pool.query<PropuestaRow[]>(sql, params);
    return rows;
  }

  //busca una propuesta con filtros por medio de su ID 
  async findById(id: number): Promise<PropuestaRow | null> {
    const [rows] = await pool.query<PropuestaRow[]>('SELECT * FROM Propuesta WHERE id_propuesta = ?', [id]);
    return rows[0] ?? null;
  }

  //crea una propuesta pero elimina ciertas asignaciones de manera opcional 
  async create(data: Omit<Propuesta, 'id_propuesta' | 'fecha_publicacion' | 'estado'>): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO Propuesta (empresa_id, nombre, descripcion, tipo, modalidad, pago, ubicacion, vacantes, fecha_vencimiento)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.empresa_id, data.nombre, data.descripcion, data.tipo, data.modalidad,
       data.pago ?? null, data.ubicacion ?? null, data.vacantes, data.fecha_vencimiento ?? null]
    );
    return result.insertId;
  }

  //permite actualizar campos de manera parcial 
  async update(id: number, data: Partial<Propuesta>): Promise<void> {
    const campos = Object.keys(data);
    if (campos.length === 0) return;
    const setClause = campos.map((c) => `${c} = ?`).join(', ');
    const valores = campos.map((c) => (data as any)[c]);
    await pool.query(`UPDATE Propuesta SET ${setClause} WHERE id_propuesta = ?`, [...valores, id]);
  }

  //borra las propuestas independiente a si tienen filtro asignado o no 
  async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM Propuesta WHERE id_propuesta = ?', [id]);
  }
}

export const propuestaRepository = new PropuestaRepository();