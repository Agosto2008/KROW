import { empresaRepository } from '../repositories/EmpresaRepository';
import { verificacionEmpresaRepository } from '../repositories/VerificacionEmpresaRepository';
import { Empresa } from '../models/Empresa';
import { AppError } from '../utils/AppError';

export class EmpresaService {
  // obtiene todas las empresas
  async listar() {
    return empresaRepository.findAll();
  }

  // listado publico con busqueda + paginacion en el servidor
  async buscar(query: Record<string, any>) {
    return empresaRepository.buscar({
      buscar: typeof query.buscar === 'string' ? query.buscar.slice(0, 150) : undefined,
      pagina: Number(query.pagina) || 1,
      porPagina: Number(query.por_pagina) || 12,
      verificadas: query.verificadas === 'true' ? true : undefined,
    });
  }

  // obtiene una empresa por su id
  async obtenerPorId(id: number) {
    const empresa = await empresaRepository.findById(id);

    // verifica que la empresa exista
    if (!empresa) throw new AppError('Empresa no encontrada', 404);

    return empresa;
  }

  // empresa + sus propuestas ACTIVAS (detalle publico, sin N+1)
  // + ultima verificacion (nivel) si la tiene
  async obtenerConPropuestas(id: number) {
    const { empresa, propuestas } = await empresaRepository.findByIdConPropuestas(id);
    if (!empresa) throw new AppError('Empresa no encontrada', 404);

    const verificacion = await verificacionEmpresaRepository.findUltima(id);

    return {
      ...empresa,
      propuestas,
      verificacion: verificacion
        ? {
            tipo_verificacion: verificacion.tipo_verificacion,
            estado: verificacion.estado,
            fecha: verificacion.fecha,
          }
        : null,
    };
  }

  // actualiza los datos de una empresa (solo columnas de la whitelist)
  async actualizar(id: number, data: Partial<Empresa>) {
    const empresa = await empresaRepository.findById(id);
    if (!empresa) throw new AppError('Empresa no encontrada', 404);

    if (data.nombre !== undefined && (typeof data.nombre !== 'string' || !data.nombre.trim())) {
      throw new AppError('El campo "nombre" no puede estar vacio', 400);
    }

    await empresaRepository.update(id, data);
  }
}

export const empresaService = new EmpresaService();
