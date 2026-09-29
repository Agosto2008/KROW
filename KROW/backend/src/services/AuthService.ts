import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; import { pool } from '../database/Conexion';
import { cuentaRepository } from '../repositories/CuentaRepository';
import { usuarioRepository } from '../repositories/UsuarioRepository';
import { empresaRepository } from '../repositories/EmpresaRepository';
import { RolCuenta } from '../models/Cuenta';
import { AppError } from '../utils/AppError';
import { esDuplicado } from '../utils/esDuplicado';
import { env } from '../config/env';
 
// ---- validacion de entrada de registro (lanza AppError 400) ----
const RE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 
function correoValido(correo: unknown): string {
    if (typeof correo !== 'string' || !RE_CORREO.test(correo.trim())) {
        throw new AppError('El correo no tiene un formato valido', 400);
    }
    return correo.trim().toLowerCase();
}
 
function passwordValida(password: unknown): string {
    if (typeof password !== 'string' || password.length < 8) {
        throw new AppError('La contraseña debe tener al menos 8 caracteres', 400);
    }
    if (password.length > 72) {
        throw new AppError('La contraseña no puede superar 72 caracteres', 400);
    }
    return password;
}
 
function campoObligatorio(valor: unknown, nombre: string, max = 80): string {
    if (typeof valor !== 'string' || !valor.trim()) {
        throw new AppError(`El campo "${nombre}" es obligatorio`, 400);
    }
    if (valor.trim().length > max) {
        throw new AppError(`El campo "${nombre}" no puede superar ${max} caracteres`, 400);
    }
    return valor.trim();
}
 
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
        const correoLimpio = correoValido(data.correo);
        const passwordLimpia = passwordValida(data.password);
        const primerNombre = campoObligatorio(data.primer_nombre, 'primer_nombre');
        const primerApellido = campoObligatorio(data.primer_apellido, 'primer_apellido');
 
        const existente = await cuentaRepository.findByCorreo(correoLimpio);
        if (existente) throw new AppError('El correo ya está registrado', 409);
 
        // encripta la contraseña
        const passwordHash = await bcrypt.hash(passwordLimpia, 10);
 
        // inicia una transaccion para crear la cuenta y el usuario
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
 
            const idCuenta = await cuentaRepository.create(correoLimpio, passwordHash, 'USUARIO', connection);
            await usuarioRepository.create({
                cuenta_id: idCuenta,
                primer_nombre: primerNombre,
                primer_apellido: primerApellido,
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
            // doble envio del formulario: el UNIQUE de correo es el ultimo filtro
            if (esDuplicado(error)) throw new AppError('El correo ya está registrado', 409);
            throw error;
        } finally {
            connection.release();
        }
    }
 
    // registra una nueva empresa
    async registrarEmpresa(data: RegistroEmpresaInput) {
        const correoLimpio = correoValido(data.correo);
        const passwordLimpia = passwordValida(data.password);
        const nombreLimpio = campoObligatorio(data.nombre, 'nombre', 150);
 
        const existente = await cuentaRepository.findByCorreo(correoLimpio);
        if (existente) throw new AppError('El correo ya está registrado', 409);
 
        // encripta la contraseña
        const passwordHash = await bcrypt.hash(passwordLimpia, 10);
 
        // inicia una transaccion para crear la cuenta y la empresa
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
 
            const idCuenta = await cuentaRepository.create(correoLimpio, passwordHash, 'EMPRESA', connection);
            await empresaRepository.create({
                cuenta_id: idCuenta,
                nombre: nombreLimpio,
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
            // doble envio del formulario: el UNIQUE de correo es el ultimo filtro
            if (esDuplicado(error)) throw new AppError('El correo ya está registrado', 409);
            throw error;
        } finally {
            connection.release();
        }
    }
 
    // inicia sesion
    // Un SOLO mensaje de error para "correo inexistente", "password mala" y
    // "cuenta suspendida": asi no se puede averiguar que correos existen en la
    // plataforma (enumeracion de cuentas) ni quien esta suspendido.
    async login(correo: string, password: string) {
        const mensaje = 'Correo o contraseña incorrectos';
        const error = new AppError(mensaje, 401);
 
        if (typeof correo !== 'string' || typeof password !== 'string' || !correo || !password) {
            throw error;
        }
 
        const cuenta = await cuentaRepository.findByCorreo(correo.trim().toLowerCase());
        if (!cuenta) throw error;
 
        // compara la contraseña ingresada con la almacenada
        const passwordValido = await bcrypt.compare(password, cuenta.password);
        if (!passwordValido) throw error;
 
        if (cuenta.estado !== 'ACTIVA') throw error;
 
        return this.generarToken(cuenta.id_cuenta, cuenta.rol);
    }
 
    // cambia la password de la cuenta autenticada:
    // exige la actual (si no la saben, no la pueden cambiar aunque roben la sesion)
    async cambiarPassword(idCuenta: number, passwordActual: unknown, passwordNueva: unknown) {
        const cuenta = await cuentaRepository.findById(idCuenta);
        if (!cuenta) throw new AppError('Cuenta no encontrada', 404);
 
        if (typeof passwordActual !== 'string' || !passwordActual) {
            throw new AppError('Debes indicar tu contraseña actual', 400);
        }
 
        const coincide = await bcrypt.compare(passwordActual, cuenta.password);
        if (!coincide) throw new AppError('La contraseña actual no es correcta', 403);
 
        const nueva = passwordValida(passwordNueva);
        if (nueva === passwordActual) {
            throw new AppError('La nueva contraseña debe ser distinta a la actual', 400);
        }
 
        const hash = await bcrypt.hash(nueva, 10);
        await cuentaRepository.updatePassword(idCuenta, hash);
 
        return { mensaje: 'Contraseña actualizada' };
    }
 
    // devuelve el perfil (usuario/empresa) asociado a la cuenta autenticada,
    // para el endpoint /me: así el front sabe quién es sin volver a pedir login
    async obtenerPerfil(idCuenta: number, rol: RolCuenta) {
        if (rol === 'USUARIO') {
            const perfil = await usuarioRepository.findByCuentaId(idCuenta);
            return { rol, perfil };
        }
        if (rol === 'EMPRESA') {
            const perfil = await empresaRepository.findByCuentaId(idCuenta);
            return { rol, perfil };
        }
        // ADMIN no tiene tabla de perfil propia
        return { rol, perfil: null };
    }
 
    // genera el token de autenticacion
    private generarToken(idCuenta: number, rol: RolCuenta) {
        const token = jwt.sign({ id_cuenta: idCuenta, rol }, env.jwtSecret, { expiresIn: env.jwtExpiraEn });
        return { token, rol, id_cuenta: idCuenta };
    }
}
 
export const authService = new AuthService();
