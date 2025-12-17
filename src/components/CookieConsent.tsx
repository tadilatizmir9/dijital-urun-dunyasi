import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const COOKIE_CONSENT_KEY = "cookie_consent";

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner if no choice exists
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-card border-t border-border shadow-lg rounded-t-2xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm sm:text-base text-foreground leading-relaxed">
                Bu web sitesi, deneyiminizi iyileştirmek için çerezler kullanır.{" "}
                <Link
                  to="/cerez-politikasi"
                  className="text-primary hover:underline font-medium"
                >
                  Çerez Politikası
                </Link>
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Button
                onClick={handleReject}
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                Reddet
              </Button>
              <Button
                onClick={handleAccept}
                size="sm"
                className="rounded-full"
              >
                Kabul Et
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
