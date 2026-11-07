// Menú del móvil: abrir y cerrar
const botonMenu = document.querySelector(".menu-boton");
const menu = document.querySelector(".menu");

botonMenu.addEventListener("click", () => {
  const abierto = menu.classList.toggle("abierto");
  botonMenu.setAttribute("aria-expanded", abierto);
});

menu.querySelectorAll("a").forEach((enlace) =>
  enlace.addEventListener("click", () => {
    menu.classList.remove("abierto");
    botonMenu.setAttribute("aria-expanded", false);
  })
);

// Formulario de contacto: los mensajes llegan al correo de Delulet a través de Web3Forms
const CLAVE_WEB3FORMS = "2b7e2a49-5285-49b2-8589-3ae5f6d05f7a";
const formulario = document.getElementById("formulario");
const aviso = document.getElementById("aviso");

formulario.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (formulario.botcheck.checked) return; // casilla trampa: solo la marcan los robots

  const boton = formulario.querySelector("button");
  boton.disabled = true;
  boton.textContent = "Enviando…";

  const datos = Object.fromEntries(new FormData(formulario));
  delete datos.botcheck;
  datos.access_key = CLAVE_WEB3FORMS;
  datos.subject = "Nuevo mensaje desde la web de Delulet";
  datos.from_name = "Web de Delulet";

  // Si el servicio no contesta en 15 segundos, se da por fallido
  const cancelar = new AbortController();
  const limite = setTimeout(() => cancelar.abort(), 15000);

  try {
    const respuesta = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(datos),
      signal: cancelar.signal,
    });
    const resultado = await respuesta.json();
    if (!respuesta.ok || resultado.success !== true) throw new Error(resultado.message || `HTTP ${respuesta.status}`);
    aviso.textContent = "¡Gracias! Hemos recibido tu mensaje y te responderemos muy pronto ♡";
    formulario.reset();
  } catch (error) {
    const detalle = error.name === "AbortError" ? "sin respuesta" : error.message;
    console.error("Formulario de contacto:", detalle);
    aviso.innerHTML = "";
    aviso.append(
      "No se ha podido enviar desde la web. ",
      enlaceCorreo(datos),
      Object.assign(document.createElement("small"), { className: "formulario__detalle", textContent: `(${detalle})` })
    );
  } finally {
    clearTimeout(limite);
    aviso.hidden = false;
    boton.disabled = false;
    boton.textContent = "Enviar";
  }
});

// Plan B si falla el envío: un enlace que abre el correo con el mensaje ya escrito
function enlaceCorreo(datos) {
  const cuerpo = [
    `Nombre: ${datos.nombre}`,
    `Email: ${datos.email}`,
    `Ocasión: ${datos.ocasion}`,
    `Fecha del evento: ${datos.fecha || "-"}`,
    "",
    datos.mensaje,
  ].join("\n");
  const enlace = document.createElement("a");
  enlace.href = `mailto:luletsworld@gmail.com?subject=${encodeURIComponent("Mensaje desde la web de Delulet")}&body=${encodeURIComponent(cuerpo)}`;
  enlace.textContent = "Pulsa aquí para enviarlo por correo con tu mensaje ya escrito.";
  return enlace;
}

// Carrusel de encargos: repite las tarjetas hasta llenar la pantalla y las duplica
// para que el deslizamiento sea continuo, sin saltos, haya las que haya
const carrusel = document.getElementById("carrusel");
// Con pocos encargos se muestran fijos: el carrusel solo arranca a partir de MINIMO_CARRUSEL
const MINIMO_CARRUSEL = 4;
const hayPocos = carrusel && carrusel.querySelectorAll(".encargo").length < MINIMO_CARRUSEL;
if (hayPocos) carrusel.classList.add("carrusel--fijo");

if (carrusel && !hayPocos && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const pista = carrusel.querySelector(".carrusel__pista");
  const originales = [...pista.children];
  const VELOCIDAD = 40; // píxeles por segundo

  const montar = () => {
    pista.classList.remove("en-marcha");
    pista.replaceChildren(...originales);
    const anchoGrupo = () => pista.scrollWidth;
    // Repetir el grupo hasta que ocupe al menos el ancho de la pantalla
    while (anchoGrupo() < carrusel.clientWidth) {
      originales.forEach((t) => pista.append(copia(t)));
    }
    const ancho = anchoGrupo();
    // Duplicar todo para que al llegar a la mitad vuelva a empezar sin que se note
    [...pista.children].forEach((t) => pista.append(copia(t)));
    pista.style.setProperty("--duracion", `${ancho / VELOCIDAD}s`);
    pista.classList.add("en-marcha");
  };

  const copia = (tarjeta) => {
    const c = tarjeta.cloneNode(true);
    c.setAttribute("aria-hidden", "true");
    return c;
  };

  let espera;
  addEventListener("resize", () => {
    clearTimeout(espera);
    espera = setTimeout(montar, 250);
  });
  montar();
}
