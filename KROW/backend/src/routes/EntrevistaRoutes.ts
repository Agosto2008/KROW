import { Router } from 'express';
import { entrevistaService } from '../services/EntrevistaService';
import { verificarToken, verificarRol } from '../middlewares/AuthMiddlewares';

const router = Router();

router.get('/solicitud/:solicitudId', verificarToken, async (req, res, next) => {
  try { res.json(await entrevistaService.listarPorSolicitud(Number(req.params.solicitudId))); }
  catch (error) { next(error); }
});

router.post('/', verificarToken, verificarRol('EMPRESA'), async (req, res, next) => {
  try {
    const id = await entrevistaService.programar(req.body);
    res.status(201).json({ id_entrevista: id });
  } catch (error) { next(error); }
});

router.put('/:id/reprogramar', verificarToken, verificarRol('EMPRESA'), async (req, res, next) => {
  try {
    await entrevistaService.reprogramar(Number(req.params.id), req.body);
    res.json({ mensaje: 'Entrevista reprogramada' });
  } catch (error) { next(error); }
});

router.patch('/:id/estado', verificarToken, verificarRol('EMPRESA', 'USUARIO'), async (req, res, next) => {
  try {
    await entrevistaService.cambiarEstado(Number(req.params.id), req.body.estado);
    res.json({ mensaje: 'Estado de entrevista actualizado' });
  } catch (error) { next(error); }
});

export default router;