export type TipoPropuesta = 'PREPRACTICA' | 'PRACTICA' | 'PASANTIA' | 'TRABAJO';
export type Modalidad = 'PRESENCIAL' | 'REMOTO' | 'HIBRIDO';
export type EstadoPropuesta = 'ACTIVA' | 'PAUSADA' | 'CERRADA' | 'VENCIDA';

export interface Propuesta {
  id_propuesta: number;
  empresa_id: number;
  nombre: string;
  descripcion: string;
  tipo: TipoPropuesta;
  modalidad: Modalidad;
  pago?: number;
  ubicacion?: string;
  vacantes: number;
  fecha_publicacion: string; // ISO datetime
  fecha_vencimiento?: string; // ISO date
  estado: EstadoPropuesta;
}

/**
 * Versión "expandida" que probablemente el backend devuelva en listados,
 * incluyendo datos básicos de la empresa para no hacer otra petición.
 * Ajusta cuando veas la respuesta real del backend.
 */
export interface PropuestaConEmpresa extends Propuesta {
  empresa_nombre: string;
  empresa_fotografia?: string;
  empresa_verificada: boolean;
}