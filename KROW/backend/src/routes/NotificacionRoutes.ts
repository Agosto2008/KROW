import { Router } from 'express';
import { notificacionService } from '../services/NotificacionService';
import { verificarToken } from '../middlewares/AuthMiddlewares';

const router = Router();

router.get('/usuario/:usuarioId', verificarToken, async (req, res, next) => {
    try { res.json(await notificacionService.listar(Number(req.params.usuarioId))); }
    catch (error) { next(error); }
});

router.patch('/:id/leida', verificarToken, async (req, res, next) => {
    try {
        await notificacionService.marcarLeida(Number(req.params.id));
        res.json({ mensaje: 'Notificación marcada como leída' });
    } catch (error) { next(error); }
});

router.patch('/usuario/:usuarioId/leidas', verificarToken, async (req, res, next) => {
    try {
        await notificacionService.marcarTodasLeidas(Number(req.params.usuarioId));
        res.json({ mensaje: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) { next(error); }
});

export default router;