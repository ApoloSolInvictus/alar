const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-menu a");
const form = document.querySelector("#contact-form");
const feedback = document.querySelector("#form-feedback");
const year = document.querySelector("#year");
const heroSlider = document.querySelector("[data-hero-slider]");
const heroSlidesLayer = document.querySelector("[data-hero-slides]");
const heroSlideToggle = document.querySelector("[data-slide-toggle]");
const heroSlideCurrent = document.querySelector("[data-slide-current]");
const heroSlideTotal = document.querySelector("[data-slide-total]");
const heroSlideProgress = document.querySelector("[data-slide-progress]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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

const heroImages = [];
const firstHeroImage = heroSlidesLayer?.querySelector("[data-hero-slide]");
const heroImageCount = Number(heroSlider?.dataset.slideCount || 0);
let activeHeroIndex = 0;
let rotationPaused = reducedMotion.matches;
let rotationTimer = null;

if (firstHeroImage && heroSlidesLayer) {
  heroImages.push(firstHeroImage);

  for (let index = 1; index < heroImageCount; index += 1) {
    const image = new Image();
    image.className = "hero-slide";
    image.alt = "";
    image.width = 1600;
    image.height = 720;
    image.decoding = "async";
    image.loading = "eager";
    image.src = `assets/images/${index + 1}.jpeg`;
    heroSlidesLayer.append(image);
    heroImages.push(image);
  }
}

const showHeroSlide = (index) => {
  if (heroImages.length === 0) {
    return;
  }

  activeHeroIndex = (index + heroImages.length) % heroImages.length;
  heroImages.forEach((image, imageIndex) => {
    image.classList.toggle("is-active", imageIndex === activeHeroIndex);
  });

  if (heroSlideCurrent) {
    heroSlideCurrent.textContent = String(activeHeroIndex + 1).padStart(2, "0");
  }
  if (heroSlideTotal) {
    heroSlideTotal.textContent = String(heroImages.length).padStart(2, "0");
  }
  heroSlideProgress?.style.setProperty("transform", `scaleX(${(activeHeroIndex + 1) / heroImages.length})`);
};

const stopHeroRotation = () => {
  if (rotationTimer !== null) {
    window.clearInterval(rotationTimer);
    rotationTimer = null;
  }
};

const startHeroRotation = () => {
  if (rotationPaused || document.hidden || heroImages.length < 2 || rotationTimer !== null) {
    return;
  }

  rotationTimer = window.setInterval(() => showHeroSlide(activeHeroIndex + 1), 4000);
};

const setHeroRotationPaused = (paused) => {
  rotationPaused = paused;
  stopHeroRotation();

  const label = rotationPaused ? "Reanudar presentación" : "Pausar presentación";
  heroSlideToggle?.setAttribute("aria-label", label);
  heroSlideToggle?.setAttribute("title", label);
  heroSlideToggle?.querySelector("use")?.setAttribute("href", rotationPaused ? "#icon-play" : "#icon-pause");
  startHeroRotation();
};

showHeroSlide(0);
setHeroRotationPaused(rotationPaused);

heroSlider?.querySelector("[data-slide-previous]")?.addEventListener("click", () => {
  showHeroSlide(activeHeroIndex - 1);
  if (!rotationPaused) {
    stopHeroRotation();
    startHeroRotation();
  }
});

heroSlider?.querySelector("[data-slide-next]")?.addEventListener("click", () => {
  showHeroSlide(activeHeroIndex + 1);
  if (!rotationPaused) {
    stopHeroRotation();
    startHeroRotation();
  }
});

heroSlideToggle?.addEventListener("click", () => setHeroRotationPaused(!rotationPaused));

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopHeroRotation();
  } else {
    startHeroRotation();
  }
});

reducedMotion.addEventListener?.("change", (event) => {
  if (event.matches) {
    setHeroRotationPaused(true);
  }
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
