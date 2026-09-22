import { Router } from 'express';
import { solicitudService } from '../services/SolicitudService';
import { verificarToken, verificarRol } from '../middlewares/AuthMiddlewares';

const router = Router();

//Obtiene todas las solicitudes realizadas por un usuario
router.get('/usuario/:usuarioId', verificarToken, async (req, res, next) => {
  try { res.json(await solicitudService.listarPorUsuario(Number(req.params.usuarioId))); }
  catch (error) { next(error); }
});

//muestra las solicitudes que recibio la propuesta 
router.get('/propuesta/:propuestaId', verificarToken, verificarRol('EMPRESA', 'ADMIN'), async (req, res, next) => {
  try { res.json(await solicitudService.listarPorPropuesta(Number(req.params.propuestaId))); }
  catch (error) { next(error); }
});

//crea una solicitud, es decir un usuario aplico a una propuesta 
router.post('/', verificarToken, verificarRol('USUARIO'), async (req, res, next) => {
  try {
    const id = await solicitudService.aplicar(req.body.usuario_id, req.body.propuesta_id);
    res.status(201).json({ id_solicitud: id });
  } catch (error) { next(error); }
});

//esta ruta permite cambiar el estado de una solicitud 
router.patch('/:id/estado', verificarToken, verificarRol('EMPRESA', 'ADMIN'), async (req, res, next) => {
  try {
    await solicitudService.cambiarEstado(Number(req.params.id), req.body.estado, req.body.comentario_empresa);
    res.json({ mensaje: 'Estado de solicitud actualizado' });
  } catch (error) { next(error); }
});

export default router;