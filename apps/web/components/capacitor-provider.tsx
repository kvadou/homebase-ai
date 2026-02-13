"use client";

import * as React from "react";
import { isNativeApp } from "@/lib/capacitor";
import { useTheme } from "@/components/theme-provider";

export function CapacitorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();

  React.useEffect(() => {
    if (!isNativeApp()) return;

    async function initNative() {
      try {
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        await StatusBar.setStyle({
          style: resolvedTheme === "dark" ? Style.Light : Style.Dark,
        });
        await StatusBar.setBackgroundColor({
          color: resolvedTheme === "dark" ? "#0f1923" : "#0A2E4D",
        });
      } catch {
        // StatusBar not available on web
      }

      try {
        const { SplashScreen } = await import("@capacitor/splash-screen");
        await SplashScreen.hide();
      } catch {
        // SplashScreen not available on web
      }

      try {
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
  }, [resolvedTheme]);

  return <>{children}</>;
}
