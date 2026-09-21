import { empresaRepository } from '../repositories/EmpresaRepository';
import { Empresa } from '../models/Empresa';

export class EmpresaService {
  async listar() {
    return empresaRepository.findAll();
  }

  async obtenerPorId(id: number) {
    const empresa = await empresaRepository.findById(id);
    if (!empresa) throw new Error('Empresa no encontrada');
    return empresa;
  }

  async actualizar(id: number, data: Partial<Empresa>) {
    await empresaRepository.update(id, data);
  }
}

export const empresaService = new EmpresaService();