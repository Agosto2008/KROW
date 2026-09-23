import { propuestaRepository } from '../repositories/PropuestaRepository';
import { empresaRepository } from '../repositories/EmpresaRepository';
import { Propuesta } from '../models/Propuesta';
import { AppError } from '../utils/AppError';

export class PropuestaService {
    // obtiene las propuestas aplicando los filtros recibidos
    // con ?buscar= o ?pagina= usa la paginacion del servidor
    async listar(filtros: Record<string, any>) {
        const conPaginacion =
            filtros.buscar !== undefined || filtros.pagina !== undefined;

        if (conPaginacion) {
            return propuestaRepository.buscar({
                tipo: filtros.tipo,
                modalidad: filtros.modalidad,
                estado: filtros.estado,
                empresa_id: filtros.empresa_id ? Number(filtros.empresa_id) : undefined,
                buscar: typeof filtros.buscar === 'string' ? filtros.buscar.slice(0, 150) : undefined,
                pagina: Number(filtros.pagina) || 1,
                porPagina: Number(filtros.por_pagina) || 12,
            });
        }

        // compatibilidad con el front actual: devuelve la lista plana
        return propuestaRepository.findAll(filtros);
    }

    // obtiene una propuesta por su id (CON su ficha de empresa: 1 query)
    async obtenerPorId(id: number) {
        const propuesta = await propuestaRepository.findByIdConEmpresa(id);

        // verifica que la propuesta exista
        if (!propuesta) throw new AppError('Propuesta no encontrada', 404);

        return propuesta;
    }

    // crea la propuesta asociandola con la empresa (valida campos obligatorios
    // y enums antes de llegar a MySQL, que respondia 500)
    async crear(empresaId: number, data: Omit<Propuesta, 'id_propuesta' | 'fecha_publicacion' | 'estado' | 'empresa_id'>) {
        // verifica que la empresa exista
        const empresa = await empresaRepository.findById(empresaId);
        if (!empresa) throw new AppError('Empresa no encontrada', 404);

        if (typeof data.nombre !== 'string' || !data.nombre.trim()) {
            throw new AppError('El campo "nombre" es obligatorio', 400);
        }
        if (typeof data.descripcion !== 'string' || !data.descripcion.trim()) {
            throw new AppError('El campo "descripcion" es obligatorio', 400);
        }
        const tipos = ['PREPRACTICA', 'PRACTICA', 'PASANTIA', 'TRABAJO'];
        if (!tipos.includes(data.tipo)) throw new AppError('tipo no valido', 400);
        const modalidades = ['PRESENCIAL', 'REMOTO', 'HIBRIDO'];
        if (!modalidades.includes(data.modalidad)) throw new AppError('modalidad no valida', 400);
        if (!Number.isInteger(Number(data.vacantes)) || Number(data.vacantes) < 1) {
            throw new AppError('vacantes debe ser un entero mayor o igual a 1', 400);
        }

        // crea la propuesta asociandola con la empresa
        return propuestaRepository.create({ ...data, empresa_id: empresaId });
    }

    // actualiza los datos de una propuesta (valida enums si vienen en el body)
    async actualizar(id: number, data: Partial<Propuesta>) {
        if (data.tipo !== undefined) {
            const tipos = ['PREPRACTICA', 'PRACTICA', 'PASANTIA', 'TRABAJO'];
            if (!tipos.includes(data.tipo)) throw new AppError('tipo no valido', 400);
        }
        if (data.modalidad !== undefined) {
            const modalidades = ['PRESENCIAL', 'REMOTO', 'HIBRIDO'];
            if (!modalidades.includes(data.modalidad)) throw new AppError('modalidad no valida', 400);
        }
        if (data.estado !== undefined) {
            const estados = ['ACTIVA', 'PAUSADA', 'CERRADA', 'VENCIDA'];
            if (!estados.includes(data.estado)) throw new AppError('estado no valido', 400);
        }
        if (data.vacantes !== undefined && (!Number.isInteger(Number(data.vacantes)) || Number(data.vacantes) < 1)) {
            throw new AppError('vacantes debe ser un entero mayor o igual a 1', 400);
        }

        // verifica existencia ANTES de actualizar: actualizarDinamico devuelve 0
        // tambien si el body no traia ningun campo editable, y eso no es un 404
        const existente = await propuestaRepository.findById(id);
        if (!existente) throw new AppError('Propuesta no encontrada', 404);

        await propuestaRepository.update(id, data);
    }

    // elimina una propuesta
    async eliminar(id: number) {
        const propuesta = await propuestaRepository.findById(id);
        if (!propuesta) throw new AppError('Propuesta no encontrada', 404);
        await propuestaRepository.delete(id);
    }
}

export const propuestaService = new PropuestaService();
