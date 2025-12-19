// Google Analytics 4 integration

let gaLoaded = false;
let measurementId: string | undefined;

/**
 * Initialize Google Analytics
 * Should be called once on app load
 */
export const initGA = (): void => {
  if (typeof window === "undefined") return;

  measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  // Skip if no measurement ID
  if (!measurementId || measurementId.trim() === "") {
    return;
  }

  // Skip if already loaded
  if (gaLoaded) {
    return;
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  
  // Define gtag function
  function gtag(...args: any[]) {
    if (window.dataLayer) {
      window.dataLayer.push(args);
    }
  }
  window.gtag = gtag;

  // Load GA script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize GA
  gtag("js", new Date());
  gtag("config", measurementId, {
    send_page_view: false, // We'll track page views manually
  });

  gaLoaded = true;
};

/**
 * Track a page view
 * @param pathname - Full path including query string (e.g., "/urunler?page=2")
 */
export const trackPageView = (pathname: string): void => {
  if (typeof window === "undefined") return;
  if (!measurementId || !gaLoaded || !window.gtag) return;

  // Skip admin routes
  if (pathname.startsWith("/admin")) {
    return;
  }

  // Skip redirect routes
  if (pathname.startsWith("/go/")) {
    return;
  }

  // Track page view
  window.gtag("config", measurementId, {
    page_path: pathname,
  });
};

