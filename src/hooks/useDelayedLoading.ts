import { useEffect, useRef, useState } from 'react';

export function useDelayedLoading(
  isLoading: boolean,
  delayMs = 400,
  minVisibleMs = 300
) {
  const [visible, setVisible] = useState(false);
  const shownAtRef = useRef<number | null>(null);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (isLoading) {
      if (visible) {
        return undefined;
      }

      showTimerRef.current = setTimeout(() => {
        shownAtRef.current = Date.now();
        setVisible(true);
      }, delayMs);

      return () => {
        if (showTimerRef.current) {
          clearTimeout(showTimerRef.current);
          showTimerRef.current = null;
        }
      };
    }

    if (!visible) {
      shownAtRef.current = null;
      return undefined;
    }

    const elapsed = shownAtRef.current ? Date.now() - shownAtRef.current : minVisibleMs;
    const remaining = Math.max(minVisibleMs - elapsed, 0);

    hideTimerRef.current = setTimeout(() => {
      shownAtRef.current = null;
      setVisible(false);
    }, remaining);

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [delayMs, isLoading, minVisibleMs, visible]);

  return visible;
}

export default useDelayedLoading;
