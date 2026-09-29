import { Router } from 'express';
import { mensajeService } from '../services/MensajeService';
import { verificarToken, verificarRol } from '../middlewares/AuthMiddlewares';
import { verificarParticipanteConversacion } from '../utils/resolverPerfil';

const router = Router();

//esta ruta obtiene todos los mensajes de una conversacion en especifico
//solo alguno de los dos participantes (o un ADMIN) puede leerlos
router.get('/conversacion/:conversacionId', verificarToken, async (req, res, next) => {
    try {
        await verificarParticipanteConversacion(req, Number(req.params.conversacionId));
        res.json(await mensajeService.listar(Number(req.params.conversacionId)));
    } catch (error) { next(error); }
});

//crea o envia un mensaje nuevo
//el "emisor" NUNCA se toma del body (cualquiera podria mandar mensajes fingiendo ser la
//empresa o el usuario contrario): se deriva de quien realmente participa en la conversacion
//solo USUARIO/EMPRESA pueden escribir: antes un ADMIN se insertaba como emisor='EMPRESA'
router.post('/', verificarToken, verificarRol('USUARIO', 'EMPRESA'), async (req, res, next) => {
    try {
        const { conversacion_id, contenido } = req.body;
        const emisor = await verificarParticipanteConversacion(req, conversacion_id);
        const id = await mensajeService.enviar(conversacion_id, emisor, contenido);
        res.status(201).json({ id_mensaje: id });
    } catch (error) { next(error); }
});

//marca como leidos los mensajes del lado contrario de la conversacion
//el emisor_contrario tampoco se toma del body: se calcula a partir de quien soy yo en la conversacion
router.patch('/conversacion/:conversacionId/leidos', verificarToken, async (req, res, next) => {
    try {
        const conversacionId = Number(req.params.conversacionId);
        const emisorPropio = await verificarParticipanteConversacion(req, conversacionId);
        const emisorContrario = emisorPropio === 'USUARIO' ? 'EMPRESA' : 'USUARIO';
        await mensajeService.marcarLeidos(conversacionId, emisorContrario);
        res.json({ mensaje: 'Mensajes marcados como leídos' });
    } catch (error) { next(error); }
});

export default router;