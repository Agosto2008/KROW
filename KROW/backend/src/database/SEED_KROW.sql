-- ==========================================
-- SEED DE DATOS DE PRUEBA - KROW
-- ==========================================
-- REQUISITO: ejecutar antes DB_KROW.sql (crea la base krow_db_in5bm).
-- Este script NO borra la base; solo limpia sus tablas y las rellena.
-- Es re-ejecutable: puedes correrlo cuantas veces quieras.
--
-- Cuentas de prueba (passwords hasheados con bcrypt, rondas 10):
--   ADMIN    : admin@krow.com        / AdminKrow!2026
--   USUARIO  : ana@correo.com        / Krow!2026
--   USUARIO  : luis@correo.com       / Krow!2026
--   USUARIO  : carla@correo.com      / Krow!2026
--   EMPRESA  : contacto@techlab.com  / EmpresaKrow!2026   (NO verificada)
--   EMPRESA  : hola@greenbyte.com    / EmpresaKrow!2026   (VERIFICADA)
--   EMPRESA  : talento@nova.com      / EmpresaKrow!2026   (sin propuestas)
-- ==========================================

USE krow_db_in5bm;

-- Limpieza en orden inverso de dependencias (re-ejecutable)
DELETE FROM Reporte;
DELETE FROM VerificacionEmpresa;
DELETE FROM Favorito;
DELETE FROM Notificacion;
DELETE FROM Entrevista;
DELETE FROM Mensaje;
DELETE FROM Conversacion;
DELETE FROM Curriculum;
DELETE FROM Solicitud;
DELETE FROM Propuesta;
DELETE FROM Empresa;
DELETE FROM Usuario;
DELETE FROM Cuenta;

ALTER TABLE Reporte AUTO_INCREMENT = 1;
ALTER TABLE VerificacionEmpresa AUTO_INCREMENT = 1;
ALTER TABLE Favorito AUTO_INCREMENT = 1;
ALTER TABLE Notificacion AUTO_INCREMENT = 1;
ALTER TABLE Entrevista AUTO_INCREMENT = 1;
ALTER TABLE Mensaje AUTO_INCREMENT = 1;
ALTER TABLE Conversacion AUTO_INCREMENT = 1;
ALTER TABLE Curriculum AUTO_INCREMENT = 1;
ALTER TABLE Solicitud AUTO_INCREMENT = 1;
ALTER TABLE Propuesta AUTO_INCREMENT = 1;
ALTER TABLE Empresa AUTO_INCREMENT = 1;
ALTER TABLE Usuario AUTO_INCREMENT = 1;
ALTER TABLE Cuenta AUTO_INCREMENT = 1;

-- ==========================================
-- CUENTAS
-- ==========================================
INSERT INTO Cuenta (id_cuenta, correo, password, rol, estado) VALUES
(1, 'admin@krow.com',       '$2b$10$lNDpolKW0qOew3MG5ORFQeJ8bw0KGotUoe0fkTFkUm5a.JQVD9yTe', 'ADMIN',   'ACTIVA'),
(2, 'ana@correo.com',       '$2b$10$0.cz9HRDMdDnt7m0z3t3Guo/p69MvgYpxntsoWwOtqxu6lb4QkFXa', 'USUARIO', 'ACTIVA'),
(3, 'luis@correo.com',      '$2b$10$0.cz9HRDMdDnt7m0z3t3Guo/p69MvgYpxntsoWwOtqxu6lb4QkFXa', 'USUARIO', 'ACTIVA'),
(4, 'carla@correo.com',     '$2b$10$0.cz9HRDMdDnt7m0z3t3Guo/p69MvgYpxntsoWwOtqxu6lb4QkFXa', 'USUARIO', 'ACTIVA'),
(5, 'contacto@techlab.com', '$2b$10$WJtAEDQxAdaTbKpNsRDBGuWu3bLZOQkWVfrsHRyipe.LDYdE6ZHOG', 'EMPRESA', 'ACTIVA'),
(6, 'hola@greenbyte.com',   '$2b$10$WJtAEDQxAdaTbKpNsRDBGuWu3bLZOQkWVfrsHRyipe.LDYdE6ZHOG', 'EMPRESA', 'ACTIVA'),
(7, 'talento@nova.com',     '$2b$10$WJtAEDQxAdaTbKpNsRDBGuWu3bLZOQkWVfrsHRyipe.LDYdE6ZHOG', 'EMPRESA', 'ACTIVA');

-- ==========================================
-- USUARIOS (jovenes que buscan empleo/practicas)
-- ==========================================
INSERT INTO Usuario (id_usuario, cuenta_id, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, telefono, fotografia, descripcion_personal, direccion, fecha_nacimiento) VALUES
(1, 2, 'Ana',    'Lucia', 'Perez',   'Soto',   '5551-0001', NULL, 'Estudiante de ingenieria de sistemas, ultimo anio. Me interesa el desarrollo web y la data.', 'Zona 1, Ciudad', '2003-04-12'),
(2, 3, 'Luis',   NULL,   'Martinez', 'Rivas', '5551-0002', NULL, 'Tecnico en redes buscando primera pasantia.', 'Zona 5, Ciudad', '2002-11-30'),
(3, 4, 'Carla',  'Sophia', 'Gomez',  'Lopez',  '5551-0003', NULL, 'Disenadora junior y estudiante de marketing digital.', 'Zona 10, Ciudad', '2004-02-18');

-- ==========================================
-- EMPRESAS
-- ==========================================
INSERT INTO Empresa (id_empresa, cuenta_id, nombre, descripcion, propuesta_empresa, fotografia, telefono, ubicacion, verificada) VALUES
(1, 5, 'TechLab',    'Empresa de desarrollo de software enfocada en productos digitales para jovenes.', 'Buscamos talento joven con ganas de aprender; ofrecemos mentorias y proyectos reales desde el dia uno.', NULL, '5552-0001', 'Zona 4, Ciudad', FALSE),
(2, 6, 'GreenByte',  'Consultoria de tecnologia verde y energias renovables.', 'Trabajamos con practicas pagadas y planes de contratacion para practicantes destacados.', NULL, '5552-0002', 'Zona 9, Ciudad', TRUE),
(3, 7, 'NovaMedia',  'Agencia de marketing y contenido digital.', 'Proyectos creativos para quienes empiezan en el sector.', NULL, '5552-0003', 'Zona 13, Ciudad', FALSE);

-- ==========================================
-- PROPUESTAS (ofertas)
-- ==========================================
INSERT INTO Propuesta (id_propuesta, empresa_id, nombre, descripcion, tipo, modalidad, pago, ubicacion, vacantes, fecha_publicacion, fecha_vencimiento, estado) VALUES
(1, 1, 'Practica de Desarrollo Web Frontend', 'Apoya al equipo de producto en Angular y React. Requisitos: HTML/CSS basico y ganas de aprender. Incluye mentoria semanal.', 'PRACTICA', 'HIBRIDO', 400.00, 'Zona 4, Ciudad', 2, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 'ACTIVA'),
(2, 1, 'Prepractica en Soporte Tecnico', 'Para estudiantes sin experiencia: acompañamiento en mesa de ayuda y documentacion. Horario flexiblecompatible con clases.', 'PREPRACTICA', 'PRESENCIAL', 250.00, 'Zona 4, Ciudad', 3, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 21 DAY), 'ACTIVA'),
(3, 1, 'Pasantia en Analisis de Datos', 'Limpiar bases de datos, construir dashboards y apoyar reportes semanales. Se valora conocimiento de SQL y Excel avanzado.', 'PASANTIA', 'REMOTO', 600.00, 'Remoto', 1, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 40 DAY), 'ACTIVA'),
(4, 2, 'Practica en Energia Solar', 'Acompanar proyectos de instalacion solar y mediciones de campo. Ideal para ingenierias ambientales o industriales.', 'PRACTICA', 'PRESENCIAL', 500.00, 'Zona 9, Ciudad', 2, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), 'ACTIVA'),
(5, 2, 'Asistente de Marketing Digital (medio tiempo)', 'Gestion de redes, diseno de piezas y reportes de campanas. Perfecto para combinar con estudios.', 'TRABAJO', 'HIBRIDO', 700.00, 'Zona 9, Ciudad', 1, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), 'ACTIVA'),
(6, 3, 'Pasantia en Produccion de Contenido', 'Edicion de video, guiones para redes sociales y apoyo en campanas. Portafolio opcional pero deseable.', 'PASANTIA', 'REMOTO', 350.00, 'Remoto', 2, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 'ACTIVA'),
(7, 1, 'Vaga cerrada - Practica Backend', 'Oferta de ejemplo ya cerrada.', 'PRACTICA', 'REMOTO', 450.00, 'Remoto', 1, DATE_SUB(NOW(), INTERVAL 60 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), 'CERRADA');

-- ==========================================
-- CURRICULUM (solo la usuaria 1 lo tiene completo)
-- ==========================================
INSERT INTO Curriculum (id_curriculum, usuario_id, perfil_profesional, campo_laboral, campo_estudiantil, fortalezas, debilidades, idiomas, habilidades, certificaciones, portafolio) VALUES
(1, 1, 'Estudiante de sistemas interesada en frontend y datos.', 'Tecnologia', 'Ingenieria de sistemas (ultimo anio)', 'Responsable, autodidacta, buena comunicacion', 'Poca experiencia formal', 'Espanol (nativo), Ingles (intermedio)', 'HTML, CSS, JavaScript basico, SQL basico', 'Fundamentos de Git (curso online)', 'https://github.com/anaperez');

-- ==========================================
-- SOLICITUDES (postulaciones)
-- ==========================================
INSERT INTO Solicitud (id_solicitud, usuario_id, propuesta_id, fecha, estado, comentario_empresa) VALUES
(1, 1, 1, DATE_SUB(NOW(), INTERVAL 6 DAY),  'ACEPTADA',   'Perfil solido para la practica. Bienvenida al equipo!'),
(2, 1, 3, DATE_SUB(NOW(), INTERVAL 4 DAY),  'PENDIENTE',  NULL),
(3, 2, 2, DATE_SUB(NOW(), INTERVAL 5 DAY),  'EN_REVISION', 'Revisando CV con el equipo tecnico.'),
(4, 2, 4, DATE_SUB(NOW(), INTERVAL 3 DAY),  'PENDIENTE',  NULL),
(5, 3, 5, DATE_SUB(NOW(), INTERVAL 2 DAY),  'PENDIENTE',  NULL),
(6, 3, 6, DATE_SUB(NOW(), INTERVAL 1 DAY),  'RECHAZADA',  'Buscamos alguien con mas experiencia en edicion de video.');

-- ==========================================
-- CONVERSACION + MENSAJES (se crea cuando la solicitud es ACEPTADA)
-- ==========================================
INSERT INTO Conversacion (id_conversacion, solicitud_id, fecha_creacion, activa) VALUES
(1, 1, DATE_SUB(NOW(), INTERVAL 6 DAY), TRUE);

INSERT INTO Mensaje (id_mensaje, conversacion_id, emisor, contenido, fecha_envio, leido) VALUES
(1, 1, 'EMPRESA', 'Hola Ana! Felicitaciones, fuiste aceptada. Te contactamos para coordinar el inicio.', DATE_SUB(NOW(), INTERVAL 5 DAY), TRUE),
(2, 1, 'USUARIO', 'Muchas gracias! Cuando gusten, estoy disponible esta semana para hablar.', DATE_SUB(NOW(), INTERVAL 5 DAY), TRUE),
(3, 1, 'EMPRESA', 'Perfecto. Nos vemos el lunes a las 9am en nuestra oficina de Zona 4.', DATE_SUB(NOW(), INTERVAL 2 DAY), FALSE);

-- ==========================================
-- ENTREVISTAS
-- ==========================================
INSERT INTO Entrevista (id_entrevista, solicitud_id, fecha, hora, modalidad, ubicacion, enlace, estado, observaciones) VALUES
(1, 1, DATE_ADD(NOW(), INTERVAL 3 DAY), '10:00:00', 'VIRTUAL', NULL, 'https://meet.jit.si/krow-entrevista-ana', 'PROGRAMADA', 'Entrevista tecnica breve (30 min).'),
(2, 6, DATE_SUB(NOW(), INTERVAL 1 DAY), '15:00:00', 'TELEFONICA', NULL, NULL, 'REALIZADA', 'Se evaluo portafolio.');

-- ==========================================
-- FAVORITOS
-- ==========================================
INSERT INTO Favorito (id_favorito, usuario_id, propuesta_id, fecha) VALUES
(1, 1, 3, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(2, 1, 6, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 2, 5, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ==========================================
-- VERIFICACIONES DE EMPRESA
-- ==========================================
INSERT INTO VerificacionEmpresa (id_verificacion, tipo_verificacion, empresa_id, estado, observacion, fecha, administrador) VALUES
(1, 'PLATINO', 1, 'PENDIENTE', NULL, DATE_SUB(NOW(), INTERVAL 2 DAY), NULL),
(2, 'DIAMANTE', 2, 'APROBADA',  'Documentacion completa y verificada.', DATE_SUB(NOW(), INTERVAL 15 DAY), 'admin@krow.com');

-- ==========================================
-- NOTIFICACIONES (destinatario = cuenta: usuarios y empresas)
-- ==========================================
INSERT INTO Notificacion (id_notificacion, cuenta_id, titulo, mensaje, tipo, leida, fecha) VALUES
(1, 2, 'Solicitud aceptada', 'TechLab acepto tu postulacion a "Practica de Desarrollo Web Frontend".', 'ACEPTACION', TRUE,  DATE_SUB(NOW(), INTERVAL 6 DAY)),
(2, 2, 'Entrevista programada', 'Tienes una entrevista el proximo dia 10:00 (virtual).',              'ENTREVISTA', FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 3, 'Solicitud en revision', 'GreenByte esta revisando tu postulacion.',                         'SOLICITUD',  FALSE, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(4, 5, 'Nueva postulacion',      'Ana Perez postulo a "Practica de Desarrollo Web Frontend".',      'SOLICITUD',  FALSE, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(5, 5, 'Solicitud de verificacion', 'Tu solicitud de verificacion PLATINO esta pendiente de revision del equipo KROW.', 'SISTEMA', FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY));

-- ==========================================
-- REPORTES (para la cola del admin)
-- ==========================================
INSERT INTO Reporte (id_reporte, usuario_id, empresa_id, propuesta_id, motivo, descripcion, estado, fecha) VALUES
(1, 2, 3, 6, 'Descripcion enganosa', 'La vacante dice remoto pero me pidieron presencial en la primera llamada.', 'PENDIENTE', DATE_SUB(NOW(), INTERVAL 1 DAY));

SELECT 'Seed de KROW insertado correctamente' AS resultado;
