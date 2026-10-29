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
