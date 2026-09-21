import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/AuthRoutes';
import cuentaRoutes from './routes/CuentaRoutes';
import usuarioRoutes from './routes/UsuarioRoutes';
import empresaRoutes from './routes/EmpresaRoutes';
import propuestaRoutes from './routes/PropuestaRoutes';
import solicitudRoutes from './routes/SolicitudRoutes';
import curriculumRoutes from './routes/CurriculumRoutes';
import conversacionRoutes from './routes/ConversacionRoutes';
import mensajeRoutes from './routes/MensajeRoutes';
import entrevistaRoutes from './routes/EntrevistaRoutes';
import notificacionRoutes from './routes/NotificacionRoutes';
import favoritoRoutes from './routes/FavoritoRoutes';
import verificacionEmpresaRoutes from './routes/VerificacionEmpresaRoutes';
import reporteRoutes from './routes/ReporteRoutes';

import { errorHandler, rutaNoEncontrada } from './middlewares/ErrorMiddleware';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:4200' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/cuentas', cuentaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/empresas', empresaRoutes);
app.use('/api/propuestas', propuestaRoutes);
app.use('/api/solicitudes', solicitudRoutes);
app.use('/api/curriculums', curriculumRoutes);
app.use('/api/conversaciones', conversacionRoutes);
app.use('/api/mensajes', mensajeRoutes);
app.use('/api/entrevistas', entrevistaRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/favoritos', favoritoRoutes);
app.use('/api/verificaciones-empresa', verificacionEmpresaRoutes);
app.use('/api/reportes', reporteRoutes);

app.use(rutaNoEncontrada);
app.use(errorHandler); // siempre al final

export default app;