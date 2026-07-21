"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "pt_install_dismissed_at";
const SNOOZE_DAYS = 7;

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true
  );
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function recentlyDismissed() {
  const dismissedAt = localStorage.getItem(DISMISS_KEY);
  if (!dismissedAt) return false;
  const daysSince = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
  return daysSince < SNOOZE_DAYS;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;

    if (isIOS()) {
      // iOS Safari has no beforeinstallprompt event — show manual instructions instead.
      setShowIOSHelp(true);
      setVisible(true);
      return;
    }

    function handleBeforeInstallPrompt(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    }
    function handleInstalled() {
      setVisible(false);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  }

  async function install() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
    if (outcome !== "accepted") {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }
  }

  if (!visible) return null;

  return (
    <div className="floating-banner" style={{ top: 16, zIndex: 60 }}>
      {showIOSHelp ? (
        <span style={{ fontSize: 12 }}>
          Install this app: tap <strong>Share</strong> ⬆️ then <strong>Add to Home Screen</strong>.
        </span>
      ) : (
        <span style={{ fontSize: 12 }}>Install Personal Tracker for quick access?</span>
      )}
      <div className="floating-banner-actions">
        {!showIOSHelp && (
          <button className="btn-primary" onClick={install} style={{ fontSize: 11 }}>
            Install
          </button>
        )}
        <button onClick={dismiss} style={{ fontSize: 11 }}>
          {showIOSHelp ? "Got it" : "Not now"}
        </button>
      </div>
    </div>
  );
}
