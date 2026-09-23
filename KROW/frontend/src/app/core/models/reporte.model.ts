export type EstadoReporte = 'PENDIENTE' | 'EN_REVISION' | 'RESUELTO' | 'DESCARTADO';

export interface Reporte {
    id_reporte: number;
    usuario_id: number;
    empresa_id: number | null;
    propuesta_id: number | null;
    motivo: string | null;
    descripcion: string | null;
    estado: EstadoReporte;
    fecha: string;
}