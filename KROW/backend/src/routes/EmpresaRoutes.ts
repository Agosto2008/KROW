import { Router } from 'express';
import { empresaService } from '../services/EmpresaService';
import { verificarToken, verificarRol } from '../middlewares/AuthMiddleware';

const router = Router();

router.get('/', async (req, res, next) => {
  try { res.json(await empresaService.listar()); }
  catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try { res.json(await empresaService.obtenerPorId(Number(req.params.id))); }
  catch (error) { next(error); }
});

router.put('/:id', verificarToken, verificarRol('EMPRESA', 'ADMIN'), async (req, res, next) => {
  try {
    await empresaService.actualizar(Number(req.params.id), req.body);
    res.json({ mensaje: 'Empresa actualizada' });
  } catch (error) { next(error); }
});

export default router;