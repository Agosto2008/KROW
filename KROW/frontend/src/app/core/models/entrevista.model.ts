export type ModalidadEntrevista = 'PRESENCIAL' | 'VIRTUAL' | 'TELEFONICA';
export type EstadoEntrevista = 'PROGRAMADA' | 'REPROGRAMADA' | 'REALIZADA' | 'CANCELADA';

export interface Entrevista {
    id_entrevista: number;
    solicitud_id: number;
    fecha: string | null;
    hora: string | null;
    modalidad: ModalidadEntrevista | null;
    ubicacion: string | null;
    enlace: string | null;
    estado: EstadoEntrevista;
    observaciones: string | null;
}