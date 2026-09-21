import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/AuthRoute';
import cuentaRoutes from './routes/CuentaRoute';
import usuarioRoutes from './routes/UsuarioRoutes';
import empresaRoutes from './routes/EmpresaRoute';
import propuestaRoutes from './routes/PropuestaRoute';
import solicitudRoutes from './routes/SolicitudRoute';
import curriculumRoutes from './routes/CurriculumRoute';
import conversacionRoutes from './routes/ConversacionRoute';
import mensajeRoutes from './routes/MensajeRoute';
import entrevistaRoutes from './routes/EntrevistaRoute';
import notificacionRoutes from './routes/NorificacionRoute';
import favoritoRoutes from './routes/FavoritoRoute';
import verificacionEmpresaRoutes from './routes/VerificacionEmpresaRoute';
import reporteRoutes from './routes/ReporteRoute';

import { errorHandler, rutaNoEncontrada } from './middlewares/error.middleware';

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