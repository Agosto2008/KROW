import { empresaRepository } from '../repositories/EmpresaRepository';
import { Empresa } from '../models/Empresa';
import { AppError } from '../utils/AppError';

export class EmpresaService {
  // obtiene todas las empresas
  async listar() {
    return empresaRepository.findAll();
  }

  // obtiene una empresa por su id
  async obtenerPorId(id: number) {
    const empresa = await empresaRepository.findById(id);

    // verifica que la empresa exista
    if (!empresa) throw new AppError('Empresa no encontrada', 404);

    return empresa;
  }

  // actualiza los datos de una empresa
  async actualizar(id: number, data: Partial<Empresa>) {
    await empresaRepository.update(id, data);
  }
}

export const empresaService = new EmpresaService();
