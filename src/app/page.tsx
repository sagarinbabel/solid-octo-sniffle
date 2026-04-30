"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SAMPLE_REQUESTS } from "@/lib/sampleRequests";
import { useAnalysis } from "@/components/AnalysisContext";
import { Card, PageHeader, Pill } from "@/components/Card";

export default function IntakePage() {
  const router = useRouter();
  const { setCurrent } = useAnalysis();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSample, setSelectedSample] = useState<string>("");

  function applySample(id: string) {
    const s = SAMPLE_REQUESTS.find((r) => r.id === id);
    if (s) {
      setText(s.text);
      setSelectedSample(id);
      setError(null);
    }
  }

  async function onAnalyse() {
    setError(null);
    if (!text.trim()) {
      setError("Please enter or select a request first.");
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch("/api/analyse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ requestText: text }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(
          data?.error ||
            `Analysis failed (HTTP ${resp.status}). See server logs for details.`,
        );
        return;
      }
      setCurrent({
        requestText: text,
        result: data.result,
        evalResult: data.evalResult,
        model: data.model,
        timestamp: data.timestamp,
      });
      router.push("/analysis");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Network error";
      setError(`Network/parse error: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="01 · Request Intake"
        title="Capture a messy internal request"
        description="This prototype was built by Sagar Dubey for the Kelluu Core AI Architect application. Paste a real-world-ish sales / customer / ops request below and run it through a structured AI workflow. No real Kelluu data is used. No external action is taken. The LLM call happens server-side; the API key never reaches the browser."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Incoming Request"
            subtitle="Free-text. Mirrors how Sales/Ops/Customers actually message internal teams."
          >
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-xs text-ink-400 self-center mr-1">
                Sample requests:
              </span>
              {SAMPLE_REQUESTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => applySample(s.id)}
                  className={[
                    "text-xs px-2 py-1 rounded border transition-colors",
                    selectedSample === s.id
                      ? "border-accent-500 text-accent-400 bg-accent-600/15"
                      : "border-ink-700 text-ink-200 hover:border-ink-500",
                  ].join(" ")}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setSelectedSample("");
              }}
              placeholder="Paste the messy request here…"
              rows={10}
              className="w-full rounded-md bg-ink-900 border border-ink-700 focus:border-accent-500 focus:outline-none px-3 py-2 text-sm font-mono text-ink-100 leading-relaxed"
            />
            <div className="flex flex-wrap items-center justify-between mt-3 gap-3">
              <div className="text-xs text-ink-400 flex flex-wrap gap-2 items-center">
                <Pill tone="muted">Mocked data only</Pill>
                <Pill tone="muted">No Kelluu confidential data used</Pill>
                <Pill tone="muted">Server-side LLM call</Pill>
              </div>
              <button
                onClick={onAnalyse}
                disabled={loading}
                className="px-4 py-2 rounded-md bg-accent-600 hover:bg-accent-500 disabled:opacity-50 disabled:cursor-not-allowed text-ink-50 text-sm font-medium"
              >
                {loading ? "Analysing…" : "Analyse with AI"}
              </button>
            </div>
            {error && (
              <div className="mt-3 rounded-md border border-danger-500/40 bg-danger-500/10 px-3 py-2 text-sm text-danger-500">
                {error}
              </div>
            )}
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="What this prototype shows">
            <ul className="list-disc pl-5 space-y-1.5 text-ink-200">
              <li>Discover the real request hiding inside messy input.</li>
              <li>Structure it into reviewable, auditable JSON.</li>
              <li>Classify defence/customer sensitivity.</li>
              <li>Identify missing information before commitments.</li>
              <li>Suggest sensible owners (Sales/Ops/Software/Security…).</li>
              <li>Generate internal tasks and a draft spec.</li>
              <li>Require human approval for anything customer-facing.</li>
              <li>Run lightweight evals to gate AI output quality.</li>
            </ul>
          </Card>
          <Card title="What this prototype is not">
            <ul className="list-disc pl-5 space-y-1.5 text-ink-300">
              <li>It is not connected to CRM, ERP, ticketing, repos, or internal docs.</li>
              <li>It does not send any external messages.</li>
              <li>It does not contain real Kelluu policy or customer data.</li>
              <li>Evals here are seed checks, not proof of full safety.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
