import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken'; import { pool } from '../database/Conexion';
import { cuentaRepository } from '../repositories/CuentaRepository';
import { usuarioRepository } from '../repositories/UsuarioRepository';
import { empresaRepository } from '../repositories/EmpresaRepository';
import { RolCuenta } from '../models/Cuenta';
import { AppError } from '../utils/AppError';

// configura la clave y duracion del token
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
    // registra un nuevo usuario
    async registrarUsuario(data: RegistroUsuarioInput) {
        const existente = await cuentaRepository.findByCorreo(data.correo);
        if (existente) throw new AppError('El correo ya está registrado', 409);

        // encripta la contraseña
        const passwordHash = await bcrypt.hash(data.password, 10);

        // inicia una transaccion para crear la cuenta y el usuario
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

            // confirma los cambios
            await connection.commit();
            return this.generarToken(idCuenta, 'USUARIO');
        } catch (error) {
            // revierte los cambios si ocurre un error
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // registra una nueva empresa
    async registrarEmpresa(data: RegistroEmpresaInput) {
        const existente = await cuentaRepository.findByCorreo(data.correo);
        if (existente) throw new AppError('El correo ya está registrado', 409);

        // encripta la contraseña
        const passwordHash = await bcrypt.hash(data.password, 10);

        // inicia una transaccion para crear la cuenta y la empresa
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

            // confirma los cambios
            await connection.commit();
            return this.generarToken(idCuenta, 'EMPRESA');
        } catch (error) {
            // revierte los cambios si ocurre un error
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // inicia sesion
    async login(correo: string, password: string) {
        const cuenta = await cuentaRepository.findByCorreo(correo);
        if (!cuenta) throw new AppError('Credenciales inválidas', 401);
        if (cuenta.estado !== 'ACTIVA') throw new AppError('Cuenta no activa', 403);

        // compara la contraseña ingresada con la almacenada
        const passwordValido = await bcrypt.compare(password, cuenta.password);
        if (!passwordValido) throw new AppError('Credenciales inválidas', 401);

        return this.generarToken(cuenta.id_cuenta, cuenta.rol);
    }

    // genera el token de autenticacion
    private generarToken(idCuenta: number, rol: RolCuenta) {
        const token = jwt.sign({ id_cuenta: idCuenta, rol }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        return { token, rol, id_cuenta: idCuenta };
    }
}

export const authService = new AuthService();
