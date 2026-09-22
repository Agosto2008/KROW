import { Router } from 'express';
import { conversacionService } from '../services/ConversacionService';
import { verificarToken } from '../middlewares/AuthMiddlewares';

const router = Router();

//muestra las conversaciones asociadas a una persona en especifico 
router.get('/solicitud/:solicitudId', verificarToken, async (req, res, next) => {
  try { res.json(await conversacionService.obtenerPorSolicitud(Number(req.params.solicitudId))); }
  catch (error) { next(error); }
});

//esta ruta se encarga de cerrar una conversacion
router.patch('/:id/cerrar', verificarToken, async (req, res, next) => {
  try {
    await conversacionService.cerrar(Number(req.params.id));
    res.json({ mensaje: 'Conversación cerrada' });
  } catch (error) { next(error); }
});

export default router;