import { TipoPropuesta, EmpresaResumen } from './propuesta.model';

export type ModalidadEntrevista = 'PRESENCIAL' | 'VIRTUAL' | 'TELEFONICA';

export type EstadoEntrevista =
  | 'PROGRAMADA'
  | 'REPROGRAMADA'
  | 'REALIZADA'
  | 'CANCELADA';

export interface Entrevista {
  id_entrevista: number;
  solicitud_id: number;
  fecha: string | null; // ISO date
  hora: string | null;
  modalidad: ModalidadEntrevista | null;
  ubicacion: string | null;
  enlace: string | null;
  estado: EstadoEntrevista;
  observaciones: string | null;
}

/** GET /entrevistas/usuario/:id → lo que ve el candidato */
export interface EntrevistaConPropuesta extends Entrevista {
  id_propuesta: number;
  propuesta_nombre: string;
  propuesta_tipo: TipoPropuesta;
  empresa: EmpresaResumen;
}

/** GET /entrevistas/empresa/:id → lo que ve la empresa */
export interface EntrevistaConCandidato extends Entrevista {
  id_propuesta: number;
  propuesta_nombre: string;
  id_usuario: number;
  primer_nombre: string;
  segundo_nombre?: string | null;
  primer_apellido: string;
  segundo_apellido?: string | null;
  candidato_fotografia?: string | null;
}
