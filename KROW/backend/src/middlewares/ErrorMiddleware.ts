import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    console.error(err);
    const status = err.status || 500;
    // En 500 no exponemos el mensaje real (puede tener detalles internos)
    const mensaje = status === 500 ? 'Error interno del servidor' : err.message;
    res.status(status).json({ mensaje });
}

export function rutaNoEncontrada(req: Request, res: Response) {
    res.status(404).json({ mensaje: 'Ruta no encontrada' });
}