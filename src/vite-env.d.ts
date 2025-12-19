/// <reference types="vite/client" />

// Google Analytics types
interface Window {
  dataLayer?: any[];
  gtag?: (...args: any[]) => void;
}
