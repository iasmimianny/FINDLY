export const loadingCycleMs = 2400;

// Keep successful responses until the current search animation completes.
// Failures remain immediate; leaving the page cancels the pending reveal.
export function finishLoadingCycle(startedAt: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) return Promise.reject(new DOMException("Aborted", "AbortError"));
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return Promise.resolve();
  const elapsed = performance.now() - startedAt;
  const remaining = loadingCycleMs - (elapsed % loadingCycleMs);
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, remaining);
    function abort() {
      window.clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      reject(new DOMException("Aborted", "AbortError"));
    }
    signal.addEventListener("abort", abort, { once: true });
  });
}
