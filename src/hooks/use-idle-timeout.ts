import { useEffect, useRef, useState } from "react";

type Opts = {
  idleMs: number;
  warningMs: number;
  enabled: boolean;
  onTimeout: () => void;
};

/** Tracks user activity; calls onTimeout after `idleMs` of inactivity.
 *  `warning` becomes true `warningMs` before the timeout for a confirm dialog. */
export function useIdleTimeout({ idleMs, warningMs, enabled, onTimeout }: Opts) {
  const [warning, setWarning] = useState(false);
  const [remaining, setRemaining] = useState(idleMs);
  const lastActivity = useRef(Date.now());

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const reset = () => {
      lastActivity.current = Date.now();
      if (warning) setWarning(false);
    };
    const evts = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "visibilitychange"];
    evts.forEach((e) => window.addEventListener(e, reset, { passive: true }));

    const tick = () => {
      const elapsed = Date.now() - lastActivity.current;
      const left = idleMs - elapsed;
      setRemaining(left);
      if (left <= 0) onTimeout();
      else if (left <= warningMs) setWarning(true);
      raf = window.setTimeout(tick, 1000) as unknown as number;
    };
    tick();

    return () => {
      evts.forEach((e) => window.removeEventListener(e, reset));
      clearTimeout(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, idleMs, warningMs]);

  return { warning, remainingMs: remaining, stayActive: () => { lastActivity.current = Date.now(); setWarning(false); } };
}
