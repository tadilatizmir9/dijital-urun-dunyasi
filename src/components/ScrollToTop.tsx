import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/ga";

export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Scroll to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    // Track page view for analytics
    const fullPath = pathname + search;
    trackPageView(fullPath);
  }, [pathname, search]);

  return null;
}

