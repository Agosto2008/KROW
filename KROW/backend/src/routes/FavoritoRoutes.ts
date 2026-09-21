import { Router } from 'express';
import { favoritoService } from '../services/FavoritoService';
import { verificarToken } from '../middlewares/AuthMiddleware';

const router = Router();

router.get('/usuario/:usuarioId', verificarToken, async (req, res, next) => {
  try { res.json(await favoritoService.listar(Number(req.params.usuarioId))); }
  catch (error) { next(error); }
});

router.post('/toggle', verificarToken, async (req, res, next) => {
  try {
    const resultado = await favoritoService.alternar(req.body.usuario_id, req.body.propuesta_id);
    res.json({ mensaje: resultado });
  } catch (error) { next(error); }
});

export default router;