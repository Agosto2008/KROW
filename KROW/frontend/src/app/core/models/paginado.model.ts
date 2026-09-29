/**
 * Respuesta paginada del backend (los endpoints con ?buscar= o ?pagina=).
 * Sin esos parámetros el backend sigue devolviendo la lista plana,
 * por eso los servicios envuelven ambas formas.
 */
export interface Paginado<T> {
  datos: T[];
  total: number;
  pagina: number;
  porPagina: number;
}
