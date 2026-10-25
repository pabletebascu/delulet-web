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

// Formulario de prueba: más adelante lo conectaremos a un servicio real
document.getElementById("formulario").addEventListener("submit", (e) => {
  e.preventDefault();
  document.getElementById("aviso").hidden = false;
});
