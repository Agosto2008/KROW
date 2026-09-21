import { Router } from 'express';
import { verificacionEmpresaService } from '../services/VerificacionEmpresaService';
import { verificarToken, verificarRol } from '../middlewares/AuthMiddlewares';

const router = Router();

router.get('/empresa/:empresaId', verificarToken, async (req, res, next) => {
    try { res.json(await verificacionEmpresaService.listarPorEmpresa(Number(req.params.empresaId))); }
    catch (error) { next(error); }
});

router.post('/', verificarToken, verificarRol('EMPRESA'), async (req, res, next) => {
    try {
        const id = await verificacionEmpresaService.solicitar(req.body.empresa_id, req.body.tipo_verificacion);
        res.status(201).json({ id_verificacion: id });
    } catch (error) { next(error); }
});

router.patch('/:id/resolver', verificarToken, verificarRol('ADMIN'), async (req, res, next) => {
    try {
        const { empresa_id, estado, administrador, observacion } = req.body;
        await verificacionEmpresaService.resolver(Number(req.params.id), empresa_id, estado, administrador, observacion);
        res.json({ mensaje: 'Verificación resuelta' });
    } catch (error) { next(error); }
});

export default router;