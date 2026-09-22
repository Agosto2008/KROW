export type EstadoReporte = 'PENDIENTE' | 'EN_REVISION' | 'RESUELTO' | 'DESCARTADO';

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