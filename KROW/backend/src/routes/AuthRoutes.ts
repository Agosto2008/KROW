import { Router } from 'express';
import { authService } from '../services/AuthService';

const router = Router();

//redirige a la ruta para registrar un nuevo usuario 
router.post('/registro/usuario', async (req, res, next) => {
    try {
        const resultado = await authService.registrarUsuario(req.body);
        res.status(201).json(resultado);
    } catch (error) {
        next(error);
    }
});

//redirige a registrar una nueva empresa
router.post('/registro/empresa', async (req, res, next) => {
    try {
        const resultado = await authService.registrarEmpresa(req.body);
        res.status(201).json(resultado);
    } catch (error) {
        next(error);
    }
});

//este metodo maneja el inicio de sesion 
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