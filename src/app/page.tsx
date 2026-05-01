"use client";

import { useMemo, useState } from "react";
import { sampleRequests } from "@/lib/samples";
import type { EvalCheck, EvalResult, TriageResult } from "@/lib/schema";

type View = "sales" | "queue" | "works";
type CommitmentNeeded = "Yes" | "No";
type SensitivityInput = "Normal" | "Customer confidential" | "Defence-sensitive" | "Unknown";

type SalesForm = {
  customerName: string;
  requestSummary: string;
  deadline: string;
  softwareNeed: string;
  commitmentNeeded: CommitmentNeeded;
  sensitivity: SensitivityInput;
};

type QueueItem = {
  id: string;
  customerName: string;
  deadline: string;
  originalRequest: string;
  status: string;
  submittedAt: string;
  triage: TriageResult;
  evalResult: EvalResult;
  model: string;
  timestamp: string;
};

const views: { id: View; label: string }[] = [
  { id: "sales", label: "Sales Portal" },
  { id: "queue", label: "Head of Software Queue" },
  { id: "works", label: "How it Works" },
];

const emptyForm: SalesForm = {
  customerName: "",
  requestSummary: sampleRequests[0].requestSummary,
  deadline: "Friday",
  softwareNeed: "A preliminary technical answer that Sales can use for an internal review before replying.",
  commitmentNeeded: "No",
  sensitivity: "Defence-sensitive",
};

const seededQueueItem: QueueItem = {
  id: "seed-defence-rfi",
  customerName: "MOCK Defence opportunity",
  deadline: "Friday",
  originalRequest: sampleRequests[0].requestSummary,
  status: "Needs clarification",
  submittedAt: "Seeded mocked example",
  model: "mocked-seed-output",
  timestamp: new Date("2026-04-30T18:00:00Z").toISOString(),
  triage: {
    clean_title: "Clarify persistent border monitoring RFI before software review",
    summary:
      "Sales needs a cautious internal feasibility review for a defence customer asking about persistent remote border monitoring.",
    request_type: "Customer RFI triage",
    urgency: "High",
    business_value: "High",
    technical_complexity: "High",
    sensitivity: "Defence-sensitive",
    missing_information: [
      "AOI/location and corridor dimensions",
      "Required revisit cadence or persistence expectation",
      "Latency and delivery format requirements",
      "Environmental and winter operating constraints",
    ],
    suggested_route: "Sales + Operations + Security before Software discovery",
    suggested_next_action: "Ask Sales to collect missing operational details and route to Security/Ops for review.",
    software_interrupt_allowed: false,
    draft_clarification_to_sales:
      "Before Software reviews this, please confirm the AOI, cadence, latency target, delivery format, winter constraints, and who can approve any customer-facing statement.",
    risk_flags: [
      "Defence-sensitive customer context",
      "Potential unsupported feasibility commitment",
      "Software interruption risk before requirements are clear",
    ],
    recommended_status: "Ask Sales for clarification",
    audit_notes: [
      "Seeded mocked output",
      "Referenced MOCKED Defence-Sensitive Data Handling Policy",
      "Referenced MOCKED Software Team Interruption Policy",
    ],
    confidence: 0.84,
  },
  evalResult: {
    score: 100,
    disclaimer: "This is a seed safety-check harness, not proof of full safety.",
    checks: [
      {
        id: "structured-output",
        label: "Structured output valid",
        status: "pass",
        explanation: "Seeded output follows the triage schema.",
      },
      {
        id: "interrupt-control",
        label: "Software interrupt control",
        status: "pass",
        explanation: "Software interruption is blocked while missing information is substantial.",
      },
    ],
  },
};

function Pill({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "cyan" | "amber" | "rose" | "emerald" }) {
  const styles = {
    slate: "border-slate-700 bg-slate-900 text-slate-300",
    cyan: "border-cyan-300/40 bg-cyan-300/10 text-cyan-100",
    amber: "border-amber-300/40 bg-amber-300/10 text-amber-100",
    rose: "border-rose-300/40 bg-rose-300/10 text-rose-100",
    emerald: "border-emerald-300/40 bg-emerald-300/10 text-emerald-100",
  };
  return <span className={`inline-flex max-w-full rounded-full border px-3 py-1 text-xs font-semibold leading-5 ${styles[tone]}`}>{children}</span>;
}

function Card({ title, eyebrow, children }: { title: string; eyebrow?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl shadow-slate-950/30">
      {eyebrow ? <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">{eyebrow}</p> : null}
      <h2 className="text-lg font-semibold text-slate-50">{title}</h2>
      <div className="mt-4 text-sm leading-6 text-slate-300">{children}</div>
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
      <span className="text-sm font-semibold text-slate-200">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-slate-100 outline-none ring-cyan-300 focus:ring-2"
      />
    </label>
  );
}

function ListBlock({ items, empty = "None listed." }: { items?: string[]; empty?: string }) {
  if (!items?.length) {
    return <p className="text-slate-500">{empty}</p>;
  }
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2">
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

function buildRequestText(form: SalesForm) {
  return [
    `Customer / opportunity name: ${form.customerName || "Unknown"}`,
    `Request summary: ${form.requestSummary}`,
    `Deadline: ${form.deadline || "Unknown"}`,
    `What Sales needs from Software/Ops: ${form.softwareNeed}`,
    `Customer-facing commitment needed: ${form.commitmentNeeded}`,
    `Sales-selected sensitivity: ${form.sensitivity}`,
  ].join("\n");
}

export default function Home() {
  const [activeView, setActiveView] = useState<View>("sales");
  const [form, setForm] = useState<SalesForm>(emptyForm);
  const [selectedSampleId, setSelectedSampleId] = useState(sampleRequests[0].id);
  const [queue, setQueue] = useState<QueueItem[]>([seededQueueItem]);
  const [selectedId, setSelectedId] = useState(seededQueueItem.id);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedItem = useMemo(() => queue.find((item) => item.id === selectedId) ?? queue[0], [queue, selectedId]);

  function updateForm<K extends keyof SalesForm>(key: K, value: SalesForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function applySample(sampleId: string) {
    const sample = sampleRequests.find((item) => item.id === sampleId);
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
      const response = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestText: originalRequest }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || "AI triage failed. Check your API key and try again.");
        return;
      }
      if (!payload.result || !payload.safetyResult) {
        setError("AI triage returned an incomplete response. Check the server logs and try again.");
        return;
      }

      const nextItem: QueueItem = {
        id: crypto.randomUUID(),
        customerName: form.customerName || "Unnamed opportunity",
        deadline: form.deadline || "Unknown",
        originalRequest,
        status: payload.result.recommended_status,
        submittedAt: new Date().toLocaleString(),
        triage: payload.result,
        evalResult: payload.safetyResult,
        model: payload.model,
        timestamp: payload.timestamp,
      };
      setQueue((current) => [nextItem, ...current]);
      setSelectedId(nextItem.id);
      setActiveView("queue");
    } catch {
      setError("Unable to reach the triage service. Check the local server and try again.");
    } finally {
      setLoading(false);
    }
  }

  function updateStatus(status: string) {
    setQueue((current) => current.map((item) => (item.id === selectedId ? { ...item, status } : item)));
  }

  function displayStatus(item: QueueItem) {
    return item.id === selectedItem.id ? selectedItem.status : item.status;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#16324f,transparent_32%),linear-gradient(135deg,#020617,#0f172a_45%,#111827)] text-slate-100">
      <div className="mx-auto max-w-7xl px-5 py-8">
        <header className="rounded-3xl border border-slate-800 bg-slate-950/75 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight md:text-6xl">AI Request Triage</h1>
              <p className="mt-4 max-w-3xl text-lg text-slate-300">
                Turns messy sales/customer requests into structured, reviewable work for software and operations teams.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Pill tone="cyan">Server-side LLM</Pill>
              <Pill tone="emerald">Human review</Pill>
              <Pill>Mocked data only</Pill>
              <Pill tone="amber">Safety checks</Pill>
            </div>
          </div>
        </header>

        <nav className="mt-6 grid gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-2 md:grid-cols-3">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
                activeView === view.id ? "bg-cyan-300 text-slate-950" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {view.label}
            </button>
          ))}
        </nav>

        <div className="mt-6">
          {activeView === "sales" ? (
            <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
              <Card title="Sales Portal" eyebrow="Submit for triage">
                <p>
                  Submit customer or internal requests here. AI will structure the request, identify missing information, and prepare it
                  for review.
                </p>
                <div className="mt-5">
                  <label className="block text-sm font-semibold text-slate-200" htmlFor="sample">
                    Load sample
                  </label>
                  <select
                    id="sample"
                    value={selectedSampleId}
                    onChange={(event) => applySample(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-slate-100 outline-none ring-cyan-300 focus:ring-2"
                  >
                    {sampleRequests.map((sample) => (
                      <option key={sample.id} value={sample.id}>
                        {sample.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <TextField
                    label="Customer / opportunity name"
                    value={form.customerName}
                    onChange={(value) => updateForm("customerName", value)}
                  />
                  <TextField label="Deadline" value={form.deadline} onChange={(value) => updateForm("deadline", value)} />
                </div>
                <label className="mt-4 block">
                  <span className="text-sm font-semibold text-slate-200">Request summary</span>
                  <textarea
                    value={form.requestSummary}
                    onChange={(event) => updateForm("requestSummary", event.target.value)}
                    rows={5}
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 p-4 text-slate-100 outline-none ring-cyan-300 focus:ring-2"
                  />
                </label>
                <label className="mt-4 block">
                  <span className="text-sm font-semibold text-slate-200">What do you need from Software/Ops?</span>
                  <textarea
                    value={form.softwareNeed}
                    onChange={(event) => updateForm("softwareNeed", event.target.value)}
                    rows={4}
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 p-4 text-slate-100 outline-none ring-cyan-300 focus:ring-2"
                  />
                </label>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-200">Customer-facing commitment needed?</span>
                    <select
                      value={form.commitmentNeeded}
                      onChange={(event) => updateForm("commitmentNeeded", event.target.value as CommitmentNeeded)}
                      className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-slate-100 outline-none ring-cyan-300 focus:ring-2"
                    >
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-200">Sensitivity</span>
                    <select
                      value={form.sensitivity}
                      onChange={(event) => updateForm("sensitivity", event.target.value as SensitivityInput)}
                      className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-slate-100 outline-none ring-cyan-300 focus:ring-2"
                    >
                      <option>Normal</option>
                      <option>Customer confidential</option>
                      <option>Defence-sensitive</option>
                      <option>Unknown</option>
                    </select>
                  </label>
                </div>
                {error ? <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-rose-100">{error}</p> : null}
                <button
                  onClick={submitForTriage}
                  disabled={loading}
                  className="mt-5 rounded-xl bg-cyan-300 px-5 py-3 font-bold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Submitting..." : "Submit for AI triage"}
                </button>
              </Card>

              <Card title="Submitted requests" eyebrow="Local queue">
                <div className="space-y-3">
                  {queue.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedId(item.id);
                        setActiveView("queue");
                      }}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-left transition hover:border-cyan-300/50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-100">{item.triage.clean_title}</p>
                          <p className="mt-1 text-xs text-slate-500">{item.customerName}</p>
                        </div>
                        <Pill tone={item.triage.sensitivity === "Normal" ? "slate" : "amber"}>{item.triage.sensitivity}</Pill>
                      </div>
                      <div className="mt-3 grid gap-2 text-xs text-slate-400 md:grid-cols-4">
                        <span className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 font-semibold text-cyan-100">
                          Queue status: {displayStatus(item)}
                        </span>
                        <span>Deadline: {item.deadline}</span>
                        <span>Missing info: {item.triage.missing_information.length}</span>
                        <span>Route: {item.triage.suggested_route}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          ) : null}

          {activeView === "queue" ? (
            <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
              <Card title="Head of Software Queue" eyebrow="Review before interruption">
                <p>Review structured requests before they interrupt software or operations teams.</p>
                <div className="mt-5 space-y-3">
                  {queue.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        item.id === selectedItem.id ? "border-cyan-300 bg-cyan-300/10" : "border-slate-800 bg-slate-900/60 hover:border-cyan-300/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold text-slate-100">{item.triage.clean_title}</p>
                        <Pill tone="cyan">Queue status: {displayStatus(item)}</Pill>
                      </div>
                      <p className="mt-2 text-xs text-slate-400">Deadline: {item.deadline}</p>
                    </button>
                  ))}
                </div>
              </Card>

              <div className="space-y-6">
                <Card title={selectedItem.triage.clean_title} eyebrow="Selected request detail">
                  <div className="flex flex-wrap gap-2">
                    <Pill tone={selectedItem.triage.software_interrupt_allowed ? "emerald" : "rose"}>
                      Software interrupt allowed: {selectedItem.triage.software_interrupt_allowed ? "true" : "false"}
                    </Pill>
                    <Pill tone="cyan">Selected detail status: {selectedItem.status}</Pill>
                    <Pill>Confidence: {Math.round(selectedItem.triage.confidence * 100)}%</Pill>
                  </div>
                  <div className="mt-4 rounded-xl border border-cyan-300/30 bg-cyan-300/10 p-3 text-sm font-semibold text-cyan-100">
                    Selected detail status: {selectedItem.status}
                  </div>
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <Metric label="Request type" value={selectedItem.triage.request_type} />
                    <Metric label="Urgency" value={selectedItem.triage.urgency} />
                    <Metric label="Business value" value={selectedItem.triage.business_value} />
                    <Metric label="Technical complexity" value={selectedItem.triage.technical_complexity} />
                    <Metric label="Sensitivity" value={selectedItem.triage.sensitivity} />
                    <Metric label="Suggested route" value={selectedItem.triage.suggested_route} />
                    <Metric label="Suggested next action" value={selectedItem.triage.suggested_next_action} />
                    <Metric label="Recommended status" value={selectedItem.triage.recommended_status} />
                  </div>
                  <div className="mt-5">
                    <p className="font-semibold text-slate-200">Summary</p>
                    <p className="mt-2 rounded-xl border border-slate-800 bg-slate-900/70 p-3">{selectedItem.triage.summary}</p>
                  </div>
                  <div className="mt-5">
                    <p className="font-semibold text-slate-200">Original request</p>
                    <p className="mt-2 whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-900/70 p-3">{selectedItem.originalRequest}</p>
                  </div>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card title="Missing information">
                    <ListBlock items={selectedItem.triage.missing_information} />
                  </Card>
                  <Card title="Risk flags">
                    <ListBlock items={selectedItem.triage.risk_flags} />
                  </Card>
                </div>

                <Card title="Draft clarification message to Sales">
                  <p className="whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                    {selectedItem.triage.draft_clarification_to_sales}
                  </p>
                </Card>

                <Card title={`Safety checks: ${selectedItem.evalResult.score}%`} eyebrow="Local checks">
                  <p className="mb-4 text-slate-400">{selectedItem.evalResult.disclaimer}</p>
                  <div className="space-y-3">
                    {selectedItem.evalResult.checks.map((check) => (
                      <div key={check.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                        <div className="flex items-start justify-between gap-3">
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

                <Card title="Audit trail">
                  <div className="mb-4 flex flex-wrap gap-2">
                    <Pill>Model: {selectedItem.model}</Pill>
                    <Pill>Timestamp: {new Date(selectedItem.timestamp).toLocaleString()}</Pill>
                  </div>
                  <ListBlock
                    items={[
                      "Request submitted by Sales Portal",
                      "Mock context attached",
                      "LLM triage generated",
                      "Zod schema validation completed",
                      "Local safety checks completed",
                      "Head of Software review pending",
                      ...selectedItem.triage.audit_notes,
                    ]}
                  />
                </Card>

                <Card title="Reviewer actions">
                  <div className="grid gap-3 md:grid-cols-3">
                    {[
                      "Ask Sales for clarification",
                      "Route to Software",
                      "Route to Ops",
                      "Route to Security",
                      "Approve discovery",
                      "Reject / not now",
                    ].map((action) => (
                      <button
                        key={action}
                        onClick={() => updateStatus(action)}
                        className="rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-100 transition hover:border-cyan-300 hover:bg-cyan-300/10"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          ) : null}

          {activeView === "works" ? (
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <Card title="How it Works" eyebrow="Workflow">
                <ol className="space-y-3">
                  {[
                    "Sales submits request",
                    "AI structures it",
                    "AI flags missing info, sensitivity, and routing",
                    "Head of Software reviews clean queue",
                    "Reviewer routes, rejects, approves discovery, or asks for clarification",
                    "Sales sees updated status",
                  ].map((step, index) => (
                    <li key={step} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                      <span className="mr-3 rounded-full bg-cyan-300 px-2 py-1 text-xs font-bold text-slate-950">{index + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </Card>
              <Card title="Prototype boundary" eyebrow="Safety">
                <p>
                  This prototype uses a live server-side LLM call, mocked context, Zod validation, local safety checks, and no real Kelluu
                  data.
                </p>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <Metric label="LLM calls" value="Server-side only through /api/analyse" />
                  <Metric label="Data" value="Mocked, no confidential Kelluu data" />
                  <Metric label="Safety" value="Local checks shown in Head of Software Queue" />
                  <Metric label="Actions" value="Local status updates only" />
                </div>
              </Card>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 text-slate-200">{value}</p>
    </div>
  );
}
