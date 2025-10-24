-- ============================================================
-- CREAR TABLA 'pedidos' SI NO EXISTE
-- Base de datos: crud_express
-- Autor: Oscar Mendoza
-- Descripción: Tabla que almacena las compras finalizadas
-- ============================================================

-- Selecciona la base de datos
USE crud_express;

-- Crea la tabla pedidos si no existe
CREATE TABLE IF NOT EXISTS pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,              -- ID único del pedido
  usuario_id INT NOT NULL,                        -- ID del usuario que realizó la compra
  subtotal DECIMAL(10,2) NOT NULL,                -- Total antes de impuestos
  iva DECIMAL(10,2) NOT NULL,                     -- Impuesto agregado
  envio DECIMAL(10,2) NOT NULL,                   -- Costo de envío
  total DECIMAL(10,2) NOT NULL,                   -- Total final a pagar
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Fecha y hora de creación
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) -- Relación con la tabla usuarios
);

-- ============================================================
-- COMPROBAR QUE LA TABLA SE CREÓ CORRECTAMENTE
-- ============================================================

-- Muestra todas las tablas de la base de datos
SHOW TABLES;

-- Muestra la estructura (columnas) de la tabla pedidos
DESCRIBE pedidos;

-- ============================================================
-- PRUEBA OPCIONAL: INSERTAR UN PEDIDO DE EJEMPLO
-- ============================================================

INSERT INTO pedidos (usuario_id, subtotal, iva, envio, total)
VALUES (1, 100.00, 12.00, 0.00, 112.00);

-- Verifica que el pedido se haya guardado correctamente
SELECT * FROM pedidos;
