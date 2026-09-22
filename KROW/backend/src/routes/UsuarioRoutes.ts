import { Router } from 'express';
import { usuarioService } from '../services/UsuarioService';
import { verificarToken } from '../middlewares/AuthMiddlewares';
import { verificarPropietarioUsuario } from '../utils/resolverPerfil';

const router = Router();

router.get('/:id', verificarToken, async (req, res, next) => {
    try { res.json(await usuarioService.obtenerPorId(Number(req.params.id))); }
    catch (error) { next(error); }
});

// Solo el dueño de la cuenta (o un ADMIN) puede editar/eliminar su perfil de usuario
router.put('/:id', verificarToken, async (req, res, next) => {
    try {
        await verificarPropietarioUsuario(req, Number(req.params.id));
        await usuarioService.actualizar(Number(req.params.id), req.body);
        res.json({ mensaje: 'Usuario actualizado' });
    } catch (error) { next(error); }
});

router.delete('/:id', verificarToken, async (req, res, next) => {
    try {
        await verificarPropietarioUsuario(req, Number(req.params.id));
        await usuarioService.eliminar(Number(req.params.id));
        res.json({ mensaje: 'Usuario eliminado' });
    } catch (error) { next(error); }
});

export default router;