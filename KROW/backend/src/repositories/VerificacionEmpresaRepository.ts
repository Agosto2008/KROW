import { pool } from '../database/Conexion';
import { VerificacionEmpresa, EstadoVerificacion, TipoVerificacion } from '../models/VerificacionEmpresa';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

interface VerificacionRow extends VerificacionEmpresa, RowDataPacket { }

export class VerificacionEmpresaRepository {

    //recibe el id de una empresa y devuelve una lista de las mismas 
    async findByEmpresa(empresaId: number): Promise<VerificacionRow[]> {
        const [rows] = await pool.query<VerificacionRow[]>('SELECT * FROM VerificacionEmpresa WHERE empresa_id = ? ORDER BY fecha DESC', [empresaId]);
        return rows;
    }

    //ULTIMA verificacion de una empresa (cualquier estado): se usa en el
    //detalle publico /empresas/:id/con-propuestas para mostrar el nivel
    //(PLATA / PLATINO / DIAMANTE) junto al sello "verificada".
    async findUltima(empresaId: number): Promise<VerificacionRow | null> {
        const [rows] = await pool.query<VerificacionRow[]>(
            'SELECT * FROM VerificacionEmpresa WHERE empresa_id = ? ORDER BY fecha DESC LIMIT 1',
            [empresaId]
        );
        return rows[0] ?? null;
    }

    //COLA DEL ADMIN: todas las verificaciones con el nombre de la empresa ya
    //resuelto (antes el admin tenia que conocer el empresa_id a mano y el front
    //hacia N peticiones)
    async findAll(estado?: string): Promise<any[]> {
        let sql = `SELECT v.*, e.nombre AS empresa_nombre, e.fotografia AS empresa_fotografia,
                          e.ubicacion AS empresa_ubicacion, e.verificada
                     FROM VerificacionEmpresa v
                     INNER JOIN Empresa e ON e.id_empresa = v.empresa_id`;
        const params: any[] = [];
        if (estado) { sql += ' WHERE v.estado = ?'; params.push(estado); }
        sql += ' ORDER BY v.fecha DESC';
        const [rows] = await pool.query<any[]>(sql, params);
        for (const fila of rows) fila.verificada = Boolean(fila.verificada);
        return rows;
    }

    //existe ya una verificacion PENDIENTE para esta empresa?
    async tienePendiente(empresaId: number): Promise<boolean> {
        const [rows] = await pool.query<RowDataPacket[]>(
            "SELECT id_verificacion FROM VerificacionEmpresa WHERE empresa_id = ? AND estado = 'PENDIENTE' LIMIT 1",
            [empresaId]
        );
        return rows.length > 0;
    }

async findById(id: number): Promise<VerificacionRow | null> {
    const [rows] = await pool.query<VerificacionRow[]>('SELECT * FROM VerificacionEmpresa WHERE id_verificacion = ?', [id]);
    return rows[0] ?? null;
}

    //crea una nueva verificacion en la base de datos 
    async create(empresaId: number, tipoVerificacion: TipoVerificacion): Promise<number> {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO VerificacionEmpresa (empresa_id, tipo_verificacion) VALUES (?, ?)',
            [empresaId, tipoVerificacion]
        );
        return result.insertId;
    }

    //actualiza una verificacion ya existente 
    async resolver(id: number, estado: EstadoVerificacion, administrador: string, observacion?: string): Promise<void> {
        await pool.query(
            'UPDATE VerificacionEmpresa SET estado = ?, administrador = ?, observacion = ? WHERE id_verificacion = ?',
            [estado, administrador, observacion ?? null, id]
        );
    }
}

export const verificacionEmpresaRepository = new VerificacionEmpresaRepository();