export interface Empresa {
  id_empresa: number;
  cuenta_id: number;
  nombre: string;
  descripcion?: string;
  propuesta_empresa?: string;
  fotografia?: string;
  telefono?: string;
  ubicacion?: string;
  verificada: boolean;
  fecha_registro: string; // ISO datetime
}