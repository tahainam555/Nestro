import { useState, useCallback } from "react";

export function useLoadingState() {
  const [isLoading, setIsLoading] = useState(false);

  const withLoading = useCallback(
    async (fn: () => Promise<void>, delay = 0) => {
      try {
        setIsLoading(true);
        if (delay > 0) await new Promise((r) => setTimeout(r, delay));
        await fn();
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { isLoading, withLoading };
}
