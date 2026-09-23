export type TipoPropuesta = 'PREPRACTICA' | 'PRACTICA' | 'PASANTIA' | 'TRABAJO';
export type ModalidadPropuesta = 'PRESENCIAL' | 'REMOTO' | 'HIBRIDO';
export type EstadoPropuesta = 'ACTIVA' | 'PAUSADA' | 'CERRADA' | 'VENCIDA';

export interface Propuesta {
    id_propuesta: number;
    empresa_id: number;
    nombre: string;
    descripcion: string;
    tipo: TipoPropuesta;
    modalidad: ModalidadPropuesta;
    pago: number | null;
    ubicacion: string | null;
    vacantes: number;
    fecha_publicacion: string;
    fecha_vencimiento: string | null;
    estado: EstadoPropuesta;
}