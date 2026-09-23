import { Router } from 'express';
import { empresaService } from '../services/EmpresaService';
import { verificarToken, verificarRol } from '../middlewares/AuthMiddlewares';
import { verificarPropietarioEmpresa } from '../utils/resolverPerfil';

const router = Router();

//lista todas las empresas
//con ?buscar= o ?pagina= pagina en el servidor (respuesta {datos,total,...})
//sin parametros devuelve la lista plana (compatibilidad con el front actual)
router.get('/', async (req, res, next) => {
  try {
    const conPaginacion = req.query.buscar !== undefined || req.query.pagina !== undefined;
    res.json(conPaginacion ? await empresaService.buscar(req.query) : await empresaService.listar());
  }
  catch (error) { next(error); }
});

//empresa + sus propuestas ACTIVAS (vista publica de detalle, 1 query)
router.get('/:id/con-propuestas', async (req, res, next) => {
  try { res.json(await empresaService.obtenerConPropuestas(Number(req.params.id))); }
  catch (error) { next(error); }
});

//esta ruta obtiene una empresa en especifico
router.get('/:id', async (req, res, next) => {
  try { res.json(await empresaService.obtenerPorId(Number(req.params.id))); }
  catch (error) { next(error); }
});

//verifica el rol, y ademas que la empresa autenticada sea la dueña del perfil que intenta editar
router.put('/:id', verificarToken, verificarRol('EMPRESA', 'ADMIN'), async (req, res, next) => {
  try {
    await verificarPropietarioEmpresa(req, Number(req.params.id));
    await empresaService.actualizar(Number(req.params.id), req.body);
    res.json({ mensaje: 'Empresa actualizada' });
  } catch (error) { next(error); }
});

export default router;