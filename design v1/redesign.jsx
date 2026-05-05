// Three minimalist directions for AI Request Triage
// All share: single accent color, flat backgrounds, hairline borders, tabular data.

const seedItem = {
  id: "seed",
  customer: "Defence border monitoring opportunity",
  deadline: "Fri, May 8",
  submittedAt: "Today, 09:14",
  original:
  "A defence customer wants to know whether we can support persistent monitoring for a remote border corridor. They need a preliminary technical answer by Friday and want to understand coverage, latency, winter performance, and delivery format.",
  triage: {
    title: "Clarify persistent border monitoring RFI before software review",
    summary:
    "Sales needs a cautious internal feasibility review for a defence customer asking about persistent remote border monitoring.",
    requestType: "Customer RFI",
    urgency: "High",
    businessValue: "High",
    complexity: "High",
    sensitivity: "Defence-sensitive",
    route: "Sales + Ops + Security before Software",
    nextAction: "Ask Sales to collect missing details, then route to Security and Ops.",
    interrupt: false,
    confidence: 0.84,
    missing: [
    "AOI / location and corridor dimensions",
    "Required revisit cadence or persistence expectation",
    "Latency and delivery format requirements",
    "Environmental and winter operating constraints"],

    risks: [
    "Defence-sensitive customer context",
    "Potential unsupported feasibility commitment",
    "Software interruption risk before requirements are clear"],

    draft:
    "Before Software reviews this, please confirm the AOI, cadence, latency target, delivery format, winter constraints, and who can approve any customer-facing statement.",
    status: "Needs clarification"
  }
};

const queueOther = [
{ customer: "Large customer meeting", title: "Demo concept request — needs scope clarification", status: "Needs clarification", deadline: "Next month", missing: 3, interrupt: false },
{ customer: "Monitoring report customer", title: "Status update on monitoring report", status: "Route to Ops", deadline: "Today", missing: 1, interrupt: true },
{ customer: "Border monitoring schedule request", title: "Request to commit to monitoring schedule by email", status: "Reject — unsafe promise", deadline: "ASAP", missing: 2, interrupt: false },
{ customer: "Internal Operations", title: "Fleet availability dashboard — discovery", status: "Approve discovery", deadline: "—", missing: 4, interrupt: true }];


const ACCENT = "#B23A1F"; // single signal color, used only for risk/blocked

// =============================================================================
// SHARED PRIMITIVES
// =============================================================================

const KV = ({ label, value, mono }) =>
<div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
    <span style={{ fontSize: 11, letterSpacing: 0.4, textTransform: "uppercase", color: "#8A8276" }}>{label}</span>
    <span style={{ fontSize: 14, color: "#1A1814", fontFamily: mono ? "ui-monospace, 'SF Mono', Menlo, monospace" : "inherit", fontWeight: 500 }}>{value}</span>
  </div>;


const Hairline = ({ style }) => <div style={{ height: 1, background: "#E6E2DA", ...style }} />;

// =============================================================================
// OPTION 1 — EDITORIAL
// Reads like a memo. Serif headline, generous whitespace, no boxes.
// =============================================================================

function Editorial() {
  const t = seedItem.triage;
  return (
    <div style={{ width: 1280, background: "#FAF7F1", color: "#1A1814", fontFamily: "Inter, -apple-system, sans-serif", padding: "56px 96px 96px" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&display=swap" />

      {/* Masthead */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: 24, borderBottom: "1px solid #1A1814" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#8A8276", fontWeight: 600 }}>airship company · Internal</div>
          <h1 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 38, fontWeight: 500, margin: "8px 0 0", letterSpacing: -0.5 }}>AI supported Request Triage</h1>
        </div>
        <nav style={{ display: "flex", gap: 28, fontSize: 14 }}>
          <a style={{ color: "#1A1814", borderBottom: "1px solid #1A1814", paddingBottom: 4 }}>Queue</a>
          <a style={{ color: "#8A8276" }}>Submit</a>
          <a style={{ color: "#8A8276" }}>Method</a>
        </nav>
      </header>

      {/* Lede — proposition + steps + queue summary, all together as one tight top section */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, marginTop: 36, paddingBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#8A8276", fontWeight: 600, marginBottom: 12 }}>The proposition</div>
          <p style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 24, lineHeight: 1.3, margin: 0, fontWeight: 400, letterSpacing: -0.2 }}>
            Messy customer requests arrive as urgent interruptions. Triage turns each one into a structured, reviewable brief — <em style={{ color: ACCENT }}>before</em> it reaches the software team.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 14, lineHeight: 1.55, color: "#3A352D", paddingTop: 4 }}>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ fontFamily: "ui-monospace, monospace", color: "#8A8276", width: 24 }}>01</span>
            <span>Sales submits a request in plain language.</span>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ fontFamily: "ui-monospace, monospace", color: "#8A8276", width: 24 }}>02</span>
            <span>The model returns a structured brief, validated against a schema.</span>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ fontFamily: "ui-monospace, monospace", color: "#8A8276", width: 24 }}>03</span>
            <span>Head of Software reviews, then routes, clarifies, or rejects.</span>
          </div>
        </div>
      </section>

      {/* Queue heading — flush against the lede, no big hairline gap */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 16, marginBottom: 20, paddingTop: 24, borderTop: "1px solid #E6E2DA" }}>
        <h2 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 22, fontWeight: 500, margin: 0 }}>Queue · 5 open</h2>
        <div style={{ fontSize: 13, color: "#8A8276", fontFamily: "ui-monospace, monospace" }}>2 blocked · 2 routable · 1 reject</div>
      </div>

      {/* Queue table */}
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "20px 1fr 180px 120px 100px 120px", gap: 24, fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase", color: "#8A8276", paddingBottom: 12, borderBottom: "1px solid #1A1814", fontWeight: 600 }}>
          <div></div>
          <div>Request</div>
          <div>Customer</div>
          <div>Deadline</div>
          <div>Missing</div>
          <div style={{ textAlign: "right" }}>Status</div>
        </div>
        {[seedItem.triage, ...queueOther.map((q) => ({ title: q.title, customer: q.customer, deadline: q.deadline, missing: q.missing, status: q.status, interrupt: q.interrupt }))].map((row, i) => {
          const customer = i === 0 ? seedItem.customer : row.customer;
          const missingCount = i === 0 ? 4 : row.missing;
          const isBlocked = !row.interrupt;
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "20px 1fr 180px 120px 100px 120px", gap: 24, fontSize: 14, padding: "18px 0", borderBottom: "1px solid #E6E2DA", alignItems: "center", background: i === 0 ? "#F2EDE2" : "transparent", marginInline: i === 0 ? -16 : 0, paddingInline: i === 0 ? 16 : 0 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: isBlocked ? ACCENT : "#1A1814", opacity: isBlocked ? 1 : 0.25 }} />
              <div style={{ fontWeight: i === 0 ? 600 : 500 }}>{row.title}</div>
              <div style={{ color: "#5A544A" }}>{customer}</div>
              <div style={{ fontFamily: "ui-monospace, monospace", color: "#5A544A", fontSize: 13 }}>{row.deadline}</div>
              <div style={{ fontFamily: "ui-monospace, monospace", color: missingCount > 2 ? ACCENT : "#5A544A", fontSize: 13 }}>{missingCount} item{missingCount === 1 ? "" : "s"}</div>
              <div style={{ textAlign: "right", fontSize: 13, color: "#1A1814" }}>{row.status}</div>
            </div>);

        })}
      </div>

      <div style={{ marginTop: 56 }} />

      {/* Selected detail */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 64 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#8A8276", fontWeight: 600, marginBottom: 12 }}>Selected · {seedItem.customer}</div>
          <h2 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 30, fontWeight: 500, margin: 0, lineHeight: 1.2, letterSpacing: -0.3 }}>{t.title}</h2>
          <p style={{ marginTop: 16, fontSize: 16, lineHeight: 1.6, color: "#3A352D", maxWidth: 640 }}>{t.summary}</p>

          <div style={{ marginTop: 36 }}>
            <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#8A8276", fontWeight: 600, marginBottom: 10 }}>Original request</div>
            <p style={{ margin: 0, fontFamily: "'Source Serif 4', serif", fontSize: 16, lineHeight: 1.65, color: "#3A352D", paddingLeft: 16, borderLeft: "2px solid #E6E2DA" }}>{seedItem.original}</p>
          </div>

          <div style={{ marginTop: 36 }}>
            <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#8A8276", fontWeight: 600, marginBottom: 14 }}>Missing information · 4</div>
            <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10, counterReset: "miss" }}>
              {t.missing.map((m, idx) =>
              <li key={idx} style={{ display: "flex", gap: 16, fontSize: 14, color: "#1A1814" }}>
                  <span style={{ fontFamily: "ui-monospace, monospace", color: "#8A8276", width: 24 }}>{String(idx + 1).padStart(2, "0")}</span>
                  <span>{m}</span>
                </li>
              )}
            </ol>
          </div>

          <div style={{ marginTop: 36 }}>
            <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#8A8276", fontWeight: 600, marginBottom: 14 }}>Risk flags</div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {t.risks.map((r, idx) =>
              <li key={idx} style={{ display: "flex", gap: 16, fontSize: 14, color: "#1A1814" }}>
                  <span style={{ color: ACCENT, fontFamily: "ui-monospace, monospace", width: 24 }}>!</span>
                  <span>{r}</span>
                </li>
              )}
            </ul>
          </div>

          <div style={{ marginTop: 36 }}>
            <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#8A8276", fontWeight: 600, marginBottom: 14 }}>Draft clarification to Sales</div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: "#3A352D", padding: 20, background: "#FFFFFF", border: "1px solid #E6E2DA" }}>{t.draft}</p>
          </div>
        </div>

        {/* Side rail */}
        <aside style={{ position: "sticky", top: 24, alignSelf: "start" }}>
          <div style={{ padding: 20, background: "#FFFFFF", border: `1px solid ${ACCENT}`, marginBottom: 20 }}>
            <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: ACCENT, fontWeight: 700, marginBottom: 6 }}>Software interrupt</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: ACCENT, fontFamily: "'Source Serif 4', serif" }}>Blocked</div>
            <div style={{ fontSize: 13, color: "#5A544A", marginTop: 8, lineHeight: 1.5 }}>4 missing inputs and a defence-sensitive context. Resolve before routing to Software.</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingBlock: 4 }}>
            <KV label="Request type" value={t.requestType} />
            <KV label="Urgency" value={t.urgency} />
            <KV label="Business value" value={t.businessValue} />
            <KV label="Complexity" value={t.complexity} />
            <KV label="Sensitivity" value={t.sensitivity} />
            <KV label="Route" value={t.route} />
            <KV label="Confidence" value={`${Math.round(t.confidence * 100)}%`} mono />
          </div>

          <Hairline style={{ margin: "24px 0" }} />

          <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#8A8276", fontWeight: 600, marginBottom: 12 }}>Reviewer action</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "#E6E2DA", border: "1px solid #E6E2DA" }}>
            {["Ask Sales for clarification", "Route to Software", "Route to Ops", "Route to Security", "Approve discovery", "Reject — not now"].map((a, i) =>
            <button key={i} style={{ background: "#FFFFFF", border: 0, padding: "12px 14px", textAlign: "left", fontSize: 14, color: "#1A1814", cursor: "pointer", fontFamily: "inherit" }}>{a}</button>
            )}
          </div>
        </aside>
      </section>
    </div>);

}

// =============================================================================
// OPTION 2 — TABULAR
// Ops console. Mono everywhere, data-dense, no decoration. Bloomberg-feel.
// =============================================================================

function Tabular() {
  const t = seedItem.triage;
  return (
    <div style={{ width: 1280, background: "#FBFBF9", color: "#0E0E0C", fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace", fontSize: 13, lineHeight: 1.55 }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" />
      <style>{`.tab * { font-family: 'JetBrains Mono', ui-monospace, monospace; }`}</style>

      <div className="tab">
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 32px", borderBottom: "1px solid #0E0E0C", background: "#0E0E0C", color: "#FBFBF9" }}>
          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            <div style={{ fontWeight: 600, letterSpacing: 1 }}>TRIAGE/v0.3</div>
            <div style={{ display: "flex", gap: 20, fontSize: 12 }}>
              <span style={{ borderBottom: `1px solid ${ACCENT}`, paddingBottom: 2, color: ACCENT }}>queue</span>
              <span style={{ opacity: 0.55 }}>submit</span>
              <span style={{ opacity: 0.55 }}>method</span>
            </div>
          </div>
          <div style={{ fontSize: 11, opacity: 0.6 }}>gpt-4.1-mini · seeded · 2026-04-30 18:00 UTC</div>
        </div>

        {/* Pitch strip */}
        <div style={{ padding: "28px 32px", borderBottom: "1px solid #D9D6CD", display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "end" }}>
          <div>
            <div style={{ fontSize: 11, color: "#7A7468", marginBottom: 10 }}>// what this does</div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 24, lineHeight: 1.3, fontWeight: 500, letterSpacing: -0.3, maxWidth: 760 }}>
              Free-text request <span style={{ color: ACCENT }}>→</span> validated JSON brief <span style={{ color: ACCENT }}>→</span> reviewer routes, blocks, or clarifies. Software is never interrupted before a human signs off.
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "4px 24px", fontSize: 12, color: "#3A352D" }}>
            <span style={{ color: "#7A7468" }}>open</span><span style={{ fontWeight: 600 }}>5</span>
            <span style={{ color: "#7A7468" }}>blocked</span><span style={{ color: ACCENT, fontWeight: 600 }}>2</span>
            <span style={{ color: "#7A7468" }}>routable</span><span style={{ fontWeight: 600 }}>2</span>
            <span style={{ color: "#7A7468" }}>reject</span><span style={{ fontWeight: 600 }}>1</span>
          </div>
        </div>

        {/* Two-pane: list + detail */}
        <div style={{ display: "grid", gridTemplateColumns: "440px 1fr", minHeight: 720 }}>
          {/* Queue list */}
          <div style={{ borderRight: "1px solid #D9D6CD" }}>
            <div style={{ padding: "10px 16px", fontSize: 11, color: "#7A7468", borderBottom: "1px solid #D9D6CD", display: "grid", gridTemplateColumns: "16px 1fr 56px", gap: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
              <span></span><span>request · customer</span><span style={{ textAlign: "right" }}>miss</span>
            </div>
            {[{ ...seedItem.triage, customer: seedItem.customer, deadline: seedItem.deadline, missingCount: 4, selected: true }, ...queueOther.map((q) => ({ title: q.title, customer: q.customer, deadline: q.deadline, missingCount: q.missing, status: q.status, interrupt: q.interrupt }))].map((row, i) => {
              const blocked = !row.interrupt;
              return (
                <div key={i} style={{ padding: "14px 16px", borderBottom: "1px solid #ECE9E0", display: "grid", gridTemplateColumns: "16px 1fr 56px", gap: 12, background: row.selected ? "#F2EDE2" : "transparent", borderLeft: row.selected ? `2px solid ${ACCENT}` : "2px solid transparent" }}>
                  <div style={{ paddingTop: 5 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: blocked ? ACCENT : "#0E0E0C", opacity: blocked ? 1 : 0.3 }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: row.selected ? 600 : 500, color: "#0E0E0C", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.title}</div>
                    <div style={{ fontSize: 11, color: "#7A7468", display: "flex", gap: 10 }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.customer}</span>
                      <span>·</span>
                      <span>{row.deadline}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", fontSize: 13, color: row.missingCount > 2 ? ACCENT : "#0E0E0C", fontWeight: 500 }}>{row.missingCount}</div>
                </div>);

            })}
          </div>

          {/* Detail */}
          <div style={{ padding: "0 32px 40px" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "16px 0", borderBottom: "1px solid #D9D6CD", marginBottom: 24 }}>
              <span style={{ fontSize: 11, padding: "3px 8px", border: `1px solid ${ACCENT}`, color: ACCENT, fontWeight: 600, letterSpacing: 0.5 }}>SW_INTERRUPT=BLOCKED</span>
              <span style={{ fontSize: 11, color: "#7A7468" }}>conf=0.84</span>
              <span style={{ fontSize: 11, color: "#7A7468" }}>schema=valid</span>
              <span style={{ fontSize: 11, color: "#7A7468" }}>safety=pass</span>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 11, color: "#7A7468" }}>id={seedItem.id.slice(0, 8)}</span>
            </div>

            <div style={{ fontFamily: "Inter, sans-serif" }}>
              <div style={{ fontSize: 11, letterSpacing: 0.6, color: "#7A7468", marginBottom: 8, textTransform: "uppercase", fontFamily: "JetBrains Mono, monospace" }}>{seedItem.customer} · {seedItem.deadline}</div>
              <h2 style={{ fontSize: 26, lineHeight: 1.25, fontWeight: 600, margin: 0, letterSpacing: -0.3, maxWidth: 720 }}>{t.title}</h2>
              <p style={{ marginTop: 14, fontSize: 15, lineHeight: 1.6, color: "#3A352D", maxWidth: 720 }}>{t.summary}</p>
            </div>

            {/* Field grid */}
            <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px 28px", paddingTop: 20, borderTop: "1px solid #ECE9E0" }}>
              {[
              ["urgency", t.urgency], ["business_value", t.businessValue], ["complexity", t.complexity], ["sensitivity", t.sensitivity],
              ["request_type", t.requestType], ["confidence", `${Math.round(t.confidence * 100)}%`], ["status", t.status], ["interrupt_allowed", "false"]].
              map(([k, v]) =>
              <div key={k}>
                  <div style={{ fontSize: 11, color: "#7A7468", marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 13, color: k === "interrupt_allowed" ? ACCENT : "#0E0E0C", fontWeight: 500 }}>{v}</div>
                </div>
              )}
            </div>

            {/* Original */}
            <details open style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid #ECE9E0" }}>
              <summary style={{ fontSize: 11, color: "#7A7468", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5, cursor: "pointer" }}>original_request</summary>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, lineHeight: 1.6, color: "#3A352D", margin: "12px 0 0", padding: 14, background: "#F4F2EB", borderLeft: "2px solid #D9D6CD" }}>{seedItem.original}</p>
            </details>

            {/* Missing + Risks side by side */}
            <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid #ECE9E0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 }}>
              <div>
                <div style={{ fontSize: 11, color: "#7A7468", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>missing_information [4]</div>
                {t.missing.map((m, i) =>
                <div key={i} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid #ECE9E0", fontFamily: "Inter, sans-serif", fontSize: 13 }}>
                    <span style={{ color: "#7A7468", fontFamily: "JetBrains Mono, monospace", width: 20 }}>{i + 1}.</span>
                    <span>{m}</span>
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#7A7468", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>risk_flags [3]</div>
                {t.risks.map((r, i) =>
                <div key={i} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid #ECE9E0", fontFamily: "Inter, sans-serif", fontSize: 13 }}>
                    <span style={{ color: ACCENT, fontFamily: "JetBrains Mono, monospace", width: 20 }}>!</span>
                    <span>{r}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action row */}
            <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid #ECE9E0" }}>
              <div style={{ fontSize: 11, color: "#7A7468", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>reviewer_action</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                ["clarify", false], ["→ software", false], ["→ ops", false], ["→ security", false], ["approve discovery", false], ["reject", false]].
                map(([label]) =>
                <button key={label} style={{ padding: "8px 14px", border: "1px solid #0E0E0C", background: "#FBFBF9", fontSize: 12, color: "#0E0E0C", cursor: "pointer", fontFamily: "JetBrains Mono, monospace" }}>{label}</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

}

// =============================================================================
// OPTION 3 — SPLIT
// The proposition IS the layout: messy on left, structured on right.
// =============================================================================

function Split() {
  const t = seedItem.triage;
  return (
    <div style={{ width: 1280, background: "#F7F7F5", color: "#0F0F0E", fontFamily: "Inter, -apple-system, sans-serif" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />

      {/* Header */}
      <div style={{ padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E2E0DA" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 24, height: 24, background: "#0F0F0E", display: "grid", placeItems: "center", color: "#F7F7F5", fontSize: 12, fontWeight: 700 }}>K</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Triage</div>
          <div style={{ fontSize: 13, color: "#7A7670" }}>·  Internal request workflow</div>
        </div>
        <div style={{ display: "flex", gap: 4, fontSize: 13 }}>
          {["Queue", "Submit", "Method"].map((n, i) =>
          <a key={n} style={{ padding: "6px 14px", color: i === 0 ? "#0F0F0E" : "#7A7670", background: i === 0 ? "#E2E0DA" : "transparent", borderRadius: 999 }}>{n}</a>
          )}
        </div>
      </div>

      {/* Hero: the transformation */}
      <div style={{ padding: "48px 48px 32px" }}>
        <div style={{ fontSize: 12, color: "#7A7670", letterSpacing: 0.4, textTransform: "uppercase", fontWeight: 600, marginBottom: 14 }}>Selected · {seedItem.customer} · {seedItem.deadline}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 1fr", gap: 0, alignItems: "stretch", minHeight: 220 }}>
          {/* In */}
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E0DA", padding: 28, position: "relative" }}>
            <div style={{ fontSize: 11, color: "#7A7670", letterSpacing: 0.6, textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>Original — what Sales wrote</div>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "#3A3835" }}>{seedItem.original}</p>
          </div>

          {/* Arrow */}
          <div style={{ display: "grid", placeItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ fontSize: 10, color: "#7A7670", letterSpacing: 1, textTransform: "uppercase" }}>Triage</div>
              <svg width="32" height="14" viewBox="0 0 32 14" fill="none">
                <path d="M0 7H30M30 7L24 1M30 7L24 13" stroke="#0F0F0E" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

          {/* Out */}
          <div style={{ background: "#0F0F0E", color: "#F7F7F5", padding: 28, position: "relative" }}>
            <div style={{ fontSize: 11, color: "#A09C94", letterSpacing: 0.6, textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>Brief — structured · validated</div>
            <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0, lineHeight: 1.3, letterSpacing: -0.2 }}>{t.title}</h2>
            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", fontSize: 13 }}>
              {[["Urgency", t.urgency], ["Sensitivity", t.sensitivity], ["Complexity", t.complexity], ["Confidence", `${Math.round(t.confidence * 100)}%`]].map(([k, v]) =>
              <div key={k} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #2A2A28", paddingBottom: 6 }}>
                  <span style={{ color: "#A09C94" }}>{k}</span>
                  <span style={{ fontWeight: 500 }}>{v}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Decision bar */}
      <div style={{ padding: "0 48px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 24, alignItems: "center", padding: "20px 24px", background: "#FFFFFF", border: `1px solid ${ACCENT}`, borderLeft: `4px solid ${ACCENT}` }}>
          <div>
            <div style={{ fontSize: 11, color: ACCENT, letterSpacing: 0.6, textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Decision</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: ACCENT }}>Software interrupt blocked</div>
          </div>
          <div style={{ fontSize: 14, color: "#3A3835", lineHeight: 1.5, maxWidth: 560 }}>
            4 missing inputs and a defence-sensitive context. Resolve before the Software team is asked to look at this.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ background: "#0F0F0E", color: "#F7F7F5", border: 0, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Ask Sales →</button>
            <button style={{ background: "#FFFFFF", color: "#0F0F0E", border: "1px solid #0F0F0E", padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Reject</button>
          </div>
        </div>
      </div>

      {/* Body grid */}
      <div style={{ padding: "0 48px 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E0DA", padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Missing information</div>
            <div style={{ fontSize: 12, color: ACCENT, fontWeight: 600 }}>4 items</div>
          </div>
          {t.missing.map((m, i) =>
          <div key={i} style={{ padding: "10px 0", borderBottom: i < t.missing.length - 1 ? "1px solid #ECEAE3" : "none", display: "flex", gap: 14, fontSize: 14, color: "#3A3835" }}>
              <span style={{ color: "#7A7670", width: 18 }}>{i + 1}</span>
              <span>{m}</span>
            </div>
          )}
        </div>

        <div style={{ background: "#FFFFFF", border: "1px solid #E2E0DA", padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Risk flags</div>
            <div style={{ fontSize: 12, color: ACCENT, fontWeight: 600 }}>3 items</div>
          </div>
          {t.risks.map((r, i) =>
          <div key={i} style={{ padding: "10px 0", borderBottom: i < t.risks.length - 1 ? "1px solid #ECEAE3" : "none", display: "flex", gap: 14, fontSize: 14, color: "#3A3835" }}>
              <span style={{ color: ACCENT, width: 18, fontWeight: 700 }}>!</span>
              <span>{r}</span>
            </div>
          )}
        </div>

        <div style={{ background: "#FFFFFF", border: "1px solid #E2E0DA", padding: 24, gridColumn: "span 2" }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Draft clarification to Sales</div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: "#3A3835", padding: 18, background: "#F7F7F5", border: "1px solid #ECEAE3" }}>{t.draft}</p>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button style={{ background: "#0F0F0E", color: "#F7F7F5", border: 0, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Send</button>
            <button style={{ background: "transparent", color: "#0F0F0E", border: "1px solid #E2E0DA", padding: "8px 14px", fontSize: 12, cursor: "pointer" }}>Edit</button>
            <button style={{ background: "transparent", color: "#7A7670", border: "1px solid #E2E0DA", padding: "8px 14px", fontSize: 12, cursor: "pointer" }}>Copy</button>
          </div>
        </div>
      </div>

      {/* Other queue items, demoted */}
      <div style={{ padding: "0 48px 64px" }}>
        <div style={{ fontSize: 11, color: "#7A7670", letterSpacing: 0.6, textTransform: "uppercase", fontWeight: 600, marginBottom: 14 }}>Rest of queue · 4</div>
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E0DA" }}>
          {queueOther.map((q, i) =>
          <div key={i} style={{ padding: "16px 24px", display: "grid", gridTemplateColumns: "12px 1fr 200px 100px 140px", gap: 20, alignItems: "center", borderTop: i > 0 ? "1px solid #ECEAE3" : "none", fontSize: 14 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: q.interrupt ? "#0F0F0E" : ACCENT, opacity: q.interrupt ? 0.3 : 1 }} />
              <div style={{ fontWeight: 500 }}>{q.title}</div>
              <div style={{ color: "#7A7670", fontSize: 13 }}>{q.customer}</div>
              <div style={{ color: "#7A7670", fontSize: 13 }}>{q.deadline}</div>
              <div style={{ fontSize: 13, color: q.interrupt ? "#0F0F0E" : ACCENT, textAlign: "right" }}>{q.status}</div>
            </div>
          )}
        </div>
      </div>
    </div>);

}

// Expose for canvas
Object.assign(window, { Editorial, Tabular, Split });