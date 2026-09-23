import { EstadoSolicitud } from './solicitud.model';
import { EmpresaResumen } from './propuesta.model';

export interface Conversacion {
  id_conversacion: number;
  solicitud_id: number;
  fecha_creacion: string; // ISO datetime
  activa: boolean;
}

/** Otro lado de la conversación: la empresa (para el candidato) o el candidato (para la empresa) */
export interface CandidatoResumen {
  id_usuario: number;
  nombre: string;
  fotografia?: string | null;
}

/**
 * GET /conversaciones → sidebar de chats en 1 sola query: el otro lado,
 * la oferta, el último mensaje y los no leídos.
 */
export interface ConversacionResumen extends Conversacion {
  solicitud_estado: EstadoSolicitud;
  id_propuesta: number;
  propuesta_nombre: string;
  empresa?: EmpresaResumen | null; // presente cuando el que mira es el candidato
  candidato?: CandidatoResumen | null; // presente cuando el que mira es la empresa
  ultimo_mensaje?: string | null;
  ultimo_fecha?: string | null;
  no_leidos: number;
}
