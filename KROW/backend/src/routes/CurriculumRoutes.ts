import { Router } from 'express';
import { curriculumService } from '../services/CurriculumService';
import { verificarToken } from '../middlewares/AuthMiddlewares';

const router = Router();

router.get('/usuario/:usuarioId', verificarToken, async (req, res, next) => {
    try { res.json(await curriculumService.obtenerPorUsuario(Number(req.params.usuarioId))); }
    catch (error) { next(error); }
});

router.put('/usuario/:usuarioId', verificarToken, async (req, res, next) => {
    try {
        await curriculumService.guardar(Number(req.params.usuarioId), req.body);
        res.json({ mensaje: 'Curriculum guardado' });
    } catch (error) { next(error); }
});

export default router;