import app from './app';
import { testConnection } from './database/Conexion';
import { env } from './config/env';

async function iniciar() {
    await testConnection();
    app.listen(env.puerto, () => console.log(`Servidor corriendo en http://localhost:${env.puerto}`));
}

iniciar();
// inicia la conexion a la base de datos y levanta el servidor