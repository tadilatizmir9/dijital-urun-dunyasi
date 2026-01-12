/**
 * Initialize Google Analytics 4
 * Only loads if VITE_GA_MEASUREMENT_ID is set in environment variables
 */
export function initGA(): void {
  if (typeof window === "undefined") return;

  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  console.log("[GA DEBUG] gaId:", gaId);
  console.log("[GA DEBUG] hostname:", window.location.hostname);

  // Skip if env variable is not set or empty
  if (!gaId || gaId.trim() === "") {
    return;
  }

  // Skip if placeholder value (shouldn't happen but safety check)
  if (gaId.includes("VITE_GA_MEASUREMENT_ID") || gaId.includes("%")) {
    return;
  }

  // Load GA script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer!.push(args);
  }
  window.gtag = gtag;

  gtag("js", new Date());
  // SPA olduğu için otomatik page_view kapalı
  gtag("config", gaId, { send_page_view: false });
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

