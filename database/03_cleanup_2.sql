USE crud_express;

-- 1) Ver si hay títulos duplicados (solo diagnóstico)
SELECT titulo, COUNT(*) AS repeticiones
FROM productos
GROUP BY titulo
HAVING COUNT(*) > 1;

-- 2) ELIMINAR DUPLICADOS dejando la fila más nueva (id más alto) por cada título
DELETE p1
FROM productos p1
JOIN productos p2
  ON p1.titulo = p2.titulo
 AND p1.id < p2.id;

-- 3) Asegurar rutas correctas de imágenes (tal como las tienes, con mayúsculas/espacios)
UPDATE productos SET imagen_url = '/img/Jordan 1 Mid Bred.webp'   WHERE titulo='Jordan 1 Mid Bred';
UPDATE productos SET imagen_url = '/img/Jordan 4 Retro.webp'      WHERE titulo='Jordan 4 Retro';
UPDATE productos SET imagen_url = '/img/Botín Mujer Suede.webp'   WHERE titulo='Botín Mujer Suede';
UPDATE productos SET imagen_url = '/img/Tenis Niño Light.webp'    WHERE titulo='Tenis Niño Light';
UPDATE productos SET imagen_url = '/img/Casual Urban.webp'        WHERE titulo='Casual Urban';
UPDATE productos SET imagen_url = '/img/Bota Trek Pro.webp'       WHERE titulo='Bota Trek Pro';
UPDATE productos SET imagen_url = '/img/Sneaker Mujer Wave.webp'  WHERE titulo='Sneaker Mujer Wave';
UPDATE productos SET imagen_url = '/img/Jordan 1 Low Panda.webp'  WHERE titulo='Jordan 1 Low Panda';

-- 4) EVITAR que se vuelvan a duplicar: índice único por título
-- (Si ya existe un índice único, este ALTER fallará; no pasa nada.)
ALTER TABLE productos
  ADD UNIQUE KEY uq_productos_titulo (titulo);

-- 5) Verificación rápida
SELECT id, titulo, imagen_url FROM productos ORDER BY titulo, id;

