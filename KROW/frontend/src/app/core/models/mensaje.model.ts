export type Emisor = 'USUARIO' | 'EMPRESA';

export interface Mensaje {
  id_mensaje: number;
  conversacion_id: number;
  emisor: Emisor;
  contenido: string;
  fecha_envio: string; // ISO datetime
  leido: boolean;
}