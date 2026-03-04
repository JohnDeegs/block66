// Generates shield-with-66 PNG icons for Block66
// Usage: node create-icons.js
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const outDir = path.join(__dirname, "packages/extension/public/icons");
fs.mkdirSync(outDir, { recursive: true });

function makeSvg(size) {
  const s = size;
  const cx = s / 2;
  // Shield geometry — scales with size
  const shieldTop = s * 0.08;
  const shieldLeft = s * 0.14;
  const shieldRight = s * 0.86;
  const shieldMid = s * 0.6;   // where sides start angling inward
  const shieldBottom = s * 0.93;
  const r = s * 0.1;           // corner radius for background rect

  // Shield path: flat top, vertical sides to midpoint, then taper to point
  const shieldPath = [
    `M ${cx} ${shieldTop}`,
    `L ${shieldRight} ${shieldTop + s * 0.06}`,
    `L ${shieldRight} ${shieldMid}`,
    `Q ${shieldRight} ${shieldMid + s * 0.08} ${cx} ${shieldBottom}`,
    `Q ${shieldLeft} ${shieldMid + s * 0.08} ${shieldLeft} ${shieldMid}`,
    `L ${shieldLeft} ${shieldTop + s * 0.06}`,
    `Z`,
  ].join(" ");

  const strokeW = Math.max(1, s * 0.05);
  const fontSize = Math.round(s * 0.34);
  // Text sits in the upper 60% of the shield
  const textY = shieldTop + (shieldMid - shieldTop) * 0.62 + fontSize * 0.35;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="100%" stop-color="#16213e"/>
    </linearGradient>
    <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#7c74ff"/>
      <stop offset="100%" stop-color="#5a52e0"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="${s}" height="${s}" rx="${r}" ry="${r}" fill="url(#bg)"/>
  <!-- Shield fill -->
  <path d="${shieldPath}" fill="url(#fill)"/>
  <!-- Shield stroke -->
  <path d="${shieldPath}" fill="none" stroke="white" stroke-width="${strokeW}" stroke-linejoin="round" opacity="0.9"/>
  <!-- "66" text -->
  <text
    x="${cx}"
    y="${textY}"
    text-anchor="middle"
    font-family="Arial Black, Arial, sans-serif"
    font-weight="900"
    font-size="${fontSize}"
    fill="white"
    letter-spacing="-1"
  >66</text>
</svg>`;
}

async function run() {
  for (const size of [16, 32, 48, 128]) {
    const svg = makeSvg(size);
    const outPath = path.join(outDir, `icon-${size}.png`);
    await sharp(Buffer.from(svg)).png().toFile(outPath);
    console.log(`✓ icon-${size}.png`);
  }
}

run().catch((err) => { console.error(err); process.exit(1); });
