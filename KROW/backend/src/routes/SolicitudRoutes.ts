import { Router } from 'express';
import { solicitudService } from '../services/SolicitudService';
import { verificarToken, verificarRol } from '../middlewares/AuthMiddlewares';
import {
  obtenerUsuarioIdDelToken,
  verificarPropietarioUsuario,
  verificarPropietarioPropuesta,
  verificarParticipanteSolicitud,
} from '../utils/resolverPerfil';

const router = Router();

//Obtiene todas las solicitudes realizadas por un usuario
//solo el propio usuario (o un ADMIN) puede ver su historial de solicitudes
router.get('/usuario/:usuarioId', verificarToken, async (req, res, next) => {
  try {
    await verificarPropietarioUsuario(req, Number(req.params.usuarioId));
    res.json(await solicitudService.listarPorUsuario(Number(req.params.usuarioId)));
  } catch (error) { next(error); }
});

//muestra las solicitudes que recibio la propuesta
//solo la empresa dueña de esa propuesta (o un ADMIN) puede verlas
router.get('/propuesta/:propuestaId', verificarToken, verificarRol('EMPRESA', 'ADMIN'), async (req, res, next) => {
  try {
    await verificarPropietarioPropuesta(req, Number(req.params.propuestaId));
    res.json(await solicitudService.listarPorPropuesta(Number(req.params.propuestaId)));
  } catch (error) { next(error); }
});

//crea una solicitud, es decir un usuario aplico a una propuesta
//el usuario_id NUNCA se toma del body: se deriva del token, así nadie puede aplicar en nombre de otro
router.post('/', verificarToken, verificarRol('USUARIO'), async (req, res, next) => {
  try {
    const usuarioId = await obtenerUsuarioIdDelToken(req);
    const id = await solicitudService.aplicar(usuarioId, req.body.propuesta_id);
    res.status(201).json({ id_solicitud: id });
  } catch (error) { next(error); }
});

//esta ruta permite cambiar el estado de una solicitud
//solo la empresa dueña de la propuesta asociada (o un ADMIN) puede resolverla
router.patch('/:id/estado', verificarToken, verificarRol('EMPRESA', 'ADMIN'), async (req, res, next) => {
  try {
    await verificarParticipanteSolicitud(req, Number(req.params.id));
    await solicitudService.cambiarEstado(Number(req.params.id), req.body.estado, req.body.comentario_empresa);
    res.json({ mensaje: 'Estado de solicitud actualizado' });
  } catch (error) { next(error); }
});

export default router;