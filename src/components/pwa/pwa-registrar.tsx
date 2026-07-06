"use client";

import { useEffect } from "react";

export function PwaRegistrar() {
  useEffect(() => {
    const canRegister =
      "serviceWorker" in navigator &&
      (window.location.protocol === "https:" ||
        window.location.hostname === "localhost");

    if (!canRegister) {
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch((error: unknown) => {
      console.error("[pwa] service worker registration failed", error);
    });
  }, []);

  return null;
}
