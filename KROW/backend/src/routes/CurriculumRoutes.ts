import { Router } from 'express';
import { curriculumService } from '../services/CurriculumService';
import { verificarToken } from '../middlewares/AuthMiddlewares';

const router = Router();

//busca el curriculum de un usuario en especifico 
router.get('/usuario/:usuarioId', verificarToken, async (req, res, next) => {
    try { res.json(await curriculumService.obtenerPorUsuario(Number(req.params.usuarioId))); }
    catch (error) { next(error); }
});

//guarda o actualiza el curriculum de un usuario 
router.put('/usuario/:usuarioId', verificarToken, async (req, res, next) => {
    try {
        await curriculumService.guardar(Number(req.params.usuarioId), req.body);
        res.json({ mensaje: 'Curriculum guardado' });
    } catch (error) { next(error); }
});

export default router;