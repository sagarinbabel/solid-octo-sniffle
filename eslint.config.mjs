import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/** Reference-only design explorations (CDN React, artboards) — not part of the Next app source. */
const eslintConfig = [{ ignores: ["design v1/**"] }, ...nextVitals, ...nextTs];

export default eslintConfig;
