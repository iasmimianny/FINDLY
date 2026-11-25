const inFlight = new Map<string, Promise<Response>>();

// Each caller gets its own response body, but a single Next process rotates
// a given token only once while parallel requests are waiting.
export async function refreshSession(apiUrl: string, refresh: string): Promise<Response> {
  const key = JSON.stringify([apiUrl, refresh]);
  let pending = inFlight.get(key);
  if (!pending) {
    pending = fetch(`${apiUrl}/api/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refresh }),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10000),
    }).finally(() => inFlight.delete(key));
    inFlight.set(key, pending);
  }
  return (await pending).clone();
}
