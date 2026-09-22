import { Router } from 'express';
import { authService } from '../services/AuthService';
import { verificarToken } from '../middlewares/AuthMiddlewares';

const router = Router();

router.get('/me', verificarToken, async (req, res, next) => {
    try {
        const resultado = await authService.obtenerPerfilActual(req.user!.id_cuenta, req.user!.rol);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
});

router.post('/registro/usuario', async (req, res, next) => {
    try {
        const resultado = await authService.registrarUsuario(req.body);
        res.status(201).json(resultado);
    } catch (error) {
        next(error);
    }
});

router.post('/registro/empresa', async (req, res, next) => {
    try {
        const resultado = await authService.registrarEmpresa(req.body);
        res.status(201).json(resultado);
    } catch (error) {
        next(error);
    }
});

router.post('/login', async (req, res) => {
    try {
        const { correo, password } = req.body;
        const resultado = await authService.login(correo, password);
        res.json(resultado);
    } catch (error: any) {
        res.status(401).json({ mensaje: error.message });
    }
});

export default router;