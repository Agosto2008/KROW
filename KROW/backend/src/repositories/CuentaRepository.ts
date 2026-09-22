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

  //se encarga de eliminar una cuenta directamente por su ID 
  async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM Cuenta WHERE id_cuenta = ?', [id]);
  }
}

export const cuentaRepository = new CuentaRepository();