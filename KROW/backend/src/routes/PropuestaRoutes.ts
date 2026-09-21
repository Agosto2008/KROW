import { Router } from 'express';
import { propuestaService } from '../services/PropuestaService';
import { verificarToken, verificarRol } from '../middlewares/AuthMiddlewares';

const router = Router();

router.get('/', async (req, res, next) => {
    try { res.json(await propuestaService.listar(req.query)); }
    catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
    try { res.json(await propuestaService.obtenerPorId(Number(req.params.id))); }
    catch (error) { next(error); }
});

// req.user.id_cuenta viene del token; se resuelve a id_empresa dentro del service si lo prefieres así
router.post('/', verificarToken, verificarRol('EMPRESA'), async (req, res, next) => {
    try {
        const id = await propuestaService.crear(req.body.empresa_id, req.body);
        res.status(201).json({ id_propuesta: id });
    } catch (error) { next(error); }
});

router.put('/:id', verificarToken, verificarRol('EMPRESA', 'ADMIN'), async (req, res, next) => {
    try {
        await propuestaService.actualizar(Number(req.params.id), req.body);
        res.json({ mensaje: 'Propuesta actualizada' });
    } catch (error) { next(error); }
});

router.delete('/:id', verificarToken, verificarRol('EMPRESA', 'ADMIN'), async (req, res, next) => {
    try {
        await propuestaService.eliminar(Number(req.params.id));
        res.json({ mensaje: 'Propuesta eliminada' });
    } catch (error) { next(error); }
});

export default router;