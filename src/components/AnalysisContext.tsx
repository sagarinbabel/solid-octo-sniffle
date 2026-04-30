"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { Analysis } from "@/lib/schema";
import type { EvalResult } from "@/lib/evals";

export type AnalysisRecord = {
  requestText: string;
  result: Analysis;
  evalResult: EvalResult;
  model: string;
  timestamp: string;
};

type AnalysisContextValue = {
  current: AnalysisRecord | null;
  setCurrent: (r: AnalysisRecord | null) => void;
  clear: () => void;
};

const AnalysisContext = createContext<AnalysisContextValue | undefined>(
  undefined,
);

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrentState] = useState<AnalysisRecord | null>(null);

  const setCurrent = useCallback((r: AnalysisRecord | null) => {
    setCurrentState(r);
  }, []);

  const clear = useCallback(() => setCurrentState(null), []);

  const value = useMemo(
    () => ({ current, setCurrent, clear }),
    [current, setCurrent, clear],
  );

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis(): AnalysisContextValue {
  const ctx = useContext(AnalysisContext);
  if (!ctx) {
    throw new Error("useAnalysis must be used inside <AnalysisProvider>");
  }
  return ctx;
}
