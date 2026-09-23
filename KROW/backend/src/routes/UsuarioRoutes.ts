import { Router } from 'express';
import { usuarioService } from '../services/UsuarioService';
import { verificarToken } from '../middlewares/AuthMiddlewares';
import { verificarPropietarioUsuario } from '../utils/resolverPerfil';

const router = Router();

//busca un usuario por medio de su ID
router.get('/:id', verificarToken, async (req, res, next) => {
    try { res.json(await usuarioService.obtenerPorId(Number(req.params.id))); }
    catch (error) { next(error); }
});

//modifica los datos de un usuario existente
//solo el dueño de la cuenta (o un ADMIN) puede editar este perfil
router.put('/:id', verificarToken, async (req, res, next) => {
    try {
        await verificarPropietarioUsuario(req, Number(req.params.id));
        await usuarioService.actualizar(Number(req.params.id), req.body);
        res.json({ mensaje: 'Usuario actualizado' });
    } catch (error) { next(error); }
});

//elimina a un usuario en especifico
//solo el dueño de la cuenta (o un ADMIN) puede eliminar este perfil
router.delete('/:id', verificarToken, async (req, res, next) => {
    try {
        await verificarPropietarioUsuario(req, Number(req.params.id));
        await usuarioService.eliminar(Number(req.params.id));
        res.json({ mensaje: 'Usuario eliminado' });
    } catch (error) { next(error); }
});

export default router;