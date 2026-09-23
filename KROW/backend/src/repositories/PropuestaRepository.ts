import { pool } from '../database/Conexion';
import { Propuesta } from '../models/Propuesta';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { actualizarDinamico } from '../utils/actualizarDinamico';

interface PropuestaRow extends Propuesta, RowDataPacket {}

// PROHIBIDO: empresa_id (robarse/ofertar propuestas ajenas), fecha_publicacion,
// id_propuesta.
const COLUMNAS_EDITABLES = [
  'nombre', 'descripcion', 'tipo', 'modalidad', 'pago', 'ubicacion',
  'vacantes', 'fecha_vencimiento', 'estado',
] as const;

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

  //propuesta + ficha de empresa en UNA sola query (para el detalle: antes eran
  //2 peticiones y el front tenia que hacer join a mano)
  async findByIdConEmpresa(id: number): Promise<(PropuestaRow & { empresa: any }) | null> {
    const [rows] = await pool.query<any[]>(
      `SELECT p.*, JSON_OBJECT(
              'id_empresa', e.id_empresa,
              'nombre', e.nombre,
              'descripcion', e.descripcion,
              'propuesta_empresa', e.propuesta_empresa,
              'fotografia', e.fotografia,
              'telefono', e.telefono,
              'ubicacion', e.ubicacion,
              'verificada', e.verificada
           ) AS empresa
         FROM Propuesta p
         INNER JOIN Empresa e ON e.id_empresa = p.empresa_id
        WHERE p.id_propuesta = ?`,
      [id]
    );
    if (!rows[0]) return null;
    // JSON_OBJECT devuelve boolean como 0/1: se normaliza a true/false
    if (rows[0].empresa) rows[0].empresa.verificada = Boolean(rows[0].empresa.verificada);
    return rows[0];
  }

  //listado con busqueda de texto + paginacion en el SERVIDOR
  //(antes el front cargaba todo y filtraba en cliente)
  async buscar(filtros: FiltrosPropuesta & { buscar?: string; pagina?: number; porPagina?: number }) {
    const porPagina = Math.min(Math.max(filtros.porPagina ?? 12, 1), 50);
    const pagina = Math.max(filtros.pagina ?? 1, 1);
    const desplazamiento = (pagina - 1) * porPagina;

    let sql = `
      SELECT p.*, JSON_OBJECT(
              'id_empresa', e.id_empresa, 'nombre', e.nombre, 'fotografia', e.fotografia,
              'ubicacion', e.ubicacion, 'verificada', e.verificada
           ) AS empresa
        FROM Propuesta p
        INNER JOIN Empresa e ON e.id_empresa = p.empresa_id
       WHERE 1=1`;
    const params: any[] = [];

    if (filtros.tipo) { sql += ' AND p.tipo = ?'; params.push(filtros.tipo); }
    if (filtros.modalidad) { sql += ' AND p.modalidad = ?'; params.push(filtros.modalidad); }
    if (filtros.estado) { sql += ' AND p.estado = ?'; params.push(filtros.estado); }
    if (filtros.empresa_id) { sql += ' AND p.empresa_id = ?'; params.push(filtros.empresa_id); }
    if (filtros.buscar) {
      sql += ' AND (p.nombre LIKE ? OR p.descripcion LIKE ? OR p.ubicacion LIKE ?)';
      const like = `%${filtros.buscar}%`;
      params.push(like, like, like);
    }

    const [conteo] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM (${sql}) AS conteo`,
      params
    );

    sql += ' ORDER BY p.fecha_publicacion DESC LIMIT ? OFFSET ?';
    params.push(porPagina, desplazamiento);

    const [rows] = await pool.query<any[]>(sql, params);
    for (const fila of rows) {
      if (fila.empresa) fila.empresa.verificada = Boolean(fila.empresa.verificada);
    }

    return { datos: rows, total: conteo[0].total, pagina, porPagina };
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

  //permite actualizar campos de manera parcial (solo columnas de la whitelist)
  async update(id: number, data: Partial<Propuesta>): Promise<void> {
    await actualizarDinamico('Propuesta', 'id_propuesta', id, data, COLUMNAS_EDITABLES);
  }

  //borra las propuestas independiente a si tienen filtro asignado o no 
  async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM Propuesta WHERE id_propuesta = ?', [id]);
  }
}

export const propuestaRepository = new PropuestaRepository();