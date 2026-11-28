/* @borumi
{
  "formatVersion": 1,
  "name": "Psychedelic wipe reveal",
  "category": "title",
  "tags": ["wipe", "reveal", "before after", "background", "talking head", "psychedelic", "blacklight", "neon", "trippy"],
  "sizing": "frame",
  "duration": 2,
  "fps": 60,
  "previewAt": 1.8,
  "defaultPlacement": { "fallback": { "horizontal": "stretch", "vertical": "stretch", "inset": 0 } },
  "parameters": {
    "left": { "type": "text", "level": 1, "order": 0, "multiline": true, "default": "VIDEO\nEDITING", "label": "Left words (one per line)", "maxLength": 60 },
    "right": { "type": "text", "level": 1, "order": 1, "multiline": true, "default": "FOREVER", "label": "Right words (one per line)", "maxLength": 60 },
    "times": { "type": "text", "level": 1, "order": 2, "default": "0.95, 1.27, 1.67", "label": "Word times (seconds: left lines, then right)", "maxLength": 80 },
    "wipe": { "type": "text", "level": 1, "order": 3, "default": "0.5, 0.6", "label": "Wipe start, length (seconds)", "maxLength": 20 },
    "layer": { "type": "text", "level": 2, "order": 0, "default": "back", "label": "Layer: back (scene, use behind subject) or line (glow, in front)", "maxLength": 8 },
    "background": { "type": "media", "level": 2, "order": 1, "accept": ["image"], "default": null, "label": "Background art (bg-forest)" },
    "mushroomsLeft": { "type": "media", "level": 2, "order": 2, "accept": ["image"], "default": null, "label": "Mushrooms left" },
    "mushroomsRight": { "type": "media", "level": 2, "order": 3, "accept": ["image"], "default": null, "label": "Mushrooms right" },
    "jellyfishA": { "type": "media", "level": 2, "order": 4, "accept": ["image"], "default": null, "label": "Jellyfish A" },
    "jellyfishB": { "type": "media", "level": 2, "order": 5, "accept": ["image"], "default": null, "label": "Jellyfish B" },
    "sparkle": { "type": "media", "level": 2, "order": 6, "accept": ["image"], "default": null, "label": "Sparkle sprite" }
  }
}
*/

// Before/after wipe for a talking-head opener, blacklight poster style. A neon
// line sweeps left to right; behind it the room is replaced by the painted
// moonlit mushroom forest (slow parallax, pulsing moon glow, drifting painted
// jellyfish, painted mushrooms in the corners, twinkling sparkles), and words
// slam in on either side of the speaker in dark-blue neon lettering. Use two
// segments over the same range: layer "back" with behind-subject on, and
// layer "line" on top.
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
export function render({ ctx, media, time: t, duration, width: W, height: H, params }) {
  const unit = Math.min(W, H) / 1080;
  const wp = String(params.wipe || "").split(",").map((v) => parseFloat(v));
  const wipeAt = isNaN(wp[0]) ? 0.5 : wp[0], wipeLen = isNaN(wp[1]) || wp[1] <= 0 ? 0.6 : wp[1];
  const p = span(t, wipeAt, wipeAt + wipeLen);
  if (p <= 0) return;
  const e = p * p * (3 - 2 * p);
  const tilt = 90 * unit;
  const x = -tilt - 40 * unit + (W + 2 * tilt + 80 * unit) * e;

  if (String(params.layer || "back").trim().toLowerCase() === "line") {
    if (p >= 1) return;
    const edge = (half, color, shift) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x + tilt - half + shift, 0);
      ctx.lineTo(x + tilt + half + shift, 0);
      ctx.lineTo(x - tilt + half + shift, H);
      ctx.lineTo(x - tilt - half + shift, H);
      ctx.closePath();
      ctx.fill();
    };
    const fade = Math.min(1, p * 8, (1 - p) * 8);
    ctx.layer(() => { edge(40 * unit, borumi.withAlpha(BL.violet, 0.6 * fade), 0); ctx.applyBlur(30 * unit); });
    edge(6 * unit, borumi.withAlpha(BL.coral, 0.85 * fade), -34 * unit);
    edge(10 * unit, borumi.withAlpha(BL.cyan, 0.8 * fade), 34 * unit);
    edge(12 * unit, borumi.withAlpha(BL.hot, 0.8 * fade), 0);
    edge(5 * unit, borumi.withAlpha("#ffffff", fade), 0);
    return;
  }

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.lineTo(x + tilt, 0);
  ctx.lineTo(x - tilt, H);
  ctx.lineTo(-10, H);
  ctx.closePath();
  ctx.clip();

  ctx.fillStyle = BL.deep;
  ctx.fillRect(0, 0, W, H);
  blPlate(ctx, blPic(media, params.background), W, H, t, 8, 0.08, unit);
  blGlow(ctx, W * 0.52, H * 0.27, H * 0.45, BL.cyan, 0.55 + 0.45 * blPulse(t, 2.6));
  blJelly(ctx, blPic(media, params.jellyfishA), W * 0.375, H * 0.05, H * 0.28, t, 1, 0.9);
  blJelly(ctx, blPic(media, params.jellyfishB), W * 0.665, H * 0.08, H * 0.25, t, 2, 0.9);
  blStars(ctx, blPic(media, params.sparkle), 16, { x: W * 0.03, y: H * 0.02, w: W * 0.94, h: H * 0.55 }, t, unit, 7, 1);
  const shift = (t - 1) * -14 * unit;
  blGround(ctx, blPic(media, params.mushroomsLeft), W * 0.09, H + 40 * unit, H * 0.6, t, 0.012, shift);
  blGround(ctx, blPic(media, params.mushroomsRight), W * 0.91, H + 40 * unit, H * 0.56, t, 0.012, shift);
  blSpots(ctx, [[W * 0.075 + shift, H * 0.55, 26], [W * 0.93 + shift, H * 0.6, 24]], t, unit);

  // Words: left and right of the speaker.
  const lines = (v) => String(v || "").toUpperCase().split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean).slice(0, 3);
  const L = lines(params.left), R = lines(params.right);
  const given = String(params.times || "").split(",").map((v) => parseFloat(v)).filter((v) => !isNaN(v));
  const at = (i) => (i < given.length ? given[i] : (given.length ? given[given.length - 1] : wipeAt + wipeLen) + 0.3 * (i - given.length + 1));
  const colW = W * 0.26;
  const all = L.concat(R);
  if (all.length) {
    let size = H * 0.17;
    const widest = Math.max(...all.map((l) => blMeasure(ctx, l, size, 0.03)));
    if (widest > colW) size *= colW / widest;
    const row = size * 1.12;
    const glow = 0.75 + 0.25 * blPulse(t, 2);
    const column = (list, cx, offset, rimC, glowC, rot) => {
      ctx.save();
      ctx.translate(cx, H * 0.2 + size * 0.4);
      ctx.rotate((rot * Math.PI) / 180);
      list.forEach((l, i) => {
        const q = span(t, at(offset + i), at(offset + i) + 0.26);
        if (q <= 0) return;
        const k = borumi.easeOut(q), s = 1.45 + (1 - 1.45) * k;
        ctx.save();
        ctx.translate(0, i * row + Math.sin(t * 2.4 + i) * 4 * unit - 50 * (1 - k) * unit);
        ctx.scale(s, s);
        blLetters(ctx, l, 0, 0, size, { track: 0.03, rim: rimC, line: rimC === BL.cyan ? BL.hot : rimC, glow: glowC, pulse: glow, chars: () => ({ a: Math.min(1, q * 5), dx: 0, dy: 0, rot: 0 }) });
        ctx.restore();
      });
      ctx.restore();
    };
    column(L, W * 0.165, 0, BL.cyan, BL.magenta, -4);
    column(R, W * 0.835, L.length, BL.hl, BL.cyan, 4); // right word = the emphasis, highlighter
  }
  ctx.restore();
  void duration;
}
