// Option 4 — "Editorial Block"
// Inspired by bold split-screen marketing layouts: black masthead, vivid blue
// hero panel, white sans-serif throughout, hard geometric boundaries, no
// rounded corners or gradients. Original design — not a brand recreation.

const seedItem4 = {
  id: "seed",
  customer: "Defence border monitoring opportunity",
  deadline: "Fri, May 8",
  submittedAt: "Today, 09:14",
  original:
    "A defence customer wants to know whether we can support persistent monitoring for a remote border corridor. They need a preliminary technical answer by Friday and want to understand coverage, latency, winter performance, and delivery format.",
  triage: {
    title: "Clarify persistent border monitoring RFI before software review",
    summary:
      "A cautious internal feasibility review for a defence customer asking about persistent remote border monitoring. Resolve missing inputs before Software is engaged.",
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
      "Environmental and winter operating constraints",
    ],
    risks: [
      "Defence-sensitive customer context",
      "Potential unsupported feasibility commitment",
      "Software interruption risk before requirements are clear",
    ],
    draft:
      "Before Software reviews this, please confirm the AOI, cadence, latency target, delivery format, winter constraints, and who can approve any customer-facing statement.",
    status: "Needs clarification",
  },
};

const queueOther4 = [
  { customer: "Large customer meeting", title: "Demo concept request — needs scope clarification", status: "Needs clarification", deadline: "Next month", missing: 3, interrupt: false },
  { customer: "Monitoring report customer", title: "Status update on monitoring report", status: "Route to Ops", deadline: "Today", missing: 1, interrupt: true },
  { customer: "Border monitoring schedule request", title: "Request to commit to monitoring schedule by email", status: "Reject — unsafe promise", deadline: "ASAP", missing: 2, interrupt: false },
  { customer: "Internal Operations", title: "Fleet availability dashboard — discovery", status: "Approve discovery", deadline: "—", missing: 4, interrupt: true },
];

// Palette — original, not lifted from any brand
const BLUE_BLOCK = "#1B3DFF";  // electric editorial blue
const BLUE_HOVER = "#1530D6";
const INK = "#0A0A0A";
const PAPER = "#FFFFFF";
const RULE = "#111111";
const SUBTLE_RULE = "#E5E5E5";
const MUTED = "#6B6B6B";
const SOFT_BG = "#F4F4F2";
const SIGNAL = "#FF3D00"; // single warning color, used sparingly

const FONT_STACK = "'Helvetica Neue', Helvetica, Arial, sans-serif";

// =============================================================================
// MASTHEAD — black bar, white sans, all caps brand, right-aligned nav
// =============================================================================

function Masthead({ active = "Queue" }) {
  const links = ["Submit", "Queue", "Method", "Audit", "Settings"];
  return (
    <div style={{ background: INK, color: PAPER, padding: "20px 48px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 22, height: 22, background: BLUE_BLOCK }} />
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 4, fontFamily: FONT_STACK }}>TRIAGE</div>
        </div>
      </div>
      <nav style={{ display: "flex", gap: 36, fontFamily: FONT_STACK, fontSize: 14, fontWeight: 600 }}>
        {links.map((l) => (
          <span key={l} style={{ color: l === active ? PAPER : "rgba(255,255,255,0.65)", paddingBottom: 2, borderBottom: l === active ? `2px solid ${BLUE_BLOCK}` : "2px solid transparent" }}>{l}</span>
        ))}
      </nav>
    </div>
  );
}

// Thin black sub-bar like the second header strip in the reference
function SubBar({ children }) {
  return (
    <div style={{ background: "#1F1F1F", color: "rgba(255,255,255,0.7)", padding: "10px 48px", fontFamily: FONT_STACK, fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      {children}
    </div>
  );
}

// =============================================================================
// HERO — split panel, vivid blue left, content right
// =============================================================================

function Hero({ customer, deadline, title, summary }) {
  return (
    <section style={{ display: "grid", gridTemplateColumns: "440px 1fr", minHeight: 520, borderBottom: `1px solid ${RULE}` }}>
      {/* Blue block */}
      <div style={{ background: BLUE_BLOCK, color: PAPER, padding: "64px 48px", display: "flex", flexDirection: "column", justifyContent: "space-between", fontFamily: FONT_STACK }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, opacity: 0.85 }}>Selected request</div>
          <div style={{ marginTop: 14, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", opacity: 0.85 }}>{customer}</div>
          <h1 style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.1, letterSpacing: -0.8, margin: "20px 0 0" }}>{title}</h1>
          <p style={{ marginTop: 22, fontSize: 15, lineHeight: 1.55, maxWidth: 360, opacity: 0.95 }}>{summary}</p>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.3)", paddingTop: 20, fontSize: 12, letterSpacing: 1, textTransform: "uppercase" }}>
          <span>Deadline · {deadline}</span>
          <span>Conf. 84%</span>
        </div>
      </div>

      {/* Detail block — placeholder image area + key facts */}
      <div style={{ background: PAPER, display: "grid", gridTemplateRows: "1fr auto", borderLeft: "0" }}>
        <div style={{
          background: `repeating-linear-gradient(135deg, #F4F4F2, #F4F4F2 10px, #ECECEA 10px, #ECECEA 20px)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", fontSize: 12, color: "#888",
          letterSpacing: 1, textTransform: "uppercase", borderBottom: `1px solid ${SUBTLE_RULE}`,
        }}>
          [ context image · monitoring AOI ]
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderTop: `1px solid ${RULE}` }}>
          {[
            ["Type", "Customer RFI"],
            ["Urgency", "High"],
            ["Sensitivity", "Defence"],
            ["Route", "Ops · Security"],
          ].map(([k, v], i) => (
            <div key={k} style={{ padding: "22px 24px", borderRight: i < 3 ? `1px solid ${SUBTLE_RULE}` : "none", fontFamily: FONT_STACK }}>
              <div style={{ fontSize: 10, letterSpacing: 1.6, textTransform: "uppercase", color: MUTED, fontWeight: 600 }}>{k}</div>
              <div style={{ marginTop: 6, fontSize: 16, fontWeight: 600, color: INK }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// QUEUE TABLE — white, hairline rules, no rounded corners
// =============================================================================

function QueueTable({ rows }) {
  return (
    <section style={{ padding: "0 48px", fontFamily: FONT_STACK, background: PAPER }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "40px 0 20px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: -0.3 }}>Open queue</h2>
        <div style={{ fontSize: 12, color: MUTED, letterSpacing: 1, textTransform: "uppercase" }}>5 open · 2 blocked · 2 routable · 1 reject</div>
      </div>
      <div style={{ borderTop: `2px solid ${RULE}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "12px 1fr 220px 110px 90px 140px", gap: 24, fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: MUTED, padding: "12px 0", borderBottom: `1px solid ${SUBTLE_RULE}`, fontWeight: 700 }}>
          <span></span><span>Request</span><span>Customer</span><span>Deadline</span><span>Missing</span><span style={{ textAlign: "right" }}>Status</span>
        </div>
        {rows.map((row, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "12px 1fr 220px 110px 90px 140px", gap: 24,
            padding: "20px 0", borderBottom: `1px solid ${SUBTLE_RULE}`, alignItems: "center",
            background: row.selected ? SOFT_BG : "transparent", marginInline: row.selected ? -16 : 0, paddingInline: row.selected ? 16 : 0,
          }}>
            <div style={{ width: 8, height: 8, background: row.blocked ? SIGNAL : INK, opacity: row.blocked ? 1 : 0.25 }} />
            <div style={{ fontSize: 15, fontWeight: row.selected ? 700 : 500, color: INK }}>{row.title}</div>
            <div style={{ fontSize: 13, color: MUTED }}>{row.customer}</div>
            <div style={{ fontSize: 13, color: MUTED, fontFamily: "ui-monospace, monospace" }}>{row.deadline}</div>
            <div style={{ fontSize: 13, color: row.missing > 2 ? SIGNAL : INK, fontFamily: "ui-monospace, monospace", fontWeight: 600 }}>{String(row.missing).padStart(2, "0")}</div>
            <div style={{ fontSize: 13, color: INK, textAlign: "right", fontWeight: 500 }}>{row.status}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// =============================================================================
// SUBMIT (Sales Portal) — blue left block with the form heading, white form right
// =============================================================================

function SubmitScreen() {
  return (
    <div style={{ width: 1280, background: PAPER, color: INK, fontFamily: FONT_STACK }}>
      <Masthead active="Submit" />
      <SubBar>
        <span>Sales Portal · Submit Request</span>
        <span>Mocked data only · No live customer info</span>
      </SubBar>

      <section style={{ display: "grid", gridTemplateColumns: "440px 1fr", minHeight: 460, borderBottom: `1px solid ${RULE}` }}>
        <div style={{ background: BLUE_BLOCK, color: PAPER, padding: "64px 48px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, opacity: 0.85 }}>Step 01 / 02</div>
            <h1 style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1, margin: "20px 0 0" }}>Hand the request over to AI Triage.</h1>
            <p style={{ marginTop: 22, fontSize: 15, lineHeight: 1.55, maxWidth: 340, opacity: 0.95 }}>
              Describe what the customer asked for in your own words. The model returns a structured brief that the Head of Software reviews — Software is never paged before a human signs off.
            </p>
          </div>
          <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10, fontSize: 13, opacity: 0.95, borderTop: "1px solid rgba(255,255,255,0.3)", paddingTop: 20 }}>
            <li>01 · Sales submits the request</li>
            <li>02 · AI structures &amp; flags missing info</li>
            <li>03 · Reviewer routes, blocks, or clarifies</li>
          </ol>
        </div>

        <div style={{ background: PAPER, padding: "56px 56px 56px 48px" }}>
          <div style={{ fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: MUTED, fontWeight: 700 }}>New request</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, margin: "8px 0 32px", letterSpacing: -0.4 }}>Customer · Defence opportunity</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, borderTop: `1px solid ${RULE}` }}>
            <Field label="Customer / opportunity" value="MOCK Defence opportunity" border="right" />
            <Field label="Deadline" value="Friday, May 8" />
            <Field label="Sensitivity" value="Defence-sensitive" border="right top" />
            <Field label="Customer-facing commitment" value="No" border="top" />
          </div>

          <Field label="Request summary" multiline value="A defence customer wants to know whether we can support persistent monitoring for a remote border corridor. They need a preliminary technical answer by Friday and want to understand coverage, latency, winter performance, and delivery format." border="top bottom" />
          <Field label="What Sales needs from Software / Ops" multiline value="A preliminary technical answer that Sales can use for an internal review before replying to the customer." border="bottom" />

          <div style={{ marginTop: 28, display: "flex", gap: 12, alignItems: "center" }}>
            <button style={{ background: BLUE_BLOCK, color: PAPER, border: "none", padding: "16px 28px", fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontFamily: FONT_STACK, cursor: "pointer" }}>Submit for AI triage →</button>
            <button style={{ background: "transparent", color: INK, border: `1px solid ${INK}`, padding: "16px 24px", fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontFamily: FONT_STACK, cursor: "pointer" }}>Save draft</button>
            <div style={{ marginLeft: "auto", fontSize: 12, color: MUTED, letterSpacing: 1, textTransform: "uppercase" }}>Auto-saved · just now</div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Field({ label, value, multiline, border = "" }) {
  const borders = {
    borderRight: border.includes("right") ? `1px solid ${SUBTLE_RULE}` : "none",
    borderTop: border.includes("top") ? `1px solid ${SUBTLE_RULE}` : "none",
    borderBottom: border.includes("bottom") ? `1px solid ${SUBTLE_RULE}` : "none",
    borderLeft: border.includes("left") ? `1px solid ${SUBTLE_RULE}` : "none",
  };
  return (
    <div style={{ ...borders, padding: "20px 24px 22px 0", paddingRight: border.includes("right") ? 24 : 0, paddingLeft: 0 }}>
      <div style={{ fontSize: 10, letterSpacing: 1.6, textTransform: "uppercase", color: MUTED, fontWeight: 700 }}>{label}</div>
      <div style={{ marginTop: 8, fontSize: multiline ? 15 : 17, fontWeight: 500, color: INK, lineHeight: multiline ? 1.55 : 1.3 }}>
        {value}
      </div>
    </div>
  );
}

// =============================================================================
// QUEUE — full Head of Software view
// =============================================================================

function QueueScreen() {
  const t = seedItem4.triage;
  const rows = [
    { title: t.title, customer: seedItem4.customer, deadline: seedItem4.deadline, missing: 4, status: t.status, blocked: !t.interrupt, selected: true },
    ...queueOther4.map((q) => ({ title: q.title, customer: q.customer, deadline: q.deadline, missing: q.missing, status: q.status, blocked: !q.interrupt, selected: false })),
  ];
  return (
    <div style={{ width: 1280, background: PAPER, color: INK, fontFamily: FONT_STACK }}>
      <Masthead active="Queue" />
      <SubBar>
        <span>Head of Software · Review Queue</span>
        <span>gpt-4.1-mini · Schema valid · Safety pass</span>
      </SubBar>

      <Hero customer={seedItem4.customer} deadline={seedItem4.deadline} title={t.title} summary={t.summary} />

      {/* Decision strip — full bleed black band like the reference's secondary nav */}
      <div style={{ background: INK, color: PAPER, padding: "28px 48px", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 32, alignItems: "center", borderBottom: `4px solid ${SIGNAL}` }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: SIGNAL, fontWeight: 700 }}>Decision · blocked</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, letterSpacing: -0.3 }}>Software interrupt is blocked</div>
        </div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.5, maxWidth: 520 }}>
          4 missing inputs and a defence-sensitive context. Resolve with Sales before the Software team is asked to look at this.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ background: BLUE_BLOCK, color: PAPER, border: "none", padding: "14px 22px", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontFamily: FONT_STACK, cursor: "pointer" }}>Ask Sales →</button>
          <button style={{ background: "transparent", color: PAPER, border: "1px solid rgba(255,255,255,0.4)", padding: "14px 22px", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontFamily: FONT_STACK, cursor: "pointer" }}>Reject</button>
        </div>
      </div>

      {/* Body grid: original | structured */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `1px solid ${RULE}` }}>
        <div style={{ padding: "48px", borderRight: `1px solid ${SUBTLE_RULE}` }}>
          <div style={{ fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: MUTED, fontWeight: 700 }}>Original — what Sales wrote</div>
          <p style={{ margin: "16px 0 0", fontSize: 16, lineHeight: 1.65, color: "#2A2A2A" }}>{seedItem4.original}</p>

          <div style={{ marginTop: 36, fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: MUTED, fontWeight: 700 }}>Audit notes</div>
          <ul style={{ margin: "14px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "#2A2A2A", fontFamily: "ui-monospace, monospace" }}>
            <li>// schema: triage.v3 · valid</li>
            <li>// safety: pass · 2/2</li>
            <li>// references: Defence handling, Software interruption</li>
            <li>// model: gpt-4.1-mini · seeded · 2026-04-30</li>
          </ul>
        </div>

        <div style={{ padding: "48px", background: SOFT_BG }}>
          <div style={{ fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: MUTED, fontWeight: 700 }}>Structured brief</div>
          <h3 style={{ fontSize: 22, fontWeight: 700, margin: "12px 0 8px", letterSpacing: -0.3 }}>{t.title}</h3>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "#2A2A2A" }}>{t.summary}</p>

          <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, border: `1px solid ${INK}` }}>
            {[
              ["Request type", t.requestType],
              ["Urgency", t.urgency],
              ["Business value", t.businessValue],
              ["Complexity", t.complexity],
              ["Sensitivity", t.sensitivity],
              ["Confidence", `${Math.round(t.confidence * 100)}%`],
            ].map(([k, v], i) => (
              <div key={k} style={{
                padding: "16px 18px",
                borderRight: i % 2 === 0 ? `1px solid ${INK}` : "none",
                borderBottom: i < 4 ? `1px solid ${INK}` : "none",
                background: PAPER,
              }}>
                <div style={{ fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase", color: MUTED, fontWeight: 700 }}>{k}</div>
                <div style={{ marginTop: 6, fontSize: 15, fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Missing + Risks — two more split columns */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `1px solid ${RULE}` }}>
        <div style={{ padding: "48px", borderRight: `1px solid ${SUBTLE_RULE}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: MUTED, fontWeight: 700 }}>Missing information</div>
            <div style={{ fontSize: 12, color: SIGNAL, fontWeight: 700, letterSpacing: 1 }}>04 ITEMS</div>
          </div>
          <ol style={{ margin: "20px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 0 }}>
            {t.missing.map((m, i) => (
              <li key={i} style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 16, padding: "16px 0", borderTop: `1px solid ${SUBTLE_RULE}`, fontSize: 15, color: INK, alignItems: "baseline" }}>
                <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: MUTED }}>{String(i + 1).padStart(2, "0")}</span>
                <span>{m}</span>
              </li>
            ))}
          </ol>
        </div>
        <div style={{ padding: "48px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: MUTED, fontWeight: 700 }}>Risk flags</div>
            <div style={{ fontSize: 12, color: SIGNAL, fontWeight: 700, letterSpacing: 1 }}>03 ITEMS</div>
          </div>
          <ul style={{ margin: "20px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 0 }}>
            {t.risks.map((r, i) => (
              <li key={i} style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 16, padding: "16px 0", borderTop: `1px solid ${SUBTLE_RULE}`, fontSize: 15, color: INK, alignItems: "baseline" }}>
                <span style={{ color: SIGNAL, fontWeight: 800, fontSize: 16 }}>!</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Draft message — blue panel echo */}
      <section style={{ display: "grid", gridTemplateColumns: "440px 1fr", borderBottom: `1px solid ${RULE}` }}>
        <div style={{ background: BLUE_BLOCK, color: PAPER, padding: "48px" }}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, opacity: 0.85 }}>Draft to Sales</div>
          <h3 style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.1, letterSpacing: -0.6, margin: "16px 0 0" }}>Ready to send for clarification.</h3>
          <p style={{ marginTop: 20, fontSize: 14, lineHeight: 1.55, maxWidth: 320, opacity: 0.95 }}>
            One round of questions is faster than three rounds of guesses. Edit before sending if needed.
          </p>
        </div>
        <div style={{ padding: "48px", background: PAPER }}>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: INK, fontFamily: FONT_STACK, paddingBottom: 28, borderBottom: `1px solid ${SUBTLE_RULE}` }}>
            {t.draft}
          </p>
          <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
            <button style={{ background: INK, color: PAPER, border: "none", padding: "14px 22px", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontFamily: FONT_STACK, cursor: "pointer" }}>Send</button>
            <button style={{ background: "transparent", color: INK, border: `1px solid ${INK}`, padding: "14px 22px", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontFamily: FONT_STACK, cursor: "pointer" }}>Edit</button>
            <button style={{ background: "transparent", color: MUTED, border: `1px solid ${SUBTLE_RULE}`, padding: "14px 22px", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontFamily: FONT_STACK, cursor: "pointer" }}>Copy</button>
          </div>
        </div>
      </section>

      <QueueTable rows={rows} />

      {/* Reviewer actions */}
      <section style={{ padding: "48px", borderTop: `1px solid ${RULE}`, marginTop: 40, background: SOFT_BG }}>
        <div style={{ fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: MUTED, fontWeight: 700, marginBottom: 18 }}>Reviewer action</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", border: `1px solid ${INK}` }}>
          {[
            "Ask Sales for clarification",
            "Route to Software",
            "Route to Ops",
            "Route to Security",
            "Approve discovery",
            "Reject — not now",
          ].map((a, i) => (
            <button key={a} style={{
              background: PAPER, border: 0, padding: "20px 22px", textAlign: "left",
              fontFamily: FONT_STACK, fontSize: 14, fontWeight: 600, color: INK,
              borderRight: i % 3 < 2 ? `1px solid ${INK}` : "none",
              borderBottom: i < 3 ? `1px solid ${INK}` : "none",
              cursor: "pointer",
            }}>{a}</button>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

// =============================================================================
// METHOD (How it works)
// =============================================================================

function MethodScreen() {
  const steps = [
    { n: "01", t: "Sales submits", d: "Free-text request, customer name, deadline, sensitivity. No internal jargon required." },
    { n: "02", t: "AI structures", d: "Server-side LLM call. Output validated against the triage schema; refused if non-compliant." },
    { n: "03", t: "Safety checks", d: "Local checks for schema validity and interrupt control before the request is shown to the reviewer." },
    { n: "04", t: "Reviewer routes", d: "Head of Software clarifies, blocks, or routes to Ops, Security, or Software." },
    { n: "05", t: "Sales sees status", d: "Updated status visible to Sales — closing the loop without paging the Software team." },
  ];

  return (
    <div style={{ width: 1280, background: PAPER, color: INK, fontFamily: FONT_STACK }}>
      <Masthead active="Method" />
      <SubBar>
        <span>How AI Triage Works</span>
        <span>Internal · Last updated 2026-04-30</span>
      </SubBar>

      <section style={{ display: "grid", gridTemplateColumns: "440px 1fr", minHeight: 380, borderBottom: `1px solid ${RULE}` }}>
        <div style={{ background: BLUE_BLOCK, color: PAPER, padding: "64px 48px" }}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, opacity: 0.85 }}>Method</div>
          <h1 style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1, margin: "20px 0 0" }}>Messy in. Structured out. Human last.</h1>
          <p style={{ marginTop: 22, fontSize: 15, lineHeight: 1.55, maxWidth: 360, opacity: 0.95 }}>
            Five steps between a Sales email and a routed decision. The model never sees real customer data; the Software team is never paged before a person reviews.
          </p>
        </div>
        <div style={{ padding: "48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
          <Stat label="LLM calls" value="Server-side · /api/analyse" border="right bottom" />
          <Stat label="Data" value="Mocked only" border="bottom" />
          <Stat label="Validation" value="Zod · triage.v3" border="right" />
          <Stat label="Safety" value="2 local checks" />
        </div>
      </section>

      <section style={{ padding: "48px" }}>
        <div style={{ fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: MUTED, fontWeight: 700, marginBottom: 24 }}>The pipeline</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", border: `1px solid ${INK}` }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{
              padding: "32px 24px",
              borderRight: i < 4 ? `1px solid ${INK}` : "none",
              minHeight: 220,
            }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: BLUE_BLOCK, letterSpacing: -1 }}>{s.n}</div>
              <div style={{ marginTop: 16, fontSize: 17, fontWeight: 700, letterSpacing: -0.2 }}>{s.t}</div>
              <p style={{ marginTop: 10, fontSize: 13, lineHeight: 1.55, color: "#2A2A2A" }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "0 48px 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, border: `1px solid ${INK}`, marginInline: 48, marginBottom: 64 }}>
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
            <li>· See real Kelluu data — context is mocked</li>
            <li>· Replace the reviewer's judgment</li>
          </ul>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Stat({ label, value, border = "" }) {
  return (
    <div style={{
      padding: "24px 28px",
      borderRight: border.includes("right") ? `1px solid ${SUBTLE_RULE}` : "none",
      borderBottom: border.includes("bottom") ? `1px solid ${SUBTLE_RULE}` : "none",
    }}>
      <div style={{ fontSize: 10, letterSpacing: 1.6, textTransform: "uppercase", color: MUTED, fontWeight: 700 }}>{label}</div>
      <div style={{ marginTop: 8, fontSize: 18, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

// =============================================================================
// FOOTER — black band echo
// =============================================================================

function Footer() {
  return (
    <div style={{ background: INK, color: "rgba(255,255,255,0.7)", padding: "32px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: FONT_STACK, fontSize: 12, letterSpacing: 1, textTransform: "uppercase" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 14, height: 14, background: BLUE_BLOCK }} />
        <span style={{ color: PAPER, fontWeight: 700, letterSpacing: 3 }}>TRIAGE</span>
        <span>· Internal tool · v0.4 · Mocked</span>
      </div>
      <div style={{ display: "flex", gap: 28 }}>
        <span>Method</span>
        <span>Audit</span>
        <span>Schema</span>
      </div>
    </div>
  );
}

// Expose for canvas
Object.assign(window, { SubmitScreen, QueueScreen, MethodScreen });
