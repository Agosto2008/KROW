import { Router } from 'express';
import { usuarioService } from '../services/UsuarioService';
import { verificarToken } from '../middlewares/AuthMiddlewares';

const router = Router();

router.get('/:id', verificarToken, async (req, res, next) => {
    try { res.json(await usuarioService.obtenerPorId(Number(req.params.id))); }
    catch (error) { next(error); }
});

router.put('/:id', verificarToken, async (req, res, next) => {
    try {
        await usuarioService.actualizar(Number(req.params.id), req.body);
        res.json({ mensaje: 'Usuario actualizado' });
    } catch (error) { next(error); }
});

router.delete('/:id', verificarToken, async (req, res, next) => {
    try {
        await usuarioService.eliminar(Number(req.params.id));
        res.json({ mensaje: 'Usuario eliminado' });
    } catch (error) { next(error); }
});

export default router;