// Renders the original default wallpaper to public/wallpapers/.
// Usage: node scripts/generate-wallpaper.mjs
import sharp from "sharp";

const W = 3840;
const M = 400; // render margin so edge blurs have real content to sample
const H = 2400; // 16:10, the native ratio of MacBook displays; covered with object-cover elsewhere

const baseSvg = () => `
<svg xmlns="http://www.w3.org/2000/svg" width="${W + 2 * M}" height="${H + 2 * M}" viewBox="${-M} ${-M} ${W + 2 * M} ${H + 2 * M}">
  <defs>
    <linearGradient id="base" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b1030"/>
      <stop offset="0.5" stop-color="#1b1466"/>
      <stop offset="1" stop-color="#3a1070"/>
    </linearGradient>
    <linearGradient id="r1" x1="0" y1="0" x2="1" y2="0.4">
      <stop offset="0" stop-color="#2b6cff"/>
      <stop offset="0.55" stop-color="#7a3cff"/>
      <stop offset="1" stop-color="#ff4fa8"/>
    </linearGradient>
    <linearGradient id="r2" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff8a5b"/>
      <stop offset="0.5" stop-color="#ff3f8e"/>
      <stop offset="1" stop-color="#8a2cff"/>
    </linearGradient>
    <linearGradient id="r3" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="#19d3ff"/>
      <stop offset="0.6" stop-color="#3a6bff"/>
      <stop offset="1" stop-color="#9b4dff"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0.55" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.3"/>
    </radialGradient>
    <filter id="b60" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="60"/></filter>
    <filter id="b140" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="140"/></filter>
    <filter id="b6" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7"/>
      <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.9 -0.3"/>
    </filter>
  </defs>

  <rect x="${-M}" y="${-M}" width="${W + 2 * M}" height="${H + 2 * M}" fill="url(#base)"/>

  <!-- soft ambient light -->
  <ellipse cx="3000" cy="500" rx="1300" ry="800" fill="#ff5fa2" opacity="0.45" filter="url(#b140)"/>
  <ellipse cx="700" cy="1900" rx="1400" ry="800" fill="#1fb6ff" opacity="0.4" filter="url(#b140)"/>
  <ellipse cx="1900" cy="1200" rx="1100" ry="600" fill="#6a3cff" opacity="0.5" filter="url(#b140)"/>

  <!-- large flowing ribbons -->
  <path d="M-700 1500 C 700 700, 1500 2000, 2500 1200 S 3700 400, 4600 700 L 4600 1500 C 3500 1100, 2900 1900, 2300 1700 S 700 1900, -700 2000 Z"
        fill="url(#r1)" opacity="0.85" filter="url(#b60)"/>
  <path d="M-700 300 C 600 -100, 1500 900, 2300 500 S 3300 -100, 4600 300 L 4600 900 C 3400 500, 2900 1200, 2200 1000 S 700 400, -700 900 Z"
        fill="url(#r2)" opacity="0.75" filter="url(#b60)"/>
  <path d="M-700 1900 C 800 1500, 1700 2500, 2700 1900 S 3600 1500, 4600 1800 L 4600 2600 L -700 2600 Z"
        fill="url(#r3)" opacity="0.8" filter="url(#b60)"/>

  <!-- highlight -->
  <ellipse cx="2200" cy="900" rx="900" ry="420" fill="url(#glow)" opacity="0.35"/>

  <rect width="${W}" height="${H}" fill="url(#vignette)"/>
  <rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.07" style="mix-blend-mode:overlay"/>
</svg>`;


// Original palettes. Each maps the Aurora colours (keys) to a new set of hex values.
const AURORA = ["#0b1030","#1b1466","#3a1070","#2b6cff","#7a3cff","#ff4fa8","#ff8a5b","#ff3f8e","#8a2cff","#19d3ff","#3a6bff","#9b4dff","#ff5fa2","#1fb6ff","#6a3cff"];
const palettes = {
  aurora: AURORA,
  dusk: ["#1a0b2e","#4a1942","#8a2b4a","#ff8a5b","#ff4f6d","#c0398f","#ffd36e","#ff8a5b","#e0407a","#7a3cff","#b5469f","#ff6a88","#ff9f6b","#d94f8a","#7a3cff"],
  lagoon: ["#04202e","#0b4a5a","#0e6b5c","#19d3c0","#1f9bff","#4b6cff","#7fe9a1","#19c3b0","#1f7ad0","#0e9fd0","#2f6bff","#6fd4ff","#2be0c0","#1f8bff","#5fe0a0"],
  graphite: ["#0f1012","#1c1d21","#2a2c32","#5a5f6a","#3b3f48","#8a8f9a","#9aa0ab","#6a707c","#c2c6ce","#3a3d44","#50545e","#7b808b","#8a8f9a","#4a4d55","#aeb3bd"],
};

const template = baseSvg();
for (const [name, colours] of Object.entries(palettes)) {
  let i = 0;
  // Replace the 15 palette colours in order of first appearance of each Aurora colour.
  const map = new Map(AURORA.map((c, idx) => [c, colours[idx]]));
  const svg = template.replace(/#[0-9a-fA-F]{6}/g, (hex) => map.get(hex.toLowerCase()) ?? hex);
  const img = sharp(await sharp(Buffer.from(svg), { density: 72 }).extract({ left: M, top: M, width: W, height: H }).png().toBuffer());
  await img.clone().webp({ quality: 90, effort: 6 }).toFile(`public/wallpapers/${name}.webp`);
  await img.clone().resize(480, 300).webp({ quality: 80 }).toFile(`public/wallpapers/${name}-thumb.webp`);
  void i;
}
console.log("done");
