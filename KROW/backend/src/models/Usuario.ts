export interface Usuario {
  id_usuario: number;
  cuenta_id: number;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  telefono: string | null;
  fotografia: string | null;
  descripcion_personal: string | null;
  direccion: string | null;
  fecha_nacimiento: Date | null;
}
