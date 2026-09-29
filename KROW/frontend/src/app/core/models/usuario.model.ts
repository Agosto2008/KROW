import { Curriculum } from './curriculum.model';

export interface Usuario {
  id_usuario: number;
  cuenta_id: number;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  telefono?: string;
  fotografia?: string;
  descripcion_personal?: string;
  direccion?: string;
  fecha_nacimiento?: string; // ISO date (YYYY-MM-DD)
}

/** Helper de UI: nombre completo armado a partir de las 4 partes */
export function nombreCompleto(u: Usuario): string {
  return [u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido]
    .filter(Boolean)
    .join(' ');
}

/**
 * GET /usuarios/:id/publico → perfil del candidato para la EMPRESA:
 * nombre + CV resumido, sin teléfono/dirección/fecha de nacimiento.
 */
export interface PerfilPublico {
  id_usuario: number;
  primer_nombre: string;
  segundo_nombre?: string | null;
  primer_apellido: string;
  segundo_apellido?: string | null;
  fotografia?: string | null;
  descripcion_personal?: string | null;
  // campos del CV en la misma query (LEFT JOIN Curriculum)
  perfil_profesional?: string | null;
  campo_laboral?: string | null;
  campo_estudiantil?: string | null;
  idiomas?: string | null;
  habilidades?: string | null;
  certificaciones?: string | null;
  portafolio?: string | null;
  curriculum_actualizado?: string | null; // ISO datetime
}

/** Exportado por comodidad para los formularios de CV */
export type CurriculumEdit = Partial<Curriculum>;
