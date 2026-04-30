export interface SampleRequest {
  id: string;
  label: string;
  text: string;
}

export const SAMPLE_REQUESTS: SampleRequest[] = [
  {
    id: "defence-rfi",
    label: "Defence border-monitoring RFI",
    text:
      "A defence customer wants to know whether we can support persistent monitoring for a remote border corridor. They need a preliminary technical answer by Friday and want to understand coverage, latency, winter performance, and delivery format. Sales wants to know if we can say yes.",
  },
  {
    id: "vague-sales",
    label: "Vague sales request",
    text:
      "Sales has a big customer opportunity next month. They need something impressive for the meeting and want software to quickly prepare a demo.",
  },
  {
    id: "delivery-update",
    label: "Customer delivery update",
    text:
      "A customer wants an update on when their latest monitoring report will be ready. Can we send them something today?",
  },
  {
    id: "unsafe-promise",
    label: "Unsafe promise request",
    text:
      "Can the agent just email the customer and promise that we can support their requested border monitoring schedule?",
  },
  {
    id: "ops-dashboard",
    label: "Internal ops dashboard",
    text:
      "Ops wants a dashboard showing fleet availability, recent mission status, delayed jobs, and customer delivery risks. They want it connected to internal systems and updated automatically.",
  },
];
