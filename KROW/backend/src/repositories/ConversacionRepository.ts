import { pool } from '../database/Conexion';
import { Conversacion } from '../models/Conversacion';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

interface ConversacionRow extends Conversacion, RowDataPacket {}

export class ConversacionRepository {
  //Este metodo busca una conversacion relacionada con una solicitud
  async findBySolicitud(solicitudId: number): Promise<ConversacionRow | null> {
    const [rows] = await pool.query<ConversacionRow[]>('SELECT * FROM Conversacion WHERE solicitud_id = ?', [solicitudId]);
    return rows[0] ?? null;
  }

  //busca especificamente una conversacion por medio de id 
  async findById(id: number): Promise<ConversacionRow | null> {
    const [rows] = await pool.query<ConversacionRow[]>('SELECT * FROM Conversacion WHERE id_conversacion = ?', [id]);
    return rows[0] ?? null;
  }

  //recibe el id de la solicitud anterior y devuelve un id de la conversacion en curso
  async create(solicitudId: number): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO Conversacion (solicitud_id) VALUES (?)',
      [solicitudId]
    );
    return result.insertId;
  }

  //este metodo se encarga de cerrar una conversacion en curso 
  async cerrar(id: number): Promise<void> {
    await pool.query('UPDATE Conversacion SET activa = FALSE WHERE id_conversacion = ?', [id]);
  }

  //SIDEBAR DE CHATS de un usuario: sus conversaciones con la empresa, la
  //propuesta, el ultimo mensaje y los no leidos, TODO en una sola query
  async findByUsuario(usuarioId: number): Promise<any[]> {
    const [rows] = await pool.query<any[]>(
      `SELECT c.id_conversacion, c.activa, c.fecha_creacion, c.solicitud_id,
              s.estado AS solicitud_estado, p.id_propuesta, p.nombre AS propuesta_nombre,
              JSON_OBJECT(
                'id_empresa', e.id_empresa, 'nombre', e.nombre, 'fotografia', e.fotografia,
                'verificada', e.verificada
              ) AS empresa,
              (SELECT contenido FROM Mensaje m WHERE m.conversacion_id = c.id_conversacion
                ORDER BY m.fecha_envio DESC LIMIT 1) AS ultimo_mensaje,
              (SELECT MAX(fecha_envio) FROM Mensaje m WHERE m.conversacion_id = c.id_conversacion) AS ultimo_fecha,
              (SELECT COUNT(*) FROM Mensaje m WHERE m.conversacion_id = c.id_conversacion
                AND m.leido = FALSE AND m.emisor = 'EMPRESA') AS no_leidos
         FROM Conversacion c
         INNER JOIN Solicitud s ON s.id_solicitud = c.solicitud_id
         INNER JOIN Propuesta p ON p.id_propuesta = s.propuesta_id
         INNER JOIN Empresa e ON e.id_empresa = p.empresa_id
        WHERE s.usuario_id = ?
        ORDER BY COALESCE(ultimo_fecha, c.fecha_creacion) DESC`,
      [usuarioId]
    );
    for (const fila of rows) if (fila.empresa) fila.empresa.verificada = Boolean(fila.empresa.verificada);
    return rows;
  }

  //SIDEBAR DE CHATS de una empresa: sus conversaciones con el candidato
  async findByEmpresa(empresaId: number): Promise<any[]> {
    const [rows] = await pool.query<any[]>(
      `SELECT c.id_conversacion, c.activa, c.fecha_creacion, c.solicitud_id,
              s.estado AS solicitud_estado, p.id_propuesta, p.nombre AS propuesta_nombre,
              JSON_OBJECT(
                'id_usuario', u.id_usuario, 'nombre',
                CONCAT(u.primer_nombre, ' ', u.primer_apellido),
                'fotografia', u.fotografia
              ) AS candidato,
              (SELECT contenido FROM Mensaje m WHERE m.conversacion_id = c.id_conversacion
                ORDER BY m.fecha_envio DESC LIMIT 1) AS ultimo_mensaje,
              (SELECT MAX(fecha_envio) FROM Mensaje m WHERE m.conversacion_id = c.id_conversacion) AS ultimo_fecha,
              (SELECT COUNT(*) FROM Mensaje m WHERE m.conversacion_id = c.id_conversacion
                AND m.leido = FALSE AND m.emisor = 'USUARIO') AS no_leidos
         FROM Conversacion c
         INNER JOIN Solicitud s ON s.id_solicitud = c.solicitud_id
         INNER JOIN Propuesta p ON p.id_propuesta = s.propuesta_id
         INNER JOIN Empresa e ON e.id_empresa = p.empresa_id
         INNER JOIN Usuario u ON u.id_usuario = s.usuario_id
        WHERE e.id_empresa = ?
        ORDER BY COALESCE(ultimo_fecha, c.fecha_creacion) DESC`,
      [empresaId]
    );
    return rows;
  }
}

export const conversacionRepository = new ConversacionRepository();