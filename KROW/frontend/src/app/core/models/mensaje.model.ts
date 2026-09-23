export type EmisorMensaje = 'USUARIO' | 'EMPRESA';

export interface Mensaje {
    id_mensaje: number;
    conversacion_id: number;
    emisor: EmisorMensaje;
    contenido: string;
    fecha_envio: string;
    leido: boolean;
}