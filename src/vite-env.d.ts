/// <reference types="vite/client" />

// Google Analytics types
declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export {};
