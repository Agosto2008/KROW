import { Request, Response, NextFunction } from 'express';
 
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    const status = err.status || 500;
    if (status >= 500) {
        // solo los 500 (inesperados) merecen el stack completo en consola
        console.error(err);
    } else {
        // los 4xx son errores controlados (login mal, duplicado, permiso):
        // una linea basta y la consola se queda limpia
        console.warn(`[API ${status}] ${req.method} ${req.originalUrl} - ${err.message}`);
    }
    // En 500 no exponemos el mensaje real (puede tener detalles internos)
    const mensaje = status === 500 ? 'Error interno del servidor' : err.message;
    res.status(status).json({ mensaje });
}
 
export function rutaNoEncontrada(req: Request, res: Response) {
    res.status(404).json({ mensaje: 'Ruta no encontrada' });
}