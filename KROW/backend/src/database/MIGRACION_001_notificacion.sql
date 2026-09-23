-- ==========================================
-- MIGRACION 001: Notificacion.usuario_id -> Notificacion.cuenta_id
-- ==========================================
-- Motivo: las empresas no recibian notificaciones (la columna apuntaba solo a
-- Usuario). Al apuntar a Cuenta se notifica por igual a USUARIO y EMPRESA.
-- Ejecutar UNA sola vez sobre una base que tenga datos con el esquema viejo.
-- En bases nuevas no hace falta: DB_KROW.sql ya trae el esquema nuevo.

USE krow_db_in5bm;

-- 1) Si la columna vieja no existe, la migracion ya esta aplicada.
SET @tiene_vieja = (
    SELECT COUNT(*)
      FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = 'krow_db_in5bm'
       AND TABLE_NAME = 'Notificacion'
       AND COLUMN_NAME = 'usuario_id'
);

SET @sql = IF(@tiene_vieja > 0,
    'ALTER TABLE Notificacion ADD COLUMN cuenta_id INT NULL AFTER id_notificacion',
    'SELECT ''Notificacion.cuenta_id ya existe'' AS aviso');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2) Copiar los destinatarios existentes (usuario -> su cuenta)
UPDATE Notificacion n
  INNER JOIN Usuario u ON u.id_usuario = n.usuario_id
   SET n.cuenta_id = u.cuenta_id
 WHERE n.cuenta_id IS NULL;

-- 3) Quitar la columna vieja y la FK antigua
SET @sql2 = IF(@tiene_vieja > 0,
    'ALTER TABLE Notificacion DROP FOREIGN KEY fk_notificacion_usuario',
    'SELECT ''FK vieja ya no existe'' AS aviso');
PREPARE stmt2 FROM @sql2; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;

SET @sql3 = IF(@tiene_vieja > 0,
    'ALTER TABLE Notificacion DROP COLUMN usuario_id',
    'SELECT ''columna usuario_id ya no existe'' AS aviso');
PREPARE stmt3 FROM @sql3; EXECUTE stmt3; DEALLOCATE PREPARE stmt3;

-- 4) NOT NULL + FK hacia Cuenta (idempotente: solo si falta)
SET @tiene_fk = (
    SELECT COUNT(*)
      FROM information_schema.TABLE_CONSTRAINTS
     WHERE CONSTRAINT_SCHEMA = 'krow_db_in5bm'
       AND TABLE_NAME = 'Notificacion'
       AND CONSTRAINT_NAME = 'fk_notificacion_cuenta'
);

SET @sql4 = IF(@tiene_fk = 0,
    'ALTER TABLE Notificacion MODIFY cuenta_id INT NOT NULL,
        ADD CONSTRAINT fk_notificacion_cuenta FOREIGN KEY (cuenta_id)
        REFERENCES Cuenta(id_cuenta) ON DELETE CASCADE',
    'SELECT ''fk_notificacion_cuenta ya existe'' AS aviso');
PREPARE stmt4 FROM @sql4; EXECUTE stmt4; DEALLOCATE PREPARE stmt4;

SELECT 'Migracion 001 (Notificacion -> cuenta_id) aplicada' AS resultado;
