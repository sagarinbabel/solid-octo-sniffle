"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { AnalysisResult } from "@/lib/schema";
import type { EvalResult } from "@/lib/evals";

export type TabId =
  | "intake"
  | "analysis"
  | "approval"
  | "evals"
  | "architecture";

export interface AnalyseApiResponse {
  result: AnalysisResult;
  evalResult: EvalResult;
  model: string;
  timestamp: string;
}

interface AppState {
  tab: TabId;
  setTab: (t: TabId) => void;
  requestText: string;
  setRequestText: (s: string) => void;
  loading: boolean;
  error: string | null;
  lastResponse: AnalyseApiResponse | null;
  analyse: () => Promise<void>;
  runEvalsOnSamples: () => Promise<void>;
  sampleEvalLoading: boolean;
  sampleEvalError: string | null;
  sampleEvalResults: Array<{
    label: string;
    requestText: string;
    scorePercent: number;
    checks: EvalResult["checks"];
  }> | null;
}

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useState<TabId>("intake");
  const [requestText, setRequestText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<AnalyseApiResponse | null>(
    null
  );
  const [sampleEvalLoading, setSampleEvalLoading] = useState(false);
  const [sampleEvalError, setSampleEvalError] = useState<string | null>(null);
  const [sampleEvalResults, setSampleEvalResults] = useState<AppState["sampleEvalResults"]>(null);

  const analyse = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestText }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Analysis failed."
        );
        setLoading(false);
        return;
      }
      setLastResponse(data as AnalyseApiResponse);
      setTab("analysis");
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [requestText]);

  const runEvalsOnSamples = useCallback(async () => {
    setSampleEvalError(null);
    setSampleEvalLoading(true);
    setSampleEvalResults(null);
    try {
      const { SAMPLE_REQUESTS } = await import("@/lib/sample-requests");
      const results: NonNullable<AppState["sampleEvalResults"]> = [];
      for (const s of SAMPLE_REQUESTS) {
        const res = await fetch("/api/analyse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestText: s.text }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setSampleEvalError(
            typeof data.error === "string"
              ? data.error
              : "Sample eval run failed."
          );
          setSampleEvalLoading(false);
          return;
        }
        const body = data as AnalyseApiResponse;
        results.push({
          label: s.label,
          requestText: s.text,
          scorePercent: body.evalResult.scorePercent,
          checks: body.evalResult.checks,
        });
      }
      setSampleEvalResults(results);
    } catch {
      setSampleEvalError("Network error during sample eval run.");
    } finally {
      setSampleEvalLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      tab,
      setTab,
      requestText,
      setRequestText,
      loading,
      error,
      lastResponse,
      analyse,
      runEvalsOnSamples,
      sampleEvalLoading,
      sampleEvalError,
      sampleEvalResults,
    }),
    [
      tab,
      requestText,
      loading,
      error,
      lastResponse,
      analyse,
      runEvalsOnSamples,
      sampleEvalLoading,
      sampleEvalError,
      sampleEvalResults,
    ]
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
