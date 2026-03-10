/**
 * Think'AI — Formulaire d'Adhésion
 * Front-end script — envoie les données au backend Node.js (server.js)
 * Le backend se charge d'envoyer le mail stylisé.
 */

const BACKEND_URL = "http://localhost:3000/send"; // ← adaptez si besoin

// ─── TOAST NOTIFICATIONS ─────────────────────────────────
function showToast(type, title, message, duration = 4500) {
  const container = document.getElementById("toast-container");

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  const iconClass = type === "success" ? "fa-circle-check" : "fa-circle-xmark";

  toast.innerHTML = `
    <div class="toast-icon"><i class="fa-solid ${iconClass}"></i></div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" aria-label="Fermer"><i class="fa-solid fa-xmark"></i></button>
    <div class="toast-progress"></div>
  `;

  container.appendChild(toast);

  // Trigger show animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add("show"));
  });

  // Close button
  toast
    .querySelector(".toast-close")
    .addEventListener("click", () => dismissToast(toast));

  // Auto-dismiss
  const timer = setTimeout(() => dismissToast(toast), duration);
  toast._timer = timer;

  // Pause progress on hover
  toast.addEventListener("mouseenter", () => {
    clearTimeout(toast._timer);
    const progress = toast.querySelector(".toast-progress");
    if (progress) progress.style.animationPlayState = "paused";
  });
  toast.addEventListener("mouseleave", () => {
    toast._timer = setTimeout(() => dismissToast(toast), 1500);
    const progress = toast.querySelector(".toast-progress");
    if (progress) progress.style.animationPlayState = "running";
  });
}

function dismissToast(toast) {
  clearTimeout(toast._timer);
  toast.classList.remove("show");
  toast.classList.add("hide");
  toast.addEventListener("transitionend", () => toast.remove(), { once: true });
}

// ─── HELPERS ─────────────────────────────────────────────
const get = (id) => document.getElementById(id);
const val = (id) => {
  const el = get(id);
  return el?.value?.trim() ?? "";
};
const setErr = (fieldId, errId, show) => {
  const input = get(fieldId);
  const msg = get(errId);
  if (!input || !msg) return;
  input.classList.toggle("has-error", show);
  msg.classList.toggle("show", show);
};

// ─── VALIDATION ──────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate() {
  let ok = true;

  const checks = [
    ["nom", "e-nom", val("nom") !== ""],
    ["prenom", "e-prenom", val("prenom") !== ""],
    ["fonction", "e-fonction", val("fonction") !== ""],
    ["entreprise", "e-entreprise", val("entreprise") !== ""],
    ["email", "e-email", EMAIL_RE.test(val("email"))],
    ["telephone", "e-telephone", val("telephone") !== ""],
  ];

  checks.forEach(([fid, eid, valid]) => {
    setErr(fid, eid, !valid);
    if (!valid) ok = false;
  });

  return ok;
}

// ─── CLEAR ERRORS ON INPUT ───────────────────────────────
["nom", "prenom", "fonction", "entreprise", "email", "telephone"].forEach(
  (id) => {
    get(id)?.addEventListener("input", () => setErr(id, `e-${id}`, false));
    get(id)?.addEventListener("change", () => setErr(id, `e-${id}`, false));
  },
);

// ─── SHOW / HIDE ─────────────────────────────────────────
function showSuccess() {
  get("form").style.display = "none";
  get("form-head").style.display = "none"; // ← masque le titre au succès
  get("success").classList.add("show");
}

function resetForm() {
  get("form").reset();
  get("form").style.display = "";
  get("form-head").style.display = ""; // ← réaffiche le titre
  get("success").classList.remove("show");

  ["nom", "prenom", "fonction", "entreprise", "email", "telephone"].forEach(
    (id) => {
      setErr(id, `e-${id}`, false);
    },
  );
}

// ─── SUBMIT ──────────────────────────────────────────────
get("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validate()) return;

  const btn = get("submit-btn");
  btn.disabled = true;
  btn.classList.add("loading");
  btn.querySelector(".spinner").classList.remove("hidden");

  const data = {
    nom: val("nom"),
    prenom: val("prenom"),
    fonction: val("fonction"),
    entreprise: val("entreprise"),
    email: val("email"),
    telephone: val("telephone"),
    date: new Date().toLocaleString("fr-FR", {
      dateStyle: "long",
      timeStyle: "short",
    }),
  };

  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }

    showSuccess();
  } catch (err) {
    console.error("Erreur envoi :", err);
    showToast(
      "error",
      "Échec de l'envoi",
      "Veuillez réessayer ou contacter l'équipe Think'AI.<br/><small style='opacity:0.7'>" +
        err.message +
        "</small>",
    );
  } finally {
    btn.disabled = false;
    btn.classList.remove("loading");
    btn.querySelector(".spinner").classList.add("hidden");
  }
});

// ─── INIT ────────────────────────────────────────────────
(function init() {
  console.log(
    "%c Think'AI%c  Formulaire prêt ",
    "background:#600503;color:#fcc901;padding:3px 6px;border-radius:3px 0 0 3px;font-weight:bold;",
    "background:#fcc901;color:#600503;padding:3px 6px;border-radius:0 3px 3px 0;font-weight:bold;",
  );
})();
