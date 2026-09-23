import { pool } from '../database/Conexion';
import { Entrevista, EstadoEntrevista } from '../models/Entrevista';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { actualizarDinamico } from '../utils/actualizarDinamico';

interface EntrevistaRow extends Entrevista, RowDataPacket {}

// PROHIBIDO: solicitud_id (re-apuntar la entrevista a otra solicitud), id.
// "estado" si esta permitido porque reprogramar() lo fuerza a REPROGRAMADA.
const COLUMNAS_EDITABLES = [
  'fecha', 'hora', 'modalidad', 'ubicacion', 'enlace', 'estado', 'observaciones',
] as const;

export class EntrevistaRepository {

  //este metodo busca las entrevistas asociadas a una solicitud 
  async findBySolicitud(solicitudId: number): Promise<EntrevistaRow[]> {
    const [rows] = await pool.query<EntrevistaRow[]>('SELECT * FROM Entrevista WHERE solicitud_id = ? ORDER BY fecha DESC', [solicitudId]);
    return rows;
  }

  //TODAS las entrevistas del candidato, con propuesta y empresa resueltas (1 query)
  async findByUsuario(usuarioId: number): Promise<any[]> {
    const [rows] = await pool.query<any[]>(
      `SELECT en.*, p.id_propuesta, p.nombre AS propuesta_nombre, p.tipo AS propuesta_tipo,
              JSON_OBJECT(
                'id_empresa', e.id_empresa, 'nombre', e.nombre, 'fotografia', e.fotografia,
                'verificada', e.verificada
              ) AS empresa
         FROM Entrevista en
         INNER JOIN Solicitud s ON s.id_solicitud = en.solicitud_id
         INNER JOIN Propuesta p ON p.id_propuesta = s.propuesta_id
         INNER JOIN Empresa e ON e.id_empresa = p.empresa_id
        WHERE s.usuario_id = ?
        ORDER BY en.fecha DESC, en.hora DESC`,
      [usuarioId]
    );
    for (const fila of rows) {
      if (fila.empresa) fila.empresa.verificada = Boolean(fila.empresa.verificada);
    }
    return rows;
  }

  //TODAS las entrevistas de las propuestas de una empresa, con el candidato (1 query)
  async findByEmpresa(empresaId: number): Promise<any[]> {
    const [rows] = await pool.query<any[]>(
      `SELECT en.*, p.id_propuesta, p.nombre AS propuesta_nombre,
              u.id_usuario, u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido,
              u.fotografia AS candidato_fotografia
         FROM Entrevista en
         INNER JOIN Solicitud s ON s.id_solicitud = en.solicitud_id
         INNER JOIN Propuesta p ON p.id_propuesta = s.propuesta_id
         INNER JOIN Usuario u ON u.id_usuario = s.usuario_id
        WHERE p.empresa_id = ?
        ORDER BY en.fecha DESC, en.hora DESC`,
      [empresaId]
    );
    return rows;
  }

  //se encarga de encontrar entrevistas especificamente por medio de su ID 
  async findById(id: number): Promise<EntrevistaRow | null> {
    const [rows] = await pool.query<EntrevistaRow[]>('SELECT * FROM Entrevista WHERE id_entrevista = ?', [id]);
    return rows[0] ?? null;
  }

  //el metodo se encarga de crear una entrevista con su respectivo ID 
  async create(data: Omit<Entrevista, 'id_entrevista' | 'estado'>): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO Entrevista (solicitud_id, fecha, hora, modalidad, ubicacion, enlace, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.solicitud_id, data.fecha, data.hora, data.modalidad, data.ubicacion ?? null, data.enlace ?? null, data.observaciones ?? null]
    );
    return result.insertId;
  }

  //Modifica unicamente el estado de la entrevista
  async updateEstado(id: number, estado: EstadoEntrevista): Promise<void> {
    await pool.query('UPDATE Entrevista SET estado = ? WHERE id_entrevista = ?', [estado, id]);
  }

  //aqui se actualizan unicamente los datos que se necesitan (whitelist)
  async update(id: number, data: Partial<Entrevista>): Promise<void> {
    await actualizarDinamico('Entrevista', 'id_entrevista', id, data, COLUMNAS_EDITABLES);
  }
}

export const entrevistaRepository = new EntrevistaRepository();