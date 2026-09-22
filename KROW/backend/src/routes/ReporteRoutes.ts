import { Router } from 'express';
import { reporteService } from '../services/ReporteService';
import { verificarToken, verificarRol } from '../middlewares/AuthMiddlewares';

const router = Router();

//lista todos los reportes existentes
router.get('/', verificarToken, verificarRol('ADMIN'), async (req, res, next) => {
  try { res.json(await reporteService.listar(req.query.estado as any)); }
  catch (error) { next(error); }
});

//esta ruta se encarga de crear un nuevo reporte
router.post('/', verificarToken, async (req, res, next) => {
  try {
    const id = await reporteService.crear(req.body);
    res.status(201).json({ id_reporte: id });
  } catch (error) { next(error); }
});

//cambia el estado de un reporte dependiendo de la indicacion 
router.patch('/:id/estado', verificarToken, verificarRol('ADMIN'), async (req, res, next) => {
  try {
    await reporteService.cambiarEstado(Number(req.params.id), req.body.estado);
    res.json({ mensaje: 'Estado del reporte actualizado' });
  } catch (error) { next(error); }
});

export default router;