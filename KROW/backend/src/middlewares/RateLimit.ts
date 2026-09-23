import { Request, Response, NextFunction } from 'express';

// Rate limiter en memoria (suficiente para el alcance de este proyecto):
// limita los intentos por IP + clave para frenar fuerza bruta en /auth/login.
// Si en el futuro hay varios procesos, migrar a Redis.

interface Ventana {
    intentos: number;
    reinicio: number;
}

const VENTANA_MS = 15 * 60 * 1000; // 15 minutos
const MAX_INTENTOS = 10;

const registro = new Map<string, Ventana>();

// Limpieza periodica para que el Map no crezca sin limite
const temporizador = setInterval(() => {
    const ahora = Date.now();
    for (const [clave, ventana] of registro) {
        if (ventana.reinicio <= ahora) registro.delete(clave);
    }
}, VENTANA_MS);
temporizador.unref?.();

export function limitarIntentos(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.socket.remoteAddress || 'desconocida';
    // clave: ip + correo intentado (si viene en el body)
    const correo = typeof req.body?.correo === 'string' ? req.body.correo.toLowerCase() : '';
    const clave = `${ip}|${correo}`;

    const ahora = Date.now();
    let ventana = registro.get(clave);

    if (!ventana || ventana.reinicio <= ahora) {
        ventana = { intentos: 0, reinicio: ahora + VENTANA_MS };
        registro.set(clave, ventana);
    }

    if (ventana.intentos >= MAX_INTENTOS) {
        const segundos = Math.ceil((ventana.reinicio - ahora) / 1000);
        res.setHeader('Retry-After', String(segundos));
        return res.status(429).json({
            mensaje: `Demasiados intentos. Intenta de nuevo en ${Math.ceil(segundos / 60)} minuto(s)`,
        });
    }

    ventana.intentos++;
    next();
}

// Reinicia el contador cuando el login tiene exito.
export function limpiarIntentos(req: Request) {
    const ip = req.ip || req.socket.remoteAddress || 'desconocida';
    const correo = typeof req.body?.correo === 'string' ? req.body.correo.toLowerCase() : '';
    registro.delete(`${ip}|${correo}`);
}
