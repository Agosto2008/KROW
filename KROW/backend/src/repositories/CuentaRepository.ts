import { pool } from '../database/Conexion';
import { Cuenta, RolCuenta, EstadoCuenta } from '../models/Cuenta';
import { ResultSetHeader, RowDataPacket, Pool, PoolConnection } from 'mysql2/promise';

interface CuentaRow extends Cuenta, RowDataPacket {}
type DbClient = Pool | PoolConnection;

export class CuentaRepository {

  //se encarga de buscar una cuenta por medio de su correo 
  async findByCorreo(correo: string): Promise<CuentaRow | null> {
    const [rows] = await pool.query<CuentaRow[]>(
      'SELECT * FROM Cuenta WHERE correo = ? LIMIT 1',
      [correo]
    );
    return rows[0] ?? null;
  }
  //tiene casi la misma funcion que el metodo anterior solo que esta busca especificamente por ID
  async findById(id: number): Promise<CuentaRow | null> {
    const [rows] = await pool.query<CuentaRow[]>(
      'SELECT * FROM Cuenta WHERE id_cuenta = ? LIMIT 1',
      [id]
    );
    return rows[0] ?? null;
  }

  // "connection" opcional para poder ejecutarse dentro de una transacción (ver auth.service)
  async create(correo: string, passwordHash: string, rol: RolCuenta, connection: DbClient = pool): Promise<number> {
    const [result] = await connection.query<ResultSetHeader>(
      'INSERT INTO Cuenta (correo, password, rol) VALUES (?, ?, ?)',
      [correo, passwordHash, rol]
    );
    return result.insertId;
  }

  //se encarga de actualizar el estado de una cuenta en uso 
  async updateEstado(id: number, estado: EstadoCuenta): Promise<void> {
    await pool.query('UPDATE Cuenta SET estado = ? WHERE id_cuenta = ?', [estado, id]);
  }

  //actualiza el hash de la password (solo el flujo de cambiar-password)
  async updatePassword(id: number, passwordHash: string): Promise<void> {
    await pool.query('UPDATE Cuenta SET password = ? WHERE id_cuenta = ?', [passwordHash, id]);
  }

  //se encarga de eliminar una cuenta directamente por su ID 
  async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM Cuenta WHERE id_cuenta = ?', [id]);
  }

  //LISTADO para el admin: cuentas con su perfil (usuario o empresa) resuelto,
  //busqueda por correo/nombre y paginacion en el servidor
  async listar(opciones: { buscar?: string; rol?: string; estado?: string; pagina?: number; porPagina?: number }) {
    const porPagina = Math.min(Math.max(opciones.porPagina ?? 15, 1), 50);
    const pagina = Math.max(opciones.pagina ?? 1, 1);
    const desplazamiento = (pagina - 1) * porPagina;

    let sql = `SELECT c.id_cuenta, c.correo, c.rol, c.estado, c.fecha_creacion,
                      u.id_usuario, u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido,
                      emp.id_empresa, emp.nombre AS empresa_nombre, emp.verificada
                 FROM Cuenta c
            LEFT JOIN Usuario u ON u.cuenta_id = c.id_cuenta
            LEFT JOIN Empresa emp ON emp.cuenta_id = c.id_cuenta
                WHERE 1=1`;
    const params: any[] = [];

    if (opciones.buscar) {
      sql += ' AND (c.correo LIKE ? OR u.primer_nombre LIKE ? OR u.primer_apellido LIKE ? OR emp.nombre LIKE ?)';
      const like = `%${opciones.buscar}%`;
      params.push(like, like, like, like);
    }
    if (opciones.rol) { sql += ' AND c.rol = ?'; params.push(opciones.rol); }
    if (opciones.estado) { sql += ' AND c.estado = ?'; params.push(opciones.estado); }

    const [conteo] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) AS total FROM (${sql}) AS c`, params);

    sql += ' ORDER BY c.fecha_creacion DESC LIMIT ? OFFSET ?';
    params.push(porPagina, desplazamiento);

    const [rows] = await pool.query<any[]>(sql, params);
    for (const fila of rows) {
      if (fila.verificada !== null && fila.verificada !== undefined) fila.verificada = Boolean(fila.verificada);
    }
    return { datos: rows, total: conteo[0].total, pagina, porPagina };
  }
}

export const cuentaRepository = new CuentaRepository();