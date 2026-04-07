import { useEffect, useRef } from 'react';
import { pushHistory } from '../services/historyService';
import type { Token } from './mathEngine';

const HISTORY_DEBOUNCE_MS = 500;

export function useHistoryPush(current: string, overwrite: boolean, tokens: Token[]): void {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!overwrite || tokens.length > 0) return;
    if (current === '0' || current === 'Error') return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => pushHistory('', current), HISTORY_DEBOUNCE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [current, overwrite, tokens]);
}
