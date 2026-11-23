import {C, F, hudStage, chamfer, plate, line, text, draw, span, presence, flicker, easeOut, blink} from '../../hud.js';

// A checklist whose boxes tick themselves off: the tick draws, the row lights up and a status
// tag switches on, while the header keeps count. Use `times` (seconds after the overlay starts)
// to tick each row on the word that names it. `x`, `y` are the top-left corner in frame pixels.
export const meta = {duration: 5, live: true};
export const defaults = {title: 'PRE-POST CHECK', done: 'OK', items: ['HOOK IN TWO SECONDS', 'ONE IDEA ONLY', 'CAPTIONS ON', 'CLEAR NEXT STEP'], times: null, x: 70, y: 980};

export function mount(el, props = defaults) {
  const {root} = hudStage(el, {overlay: true}), n = props.items.length, row = 96, w = Math.min(940, Math.max(620, Math.max(...props.items.map(s => s.length)) * 23 + 300)), h = 118 + n * row, g = root.append('g').attr('transform', `translate(${props.x} ${props.y})`);
  plate(g, chamfer(0, 0, w, h, 26), .7); const edge = line(g, chamfer(0, 0, w, h, 26), C.cyan, 3);
  text(g, 34, 60, props.title, {size: 26, color: C.amber, spacing: '.25em'}); const tally = text(g, w - 34, 62, '', {size: 36, font: F.display, weight: 800, color: C.white, anchor: 'end', spacing: '0'});
  line(g, `M34 84H${w - 34}`, C.dim, 4); const meter = line(g, `M34 84H${w - 34}`, C.cyan, 4), length = w - 68;
  const at = i => props.times?.[i] ?? 1 + i * .75;
  const rows = props.items.map((item, i) => { const r = g.append('g').attr('transform', `translate(34 ${112 + i * row})`);
    const fill = r.append('path').attr('d', chamfer(0, 0, 64, 64, 10)).attr('fill', C.cyan), box = line(r, chamfer(0, 0, 64, 64, 10), C.cyan, 3);
    const tick = line(r, 'M14 34L28 48L52 16', C.bg, 8).attr('stroke-linecap', 'butt'), label = text(r, 92, 46, item, {size: 42, font: F.text, weight: 700, color: C.white, spacing: '.03em'});
    const sweep = line(r, `M92 62H${w - 190}`, C.cyan, 2), ok = text(r, w - 68, 44, props.done, {size: 26, color: C.amber, anchor: 'end', spacing: '.1em'}), led = r.append('rect').attr('x', w - 68 - props.done.length * 19 - 30).attr('y', 24).attr('width', 16).attr('height', 16).attr('fill', C.amber);
    return {r, fill, box, tick, label, sweep, ok, led, i}; });
  return {
    seek(t) {
      root.attr('opacity', presence(t, props.life)); draw(edge, span(t, 0, .5));
      let done = 0, progress = 0;
      for (const p of rows) { const since = t - at(p.i), on = since > 0; if (on) done++; progress += easeOut(span(since, 0, .4)) / n;
        p.r.attr('opacity', flicker(t, .3 + p.i * .12)); p.fill.attr('opacity', on ? (since < .3 && blink(t, 10) ? .4 : 1) : 0); p.box.attr('stroke', on ? C.cyan : C.dim);
        draw(p.tick, span(since, .05, .28)); p.tick.attr('opacity', on ? 1 : 0); p.label.attr('opacity', on ? 1 : .5); draw(p.sweep, span(since, .1, .4));
        p.ok.attr('opacity', flicker(t, at(p.i) + .3)); p.led.attr('opacity', flicker(t, at(p.i) + .3)); }
      tally.text(`${done}/${n}`).attr('fill', done === n ? C.amber : C.white); meter.attr('stroke-dasharray', length).attr('stroke-dashoffset', length * (1 - progress));
    },
  };
}
