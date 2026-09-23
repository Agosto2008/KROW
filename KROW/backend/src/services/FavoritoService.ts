import { favoritoRepository } from '../repositories/FavoritoRepository';

export class FavoritoService {
  // favoritos CON propuesta y empresa resueltas (1 query, sin N+1)
  async listar(usuarioId: number) {
    return favoritoRepository.findByUsuarioConPropuesta(usuarioId);
  }

  // Toggle: si ya existe lo quita, si no lo agrega. Útil para un botón de "❤" en el front
  async alternar(usuarioId: number, propuestaId: number): Promise<'agregado' | 'eliminado'> {
    const existe = await favoritoRepository.yaExiste(usuarioId, propuestaId);
    if (existe) {
      await favoritoRepository.delete(usuarioId, propuestaId);
      return 'eliminado';
    }
    await favoritoRepository.create(usuarioId, propuestaId);
    return 'agregado';
  }
}

export const favoritoService = new FavoritoService();