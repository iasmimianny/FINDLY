const storageKey = "findly:sidebar:collapsed";
const changeEvent = "findly:sidebar-change";
let sessionPreference: boolean | undefined;

export function sidebarSnapshot() {
  if (typeof window === "undefined") return false;
  if (sessionPreference !== undefined) return sessionPreference;
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored === "true" || stored === "false") return stored === "true";
  } catch { /* Storage may be disabled; keep the control usable in this tab. */ }
  return window.matchMedia?.("(max-width: 767px)").matches ?? false;
}

export function setSidebarCollapsed(collapsed: boolean) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(storageKey, String(collapsed)); sessionPreference = undefined; }
  catch { sessionPreference = collapsed; }
  window.dispatchEvent(new Event(changeEvent));
}

export function subscribeSidebar(callback: () => void) {
  const storage = () => { sessionPreference = undefined; callback(); };
  window.addEventListener("storage", storage);
  window.addEventListener("resize", callback);
  window.addEventListener(changeEvent, callback);
  return () => {
    window.removeEventListener("storage", storage);
    window.removeEventListener("resize", callback);
    window.removeEventListener(changeEvent, callback);
  };
}

export function serverSidebarSnapshot() { return false; }
