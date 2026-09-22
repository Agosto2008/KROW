import { Router } from 'express';
import { propuestaService } from '../services/PropuestaService';
import { verificarToken, verificarRol } from '../middlewares/AuthMiddlewares';
import { obtenerEmpresaIdDelToken, verificarPropietarioPropuesta } from '../utils/resolverPerfil';

const router = Router();

//Esta ruta obtiene las propuestas disponibles
router.get('/', async (req, res, next) => {
    try { res.json(await propuestaService.listar(req.query)); }
    catch (error) { next(error); }
});

//esta ruta se encarga de buscar una propuesta en especifica
router.get('/:id', async (req, res, next) => {
    try { res.json(await propuestaService.obtenerPorId(Number(req.params.id))); }
    catch (error) { next(error); }
});

//crea una propuesta para la empresa autenticada. El empresa_id NUNCA se toma del body
//(cualquiera podría mandar el id de otra empresa); se deriva del token.
router.post('/', verificarToken, verificarRol('EMPRESA'), async (req, res, next) => {
    try {
        const empresaId = await obtenerEmpresaIdDelToken(req);
        const id = await propuestaService.crear(empresaId, req.body);
        res.status(201).json({ id_propuesta: id });
    } catch (error) { next(error); }
});

//se encarga de actualizar una propuesta existente, solo si es dueña de la misma (o ADMIN)
router.put('/:id', verificarToken, verificarRol('EMPRESA', 'ADMIN'), async (req, res, next) => {
    try {
        await verificarPropietarioPropuesta(req, Number(req.params.id));
        await propuestaService.actualizar(Number(req.params.id), req.body);
        res.json({ mensaje: 'Propuesta actualizada' });
    } catch (error) { next(error); }
});

//Sirve para eliminar una propuesta existente, solo si es dueña de la misma (o ADMIN)
router.delete('/:id', verificarToken, verificarRol('EMPRESA', 'ADMIN'), async (req, res, next) => {
    try {
        await verificarPropietarioPropuesta(req, Number(req.params.id));
        await propuestaService.eliminar(Number(req.params.id));
        res.json({ mensaje: 'Propuesta eliminada' });
    } catch (error) { next(error); }
});

export default router;