import { pool } from '../database/Conexion';
import { Solicitud, EstadoSolicitud } from '../models/Solicitud';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

interface SolicitudRow extends Solicitud, RowDataPacket {}

export class SolicitudRepository {

  //encuentra una solicitud por medio del id del usuario 
  async findByUsuario(usuarioId: number): Promise<SolicitudRow[]> {
    const [rows] = await pool.query<SolicitudRow[]>('SELECT * FROM Solicitud WHERE usuario_id = ? ORDER BY fecha DESC', [usuarioId]);
    return rows;
  }

  //busca  y encuentra una solicitud por medio de la fecha y descripcion de una propuesta, mediante el id de la misma 
  async findByPropuesta(propuestaId: number): Promise<SolicitudRow[]> {
    const [rows] = await pool.query<SolicitudRow[]>('SELECT * FROM Solicitud WHERE propuesta_id = ? ORDER BY fecha DESC', [propuestaId]);
    return rows;
  }

  //encuentra unicamente una solicitud por medio de su id unicamente 
  async findById(id: number): Promise<SolicitudRow | null> {
    const [rows] = await pool.query<SolicitudRow[]>('SELECT * FROM Solicitud WHERE id_solicitud = ?', [id]);
    return rows[0] ?? null;
  }

  // El UNIQUE(usuario_id, propuesta_id) en la tabla evita duplicados a nivel de BD;
  // aquí lo validamos antes para poder dar un mensaje de error claro
  //se muestra si la solicitud ya existe haciendo una comparacion general 
  async yaExiste(usuarioId: number, propuestaId: number): Promise<boolean> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id_solicitud FROM Solicitud WHERE usuario_id = ? AND propuesta_id = ?',
      [usuarioId, propuestaId]
    );
    return rows.length > 0;
  }

  //crea una solicitud por medio de una propuesta existente 
  async create(usuarioId: number, propuestaId: number): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO Solicitud (usuario_id, propuesta_id) VALUES (?, ?)',
      [usuarioId, propuestaId]
    );
    return result.insertId;
  }

  //actualiza el estado de una solicitud genera 
  async updateEstado(id: number, estado: EstadoSolicitud, comentarioEmpresa?: string): Promise<void> {
    await pool.query(
      'UPDATE Solicitud SET estado = ?, comentario_empresa = ? WHERE id_solicitud = ?',
      [estado, comentarioEmpresa ?? null, id]
    );
  }
}

export const solicitudRepository = new SolicitudRepository();