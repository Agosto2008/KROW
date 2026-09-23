import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RolCuenta } from '../models/Cuenta';
import { env } from '../config/env';

export interface JwtPayload {
    id_cuenta: number;
    rol: RolCuenta;
}

// Extiende Request de Express para incluir el usuario autenticado
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export function verificarToken(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const token = header.split(' ')[1];
    try {
        const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
        req.user = payload;
        next();
    } catch {
        return res.status(401).json({ mensaje: 'Token inválido o expirado' });
    }
}

// Uso: router.post('/', verificarToken, verificarRol('ADMIN', 'EMPRESA'), ...)
export function verificarRol(...rolesPermitidos: RolCuenta[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
            return res.status(403).json({ mensaje: 'No tienes permisos para esta acción' });
        }
        next();
    };
}