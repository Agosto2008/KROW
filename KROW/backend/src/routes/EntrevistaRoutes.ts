import { Router } from 'express';
import { entrevistaService } from '../services/EntrevistaService';
import { verificarToken, verificarRol } from '../middlewares/AuthMiddlewares';
import { verificarPropietarioUsuario, verificarPropietarioEmpresa, verificarParticipanteSolicitud, verificarParticipanteEntrevista } from '../utils/resolverPerfil';

const router = Router();

//TODAS las entrevistas del candidato (con propuesta y empresa, 1 query)
//solo el propio usuario (o un ADMIN) puede verlas
router.get('/usuario/:usuarioId', verificarToken, async (req, res, next) => {
  try {
    await verificarPropietarioUsuario(req, Number(req.params.usuarioId));
    res.json(await entrevistaService.listarPorUsuario(Number(req.params.usuarioId)));
  } catch (error) { next(error); }
});

//TODAS las entrevistas de las ofertas de una empresa (con candidato, 1 query)
//solo la propia empresa (o un ADMIN) puede verlas
router.get('/empresa/:empresaId', verificarToken, verificarRol('EMPRESA', 'ADMIN'), async (req, res, next) => {
  try {
    await verificarPropietarioEmpresa(req, Number(req.params.empresaId));
    res.json(await entrevistaService.listarPorEmpresa(Number(req.params.empresaId)));
  } catch (error) { next(error); }
});

//obtiene todas las entrevistas relacionadas con una solicitud
//solo los participantes de esa solicitud (o un ADMIN) pueden verlas
router.get('/solicitud/:solicitudId', verificarToken, async (req, res, next) => {
  try {
    await verificarParticipanteSolicitud(req, Number(req.params.solicitudId));
    res.json(await entrevistaService.listarPorSolicitud(Number(req.params.solicitudId)));
  } catch (error) { next(error); }
});

//crea/programa una nueva entrevista
//solo la empresa dueña de la solicitud asociada (o un ADMIN) puede programarla
router.post('/', verificarToken, verificarRol('EMPRESA', 'ADMIN'), async (req, res, next) => {
  try {
    await verificarParticipanteSolicitud(req, Number(req.body.solicitud_id));
    const id = await entrevistaService.programar(req.body);
    res.status(201).json({ id_entrevista: id });
  } catch (error) { next(error); }
});

//reprograma una entrevista existente
//solo la empresa dueña de la solicitud asociada a esta entrevista (o un ADMIN) puede reprogramarla
router.put('/:id/reprogramar', verificarToken, verificarRol('EMPRESA', 'ADMIN'), async (req, res, next) => {
  try {
    await verificarParticipanteEntrevista(req, Number(req.params.id));
    await entrevistaService.reprogramar(Number(req.params.id), req.body);
    res.json({ mensaje: 'Entrevista reprogramada' });
  } catch (error) { next(error); }
});

//cambia el estado de una entrevista
//solo alguno de los dos participantes de la solicitud asociada (o un ADMIN) puede cambiarlo
router.patch('/:id/estado', verificarToken, verificarRol('EMPRESA', 'USUARIO', 'ADMIN'), async (req, res, next) => {
  try {
    await verificarParticipanteEntrevista(req, Number(req.params.id));
    await entrevistaService.cambiarEstado(Number(req.params.id), req.body.estado);
    res.json({ mensaje: 'Estado de entrevista actualizado' });
  } catch (error) { next(error); }
});

export default router;