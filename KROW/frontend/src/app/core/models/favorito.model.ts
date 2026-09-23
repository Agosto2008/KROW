import { Propuesta, EmpresaResumen } from './propuesta.model';

export interface Favorito {
  id_favorito: number;
  usuario_id: number;
  propuesta_id: number;
  fecha: string; // ISO datetime
}

/**
 * GET /favoritos/usuario/:id → el favorito YA trae su propuesta y su empresa
 * aplanadas (1 query). Antes el front pedía cada propuesta una por una (N+1).
 */
export interface FavoritoConPropuesta extends Propuesta {
  id_favorito: number;
  fecha_guardado: string;
  empresa?: EmpresaResumen | null;
}
