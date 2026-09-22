export type ModalidadEntrevista = 'PRESENCIAL' | 'VIRTUAL' | 'TELEFONICA';
export type EstadoEntrevista = 'PROGRAMADA' | 'REPROGRAMADA' | 'REALIZADA' | 'CANCELADA';

export interface Entrevista {
  id_entrevista: number;
  solicitud_id: number;
  fecha?: string; // ISO date
  hora?: string; // HH:mm:ss
  modalidad?: ModalidadEntrevista;
  ubicacion?: string;
  enlace?: string;
  estado: EstadoEntrevista;
  observaciones?: string;
}