import { createContext, useContext, useMemo, useState } from 'react';

import type { AngleMode } from '../calculator/mathEngine';

interface CalcState {
  current: string;
  angleMode: AngleMode;
}

interface CalcStateContextValue {
  calcState: CalcState;
  setCalcState: (state: CalcState) => void;
}

const CalcStateContext = createContext<CalcStateContextValue | null>(null);

export function CalcStateProvider({ children }: { children: React.ReactNode }) {
  const [calcState, setCalcState] = useState<CalcState>({ current: '0', angleMode: 'deg' });

  const ctxValue = useMemo(() => ({ calcState, setCalcState }), [calcState]);

  return <CalcStateContext.Provider value={ctxValue}>{children}</CalcStateContext.Provider>;
}

export function useCalcState(): CalcStateContextValue {
  const ctx = useContext(CalcStateContext);
  if (!ctx) throw new Error('useCalcState must be used inside CalcStateProvider');
  return ctx;
}
