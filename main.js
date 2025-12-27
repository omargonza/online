// ===== Configuración =====
const WHATSAPP_PHONE = "541126483009";
const BRAND_NAME = "Miss Noe Online English";

// IDs del HTML
const WHATS_IDS = ["ctaWhatsHero", "ctaWhatsSection", "ctaWhatsContact", "whatsFloat"];

// Storage keys (persistencia liviana)
const LS_GOAL = "missnoe_goal";
const LS_LEVEL = "missnoe_level";

// Estado global simple
const state = {
  goal: "",
  level: ""
};

function safeText(s) {
  return String(s || "").trim();
}

// ------- Tracking liviano (GA4 opcional) -------
function track(eventName, params = {}) {
  try {
    // Si tenés GA4 con gtag, esto dispara evento real
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params);
      return;
    }
  } catch (_) {}
  // Fallback no intrusivo
  // (Si no querés consola, podés borrar esta línea)
  console.debug("[track]", eventName, params);
}

// ===== WhatsApp: mensaje segmentado por objetivo + nivel =====
function buildWhatsAppLink({ goal, level }) {
  const base = `https://wa.me/${WHATSAPP_PHONE}`;
  const g = safeText(goal);
  const l = safeText(level);

  const templates = {
    "Trabajo / entrevistas": {
      opener: `Hola ${BRAND_NAME}. Quiero mejorar mi inglés para trabajo y entrevistas.`,
      bullets: ["Me interesa practicar entrevistas, reuniones y emails."],
      ask: "¿Me pasás planes, horarios y si hacen simulaciones de entrevista?"
    },
    "Conversación / fluidez": {
      opener: `Hola ${BRAND_NAME}. Quiero enfocarme en conversación y fluidez.`,
      bullets: ["Busco hablar más y ganar confianza."],
      ask: "¿Cómo son las clases (temas, correcciones) y qué horarios tenés?"
    },
    "Viajes": {
      opener: `Hola ${BRAND_NAME}. Quiero inglés práctico para viajes.`,
      bullets: ["Necesito frases reales, escucha y speaking para situaciones comunes."],
      ask: "¿Me recomendás un plan y cuántas clases por semana conviene?"
    },
    "Exámenes": {
      opener: `Hola ${BRAND_NAME}. Quiero prepararme para un examen de inglés.`,
      bullets: ["Necesito plan y práctica con enfoque en el examen."],
      ask: "¿Qué modalidad ofrecés y cómo sería el plan de preparación?"
    },
    "General": {
      opener: `Hola ${BRAND_NAME}. Quiero mejorar mi inglés en general.`,
      bullets: ["Busco un plan ordenado y seguimiento."],
      ask: "¿Me pasás opciones de planes y horarios?"
    }
  };

  const fallback = {
    opener: `Hola ${BRAND_NAME}, quiero info de clases de inglés online.`,
    bullets: [],
    ask: "¿Me pasás horarios, planes y disponibilidad?"
  };

  const tpl = templates[g] || fallback;

  const parts = [
    tpl.opener,
    g ? `Objetivo: ${g}.` : null,
    l ? `Nivel estimado: ${l}.` : null,
    ...tpl.bullets,
    tpl.ask
  ].filter(Boolean);

  const msg = parts.join(" ");
  return `${base}?text=${encodeURIComponent(msg)}`;
}

function setWhatsLinks() {
  const link = buildWhatsAppLink({ goal: state.goal, level: state.level });
  WHATS_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.href = link;
  });
}

function persistState() {
  try {
    localStorage.setItem(LS_GOAL, state.goal || "");
    localStorage.setItem(LS_LEVEL, state.level || "");
  } catch (_) {}
}

function restoreState() {
  try {
    state.goal = safeText(localStorage.getItem(LS_GOAL));
    state.level = safeText(localStorage.getItem(LS_LEVEL));
  } catch (_) {}
}

// ===== Mobile nav (robusta + accesible) =====
function initMobileNav() {
  const btn = document.getElementById("navToggle");
  const nav = document.getElementById("mobileNav");
  if (!btn || !nav) return;

  if (!btn.hasAttribute("aria-controls")) btn.setAttribute("aria-controls", "mobileNav");

  const isOpen = () => !nav.hasAttribute("hidden");

  const close = () => {
    if (!isOpen()) return;
    nav.setAttribute("hidden", "");
    btn.setAttribute("aria-expanded", "false");
  };

  const open = () => {
    if (isOpen()) return;
    nav.removeAttribute("hidden");
    btn.setAttribute("aria-expanded", "true");
  };

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    isOpen() ? close() : open();
  });

  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => close());
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  document.addEventListener("click", (e) => {
    if (!isOpen()) return;
    const target = e.target;
    if (!(target instanceof Element)) return;
    if (!nav.contains(target) && !btn.contains(target)) close();
  });
}

// ===== Reveal (con fallback) =====
function initReveal() {
  document.documentElement.classList.add("js");
  const items = Array.from(document.querySelectorAll(".reveal"));
  if (!items.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  if (!("IntersectionObserver" in window)) {
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

// ===== Chips + CTA PRO =====
function initChips() {
  const chips = Array.from(document.querySelectorAll(".chip"));
  const miniGoal = document.getElementById("miniGoal");
  const miniNivel = document.getElementById("miniNivel");

  const ctaHero = document.getElementById("ctaWhatsHero");
  const ctaSection = document.getElementById("ctaWhatsSection");
  const ctaContact = document.getElementById("ctaWhatsContact");

  // Copy PRO: HERO dinámico, resto neutro
  const ctaLabelsHero = {
    "Trabajo / entrevistas": "Quiero preparar entrevistas",
    "Conversación / fluidez": "Quiero ganar fluidez",
    "Viajes": "Quiero inglés para viajes",
    "Exámenes": "Quiero preparar un examen"
  };

  function updateCTA() {
    // HERO: dinámico
    if (ctaHero) {
      const label = ctaLabelsHero[state.goal] || "Consultar por WhatsApp";
      ctaHero.innerHTML = `<i class="fab fa-whatsapp"></i> ${label}`;
    }
    // SECTION + CONTACT: fijos (consistencia)
    if (ctaSection) ctaSection.innerHTML = `<i class="fab fa-whatsapp"></i> Abrir WhatsApp`;
    if (ctaContact) ctaContact.innerHTML = `<i class="fab fa-whatsapp"></i> Abrir WhatsApp`;
  }

  const updateMini = () => {
    if (miniGoal) miniGoal.textContent = state.goal || "A definir";
    if (miniNivel) miniNivel.textContent = state.level || "A definir";
    updateCTA();
  };

  const applyActiveChip = () => {
    chips.forEach((b) => {
      const g = safeText(b.dataset.goal);
      b.classList.toggle("chip-active", g && g === state.goal);
    });
  };

  // Click en chips (objetivo)
  chips.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.goal = safeText(btn.dataset.goal);
      applyActiveChip();
      updateMini();
      persistState();
      setWhatsLinks();

      track("select_goal", { goal: state.goal || "none" });

      // Micro-UX: llevar el usuario al CTA principal si está en pantalla
      // (no fuerza scroll si ya está cerca, pero ayuda en mobile)
      ctaHero?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  // Inicial
  applyActiveChip();
  updateMini();
  setWhatsLinks();

  // API pública
  return {
    setLevel: (lvl) => {
      state.level = safeText(lvl);
      updateMini();
      persistState();
      setWhatsLinks();
      track("set_level", { level: state.level || "none" });
    },
    setGoal: (g) => {
      state.goal = safeText(g);
      applyActiveChip();
      updateMini();
      persistState();
      setWhatsLinks();
      track("select_goal", { goal: state.goal || "none" });
    }
  };
}

function calcLevelFromScore(score) {
  if (score <= 1) return "A1–A2 (Principiante / Básico)";
  if (score === 2) return "B1 (Intermedio)";
  return "B2+ (Intermedio alto / Avanzado)";
}

// ===== Quiz + auto-objetivo PRO =====
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

  const renderMsg = (html) => {
    out.innerHTML = html;
    out.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  btn.addEventListener("click", (e) => {
    e.preventDefault();

    const a1 = getValue("q1");
    const a2 = getValue("q2");
    const a3 = getValue("q3");

    if (!a1 || !a2 || !a3) {
      out.textContent = "Completá las 3 preguntas para calcular tu nivel.";
      out.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    let score = 0;
    if (a1 === correct.q1) score++;
    if (a2 === correct.q2) score++;
    if (a3 === correct.q3) score++;

    const level = calcLevelFromScore(score);

    renderMsg(
      `<strong>Resultado:</strong> ${level}. ` +
        `<span class="muted">Te asesoramos y armamos el plan ideal.</span>`
    );

    // Auto-objetivo PRO: si no eligió ninguno, sugerimos el más genérico que convierte
    if (!state.goal && chipState?.setGoal) {
      chipState.setGoal("Conversación / fluidez");
    }

    // Actualiza nivel; NO pisa objetivo
    if (chipState?.setLevel) chipState.setLevel(level);
    else {
      state.level = level;
      persistState();
      setWhatsLinks();
    }

    track("quiz_result", { score, level });
  });

  if (reset) {
    reset.addEventListener("click", () => {
      ["q1", "q2", "q3"].forEach((n) => {
        document.querySelectorAll(`input[name="${n}"]`).forEach((i) => (i.checked = false));
      });

      out.textContent = "";

      if (chipState?.setLevel) chipState.setLevel("");
      else {
        state.level = "";
        persistState();
        setWhatsLinks();
      }

      track("quiz_reset");
    });
  }
}

// ===== Accordion =====
function initAccordion() {
  const items = Array.from(document.querySelectorAll(".acc-item"));
  if (!items.length) return;

  const closeAll = () => {
    items.forEach((b) => {
      b.setAttribute("aria-expanded", "false");
      const panel = b.nextElementSibling;
      if (panel && panel.classList.contains("acc-panel")) panel.setAttribute("hidden", "");
    });
  };

  items.forEach((btn) => {
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      closeAll();

      if (!expanded) {
        btn.setAttribute("aria-expanded", "true");
        const panel = btn.nextElementSibling;
        if (panel && panel.classList.contains("acc-panel")) panel.removeAttribute("hidden");
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });
}

// ===== Form: sincroniza el select “Objetivo” con WhatsApp =====
function initForm(chipState) {
  const form = document.getElementById("leadForm");
  const msg = document.getElementById("formMsg");
  if (!form || !msg) return;

  // Sync objetivo desde el select (PRO)
  const objetivoSelect = form.querySelector('select[name="objetivo"]');
  if (objetivoSelect) {
    objetivoSelect.addEventListener("change", () => {
      const val = safeText(objetivoSelect.value);
      if (!val) return;
      // Mapea “General” del select
      if (chipState?.setGoal) chipState.setGoal(val);
      else {
        state.goal = val;
        persistState();
        setWhatsLinks();
      }
      track("select_goal_form", { goal: val });
    });
  }

  form.addEventListener("submit", () => {
    msg.textContent = "Enviando…";
    track("lead_submit", { goal: state.goal || "none", level: state.level || "none" });
  });
}

// ===== WhatsApp click tracking (todos los botones) =====
function initWhatsTracking() {
  WHATS_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", () => {
      track("whatsapp_click", {
        id,
        goal: state.goal || "none",
        level: state.level || "none"
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Restaurar estado antes de inicializar módulos
  restoreState();

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  initMobileNav();
  initReveal();

  const chipState = initChips();

  initQuiz(chipState);
  initAccordion();
  initForm(chipState);
  initWhatsTracking();

  // Inicial por si algún bloque no ejecutó
  setWhatsLinks();
});
