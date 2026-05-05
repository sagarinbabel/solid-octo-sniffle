"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { sampleRequests } from "@/lib/samples";
import type { AnalyseResponse, EvalCheck, EvalResult, TriageResult } from "@/lib/schema";
import { MOCK_EVAL, MOCK_TRIAGE, SEED_QUEUE, type PrototypeQueueItem } from "./mock-data";

type Tab = "submit" | "queue" | "method";
type CommitmentNeeded = "Yes" | "No";
type SensitivityInput = "Normal" | "Customer confidential" | "Defence-sensitive" | "Unknown";
type PrototypeRole = "Approver" | "Software engineer";
type TriageMode = "demo" | "live";

type SalesForm = {
  customerName: string;
  requestSummary: string;
  deadline: string;
  softwareNeed: string;
  commitmentNeeded: CommitmentNeeded;
  sensitivity: SensitivityInput;
};

const tabs: { id: Tab; label: string }[] = [
  { id: "submit", label: "Submit" },
  { id: "queue", label: "Queue" },
  { id: "method", label: "Method" },
];

const emptyForm: SalesForm = {
  customerName: "",
  requestSummary: sampleRequests[0].requestSummary,
  deadline: sampleRequests[0].deadline,
  softwareNeed: sampleRequests[0].softwareNeed,
  commitmentNeeded: sampleRequests[0].commitmentNeeded,
  sensitivity: sampleRequests[0].sensitivity,
};

function Pill({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "cyan" | "amber" | "rose" | "emerald" }) {
  const styles = {
    slate: "border-stone-300 bg-white text-stone-700",
    cyan: "border-blue-600/25 bg-blue-600/10 text-blue-900",
    amber: "border-amber-700/25 bg-amber-700/10 text-amber-950",
    rose: "border-rose-700/20 bg-rose-700/10 text-rose-950",
    emerald: "border-emerald-800/25 bg-emerald-800/10 text-emerald-950",
  };
  return (
    <span className={`inline-flex max-w-full rounded-full border px-3 py-1 text-xs font-semibold leading-5 ${styles[tone]}`}>{children}</span>
  );
}

function Card({ title, eyebrow, children }: { title: string; eyebrow?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white/80 p-5 shadow-xl shadow-stone-900/5 backdrop-blur">
      {eyebrow ? <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">{eyebrow}</p> : null}
      <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
      <div className="mt-4 text-sm leading-6 text-stone-700">{children}</div>
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-stone-800">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-stone-300 bg-white p-3 text-stone-900 outline-none ring-blue-700/30 focus:ring-4"
      />
    </label>
  );
}

function ListBlock({ items, empty = "None listed." }: { items?: string[]; empty?: string }) {
  if (!items?.length) {
    return <p className="text-stone-500">{empty}</p>;
  }
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="rounded-xl border border-stone-200 bg-[#fbf7ef] px-3 py-2 text-stone-800">
          {item}
        </li>
      ))}
    </ul>
  );
}

function CheckBadge({ status }: { status: EvalCheck["status"] }) {
  const tone = status === "pass" ? "emerald" : status === "fail" ? "rose" : "amber";
  return <Pill tone={tone}>{status.toUpperCase()}</Pill>;
}

function buildRequestText(form: SalesForm): string {
  return [
    `Customer / opportunity name: ${form.customerName || "Unknown"}`,
    `Request summary: ${form.requestSummary}`,
    `Deadline: ${form.deadline || "Unknown"}`,
    `What Sales needs from Software/Ops: ${form.softwareNeed}`,
    `Customer-facing commitment needed: ${form.commitmentNeeded}`,
    `Sales-selected sensitivity: ${form.sensitivity}`,
  ].join("\n");
}

function queueCounts(queue: PrototypeQueueItem[]) {
  return queue.reduce(
    (acc, q) => {
      if (!q.triage.software_interrupt_allowed) acc.blocked++;
      if (q.status.toLowerCase().includes("reject")) acc.reject++;
      if (q.triage.software_interrupt_allowed && (q.status.startsWith("Route") || q.status === "Approve discovery")) {
        acc.routable++;
      }
      return acc;
    },
    { blocked: 0, reject: 0, routable: 0 },
  );
}

const reviewerActions = [
  "Ask Sales for clarification",
  "Route to Software",
  "Route to Ops",
  "Route to Security",
  "Approve discovery",
  "Reject / not now",
] as const;

type AnalysePayload = Partial<AnalyseResponse> & { error?: string; evalResult?: EvalResult };

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, 2400);
    return () => clearTimeout(t);
  }, [message, onDismiss]);
  if (!message) return null;
  return (
    <div
      className="fixed bottom-8 left-1/2 z-[100] -translate-x-1/2 rounded-lg border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-900 shadow-lg shadow-stone-900/10"
      role="status"
    >
      <span className="border-l-4 border-blue-700 pl-3">{message}</span>
    </div>
  );
}

const unavailableSafetyResult: EvalResult = {
  score: 0,
  disclaimer: "Safety checks were not available for this response. Re-run triage after refreshing the app.",
  checks: [
    {
      id: "missing-safety-checks",
      label: "Safety checks unavailable",
      status: "warning",
      explanation: "The AI response did not include local safety-check output, so this request should stay in human review.",
    },
  ],
};

function resolveSafetyResult(payload: unknown): EvalResult | null {
  if (!payload || typeof payload !== "object") return null;
  const candidate = (payload as { safetyResult?: unknown; evalResult?: unknown }).safetyResult ?? (payload as { evalResult?: unknown }).evalResult;
  if (!candidate || typeof candidate !== "object") return null;
  const value = candidate as Partial<EvalResult>;
  if (typeof value.score !== "number" || !Array.isArray(value.checks) || typeof value.disclaimer !== "string") {
    return null;
  }
  return value as EvalResult;
}

export default function PrototypePage() {
  const [activeTab, setActiveTab] = useState<Tab>("queue");
  const [role] = useState<PrototypeRole>("Approver");
  const [mode, setMode] = useState<TriageMode>("demo");
  const [queue, setQueue] = useState<PrototypeQueueItem[]>(() => [...SEED_QUEUE]);
  const [selectedId, setSelectedId] = useState<string>(SEED_QUEUE[0]?.id ?? "");
  const [form, setForm] = useState<SalesForm>(emptyForm);
  const [selectedSampleId, setSelectedSampleId] = useState(sampleRequests[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const detailAnchorRef = useRef<HTMLDivElement>(null);

  const selectedItem = useMemo(() => queue.find((q) => q.id === selectedId) ?? queue[0], [queue, selectedId]);
  const counts = useMemo(() => queueCounts(queue), [queue]);

  function updateForm<K extends keyof SalesForm>(key: K, value: SalesForm[K]) {
    setForm((c) => ({ ...c, [key]: value }));
  }

  function applySample(sampleId: string) {
    const sample = sampleRequests.find((s) => s.id === sampleId);
    if (!sample) return;
    setSelectedSampleId(sampleId);
    setForm({
      customerName: sample.customerName,
      requestSummary: sample.requestSummary,
      deadline: sample.deadline,
      softwareNeed: sample.softwareNeed,
      commitmentNeeded: sample.commitmentNeeded,
      sensitivity: sample.sensitivity,
    });
  }

  async function submitForTriage() {
    setLoading(true);
    setError("");
    try {
      const originalRequest = buildRequestText(form);

      if (mode === "demo") {
        const triage = MOCK_TRIAGE[selectedSampleId] ?? MOCK_TRIAGE["defence-rfi"];
        const evalResult = MOCK_EVAL[selectedSampleId] ?? MOCK_EVAL["defence-rfi"];

        const newItem: PrototypeQueueItem = {
          id: crypto.randomUUID(),
          sampleId: selectedSampleId,
          customerName: form.customerName || "Unnamed opportunity",
          deadline: form.deadline || "Unknown",
          originalRequest,
          status: triage.recommended_status,
          submittedAt: "Just now",
          triage,
          evalResult,
          model: "deepseek-ai/deepseek-v4-pro",
          timestamp: new Date().toISOString(),
        };

        setQueue((q) => [newItem, ...q]);
        setSelectedId(newItem.id);
        setActiveTab("queue");
        setToast("Submitted · structured by AI Triage (demo mock)");
        return;
      }

      const response = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestText: originalRequest }),
      });

      const payload = (await response.json()) as AnalysePayload;
      if (!response.ok) {
        setError(payload.error || "AI triage failed. Check your API key and try again.");
        return;
      }

      if (!payload.result) {
        setError("AI triage returned an incomplete response. Refresh and try again.");
        return;
      }

      const safetyResult = resolveSafetyResult(payload) ?? unavailableSafetyResult;

      const newItem: PrototypeQueueItem = {
        id: crypto.randomUUID(),
        sampleId: selectedSampleId,
        customerName: form.customerName || "Unnamed opportunity",
        deadline: form.deadline || "Unknown",
        originalRequest,
        status: payload.result.recommended_status,
        submittedAt: new Date().toLocaleString(),
        triage: payload.result as TriageResult,
        evalResult: safetyResult,
        model: payload.model ?? "unknown-model",
        timestamp: payload.timestamp ?? new Date().toISOString(),
      };

      setQueue((q) => [newItem, ...q]);
      setSelectedId(newItem.id);
      setActiveTab("queue");
      setToast("Submitted · structured by AI Triage (live API)");
    } catch {
      setError("Unable to reach the triage service. Check the local server and try again.");
    } finally {
      setLoading(false);
    }
  }

  function updateStatus(status: string) {
    setQueue((current) => current.map((item) => (item.id === selectedId ? { ...item, status } : item)));
    setToast(`Status updated · ${status}`);
  }

  function selectRow(id: string) {
    setSelectedId(id);
    window.requestAnimationFrame(() => {
      detailAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const stepBanner =
    activeTab === "queue"
      ? "Step 02 / 02 · Approver (Head of Software) routes structured briefs · 01 Submit · 02 AI structures · 03 Reviewer routes"
      : "Step 01 / 02 · Sales hands off · 01 Submit · 02 AI structures · 03 Reviewer routes";

  const t = selectedItem?.triage;
  const blocked = t ? !t.software_interrupt_allowed : true;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(29,78,216,0.10),transparent_42%),radial-gradient(circle_at_top_right,rgba(6,95,70,0.10),transparent_44%),linear-gradient(180deg,#ffffff, #fbf7ef_42%, #ffffff)] text-stone-900">
      <div className="mx-auto max-w-7xl px-5 py-8">
        <header className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-2xl shadow-stone-900/5 backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">AI Request Triage</h1>
              <p className="mt-4 max-w-3xl text-lg text-stone-700">
                New queue design showcase. Default is <span className="font-semibold">Demo mode</span> (instant mock, no API call). Switch to{" "}
                <span className="font-semibold">Live mode</span> to call the real triage API. Live app remains on{" "}
                <Link href="/" className="font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-800">
                  /
                </Link>
                .
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Pill tone="amber">Prototype design · /prototype</Pill>
              <Pill tone={mode === "demo" ? "amber" : "emerald"}>{mode === "demo" ? "Demo mode · instant mock" : "Live mode · API call"}</Pill>
              <Pill tone="cyan">Model: {selectedItem?.model ?? "unknown-model"}</Pill>
              <Pill>In-memory queue</Pill>
              <Pill tone={role === "Approver" ? "emerald" : "slate"}>Role: {role}</Pill>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm font-semibold text-stone-800">
              Mode:{" "}
              <span className={mode === "demo" ? "text-amber-800" : "text-emerald-800"}>
                {mode === "demo" ? "Demo (no API call, instant mock)" : "Live (calls /api/analyse)"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode("demo");
                  setError("");
                  setToast("Switched to Demo mode · instant mock responses");
                }}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                  mode === "demo" ? "bg-amber-700 text-white" : "border border-stone-300 bg-white text-stone-800 hover:bg-stone-50"
                }`}
              >
                Demo
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("live");
                  setError("");
                  setToast("Switched to Live mode · API calls enabled");
                }}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                  mode === "live" ? "bg-emerald-700 text-white" : "border border-stone-300 bg-white text-stone-800 hover:bg-stone-50"
                }`}
              >
                Live
              </button>
            </div>
          </div>
        </header>

        <nav className="mt-6 grid gap-2 rounded-2xl border border-stone-200 bg-white/75 p-2 backdrop-blur md:grid-cols-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
                activeTab === tab.id ? "bg-blue-700 text-white" : "text-stone-700 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-3 flex flex-col gap-2 rounded-xl border border-stone-200 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-600 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-stone-700">{selectedItem?.model ?? "unknown-model"} · Schema validation · Local safety checks</span>
          <span>{mode === "demo" ? "DEMO MODE · no API call" : "LIVE MODE · calls /api/analyse"} · No DB</span>
        </div>

        <div className="mt-2 rounded-lg border border-blue-700/20 bg-blue-700/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-blue-900">{stepBanner}</div>

        <div className="mt-6">
          {activeTab === "submit" ? (
            <Card title="Sales Portal" eyebrow={`Submit for triage (${mode === "demo" ? "demo" : "live"})`}>
              <p>
                {mode === "demo"
                  ? "Demo mode is instant and predictable: it loads a schema-aligned mock triage for the selected sample (no server call)."
                  : "Live mode calls the real `/api/analyse` route and stores the response in the local prototype queue."}
              </p>
              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-stone-800" htmlFor="proto-sample">
                    Load sample
                  </label>
                  <select
                    id="proto-sample"
                    value={selectedSampleId}
                    onChange={(e) => applySample(e.target.value)}
                    className="mt-2 w-full max-w-md rounded-xl border border-stone-300 bg-white p-3 text-stone-900 outline-none ring-blue-700/30 focus:ring-4"
                  >
                    {sampleRequests.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <TextField label="Customer / opportunity name" value={form.customerName} onChange={(v) => updateForm("customerName", v)} />
                <TextField label="Deadline" value={form.deadline} onChange={(v) => updateForm("deadline", v)} />
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-stone-800">Sensitivity</span>
                  <select
                    value={form.sensitivity}
                    onChange={(e) => updateForm("sensitivity", e.target.value as SensitivityInput)}
                    className="mt-2 w-full rounded-xl border border-stone-300 bg-white p-3 text-stone-900 outline-none ring-blue-700/30 focus:ring-4"
                  >
                    <option>Normal</option>
                    <option>Customer confidential</option>
                    <option>Defence-sensitive</option>
                    <option>Unknown</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-stone-800">Customer-facing commitment needed?</span>
                  <select
                    value={form.commitmentNeeded}
                    onChange={(e) => updateForm("commitmentNeeded", e.target.value as CommitmentNeeded)}
                    className="mt-2 w-full rounded-xl border border-stone-300 bg-white p-3 text-stone-900 outline-none ring-blue-700/30 focus:ring-4"
                  >
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </label>
              </div>
              <label className="mt-4 block">
                <span className="text-sm font-semibold text-stone-800">Request summary</span>
                <textarea
                  value={form.requestSummary}
                  onChange={(e) => updateForm("requestSummary", e.target.value)}
                  rows={5}
                  className="mt-2 w-full rounded-xl border border-stone-300 bg-white p-4 text-stone-900 outline-none ring-blue-700/30 focus:ring-4"
                />
              </label>
              <label className="mt-4 block">
                <span className="text-sm font-semibold text-stone-800">What do you need from Software/Ops?</span>
                <textarea
                  value={form.softwareNeed}
                  onChange={(e) => updateForm("softwareNeed", e.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-stone-300 bg-white p-4 text-stone-900 outline-none ring-blue-700/30 focus:ring-4"
                />
              </label>
              {error ? <p className="mt-4 rounded-xl border border-rose-700/20 bg-rose-700/10 p-3 text-rose-950">{error}</p> : null}
              <button
                type="button"
                onClick={submitForTriage}
                disabled={loading}
                className="mt-5 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white shadow-lg shadow-stone-900/10 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Triaging…" : mode === "demo" ? "Submit (instant demo) →" : "Submit (live API) →"}
              </button>
            </Card>
          ) : null}

          {activeTab === "queue" && selectedItem && t ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-400">
                <span className="font-semibold text-slate-200">{queue.length}</span> open ·{" "}
                <span className="font-semibold text-rose-200">{counts.blocked}</span> blocked ·{" "}
                <span className="font-semibold text-emerald-200">{counts.routable}</span> routable ·{" "}
                <span className="font-semibold text-amber-200">{counts.reject}</span> reject
              </div>

              <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-xl md:p-5">
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Inbox</div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <h2 className="text-xl font-semibold text-slate-50">Open queue</h2>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Approver view · routes/blocks requests</p>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <div
                    className="min-w-[640px] border-t border-slate-700 pt-2"
                    role="grid"
                    aria-label="Request queue"
                  >
                    <div className="grid grid-cols-[12px_minmax(140px,1fr)_minmax(100px,160px)_minmax(72px,100px)_52px_minmax(88px,1fr)_28px] gap-3 border-b border-slate-800 px-1 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <span aria-hidden />
                      <span>Request</span>
                      <span>Customer</span>
                      <span>Deadline</span>
                      <span>Missing</span>
                      <span>Status</span>
                      <span className="text-right" aria-hidden />
                    </div>
                    {queue.map((q) => {
                      const isSelected = q.id === selectedItem.id;
                      const rowBlocked = !q.triage.software_interrupt_allowed;
                      const missing = q.triage.missing_information.length;
                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => selectRow(q.id)}
                          className={`grid w-full grid-cols-[12px_minmax(140px,1fr)_minmax(100px,160px)_minmax(72px,100px)_52px_minmax(88px,1fr)_28px] gap-3 border-b border-slate-800 px-1 py-4 text-left transition ${
                            isSelected ? "border-l-4 border-l-cyan-300 bg-cyan-300/10 pl-0" : "hover:bg-slate-900/60"
                          }`}
                        >
                          <span className="flex items-center justify-center" aria-hidden>
                            <span
                              className={`h-2 w-2 rounded-full ${
                                isSelected ? "bg-cyan-300" : rowBlocked ? "bg-rose-400" : "bg-slate-600"
                              }`}
                            />
                          </span>
                          <span className={`text-sm font-semibold ${isSelected ? "text-cyan-50" : "text-slate-100"}`}>
                            {q.triage.clean_title}
                          </span>
                          <span className={`truncate text-xs ${isSelected ? "text-slate-200" : "text-slate-500"}`}>{q.customerName}</span>
                          <span className={`font-mono text-xs ${isSelected ? "text-slate-200" : "text-slate-500"}`}>{q.deadline}</span>
                          <span
                            className={`font-mono text-xs font-bold ${
                              missing > 2 ? "text-amber-200" : isSelected ? "text-slate-200" : "text-slate-400"
                            }`}
                          >
                            {String(missing).padStart(2, "0")}
                          </span>
                          <span className={`truncate text-xs font-medium ${isSelected ? "text-slate-100" : "text-slate-400"}`}>
                            {q.status}
                          </span>
                          <span className="text-right text-slate-500">{isSelected ? "▾" : "›"}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              <div ref={detailAnchorRef} />

              <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 shadow-xl lg:grid lg:min-h-[420px] lg:grid-cols-[1fr_2fr]">
                <div className="flex flex-col justify-between border-b border-slate-800 bg-cyan-300/10 p-6 lg:border-b-0 lg:border-r lg:border-slate-800">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200/90">Selected request</p>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-cyan-100/80">{selectedItem.customerName}</p>
                    <h2 className="mt-4 text-2xl font-bold leading-tight tracking-tight text-slate-50 md:text-3xl">{t.clean_title}</h2>
                    <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300">{t.summary}</p>
                  </div>
                  <div className="mt-8 flex flex-wrap justify-between gap-2 border-t border-cyan-300/20 pt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <span>Deadline · {selectedItem.deadline}</span>
                    <span>Conf. {Math.round(t.confidence * 100)}%</span>
                  </div>
                </div>
                <div className="bg-slate-950/40">
                  <div className="grid grid-cols-2 gap-px bg-slate-800 sm:grid-cols-4">
                    {(
                      [
                        ["Type", t.request_type],
                        ["Urgency", t.urgency],
                        ["Sensitivity", t.sensitivity],
                        ["Route", t.suggested_route.length > 28 ? `${t.suggested_route.slice(0, 28)}…` : t.suggested_route],
                      ] as const
                    ).map(([k, v]) => (
                      <div key={k} className="p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{k}</p>
                        <p className="mt-1 text-sm font-semibold text-slate-100">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <div
                className={`rounded-2xl border border-slate-800 bg-slate-950/90 px-5 py-6 md:grid md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8 ${
                  blocked ? "border-b-4 border-b-rose-400/80" : "border-b-4 border-b-cyan-300/80"
                }`}
              >
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider ${blocked ? "text-rose-300" : "text-cyan-300"}`}>
                    Decision · {blocked ? "blocked" : "allowed"}
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-50">Software interrupt is {blocked ? "blocked" : "allowed"}</p>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-400 md:mt-0">
                  {blocked
                    ? `${t.missing_information.length} missing inputs and risk flags. Resolve with Sales before Software is paged.`
                    : "Schema valid, safety checks passed (mock), sufficient inputs for this path. Routable now."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 md:mt-0 md:justify-end">
                  <button
                    type="button"
                    onClick={() => updateStatus(blocked ? "Ask Sales for clarification" : "Route to Software")}
                    className="rounded-xl bg-cyan-300 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-950 hover:bg-cyan-200"
                  >
                    {blocked ? "Ask Sales →" : "Route to Software →"}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus("Reject / not now")}
                    className="rounded-xl border border-slate-600 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-200 hover:border-slate-400"
                  >
                    Reject
                  </button>
                </div>
              </div>

              <div className="grid gap-0 overflow-hidden rounded-2xl border border-slate-800 lg:grid-cols-2">
                <div className="border-b border-slate-800 p-6 lg:border-b-0 lg:border-r">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Original — what Sales wrote</p>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{selectedItem.originalRequest}</p>
                  <p className="mt-8 text-xs font-bold uppercase tracking-wider text-slate-500">Audit notes</p>
                  <ul className="mt-3 space-y-2 font-mono text-xs text-slate-400">
                    <li>
                      <span className="opacity-70">{"// "}</span>schema: triage · valid
                    </li>
                    <li>
                      <span className="opacity-70">{"// "}</span>safety: mock ·{" "}
                      {selectedItem.evalResult.checks.filter((c) => c.status === "pass").length}/{selectedItem.evalResult.checks.length}{" "}
                      pass
                    </li>
                    <li>
                      <span className="opacity-70">{"// "}</span>submitted: {selectedItem.submittedAt}
                    </li>
                    <li>
                      <span className="opacity-70">{"// "}</span>model: {selectedItem.model}
                    </li>
                    {t.audit_notes.map((note) => (
                      <li key={note}>
                        <span className="opacity-70">{"// "}</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-900/40 p-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Structured brief</p>
                  <h3 className="mt-3 text-lg font-bold text-slate-50">{t.clean_title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{t.summary}</p>
                  <div className="mt-6 grid grid-cols-2 border border-slate-700">
                    {(
                      [
                        ["Request type", t.request_type],
                        ["Urgency", t.urgency],
                        ["Business value", t.business_value],
                        ["Complexity", t.technical_complexity],
                        ["Sensitivity", t.sensitivity],
                        ["Confidence", `${Math.round(t.confidence * 100)}%`],
                      ] as const
                    ).map(([k, v], i) => (
                      <div
                        key={k}
                        className={`border-slate-700 bg-slate-950/60 p-4 ${i % 2 === 0 ? "border-r" : ""} ${i < 4 ? "border-b" : ""}`}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{k}</p>
                        <p className="mt-1 text-sm font-semibold text-slate-100">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-0 overflow-hidden rounded-2xl border border-slate-800 lg:grid-cols-2">
                <div className="border-b border-slate-800 p-6 lg:border-b-0 lg:border-r">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Missing information</p>
                    <span className={`font-mono text-xs font-bold ${t.missing_information.length > 2 ? "text-amber-300" : "text-slate-300"}`}>
                      {String(t.missing_information.length).padStart(2, "0")} ITEMS
                    </span>
                  </div>
                  <ol className="mt-4 list-none space-y-0 p-0">
                    {t.missing_information.map((m, i) => (
                      <li
                        key={m}
                        className="grid grid-cols-[40px_1fr] gap-3 border-t border-slate-800 py-4 text-sm text-slate-200 first:border-t-0"
                      >
                        <span className="font-mono text-xs text-slate-500">{String(i + 1).padStart(2, "0")}</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="p-6">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Risk flags</p>
                    <span className="font-mono text-xs font-bold text-rose-300">{String(t.risk_flags.length).padStart(2, "0")} ITEMS</span>
                  </div>
                  <ul className="mt-4 list-none space-y-0 p-0">
                    {t.risk_flags.map((r) => (
                      <li
                        key={r}
                        className="grid grid-cols-[28px_1fr] gap-3 border-t border-slate-800 py-4 text-sm text-slate-200 first:border-t-0"
                      >
                        <span className="text-lg font-black text-rose-400">!</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 shadow-xl lg:grid lg:grid-cols-[1fr_2fr]">
                <div className="flex flex-col justify-center border-b border-slate-800 bg-cyan-300/10 p-8 lg:border-b-0 lg:border-r">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">Draft to Sales</p>
                  <h3 className="mt-4 text-2xl font-bold leading-tight text-slate-50">One round of questions beats three rounds of guesses.</h3>
                </div>
                <div className="p-8">
                  <p className="whitespace-pre-wrap border-b border-slate-800 pb-6 text-sm leading-relaxed text-slate-200">
                    {t.draft_clarification_to_sales}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setToast("Draft sent to Sales (mock)")}
                      className="rounded-xl bg-slate-100 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-950 hover:bg-white"
                    >
                      Send
                    </button>
                    <button
                      type="button"
                      onClick={() => setToast("Edit in main app when integrated")}
                      className="rounded-xl border border-slate-600 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-200 hover:border-slate-400"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard.writeText(t.draft_clarification_to_sales);
                        setToast("Copied to clipboard");
                      }}
                      className="rounded-xl border border-slate-700 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-400 hover:border-slate-500"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Reviewer action</p>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {reviewerActions.map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => updateStatus(action)}
                      className="rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-4 text-left text-sm font-semibold text-slate-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/10"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>

              <Card title={`Safety checks: ${selectedItem.evalResult.score}%`} eyebrow="Local checks (mock)">
                <p className="mb-4 text-slate-400">{selectedItem.evalResult.disclaimer}</p>
                <div className="space-y-3">
                  {selectedItem.evalResult.checks.map((check) => (
                    <div key={check.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-100">{check.label}</p>
                          <p className="mt-1 text-slate-400">{check.explanation}</p>
                        </div>
                        <CheckBadge status={check.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Audit trail" eyebrow="Mock">
                <div className="mb-4 flex flex-wrap gap-2">
                  <Pill>Model: {selectedItem.model}</Pill>
                  <Pill>Timestamp: {new Date(selectedItem.timestamp).toLocaleString()}</Pill>
                </div>
                <ListBlock
                  items={[
                    "Request submitted (prototype)",
                    "Mock triage attached",
                    "Schema-shaped output (mock)",
                    "Local safety checks (mock)",
                    "Head of Software review pending",
                    ...t.audit_notes,
                  ]}
                />
              </Card>
            </div>
          ) : null}

          {activeTab === "method" ? (
            <div className="space-y-6">
              <Card title="How AI Triage Works" eyebrow="Method">
                <p className="mb-6">
                  Five steps between a Sales handoff and a routed decision. The model never sees real customer data in this prototype; the
                  Software team is not paged before a person reviews.
                </p>
                <div className="grid gap-3 md:grid-cols-5">
                  {(
                    [
                      { n: "01", t: "Sales submits", d: "Free-text request, customer name, deadline, sensitivity. No internal jargon required." },
                      { n: "02", t: "AI structures", d: "Server-side LLM via /api/analyse. Output validated against the triage schema." },
                      { n: "03", t: "Safety checks", d: "Local checks for schema validity and interrupt control before reviewer handoff." },
                      { n: "04", t: "Reviewer routes", d: "Head of Software clarifies, blocks, or routes to Ops, Security, or Software." },
                      { n: "05", t: "Sales sees status", d: "Updated status visible to Sales — closing the loop without paging Software." },
                    ] as const
                  ).map((s, i) => (
                    <div
                      key={s.n}
                      className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-4 shadow-sm shadow-stone-900/5 md:min-h-[210px]"
                    >
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-700/60 via-cyan-500/50 to-emerald-600/50 opacity-70" />
                      <div className="text-3xl font-extrabold tracking-tight text-blue-800">{s.n}</div>
                      <p className="mt-3 text-sm font-semibold text-stone-900">{s.t}</p>
                      <p className="mt-2 text-sm leading-relaxed text-stone-700">{s.d}</p>
                      <div
                        className={`pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full blur-2xl ${
                          i % 2 === 0 ? "bg-blue-700/10" : "bg-emerald-700/10"
                        }`}
                        aria-hidden
                      />
                    </div>
                  ))}
                </div>
              </Card>

              <div className="grid gap-3 lg:grid-cols-2">
                <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm shadow-stone-900/5">
                  <div className="border-b border-stone-200 bg-blue-700/5 px-6 py-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-900">Boundary · what it does</p>
                  </div>
                  <ul className="space-y-3 px-6 py-5 text-sm leading-relaxed text-stone-800">
                    <li className="flex gap-3">
                      <span className="mt-[6px] h-2 w-2 flex-none rounded-full bg-blue-700" aria-hidden />
                      <span>Structures messy free-text into a typed brief</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-[6px] h-2 w-2 flex-none rounded-full bg-blue-700" aria-hidden />
                      <span>Flags missing inputs and risk signals</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-[6px] h-2 w-2 flex-none rounded-full bg-blue-700" aria-hidden />
                      <span>Blocks Software interrupt when criteria fail</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-[6px] h-2 w-2 flex-none rounded-full bg-blue-700" aria-hidden />
                      <span>Surfaces the original verbatim alongside structured output</span>
                    </li>
                  </ul>
                </section>

                <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm shadow-stone-900/5">
                  <div className="border-b border-stone-200 bg-rose-700/5 px-6 py-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-rose-900">Boundary · what it doesn&apos;t</p>
                  </div>
                  <ul className="space-y-3 px-6 py-5 text-sm leading-relaxed text-stone-800">
                    <li className="flex gap-3">
                      <span className="mt-[6px] h-2 w-2 flex-none rounded-full bg-rose-700" aria-hidden />
                      <span>Make customer-facing commitments</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-[6px] h-2 w-2 flex-none rounded-full bg-rose-700" aria-hidden />
                      <span>Auto-route to Software without human sign-off</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-[6px] h-2 w-2 flex-none rounded-full bg-rose-700" aria-hidden />
                      <span>Replace the reviewer&apos;s judgment</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-[6px] h-2 w-2 flex-none rounded-full bg-rose-700" aria-hidden />
                      <span>On /prototype: no live LLM — use / for /api/analyse</span>
                    </li>
                  </ul>
                </section>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <Toast message={toast} onDismiss={() => setToast("")} />
    </main>
  );
}
