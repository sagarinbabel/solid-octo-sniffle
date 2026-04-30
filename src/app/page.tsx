"use client";

import { useState } from "react";
import { mockedContextSnippets } from "@/lib/context";
import { runEvals } from "@/lib/evals";
import { sampleRequests } from "@/lib/samples";
import type { AnalyseResponse, AnalysisResult, EvalResult } from "@/lib/schema";

type Tab = "intake" | "analysis" | "approval" | "evals" | "architecture";

const tabs: { id: Tab; label: string }[] = [
  { id: "intake", label: "Request Intake" },
  { id: "analysis", label: "AI Analysis" },
  { id: "approval", label: "Approval & Audit" },
  { id: "evals", label: "Eval Suite" },
  { id: "architecture", label: "Architecture" }
];

const ownerAllowList = ["Sales", "Operations", "Software", "Security", "Compliance", "Product", "Delivery"];

function InfoPill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">{children}</span>;
}

function SectionCard({
  title,
  children,
  eyebrow
}: {
  title: string;
  children: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl shadow-slate-950/30">
      {eyebrow ? <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">{eyebrow}</p> : null}
      <h2 className="text-lg font-semibold text-slate-50">{title}</h2>
      <div className="mt-4 text-sm leading-6 text-slate-300">{children}</div>
    </section>
  );
}

function ListBlock({ items, empty = "None reported." }: { items?: string[]; empty?: string }) {
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

function KeyValueGrid({ result }: { result: AnalysisResult }) {
  const entries = Object.entries(result.extracted_fields);
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {entries.map(([key, value]) => (
        <div key={key} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{key.replaceAll("_", " ")}</p>
          <p className="mt-1 text-slate-200">{value || "Unknown"}</p>
        </div>
      ))}
    </div>
  );
}

function EvalBadge({ status }: { status: "pass" | "fail" | "warning" }) {
  const styles = {
    pass: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
    fail: "border-rose-400/40 bg-rose-400/10 text-rose-200",
    warning: "border-amber-400/40 bg-amber-400/10 text-amber-200"
  };
  return <span className={`rounded-full border px-2 py-1 text-xs font-semibold uppercase ${styles[status]}`}>{status}</span>;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("intake");
  const [requestText, setRequestText] = useState(sampleRequests[0].text);
  const [selectedSample, setSelectedSample] = useState(sampleRequests[0].id);
  const [analysis, setAnalysis] = useState<AnalyseResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [batchEvals, setBatchEvals] = useState<{ title: string; evalResult: EvalResult }[]>([]);

  const currentEval = analysis?.result ? runEvals(requestText, analysis.result) : null;

  async function analyseRequest() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestText })
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || "Analysis failed.");
        return;
      }
      setAnalysis(payload);
      setActiveTab("analysis");
    } catch {
      setError("Unable to reach the analysis service. Check the local server and try again.");
    } finally {
      setLoading(false);
    }
  }

  function selectSample(id: string) {
    const sample = sampleRequests.find((item) => item.id === id);
    if (!sample) return;
    setSelectedSample(id);
    setRequestText(sample.text);
  }

  function runSampleEvalPreview() {
    if (!analysis?.result) return;
    setBatchEvals(
      sampleRequests.map((sample) => ({
        title: sample.label,
        evalResult: runEvals(sample.text, analysis.result)
      }))
    );
  }

  const approvalOwners = analysis?.result.suggested_owners.filter((owner) => ownerAllowList.includes(owner)).slice(0, 3) ?? [];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#16324f,transparent_32%),linear-gradient(135deg,#020617,#0f172a_45%,#111827)] text-slate-100">
      <div className="mx-auto max-w-7xl px-5 py-8">
        <header className="rounded-3xl border border-slate-800 bg-slate-950/75 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Kelluu Core AI Architect Prototype</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">AI Request Backbone</h1>
              <p className="mt-4 max-w-3xl text-lg text-slate-300">
                A lightweight internal AI workflow backbone that turns messy sales/customer/ops requests into structured,
                reviewable, auditable work before they interrupt software and operations teams.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <InfoPill>Server-side LLM calls</InfoPill>
              <InfoPill>Zod validation</InfoPill>
              <InfoPill>Seed eval harness</InfoPill>
              <InfoPill>Mocked data only</InfoPill>
            </div>
          </div>
        </header>

        <nav className="mt-6 grid gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-2 md:grid-cols-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
                activeTab === tab.id ? "bg-cyan-300 text-slate-950" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-6">
          {activeTab === "intake" ? (
            <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
              <SectionCard title="Request Intake" eyebrow="Prototype scope">
                <p>
                  Built for Sagar Dubey&apos;s Kelluu Core AI Architect application, this prototype shows how a dual-use
                  deep-tech team could structure inbound sales, customer, and operations requests before committing software or
                  delivery resources.
                </p>
                <p className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-amber-100">
                  Mocked data only. No Kelluu confidential data used.
                </p>
                <label className="mt-5 block text-sm font-semibold text-slate-200" htmlFor="sample">
                  Sample request
                </label>
                <select
                  id="sample"
                  value={selectedSample}
                  onChange={(event) => selectSample(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-slate-100 outline-none ring-cyan-300 focus:ring-2"
                >
                  {sampleRequests.map((sample) => (
                    <option key={sample.id} value={sample.id}>
                      {sample.label}
                    </option>
                  ))}
                </select>
                <label className="mt-5 block text-sm font-semibold text-slate-200" htmlFor="request">
                  Messy internal request
                </label>
                <textarea
                  id="request"
                  value={requestText}
                  onChange={(event) => setRequestText(event.target.value)}
                  rows={9}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 p-4 text-slate-100 outline-none ring-cyan-300 focus:ring-2"
                />
                {error ? <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-rose-100">{error}</p> : null}
                <button
                  onClick={analyseRequest}
                  disabled={loading}
                  className="mt-5 rounded-xl bg-cyan-300 px-5 py-3 font-bold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Analysing..." : "Analyse with AI"}
                </button>
              </SectionCard>
              <SectionCard title="Mock retrieval context" eyebrow="Hardcoded guidance">
                <ListBlock items={mockedContextSnippets.map((snippet) => `${snippet.title}: ${snippet.body}`)} />
              </SectionCard>
            </div>
          ) : null}

          {activeTab === "analysis" ? (
            analysis ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <SectionCard title="Summary" eyebrow="AI analysis">
                  <p>{analysis.result.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <InfoPill>Classification: {analysis.result.classification}</InfoPill>
                    <InfoPill>Sensitivity: {analysis.result.sensitivity}</InfoPill>
                    <InfoPill>Confidence: {Math.round(analysis.result.confidence * 100)}%</InfoPill>
                  </div>
                </SectionCard>
                <SectionCard title="Extracted fields">
                  <KeyValueGrid result={analysis.result} />
                </SectionCard>
                <SectionCard title="Missing information">
                  <ListBlock items={analysis.result.missing_information} />
                </SectionCard>
                <SectionCard title="Suggested owners">
                  <ListBlock items={analysis.result.suggested_owners} />
                </SectionCard>
                <SectionCard title="Internal tasks">
                  <ListBlock items={analysis.result.internal_tasks} />
                </SectionCard>
                <SectionCard title="Risk notes">
                  <ListBlock items={analysis.result.risk_notes} />
                </SectionCard>
                <SectionCard title="Draft internal spec">
                  <p className="whitespace-pre-wrap">{analysis.result.draft_internal_spec}</p>
                </SectionCard>
                <SectionCard title="Draft customer response">
                  <p className="whitespace-pre-wrap">{analysis.result.draft_customer_response}</p>
                </SectionCard>
              </div>
            ) : (
              <EmptyState message="Run an analysis from Request Intake to populate this page." />
            )
          ) : null}

          {activeTab === "approval" ? (
            analysis ? (
              <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                <SectionCard title="Approval gate" eyebrow="Human in the loop">
                  <p className="text-2xl font-bold text-cyan-200">
                    Human approval: {analysis.result.recommended_human_approval ? "Required" : "Not required by current output"}
                  </p>
                  <div className="mt-4">
                    <p className="font-semibold text-slate-200">Suggested approval owners</p>
                    <div className="mt-2">
                      <ListBlock items={approvalOwners.length ? approvalOwners : analysis.result.suggested_owners} />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-slate-300">
                    <p>No external action taken</p>
                    <p>Mock data only</p>
                    <p>Human approval required before customer-facing commitments</p>
                    <p>Secrets and production systems are not accessible</p>
                    <p>This prototype does not connect to CRM, ERP, ticketing, repos, or internal docs</p>
                  </div>
                </SectionCard>
                <SectionCard title="Audit trail">
                  <div className="mb-4 grid gap-2 md:grid-cols-2">
                    <InfoPill>Model: {analysis.model}</InfoPill>
                    <InfoPill>Timestamp: {new Date(analysis.timestamp).toLocaleString()}</InfoPill>
                  </div>
                  <ListBlock
                    items={[
                      "Request received",
                      "Mock context attached",
                      "LLM analysis generated",
                      "Schema validation completed",
                      "Eval checks completed",
                      "Human approval pending",
                      ...analysis.result.audit_notes
                    ]}
                  />
                </SectionCard>
              </div>
            ) : (
              <EmptyState message="Run an analysis to view approval and audit state." />
            )
          ) : null}

          {activeTab === "evals" ? (
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <SectionCard title="Eval Suite" eyebrow="Quality gates">
                <p>
                  This is a seed eval harness, not proof of full safety. It checks structure, safety, missing information,
                  approval behavior, owner routing, and unsupported commitments before work is treated as reviewable.
                </p>
                <button
                  onClick={() => analysis && setAnalysis({ ...analysis, evalResult: runEvals(requestText, analysis.result) })}
                  disabled={!analysis}
                  className="mt-5 rounded-xl bg-cyan-300 px-4 py-2 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Run evals against current AI output
                </button>
                <button
                  onClick={runSampleEvalPreview}
                  disabled={!analysis}
                  className="ml-0 mt-3 rounded-xl border border-slate-700 px-4 py-2 font-bold text-slate-200 disabled:cursor-not-allowed disabled:opacity-50 md:ml-3"
                >
                  Preview current output against all sample cases
                </button>
              </SectionCard>
              {currentEval ? (
                <SectionCard title={`Current score: ${currentEval.score}%`}>
                  <div className="space-y-3">
                    {currentEval.checks.map((check) => (
                      <div key={check.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-100">{check.label}</p>
                            <p className="mt-1 text-slate-400">{check.explanation}</p>
                          </div>
                          <EvalBadge status={check.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              ) : (
                <EmptyState message="Run an analysis before evaluating model output." />
              )}
              {batchEvals.length ? (
                <SectionCard title="Sample-case preview">
                  <div className="grid gap-3 md:grid-cols-2">
                    {batchEvals.map((item) => (
                      <div key={item.title} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                        <p className="font-semibold text-slate-100">{item.title}</p>
                        <p className="mt-2 text-2xl font-bold text-cyan-200">{item.evalResult.score}%</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              ) : null}
            </div>
          ) : null}

          {activeTab === "architecture" ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <SectionCard title="Current prototype architecture" eyebrow="Implemented">
                <ListBlock
                  items={[
                    "User",
                    "Next.js frontend",
                    "/api/analyse",
                    "Server-side prompt builder",
                    "Mocked retrieval context",
                    "Live LLM API",
                    "Structured JSON parser",
                    "Zod schema validation",
                    "Rule-based eval runner",
                    "UI rendering",
                    "Human approval/audit trail"
                  ]}
                />
              </SectionCard>
              <SectionCard title="Future production architecture" eyebrow="Not implemented">
                <ListBlock
                  items={[
                    "SSO/RBAC",
                    "Audit database",
                    "Approved model gateway",
                    "On-prem/private model option",
                    "CRM/ERP/ticketing integrations",
                    "Internal documentation retrieval",
                    "Repo/CI/CD integrations",
                    "Secrets manager",
                    "Monitoring for cost/latency/failure rate",
                    "Human review workflow",
                    "Golden eval dataset",
                    "Security review"
                  ]}
                />
              </SectionCard>
              <SectionCard title="Design stance">
                <p>
                  The prototype treats the AI as a structuring layer, not an autonomous actor. It does not email customers,
                  change systems, access production data, or claim feasibility. It prepares reviewable work for approved owners.
                </p>
                <p className="mt-3">
                  AI-assisted development could become a future extension through repo, CI/CD, and security-scanner integrations,
                  but it is not part of this product prototype.
                </p>
              </SectionCard>
              <SectionCard title="Security boundary">
                <p>
                  The browser only calls the app&apos;s own API route. The OpenAI API key is read from server-side environment
                  variables and is never placed in frontend code or a NEXT_PUBLIC variable.
                </p>
              </SectionCard>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 p-8 text-center text-slate-400">
      {message}
    </div>
  );
}
