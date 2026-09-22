import { Router } from 'express';
import { notificacionService } from '../services/NotificacionService';
import { verificarToken } from '../middlewares/AuthMiddlewares';

const router = Router();

//obtiene las notificaciones de un usuario en especifico 
router.get('/usuario/:usuarioId', verificarToken, async (req, res, next) => {
    try { res.json(await notificacionService.listar(Number(req.params.usuarioId))); }
    catch (error) { next(error); }
});

//marca una notificacion en especifico como leida 
router.patch('/:id/leida', verificarToken, async (req, res, next) => {
    try {
        await notificacionService.marcarLeida(Number(req.params.id));
        res.json({ mensaje: 'Notificación marcada como leída' });
    } catch (error) { next(error); }
});

//marca como leidas todas las notificaciones un solo usuario 
router.patch('/usuario/:usuarioId/leidas', verificarToken, async (req, res, next) => {
    try {
        await notificacionService.marcarTodasLeidas(Number(req.params.usuarioId));
        res.json({ mensaje: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) { next(error); }
});

export default router;