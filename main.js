// ===== Configuración =====
const WHATSAPP_PHONE = "541126483009";
const BRAND_NAME = "Miss Noe Online English";

// IDs del HTML (corregidos)
const WHATS_IDS = ["ctaWhatsHero", "ctaWhatsSection", "ctaWhatsContact", "whatsFloat"];

// Estado global simple (para no pisar objetivo/nivel desde distintos módulos)
const state = {
  goal: "",
  level: ""
};

function buildWhatsAppLink({ goal, level }) {
  const base = `https://wa.me/${WHATSAPP_PHONE}`;
  const msg = [
    `Hola ${BRAND_NAME}, quiero info de clases de inglés online.`,
    goal ? `Objetivo: ${goal}.` : null,
    level ? `Nivel estimado: ${level}.` : null,
    "¿Me pasás horarios, planes y disponibilidad?"
  ]
    .filter(Boolean)
    .join(" ");

  return `${base}?text=${encodeURIComponent(msg)}`;
}

function setWhatsLinks() {
  const link = buildWhatsAppLink({ goal: state.goal, level: state.level });

  WHATS_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.href = link;
  });
}

function initMobileNav() {
  const btn = document.getElementById("navToggle");
  const nav = document.getElementById("mobileNav");
  if (!btn || !nav) return;

  btn.addEventListener("click", () => {
    const isOpen = !nav.hasAttribute("hidden");
    if (isOpen) {
      nav.setAttribute("hidden", "");
      btn.setAttribute("aria-expanded", "false");
    } else {
      nav.removeAttribute("hidden");
      btn.setAttribute("aria-expanded", "true");
    }
  });

  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      nav.setAttribute("hidden", "");
      btn.setAttribute("aria-expanded", "false");
    });
  });
}

function initReveal() {
  document.documentElement.classList.add("js");
  const items = Array.from(document.querySelectorAll(".reveal"));
  if (!items.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  items.forEach((el) => io.observe(el));
}

function initChips() {
  const chips = Array.from(document.querySelectorAll(".chip"));
  const miniGoal = document.getElementById("miniGoal");
  const miniNivel = document.getElementById("miniNivel");

  const updateMini = () => {
    if (miniGoal) miniGoal.textContent = state.goal || "A definir";
    if (miniNivel) miniNivel.textContent = state.level || "A definir";
  };

  // Click en chips (objetivo)
  chips.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.goal = btn.dataset.goal || "";

      chips.forEach((b) => b.classList.remove("chip-active"));
      btn.classList.add("chip-active");

      updateMini();
      setWhatsLinks();
    });
  });

  // Inicial
  updateMini();
  setWhatsLinks();

  // API pública
  return {
    setLevel: (lvl) => {
      state.level = (lvl || "").trim();
      updateMini();
      setWhatsLinks();
    },
    setGoal: (g) => {
      state.goal = (g || "").trim();
      updateMini();
      setWhatsLinks();
    }
  };
}

function calcLevelFromScore(score) {
  if (score <= 1) return "A1–A2 (Principiante / Básico)";
  if (score === 2) return "B1 (Intermedio)";
  return "B2+ (Intermedio alto / Avanzado)";
}

function initQuiz(chipState) {
  const btn = document.getElementById("btnCalcular");
  const reset = document.getElementById("btnReset");
  const out = document.getElementById("resultado");
  if (!btn || !out) return;

  const correct = { q1: "a", q2: "a", q3: "a" };

  function getValue(name) {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : "";
  }

  btn.addEventListener("click", (e) => {
    e.preventDefault();

    const a1 = getValue("q1");
    const a2 = getValue("q2");
    const a3 = getValue("q3");

    if (!a1 || !a2 || !a3) {
      out.textContent = "Completá las 3 preguntas para calcular tu nivel.";
      return;
    }

    let score = 0;
    if (a1 === correct.q1) score++;
    if (a2 === correct.q2) score++;
    if (a3 === correct.q3) score++;

    const level = calcLevelFromScore(score);

    out.innerHTML =
      `<strong>Resultado:</strong> ${level}. ` +
      `<span class="muted">Te asesoramos y armamos el plan ideal.</span>`;

    // Solo actualiza nivel; NO pisa objetivo
    if (chipState?.setLevel) chipState.setLevel(level);
    else {
      state.level = level;
      setWhatsLinks();
    }
  });

  if (reset) {
    reset.addEventListener("click", () => {
      ["q1", "q2", "q3"].forEach((n) => {
        document.querySelectorAll(`input[name="${n}"]`).forEach((i) => (i.checked = false));
      });

      out.textContent = "";

      // Resetea solo nivel; mantiene objetivo si el usuario ya eligió uno
      if (chipState?.setLevel) chipState.setLevel("");
      else {
        state.level = "";
        setWhatsLinks();
      }
    });
  }
}

function initAccordion() {
  const items = Array.from(document.querySelectorAll(".acc-item"));
  if (!items.length) return;

  items.forEach((btn) => {
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";

      items.forEach((b) => {
        b.setAttribute("aria-expanded", "false");
        const panel = b.nextElementSibling;
        if (panel && panel.classList.contains("acc-panel")) panel.setAttribute("hidden", "");
      });

      if (!expanded) {
        btn.setAttribute("aria-expanded", "true");
        const panel = btn.nextElementSibling;
        if (panel && panel.classList.contains("acc-panel")) panel.removeAttribute("hidden");
      }
    });
  });
}

function initForm() {
  const form = document.getElementById("leadForm");
  const msg = document.getElementById("formMsg");
  if (!form || !msg) return;

  form.addEventListener("submit", () => {
    msg.textContent = "Enviando…";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  initMobileNav();
  initReveal();

  const chipState = initChips();
  initQuiz(chipState);
  initAccordion();
  initForm();

  // Inicial por si algún bloque no ejecutó
  setWhatsLinks();
});
