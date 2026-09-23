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

  // cambia el estado de una cuenta
  async cambiarEstado(id: number, estado: EstadoCuenta) {
    const cuenta = await cuentaRepository.findById(id);

    // verifica que la cuenta exista
    if (!cuenta) throw new AppError('Cuenta no encontrada', 404);

    // actualiza el estado de la cuenta
    await cuentaRepository.updateEstado(id, estado);
  }
}

export const cuentaService = new CuentaService();
