/**
 * Track a page view for Google Analytics
 * @param path - Full path including query string (e.g., "/urunler?page=2")
 */
export function trackPageView(path: string): void {
  if (typeof window === "undefined") return;
  
  // Get GA ID from window (set by HTML script)
  const gaId = (window as any).__GA_ID__;
  
  // Skip if GA not loaded
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

