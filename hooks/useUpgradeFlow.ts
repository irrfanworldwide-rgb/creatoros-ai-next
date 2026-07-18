"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/contexts/SessionContext";
import { setPendingUpgrade } from "@/lib/upgrade/intent";

export function useUpgradeFlow() {
  const { user } = useSession();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  function goToUpgrade() {
    setRedirecting(true);
    if (user) {
      router.push("/profile?upgrade=1");
    } else {
      setPendingUpgrade();
      router.push("/");
    }
  }

  return { goToUpgrade, redirecting };
}
