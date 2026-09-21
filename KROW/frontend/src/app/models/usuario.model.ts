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