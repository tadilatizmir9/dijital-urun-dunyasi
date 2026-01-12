/**
 * Initialize Google Analytics 4
 * Only loads if VITE_GA_MEASUREMENT_ID is set in environment variables
 */
export function initGA(): void {
  if (typeof window === "undefined") return;

  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!gaId || gaId.trim() === "") return;
  if (gaId.includes("VITE_GA_MEASUREMENT_ID") || gaId.includes("%")) return;

  // ✅ 1) Önce dataLayer + gtag kur
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer!.push(args);
  }
  window.gtag = gtag;

  // ✅ 2) Sonra gtag.js scriptini yükle
  const scriptId = "ga-gtag-js";
  if (!document.getElementById(scriptId)) {
    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);
  }

  // ✅ 3) Konfigürasyon + ilk page_view
  gtag("js", new Date());
  gtag("config", gaId, { send_page_view: true }); // şimdilik true yapıyoruz
}

/**
 * Track a page view for Google Analytics
 * @param path - Full path including query string (e.g., "/urunler?page=2")
 */
export function trackPageView(path: string): void {
  if (typeof window === "undefined") return;

  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  // Skip if GA not initialized
  if (!gaId || !window.gtag) return;

  // Skip admin routes
  if (path.startsWith("/admin")) {
    return;
  }

  // Skip redirect routes
  if (path.startsWith("/go/")) {
    return;
  }

  // Track page view as event
  window.gtag("event", "page_view", {
    page_path: path,
  });
}

