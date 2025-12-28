/* =========================================================
   Miss Noe Online English — main.js (v2)
   Enfoque: CURSO ASÍNCRONO tipo Udemy + Mercado Pago + Classroom
   - WhatsApp: mensajes orientados a “curso grabado + soporte”
   - Botones: Comprar / Acceder / Consultar (sin romper si no existen)
   - Tracking liviano (GA4 opcional)
   - Test de nivel 25 (tu versión compatible con <details>)
========================================================= */

// ===== Configuración general =====
const BRAND_NAME = "Miss Noe Online English";
const WHATSAPP_PHONE = "541126483009";

// Base site (para armar links/canonical/UTM internos si querés)
const SITE_BASE_URL = "https://omargonza.github.io/online/";

// ===== Producto / Venta (ajustar con la clienta) =====
// Opción simple (recomendada para landing estática):
// 1) La clienta genera un LINK DE PAGO de Mercado Pago y lo pega acá.
// 2) Cuando paga, lo mandás a gracias.html con instrucciones + link de Classroom.
const MP_CHECKOUT_URL = ""; // <-- PEGAR ACÁ (ej: https://mpago.la/xxxxxx) o dejar vacío
const MP_ITEM_NAME = "Curso de Inglés Asincrónico (Acceso + Soporte)";

// Classroom: link de acceso o de invitación (depende de cómo lo manejen)
const CLASSROOM_URL = ""; // <-- PEGAR ACÁ (ej: https://classroom.google.com/u/0/c/XXXX)

// Soporte / WhatsApp
const WHATS_IDS = ["ctaWhatsHero", "ctaWhatsSection", "ctaWhatsContact", "whatsFloat"];

// IDs opcionales para compra/acceso (si no existen en HTML, no rompe)
const BUY_IDS = ["ctaBuyHero", "ctaBuyPlans", "ctaBuySticky"];     // Botones “Comprar”
const ACCESS_IDS = ["ctaAccessHero", "ctaAccessSection"];         // Botones “Acceder al curso”
const PRICE_TEXT_IDS = ["priceMpLabel"];                          // Texto de precio (si lo agregás)
const PAY_BADGE_IDS = ["payBadge"];                               // Badge “Mercado Pago” (si lo agregás)

// ===== Storage keys (persistencia) =====
const LS_GOAL = "missnoe_goal";
const LS_LEVEL = "missnoe_level";
const LS_TEST = "missnoe_leveltest_v1";

// Estado global simple
const state = { goal: "", level: "" };

function safeText(s) {
  return String(s || "").trim();
}

function qs(params = {}) {
  const u = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    const val = safeText(v);
    if (val) u.set(k, val);
  });
  const out = u.toString();
  return out ? `?${out}` : "";
}

// ------- Tracking liviano (GA4 opcional) -------
function track(eventName, params = {}) {
  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params);
      return;
    }
  } catch (_) {}
  console.debug("[track]", eventName, params);
}

// =====================================================
// WhatsApp: mensaje segmentado por objetivo + nivel
// (adaptado a CURSO ASINCRÓNICO + soporte)
// =====================================================
function buildWhatsAppLink({ goal, level, intent = "info" }) {
  const base = `https://wa.me/${WHATSAPP_PHONE}`;
  const g = safeText(goal);
  const l = safeText(level);

  // Intents: info | buy | access
  const intentLine =
    intent === "buy"
      ? "Quiero comprar el curso asincrónico."
      : intent === "access"
      ? "Ya pagué / quiero acceso al Classroom."
      : "Quiero info del curso asincrónico.";

  const templates = {
    "Trabajo / entrevistas": {
      opener: `Hola ${BRAND_NAME}. ${intentLine} Mi objetivo es mejorar mi inglés para trabajo y entrevistas.`,
      bullets: [
        "Me interesa practicar entrevistas, reuniones y emails.",
        "Prefiero modalidad grabada + ejercicios y soporte."
      ],
      ask: "¿Me pasás el link de Mercado Pago y cómo es el acceso por Classroom?"
    },
    "Conversación / fluidez": {
      opener: `Hola ${BRAND_NAME}. ${intentLine} Quiero enfocarme en conversación y fluidez.`,
      bullets: [
        "Busco hablar más y ganar confianza.",
        "Me sirve curso grabado + práctica guiada."
      ],
      ask: "¿Cómo es el curso (módulos, prácticas) y cómo me dan soporte?"
    },
    "Viajes": {
      opener: `Hola ${BRAND_NAME}. ${intentLine} Quiero inglés práctico para viajes.`,
      bullets: [
        "Necesito frases reales, escucha y speaking para situaciones comunes.",
        "Me sirve hacerlo a mi ritmo."
      ],
      ask: "¿Qué incluye el curso y cómo compro por Mercado Pago?"
    },
    "Exámenes": {
      opener: `Hola ${BRAND_NAME}. ${intentLine} Quiero prepararme para un examen de inglés.`,
      bullets: [
        "Necesito plan y práctica con enfoque en el examen.",
        "Modalidad asincrónica me viene bien."
      ],
      ask: "¿Qué incluye el curso y cómo sería el seguimiento?"
    },
    "General": {
      opener: `Hola ${BRAND_NAME}. ${intentLine} Quiero mejorar mi inglés en general.`,
      bullets: ["Busco un plan ordenado, práctica y seguimiento."],
      ask: "¿Me pasás el link de pago y cómo accedo al Classroom?"
    }
  };

  const fallback = {
    opener: `Hola ${BRAND_NAME}. ${intentLine}`,
    bullets: [],
    ask: "¿Me pasás precios, link de Mercado Pago y cómo es el acceso por Classroom?"
  };

  const tpl = templates[g] || fallback;

  const parts = [
    tpl.opener,
    g ? `Objetivo: ${g}.` : null,
    l ? `Nivel estimado (test): ${l}.` : null,
    ...tpl.bullets,
    tpl.ask
  ].filter(Boolean);

  const msg = parts.join(" ");
  return `${base}?text=${encodeURIComponent(msg)}`;
}

function setWhatsLinks(intent = "info") {
  const link = buildWhatsAppLink({ goal: state.goal, level: state.level, intent });
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

// =====================================================
// Mercado Pago + Classroom wiring (no rompe si no hay IDs)
// =====================================================
function buildMpCheckoutLink() {
  // Si la clienta te pasa un link MP directo, se usa.
  // Opcional: agregamos querystring para tracking interno.
  const base = safeText(MP_CHECKOUT_URL);
  if (!base) return ""; // modo “solo WhatsApp”

  // No todos los links aceptan query params sin romper; igual los agregamos de forma conservadora:
  // Si el link ya tiene "?", concatenamos con "&".
  const params = new URLSearchParams({
    src: "landing",
    goal: state.goal || "",
    level: state.level || ""
  });

  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}${params.toString()}`;
}

function setBuyLinks() {
  const mp = buildMpCheckoutLink();

  BUY_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    if (mp) {
      el.removeAttribute("disabled");
      el.setAttribute("href", mp);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
      el.addEventListener(
        "click",
        () => track("buy_click", { id, goal: state.goal || "none", level: state.level || "none", mp: "link" }),
        { once: true }
      );
    } else {
      // fallback: si no hay link MP, que abra WhatsApp con intención de compra
      el.setAttribute("href", buildWhatsAppLink({ goal: state.goal, level: state.level, intent: "buy" }));
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
      el.addEventListener(
        "click",
        () => track("buy_click", { id, goal: state.goal || "none", level: state.level || "none", mp: "whatsapp" }),
        { once: true }
      );
    }
  });

  // Opcional: textos o badges si los agregás
  PRICE_TEXT_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = mp ? "Pagá con Mercado Pago (link directo)" : "Pagá con Mercado Pago (te pasamos el link por WhatsApp)";
  });

  PAY_BADGE_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = "inline-flex";
  });
}

function setAccessLinks() {
  const url = safeText(CLASSROOM_URL);

  ACCESS_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    if (url) {
      el.setAttribute("href", url);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
      el.addEventListener("click", () => track("access_click", { id, via: "classroom" }), { once: true });
    } else {
      // fallback: WhatsApp (intención acceso)
      el.setAttribute("href", buildWhatsAppLink({ goal: state.goal, level: state.level, intent: "access" }));
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
      el.addEventListener("click", () => track("access_click", { id, via: "whatsapp" }), { once: true });
    }
  });
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

  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));

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

// ===== Chips + CTA (adaptado a asincrónico) =====
function initChips() {
  const chips = Array.from(document.querySelectorAll(".chip"));
  const miniGoal = document.getElementById("miniGoal");
  const miniNivel = document.getElementById("miniNivel");

  const ctaHero = document.getElementById("ctaWhatsHero");
  const ctaSection = document.getElementById("ctaWhatsSection");
  const ctaContact = document.getElementById("ctaWhatsContact");

  const ctaLabelsHero = {
    "Trabajo / entrevistas": "Consultar curso para trabajo",
    "Conversación / fluidez": "Consultar curso de fluidez",
    "Viajes": "Consultar curso para viajes",
    "Exámenes": "Consultar curso para exámenes"
  };

  function updateCTA() {
    if (ctaHero) {
      const label = ctaLabelsHero[state.goal] || "Consultar por WhatsApp";
      ctaHero.innerHTML = `<i class="fab fa-whatsapp"></i> ${label}`;
    }
    if (ctaSection) ctaSection.innerHTML = `<i class="fab fa-whatsapp"></i> Consultar por WhatsApp`;
    if (ctaContact) ctaContact.innerHTML = `<i class="fab fa-whatsapp"></i> Consultar por WhatsApp`;
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

  chips.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.goal = safeText(btn.dataset.goal);
      applyActiveChip();
      updateMini();
      persistState();

      // Rewire links dependientes de goal/level
      setWhatsLinks("info");
      setBuyLinks();
      setAccessLinks();

      track("select_goal", { goal: state.goal || "none" });
      ctaHero?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  applyActiveChip();
  updateMini();

  return {
    setLevel: (lvl) => {
      state.level = safeText(lvl);
      updateMini();
      persistState();

      setWhatsLinks("info");
      setBuyLinks();
      setAccessLinks();

      track("set_level", { level: state.level || "none" });
    },
    setGoal: (g) => {
      state.goal = safeText(g);
      applyActiveChip();
      updateMini();
      persistState();

      setWhatsLinks("info");
      setBuyLinks();
      setAccessLinks();

      track("select_goal", { goal: state.goal || "none" });
    }
  };
}

// =====================================================
// TEST 25 (A1–C1) · 5 secciones <details> + progreso + persistencia
// Compatible con tu HTML: sec_s1..sec_s5, secProg_s1..secProg_s5
// =====================================================
const TEST = {
  correct: {
    q1: "b", q2: "a", q3: "b", q4: "c", q5: "b",
    q6: "c", q7: "c", q8: "c", q9: "b", q10: "b",
    q11: "a", q12: "b", q13: "b", q14: "d", q15: "c",
    q16: "b", q17: "b", q18: "a", q19: "c", q20: "b",
    q21: "b", q22: "c", q23: "c", q24: "b", q25: "c"
  },
  sections: [
    { id: "s1", title: "Sección 1 · Gramática y Uso (1–8)", from: 1, to: 8 },
    { id: "s2", title: "Sección 2 · Vocabulario (9–12)", from: 9, to: 12 },
    { id: "s3", title: "Sección 3 · Lectura (13–15)", from: 13, to: 15 },
    { id: "s4", title: "Sección 4 · Intermedio–Avanzado (16–20)", from: 16, to: 20 },
    { id: "s5", title: "Sección 5 · Avanzado (21–25)", from: 21, to: 25 }
  ]
};

function testScoreToLevel(score) {
  if (score <= 7) return "A1 (Principiante)";
  if (score <= 12) return "A2 (Básico)";
  if (score <= 17) return "B1 (Intermedio)";
  if (score <= 21) return "B2 (Intermedio alto)";
  return "C1 (Avanzado)";
}

function loadTestState() {
  try {
    const raw = localStorage.getItem(LS_TEST);
    if (!raw) return { answers: {}, score: null, level: "" };
    const parsed = JSON.parse(raw);
    return {
      answers: parsed?.answers && typeof parsed.answers === "object" ? parsed.answers : {},
      score: Number.isFinite(parsed?.score) ? parsed.score : null,
      level: safeText(parsed?.level)
    };
  } catch (_) {
    return { answers: {}, score: null, level: "" };
  }
}

function saveTestState(obj) {
  try {
    localStorage.setItem(LS_TEST, JSON.stringify(obj));
  } catch (_) {}
}

function clearTestState() {
  try {
    localStorage.removeItem(LS_TEST);
  } catch (_) {}
}

function initLevelTest(chipState) {
  const root = document.getElementById("levelTest");
  if (!root) return;

  const btnCalc = document.getElementById("btnTestCalcular");
  const btnReset = document.getElementById("btnTestReset");
  const out = document.getElementById("testResultado");

  const progText = document.getElementById("testProgText");
  const progFill = document.getElementById("testProgFill");
  const progWrap = root.querySelector(".progressbar");

  const detailsById = {
    s1: document.getElementById("sec_s1"),
    s2: document.getElementById("sec_s2"),
    s3: document.getElementById("sec_s3"),
    s4: document.getElementById("sec_s4"),
    s5: document.getElementById("sec_s5")
  };

  const st = loadTestState();
  const allQ = Array.from({ length: 25 }, (_, i) => `q${i + 1}`);

  function countAnswered(answers) {
    return allQ.reduce((acc, k) => (answers[k] ? acc + 1 : acc), 0);
  }

  function scoreAnswers(answers) {
    let score = 0;
    allQ.forEach((k) => {
      if (answers[k] && answers[k] === TEST.correct[k]) score++;
    });
    return score;
  }

  function sectionProgress(answers, from, to) {
    let ans = 0;
    const tot = to - from + 1;
    for (let i = from; i <= to; i++) {
      if (answers[`q${i}`]) ans++;
    }
    return { ans, tot };
  }

  function updateProgressUI(answers) {
    const answered = countAnswered(answers);
    if (progText) progText.textContent = `${answered}/25 completadas`;

    const pct = Math.round((answered / 25) * 100);
    if (progFill) progFill.style.width = `${pct}%`;
    if (progWrap) progWrap.setAttribute("aria-valuenow", String(answered));

    TEST.sections.forEach((s) => {
      const el = document.getElementById(`secProg_${s.id}`);
      if (!el) return;
      const p = sectionProgress(answers, s.from, s.to);
      el.textContent = `${p.ans}/${p.tot}`;
    });
  }

  function openSection(secId) {
    const det = detailsById[secId];
    if (!det) return;

    Object.entries(detailsById).forEach(([id, d]) => {
      if (!d) return;
      if (id !== secId) d.removeAttribute("open");
    });

    det.setAttribute("open", "");
    det.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function findFirstIncompleteSection(answers) {
    for (const s of TEST.sections) {
      const p = sectionProgress(answers, s.from, s.to);
      if (p.ans < p.tot) return s.id;
    }
    return TEST.sections[0]?.id || "s1";
  }

  function focusFirstUnansweredInSection(sec) {
    if (!sec) return false;
    for (let i = sec.from; i <= sec.to; i++) {
      const k = `q${i}`;
      if (!st.answers[k]) {
        const firstOpt = root.querySelector(`input[name="${k}"]`);
        if (firstOpt) {
          const label = firstOpt.closest("label") || firstOpt;
          label.scrollIntoView({ behavior: "smooth", block: "center" });
          firstOpt.focus({ preventScroll: true });
        }
        return true;
      }
    }
    return false;
  }

  function renderResult(score, level) {
    if (!out) return;
    out.innerHTML =
      `<strong>Resultado:</strong> ${score}/25 · <strong>${level}</strong>. ` +
      `<span class="muted">Orientativo. Te recomendamos el módulo ideal del curso.</span>`;
    out.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // Restaurar radios
  Object.entries(st.answers).forEach(([k, v]) => {
    const input = root.querySelector(`input[name="${k}"][value="${v}"]`);
    if (input) input.checked = true;
  });

  // Solo una sección abierta
  Object.values(detailsById).forEach((det) => {
    if (!det) return;
    det.addEventListener("toggle", () => {
      if (!det.open) return;
      Object.values(detailsById).forEach((other) => {
        if (!other || other === det) return;
        other.removeAttribute("open");
      });
    });
  });

  root.addEventListener("change", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLInputElement)) return;
    if (t.type !== "radio") return;

    const name = safeText(t.name);
    const val = safeText(t.value).toLowerCase();
    if (!/^q\d+$/.test(name)) return;

    st.answers[name] = val;

    saveTestState({ answers: st.answers, score: st.score, level: st.level });
    updateProgressUI(st.answers);

    track("test_answer", { q: name, value: val });

    // Auto-advance por sección
    const qNum = Number(name.slice(1));
    const currentSec = TEST.sections.find((s) => qNum >= s.from && qNum <= s.to);
    if (currentSec) {
      const p = sectionProgress(st.answers, currentSec.from, currentSec.to);
      if (p.ans === p.tot) {
        const idx = TEST.sections.findIndex((s) => s.id === currentSec.id);
        const next = TEST.sections[idx + 1];
        if (next) openSection(next.id);
      }
    }
  });

  btnCalc?.addEventListener("click", (e) => {
    e.preventDefault();

    const answered = countAnswered(st.answers);
    if (answered < 25) {
      const secId = findFirstIncompleteSection(st.answers);
      openSection(secId);

      if (out) {
        out.textContent = "Completá las 25 preguntas para calcular tu nivel.";
        out.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      const sec = TEST.sections.find((s) => s.id === secId);
      focusFirstUnansweredInSection(sec);
      return;
    }

    st.score = scoreAnswers(st.answers);
    st.level = testScoreToLevel(st.score);

    saveTestState({ answers: st.answers, score: st.score, level: st.level });
    renderResult(st.score, st.level);

    if (chipState?.setLevel) chipState.setLevel(st.level);
    else {
      state.level = st.level;
      persistState();
      setWhatsLinks("info");
      setBuyLinks();
      setAccessLinks();
    }

    track("test_finish", { score: st.score, level: st.level });
  });

  btnReset?.addEventListener("click", (e) => {
    e.preventDefault();

    allQ.forEach((q) => {
      root.querySelectorAll(`input[name="${q}"]`).forEach((i) => (i.checked = false));
    });

    st.answers = {};
    st.score = null;
    st.level = "";
    clearTestState();
    updateProgressUI(st.answers);

    if (out) out.textContent = "";

    if (chipState?.setLevel) chipState.setLevel("");
    else {
      state.level = "";
      persistState();
      setWhatsLinks("info");
      setBuyLinks();
      setAccessLinks();
    }

    openSection(TEST.sections[0]?.id || "s1");
    track("test_reset");
  });

  updateProgressUI(st.answers);

  const initialSec = findFirstIncompleteSection(st.answers);
  openSection(initialSec);

  if (Number.isFinite(st.score) && st.level) {
    renderResult(st.score, st.level);
  }
}

// ===== Accordion (FAQ) =====
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

// ===== Form =====
function initForm(chipState) {
  const form = document.getElementById("leadForm");
  const msg = document.getElementById("formMsg");
  if (!form || !msg) return;

  const objetivoSelect = form.querySelector('select[name="objetivo"]');
  if (objetivoSelect) {
    objetivoSelect.addEventListener("change", () => {
      const val = safeText(objetivoSelect.value);
      if (!val) return;

      if (chipState?.setGoal) chipState.setGoal(val);
      else {
        state.goal = val;
        persistState();
        setWhatsLinks("info");
        setBuyLinks();
        setAccessLinks();
      }

      track("select_goal_form", { goal: val });
    });
  }

  form.addEventListener("submit", () => {
    msg.textContent = "Enviando…";
    track("lead_submit", { goal: state.goal || "none", level: state.level || "none", product: MP_ITEM_NAME });
  });
}

// ===== WhatsApp click tracking =====
function initWhatsTracking() {
  WHATS_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", () => {
      track("whatsapp_click", { id, goal: state.goal || "none", level: state.level || "none" });
    });
  });
}

// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {
  restoreState();

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  initMobileNav();
  initReveal();

  const chipState = initChips();

  initLevelTest(chipState);
  initAccordion();
  initForm(chipState);
  initWhatsTracking();

  // Wiring dinámico (depende de goal/level)
  setWhatsLinks("info");
  setBuyLinks();
  setAccessLinks();
});
