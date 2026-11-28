/* @borumi
{
  "formatVersion": 1,
  "name": "Psychedelic keyword",
  "category": "title",
  "tags": ["keyword", "big text", "talking head", "psychedelic", "blacklight", "neon", "trippy", "emphasis"],
  "sizing": "frame",
  "duration": 3,
  "fps": 60,
  "previewAt": 1.5,
  "defaultPlacement": { "fallback": { "horizontal": "stretch", "vertical": "stretch", "inset": 0 } },
  "parameters": {
    "text": { "type": "text", "level": 1, "order": 0, "default": "UNSTOPPABLE", "label": "Text (one line)", "maxLength": 60 },
    "highlight": { "type": "text", "level": 1, "order": 1, "default": "", "label": "Emphasis: the 1 word or phrase in highlighter", "maxLength": 60 },
    "layout": { "type": "text", "level": 1, "order": 2, "default": "top-behind", "label": "Layout: top-behind (about 80%, behind subject on) or side (about 20%, behind subject off). Never below the chin.", "maxLength": 12 },
    "side": { "type": "text", "level": 1, "order": 3, "default": "right", "label": "Side layout: left or right (pick the empty side of the frame)", "maxLength": 5 },
    "kicker": { "type": "text", "level": 2, "order": 0, "default": "", "label": "Kicker", "maxLength": 40 },
    "accent": { "type": "color", "level": 2, "order": 1, "default": "#e6ff3d", "label": "Emphasis color (highlighter)" },
    "rim": { "type": "color", "level": 2, "order": 2, "default": "#19e3ff", "label": "Neon rim color" },
    "background": { "type": "media", "level": 2, "order": 3, "accept": ["image"], "default": null, "label": "Sky art (bg-space)" },
    "jellyfishA": { "type": "media", "level": 2, "order": 4, "accept": ["image"], "default": null, "label": "Jellyfish left" },
    "jellyfishB": { "type": "media", "level": 2, "order": 5, "accept": ["image"], "default": null, "label": "Jellyfish right" },
    "sparkle": { "type": "media", "level": 2, "order": 6, "accept": ["image"], "default": null, "label": "Sparkle sprite" }
  }
}
*/

// Layout top-behind (1 line straight across behind the speaker's head, behind subject on) or
// side (stacked beside the speaker's head, behind subject off). Never below the chin.
// Big one-line keyword across the top of talking-head footage, blacklight
// poster style. Painted sky art fades down from the top, two painted jellyfish
// drift at the ends, sparkles twinkle, and the letters are dark blue with a
// neon rim, an inner contour line and a coloured glow. Sits behind the
// speaker's head (turn on "behind subject"), never over the mouth.
// ===== Blacklight style kit (shared by every Psychedelic composition) =====
// Art comes from AI-painted image layers passed as media parameters; code only
// animates them (parallax, drift, glow pulse, twinkle) and draws the lettering.
const BL = {
  deep: "#050826",      // page darkness
  navy: "#0b1452",      // letter body top
  ink: "#040a2e",       // letter body bottom
  cyan: "#19e3ff", magenta: "#ff2bd6", pink: "#ff5fa2", lime: "#b6ff00",
  orange: "#ff8a1f", violet: "#a24bff", lav: "#c9b8ff",
  // Accents: hot pink and hot coral stay under 2% of the frame; highlighter
  // marks the single most-emphasized word or phrase in a text.
  hot: "#ff4fe0", coral: "#ff6a3d", hl: "#e6ff3d"
};
const ACCENTS = [BL.hot, BL.coral];
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const span = (t, a, b) => clamp01((t - a) / (b - a));
const backOut = (p) => 1 + 2.4 * Math.pow(p - 1, 3) + 1.4 * Math.pow(p - 1, 2);
const TAU = Math.PI * 2;

// Lettering: dark blue body, neon rim on the edge, an inner contour line, all
// computed from the glyph coverage of one white text layer.
const LETTER = borumi.shader(`
uniform shader source;
uniform float rim; uniform float edge; uniform float d1; uniform float d2;
uniform float3 rimColor; uniform float3 lineColor; uniform float3 bodyTop; uniform float3 bodyBot;
uniform float y0; uniform float y1;
half4 main(float2 p) {
  float inside = source.eval(p).a;
  float around = 0.0; float e = 1.0; float i1 = 1.0; float i2 = 1.0;
  for (int i = 0; i < 16; i++) {
    float a = float(i) * 0.3926991;
    float2 d = float2(cos(a), sin(a));
    around = max(around, source.eval(p + d * rim).a);
    e = min(e, source.eval(p + d * edge).a);
    i1 = min(i1, source.eval(p + d * d1).a);
    i2 = min(i2, source.eval(p + d * d2).a);
  }
  float outer = clamp(around - inside, 0.0, 1.0);
  float inner = inside * (1.0 - e);
  float contour = clamp(i1 - i2, 0.0, 1.0) * inside;
  float k = clamp((p.y - y0) / max(1.0, y1 - y0), 0.0, 1.0);
  float3 body = mix(bodyTop, bodyBot, k);
  float r = max(outer, inner);
  float3 neon = mix(rimColor, float3(1.0), 0.18 * inner);
  float3 col = mix(body, neon, r);
  col = mix(col, lineColor, contour * 0.85);
  float alpha = max(inside, outer);
  return half4(half3(col * alpha), half(alpha));
}`);

// Fades a layer out along a direction (for art bands that sit over footage).
const FADE = borumi.shader(`
uniform shader source; uniform float2 a; uniform float2 b; uniform float soft;
half4 main(float2 p) {
  float2 ab = b - a;
  float t = clamp(dot(p - a, ab) / dot(ab, ab), 0.0, 1.0);
  return source.eval(p) * half(1.0 - smoothstep(soft, 1.0, t));
}`);

// Draw one line of neon lettering. size = font px, cx/cy = centre, opts.track,
// opts.rim/line colours. chars: optional per-character transforms {dx,dy,rot,a}.
function blLetters(ctx, str, cx, cy, size, opts) {
  const o = opts || {};
  const font = `700 ${Math.round(size)}px ${o.family || "Poppins"}`;
  const rimC = o.rim || BL.cyan, lineC = o.line || o.rim || BL.cyan, glowC = o.glow || rimC;
  const track = (o.track || 0.02) * size;
  const chars = [];
  let x = 0;
  for (const ch of str) {
    const w = ch === " " ? size * 0.3 : ctx.measureText(ch, { font }).width;
    chars.push({ ch, x, w }); x += w + track;
  }
  const total = Math.max(0, x - track), x0 = cx - total / 2;
  const tf = o.chars || (() => ({ dx: 0, dy: 0, rot: 0, a: 1 }));
  const glyphs = (style, alphaMul) => {
    chars.forEach((c, i) => {
      if (c.ch === " ") return;
      const t = tf(i, chars.length);
      if (t.a <= 0) return;
      ctx.save();
      ctx.globalAlpha = t.a * alphaMul;
      ctx.translate(x0 + c.x + c.w / 2 + t.dx, cy + t.dy);
      if (t.rot) ctx.rotate(t.rot);
      if (t.s && t.s !== 1) ctx.scale(t.s, t.s);
      ctx.fillStyle = style;
      ctx.text(c.ch, { x: -c.w / 2, y: 0, font, baseline: "middle" });
      ctx.restore();
    });
  };
  const pulse = o.pulse == null ? 1 : o.pulse;
  // coloured glow
  ctx.layer(() => { glyphs(glowC, 1.0 * pulse); ctx.applyBlur(Math.min(44, size * 0.16)); });
  ctx.layer(() => { glyphs(glowC, 0.9 * pulse); ctx.applyBlur(Math.min(64, size * 0.3)); });
  // body + rim + inner contour
  const small = size < 90;
  const rim = (small ? Math.max(2.5, size * 0.05) : Math.max(2, size * 0.035)) * (o.rimScale || 1);
  const d1 = small ? size * 4 : size * 0.042, d2 = small ? size * 4 : size * 0.042 + Math.max(1.5, size * 0.012);
  ctx.layer(() => {
    glyphs("#ffffff", 1);
    ctx.applyShader(LETTER, {
      rim, edge: rim * (small ? 0.35 : 0.5), d1, d2,
      rimColor: borumi.shaderColor(rimC), lineColor: borumi.shaderColor(lineC),
      bodyTop: borumi.shaderColor(o.bodyTop || BL.navy), bodyBot: borumi.shaderColor(o.bodyBot || BL.ink),
      y0: cy - size * 0.38, y1: cy + size * 0.38
    }, { sampleRadius: Math.ceil(size * 0.1) + 2 });
  });
  return { width: total, left: x0 };
}

// Measure a line the way blLetters lays it out.
function blMeasure(ctx, str, size, track, family) {
  const font = `700 ${Math.round(size)}px ${family || "Poppins"}`;
  let x = 0, n = 0;
  for (const ch of str) { x += (ch === " " ? size * 0.3 : ctx.measureText(ch, { font }).width) + (track || 0.02) * size; n++; }
  return Math.max(0, x - (track || 0.02) * size);
}

// Art helpers. Every one is a no-op when its image isn't set.
function blPic(media, ref) { return ref ? media.sample(ref, 0) : null; }

// Background plate with slow parallax: covers the box, overscanned by `over`,
// drifting sideways at `speed` units/s and breathing a little.
function blPlate(ctx, pic, W, H, time, speed, over, unit) {
  if (!pic) return false;
  const s = 1 + (over || 0.08) + 0.01 * Math.sin(time * 0.35);
  const w = W * s, h = H * s;
  const dx = -((w - W) / 2) + Math.sin(time * 0.18) * (w - W) * 0.35 + (speed || 0) * unit * (time - 1);
  const dy = -((h - H) / 2) + Math.cos(time * 0.15) * (h - H) * 0.2;
  ctx.drawImage(pic, dx, dy, w, h, { fit: "cover" });
  return true;
}

// A sprite anchored at its bottom centre (mushrooms) with gentle sway and a
// sideways parallax shift.
function blGround(ctx, pic, x, baseY, height, time, sway, shift, flip) {
  if (!pic) return;
  const w = height * pic.width / pic.height;
  ctx.save();
  ctx.translate(x + shift, baseY);
  ctx.rotate(Math.sin(time * 0.7 + x) * (sway || 0.012));
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(pic, -w / 2, -height, w, height, { fit: "stretch" });
  ctx.restore();
}

// A jellyfish drifting upward with a slow bob, tilt and bell pulse.
function blJelly(ctx, pic, x, y, height, time, seed, alpha) {
  if (!pic) return;
  const w = height * pic.width / pic.height;
  const ph = seed * 2.3;
  const bob = Math.sin(time * 0.9 + ph) * height * 0.035;
  const sideways = Math.sin(time * 0.45 + ph) * height * 0.05;
  const rise = -time * height * 0.03;
  const pulse = 1 + 0.035 * Math.sin(time * 2.1 + ph);
  ctx.save();
  ctx.globalAlpha = (alpha == null ? 1 : alpha);
  ctx.translate(x + sideways, y + bob + rise);
  ctx.rotate(Math.sin(time * 0.6 + ph) * 0.06);
  ctx.scale(1 / Math.sqrt(pulse), pulse);
  ctx.drawImage(pic, -w / 2, -height * 0.15, w, height, { fit: "stretch" });
  ctx.restore();
}

// Twinkling sparkle sprites at repeatable random spots inside a box.
function blStars(ctx, pic, count, box, time, unit, seed, alpha) {
  if (!pic) return;
  for (let i = 0; i < count; i++) {
    const r = (k) => borumi.random(seed * 10 + k, i);
    const tw = Math.pow(0.5 + 0.5 * Math.sin(time * (1.2 + r(1) * 2.2) + r(2) * TAU), 2.2);
    const s = (26 + 70 * r(3)) * unit * (0.55 + 0.6 * tw);
    const x = box.x + box.w * r(4), y = box.y + box.h * r(5);
    ctx.save();
    ctx.globalAlpha = (alpha == null ? 1 : alpha) * (0.25 + 0.75 * tw);
    if (i % 4 === 1) blGlow(ctx, x, y, s * 0.32, ACCENTS[(i >> 2) % 2], 1.0);
    ctx.translate(x, y);
    ctx.rotate(r(6) * 0.5 - 0.25 + time * 0.1 * (r(7) - 0.5));
    ctx.drawImage(pic, -s / 2, -s / 2, s, s, { fit: "contain" });
    ctx.restore();
  }
}

// Soft coloured glow that breathes (used over a painted moon or behind text).
function blGlow(ctx, x, y, r, color, amount) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, borumi.withAlpha(color, 0.55 * amount));
  g.addColorStop(0.45, borumi.withAlpha(color, 0.22 * amount));
  g.addColorStop(1, borumi.withAlpha(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
function blSpots(ctx, spots, time, unit) {
  spots.forEach((s, i) => blGlow(ctx, s[0], s[1], s[2] * unit, ACCENTS[i % 2], 0.55 + 0.45 * blPulse(time, 2.4, i * 1.7)));
}
const blPulse = (time, period, phase) => 0.5 + 0.5 * Math.sin((time / (period || 2.4)) * TAU + (phase || 0));
// ===== end kit =====

/** @param {Borumi.Frame} frame */
export function render({ ctx, media, time, duration, width: W, height: H, params }) {
  const unit = Math.min(W, H) / 1080;
  const line = String(params.text || "").toUpperCase().replace(/\s+/g, " ").trim();
  if (!line) return;
  const hl = String(params.highlight || "").toUpperCase().replace(/\s+/g, " ").trim();
  const out = Math.max(0.5, duration - 0.4);
  const lift = span(time, 0, 0.22) * (1 - span(time, duration - 0.25, duration));
  if (lift <= 0) return;

  // Layout: "top-behind" (default, about 80% of keyword segments: sky band at
  // the top, segment has behind subject on, 1 line straight behind the speaker's head) or
  // "side" (about 20%: words stacked beside the speaker's head on the empty side, drawn in
  // front, behind subject off). Big text never goes below the speaker's chin.
  const sideMode = String(params.layout || "").trim().toLowerCase() === "side";
  const onLeft = String(params.side || "right").trim().toLowerCase() === "left";
  const num = (v, d) => { const n = parseFloat(v); return isNaN(n) ? d : n; };
  const sky = blPic(media, params.background);
  const jA = blPic(media, params.jellyfishA), jB = blPic(media, params.jellyfishB);
  const words = line.split(" ");
  let track = 0.03;

  // highlighter: exactly 1 contiguous phrase, first match only
  const hlWords = hl ? hl.split(" ") : [];
  let hotFrom = -1;
  for (let k = 0; hlWords.length && k + hlWords.length <= words.length; k++) {
    if (hlWords.every((w, n) => words[k + n] === w)) { hotFrom = k; break; }
  }
  const isHotWord = (k) => hotFrom >= 0 && k >= hotFrom && k < hotFrom + hlWords.length;

  // lay out word runs: [{text, firstWord, x, y}] plus one shared size
  const runs = [];
  const sp = (s) => s * 0.3 + track * s;
  const runW = (ws, s) => ws.reduce((a, w, i) => a + blMeasure(ctx, w, s, track) + (i ? sp(s) : 0), 0);
  let size;
  ctx.globalAlpha = lift;
  if (!sideMode) {
    const bandH = H * 0.5;
    ctx.layer(() => {
      if (!blPlate(ctx, sky, W, H, time, 6, 0.06, unit)) { ctx.fillStyle = BL.deep; ctx.fillRect(0, 0, W, bandH); }
      ctx.applyShader(FADE, { a: [0, 0], b: [0, bandH], soft: 0.35 });
    });
    // 1 line straight across behind the speaker's head
    blJelly(ctx, jA, W * 0.04, H * 0.02, H * 0.34, time, 1, 0.9 * lift);
    blJelly(ctx, jB, W * 0.962, H * 0.05, H * 0.3, time, 2, 0.9 * lift);
    blStars(ctx, blPic(media, params.sparkle), 12, { x: W * 0.03, y: H * 0.02, w: W * 0.94, h: H * 0.3 }, time, unit, 3, lift);
    size = H * 0.25;
    let w = runW(words, size);
    if (w > W * 0.82) { size *= (W * 0.82) / w; w = runW(words, size); }
    const count0 = [...line].length;
    if (w < W * 0.6 && count0 > 1) { track += (W * 0.6 - w) / ((count0 - 1) * size); w = runW(words, size); }
    runs.push({ ws: words, k: 0, x: W / 2 - w / 2, w });
    const cy = H * 0.07 + H * 0.25 * 0.42;
    runs.forEach((r) => { r.y = cy; });
  } else {
    // side panel: sky art on the empty side, fading toward the speaker
    const panelW = W * 0.44, x0 = onLeft ? 0 : W - panelW;
    ctx.layer(() => {
      if (!blPlate(ctx, sky, W, H, time, onLeft ? -5 : 5, 0.06, unit)) { ctx.fillStyle = BL.deep; ctx.fillRect(x0, 0, panelW, H); }
      ctx.fillStyle = borumi.withAlpha(BL.deep, 0.4); ctx.fillRect(x0, 0, panelW, H);
      ctx.applyShader(FADE, onLeft ? { a: [0, 0], b: [panelW, 0], soft: 0.55 } : { a: [W, 0], b: [W - panelW, 0], soft: 0.55 });
    });
    const jx = onLeft ? W * 0.05 : W * 0.95;
    blJelly(ctx, onLeft ? jA : jB, jx, H * 0.62, H * 0.3, time, onLeft ? 1 : 2, 0.9 * lift);
    blStars(ctx, blPic(media, params.sparkle), 8, { x: x0 + panelW * 0.1, y: H * 0.05, w: panelW * 0.8, h: H * 0.7 }, time, unit, 3, lift);
    // stack on up to 3 lines, balanced by width
    const colW = W * 0.29, cx = onLeft ? W * 0.18 : W * 0.82;
    size = H * 0.2;
    const lines = [];
    const n = Math.min(3, words.length), per = Math.ceil(words.length / n);
    for (let i = 0; i < words.length; i += per) lines.push({ ws: words.slice(i, i + per), k: i });
    const widest = Math.max(...lines.map((l) => runW(l.ws, size)));
    if (widest > colW) size *= colW / widest;
    const row = size * 1.1, top = H * 0.4 - (row * (lines.length - 1)) / 2;
    lines.forEach((l, i) => { const w = runW(l.ws, size); runs.push({ ws: l.ws, k: l.k, x: cx - w / 2, w, y: top + i * row }); });
  }
  ctx.globalAlpha = 1;

  const count = [...line].length;
  const step = Math.min(0.045, 0.5 / count), outStep = Math.min(0.025, 0.25 / count);
  const anim = (i) => {
    const pIn = span(time, 0.03 + i * step, 0.03 + i * step + 0.26);
    const pOut = span(time, out + i * outStep, out + i * outStep + 0.14);
    return {
      a: clamp01(pIn * 2.5) * (1 - pOut),
      dx: 0,
      dy: Math.sin(time * 2.2 + i * 0.75) * size * 0.025 + (1 - backOut(pIn)) * size * -0.4 + pOut * size * 0.25,
      rot: Math.sin(time * 1.6 + i * 0.9) * 0.035
    };
  };
  const glow = 0.8 + 0.2 * blPulse(time, 1.8);
  // character index of each word, for the staggered pop-in
  const charAt = []; { let c = 0; words.forEach((w) => { charAt.push(c); c += [...w].length + 1; }); }
  runs.forEach((r) => {
    let x = r.x;
    r.ws.forEach((w, j) => {
      const k = r.k + j, ww = blMeasure(ctx, w, size, track), hot = isHotWord(k), base = charAt[k];
      blLetters(ctx, w, x + ww / 2, r.y, size, {
        track, rim: hot ? params.accent : params.rim, line: hot ? params.accent : BL.hot,
        glow: hot ? params.accent : BL.magenta, pulse: glow, chars: (i) => anim(base + i)
      });
      x += ww + sp(size);
    });
  });

  const kicker = String(params.kicker || "").toUpperCase().trim();
  if (kicker && time > 0.15 && time < out && runs.length) {
    const ks = 30 * unit, last = runs[runs.length - 1];
    ctx.globalAlpha = lift;
    ctx.fillStyle = "#ffffff";
    const kx = sideMode ? last.x + last.w / 2 - W * 0.15 : 0, kw = sideMode ? W * 0.3 : W;
    ctx.text(kicker, { x: kx, y: last.y + size * 0.55, width: kw, align: "center", baseline: "top", font: `700 ${Math.round(ks)}px Poppins`, letterSpacing: ks * 0.34 });
  }
  ctx.globalAlpha = 1;
}
