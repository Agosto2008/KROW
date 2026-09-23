import { Router } from 'express';
import { notificacionService } from '../services/NotificacionService';
import { verificarToken } from '../middlewares/AuthMiddlewares';
import { verificarPropietarioUsuario, verificarPropietarioNotificacion } from '../utils/resolverPerfil';

const router = Router();

//obtiene las notificaciones de un usuario en especifico
//solo el propio usuario (o un ADMIN) puede ver sus notificaciones
router.get('/usuario/:usuarioId', verificarToken, async (req, res, next) => {
    try {
        await verificarPropietarioUsuario(req, Number(req.params.usuarioId));
        res.json(await notificacionService.listar(Number(req.params.usuarioId)));
    } catch (error) { next(error); }
});

//marca una notificacion en especifico como leida
//solo el dueño de la notificacion (o un ADMIN) puede marcarla
router.patch('/:id/leida', verificarToken, async (req, res, next) => {
    try {
        await verificarPropietarioNotificacion(req, Number(req.params.id));
        await notificacionService.marcarLeida(Number(req.params.id));
        res.json({ mensaje: 'Notificación marcada como leída' });
    } catch (error) { next(error); }
});

//marca como leidas todas las notificaciones un solo usuario
//solo el propio usuario (o un ADMIN) puede marcarlas todas
router.patch('/usuario/:usuarioId/leidas', verificarToken, async (req, res, next) => {
    try {
        await verificarPropietarioUsuario(req, Number(req.params.usuarioId));
        await notificacionService.marcarTodasLeidas(Number(req.params.usuarioId));
        res.json({ mensaje: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) { next(error); }
});

export default router;