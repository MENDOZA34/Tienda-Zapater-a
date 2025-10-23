// Lee las filas del carrito y calcula en cliente
(function(){
  const rows = Array.from(document.querySelectorAll('[data-cart-row]'));
  const spanSubtotal = document.querySelector('[data-subtotal]');
  const spanIva = document.querySelector('[data-iva]');
  const spanEnvio = document.querySelector('[data-envio]');
  const spanTotal = document.querySelector('[data-total]');
  const inputHiddenSubtotal = document.querySelector('input[name="subtotal"]');
  const inputHiddenIva = document.querySelector('input[name="iva"]');
  const inputHiddenEnvio = document.querySelector('input[name="envio"]');
  const inputHiddenTotal = document.querySelector('input[name="total"]');

  if (!rows.length || !spanSubtotal) return;

  function recalc(){
    // Suma subtotales por fila
    let subtotal = rows.reduce((acc, tr) => {
      const precio = parseFloat(tr.getAttribute('data-precio')) || 0;
      const cant = parseInt(tr.querySelector('[data-cant]')?.textContent || '1', 10);
      return acc + precio * cant;
    }, 0);

    // IVA Guatemala 12%
    const iva = +(subtotal * 0.12).toFixed(2);
    // Envío simple: Q35 si subtotal < Q500, si no Q0
    const envio = subtotal >= 500 ? 0 : 35;
    const total = +(subtotal + iva + envio).toFixed(2);

    spanSubtotal.textContent = 'Q' + subtotal.toFixed(2);
    spanIva.textContent = 'Q' + iva.toFixed(2);
    spanEnvio.textContent = 'Q' + envio.toFixed(2);
    spanTotal.textContent = 'Q' + total.toFixed(2);

    // pasa los valores calculados al form de checkout (POST)
    if (inputHiddenSubtotal) inputHiddenSubtotal.value = subtotal.toFixed(2);
    if (inputHiddenIva)      inputHiddenIva.value      = iva.toFixed(2);
    if (inputHiddenEnvio)    inputHiddenEnvio.value    = envio.toFixed(2);
    if (inputHiddenTotal)    inputHiddenTotal.value    = total.toFixed(2);
  }

  recalc();
})();
