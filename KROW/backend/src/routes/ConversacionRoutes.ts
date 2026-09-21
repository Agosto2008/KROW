import { Router } from 'express';
import { conversacionService } from '../services/ConversacionService';
import { verificarToken } from '../middlewares/AuthMiddlewares';

const router = Router();

router.get('/solicitud/:solicitudId', verificarToken, async (req, res, next) => {
  try { res.json(await conversacionService.obtenerPorSolicitud(Number(req.params.solicitudId))); }
  catch (error) { next(error); }
});

router.patch('/:id/cerrar', verificarToken, async (req, res, next) => {
  try {
    await conversacionService.cerrar(Number(req.params.id));
    res.json({ mensaje: 'Conversación cerrada' });
  } catch (error) { next(error); }
});

export default router;