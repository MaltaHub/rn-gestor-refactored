export async function clearClientState() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.clear();
    window.sessionStorage.clear();

    if (window.caches) {
      const keys = await window.caches.keys();
      await Promise.all(keys.map((k) => window.caches.delete(k)));
    }
  } catch (error) {
    console.warn("Failed to clear storage:", error);
  }

  // Limpar cookies supabase
  if (typeof document !== "undefined") {
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0]?.trim();
      if (name && (name.startsWith("sb-") || name.includes("supabase"))) {
        document.cookie = `${name}=;expires=${new Date(0).toUTCString()};path=/`;
      }
    });
  }
}
