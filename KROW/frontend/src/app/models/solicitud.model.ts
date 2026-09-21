export type EstadoSolicitud =
  | 'PENDIENTE'
  | 'EN_REVISION'
  | 'ACEPTADA'
  | 'RECHAZADA'
  | 'CANCELADA';

export interface Solicitud {
  id_solicitud: number;
  usuario_id: number;
  propuesta_id: number;
  fecha: string; // ISO datetime
  estado: EstadoSolicitud;
  comentario_empresa?: string;
}