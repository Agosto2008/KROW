import { Router } from 'express';
import { authService } from '../services/AuthService';
import { verificarToken } from '../middlewares/AuthMiddlewares';
import { limitarIntentos, limpiarIntentos } from '../middlewares/RateLimit';

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
//limitado contra fuerza bruta (10 intentos / 15 min por IP+correo)
router.post('/login', limitarIntentos, async (req, res, next) => {
    try {
        const { correo, password } = req.body;
        const resultado = await authService.login(correo, password);
        limpiarIntentos(req); // login exitoso: reinicia el contador
        res.json(resultado);
    } catch (error) {
        next(error);
    }
});

//cambia la password de la cuenta autenticada
//requiere la password actual (nadie puede cambiarsela sin conocerla)
router.post('/cambiar-password', verificarToken, async (req, res, next) => {
    try {
        const resultado = await authService.cambiarPassword(
            req.user!.id_cuenta,
            req.body.password_actual,
            req.body.password_nueva
        );
        res.json(resultado);
    } catch (error) {
        next(error);
    }
});

//devuelve la cuenta y el perfil (usuario/empresa) del token actual, para que el front
//sepa quien esta logueado sin tener que volver a pedir credenciales
router.get('/me', verificarToken, async (req, res, next) => {
    try {
        const resultado = await authService.obtenerPerfil(req.user!.id_cuenta, req.user!.rol);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
});

export default router;