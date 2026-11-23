import {C, F, hudStage, line, text, brackets, draw, span, flicker, clamp, easeOut} from '../../hud.js';

// A 3D bar chart drawn with d3: a grid of glowing columns on a floor plane, seen from above at an angle while
// the camera slowly circles it. Columns rise from the floor in a ripple from the centre, then breathe on a
// travelling wave. Drawn full frame (1080x1920) on the theme's dark grid, so it works as a cutaway.
// Plain SVG projection (yaw, pitch, perspective); columns and their faces are painted back to front.
export const meta = {duration: 6};
export const defaults = {title: 'Views by day and hour', unit: 'Illustrative · 3D bar chart', size: 7, turn: 70, seed: 3};

export function mount(el, props = defaults) {
  const p = {...defaults, ...props}, d3 = window.d3, N = p.size, W = 1080, H = 1920, cx = 540, cy = 1090;
  const {svg, root, defs, id} = hudStage(el, {overlay: true});
  el.style.background = C.bg;
  const grid = defs.append('pattern').attr('id', id + '-g').attr('width', 54).attr('height', 54).attr('patternUnits', 'userSpaceOnUse');
  grid.append('path').attr('d', 'M54 0H0V54').attr('fill', 'none').attr('stroke', C.grid).attr('stroke-width', 1);
  svg.insert('rect', ':first-child').attr('width', W).attr('height', H).attr('fill', `url(#${id}-g)`).attr('opacity', .5);

  const frame = line(root, brackets(60, 300, 960, 1420, 80), C.cyan, 4);
  text(root, 110, 410, p.title.toUpperCase(), {size: Math.min(56, 860 / (p.title.length * .8)), font: F.display, weight: 800, color: C.white, spacing: '.03em'});
  text(root, 110, 458, p.unit.toUpperCase(), {size: 24, color: C.amber, spacing: '.22em'});
  line(root, 'M110 486H970', C.dim, 2);
  const readout = text(root, 970, 1660, '', {size: 26, color: C.cyan, anchor: 'end', spacing: '.12em'});
  const legend = text(root, 110, 1660, 'LOW', {size: 22, color: C.teal, spacing: '.2em'});
  text(root, 330, 1660, 'HIGH', {size: 22, color: C.magenta, spacing: '.2em'});
  const ramp = defs.append('linearGradient').attr('id', id + '-r');
  [[0, C.teal], [.5, C.cyan], [.8, C.magenta], [1, C.amber]].forEach(([o, c]) => ramp.append('stop').attr('offset', o).attr('stop-color', c));
  root.append('rect').attr('x', 190).attr('y', 1645).attr('width', 130).attr('height', 12).attr('fill', `url(#${id}-r)`);

  // Data: a smooth seeded surface, so neighbouring columns relate like a real heatmap.
  const rnd = (i, j) => { const x = Math.sin((i * 12.9898 + j * 78.233 + p.seed * 37.719) * 43758.5453); return x - Math.floor(x); };
  const value = (i, j) => clamp(.18 + .5 * Math.exp(-((i - N * .62) ** 2 + (j - N * .35) ** 2) / (N * 1.1)) + .3 * Math.exp(-((i - N * .2) ** 2 + (j - N * .8) ** 2) / (N * .7)) + .14 * rnd(i, j), .08, 1);
  const color = d3.scaleLinear().domain([.15, .4, .62, .85]).range([C.teal, C.cyan, C.magenta, C.amber]).clamp(true);

  const floorG = root.append('g'), barsG = root.append('g'), S = 92, GAP = .22, HMAX = 520, half = N * S / 2;
  const floor = line(floorG, '', C.grid, 2), edge = line(floorG, '', C.teal, 3);
  const bars = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const g = barsG.append('g'), v = value(i, j), c = d3.color(color(v));
    const faces = [0, 1, 2, 3, 4].map(k => g.append('path').attr('stroke', k === 4 ? c.brighter(1.2) : c.brighter(.4)).attr('stroke-width', 1.4).attr('stroke-linejoin', 'round')
      .attr('fill', k === 4 ? c : c.darker(k % 2 ? 1.6 : 1.0)).attr('fill-opacity', 1));
    bars.push({i, j, v, g, faces, x0: i * S - half + S * GAP / 2, z0: j * S - half + S * GAP / 2, w: S * (1 - GAP), delay: Math.hypot(i - N / 2 + .5, j - N / 2 + .5) * .08});
  }

  return {seek(t) {
    draw(frame, span(t, 0, .5));
    const yaw = (-35 + p.turn * t / meta.duration) * Math.PI / 180, pitch = 34 * Math.PI / 180, cyaw = Math.cos(yaw), syaw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const proj = (x, y, z) => { const xr = x * cyaw - z * syaw, zr = x * syaw + z * cyaw, yr = y * cp + zr * sp, zz = zr * cp - y * sp, s = 1500 / (1500 + zz); return [cx + xr * s, cy - yr * s, zz]; };
    const path = pts => 'M' + pts.map(q => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('L') + 'Z';
    let fl = ''; for (let k = 0; k <= N; k++) { const a = k * S - half; fl += path([proj(a, 0, -half), proj(a, 0, half)]).slice(0, -1) + path([proj(-half, 0, a), proj(half, 0, a)]).slice(0, -1); }
    floor.attr('d', fl).attr('opacity', span(t, .1, .4) * .9);
    edge.attr('d', path([proj(-half, 0, -half), proj(half, 0, -half), proj(half, 0, half), proj(-half, 0, half)])).attr('opacity', flicker(t, .1));
    let peak = 0;
    for (const b of bars) {
      const grow = easeOut(span(t, .25 + b.delay, .7)), wave = .82 + .18 * Math.sin(t * 2.4 - (b.i + b.j) * .55), h = Math.max(2, HMAX * b.v * wave * grow);
      peak = Math.max(peak, b.v * wave * grow);
      const {x0, z0, w} = b, P = [[x0, z0], [x0 + w, z0], [x0 + w, z0 + w], [x0, z0 + w]];
      const lo = P.map(([x, z]) => proj(x, 0, z)), hi = P.map(([x, z]) => proj(x, h, z));
      const quads = [[lo[0], lo[1], hi[1], hi[0]], [lo[1], lo[2], hi[2], hi[1]], [lo[2], lo[3], hi[3], hi[2]], [lo[3], lo[0], hi[0], hi[3]], hi];
      // Faces back to front inside the column (a convex box, so centroid depth is enough).
      quads.map((q, k) => ({k, z: q.reduce((a, r) => a + r[2], 0) / 4})).sort((a, c) => c.z - a.z)
        .forEach(({k}) => { b.faces[k].attr('d', path(quads[k])); b.g.node().appendChild(b.faces[k].node()); });
      b.depth = proj(x0 + w / 2, h / 2, z0 + w / 2)[2];
      b.g.attr('opacity', grow > 0 ? 1 : 0);
    }
    bars.sort((a, b) => b.depth - a.depth); for (const b of bars) barsG.node().appendChild(b.g.node());
    readout.text(`PEAK ${Math.round(peak * 100)}K · ROT ${Math.round(((yaw * 180 / Math.PI) % 360 + 360) % 360)}°`).attr('opacity', flicker(t, .6));
    legend.attr('opacity', span(t, .5, .3));
  }};
}
