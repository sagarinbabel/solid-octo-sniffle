import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/** Reference-only design explorations (CDN React, artboards) — not part of the Next app source. */
const eslintConfig = [
  {
    ignores: [
      "design v1/**",
      // This repository includes a separate Next app for a personal site; don't lint it from this app's root config.
      "sagardubey-root-site/**",
      // Belt-and-suspenders: ignore any Next build output anywhere.
      "**/.next/**",
    ],
  },
  ...nextVitals,
  ...nextTs,
];

export default eslintConfig;
