import { Router } from 'express';
import { usuarioService } from '../services/UsuarioService';
import { verificarToken } from '../middlewares/AuthMiddlewares';
import { verificarPropietarioUsuario, obtenerUsuarioIdDelToken } from '../utils/resolverPerfil';

const router = Router();

//busca un usuario por medio de su ID
//solo el dueo (o un ADMIN) ven el perfil COMPLETO; cualquier otro autenticado
//recibe una version publica (sin telefono, direccion ni fecha de nacimiento)
router.get('/:id', verificarToken, async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const esPropietario =
            req.user!.rol === 'ADMIN' ||
            (await obtenerUsuarioIdDelToken(req)) === id;

        const usuario = await usuarioService.obtenerPorId(id);
        if (esPropietario) return res.json(usuario);

        const { telefono, direccion, fecha_nacimiento, ...publico } = usuario;
        res.json(publico);
    }
    catch (error) { next(error); }
});

//PERFIL PUBLICO del candidato: nombre + CV resumido, sin telefono/direccion/
//fecha_nacimiento. Pensado para que la EMPRESA conozca a un postulante.
//Cualquier autenticado puede verlo: no contiene datos sensibles.
router.get('/:id/publico', verificarToken, async (req, res, next) => {
    try { res.json(await usuarioService.obtenerPublico(Number(req.params.id))); }
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