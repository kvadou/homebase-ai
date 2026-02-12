"use client";

import * as React from "react";
import { isNativeApp } from "@/lib/capacitor";

export function CapacitorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!isNativeApp()) return;

    async function initNative() {
      try {
        // Initialize StatusBar
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: "#0A2E4D" });
      } catch {
        // StatusBar not available on web
      }

      try {
        // Hide splash screen
        const { SplashScreen } = await import("@capacitor/splash-screen");
        await SplashScreen.hide();
      } catch {
        // SplashScreen not available on web
      }

      try {
        // Listen for keyboard events
        const { Keyboard } = await import("@capacitor/keyboard");
        Keyboard.addListener("keyboardWillShow", () => {
          document.body.classList.add("keyboard-open");
        });
        Keyboard.addListener("keyboardWillHide", () => {
          document.body.classList.remove("keyboard-open");
        });
      } catch {
        // Keyboard not available on web
      }
    }

    initNative();
  }, []);

  return <>{children}</>;
}
