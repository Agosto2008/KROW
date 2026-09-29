// routes/VerificacionEmpresaRoutes.ts
import { Router } from 'express';
import { verificacionEmpresaService } from '../services/VerificacionEmpresaService';
import { verificarToken, verificarRol } from '../middlewares/AuthMiddlewares';
import { obtenerEmpresaIdDelToken, verificarPropietarioEmpresa } from '../utils/resolverPerfil';

const router = Router();

//COLA DEL ADMIN: TODAS las verificaciones con el nombre de la empresa resuelto
//(1 query; ?estado=PENDIENTE filtra la cola de revision)
router.get('/', verificarToken, verificarRol('ADMIN'), async (req, res, next) => {
    try {
        const estado = typeof req.query.estado === 'string' ? req.query.estado : undefined;
        res.json(await verificacionEmpresaService.listarTodas(estado));
    } catch (error) { next(error); }
});

//historial de verificaciones de UNA empresa (la propia empresa o un ADMIN)
router.get('/empresa/:empresaId', verificarToken, async (req, res, next) => {
    try {
        await verificarPropietarioEmpresa(req, Number(req.params.empresaId));
        res.json(await verificacionEmpresaService.listarPorEmpresa(Number(req.params.empresaId)));
    } catch (error) { next(error); }
});

router.post('/', verificarToken, verificarRol('EMPRESA'), async (req, res, next) => {
    try {
        const empresaId = await obtenerEmpresaIdDelToken(req);
        const id = await verificacionEmpresaService.solicitar(empresaId, req.body.tipo_verificacion);
        res.status(201).json({ id_verificacion: id });
    } catch (error) { next(error); }
});

router.patch('/:id/resolver', verificarToken, verificarRol('ADMIN'), async (req, res, next) => {
    try {
        const { estado, observacion } = req.body;
        await verificacionEmpresaService.resolver(Number(req.params.id), estado, req.user!.id_cuenta, observacion);
        res.json({ mensaje: 'Verificación resuelta' });
    } catch (error) { next(error); }
});

export default router;