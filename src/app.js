import "./style.css";

const LS_KEYS = {
  profile: "rpglog_profile_v1",
  quests: "rpglog_quests_v1",
  xp: "rpglog_xp_v1"
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function calcLevel(xp) {
  return Math.floor(xp / 100) + 1;
}

const netEl = document.getElementById("net");
const nameEl = document.getElementById("name");
const roleEl = document.getElementById("role");
const xpEl = document.getElementById("xp");
const levelEl = document.getElementById("level");

const questTextEl = document.getElementById("questText");
const addQuestBtn = document.getElementById("addQuest");
const questListEl = document.getElementById("questList");

const saveProfileBtn = document.getElementById("saveProfile");
const resetBtn = document.getElementById("reset");

let profile = loadJSON(LS_KEYS.profile, { name: "Orlando", role: "Guerrero" });
let quests = loadJSON(LS_KEYS.quests, [
  { id: crypto.randomUUID(), text: "Tomar agua", xp: 10, done: false },
  { id: crypto.randomUUID(), text: "Caminar 10 min", xp: 20, done: false }
]);
let xp = Number(localStorage.getItem(LS_KEYS.xp)) || 0;

function renderProfile() {
  nameEl.value = profile.name ?? "";
  roleEl.value = profile.role ?? "Guerrero";
  xpEl.textContent = String(xp);
  levelEl.textContent = String(calcLevel(xp));
}

function renderQuests() {
  questListEl.innerHTML = "";

  for (const q of quests) {
    const li = document.createElement("li");
    li.className = "item";

    const left = document.createElement("div");
    left.style.display = "flex";
    left.style.flexDirection = "column";
    left.style.gap = "4px";

    const title = document.createElement("strong");
    title.textContent = q.text;

    const meta = document.createElement("span");
    meta.className = "badge";
    meta.textContent = q.done ? `✅ Completada (+${q.xp} XP)` : `Pendiente (+${q.xp} XP)`;

    left.appendChild(title);
    left.appendChild(meta);

    const btn = document.createElement("button");
    btn.textContent = q.done ? "Hecha" : "Completar";
    btn.disabled = q.done;
    btn.addEventListener("click", () => completeQuest(q.id));

    li.appendChild(left);
    li.appendChild(btn);
    questListEl.appendChild(li);
  }
}

function saveAll() {
  saveJSON(LS_KEYS.profile, profile);
  saveJSON(LS_KEYS.quests, quests);
  localStorage.setItem(LS_KEYS.xp, String(xp));
}

function completeQuest(id) {
  const q = quests.find(x => x.id === id);
  if (!q || q.done) return;

  q.done = true;
  xp += Number(q.xp) || 0;

  saveAll();
  renderProfile();
  renderQuests();
}

saveProfileBtn.addEventListener("click", () => {
  profile = { name: nameEl.value.trim() || "Orlando", role: roleEl.value };
  saveAll();
  renderProfile();
});

addQuestBtn.addEventListener("click", () => {
  const text = questTextEl.value.trim();
  if (!text) return;

  quests.unshift({ id: crypto.randomUUID(), text, xp: 15, done: false });
  questTextEl.value = "";
  saveAll();
  renderQuests();
});

resetBtn.addEventListener("click", () => {
  localStorage.removeItem(LS_KEYS.profile);
  localStorage.removeItem(LS_KEYS.quests);
  localStorage.removeItem(LS_KEYS.xp);
  location.reload();
});

function updateNet() {
  netEl.textContent = navigator.onLine ? "Conexión: ONLINE 🟢" : "Conexión: OFFLINE 🔴";
}
window.addEventListener("online", updateNet);
window.addEventListener("offline", updateNet);

updateNet();
renderProfile();
renderQuests();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(console.warn);
  });
}

// ====== Botón instalar PWA (Chrome/Edge) ======
let deferredPrompt = null;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e) => {
  // Evita que el navegador muestre su mini-banner automático
  e.preventDefault();

  deferredPrompt = e;

  // Muestra tu botón
  if (installBtn) {
    installBtn.hidden = false;
    installBtn.disabled = false;
  }
});

if (installBtn) {
  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;

    // Abre el prompt nativo
    deferredPrompt.prompt();

    // Espera la respuesta del usuario
    const choice = await deferredPrompt.userChoice;
    console.log("Resultado instalación:", choice.outcome);

    // Limpia
    deferredPrompt = null;
    installBtn.hidden = true;
  });
}

// Cuando ya está instalada, oculta el botón
window.addEventListener("appinstalled", () => {
  console.log("PWA instalada ✅");
  if (installBtn) installBtn.hidden = true;
});