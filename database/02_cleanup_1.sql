USE crud_express;

-- 1) Desactiva safe-updates SOLO en esta sesión
SET SQL_SAFE_UPDATES = 0;

-- 2) (Opcional) Ver los duplicados antes de borrar
SELECT titulo, COUNT(*) AS repeticiones
FROM productos
GROUP BY titulo
HAVING COUNT(*) > 1;

-- 3) BORRAR duplicados dejando la fila más nueva (id más alto) por cada título
--    Usamos un subselect derivado para cumplir las reglas de MySQL
DELETE FROM productos
WHERE id IN (
  SELECT id FROM (
    SELECT p1.id
    FROM productos p1
    JOIN productos p2
      ON p1.titulo = p2.titulo
     AND p1.id < p2.id
  ) AS dups
);

-- 4) (Opcional) Asegura las rutas de imagen por si quedaron inconsistencias
UPDATE productos SET imagen_url = '/img/Jordan 1 Mid Bred.webp'   WHERE titulo='Jordan 1 Mid Bred';
UPDATE productos SET imagen_url = '/img/Jordan 4 Retro.webp'      WHERE titulo='Jordan 4 Retro';
UPDATE productos SET imagen_url = '/img/Botín Mujer Suede.webp'   WHERE titulo='Botín Mujer Suede';
UPDATE productos SET imagen_url = '/img/Tenis Niño Light.webp'    WHERE titulo='Tenis Niño Light';
UPDATE productos SET imagen_url = '/img/Casual Urban.webp'        WHERE titulo='Casual Urban';
UPDATE productos SET imagen_url = '/img/Bota Trek Pro.webp'       WHERE titulo='Bota Trek Pro';
UPDATE productos SET imagen_url = '/img/Sneaker Mujer Wave.webp'  WHERE titulo='Sneaker Mujer Wave';
UPDATE productos SET imagen_url = '/img/Jordan 1 Low Panda.webp'  WHERE titulo='Jordan 1 Low Panda';

-- 5) Evitar que se vuelvan a duplicar a futuro
--    (Si ya existe el índice único, este ALTER puede fallar y no pasa nada)
ALTER TABLE productos
  ADD UNIQUE KEY uq_productos_titulo (titulo);

-- 6) Verificación final
SELECT id, titulo, imagen_url
FROM productos
ORDER BY titulo, id;


