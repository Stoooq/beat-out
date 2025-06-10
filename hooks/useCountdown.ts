import { useState, useEffect, useRef, useCallback } from 'react';

interface CountdownOptions {
  autoStart?: boolean;
}

export function useCountdown(
  initialSeconds: number,
  { autoStart = true }: CountdownOptions = {}
) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const [running, setRunning] = useState(autoStart);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback((newInitial?: number) => {
    setRemaining(newInitial ?? initialSeconds);
    setRunning(false);
  }, [initialSeconds]);

  const start = useCallback(() => {
    setRunning(true);
  }, []);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      setRunning(false);
      return;
    }
    timerRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(timerRef.current!);
          setRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [running, remaining]);

  return {
    remaining,
    isFinished: remaining === 0,
    start,
    reset,
  };
}
