export type EstadoReporte = 'PENDIENTE' | 'EN_REVISION' | 'RESUELTO' | 'DESCARTADO';

/** Motivos precargados en la UI. El backend guarda `motivo` como texto libre (≤150). */
export type MotivoReporte =
  | 'OFERTA_FALSA'
  | 'EMPRESA_NO_VERIFICADA'
  | 'DISCRIMINACION'
  | 'SPAM'
  | 'OTRO';

export const MOTIVOS_REPORTE: { valor: MotivoReporte; etiqueta: string }[] = [
  { valor: 'OFERTA_FALSA', etiqueta: 'Oferta falsa o engañosa' },
  { valor: 'EMPRESA_NO_VERIFICADA', etiqueta: 'Empresa sospechosa o no verificada' },
  { valor: 'DISCRIMINACION', etiqueta: 'Contenido discriminatorio' },
  { valor: 'SPAM', etiqueta: 'Spam o publicación duplicada' },
  { valor: 'OTRO', etiqueta: 'Otro motivo' },
];

export interface Reporte {
  id_reporte: number;
  usuario_id: number;
  empresa_id?: number;
  propuesta_id?: number;
  motivo?: string;
  descripcion?: string;
  estado: EstadoReporte;
  fecha: string; // ISO datetime
}
