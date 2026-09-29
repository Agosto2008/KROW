import { Router } from 'express';
import { curriculumService } from '../services/CurriculumService';
import { solicitudRepository } from '../repositories/SolicitudRepository';
import { verificarToken } from '../middlewares/AuthMiddlewares';
import { verificarPropietarioUsuario, obtenerUsuarioIdDelToken, obtenerEmpresaIdDelToken } from '../utils/resolverPerfil';

const router = Router();

//busca el curriculum de un usuario en especifico
//el dueno y el ADMIN ven todo; una empresa solo puede verlo si existe una
//solicitud suya hacia ese candidato (no todos los CVs de la plataforma)
router.get('/usuario/:usuarioId', verificarToken, async (req, res, next) => {
    try {
        const usuarioId = Number(req.params.usuarioId);
        const rol = req.user!.rol;

        if (rol !== 'ADMIN') {
            const esDueno = rol === 'USUARIO' && (await obtenerUsuarioIdDelToken(req)) === usuarioId;

            if (!esDueno) {
                if (rol !== 'EMPRESA') {
                    return res.status(403).json({ mensaje: 'No tienes permiso para ver este curriculum' });
                }
                const empresaId = await obtenerEmpresaIdDelToken(req);
                const relacionada = await solicitudRepository.existeSolicitudDeEmpresa(empresaId, usuarioId);
                if (!relacionada) {
                    return res.status(403).json({ mensaje: 'Solo puedes ver el curriculum de candidatos que postularon a tus ofertas' });
                }
            }
        }

        res.json(await curriculumService.obtenerPorUsuario(usuarioId));
    }
    catch (error) { next(error); }
});

//guarda o actualiza el curriculum de un usuario
//solo el propio usuario (o un ADMIN) puede editar este curriculum
router.put('/usuario/:usuarioId', verificarToken, async (req, res, next) => {
    try {
        await verificarPropietarioUsuario(req, Number(req.params.usuarioId));
        await curriculumService.guardar(Number(req.params.usuarioId), req.body);
        res.json({ mensaje: 'Curriculum guardado' });
    } catch (error) { next(error); }
});

export default router;