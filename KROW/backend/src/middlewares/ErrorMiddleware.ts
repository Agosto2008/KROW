import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({ mensaje: err.message || 'Error interno del servidor' });
}

export function rutaNoEncontrada(req: Request, res: Response) {
    res.status(404).json({ mensaje: 'Ruta no encontrada' });
}