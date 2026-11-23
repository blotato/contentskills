import {card, C, up, txt, stroke, hand, arrowPath, gradient, clipLive, draw, fade, glide, swell, span} from '../../kit.js';

// One soft line over a faint colour wash: the line draws left to right, dots land as it passes
// and a handwritten note points at the peak.
export const meta = {duration: 5, live: true};
export const defaults = {title: 'Energy through the day', unit: 'Illustrative · how it feels, 1–10', clear: false, accent: 'leaf', note: 'after the walk', min: 0, max: 10,
  points: [{label: '6am', value: 3}, {label: '8am', value: 5.5}, {label: '10am', value: 8.6}, {label: '12pm', value: 7}, {label: '2pm', value: 4.2}, {label: '4pm', value: 6}, {label: '6pm', value: 5}]};

export function mount(el, props = defaults) {
  const st = card(el, props), {root, ink} = st, d3 = window.d3, pts = props.points, n = pts.length, x0 = 130, x1 = 880, y0 = 800, y1 = 360;
  const X = i => x0 + (x1 - x0) * i / (n - 1), Y = v => y0 - (y0 - y1) * (v - props.min) / (props.max - props.min);
  [0, .5, 1].forEach(f => { const v = props.min + (props.max - props.min) * f; stroke(root, `M${x0 - 20} ${Y(v)}H${x1 + 30}`, C.line, f ? 1.5 : 2.5).attr('stroke-dasharray', f ? '2 10' : null); txt(root, x0 - 34, Y(v) + 8, String(Math.round(v)), {size: 21, role: 'label', anchor: 'end', color: C.dim}); });
  const xy = pts.map((p, i) => [X(i), Y(p.value)]), clip = clipLive(st);
  root.append('path').attr('d', d3.area().curve(d3.curveMonotoneX).y0(y0)(xy)).attr('fill', gradient(st, [[ink.accent, 0], [ink.accent, .38]], 90)).attr('clip-path', clip.url);
  const line = stroke(root, d3.line().curve(d3.curveMonotoneX)(xy), C.ink, 6);
  const dots = pts.map((p, i) => { txt(root, X(i), y0 + 50, up(p.label), {size: 21, role: 'label', anchor: 'middle', color: C.soft}); return root.append('circle').attr('cx', X(i)).attr('cy', Y(p.value)).attr('fill', C.paper).attr('stroke', C.ink).attr('stroke-width', 5); });
  const peak = pts.reduce((b, p, i) => p.value > pts[b].value ? i : b, 0), right = peak < n / 2, px = X(peak), py = Y(pts[peak].value);
  dots[peak].attr('fill', ink.accent);
  const nx = px + (right ? 150 : -150), ny = Math.max(290, py - 50), note = hand(root, st, nx, ny, props.note, {size: 54, color: ink.accent, anchor: right ? 'start' : 'end', rot: -4});
  const arrow = stroke(root, arrowPath(nx + (right ? -14 : 14), ny - 8, px + (right ? 26 : -26), py - 10, right ? -.25 : .25), ink.accent, 4.5);
  return {seek(t) {
    st.header(t);
    const q = swell(span(t, .4, 2.2)); draw(line, q); clip.set(x0 - 10, y1 - 60, (x1 - x0 + 20) * q, y0 - y1 + 60);
    dots.forEach((dot, i) => { const s = glide(span(t, .4 + 2.2 * (.12 + .8 * i / (n - 1)), .5)); dot.attr('r', (i === peak ? 15 : 10) * s).attr('opacity', s > 0 ? 1 : 0); });
    note.set(glide(span(t, 2.6, .9))); draw(arrow, glide(span(t, 3.2, .7)));
  }};
}
