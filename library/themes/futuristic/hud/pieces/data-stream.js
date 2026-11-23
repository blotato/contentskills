import {C, F, hudStage, chamfer, plate, line, text, ticks, draw, span, easeOut, presence, hash, pad, blink} from '../../hud.js';

// A narrow column of scrolling telemetry for the edge of the frame: hex addresses and values
// stream upward, some rows flagged, with a packet counter underneath. Pure decoration — the
// figures are generated. `side` is 'left' or 'right'; `y` is the top edge in frame pixels.
export const meta = {duration: 4, live: true};
export const defaults = {label: 'DATA LINK', side: 'right', y: 940, rows: 11, speed: 2.4, color: 'cyan'};

const HEX = '0123456789ABCDEF', hex = (seed, n) => Array.from({length: n}, (_, i) => HEX[Math.floor(hash(i + 1, seed) * 16)]).join('');

export function mount(el, props = defaults) {
  const {root, defs, id} = hudStage(el, {overlay: true}), color = C[props.color] ?? C.cyan, w = 270, rh = 46, n = props.rows, h = n * rh, x = props.side === 'left' ? 60 : 1080 - 60 - w;
  const g = root.append('g').attr('transform', `translate(${x} ${props.y})`);
  plate(g, chamfer(-16, -70, w + 32, h + 150, 22), .6); const edge = line(g, chamfer(-16, -70, w + 32, h + 150, 22), color, 2);
  const lamp = g.append('rect').attr('x', 0).attr('y', -46).attr('width', 16).attr('height', 16).attr('fill', C.amber), title = text(g, 28, -30, props.label, {size: 24, color: C.amber, spacing: '.18em'});
  line(g, `M0 -12H${w}`, C.dim, 2); const rule = ticks(g, w + 2, 0, h, n * 2, C.dim, true);
  const clip = defs.append('clipPath').attr('id', id + '-rows').append('rect').attr('x', -4).attr('y', 0).attr('width', w + 8), body = g.append('g').attr('clip-path', `url(#${id}-rows)`);
  const rows = Array.from({length: n + 1}, () => { const r = body.append('g'); return {r, label: text(r, 0, 32, '', {size: 26, color}), bar: r.append('rect').attr('y', 12).attr('height', 22).attr('fill', color)}; });
  line(g, `M0 ${h + 12}H${w}`, C.dim, 2); const count = text(g, 0, h + 50, '', {size: 24, color: C.white});
  return {
    seek(t) {
      root.attr('opacity', presence(t, props.life)); draw(edge, span(t, 0, .5)); draw(rule, span(t, .3, .5));
      clip.attr('height', h * easeOut(span(t, .15, .6)));
      const s = t * props.speed, first = Math.floor(s), frac = s - first;
      rows.forEach((row, k) => { const i = first + k, flag = hash(i, 9) > .84, newest = k >= n - 1, tone = flag ? C.amber : newest ? C.white : color, level = 12 + hash(i, 4) * 46;
        row.r.attr('transform', `translate(0 ${(k - frac) * rh})`).attr('opacity', .45 + .55 * Math.min(1, (k - frac + 1) / 3));
        row.label.text(`${hex(i, 4)} ${hex(i + .5, 2)} ${flag ? 'FLAG' : pad(hash(i, 6) * 1000, 3)}`).attr('fill', tone); row.bar.attr('x', w - level).attr('width', level).attr('fill', tone).attr('opacity', .55); });
      lamp.attr('opacity', blink(t, 3) ? 1 : .25); title.attr('opacity', span(t, .2, .1)); count.text(`PKT ${pad(first + 1, 5)}  RX`).attr('opacity', span(t, .5, .1));
    },
  };
}
