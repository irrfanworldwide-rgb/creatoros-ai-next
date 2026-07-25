"use client";

import { useEffect, useState } from "react";

const DEFAULT_LIMIT = 3;

export function useFreeDailyLimit(): number {
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.freeDailyLimit === "number" && data.freeDailyLimit > 0) {
          setLimit(data.freeDailyLimit);
        }
      })
      .catch(() => {
        // Keep the default — display-only, never blocks generation
        // (the real enforcement happens server-side in /api/generate).
      });
  }, []);

  return limit;
}
