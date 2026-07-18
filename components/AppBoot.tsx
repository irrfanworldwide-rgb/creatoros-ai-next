"use client";

import { useEffect, useState } from "react";
import SplashScreen from "@/components/SplashScreen";

const SPLASH_SESSION_KEY = "creatoros_splash_shown";

export default function AppBoot({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SPLASH_SESSION_KEY)) {
        setShowSplash(false);
      }
    } catch {
      // sessionStorage unavailable (privacy mode, etc.) — just show the splash once, no crash.
    }
  }, []);

  function handleSplashComplete() {
    try {
      sessionStorage.setItem(SPLASH_SESSION_KEY, "1");
    } catch {
      // ignore — non-critical
    }
    setShowSplash(false);
  }

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      {children}
    </>
  );
}
