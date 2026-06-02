const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-menu a");
const form = document.querySelector("#contact-form");
const feedback = document.querySelector("#form-feedback");
const year = document.querySelector("#year");

if (year) {
  year.textContent = new Date().getFullYear();
}

const setMenuState = (isOpen) => {
  navToggle?.setAttribute("aria-expanded", String(isOpen));
  navMenu?.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
};

navToggle?.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  setMenuState(!isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => setMenuState(false));
});

window.addEventListener("scroll", () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 10);
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const validators = {
  nombre: (value) => value.trim().length >= 2,
  telefono: (value) => value.replace(/\D/g, "").length >= 8,
  correo: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
  servicio: (value) => value.trim().length > 0,
  mensaje: (value) => value.trim().length >= 10,
};

const fieldLabels = {
  nombre: "nombre",
  telefono: "teléfono",
  correo: "correo",
  servicio: "tipo de servicio",
  mensaje: "mensaje",
};

const setFieldState = (field, isValid) => {
  field.setAttribute("aria-invalid", String(!isValid));
};

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const invalidFields = [];

  Object.entries(validators).forEach(([name, validate]) => {
    const field = form.elements[name];
    const isValid = validate(String(formData.get(name) || ""));
    setFieldState(field, isValid);

    if (!isValid) {
      invalidFields.push(fieldLabels[name]);
    }
  });

  if (invalidFields.length > 0) {
    feedback.textContent = `Revise estos campos: ${invalidFields.join(", ")}.`;
    feedback.classList.remove("success");
    form.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }

  feedback.textContent = "Solicitud validada. Gracias, pronto le contactaremos para coordinar la valoración.";
  feedback.classList.add("success");
  form.reset();
  form.querySelectorAll("[aria-invalid]").forEach((field) => field.removeAttribute("aria-invalid"));
});

form?.querySelectorAll("input, select, textarea").forEach((field) => {
  field.addEventListener("input", () => {
    if (!field.hasAttribute("aria-invalid")) {
      return;
    }

    const validate = validators[field.name];
    setFieldState(field, validate(String(field.value || "")));
  });
});
