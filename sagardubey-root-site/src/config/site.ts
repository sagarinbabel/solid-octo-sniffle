export type NavLink = {
  label: string;
  href: string;
};

export type SocialLink = {
  label: string;
  href: string;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  href: string;
};

export const siteConfig = {
  name: "Sagar Dubey",
  tagline: "Product manager turned AI builder",
  nav: [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
  ] satisfies NavLink[],
  social: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/your-handle" },
    { label: "GitHub", href: "https://github.com/your-handle" },
    { label: "Social", href: "https://example.com/your-social" },
  ] satisfies SocialLink[],
  projects: [
    {
      id: "ai-request-triage",
      title: "AI Request Triage",
      description:
        "Turns messy sales/customer requests into structured work.",
      href: "/projects/ai-request-triage",
    },
  ] satisfies Project[],
} as const;
