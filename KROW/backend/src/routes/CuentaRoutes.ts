import { Router } from 'express';
import { cuentaService } from '../services/CuentaService';
import { verificarToken, verificarRol } from '../middlewares/AuthMiddlewares';
import { AppError } from '../utils/AppError';

const router = Router();

//se obtiene una cuenta por medio de su ID
//solo el dueño de la cuenta o un ADMIN pueden verla
router.get('/:id', verificarToken, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (req.user!.rol !== 'ADMIN' && req.user!.id_cuenta !== id) {
      throw new AppError('No tienes permiso para ver esta cuenta', 403);
    }
    res.json(await cuentaService.obtenerPorId(id));
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