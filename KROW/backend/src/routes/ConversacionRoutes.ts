import { Router } from 'express';
import { conversacionService } from '../services/ConversacionService';
import { verificarToken } from '../middlewares/AuthMiddlewares';
import { verificarParticipanteSolicitud, verificarParticipanteConversacion } from '../utils/resolverPerfil';

const router = Router();

//SIDEBAR DE CHATS: todas las conversaciones de la cuenta autenticada
//con la otra parte, la propuesta, el ultimo mensaje y los no leidos (1 query)
router.get('/', verificarToken, async (req, res, next) => {
  try {
    res.json(await conversacionService.listarPropias(req.user!.id_cuenta, req.user!.rol));
  } catch (error) { next(error); }
});

//muestra la conversacion asociada a una solicitud
//solo el usuario o la empresa que participan en esa solicitud (o un ADMIN) pueden verla
router.get('/solicitud/:solicitudId', verificarToken, async (req, res, next) => {
  try {
    await verificarParticipanteSolicitud(req, Number(req.params.solicitudId));
    res.json(await conversacionService.obtenerPorSolicitud(Number(req.params.solicitudId)));
  } catch (error) { next(error); }
});

//esta ruta se encarga de cerrar una conversacion
//solo alguno de los dos participantes (o un ADMIN) puede cerrarla
router.patch('/:id/cerrar', verificarToken, async (req, res, next) => {
  try {
    await verificarParticipanteConversacion(req, Number(req.params.id));
    await conversacionService.cerrar(Number(req.params.id));
    res.json({ mensaje: 'Conversación cerrada' });
  } catch (error) { next(error); }
});

export default router;