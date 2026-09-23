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
 * Ficha de empresa que el backend embebe en JSON_OBJECT(...) junto a la
 * propuesta. `resumen` es la versión corta (listados) y `completa`
 * la del detalle, que además trae descripcion/teléfono/propuesta_empresa.
 */
export interface EmpresaResumen {
  id_empresa: number;
  nombre: string;
  fotografia?: string | null;
  ubicacion?: string | null;
  verificada: boolean;
}

export interface EmpresaEnDetalle extends EmpresaResumen {
  descripcion?: string | null;
  propuesta_empresa?: string | null;
  telefono?: string | null;
}

/** Propuesta en un listado: ya trae su empresa, sin N+1 */
export interface PropuestaEnListado extends Propuesta {
  empresa?: EmpresaResumen | null;
}

/** Detalle de propuesta (GET /propuestas/:id): 1 sola petición */
export interface PropuestaConEmpresa extends Propuesta {
  empresa: EmpresaEnDetalle;
}
