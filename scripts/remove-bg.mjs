import sharp from "sharp";

// BFS flood-fill: 4 köşeden başlayıp benzer renkteki pikselleri şeffaflaştırır
async function floodFill(inputPath, threshold) {
  const img = sharp(inputPath).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const C = 4;

  const colorDiff = (i, r2, g2, b2) =>
    Math.sqrt(
      (data[i] - r2) ** 2 +
      (data[i+1] - g2) ** 2 +
      (data[i+2] - b2) ** 2
    );

  const visited = new Uint8Array(width * height);
  const corners = [[0,0],[width-1,0],[0,height-1],[width-1,height-1]];

  for (const [sx, sy] of corners) {
    const si = (sy * width + sx) * C;
    const bgR = data[si], bgG = data[si+1], bgB = data[si+2];
    const stack = [[sx, sy]];

    while (stack.length > 0) {
      const [x, y] = stack.pop();
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      const pi = y * width + x;
      if (visited[pi]) continue;
      visited[pi] = 1;
      const i = pi * C;
      const d = colorDiff(i, bgR, bgG, bgB);
      if (d < threshold) {
        // yumuşak kenar: eşiğe yaklaştıkça yarı-şeffaf
        const a = Math.floor((d / threshold) * d / threshold * 255);
        data[i+3] = Math.min(data[i+3], a);
        stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
      }
    }
  }

  await sharp(Buffer.from(data), { raw: { width, height, channels: C } })
    .png()
    .toFile(inputPath);
}

// Parlak (beyaz/krem) arka planları luminance bazlı şeffaflaştır
async function luminanceMask(inputPath, brightThreshold = 200, edgeBlend = 30) {
  const img = sharp(inputPath).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const C = 4;

  for (let i = 0; i < data.length; i += C) {
    const r = data[i], g = data[i+1], b = data[i+2];
    // Luminance (ITU-R BT.601)
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    // Saturation: düşük saturasyon = gri/beyaz = arka plan
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;

    if (lum > brightThreshold && sat < 0.25) {
      // Yumuşak geçiş
      const excess = lum - brightThreshold;
      const alpha = Math.max(0, 255 - Math.floor((excess / edgeBlend) * 255));
      data[i+3] = Math.min(data[i+3], alpha);
    }
  }

  await sharp(Buffer.from(data), { raw: { width, height, channels: C } })
    .png()
    .toFile(inputPath);
}

const DIR = "public/assets/ui";

// Her dosya için en uygun strateji
const TARGETS = [
  // [dosya, strateji, ...params]
  ["kupa.png",        "luminance", 190, 25],  // beyaz/krem hale
  ["logo.png",        "flood",     28],        // koyu gradient köşeler
  ["klasik-mod.png",  "flood",     50],        // koyu arka plan
  ["hizli-mod.png",   "flood",     50],
  ["ates.png",        "flood",     35],
  ["kapali.png",      "flood",     40],
  ["iflas.png",       "flood",     40],
  ["yildiz-mini.png", "luminance", 210, 20],
  ["mevsim-mini.png", "luminance", 210, 20],
  ["para-ikon.png",   "luminance", 200, 20],
  ["duel-bitis.png",  "flood",     30],
  ["bonus-ikon.png",  "flood",     35],
];

for (const [file, strategy, ...params] of TARGETS) {
  const path = `${DIR}/${file}`;
  try {
    if (strategy === "flood") {
      await floodFill(path, params[0]);
    } else if (strategy === "luminance") {
      await luminanceMask(path, params[0], params[1]);
    }
    console.log(`✓ ${file} (${strategy})`);
  } catch (e) {
    console.error(`✗ ${file}: ${e.message}`);
  }
}

console.log("\nBitti.");
