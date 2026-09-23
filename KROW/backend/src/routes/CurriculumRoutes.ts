import { Router } from 'express';
import { curriculumService } from '../services/CurriculumService';
import { verificarToken } from '../middlewares/AuthMiddlewares';
import { verificarPropietarioUsuario } from '../utils/resolverPerfil';

const router = Router();

//busca el curriculum de un usuario en especifico
//lo puede ver cualquier cuenta autenticada (ej. una empresa revisando a un candidato)
router.get('/usuario/:usuarioId', verificarToken, async (req, res, next) => {
    try { res.json(await curriculumService.obtenerPorUsuario(Number(req.params.usuarioId))); }
    catch (error) { next(error); }
});

//guarda o actualiza el curriculum de un usuario
//solo el propio usuario (o un ADMIN) puede editar este curriculum
router.put('/usuario/:usuarioId', verificarToken, async (req, res, next) => {
    try {
        await verificarPropietarioUsuario(req, Number(req.params.usuarioId));
        await curriculumService.guardar(Number(req.params.usuarioId), req.body);
        res.json({ mensaje: 'Curriculum guardado' });
    } catch (error) { next(error); }
});

export default router;