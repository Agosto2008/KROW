export type TipoNotificacion =
  | 'MENSAJE'
  | 'SOLICITUD'
  | 'ENTREVISTA'
  | 'ACEPTACION'
  | 'RECHAZO'
  | 'SISTEMA';

export interface Notificacion {
  id_notificacion: number;
  usuario_id: number;
  titulo: string | null;
  mensaje: string | null;
  tipo: TipoNotificacion | null;
  leida: boolean;
  fecha: string; // ISO datetime
}