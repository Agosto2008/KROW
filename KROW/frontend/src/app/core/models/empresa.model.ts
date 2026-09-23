export interface Empresa {
    id_empresa: number;
    cuenta_id: number;
    nombre: string;
    descripcion: string | null;
    propuesta_empresa: string | null;
    fotografia: string | null;
    telefono: string | null;
    ubicacion: string | null;
    verificada: boolean;
    fecha_registro: string;
}