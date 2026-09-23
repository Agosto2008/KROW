import { Router } from 'express';
import { favoritoService } from '../services/FavoritoService';
import { verificarToken } from '../middlewares/AuthMiddlewares';
import { obtenerUsuarioIdDelToken, verificarPropietarioUsuario } from '../utils/resolverPerfil';

const router = Router();

//Obtiene la lista de favoritos de un usuario especifico
//solo el propio usuario (o un ADMIN) puede ver su lista de favoritos
router.get('/usuario/:usuarioId', verificarToken, async (req, res, next) => {
  try {
    await verificarPropietarioUsuario(req, Number(req.params.usuarioId));
    res.json(await favoritoService.listar(Number(req.params.usuarioId)));
  } catch (error) { next(error); }
});

//alterna opciones, es decir se puede agregar un favorito o eliminarlo si ya existe
//el usuario_id NUNCA se toma del body: se deriva del token
router.post('/toggle', verificarToken, async (req, res, next) => {
  try {
    const usuarioId = await obtenerUsuarioIdDelToken(req);
    const resultado = await favoritoService.alternar(usuarioId, req.body.propuesta_id);
    res.json({ mensaje: resultado });
  } catch (error) { next(error); }
});

export default router;