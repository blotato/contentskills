/* @borumi
{
  "formatVersion": 1,
  "name": "Psychedelic chapter card",
  "category": "title",
  "tags": ["chapter", "full screen", "title card", "section", "psychedelic", "blacklight", "neon", "trippy"],
  "sizing": "frame",
  "duration": 3,
  "fps": 60,
  "previewAt": 1.6,
  "defaultPlacement": { "fallback": { "horizontal": "stretch", "vertical": "stretch", "inset": 0 } },
  "parameters": {
    "number": { "type": "text", "level": 1, "order": 0, "default": "02", "label": "Number", "maxLength": 4 },
    "title": { "type": "text", "level": 1, "order": 1, "default": "THE BUILD", "label": "Title", "maxLength": 40 },
    "kicker": { "type": "text", "level": 2, "order": 0, "default": "CHAPTER", "label": "Kicker", "maxLength": 30 },
    "highlight": { "type": "text", "level": 1, "order": 2, "default": "", "label": "Emphasis: 1 title word or phrase in highlighter (optional)", "maxLength": 40 },
    "rim": { "type": "color", "level": 2, "order": 1, "default": "#19e3ff", "label": "Title rim color" },
    "numberRim": { "type": "color", "level": 2, "order": 2, "default": "#ff4fe0", "label": "Number rim color (hot pink accent)" },
    "background": { "type": "media", "level": 2, "order": 3, "accept": ["image"], "default": null, "label": "Background art (bg-forest)" },
    "mushroomsLeft": { "type": "media", "level": 2, "order": 4, "accept": ["image"], "default": null, "label": "Mushrooms left" },
    "mushroomsRight": { "type": "media", "level": 2, "order": 5, "accept": ["image"], "default": null, "label": "Mushrooms right" },
    "jellyfishA": { "type": "media", "level": 2, "order": 6, "accept": ["image"], "default": null, "label": "Jellyfish A" },
    "jellyfishB": { "type": "media", "level": 2, "order": 7, "accept": ["image"], "default": null, "label": "Jellyfish B" },
    "sparkle": { "type": "media", "level": 2, "order": 8, "accept": ["image"], "default": null, "label": "Sparkle sprite" }
  }
}
*/

// Full-screen chapter card, blacklight poster style. A painted moonlit
// mushroom forest drifts in slow parallax, painted mushroom clusters rise in
// the foreground corners, two painted jellyfish drift across the sky, the moon
// glow pulses and sparkles twinkle. Number and title use the dark-blue neon
// lettering.
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
  const fade = span(time, 0, 0.22) * (1 - span(time, duration - 0.28, duration));
  if (fade <= 0) return;
  const number = String(params.number || "").toUpperCase().trim();
  const title = String(params.title || "").toUpperCase().replace(/\s+/g, " ").trim();
  const kicker = String(params.kicker || "").toUpperCase().trim();

  ctx.globalAlpha = fade;
  ctx.fillStyle = BL.deep;
  ctx.fillRect(0, 0, W, H);
  // far layer: painted forest, slow parallax
  blPlate(ctx, blPic(media, params.background), W, H, time, 8, 0.08, unit);
  // moon glow pulse (the painted moon sits near the top centre of bg-forest)
  blGlow(ctx, W * 0.52, H * 0.27, H * 0.42, BL.cyan, 0.55 + 0.45 * blPulse(time, 2.6));
  // darken the lower middle so the lettering reads
  const shade = ctx.createRadialGradient(W / 2, H * 0.6, 0, W / 2, H * 0.6, W * 0.45);
  shade.addColorStop(0, borumi.withAlpha(BL.deep, 0.55));
  shade.addColorStop(1, borumi.withAlpha(BL.deep, 0));
  ctx.fillStyle = shade; ctx.fillRect(0, 0, W, H);

  // mid layer: jellyfish drifting through the sky
  blJelly(ctx, blPic(media, params.jellyfishA), W * 0.2, H * 0.08, H * 0.42, time, 1, 0.92 * fade);
  blJelly(ctx, blPic(media, params.jellyfishB), W * 0.8, H * 0.12, H * 0.36, time, 2, 0.92 * fade);
  blStars(ctx, blPic(media, params.sparkle), 16, { x: W * 0.04, y: H * 0.03, w: W * 0.92, h: H * 0.5 }, time, unit, 5, fade);

  // near layer: mushrooms rise from the bottom corners, faster parallax
  const rise = (1 - borumi.easeOut(span(time, 0.05, 0.6))) * 260 * unit;
  const shift = (time - 1.5) * -14 * unit;
  blGround(ctx, blPic(media, params.mushroomsLeft), W * 0.075, H + 50 * unit + rise, H * 0.5, time, 0.012, shift);
  blGround(ctx, blPic(media, params.mushroomsRight), W * 0.925, H + 50 * unit + rise, H * 0.47, time, 0.012, shift);
  // accent glints on a few painted mushroom caps (hot pink / hot coral)
  blSpots(ctx, [[W * 0.06 + shift, H * 0.62 + rise, 26], [W * 0.95 + shift, H * 0.66 + rise, 24], [W * 0.115 + shift, H * 0.83 + rise, 18]], time, unit);

  // lettering
  const pop = (delay) => (i, n) => {
    const p = span(time, delay + i * Math.min(0.04, 0.3 / n), delay + 0.3 + i * Math.min(0.04, 0.3 / n));
    return { a: clamp01(p * 2.5) * fade, dx: 0, dy: (1 - backOut(p)) * -40 * unit + Math.sin(time * 2 + i * 0.8) * 4 * unit, rot: Math.sin(time * 1.4 + i) * 0.025, s: 0.85 + 0.15 * backOut(p) };
  };
  const glow = 0.75 + 0.25 * blPulse(time, 2.2);
  if (kicker) {
    const ks = 38 * unit;
    ctx.globalAlpha = fade * span(time, 0.15, 0.4);
    ctx.layer(() => { ctx.fillStyle = BL.cyan; ctx.text(kicker, { x: 0, y: H * 0.07, width: W, align: "center", baseline: "middle", font: `700 ${Math.round(ks)}px Poppins`, letterSpacing: ks * 0.5 }); ctx.applyBlur(10 * unit); });
    ctx.fillStyle = "#ffffff";
    ctx.text(kicker, { x: 0, y: H * 0.07, width: W, align: "center", baseline: "middle", font: `700 ${Math.round(ks)}px Poppins`, letterSpacing: ks * 0.5 });
    ctx.globalAlpha = 1;
  }
  if (number) {
    let ns = 300 * unit; const nw = blMeasure(ctx, number, ns, 0.04);
    if (nw > W * 0.5) ns *= (W * 0.5) / nw;
    blLetters(ctx, number, W / 2, H * 0.43, ns, { track: 0.04, rim: params.numberRim, line: params.numberRim, glow: BL.violet, chars: pop(0.12), pulse: glow });
  }
  if (title) {
    let ts = 170 * unit; const tw = blMeasure(ctx, title, ts, 0.03);
    if (tw > W * 0.68) ts *= (W * 0.68) / tw;
    const hl = String(params.highlight || "").toUpperCase().replace(/\s+/g, " ").trim();
    const words = title.split(" "), hw = hl ? hl.split(" ") : [];
    let from = -1;
    for (let k = 0; hw.length && k + hw.length <= words.length; k++) if (hw.every((w, n) => words[k + n] === w)) { from = k; break; }
    if (from < 0) {
      blLetters(ctx, title, W / 2, H * 0.73, ts, { track: 0.03, rim: params.rim, line: params.rim, glow: BL.magenta, chars: pop(0.3), pulse: glow });
    } else {
      const tw2 = blMeasure(ctx, title, ts, 0.03); let x = W / 2 - tw2 / 2, idx = 0;
      words.forEach((w, k) => {
        const ww = blMeasure(ctx, w, ts, 0.03), hot = k >= from && k < from + hw.length, base = idx, p = pop(0.3);
        blLetters(ctx, w, x + ww / 2, H * 0.73, ts, { track: 0.03, rim: hot ? BL.hl : params.rim, line: hot ? BL.hl : params.rim, glow: hot ? BL.hl : BL.magenta, chars: (i, n) => p(base + i, title.length), pulse: glow });
        x += ww + ts * 0.3 + 0.03 * ts; idx += [...w].length + 1;
      });
    }
  }
  ctx.globalAlpha = 1;
}
