import { Router } from 'express';
import { reporteService } from '../services/ReporteService';
import { verificarToken, verificarRol } from '../middlewares/AuthMiddlewares';
import { obtenerUsuarioIdDelToken } from '../utils/resolverPerfil';

const router = Router();

router.get('/', verificarToken, verificarRol('ADMIN'), async (req, res, next) => {
  try { res.json(await reporteService.listar(req.query.estado as any)); }
  catch (error) { next(error); }
});

router.post('/', verificarToken, verificarRol('USUARIO'), async (req, res, next) => {
  try {
    const usuarioId = await obtenerUsuarioIdDelToken(req);
    const id = await reporteService.crear({ ...req.body, usuario_id: usuarioId });
    res.status(201).json({ id_reporte: id });
  } catch (error) { next(error); }
});

router.patch('/:id/estado', verificarToken, verificarRol('ADMIN'), async (req, res, next) => {
  try {
    await reporteService.cambiarEstado(Number(req.params.id), req.body.estado);
    res.json({ mensaje: 'Estado del reporte actualizado' });
  } catch (error) { next(error); }
});

export default router;