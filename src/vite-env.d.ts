/// <reference types="vite/client" />

// Google Analytics types
declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    __GA_ID__?: string;
    __VITE_GA_MEASUREMENT_ID__?: string;
  }
}

export {};
