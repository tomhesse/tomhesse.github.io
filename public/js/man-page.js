/* Minimal `less`-style chrome for the man page: a status bar that tracks
   scroll position, plus the handful of key bindings that go with it. */

const FLAVORS = ["latte", "frappe", "macchiato", "mocha"];
const FLAVOR_NAMES = {
  latte: "Latte",
  frappe: "Frappé",
  macchiato: "Macchiato",
  mocha: "Mocha",
};
const STORAGE_KEY = "catppuccin-flavor";
const SCROLL_STEP = 20;
const MESSAGE_TIMEOUT = 1500;

const statusBar = document.getElementById("status-bar");
const root = document.documentElement;

let flavor = root.dataset.flavor || "mocha";
let messageTimer = null;
let pendingG = false;

/* ---------- status bar ---------- */

function scrollPercent() {
  const scrollable = root.scrollHeight - window.innerHeight;
  if (scrollable <= 0) return 100;
  return Math.ceil((window.scrollY / scrollable) * 100);
}

function renderStatus() {
  clearTimeout(messageTimer);
  messageTimer = null;
  const percent = scrollPercent();
  const position = percent >= 100 ? "(END)" : `${percent}%`;
  statusBar.classList.remove("muted");
  // Each page's <title> is its man page name, e.g. "tom(1)", "datenschutz(7)".
  statusBar.textContent = `Manual page ${document.title} ${position}`;
}

function flashStatus(text) {
  clearTimeout(messageTimer);
  statusBar.classList.remove("muted");
  statusBar.textContent = text;
  messageTimer = setTimeout(renderStatus, MESSAGE_TIMEOUT);
}

/* ---------- theme ---------- */

function applyFlavor(next, { remember }) {
  flavor = next;
  root.classList.add("theme-transition");
  root.dataset.flavor = next;
  if (remember) localStorage.setItem(STORAGE_KEY, next);
  setTimeout(() => root.classList.remove("theme-transition"), 200);
}

function cycleFlavor() {
  const next = FLAVORS[(FLAVORS.indexOf(flavor) + 1) % FLAVORS.length];
  applyFlavor(next, { remember: true });
  flashStatus(`Catppuccin ${FLAVOR_NAMES[next]}`);
}

/* Follow the system theme only while the visitor has not picked one. */
window
  .matchMedia("(prefers-color-scheme: light)")
  .addEventListener("change", (e) => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    applyFlavor(e.matches ? "latte" : "mocha", { remember: false });
  });

/* ---------- key bindings ---------- */

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  /* `gg` jumps to the top, so `g` alone only arms the sequence. */
  if (e.key === "g") {
    if (pendingG) {
      pendingG = false;
      window.scrollTo(0, 0);
      e.preventDefault();
    } else {
      pendingG = true;
    }
    return;
  }
  pendingG = false;

  switch (e.key) {
    case "j":
      window.scrollBy(0, SCROLL_STEP);
      break;
    case "k":
      window.scrollBy(0, -SCROLL_STEP);
      break;
    case "G":
      window.scrollTo(0, root.scrollHeight);
      break;
    case "t":
      cycleFlavor();
      break;
    case "y":
      navigator.clipboard
        ?.writeText("contact@tomhesse.xyz")
        .then(() => flashStatus("copied: contact@tomhesse.xyz"))
        .catch(() => flashStatus("clipboard unavailable"));
      break;
    case "e":
      window.location.href = "mailto:contact@tomhesse.xyz";
      break;
    default:
      return;
  }

  e.preventDefault();
});

document.addEventListener("scroll", () => {
  if (messageTimer) return;
  renderStatus();
}, { passive: true });

window.addEventListener("resize", renderStatus);

renderStatus();
