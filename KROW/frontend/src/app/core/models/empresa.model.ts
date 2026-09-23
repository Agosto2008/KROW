import { Propuesta } from './propuesta.model';

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

/** GET /empresas/:id/con-propuestas → empresa + sus ofertas activas en 1 query */
export interface EmpresaConPropuestas extends Empresa {
  propuestas: Propuesta[];
}
