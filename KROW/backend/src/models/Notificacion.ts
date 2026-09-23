export type TipoNotificacion =
  | 'MENSAJE'
  | 'SOLICITUD'
  | 'ENTREVISTA'
  | 'ACEPTACION'
  | 'RECHAZO'
  | 'SISTEMA';

export interface Notificacion {
  id_notificacion: number;
  /** Destinatario: cuenta de un USUARIO o de una EMPRESA */
  cuenta_id: number;
  titulo: string | null;
  mensaje: string | null;
  tipo: TipoNotificacion | null;
  leida: boolean;
  fecha: Date;
}
