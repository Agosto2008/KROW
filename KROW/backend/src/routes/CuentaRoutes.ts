import { Router } from 'express';
import { cuentaService } from '../services/CuentaService';
import { verificarToken, verificarRol } from '../middlewares/AuthMiddlewares';

const router = Router();

router.get('/:id', verificarToken, async (req, res, next) => {
  try {
    res.json(await cuentaService.obtenerPorId(Number(req.params.id)));
  } catch (error) { next(error); }
});

// Solo ADMIN puede suspender/activar cuentas
router.patch('/:id/estado', verificarToken, verificarRol('ADMIN'), async (req, res, next) => {
  try {
    await cuentaService.cambiarEstado(Number(req.params.id), req.body.estado);
    res.json({ mensaje: 'Estado actualizado' });
  } catch (error) { next(error); }
});

export default router;