import { Router } from 'express';
import { mensajeService } from '../services/MensajeService';
import { verificarToken } from '../middlewares/AuthMiddlewares';

const router = Router();

//esta ruta obtiene todos los mensajes de una conversacion en especifico 
router.get('/conversacion/:conversacionId', verificarToken, async (req, res, next) => {
    try { res.json(await mensajeService.listar(Number(req.params.conversacionId))); }
    catch (error) { next(error); }
});

//crea o envia un mensaje nuevo 
router.post('/', verificarToken, async (req, res, next) => {
    try {
        const { conversacion_id, emisor, contenido } = req.body;
        const id = await mensajeService.enviar(conversacion_id, emisor, contenido);
        res.status(201).json({ id_mensaje: id });
    } catch (error) { next(error); }
});

//marca los mensajes como leidos dependiendo de la accion 
router.patch('/conversacion/:conversacionId/leidos', verificarToken, async (req, res, next) => {
    try {
        await mensajeService.marcarLeidos(Number(req.params.conversacionId), req.body.emisor_contrario);
        res.json({ mensaje: 'Mensajes marcados como leídos' });
    } catch (error) { next(error); }
});

export default router;