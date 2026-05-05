// Clickable prototype — Triage in the editorial-block style.
// Single React app with three tabs: Submit / Queue / Method.
// Form submission runs a mock triage (no live API). Queue selection,
// reviewer actions, and sample loading all work.

const FONT_STACK = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const BLUE_BLOCK = "#1B3DFF";
const INK = "#0A0A0A";
const PAPER = "#FFFFFF";
const RULE = "#111111";
const SUBTLE_RULE = "#E5E5E5";
const MUTED = "#6B6B6B";
const SOFT_BG = "#F4F4F2";
const SIGNAL = "#FF3D00";

// =============================================================================
// SAMPLE DATA — mirrors src/lib/samples.ts
// =============================================================================

const SAMPLES = [
{
  id: "defence-rfi",
  label: "Defence border-monitoring RFI",
  customerName: "Defence border monitoring opportunity",
  requestSummary: "A defence customer wants to know whether we can support persistent monitoring for a remote border corridor. They need a preliminary technical answer by Friday and want to understand coverage, latency, winter performance, and delivery format.",
  deadline: "Friday, May 8",
  softwareNeed: "Help Sales understand whether this is ready for software/ops review and what information is missing.",
  commitmentNeeded: "Yes",
  sensitivity: "Defence-sensitive"
},
{
  id: "vague-sales",
  label: "Vague sales request",
  customerName: "Large customer meeting",
  requestSummary: "Sales has a big customer opportunity next month. They need something impressive for the meeting and want software to quickly prepare a demo.",
  deadline: "Next month",
  softwareNeed: "Prepare a demo concept or decide what Sales must clarify first.",
  commitmentNeeded: "No",
  sensitivity: "Customer confidential"
},
{
  id: "delivery-update",
  label: "Customer delivery update",
  customerName: "Monitoring report customer",
  requestSummary: "A customer wants an update on when their latest monitoring report will be ready. Can we send them something today?",
  deadline: "Today",
  softwareNeed: "Check if this needs Delivery/Ops input or a customer-safe status draft.",
  commitmentNeeded: "Yes",
  sensitivity: "Customer confidential"
},
{
  id: "unsafe-promise",
  label: "Unsafe promise request",
  customerName: "Border monitoring schedule request",
  requestSummary: "Can the agent just email the customer and promise that we can support their requested border monitoring schedule?",
  deadline: "As soon as possible",
  softwareNeed: "Decide whether any direct customer promise is allowed.",
  commitmentNeeded: "Yes",
  sensitivity: "Defence-sensitive"
},
{
  id: "ops-dashboard",
  label: "Internal ops dashboard request",
  customerName: "Internal Operations",
  requestSummary: "Ops wants a dashboard showing fleet availability, recent mission status, delayed jobs, and customer delivery risks. They want it connected to internal systems and updated automatically.",
  deadline: "Not specified",
  softwareNeed: "Assess routing, missing data sources, permissions, and whether discovery should start.",
  commitmentNeeded: "No",
  sensitivity: "Unknown"
}];


// Mock triage results keyed by sample id (deterministic — feels like a real LLM)
const TRIAGE_BY_SAMPLE = {
  "defence-rfi": {
    title: "Clarify persistent border monitoring RFI before software review",
    summary: "A cautious internal feasibility review for a defence customer asking about persistent remote border monitoring. Resolve missing inputs before Software is engaged.",
    requestType: "Customer RFI",
    urgency: "High", businessValue: "High", complexity: "High", sensitivity: "Defence-sensitive",
    route: "Sales + Ops + Security before Software",
    nextAction: "Ask Sales to collect missing details, then route to Security and Ops.",
    interrupt: false, confidence: 0.84,
    missing: ["AOI / location and corridor dimensions", "Required revisit cadence or persistence expectation", "Latency and delivery format requirements", "Environmental and winter operating constraints"],
    risks: ["Defence-sensitive customer context", "Potential unsupported feasibility commitment", "Software interruption risk before requirements are clear"],
    draft: "Before Software reviews this, please confirm the AOI, cadence, latency target, delivery format, winter constraints, and who can approve any customer-facing statement.",
    status: "Needs clarification"
  },
  "vague-sales": {
    title: "Demo concept request — needs scope clarification",
    summary: "Sales needs a demo for a customer meeting next month. Scope, audience, and what 'impressive' means are all undefined.",
    requestType: "Internal demo request",
    urgency: "Medium", businessValue: "Medium", complexity: "Medium", sensitivity: "Customer confidential",
    route: "Sales clarification first; then Software discovery if scope justifies it",
    nextAction: "Ask Sales for the customer name, what outcome they want from the demo, and what success looks like.",
    interrupt: false, confidence: 0.71,
    missing: ["Customer / opportunity name", "Demo audience and seniority", "What outcome 'impressive' is supposed to drive"],
    risks: ["Vague success criteria", "Risk of building a generic demo no one needs", "Last-minute scope creep"],
    draft: "Before we scope a demo, can you share the customer name, the audience, and what specific outcome the meeting is meant to drive?",
    status: "Needs clarification"
  },
  "delivery-update": {
    title: "Status update on monitoring report delivery",
    summary: "Customer asking when a monitoring report will be ready. Routine — Ops has the answer; no Software work needed.",
    requestType: "Customer status update",
    urgency: "High", businessValue: "Low", complexity: "Low", sensitivity: "Customer confidential",
    route: "Ops",
    nextAction: "Forward to Ops with the customer ID; reply to customer once Ops confirms ETA.",
    interrupt: true, confidence: 0.93,
    missing: ["Customer-facing tone preference (formal / casual)"],
    risks: ["Risk of committing to a date Ops can't hit"],
    draft: "Ops to confirm the report ETA. Sales to share with the customer using the standard delivery-update template.",
    status: "Route to Ops"
  },
  "unsafe-promise": {
    title: "Request to commit to monitoring schedule by email",
    summary: "Sales wants the agent to make a direct customer commitment about a defence-sensitive monitoring schedule. Not allowed.",
    requestType: "Customer commitment",
    urgency: "High", businessValue: "Medium", complexity: "Low", sensitivity: "Defence-sensitive",
    route: "Reject — escalate policy refresher to Sales",
    nextAction: "Reject the request. Send Sales the customer-commitment policy.",
    interrupt: false, confidence: 0.95,
    missing: ["Whether Sales has read the customer-commitment policy this quarter", "Whether any prior commitment was already made"],
    risks: ["Direct customer commitment by AI is not allowed", "Defence-sensitive context", "Potential regulatory exposure"],
    draft: "We can't send a customer-facing commitment from this tool. Please review the customer-commitment policy and re-submit with a Sales-approved statement if needed.",
    status: "Reject — unsafe promise"
  },
  "ops-dashboard": {
    title: "Fleet availability dashboard — discovery",
    summary: "Internal Ops wants a live dashboard. Reasonable scope; needs discovery on data sources and permissions before software starts.",
    requestType: "Internal tooling",
    urgency: "Low", businessValue: "Medium", complexity: "High", sensitivity: "Normal",
    route: "Approve discovery — Software + Ops",
    nextAction: "Schedule a 60-min discovery with Ops to map data sources and permissions.",
    interrupt: true, confidence: 0.78,
    missing: ["Data source inventory", "Permission model", "Refresh frequency expectation", "Existing internal tools to integrate with"],
    risks: ["Scope creep — 'updated automatically' is broad", "Data source access may be restricted"],
    draft: "Approving discovery. Ops, please send the source inventory and permission model so we can scope this properly.",
    status: "Approve discovery"
  }
};

const SEED_QUEUE = [
{ sampleId: "defence-rfi", id: "seed-1", submittedAt: "Today, 09:14", deadline: "Fri, May 8" },
{ sampleId: "vague-sales", id: "seed-2", submittedAt: "Yesterday, 16:02", deadline: "Next month" },
{ sampleId: "delivery-update", id: "seed-3", submittedAt: "Today, 08:30", deadline: "Today" },
{ sampleId: "unsafe-promise", id: "seed-4", submittedAt: "Today, 10:45", deadline: "ASAP" },
{ sampleId: "ops-dashboard", id: "seed-5", submittedAt: "2 days ago", deadline: "—" }].
map((q) => {
  const s = SAMPLES.find((x) => x.id === q.sampleId);
  return { ...q, customer: s.customerName, original: s.requestSummary, triage: TRIAGE_BY_SAMPLE[q.sampleId], status: TRIAGE_BY_SAMPLE[q.sampleId].status };
});

// =============================================================================
// CHROME — Masthead, SubBar, Footer
// =============================================================================

function Masthead({ active, onNav }) {
  const links = [
  { id: "submit", label: "Submit" },
  { id: "queue", label: "Queue" },
  { id: "method", label: "Method" },
  { id: "audit", label: "Audit" },
  { id: "settings", label: "Settings" }];

  return (
    <div style={{ background: INK, color: PAPER, padding: "20px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1F1F1F" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => onNav("queue")}>
        <div style={{ width: 22, height: 22, background: BLUE_BLOCK }} />
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 4, fontFamily: FONT_STACK }}>TRIAGE</div>
      </div>
      <nav style={{ display: "flex", gap: 36, fontFamily: FONT_STACK, fontSize: 14, fontWeight: 600 }}>
        {links.map((l) => {
          const isActive = l.id === active;
          const isReal = ["submit", "queue", "method"].includes(l.id);
          return (
            <span key={l.id}
            onClick={() => isReal && onNav(l.id)}
            style={{
              color: isActive ? PAPER : "rgba(255,255,255,0.65)",
              paddingBottom: 2,
              borderBottom: isActive ? `2px solid ${BLUE_BLOCK}` : "2px solid transparent",
              cursor: isReal ? "pointer" : "not-allowed",
              opacity: isReal ? 1 : 0.5,
              userSelect: "none"
            }}>{l.label}</span>);

        })}
      </nav>
    </div>);

}

function SubBar({ left, right }) {
  return (
    <div style={{ background: "#1F1F1F", color: "rgba(255,255,255,0.7)", padding: "10px 48px", fontFamily: FONT_STACK, fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span>{left}</span><span>{right}</span>
    </div>);

}

function Footer() {
  return (
    <div style={{ background: INK, color: "rgba(255,255,255,0.7)", padding: "32px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: FONT_STACK, fontSize: 12, letterSpacing: 1, textTransform: "uppercase" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 14, height: 14, background: BLUE_BLOCK }} />
        <span style={{ color: PAPER, fontWeight: 700, letterSpacing: 3 }}>TRIAGE</span>
        <span>· Internal · v0.4 · Mocked</span>
      </div>
      <div style={{ display: "flex", gap: 28 }}>
        <span>Method</span><span>Audit</span><span>Schema</span>
      </div>
    </div>);

}

// =============================================================================
// SUBMIT
// =============================================================================

function SubmitScreen({ form, setForm, onSubmit, loading, onPickSample, sampleId }) {
  return (
    <>
      <SubBar left="Sales Portal · Submit Request" right="Mocked data only · No live customer info" />

      {/* Full-width blue banner: heading + description + 3 steps in one row */}
      <section style={{ background: BLUE_BLOCK, color: PAPER, padding: "0 48px", borderBottom: `1px solid ${RULE}`, height: "25px", display: "flex", alignItems: "center", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, width: "100%", fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap" }}>
          <span style={{ opacity: 0.85 }}>Step 01 / 02</span>
          <span style={{ width: 1, height: 12, background: "rgba(255,255,255,0.3)" }} />
          <span>Hand request to AI Triage</span>
          <span style={{ width: 1, height: 12, background: "rgba(255,255,255,0.3)" }} />
          <span style={{ opacity: 0.85 }}>01 Submit</span>
          <span style={{ opacity: 0.6 }}>·</span>
          <span style={{ opacity: 0.85 }}>02 AI structures</span>
          <span style={{ opacity: 0.6 }}>·</span>
          <span style={{ opacity: 0.85 }}>03 Reviewer routes</span>
        </div>
      </section>

      {/* Full-width form */}
      <section style={{ borderBottom: `1px solid ${RULE}` }}>
        <div style={{ background: PAPER, padding: "48px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: MUTED, fontWeight: 700 }}>New request</div>
              <h2 style={{ fontSize: 28, fontWeight: 700, margin: "8px 0 0", letterSpacing: -0.4 }}>{form.customerName || "Untitled opportunity"}</h2>
            </div>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase", color: MUTED, fontWeight: 700, marginBottom: 6, textAlign: "right" }}>Load sample</div>
              <select value={sampleId} onChange={(e) => onPickSample(e.target.value)}
              style={{ fontFamily: FONT_STACK, fontSize: 13, fontWeight: 500, padding: "10px 14px", border: `1px solid ${INK}`, background: PAPER, color: INK, cursor: "pointer" }}>
                {SAMPLES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: `1px solid ${INK}` }}>
            <EditableField label="Customer / opportunity" value={form.customerName} onChange={(v) => setForm({ ...form, customerName: v })} border="right bottom" />
            <EditableField label="Deadline" value={form.deadline} onChange={(v) => setForm({ ...form, deadline: v })} border="bottom" />
            <SelectField label="Sensitivity" value={form.sensitivity} options={["Normal", "Customer confidential", "Defence-sensitive", "Unknown"]} onChange={(v) => setForm({ ...form, sensitivity: v })} border="right bottom" />
            <SelectField label="Customer-facing commitment" value={form.commitmentNeeded} options={["Yes", "No"]} onChange={(v) => setForm({ ...form, commitmentNeeded: v })} border="bottom" />
          </div>

          <EditableField label="Request summary" multiline value={form.requestSummary} onChange={(v) => setForm({ ...form, requestSummary: v })} border="bottom" />
          <EditableField label="What Sales needs from Software / Ops" multiline value={form.softwareNeed} onChange={(v) => setForm({ ...form, softwareNeed: v })} border="bottom" />

          <div style={{ marginTop: 28, display: "flex", gap: 12, alignItems: "center" }}>
            <button onClick={onSubmit} disabled={loading} style={{ background: loading ? MUTED : BLUE_BLOCK, color: PAPER, border: "none", padding: "16px 28px", fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontFamily: FONT_STACK, cursor: loading ? "wait" : "pointer" }}>
              {loading ? "Triaging…" : "Submit for AI triage →"}
            </button>
            <button style={{ background: "transparent", color: INK, border: `1px solid ${INK}`, padding: "16px 24px", fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontFamily: FONT_STACK, cursor: "pointer" }}>Save draft</button>
            <div style={{ marginLeft: "auto", fontSize: 12, color: MUTED, letterSpacing: 1, textTransform: "uppercase" }}>Auto-saved · just now</div>
          </div>
        </div>
      </section>
    </>);

}

function EditableField({ label, value, onChange, multiline, border = "" }) {
  const [editing, setEditing] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const borders = {
    borderRight: border.includes("right") ? `1px solid ${SUBTLE_RULE}` : "none",
    borderTop: border.includes("top") ? `1px solid ${SUBTLE_RULE}` : "none",
    borderBottom: border.includes("bottom") ? `1px solid ${SUBTLE_RULE}` : "none"
  };
  const inputBg = "#FAFAF8";
  const inputBorder = `1px solid ${SUBTLE_RULE}`;
  return (
    <div style={{ ...borders, padding: "20px 24px 22px 0" }}>
      <div style={{ fontSize: 10, letterSpacing: 1.6, textTransform: "uppercase", color: MUTED, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
        <span>{label}</span>
        <span style={{ fontSize: 9, color: MUTED, letterSpacing: 1, opacity: 0.7 }}>✎ EDITABLE</span>
      </div>
      {editing ?
      multiline ?
      <textarea autoFocus value={value} onChange={(e) => onChange(e.target.value)} onBlur={() => setEditing(false)} rows={3}
      style={{ marginTop: 8, width: "100%", fontFamily: FONT_STACK, fontSize: 15, fontWeight: 500, color: INK, lineHeight: 1.55, border: `1px solid ${BLUE_BLOCK}`, padding: 10, outline: "none", resize: "vertical", background: PAPER }} /> :

      <input autoFocus value={value} onChange={(e) => onChange(e.target.value)} onBlur={() => setEditing(false)}
      style={{ marginTop: 8, width: "100%", fontFamily: FONT_STACK, fontSize: 17, fontWeight: 500, color: INK, border: `1px solid ${BLUE_BLOCK}`, padding: "10px 12px", outline: "none", background: PAPER }} /> :


      <div onClick={() => setEditing(true)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          marginTop: 8, fontSize: multiline ? 15 : 17, fontWeight: 500,
          color: INK, lineHeight: multiline ? 1.55 : 1.3,
          cursor: "text", minHeight: multiline ? 64 : 40,
          padding: multiline ? "10px 12px" : "10px 12px",
          background: hover ? PAPER : inputBg,
          border: hover ? `1px solid ${INK}` : inputBorder,
          display: "flex", alignItems: multiline ? "flex-start" : "center", justifyContent: "space-between", gap: 12,
          transition: "background 120ms, border-color 120ms",
        }}>
          <span style={{ flex: 1 }}>{value || <span style={{ color: MUTED, fontStyle: "italic" }}>Click to add</span>}</span>
          <span style={{ fontSize: 11, color: MUTED, opacity: hover ? 1 : 0.5, letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 600, flexShrink: 0, alignSelf: multiline ? "flex-start" : "center", marginTop: multiline ? 2 : 0 }}>✎ Edit</span>
        </div>
      }
    </div>);

}

function SelectField({ label, value, options, onChange, border = "" }) {
  const borders = {
    borderRight: border.includes("right") ? `1px solid ${SUBTLE_RULE}` : "none",
    borderBottom: border.includes("bottom") ? `1px solid ${SUBTLE_RULE}` : "none"
  };
  return (
    <div style={{ ...borders, padding: "20px 24px 22px 0" }}>
      <div style={{ fontSize: 10, letterSpacing: 1.6, textTransform: "uppercase", color: MUTED, fontWeight: 700 }}>{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{ marginTop: 8, fontFamily: FONT_STACK, fontSize: 17, fontWeight: 500, color: INK, background: "transparent", border: "none", borderBottom: `1px solid ${SUBTLE_RULE}`, padding: "4px 0", cursor: "pointer", outline: "none", width: "100%" }}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>);

}

// =============================================================================
// QUEUE
// =============================================================================

function QueueScreen({ queue, selectedId, onSelect, onAction }) {
  const selected = queue.find((q) => q.id === selectedId);
  const t = selected ? selected.triage : null;
  const blocked = t ? !t.interrupt : false;
  const detailRef = React.useRef(null);
  React.useEffect(() => {
    if (selected && detailRef.current) {
      const top = detailRef.current.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const counts = queue.reduce((acc, q) => {
    if (!q.triage.interrupt) acc.blocked++;
    if (q.status.startsWith("Reject")) acc.reject++;
    if (q.status.startsWith("Route") || q.status === "Approve discovery") acc.routable++;
    return acc;
  }, { blocked: 0, reject: 0, routable: 0 });

  return (
    <>
      <SubBar left="Head of Software · Review Queue" right="gpt-4.1-mini · Schema valid · Safety pass" />

      {/* Step banner */}
      <section style={{ background: BLUE_BLOCK, color: PAPER, padding: "0 48px", borderBottom: `1px solid ${RULE}`, height: "25px", display: "flex", alignItems: "center", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, width: "100%", fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap" }}>
          <span style={{ opacity: 0.85 }}>Step 02 / 02</span>
          <span style={{ width: 1, height: 12, background: "rgba(255,255,255,0.3)" }} />
          <span>Reviewer routes structured briefs</span>
          <span style={{ width: 1, height: 12, background: "rgba(255,255,255,0.3)" }} />
          <span style={{ opacity: 0.6 }}>01 Submit</span>
          <span style={{ opacity: 0.6 }}>·</span>
          <span style={{ opacity: 0.6 }}>02 AI structures</span>
          <span style={{ opacity: 0.6 }}>·</span>
          <span style={{ opacity: 0.85 }}>03 Reviewer routes</span>
        </div>
      </section>

      {/* Queue table — top of page */}
      <section style={{ padding: "0 48px", background: PAPER, borderBottom: `1px solid ${RULE}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "40px 0 20px" }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: MUTED, fontWeight: 700 }}>Inbox</div>
            <h2 style={{ fontSize: 28, fontWeight: 700, margin: "6px 0 0", letterSpacing: -0.4 }}>Open queue</h2>
          </div>
          <div style={{ fontSize: 12, color: MUTED, letterSpacing: 1, textTransform: "uppercase" }}>
            {queue.length} open · {counts.blocked} blocked · {counts.routable} routable · {counts.reject} reject
          </div>
        </div>
        <div style={{ borderTop: `2px solid ${RULE}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "12px 1fr 220px 110px 90px 160px 24px", gap: 24, fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: MUTED, padding: "12px 0", borderBottom: `1px solid ${SUBTLE_RULE}`, fontWeight: 700 }}>
            <span></span><span>Request</span><span>Customer</span><span>Deadline</span><span>Missing</span><span>Status</span><span></span>
          </div>
          {queue.map((q) => {
            const isSelected = q.id === selected?.id;
            const isBlocked = !q.triage.interrupt;
            return (
              <div key={q.id} onClick={() => onSelect(q.id)} style={{
                display: "grid", gridTemplateColumns: "12px 1fr 220px 110px 90px 160px 24px", gap: 24,
                padding: "20px 0", borderBottom: `1px solid ${SUBTLE_RULE}`, alignItems: "center",
                background: isSelected ? BLUE_BLOCK : "transparent",
                color: isSelected ? PAPER : INK,
                marginInline: isSelected ? -16 : 0, paddingInline: isSelected ? 16 : 0,
                cursor: "pointer", transition: "background 120ms"
              }}>
                <div style={{ width: 8, height: 8, background: isSelected ? PAPER : (isBlocked ? SIGNAL : INK), opacity: isSelected ? 1 : (isBlocked ? 1 : 0.25) }} />
                <div style={{ fontSize: 15, fontWeight: 600 }}>{q.triage.title}</div>
                <div style={{ fontSize: 13, opacity: isSelected ? 0.9 : 0.6 }}>{q.customer}</div>
                <div style={{ fontSize: 13, fontFamily: "ui-monospace, monospace", opacity: isSelected ? 0.9 : 0.6 }}>{q.deadline}</div>
                <div style={{ fontSize: 13, fontFamily: "ui-monospace, monospace", fontWeight: 600, color: isSelected ? PAPER : (q.triage.missing.length > 2 ? SIGNAL : INK) }}>{String(q.triage.missing.length).padStart(2, "0")}</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{q.status}</div>
                <div style={{ fontSize: 16, fontWeight: 700, textAlign: "right", opacity: isSelected ? 1 : 0.3 }}>{isSelected ? "▾" : "›"}</div>
              </div>);

          })}
        </div>
        {!selected &&
        <div style={{ padding: "48px 0 56px", textAlign: "center", borderTop: `1px solid ${SUBTLE_RULE}`, marginTop: -1 }}>
          <div style={{ fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: MUTED, fontWeight: 700 }}>No request selected</div>
          <div style={{ marginTop: 10, fontSize: 16, color: INK }}>Click any row above to expand the structured brief, decision, and reviewer actions.</div>
        </div>
        }
      </section>

      {selected && <div ref={detailRef} />}
      {selected && <>

      {/* Hero */}
      <section style={{ display: "grid", gridTemplateColumns: "440px 1fr", minHeight: 480, borderBottom: `1px solid ${RULE}` }}>
        <div style={{ background: BLUE_BLOCK, color: PAPER, padding: "56px 48px", display: "flex", flexDirection: "column", justifyContent: "space-between", fontFamily: FONT_STACK }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, opacity: 0.85 }}>Selected request</div>
            <div style={{ marginTop: 14, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", opacity: 0.85 }}>{selected.customer}</div>
            <h1 style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.1, letterSpacing: -0.6, margin: "20px 0 0" }}>{t.title}</h1>
            <p style={{ marginTop: 20, fontSize: 15, lineHeight: 1.55, maxWidth: 360, opacity: 0.95 }}>{t.summary}</p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.3)", paddingTop: 20, fontSize: 12, letterSpacing: 1, textTransform: "uppercase" }}>
            <span>Deadline · {selected.deadline}</span>
            <span>Conf. {Math.round(t.confidence * 100)}%</span>
          </div>
        </div>

        <div style={{ background: PAPER, display: "grid", gridTemplateRows: "1fr auto" }}>
          <div style={{
            background: `repeating-linear-gradient(135deg, #F4F4F2, #F4F4F2 10px, #ECECEA 10px, #ECECEA 20px)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "ui-monospace, monospace", fontSize: 12, color: "#888",
            letterSpacing: 1, textTransform: "uppercase", borderBottom: `1px solid ${SUBTLE_RULE}`
          }}>
            [ context image · {selected.customer.toLowerCase()} ]
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderTop: `1px solid ${RULE}` }}>
            {[
            ["Type", t.requestType],
            ["Urgency", t.urgency],
            ["Sensitivity", t.sensitivity.split("-")[0]],
            ["Route", t.route.length > 18 ? t.route.slice(0, 18) + "…" : t.route]].
            map(([k, v], i) =>
            <div key={k} style={{ padding: "20px 22px", borderRight: i < 3 ? `1px solid ${SUBTLE_RULE}` : "none", fontFamily: FONT_STACK }}>
                <div style={{ fontSize: 10, letterSpacing: 1.6, textTransform: "uppercase", color: MUTED, fontWeight: 700 }}>{k}</div>
                <div style={{ marginTop: 6, fontSize: 15, fontWeight: 600, color: INK }}>{v}</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Decision strip */}
      <div style={{ background: INK, color: PAPER, padding: "28px 48px", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 32, alignItems: "center", borderBottom: `4px solid ${blocked ? SIGNAL : BLUE_BLOCK}` }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: blocked ? SIGNAL : "#7FB3FF", fontWeight: 700 }}>Decision · {blocked ? "blocked" : "allowed"}</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, letterSpacing: -0.3 }}>
            Software interrupt is {blocked ? "blocked" : "allowed"}
          </div>
        </div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.5, maxWidth: 520 }}>
          {blocked ? `${t.missing.length} missing inputs and risk flags. Resolve with Sales before Software is paged.` : "Schema valid, safety checks passed, sufficient inputs. Routable now."}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => onAction(blocked ? "Ask Sales for clarification" : "Route to Software")} style={{ background: BLUE_BLOCK, color: PAPER, border: "none", padding: "14px 22px", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontFamily: FONT_STACK, cursor: "pointer" }}>
            {blocked ? "Ask Sales →" : "Route →"}
          </button>
          <button onClick={() => onAction("Reject — not now")} style={{ background: "transparent", color: PAPER, border: "1px solid rgba(255,255,255,0.4)", padding: "14px 22px", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontFamily: FONT_STACK, cursor: "pointer" }}>Reject</button>
        </div>
      </div>

      {/* Original / Structured */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `1px solid ${RULE}` }}>
        <div style={{ padding: "48px", borderRight: `1px solid ${SUBTLE_RULE}` }}>
          <div style={{ fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: MUTED, fontWeight: 700 }}>Original — what Sales wrote</div>
          <p style={{ margin: "16px 0 0", fontSize: 16, lineHeight: 1.65, color: "#2A2A2A" }}>{selected.original}</p>

          <div style={{ marginTop: 36, fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: MUTED, fontWeight: 700 }}>Audit notes</div>
          <ul style={{ margin: "14px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "#2A2A2A", fontFamily: "ui-monospace, monospace" }}>
            <li>// schema: triage.v3 · valid</li>
            <li>// safety: pass · 2/2</li>
            <li>// submitted: {selected.submittedAt}</li>
            <li>// model: gpt-4.1-mini · seeded</li>
          </ul>
        </div>

        <div style={{ padding: "48px", background: SOFT_BG }}>
          <div style={{ fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: MUTED, fontWeight: 700 }}>Structured brief</div>
          <h3 style={{ fontSize: 22, fontWeight: 700, margin: "12px 0 8px", letterSpacing: -0.3 }}>{t.title}</h3>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "#2A2A2A" }}>{t.summary}</p>

          <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1fr 1fr", border: `1px solid ${INK}` }}>
            {[
            ["Request type", t.requestType],
            ["Urgency", t.urgency],
            ["Business value", t.businessValue],
            ["Complexity", t.complexity],
            ["Sensitivity", t.sensitivity],
            ["Confidence", `${Math.round(t.confidence * 100)}%`]].
            map(([k, v], i) =>
            <div key={k} style={{
              padding: "16px 18px",
              borderRight: i % 2 === 0 ? `1px solid ${INK}` : "none",
              borderBottom: i < 4 ? `1px solid ${INK}` : "none",
              background: PAPER
            }}>
                <div style={{ fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase", color: MUTED, fontWeight: 700 }}>{k}</div>
                <div style={{ marginTop: 6, fontSize: 15, fontWeight: 600 }}>{v}</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Missing + Risks */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `1px solid ${RULE}` }}>
        <div style={{ padding: "48px", borderRight: `1px solid ${SUBTLE_RULE}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: MUTED, fontWeight: 700 }}>Missing information</div>
            <div style={{ fontSize: 12, color: t.missing.length > 2 ? SIGNAL : INK, fontWeight: 700, letterSpacing: 1 }}>{String(t.missing.length).padStart(2, "0")} ITEMS</div>
          </div>
          <ol style={{ margin: "20px 0 0", padding: 0, listStyle: "none" }}>
            {t.missing.map((m, i) =>
            <li key={i} style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 16, padding: "16px 0", borderTop: `1px solid ${SUBTLE_RULE}`, fontSize: 15, color: INK, alignItems: "baseline" }}>
                <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: MUTED }}>{String(i + 1).padStart(2, "0")}</span>
                <span>{m}</span>
              </li>
            )}
          </ol>
        </div>
        <div style={{ padding: "48px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: MUTED, fontWeight: 700 }}>Risk flags</div>
            <div style={{ fontSize: 12, color: SIGNAL, fontWeight: 700, letterSpacing: 1 }}>{String(t.risks.length).padStart(2, "0")} ITEMS</div>
          </div>
          <ul style={{ margin: "20px 0 0", padding: 0, listStyle: "none" }}>
            {t.risks.map((r, i) =>
            <li key={i} style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 16, padding: "16px 0", borderTop: `1px solid ${SUBTLE_RULE}`, fontSize: 15, color: INK, alignItems: "baseline" }}>
                <span style={{ color: SIGNAL, fontWeight: 800, fontSize: 16 }}>!</span>
                <span>{r}</span>
              </li>
            )}
          </ul>
        </div>
      </section>

      {/* Draft */}
      <section style={{ display: "grid", gridTemplateColumns: "440px 1fr", borderBottom: `1px solid ${RULE}` }}>
        <div style={{ background: BLUE_BLOCK, color: PAPER, padding: "48px" }}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, opacity: 0.85 }}>Draft to Sales</div>
          <h3 style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.1, letterSpacing: -0.5, margin: "16px 0 0" }}>One round of questions beats three rounds of guesses.</h3>
        </div>
        <div style={{ padding: "48px", background: PAPER }}>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: INK, paddingBottom: 28, borderBottom: `1px solid ${SUBTLE_RULE}` }}>
            {t.draft}
          </p>
          <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
            <button onClick={() => onAction("Sent draft to Sales")} style={{ background: INK, color: PAPER, border: "none", padding: "14px 22px", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontFamily: FONT_STACK, cursor: "pointer" }}>Send</button>
            <button style={{ background: "transparent", color: INK, border: `1px solid ${INK}`, padding: "14px 22px", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontFamily: FONT_STACK, cursor: "pointer" }}>Edit</button>
            <button style={{ background: "transparent", color: MUTED, border: `1px solid ${SUBTLE_RULE}`, padding: "14px 22px", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontFamily: FONT_STACK, cursor: "pointer" }}>Copy</button>
          </div>
        </div>
      </section>

      {/* Reviewer actions */}
      <section style={{ padding: "48px", marginTop: 40, background: SOFT_BG, borderTop: `1px solid ${RULE}` }}>
        <div style={{ fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: MUTED, fontWeight: 700, marginBottom: 18 }}>Reviewer action</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", border: `1px solid ${INK}` }}>
          {[
          "Ask Sales for clarification",
          "Route to Software",
          "Route to Ops",
          "Route to Security",
          "Approve discovery",
          "Reject — not now"].
          map((a, i) =>
          <button key={a} onClick={() => onAction(a)} style={{
            background: PAPER, border: 0, padding: "20px 22px", textAlign: "left",
            fontFamily: FONT_STACK, fontSize: 14, fontWeight: 600, color: INK,
            borderRight: i % 3 < 2 ? `1px solid ${INK}` : "none",
            borderBottom: i < 3 ? `1px solid ${INK}` : "none",
            cursor: "pointer"
          }}>{a}</button>
          )}
        </div>
      </section>
      </>}
    </>);

}

// =============================================================================
// METHOD
// =============================================================================

function MethodScreen() {
  const steps = [
  { n: "01", t: "Sales submits", d: "Free-text request, customer name, deadline, sensitivity. No internal jargon required." },
  { n: "02", t: "AI structures", d: "Server-side LLM call. Output validated against the triage schema; refused if non-compliant." },
  { n: "03", t: "Safety checks", d: "Local checks for schema validity and interrupt control before the request is shown to the reviewer." },
  { n: "04", t: "Reviewer routes", d: "Head of Software clarifies, blocks, or routes to Ops, Security, or Software." },
  { n: "05", t: "Sales sees status", d: "Updated status visible to Sales — closing the loop without paging the Software team." }];


  return (
    <>
      <SubBar left="How AI Triage Works" right="Internal · Last updated 2026-04-30" />

      <section style={{ display: "grid", gridTemplateColumns: "440px 1fr", minHeight: 380, borderBottom: `1px solid ${RULE}` }}>
        <div style={{ background: BLUE_BLOCK, color: PAPER, padding: "64px 48px" }}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, opacity: 0.85 }}>Method</div>
          <h1 style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1, margin: "20px 0 0" }}>Messy in. Structured out. Human last.</h1>
          <p style={{ marginTop: 22, fontSize: 15, lineHeight: 1.55, maxWidth: 360, opacity: 0.95 }}>
            Five steps between a Sales email and a routed decision. The model never sees real customer data; the Software team is never paged before a person reviews.
          </p>
        </div>
        <div style={{ padding: "48px", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <Stat label="LLM calls" value="Server-side · /api/analyse" border="right bottom" />
          <Stat label="Data" value="Mocked only" border="bottom" />
          <Stat label="Validation" value="Zod · triage.v3" border="right" />
          <Stat label="Safety" value="2 local checks" />
        </div>
      </section>

      <section style={{ padding: "48px" }}>
        <div style={{ fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: MUTED, fontWeight: 700, marginBottom: 24 }}>The pipeline</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", border: `1px solid ${INK}` }}>
          {steps.map((s, i) =>
          <div key={s.n} style={{ padding: "32px 24px", borderRight: i < 4 ? `1px solid ${INK}` : "none", minHeight: 220 }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: BLUE_BLOCK, letterSpacing: -1 }}>{s.n}</div>
              <div style={{ marginTop: 16, fontSize: 17, fontWeight: 700, letterSpacing: -0.2 }}>{s.t}</div>
              <p style={{ marginTop: 10, fontSize: 13, lineHeight: 1.55, color: "#2A2A2A" }}>{s.d}</p>
            </div>
          )}
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: `1px solid ${INK}`, margin: "0 48px 64px" }}>
        <div style={{ padding: 36, background: SOFT_BG, borderRight: `1px solid ${INK}` }}>
          <div style={{ fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: MUTED, fontWeight: 700 }}>Boundary · what it does</div>
          <ul style={{ margin: "16px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12, fontSize: 14, lineHeight: 1.55 }}>
            <li>· Structures messy free-text into a typed brief</li>
            <li>· Flags missing inputs &amp; risk signals</li>
            <li>· Blocks Software interrupt when criteria fail</li>
            <li>· Surfaces the original verbatim alongside</li>
          </ul>
        </div>
        <div style={{ padding: 36, background: PAPER }}>
          <div style={{ fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: SIGNAL, fontWeight: 700 }}>Boundary · what it doesn't</div>
          <ul style={{ margin: "16px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12, fontSize: 14, lineHeight: 1.55 }}>
            <li>· Make customer-facing commitments</li>
            <li>· Auto-route to Software without human sign-off</li>
            <li>· See real customer data — context is mocked</li>
            <li>· Replace the reviewer's judgment</li>
          </ul>
        </div>
      </section>
    </>);

}

function Stat({ label, value, border = "" }) {
  return (
    <div style={{
      padding: "24px 28px",
      borderRight: border.includes("right") ? `1px solid ${SUBTLE_RULE}` : "none",
      borderBottom: border.includes("bottom") ? `1px solid ${SUBTLE_RULE}` : "none"
    }}>
      <div style={{ fontSize: 10, letterSpacing: 1.6, textTransform: "uppercase", color: MUTED, fontWeight: 700 }}>{label}</div>
      <div style={{ marginTop: 8, fontSize: 18, fontWeight: 600 }}>{value}</div>
    </div>);

}

// =============================================================================
// TOAST — feedback for actions
// =============================================================================

function Toast({ message, onDismiss }) {
  React.useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, 2400);
    return () => clearTimeout(t);
  }, [message, onDismiss]);
  if (!message) return null;
  return (
    <div style={{
      position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
      background: INK, color: PAPER, padding: "14px 22px",
      fontFamily: FONT_STACK, fontSize: 13, fontWeight: 600, letterSpacing: 0.5,
      borderLeft: `4px solid ${BLUE_BLOCK}`, zIndex: 100,
      boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
    }}>
      {message}
    </div>);

}

// =============================================================================
// APP
// =============================================================================

const FORM_DEFAULTS = {
  customerName: SAMPLES[0].customerName,
  requestSummary: SAMPLES[0].requestSummary,
  deadline: SAMPLES[0].deadline,
  softwareNeed: SAMPLES[0].softwareNeed,
  commitmentNeeded: SAMPLES[0].commitmentNeeded,
  sensitivity: SAMPLES[0].sensitivity
};

function App() {
  const [view, setView] = React.useState("queue");
  const [queue, setQueue] = React.useState(SEED_QUEUE);
  const [selectedId, setSelectedId] = React.useState(null);
  const [form, setForm] = React.useState(FORM_DEFAULTS);
  const [sampleId, setSampleId] = React.useState(SAMPLES[0].id);
  const [loading, setLoading] = React.useState(false);
  const [toast, setToast] = React.useState("");

  function pickSample(id) {
    const s = SAMPLES.find((x) => x.id === id);
    if (!s) return;
    setSampleId(id);
    setForm({
      customerName: s.customerName,
      requestSummary: s.requestSummary,
      deadline: s.deadline,
      softwareNeed: s.softwareNeed,
      commitmentNeeded: s.commitmentNeeded,
      sensitivity: s.sensitivity
    });
  }

  function submit() {
    setLoading(true);
    // Mock the LLM call latency
    setTimeout(() => {
      const triage = TRIAGE_BY_SAMPLE[sampleId] || TRIAGE_BY_SAMPLE["defence-rfi"];
      const newId = "n-" + Math.random().toString(36).slice(2, 9);
      const newItem = {
        id: newId,
        sampleId,
        customer: form.customerName || "Untitled opportunity",
        deadline: form.deadline || "Unknown",
        original: form.requestSummary,
        triage,
        status: triage.status,
        submittedAt: "Just now"
      };
      setQueue((q) => [newItem, ...q]);
      setSelectedId(newId);
      setLoading(false);
      setView("queue");
      setToast("Submitted · structured by AI Triage");
    }, 1100);
  }

  function action(label) {
    if (label === "Sent draft to Sales") {
      setToast("Draft sent to Sales");
      return;
    }
    setQueue((q) => q.map((item) => item.id === selectedId ? { ...item, status: label } : item));
    setToast(`Status updated · ${label}`);
  }

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: PAPER, color: INK, fontFamily: FONT_STACK }}>
      <Masthead active={view} onNav={setView} />
      {view === "submit" &&
      <SubmitScreen form={form} setForm={setForm} onSubmit={submit} loading={loading} sampleId={sampleId} onPickSample={pickSample} />
      }
      {view === "queue" &&
      <QueueScreen queue={queue} selectedId={selectedId} onSelect={setSelectedId} onAction={action} />
      }
      {view === "method" && <MethodScreen />}
      <Footer />
      <Toast message={toast} onDismiss={() => setToast("")} />
    </div>);

}

window.TriageApp = App;