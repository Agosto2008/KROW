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

  //solicitudes del usuario CON nombre de propuesta y empresa resueltos (1 query)
  async findByUsuarioConPropuesta(usuarioId: number): Promise<any[]> {
    const [rows] = await pool.query<any[]>(
      `SELECT s.*,
              p.nombre AS propuesta_nombre, p.tipo AS propuesta_tipo, p.modalidad AS propuesta_modalidad,
              p.ubicacion AS propuesta_ubicacion, p.estado AS propuesta_estado,
              JSON_OBJECT(
                'id_empresa', e.id_empresa, 'nombre', e.nombre, 'fotografia', e.fotografia,
                'verificada', e.verificada
              ) AS empresa
         FROM Solicitud s
         INNER JOIN Propuesta p ON p.id_propuesta = s.propuesta_id
         INNER JOIN Empresa e ON e.id_empresa = p.empresa_id
        WHERE s.usuario_id = ?
        ORDER BY s.fecha DESC`,
      [usuarioId]
    );
    for (const fila of rows) {
      if (fila.empresa) fila.empresa.verificada = Boolean(fila.empresa.verificada);
    }
    return rows;
  }

  //TODAS las solicitudes que recibieron las propuestas de una empresa,
  //con datos del candidato y de la propuesta (panel empresa en 1 query)
  async findByEmpresa(empresaId: number): Promise<any[]> {
    const [rows] = await pool.query<any[]>(
      `SELECT s.*, p.nombre AS propuesta_nombre, p.tipo AS propuesta_tipo,
              p.modalidad AS propuesta_modalidad, p.estado AS propuesta_estado,
              u.id_usuario, u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido,
              u.fotografia AS candidato_fotografia, u.descripcion_personal
         FROM Solicitud s
         INNER JOIN Propuesta p ON p.id_propuesta = s.propuesta_id
         INNER JOIN Empresa e ON e.id_empresa = p.empresa_id
         INNER JOIN Usuario u ON u.id_usuario = s.usuario_id
        WHERE e.id_empresa = ?
        ORDER BY s.fecha DESC`,
      [empresaId]
    );
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

  //existe al menos una solicitud de ESTE usuario hacia propuestas de ESTA empresa
  async existeSolicitudDeEmpresa(empresaId: number, usuarioId: number): Promise<boolean> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT s.id_solicitud
         FROM Solicitud s
         INNER JOIN Propuesta p ON p.id_propuesta = s.propuesta_id
        WHERE s.usuario_id = ? AND p.empresa_id = ?
        LIMIT 1`,
      [usuarioId, empresaId]
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

  //actualiza el estado de una solicitud
  //si comentarioEmpresa es undefined se conserva el comentario anterior
  //(antes se pisaba siempre con NULL y se perdia la observacion de la empresa)
  async updateEstado(id: number, estado: EstadoSolicitud, comentarioEmpresa?: string): Promise<void> {
    if (comentarioEmpresa === undefined) {
      await pool.query('UPDATE Solicitud SET estado = ? WHERE id_solicitud = ?', [estado, id]);
      return;
    }
    await pool.query(
      'UPDATE Solicitud SET estado = ?, comentario_empresa = ? WHERE id_solicitud = ?',
      [estado, comentarioEmpresa, id]
    );
  }
}

export const solicitudRepository = new SolicitudRepository();