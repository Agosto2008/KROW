import app from './app';
import { testConnection } from './database/Conexion';

const PORT = process.env.PORT || 3000;

async function iniciar() {
    await testConnection();
    app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
}

iniciar();