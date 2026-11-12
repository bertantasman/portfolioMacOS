// Generates the Dock application icons as standalone SVGs in public/icons/apps/.
// All artwork is original except the GitHub mark (Simple Icons, CC0). The
// GitHub, LinkedIn and Instagram marks are trademarks of their owners and are
// used here only to identify the linked profiles.
// Usage: node scripts/generate-icons.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "public/icons/apps";
mkdirSync(OUT, { recursive: true });

// macOS-style continuous-corner squircle (superellipse, n = 5) filling a 100x100 box.
function squircle(n = 5, steps = 120) {
  const pts = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const x = 50 + 50 * Math.sign(c) * Math.abs(c) ** (2 / n);
    const y = 50 + 50 * Math.sign(s) * Math.abs(s) ** (2 / n);
    pts.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}
const SQ = squircle();

const grad = (id, from, to, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient>`;

// Wraps artwork in the squircle, then adds a soft top highlight and a hairline edge.
function icon(defs, background, art) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512">
<defs>
<clipPath id="sq"><path d="${SQ}"/></clipPath>
<linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
${defs}
</defs>
<g clip-path="url(#sq)">
${background}
${art}
<rect width="100" height="100" fill="url(#gloss)"/>
</g>
<path d="${SQ}" fill="none" stroke="#000" stroke-opacity=".16" stroke-width=".7"/>
</svg>
`;
}

const icons = {};

icons.finder = icon(
  `${grad("l", "#8fe3ff", "#3fb4f7")}${grad("r", "#2f8cff", "#0b55d4")}`,
  `<rect width="100" height="100" fill="url(#l)"/>
<path d="M54 0 C 59 30, 47 52, 53 100 L100 100 L100 0 Z" fill="url(#r)"/>`,
  `<path d="M54 0 C 59 30, 47 52, 53 100" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.6"/>
<rect x="29" y="30" width="6" height="15" rx="3" fill="#0b2250"/>
<rect x="66" y="30" width="6" height="15" rx="3" fill="#0b2250"/>
<path d="M27 66 Q50 84 74 66" fill="none" stroke="#0b2250" stroke-width="4.2" stroke-linecap="round"/>`,
);

icons.safari = icon(
  `${grad("bg", "#ffffff", "#d9e4f2")}${grad("c", "#58ccff", "#0a62f5")}`,
  `<rect width="100" height="100" fill="url(#bg)"/>`,
  `<circle cx="50" cy="50" r="39" fill="url(#c)"/>
<circle cx="50" cy="50" r="39" fill="none" stroke="#fff" stroke-width="2.4"/>
<circle cx="50" cy="50" r="34" fill="none" stroke="#fff" stroke-width="3.6" stroke-dasharray="1 5.934" stroke-opacity=".9"/>
<path d="M70 30 L54.2 54.2 L45.8 45.8 Z" fill="#ff3b30"/>
<path d="M30 70 L54.2 54.2 L45.8 45.8 Z" fill="#fff"/>`,
);

icons.terminal = icon(
  `${grad("bg", "#3a3a3d", "#050506")}`,
  `<rect width="100" height="100" fill="url(#bg)"/>
<rect x="6" y="6" width="88" height="88" rx="14" fill="#0b0b0c" stroke="#fff" stroke-opacity=".28" stroke-width="1.2"/>
<rect x="6" y="6" width="88" height="14" rx="14" fill="#fff" fill-opacity=".14"/>`,
  `<path d="M24 38 L40 50 L24 62" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M48 66 H70" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`,
);

const petals = ["#ff9f0a", "#ffd60a", "#8bd63a", "#2fc9a6", "#2f9bff", "#7c5cff", "#ff4fa0", "#ff453a"];
icons.photos = icon(
  "",
  `<rect width="100" height="100" fill="#fff"/>`,
  `<g style="mix-blend-mode:multiply">${petals
    .map(
      (c, i) =>
        `<ellipse cx="50" cy="31" rx="12" ry="19" fill="${c}" fill-opacity=".92" transform="rotate(${i * 45} 50 50)"/>`,
    )
    .join("")}</g>`,
);

icons.notes = icon(
  `${grad("top", "#ffd84a", "#ffb800")}`,
  `<rect width="100" height="100" fill="#fffdf6"/>
<rect width="100" height="30" fill="url(#top)"/>`,
  `<g stroke="#e3dfd0" stroke-width="1.6">
<path d="M0 46 H100M0 58 H100M0 70 H100M0 82 H100M0 94 H100"/>
</g>
<g stroke="#b9b5a6" stroke-width="3.4" stroke-linecap="round">
<path d="M20 40 H62M20 52 H80M20 64 H52"/>
</g>`,
);

icons.mail = icon(
  `${grad("bg", "#5bd0ff", "#0a62f5")}`,
  `<rect width="100" height="100" fill="url(#bg)"/>`,
  `<rect x="17" y="27" width="66" height="46" rx="7" fill="#fff"/>
<path d="M19 33 L50 56 L81 33" fill="none" stroke="#2a8cf5" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
);

icons.github = icon(
  `${grad("bg", "#2d333b", "#0d1117")}`,
  `<rect width="100" height="100" fill="url(#bg)"/>`,
  `<g transform="translate(17 17) scale(2.75)" fill="#fff"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></g>`,
);

icons.linkedin = icon(
  `${grad("bg", "#1a84dc", "#0a55a8")}`,
  `<rect width="100" height="100" fill="url(#bg)"/>`,
  `<g fill="#fff">
<circle cx="29" cy="29" r="6.5"/>
<rect x="23" y="40" width="12" height="36" rx="1.5"/>
<path d="M41 40 H52.5 V45.5 C55 41.5 59.5 39 65 39 C75 39 79 45.5 79 55.5 V76 H67 V58 C67 52.5 65 49.5 60.5 49.5 C56 49.5 53 52.5 53 58.5 V76 H41 Z"/>
</g>`,
);

icons.instagram = icon(
  `<radialGradient id="bg" cx=".3" cy="1.07" r="1.15"><stop offset="0" stop-color="#fdf497"/><stop offset=".05" stop-color="#fdf497"/><stop offset=".45" stop-color="#fd5949"/><stop offset=".6" stop-color="#d6249f"/><stop offset=".9" stop-color="#285aeb"/></radialGradient>`,
  `<rect width="100" height="100" fill="url(#bg)"/>`,
  `<rect x="23" y="23" width="54" height="54" rx="16" fill="none" stroke="#fff" stroke-width="5.2"/>
<circle cx="50" cy="50" r="12.5" fill="none" stroke="#fff" stroke-width="5.2"/>
<circle cx="66.5" cy="33.5" r="3.6" fill="#fff"/>`,
);

icons["system-settings"] = icon(
  `${grad("bg", "#d4d7dc", "#8d929b")}${grad("g", "#ffffff", "#c9cdd3")}`,
  `<rect width="100" height="100" fill="url(#bg)"/>`,
  `<g fill="url(#g)" stroke="#6b7079" stroke-opacity=".5" stroke-width=".8">
${Array.from({ length: 8 }, (_, i) => `<rect x="43" y="14" width="14" height="22" rx="3.5" transform="rotate(${i * 45} 50 50)"/>`).join("")}
<circle cx="50" cy="50" r="27"/>
</g>
<circle cx="50" cy="50" r="12" fill="#8d929b"/>
<circle cx="50" cy="50" r="12" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1"/>`,
);

icons["project-viewer"] = icon(
  `${grad("bg", "#8a7bff", "#5a45e0")}`,
  `<rect width="100" height="100" fill="url(#bg)"/>`,
  `<path d="M38 32L20 50l18 18M62 32l18 18-18 18" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`,
);

icons.preview = icon(
  `${grad("bg", "#f4f7fb", "#cfdcec")}${grad("lens", "#59c1ff", "#2a7de1")}`,
  `<rect width="100" height="100" fill="url(#bg)"/>`,
  `<rect x="22" y="16" width="44" height="58" rx="4" fill="#fff" stroke="#b6c3d4" stroke-width="1.6"/>
<path d="M30 30h28M30 38h28M30 46h20" stroke="#c4cedb" stroke-width="3" stroke-linecap="round"/>
<circle cx="58" cy="60" r="17" fill="url(#lens)" fill-opacity=".35" stroke="url(#lens)" stroke-width="5"/>
<path d="M70 72l14 14" stroke="#2a7de1" stroke-width="7" stroke-linecap="round"/>`,
);

for (const [name, svg] of Object.entries(icons)) {
  writeFileSync(`${OUT}/${name}.svg`, svg);
}
console.log(`wrote ${Object.keys(icons).length} icons`);
