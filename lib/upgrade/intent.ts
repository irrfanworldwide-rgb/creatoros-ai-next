const PENDING_UPGRADE_KEY = "creatoros_pending_upgrade";

export function setPendingUpgrade(): void {
  try {
    sessionStorage.setItem(PENDING_UPGRADE_KEY, "1");
  } catch {
    // sessionStorage unavailable — the upgrade flow still works, it just
    // won't auto-resume after a login redirect in that edge case.
  }
}

/** Returns true and clears the flag if an upgrade was pending. One-shot. */
export function consumePendingUpgrade(): boolean {
  try {
    const pending = sessionStorage.getItem(PENDING_UPGRADE_KEY) === "1";
    if (pending) sessionStorage.removeItem(PENDING_UPGRADE_KEY);
    return pending;
  } catch {
    return false;
  }
}
