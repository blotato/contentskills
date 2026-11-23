import {clamp, span, easeInOut} from '../../kit.js';

// Spatial windows: frosted app windows hang in the air around the speaker at different depths, turned toward
// them like a headset's workspace. Each flies in from far behind (staggered), settles with a small overshoot,
// then floats; its contents come alive (a count runs up, a bar fills, a chart grows). Drawn with HTML and CSS
// 3D transforms (one perspective for the whole frame), 1080x1920, a pure function of t.
// Two layers so windows can sit behind the speaker: put the piece in twice, once {"layer": "back"} with
// "behind": "person" and once {"layer": "front"}; or once with layer "all" (nothing behind the speaker).
// The glass is smoked (it reads on light walls and dark rooms alike), with a bright hairline edge and a soft shadow
// (the footage under an overlay cannot be blurred).
// Shared piece: every theme can use it. It wears the theme's look: its fonts, its corner radius, and its accent
// colour on the live parts (the progress bar, the tallest chart bar). "accent" in props overrides the colour.
export const meta = {duration: 3.2};

const STATS = {kind: 'stat', label: 'Instagram · 30 days', value: 1240000, unit: 'views', delta: '+38%'};
export const defaults = {
  layer: 'all', stagger: .14, fly: .7,
  windows: [
    {...STATS, x: 50, y: 250, w: 370, h: 320, z: 90, ry: 18, layer: 'front'},
    {kind: 'claude', title: 'Claude', line: 'Editing your reel', note: '12 effects · 46 s', x: 664, y: 236, w: 370, h: 280, z: 70, ry: -18, layer: 'front'},
    {kind: 'player', title: 'reel_final.mp4', note: '214K plays', x: 40, y: 640, w: 330, h: 500, z: 0, ry: 22, layer: 'back'},
    {kind: 'bars', title: 'Top reels', values: [.45, .72, .58, 1, .66], x: 716, y: 590, w: 330, h: 380, z: 0, ry: -22, layer: 'back'},
    {kind: 'pill', title: 'REC', note: '4K', x: 390, y: 236, w: 300, h: 96, z: -80, ry: 0, layer: 'back'},
  ],
};

const stack = name => `${name ? `'${name}', ` : ''}'Inter Tight', 'Inter', system-ui, sans-serif`;
const css = (el, o) => { Object.assign(el.style, o); return el; };
const div = (parent, o = {}, text) => { const d = css(document.createElement('div'), o); if (text != null) d.textContent = text; parent.append(d); return d; };
const back = x => { x = clamp(x); const c = 1.6; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const short = n => n >= 1e6 ? (n / 1e6).toFixed(2).replace(/0$/, '') + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : String(Math.round(n));

function glassCard(parent, w, skin) {
  return div(parent, {position: 'absolute', left: w.x + 'px', top: w.y + 'px', width: w.w + 'px', height: w.h + 'px', borderRadius: (w.kind === 'pill' ? w.h / 2 : skin.radius) + 'px',
    background: 'linear-gradient(150deg, rgba(92,96,112,.62), rgba(46,48,60,.56) 50%, rgba(30,32,44,.6))',
    border: '2px solid rgba(255,255,255,.5)', boxShadow: '0 30px 70px rgba(5,10,26,.38), inset 0 2px 0 rgba(255,255,255,.35), inset 0 -24px 48px rgba(255,255,255,.06)',
    overflow: 'hidden', fontFamily: skin.body, color: '#fff', textShadow: '0 1px 8px rgba(5,10,26,.28)', boxSizing: 'border-box', padding: '26px 28px',
    transformOrigin: '50% 50%', willChange: 'transform, opacity'});
}

/** Builds one window's contents; returns set(q) for its live parts (q = 0..1 progress after it lands). */
function contents(card, w, skin) {
  const small = (txt, o = {}) => div(card, {fontSize: '22px', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', opacity: .86, ...o}, txt);
  if (w.kind === 'stat') {
    small(w.label);
    const num = div(card, {fontFamily: skin.head, fontSize: '92px', fontWeight: skin.headWeight, letterSpacing: '-.03em', lineHeight: 1, marginTop: '18px'});
    small(w.unit, {fontSize: '24px', textTransform: 'none', letterSpacing: 0, fontWeight: 500, marginTop: '6px'});
    const chip = div(card, {display: 'inline-block', marginTop: '16px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(46,204,113,.85)', fontSize: '24px', fontWeight: 700}, w.delta);
    const svgNS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(svgNS, 'svg'), path = document.createElementNS(svgNS, 'path');
    css(svg, {position: 'absolute', right: '22px', bottom: '26px', width: '130px', height: '60px', overflow: 'visible'});
    path.setAttribute('d', 'M0 52 L18 44 L34 47 L52 30 L70 34 L88 18 L106 22 L130 4'); path.setAttribute('fill', 'none'); path.setAttribute('stroke', '#fff');
    path.setAttribute('stroke-width', '5'); path.setAttribute('stroke-linecap', 'round'); path.setAttribute('stroke-linejoin', 'round'); path.setAttribute('pathLength', '1');
    path.setAttribute('stroke-dasharray', '1 1'); svg.append(path); card.append(svg);
    return q => { num.textContent = short(w.value * easeInOut(q)); chip.style.opacity = q > .6 ? 1 : 0; path.setAttribute('stroke-dashoffset', String(1 - easeInOut(q))); };
  }
  if (w.kind === 'claude') {
    const head = div(card, {display: 'flex', alignItems: 'center', gap: '12px', fontSize: '28px', fontWeight: 700});
    div(head, {width: '40px', height: '40px', borderRadius: '12px', background: '#D97757', color: '#fff', fontSize: '30px', lineHeight: '40px', textAlign: 'center'}, '✳');
    div(head, {}, w.title);
    const line = div(card, {fontSize: '34px', fontWeight: 600, marginTop: '30px', letterSpacing: '-.01em'});
    const bar = div(card, {height: '12px', borderRadius: '6px', background: 'rgba(255,255,255,.3)', marginTop: '22px', overflow: 'hidden'}), fill = div(bar, {height: '100%', background: skin.accent, borderRadius: '6px', width: '0%'});
    small(w.note, {marginTop: '16px', fontSize: '20px'});
    return (q, t) => { line.textContent = w.line + '.'.repeat(1 + Math.floor(t * 3) % 3); fill.style.width = Math.round(12 + 80 * easeInOut(q)) + '%'; };
  }
  if (w.kind === 'player') {
    css(card, {padding: '0'});
    const art = div(card, {position: 'absolute', inset: '0', background: w.image ? `center/cover url(${w.image})` : 'linear-gradient(170deg, #ff8a5c, #c13b8a 55%, #3b2a8f)', opacity: .9});
    div(card, {position: 'absolute', left: '50%', top: '42%', width: '104px', height: '104px', marginLeft: '-52px', marginTop: '-52px', borderRadius: '52px', background: 'rgba(255,255,255,.3)', border: '2px solid rgba(255,255,255,.7)'});
    div(card, {position: 'absolute', left: '50%', top: '42%', marginLeft: '-12px', marginTop: '-24px', width: 0, height: 0, borderTop: '24px solid transparent', borderBottom: '24px solid transparent', borderLeft: '38px solid #fff'});
    const foot = div(card, {position: 'absolute', left: '24px', right: '24px', bottom: '22px'});
    div(foot, {fontSize: '24px', fontWeight: 700}, w.title);
    div(foot, {fontSize: '20px', fontWeight: 500, opacity: .88, marginTop: '4px'}, '▶ ' + w.note);
    const track = div(foot, {height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,.35)', marginTop: '14px'}), head = div(track, {height: '100%', borderRadius: '3px', background: '#fff', width: '0%'});
    return (q, t) => { head.style.width = (20 + 30 * clamp(t / 3)) + '%'; art.style.transform = `scale(${1.04 + .04 * Math.sin(t * .9)})`; };
  }
  if (w.kind === 'bars') {
    small(w.title);
    const row = div(card, {position: 'absolute', left: '28px', right: '28px', bottom: '28px', height: (w.h - 110) + 'px', display: 'flex', alignItems: 'flex-end', gap: '16px'});
    const bars = w.values.map((v, i) => div(row, {flex: 1, borderRadius: '10px 10px 4px 4px', background: i === w.values.indexOf(Math.max(...w.values)) ? skin.accent : 'rgba(255,255,255,.5)', height: '0%'}));
    return q => bars.forEach((b, i) => { b.style.height = Math.round(w.values[i] * 100 * easeInOut(span(q, i * .08, .6))) + '%'; });
  }
  // pill: a recording chip
  css(card, {display: 'flex', alignItems: 'center', gap: '16px', padding: '0 30px'});
  const dot = div(card, {width: '24px', height: '24px', borderRadius: '12px', background: '#ff3b30', boxShadow: '0 0 18px #ff3b30'});
  div(card, {fontSize: '30px', fontWeight: 800, letterSpacing: '.08em'}, w.title);
  const clock = div(card, {fontSize: '24px', fontWeight: 500, opacity: .9}, w.note);
  return (q, t) => { dot.style.opacity = Math.floor(t * 2) % 2 ? .35 : 1; clock.textContent = `${w.note} · 00:${String(Math.floor(t + 12)).padStart(2, '0')}`; };
}

export function mount(el, props = defaults, {look = {}} = {}) {
  const p = {...defaults, ...props};
  const skin = {accent: p.accent ?? look.accent ?? '#fff', body: stack(look.body), head: stack(look.head ?? look.body), headWeight: look.headWeight ?? 800,
    radius: Math.max(14, Math.min(48, look.radius ?? 38))};
  css(el, {position: 'relative', width: '1080px', height: '1920px', overflow: 'hidden', background: 'transparent'});
  const world = div(el, {position: 'absolute', inset: '0', perspective: '1500px', perspectiveOrigin: '540px 700px', transformStyle: 'preserve-3d'});
  const wins = p.windows.map((w, i) => ({w, i})).filter(({w}) => p.layer === 'all' || (w.layer ?? 'front') === p.layer)
    .map(({w, i}) => { const card = glassCard(world, w, skin); return {w, i, card, set: contents(card, w, skin), seed: i * 1.7}; });
  return {seek(t) {
    for (const {w, i, card, set, seed} of wins) {
      const a = i * p.stagger, q = span(t, a, p.fly), land = back(q), o = clamp(q * 2.2);
      const z = (w.z ?? 0) - 900 * (1 - land), ry = (w.ry ?? 0) * (1 + .5 * (1 - land)), rx = 8 * (1 - land);
      const fy = Math.sin(t * 1.3 + seed) * 8, fry = Math.sin(t * .9 + seed) * 2.5;
      card.style.transform = `translate3d(0, ${fy.toFixed(2)}px, ${z.toFixed(1)}px) rotateY(${(ry + fry).toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg)`;
      card.style.opacity = o.toFixed(3);
      set(span(t, a + p.fly * .6, 1.4), t);
    }
  }};
}
