import { pool } from '../database/Conexion';
import { Favorito } from '../models/Favorito';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

interface FavoritoRow extends Favorito, RowDataPacket {}

export class FavoritoRepository {

  //se obtienen todos los usuarios marcados como favoritos de otro usuario 
  async findByUsuario(usuarioId: number): Promise<FavoritoRow[]> {
    const [rows] = await pool.query<FavoritoRow[]>('SELECT * FROM Favorito WHERE usuario_id = ? ORDER BY fecha DESC', [usuarioId]);
    return rows;
  }

  //favoritos CON su propuesta y empresa ya resueltas en UNA query
  //(el front antes tenia que pedir cada propuesta una por una: N+1)
  async findByUsuarioConPropuesta(usuarioId: number): Promise<any[]> {
    const [rows] = await pool.query<any[]>(
      `SELECT f.id_favorito, f.fecha AS fecha_guardado, f.usuario_id,
              p.*,
              JSON_OBJECT(
                'id_empresa', e.id_empresa, 'nombre', e.nombre, 'fotografia', e.fotografia,
                'ubicacion', e.ubicacion, 'verificada', e.verificada
              ) AS empresa
         FROM Favorito f
         INNER JOIN Propuesta p ON p.id_propuesta = f.propuesta_id
         INNER JOIN Empresa e ON e.id_empresa = p.empresa_id
        WHERE f.usuario_id = ?
        ORDER BY f.fecha DESC`,
      [usuarioId]
    );
    for (const fila of rows) {
      if (fila.empresa) fila.empresa.verificada = Boolean(fila.empresa.verificada);
    }
    return rows;
  }

  //devuelve si una propuesta esta marcada como favorita o no mediante boolean 
  async yaExiste(usuarioId: number, propuestaId: number): Promise<boolean> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id_favorito FROM Favorito WHERE usuario_id = ? AND propuesta_id = ?',
      [usuarioId, propuestaId]
    );
    return rows.length > 0;
  }

  //este metodo se encarga de crear un nuevo marcado de favorito 
  async create(usuarioId: number, propuestaId: number): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO Favorito (usuario_id, propuesta_id) VALUES (?, ?)',
      [usuarioId, propuestaId]
    );
    return result.insertId;
  }

  //este metodo elimina a un marcado como favorito del listado propuesto 
  async delete(usuarioId: number, propuestaId: number): Promise<void> {
    await pool.query('DELETE FROM Favorito WHERE usuario_id = ? AND propuesta_id = ?', [usuarioId, propuestaId]);
  }
}

export const favoritoRepository = new FavoritoRepository();