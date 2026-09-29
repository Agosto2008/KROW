/** true si el error es un INSERT rechazado por una clave unica de MySQL */
export function esDuplicado(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: string }).code === 'ER_DUP_ENTRY';
}
 