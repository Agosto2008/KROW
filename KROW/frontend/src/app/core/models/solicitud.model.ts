import {
  TipoPropuesta,
  Modalidad,
  EstadoPropuesta,
  EmpresaResumen,
} from './propuesta.model';

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

/**
 * GET /solicitudes/usuario/:id → lo que ve el CANDIDATO:
 * su postulación + la oferta y la empresa en la que se postuló.
 */
export interface SolicitudConPropuesta extends Solicitud {
  propuesta_nombre: string;
  propuesta_tipo: TipoPropuesta;
  propuesta_modalidad: Modalidad;
  propuesta_ubicacion?: string | null;
  propuesta_estado: EstadoPropuesta;
  empresa: EmpresaResumen;
}

/**
 * GET /solicitudes/empresa/:id → lo que ve la EMPRESA:
 * la postulación + la oferta + el candidato (sin datos sensibles).
 */
export interface SolicitudConCandidato extends Solicitud {
  propuesta_nombre: string;
  propuesta_tipo: TipoPropuesta;
  propuesta_modalidad: Modalidad;
  propuesta_estado: EstadoPropuesta;
  id_usuario: number;
  primer_nombre: string;
  segundo_nombre?: string | null;
  primer_apellido: string;
  segundo_apellido?: string | null;
  candidato_fotografia?: string | null;
  descripcion_personal?: string | null;
}
