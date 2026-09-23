import { pool } from '../database/Conexion';
import { Empresa } from '../models/Empresa';
import { ResultSetHeader, RowDataPacket, Pool, PoolConnection } from 'mysql2/promise';
import { actualizarDinamico } from '../utils/actualizarDinamico';

interface EmpresaRow extends Empresa, RowDataPacket {}
type DbClient = Pool | PoolConnection;

// Columnas que se pueden actualizar via PUT. PROHIBIDO: cuenta_id (re-apuntar
// la empresa a otra cuenta), verificada (auto-aprobacion), fecha_registro.
const COLUMNAS_EDITABLES = [
  'nombre',
  'descripcion',
  'propuesta_empresa',
  'fotografia',
  'telefono',
  'ubicacion',
] as const;

export class EmpresaRepository {

  //este metodo encuentra a todas las empresas listadas y devuelve un arreglo de ellas 
  async findAll(): Promise<EmpresaRow[]> {
    const [rows] = await pool.query<EmpresaRow[]>('SELECT * FROM Empresa ORDER BY fecha_registro DESC');
    return rows;
  }

  //listado publico con busqueda + paginacion en el servidor
  async buscar(opciones: { buscar?: string; pagina?: number; porPagina?: number; verificadas?: boolean }) {
    const porPagina = Math.min(Math.max(opciones.porPagina ?? 12, 1), 50);
    const pagina = Math.max(opciones.pagina ?? 1, 1);
    const desplazamiento = (pagina - 1) * porPagina;

    let sql = 'SELECT * FROM Empresa WHERE 1=1';
    const params: any[] = [];

    if (opciones.buscar) {
      sql += ' AND (nombre LIKE ? OR descripcion LIKE ? OR ubicacion LIKE ?)';
      const like = `%${opciones.buscar}%`;
      params.push(like, like, like);
    }
    if (opciones.verificadas === true) sql += ' AND verificada = TRUE';

    const [conteo] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) AS total FROM (${sql}) AS c`, params);

    sql += ' ORDER BY verificada DESC, fecha_registro DESC LIMIT ? OFFSET ?';
    params.push(porPagina, desplazamiento);

    const [rows] = await pool.query<EmpresaRow[]>(sql, params);
    return { datos: rows, total: conteo[0].total, pagina, porPagina };
  }

  //empresa + sus propuestas ACTIVAS en una sola query (detalle de empresa)
  async findByIdConPropuestas(id: number): Promise<{ empresa: EmpresaRow | null; propuestas: any[] }> {
    const [empresas] = await pool.query<EmpresaRow[]>('SELECT * FROM Empresa WHERE id_empresa = ?', [id]);
    if (!empresas[0]) return { empresa: null, propuestas: [] };

    const [propuestas] = await pool.query<any[]>(
      `SELECT p.*, e.nombre AS empresa_nombre, e.verificada AS empresa_verificada
         FROM Propuesta p
         INNER JOIN Empresa e ON e.id_empresa = p.empresa_id
        WHERE p.empresa_id = ? AND p.estado = 'ACTIVA'
        ORDER BY p.fecha_publicacion DESC`,
      [id]
    );
    return { empresa: empresas[0], propuestas };
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

  //se encarga de actualizar el estado de una empresa (solo columnas de la whitelist)
  async update(id: number, data: Partial<Empresa>): Promise<void> {
    await actualizarDinamico('Empresa', 'id_empresa', id, data, COLUMNAS_EDITABLES);
  }

  // Único camino para marcar la verificación (lo invoca solo el service cuando
  // un ADMIN aprueba). No pasa por la whitelist porque "verificada" es
  // precisamente una columna que el PUT de la empresa NO debe tocar.
  async marcarVerificada(id: number, verificada: boolean): Promise<void> {
    await pool.query('UPDATE Empresa SET verificada = ? WHERE id_empresa = ?', [verificada, id]);
  }
  //este metodo elimina a una empresa por medio de su ID 
  async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM Empresa WHERE id_empresa = ?', [id]);
  }
}

export const empresaRepository = new EmpresaRepository();