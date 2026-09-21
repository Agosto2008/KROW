import { cuentaRepository } from '../repositories/CuentaRepository';
import { EstadoCuenta } from '../models/Cuenta';

export class CuentaService {
  async obtenerPorId(id: number) {
    const cuenta = await cuentaRepository.findById(id);
    if (!cuenta) throw new Error('Cuenta no encontrada');
    const { password, ...cuentaSinPassword } = cuenta; // nunca devolver el hash al front
    return cuentaSinPassword;
  }

  async cambiarEstado(id: number, estado: EstadoCuenta) {
    const cuenta = await cuentaRepository.findById(id);
    if (!cuenta) throw new Error('Cuenta no encontrada');
    await cuentaRepository.updateEstado(id, estado);
  }
}

export const cuentaService = new CuentaService();