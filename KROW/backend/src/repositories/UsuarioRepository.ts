import { pool } from '../database/Conexion';
import { Usuario } from '../models/Usuario';
import { ResultSetHeader, RowDataPacket, Pool, PoolConnection } from 'mysql2/promise';

interface UsuarioRow extends Usuario, RowDataPacket { }
type DbClient = Pool | PoolConnection;

export class UsuarioRepository {

    //busca a un usuario por medio de su respectivo
    async findById(id: number): Promise<UsuarioRow | null> {
        const [rows] = await pool.query<UsuarioRow[]>('SELECT * FROM Usuario WHERE id_usuario = ?', [id]);
        return rows[0] ?? null;
    }

    //busca una usuario utilizando el id de su cuenta 
    async findByCuentaId(cuentaId: number): Promise<UsuarioRow | null> {
        const [rows] = await pool.query<UsuarioRow[]>('SELECT * FROM Usuario WHERE cuenta_id = ?', [cuentaId]);
        return rows[0] ?? null;
    }

    //crea un nuevo usuario asignado su respectivo ID
    async create(data: Omit<Usuario, 'id_usuario'>, connection: DbClient = pool): Promise<number> {
        const [result] = await connection.query<ResultSetHeader>(
            `INSERT INTO Usuario
        (cuenta_id, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, telefono, fotografia, descripcion_personal, direccion, fecha_nacimiento)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [data.cuenta_id, data.primer_nombre, data.segundo_nombre ?? null, data.primer_apellido,
            data.segundo_apellido ?? null, data.telefono ?? null, data.fotografia ?? null,
            data.descripcion_personal ?? null, data.direccion ?? null, data.fecha_nacimiento ?? null]
        );
        return result.insertId;
    }

    // Update dinámico: solo arma el SET con los campos que realmente llegan en "data"
    async update(id: number, data: Partial<Usuario>): Promise<void> {
        const campos = Object.keys(data);
        if (campos.length === 0) return;
        const setClause = campos.map((c) => `${c} = ?`).join(', ');
        const valores = campos.map((c) => (data as any)[c]);
        await pool.query(`UPDATE Usuario SET ${setClause} WHERE id_usuario = ?`, [...valores, id]);
    }

    //borra a un usuario por medio de su id
    async delete(id: number): Promise<void> {
        await pool.query('DELETE FROM Usuario WHERE id_usuario = ?', [id]);
    }
}

export const usuarioRepository = new UsuarioRepository();