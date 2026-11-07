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

// Formulario de contacto: los mensajes llegan al correo de Delulet a través de FormSubmit
const formulario = document.getElementById("formulario");
const aviso = document.getElementById("aviso");

formulario.addEventListener("submit", async (e) => {
  e.preventDefault();
  const boton = formulario.querySelector("button");
  boton.disabled = true;
  boton.textContent = "Enviando…";

  const datos = Object.fromEntries(new FormData(formulario));
  datos._subject = "Nuevo mensaje desde la web de Delulet";
  datos._template = "table";

  try {
    const respuesta = await fetch("https://formsubmit.co/ajax/luletsworld@gmail.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(datos),
    });
    const resultado = await respuesta.json();
    if (!respuesta.ok || String(resultado.success) !== "true") throw new Error(resultado.message);
    aviso.textContent = "¡Gracias! Hemos recibido tu mensaje y te responderemos muy pronto ♡";
    formulario.reset();
  } catch {
    aviso.textContent = "No se ha podido enviar. Escríbenos a luletsworld@gmail.com y te respondemos.";
  } finally {
    aviso.hidden = false;
    boton.disabled = false;
    boton.textContent = "Enviar";
  }
});

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
