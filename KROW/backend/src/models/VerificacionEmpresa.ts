export type TipoVerificacion =
  | 'SIN VERIFICACION'
  | 'PLATA'
  | 'PLATINO'
  | 'DIAMANTE';

export type EstadoVerificacion =
  | 'PENDIENTE'
  | 'APROBADA'
  | 'RECHAZADA';

export interface VerificacionEmpresa {
  id_verificacion: number;
  tipo_verificacion: TipoVerificacion;
  empresa_id: number;
  estado: EstadoVerificacion;
  observacion: string | null;
  fecha: Date;
  administrador: string | null;
}
