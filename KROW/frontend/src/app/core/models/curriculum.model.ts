export interface Curriculum {
  id_curriculum: number;
  usuario_id: number;
  perfil_profesional?: string;
  campo_laboral?: string;
  campo_estudiantil?: string;
  fortalezas?: string;
  debilidades?: string;
  idiomas?: string;
  habilidades?: string;
  certificaciones?: string;
  portafolio?: string;
  fecha_actualizacion: string; // ISO datetime
}