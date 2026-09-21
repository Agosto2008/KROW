import { cuentaRepository } from '../repositories/CuentaRepository';
import { EstadoCuenta } from '../models/Cuenta';
import { AppError } from '../utils/AppError';

export class CuentaService {
  async obtenerPorId(id: number) {
    const cuenta = await cuentaRepository.findById(id);
    if (!cuenta) throw new AppError('Cuenta no encontrada', 404);
    const { password, ...cuentaSinPassword } = cuenta; // nunca devolver el hash al front
    return cuentaSinPassword;
  }

  async cambiarEstado(id: number, estado: EstadoCuenta) {
    const cuenta = await cuentaRepository.findById(id);
    if (!cuenta) throw new AppError('Cuenta no encontrada', 404);
    await cuentaRepository.updateEstado(id, estado);
  }
}

export const cuentaService = new CuentaService();