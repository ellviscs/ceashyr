"use client";

import { useEffect } from "react";

/**
 * Mendaftarkan Service Worker PWA (`/sw.js`) agar aplikasi dapat diinstal di Tablet/HP
 * dan tetap melayani shell halaman saat WiFi kantin bermasalah.
 */
export function PwaRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Abaikan kegagalan registrasi saat development tanpa HTTPS selain localhost
    });
  }, []);

  return null;
}
