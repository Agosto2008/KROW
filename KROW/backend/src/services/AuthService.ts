import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken'; import { pool } from '../database/Conexion';
import { cuentaRepository } from '../repositories/CuentaRepository';
import { usuarioRepository } from '../repositories/UsuarioRepository';
import { empresaRepository } from '../repositories/EmpresaRepository';
import { RolCuenta } from '../models/Cuenta';
import { AppError } from '../utils/AppError';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN: SignOptions['expiresIn'] =
    (process.env.JWT_EXPIRES_IN || '1h') as SignOptions['expiresIn'];

interface RegistroUsuarioInput {
    correo: string;
    password: string;
    primer_nombre: string;
    primer_apellido: string;
    segundo_nombre?: string;
    segundo_apellido?: string;
    telefono?: string;
}

interface RegistroEmpresaInput {
    correo: string;
    password: string;
    nombre: string;
    descripcion?: string;
    telefono?: string;
    ubicacion?: string;
}

export class AuthService {
    async registrarUsuario(data: RegistroUsuarioInput) {
        const existente = await cuentaRepository.findByCorreo(data.correo);
        if (existente) throw new AppError('El correo ya está registrado', 409);

        const passwordHash = await bcrypt.hash(data.password, 10);

        // Transacción: si falla la creación del Usuario, se revierte también la Cuenta
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const idCuenta = await cuentaRepository.create(data.correo, passwordHash, 'USUARIO', connection);
            await usuarioRepository.create({
                cuenta_id: idCuenta,
                primer_nombre: data.primer_nombre,
                primer_apellido: data.primer_apellido,
                segundo_nombre: data.segundo_nombre ?? null,
                segundo_apellido: data.segundo_apellido ?? null,
                telefono: data.telefono ?? null,
                fotografia: null,
                descripcion_personal: null,
                direccion: null,
                fecha_nacimiento: null,
            }, connection);

            await connection.commit();
            return this.generarToken(idCuenta, 'USUARIO');
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async registrarEmpresa(data: RegistroEmpresaInput) {
        const existente = await cuentaRepository.findByCorreo(data.correo);
        if (existente) throw new AppError('El correo ya está registrado', 409);

        const passwordHash = await bcrypt.hash(data.password, 10);

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const idCuenta = await cuentaRepository.create(data.correo, passwordHash, 'EMPRESA', connection);
            await empresaRepository.create({
                cuenta_id: idCuenta,
                nombre: data.nombre,
                descripcion: data.descripcion ?? null,
                propuesta_empresa: null,
                telefono: data.telefono ?? null,
                ubicacion: data.ubicacion ?? null,
            }, connection);

            await connection.commit();
            return this.generarToken(idCuenta, 'EMPRESA');
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async login(correo: string, password: string) {
        const cuenta = await cuentaRepository.findByCorreo(correo);
        if (!cuenta) throw new AppError('Credenciales inválidas', 401);
        if (cuenta.estado !== 'ACTIVA') throw new AppError('Cuenta no activa', 403);

        const passwordValido = await bcrypt.compare(password, cuenta.password);
        if (!passwordValido) throw new AppError('Credenciales inválidas', 401);

        return this.generarToken(cuenta.id_cuenta, cuenta.rol);
    }

    async obtenerPerfilActual(idCuenta: number, rol: RolCuenta) {
        const cuenta = await cuentaRepository.findById(idCuenta);
        if (!cuenta) throw new AppError('Cuenta no encontrada', 404);

        let perfil = null;
        if (rol === 'USUARIO') {
            perfil = await usuarioRepository.findByCuentaId(idCuenta);
        } else if (rol === 'EMPRESA') {
            perfil = await empresaRepository.findByCuentaId(idCuenta);
        }

        return {
            rol,
            correo: cuenta.correo,
            estado: cuenta.estado,
            perfil,
        };
    }

    private generarToken(idCuenta: number, rol: RolCuenta) {
        const token = jwt.sign({ id_cuenta: idCuenta, rol }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        return { token, rol, id_cuenta: idCuenta };
    }
}

export const authService = new AuthService();