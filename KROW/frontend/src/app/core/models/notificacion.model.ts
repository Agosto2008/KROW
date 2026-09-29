export type TipoNotificacion =
  | 'MENSAJE'
  | 'SOLICITUD'
  | 'ENTREVISTA'
  | 'ACEPTACION'
  | 'RECHAZO'
  | 'SISTEMA';

/**
 * Destinatario genérico: `cuenta_id` apunta a la Cuenta (USUARIO o EMPRESA),
 * no al perfil. Así la campana del navbar sirve para ambos roles.
 */
export interface Notificacion {
  id_notificacion: number;
  cuenta_id: number;
  titulo: string | null;
  mensaje: string | null;
  tipo: TipoNotificacion | null;
  leida: boolean;
  fecha: string; // ISO datetime
}
