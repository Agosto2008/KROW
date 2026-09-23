import { pool } from '../database/Conexion';
import { Usuario } from '../models/Usuario';
import { ResultSetHeader, RowDataPacket, Pool, PoolConnection } from 'mysql2/promise';
import { actualizarDinamico } from '../utils/actualizarDinamico';

interface UsuarioRow extends Usuario, RowDataPacket { }
type DbClient = Pool | PoolConnection;

// PROHIBIDO: cuenta_id (re-apuntar el perfil a otra cuenta).
const COLUMNAS_EDITABLES = [
    'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido',
    'telefono', 'fotografia', 'descripcion_personal', 'direccion', 'fecha_nacimiento',
] as const;

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

    //PERFIL PUBLICO del candidato: solo lo que una empresa puede ver
    //(sin telefono, direccion ni fecha de nacimiento)
    async findPublico(id: number): Promise<any | null> {
        const [rows] = await pool.query<any[]>(
            `SELECT u.id_usuario, u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido,
                    u.fotografia, u.descripcion_personal,
                    c.perfil_profesional, c.idiomas, c.habilidades, c.certificaciones, c.portafolio,
                    c.campo_laboral, c.campo_estudiantil, c.fecha_actualizacion AS curriculum_actualizado
               FROM Usuario u
          LEFT JOIN Curriculum c ON c.usuario_id = u.id_usuario
              WHERE u.id_usuario = ?`,
            [id]
        );
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

    // Update dinámico con whitelist: solo columnas editables; el resto se ignora
    async update(id: number, data: Partial<Usuario>): Promise<void> {
        await actualizarDinamico('Usuario', 'id_usuario', id, data, COLUMNAS_EDITABLES);
    }

    //borra a un usuario por medio de su id
    async delete(id: number): Promise<void> {
        await pool.query('DELETE FROM Usuario WHERE id_usuario = ?', [id]);
    }
}

export const usuarioRepository = new UsuarioRepository();