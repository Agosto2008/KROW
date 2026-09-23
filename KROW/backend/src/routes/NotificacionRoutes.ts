import { Router } from 'express';
import { notificacionService } from '../services/NotificacionService';
import { verificarToken } from '../middlewares/AuthMiddlewares';
import { AppError } from '../utils/AppError';

const router = Router();

//notificaciones de la cuenta autenticada (USUARIO o EMPRESA)
//no hace falta mandar ids: salen del token, asi no hay forma de espiar las ajenas
router.get('/', verificarToken, async (req, res, next) => {
    try {
        res.json(await notificacionService.listar(req.user!.id_cuenta));
    } catch (error) { next(error); }
});

//contador de no leidas (para la campana del navbar)
router.get('/no-leidas', verificarToken, async (req, res, next) => {
    try {
        const total = await notificacionService.contarNoLeidas(req.user!.id_cuenta);
        res.json({ total });
    } catch (error) { next(error); }
});

//marca todas las notificaciones de la cuenta autenticada como leidas
router.patch('/leidas', verificarToken, async (req, res, next) => {
    try {
        await notificacionService.marcarTodasLeidas(req.user!.id_cuenta);
        res.json({ mensaje: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) { next(error); }
});

//marca una notificacion en especifico como leida
//solo el dueño de la notificacion (o un ADMIN) puede marcarla
router.patch('/:id/leida', verificarToken, async (req, res, next) => {
    try {
        const resultado = await notificacionService.verificarPropietario(
            Number(req.params.id),
            req.user!.id_cuenta,
            req.user!.rol === 'ADMIN'
        );
        if (!resultado.ok) {
            throw new AppError(
                resultado.motivo === 'no-existe' ? 'Notificación no encontrada' : 'No tienes permiso sobre esta notificación',
                resultado.motivo === 'no-existe' ? 404 : 403
            );
        }
        await notificacionService.marcarLeida(Number(req.params.id));
        res.json({ mensaje: 'Notificación marcada como leída' });
    } catch (error) { next(error); }
});

export default router;
