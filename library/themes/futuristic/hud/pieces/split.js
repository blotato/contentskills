import {C, F, hudStage, chamfer, plate, line, ring, text, draw, span, presence, spring, easeOut, typed, flicker} from '../../hud.js';

// A comparison frame: a divider grows from its centre, two labelled plates slide out to either
// side and a badge spins up on the line. The divider is horizontal at `y` (stacked footage) or,
// with `vertical: true`, vertical at `x`. Position it where it does not cross the speaker's face.
export const meta = {duration: 4, live: true};
export const defaults = {a: 'BEFORE', b: 'AFTER', badge: 'VS', y: 960, x: 540, vertical: false, top: 140, bottom: 1560};

export function mount(el, props = defaults) {
  const {root} = hudStage(el, {overlay: true}), V = props.vertical, {x, y, top, bottom} = props, cx = V ? x : 540, cy = V ? (top + bottom) / 2 : y, half = V ? (bottom - top) / 2 : 480;
  const arm = dir => line(root, V ? `M${cx} ${cy}V${cy + dir * half}` : `M${cx} ${cy}H${cx + dir * half}`, C.white, 3), arms = [arm(-1), arm(1)];
  let d = ''; for (let i = -12; i <= 12; i++) { if (!i) continue; const p = i * half / 13, len = i % 4 ? 10 : 22; d += V ? `M${cx - len} ${cy + p}h${len * 2}` : `M${cx + p} ${cy - len}v${len * 2}`; }
  const marks = line(root, d, C.dim, 2), runner = root.append('rect').attr('width', V ? 9 : 60).attr('height', V ? 60 : 9).attr('fill', C.amber);
  const sides = [{label: props.a, color: C.cyan, dir: -1}, {label: props.b, color: C.magenta, dir: 1}].map(s => {
    const w = s.label.length * 44 * .82 + 90, h = 92, g = root.append('g'), slot = root.append('g');
    // Horizontal: A sits above the line on the left, B below it on the right. Vertical: A left of the line, B right, level with the badge.
    const px = V ? (s.dir < 0 ? cx - 90 - w : cx + 90) : (s.dir < 0 ? 60 : 1020 - w), py = V ? cy - h / 2 : (s.dir < 0 ? cy - h - 34 : cy + 34);
    slot.attr('transform', `translate(${px} ${py})`); slot.append(() => g.node());
    plate(g, chamfer(0, 0, w, h, 18), .72); const edge = line(g, chamfer(0, 0, w, h, 18), s.color, 3); line(g, 'M22 20V72', s.color, 8);
    return {...s, g, edge, slide: V ? [-s.dir * 70, 0] : [0, -s.dir * 50], name: text(g, 50, 64, '', {size: 44, font: F.display, weight: 800, color: C.white, spacing: '.02em'})}; });
  const badge = root.append('g'); badge.append('circle').attr('r', 58).attr('fill', C.bg).attr('fill-opacity', .85); const spin = ring(badge, 0, 0, 58, C.amber, 4, '40 14'); ring(badge, 0, 0, 44, C.dim, 2);
  text(badge, 0, 14, props.badge, {size: 40, font: F.display, weight: 900, color: C.amber, anchor: 'middle', spacing: '0'});
  return {
    seek(t) {
      root.attr('opacity', presence(t, props.life)); arms.forEach(a => draw(a, span(t, .05, .6))); marks.attr('opacity', flicker(t, .45) * .9);
      badge.attr('transform', `translate(${cx} ${cy}) scale(${spring(span(t, .3, .6))})`).attr('opacity', span(t, .3, .08)); spin.attr('transform', `rotate(${t * 50})`);
      const u = ((t - .8) / 2.2) % 1, p = (u * 2 - 1) * half; runner.attr('x', V ? cx - 4.5 : cx + p - 30).attr('y', V ? cy + p - 30 : cy - 4.5).attr('opacity', t > .8 && Math.abs(p) > 70 ? Math.sin(u * Math.PI) : 0);
      sides.forEach((s, i) => { const q = easeOut(span(t, .5 + i * .18, .45)); s.g.attr('transform', `translate(${s.slide[0] * (1 - q)} ${s.slide[1] * (1 - q)})`).attr('opacity', flicker(t, .5 + i * .18));
        draw(s.edge, span(t, .5 + i * .18, .45)); s.name.text(typed(s.label, span(t, .65 + i * .18, .35))); });
    },
  };
}
