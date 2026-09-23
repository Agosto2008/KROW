import { cuentaRepository } from '../repositories/CuentaRepository';
import { EstadoCuenta } from '../models/Cuenta';
import { AppError } from '../utils/AppError';

export class CuentaService {
  // obtiene una cuenta por su id
  async obtenerPorId(id: number) {
    const cuenta = await cuentaRepository.findById(id);

    // verifica que la cuenta exista
    if (!cuenta) throw new AppError('Cuenta no encontrada', 404);

    // elimina la contraseña antes de devolver los datos
    const { password, ...cuentaSinPassword } = cuenta; // nunca devolver el hash al front
    return cuentaSinPassword;
  }

  // LISTADO para el admin: busqueda + filtros + paginacion en el servidor
  async listar(query: Record<string, any>) {
    const estados = ['ACTIVA', 'INACTIVA', 'SUSPENDIDA'];
    const roles = ['ADMIN', 'USUARIO', 'EMPRESA'];
    const estado = typeof query.estado === 'string' && estados.includes(query.estado) ? query.estado : undefined;
    const rol = typeof query.rol === 'string' && roles.includes(query.rol) ? query.rol : undefined;

    return cuentaRepository.listar({
      buscar: typeof query.buscar === 'string' ? query.buscar.slice(0, 150) : undefined,
      rol,
      estado,
      pagina: Number(query.pagina) || 1,
      porPagina: Number(query.por_pagina) || 15,
    });
  }

  // cambia el estado de una cuenta (valida que el valor pertenezca al ENUM:
  // antes cualquier cadena producia un error 500 de MySQL)
  async cambiarEstado(id: number, estado: EstadoCuenta) {
    const permitidos: EstadoCuenta[] = ['ACTIVA', 'INACTIVA', 'SUSPENDIDA'];
    if (!permitidos.includes(estado)) throw new AppError('Estado de cuenta no valido', 400);

    const cuenta = await cuentaRepository.findById(id);

    // verifica que la cuenta exista
    if (!cuenta) throw new AppError('Cuenta no encontrada', 404);

    // actualiza el estado de la cuenta
    await cuentaRepository.updateEstado(id, estado);
  }
}

export const cuentaService = new CuentaService();
