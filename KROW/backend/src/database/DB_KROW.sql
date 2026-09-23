-- ==========================================
-- BASE DE DATOS
-- ==========================================

DROP DATABASE IF EXISTS krow_db_in5bm;
CREATE DATABASE krow_db_in5bm;
USE krow_db_in5bm;

-- ==========================================
-- TABLA CUENTA
-- ==========================================

CREATE TABLE Cuenta (
    id_cuenta INT AUTO_INCREMENT PRIMARY KEY,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM(
        'ADMIN',
        'USUARIO',
        'EMPRESA'
    ) NOT NULL,
    estado ENUM(
        'ACTIVA',
        'INACTIVA',
        'SUSPENDIDA'
    ) NOT NULL DEFAULT 'ACTIVA',
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TABLA USUARIO
-- ==========================================

CREATE TABLE Usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    cuenta_id INT NOT NULL UNIQUE,
    primer_nombre VARCHAR(80) NOT NULL,
    segundo_nombre VARCHAR(80),
    primer_apellido VARCHAR(80) NOT NULL,
    segundo_apellido VARCHAR(80),
    telefono VARCHAR(20),
    fotografia VARCHAR(255),
    descripcion_personal TEXT,
    direccion VARCHAR(250),
    fecha_nacimiento DATE,
    CONSTRAINT fk_usuario_cuenta
        FOREIGN KEY (cuenta_id)
        REFERENCES Cuenta(id_cuenta)
        ON DELETE CASCADE
);

-- ==========================================
-- TABLA EMPRESA
-- ==========================================

CREATE TABLE Empresa (
    id_empresa INT AUTO_INCREMENT PRIMARY KEY,
    cuenta_id INT NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    propuesta_empresa TEXT,
    fotografia VARCHAR(255),
    telefono VARCHAR(20),
    ubicacion VARCHAR(200),
    verificada BOOLEAN DEFAULT FALSE,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_empresa_cuenta
        FOREIGN KEY (cuenta_id)
        REFERENCES Cuenta(id_cuenta)
        ON DELETE CASCADE
);

-- ==========================================
-- TABLA PROPUESTA
-- ==========================================

CREATE TABLE Propuesta (
    id_propuesta INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    tipo ENUM(
        'PREPRACTICA',
        'PRACTICA',
        'PASANTIA',
        'TRABAJO'
    ) NOT NULL,
    modalidad ENUM(
        'PRESENCIAL',
        'REMOTO',
        'HIBRIDO'
    ) NOT NULL,
    pago DECIMAL(10,2),
    ubicacion VARCHAR(200),
    vacantes INT NOT NULL,
    fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento DATE,
    estado ENUM(
        'ACTIVA',
        'PAUSADA',
        'CERRADA',
        'VENCIDA'
    ) DEFAULT 'ACTIVA',
    CONSTRAINT fk_propuesta_empresa
        FOREIGN KEY (empresa_id)
        REFERENCES Empresa(id_empresa)
        ON DELETE CASCADE
);

-- ==========================================
-- TABLA SOLICITUD
-- ==========================================

CREATE TABLE Solicitud (
    id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    propuesta_id INT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM(
        'PENDIENTE',
        'EN_REVISION',
        'ACEPTADA',
        'RECHAZADA',
        'CANCELADA'
    ) DEFAULT 'PENDIENTE',
    comentario_empresa TEXT,
    CONSTRAINT fk_solicitud_usuario
        FOREIGN KEY(usuario_id)
        REFERENCES Usuario(id_usuario)
        ON DELETE CASCADE,
    CONSTRAINT fk_solicitud_propuesta
        FOREIGN KEY(propuesta_id)
        REFERENCES Propuesta(id_propuesta)
        ON DELETE CASCADE,
    UNIQUE(usuario_id, propuesta_id)
);

-- ==========================================
-- TABLA CURRICULUM
-- ==========================================

CREATE TABLE Curriculum (
    id_curriculum INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE,
    perfil_profesional TEXT,
    campo_laboral TEXT,
    campo_estudiantil TEXT,
    fortalezas TEXT,
    debilidades TEXT,
    idiomas TEXT,
    habilidades TEXT,
    certificaciones TEXT,
    portafolio VARCHAR(255),
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_curriculum_usuario
        FOREIGN KEY(usuario_id)
        REFERENCES Usuario(id_usuario)
        ON DELETE CASCADE
);

-- ==========================================
-- TABLA CONVERSACION
-- ==========================================

CREATE TABLE Conversacion (
    id_conversacion INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_id INT NOT NULL UNIQUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    activa BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_conversacion_solicitud
        FOREIGN KEY(solicitud_id)
        REFERENCES Solicitud(id_solicitud)
        ON DELETE CASCADE
);

-- ==========================================
-- TABLA MENSAJE
-- ==========================================

CREATE TABLE Mensaje (
    id_mensaje INT AUTO_INCREMENT PRIMARY KEY,
    conversacion_id INT NOT NULL,
    emisor ENUM(
        'USUARIO',
        'EMPRESA'
    ) NOT NULL,
    contenido TEXT NOT NULL,
    fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    leido BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_mensaje_conversacion
        FOREIGN KEY(conversacion_id)
        REFERENCES Conversacion(id_conversacion)
        ON DELETE CASCADE
);

-- ==========================================
-- TABLA ENTREVISTA
-- ==========================================

CREATE TABLE Entrevista (
    id_entrevista INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_id INT NOT NULL,
    fecha DATE,
    hora TIME,
    modalidad ENUM(
        'PRESENCIAL',
        'VIRTUAL',
        'TELEFONICA'
    ),
    ubicacion VARCHAR(255),
    enlace VARCHAR(255),
    estado ENUM(
        'PROGRAMADA',
        'REPROGRAMADA',
        'REALIZADA',
        'CANCELADA'
    ) DEFAULT 'PROGRAMADA',
    observaciones TEXT,
    CONSTRAINT fk_entrevista_solicitud
        FOREIGN KEY(solicitud_id)
        REFERENCES Solicitud(id_solicitud)
        ON DELETE CASCADE
);

-- ==========================================
-- TABLA NOTIFICACION
-- ==========================================
-- "cuenta_id" es el destinatario generico: sirve tanto para USUARIO como para
-- EMPRESA (la version anterior tenia usuario_id y las empresas nunca recibian
-- nada). Usuario y Empresa apuntan a Cuenta, asi que con una sola columna se
-- notifica a cualquiera de los dos lados.

CREATE TABLE Notificacion (
    id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    cuenta_id INT NOT NULL,
    titulo VARCHAR(150),
    mensaje TEXT,
    tipo ENUM(
        'MENSAJE',
        'SOLICITUD',
        'ENTREVISTA',
        'ACEPTACION',
        'RECHAZO',
        'SISTEMA'
    ),
    leida BOOLEAN DEFAULT FALSE,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notificacion_cuenta
        FOREIGN KEY(cuenta_id)
        REFERENCES Cuenta(id_cuenta)
        ON DELETE CASCADE
);

-- ==========================================
-- TABLA FAVORITO
-- ==========================================

CREATE TABLE Favorito (
    id_favorito INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    propuesta_id INT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_favorito_usuario
        FOREIGN KEY(usuario_id)
        REFERENCES Usuario(id_usuario)
        ON DELETE CASCADE,
    CONSTRAINT fk_favorito_propuesta
        FOREIGN KEY(propuesta_id)
        REFERENCES Propuesta(id_propuesta)
        ON DELETE CASCADE,
    UNIQUE(usuario_id, propuesta_id)
);

-- ==========================================
-- TABLA VERIFICACION EMPRESA
-- ==========================================

CREATE TABLE VerificacionEmpresa (
    id_verificacion INT AUTO_INCREMENT PRIMARY KEY,
    tipo_verificacion ENUM(
		 'SIN VERIFICACION',
         'PLATA',
         'PLATINO',
         'DIAMANTE'
	) DEFAULT 'SIN VERIFICACION',
    empresa_id INT NOT NULL,
    estado ENUM(
        'PENDIENTE',
        'APROBADA',
        'RECHAZADA'
    ) DEFAULT 'PENDIENTE',
    observacion TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    administrador VARCHAR(120),
    CONSTRAINT fk_verificacion_empresa
        FOREIGN KEY(empresa_id)
        REFERENCES Empresa(id_empresa)
        ON DELETE CASCADE
);

-- ==========================================
-- TABLA REPORTE
-- ==========================================

CREATE TABLE Reporte (
    id_reporte INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    empresa_id INT,
    propuesta_id INT,
    motivo VARCHAR(150),
    descripcion TEXT,
    estado ENUM(
        'PENDIENTE',
        'EN_REVISION',
        'RESUELTO',
        'DESCARTADO'
    ) DEFAULT 'PENDIENTE',
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reporte_usuario
        FOREIGN KEY(usuario_id)
        REFERENCES Usuario(id_usuario)
        ON DELETE CASCADE,
    CONSTRAINT fk_reporte_empresa
        FOREIGN KEY(empresa_id)
        REFERENCES Empresa(id_empresa)
        ON DELETE SET NULL,
    CONSTRAINT fk_reporte_propuesta
        FOREIGN KEY(propuesta_id)
        REFERENCES Propuesta(id_propuesta)
        ON DELETE SET NULL
);