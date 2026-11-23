import {F, stage, g, text, measure, capH, span, ease, hash} from '../../kit.js';
import {sc, gone, outOf} from './_local.js';

// End-papers: rows of serif and italic drifting slowly in opposite directions between hairlines, set faint like a
// printed pattern; one row at a time comes forward in full colour. Props: rows, speed, field.
export const meta = {duration: 5, live: true};
export const defaults = {rows: ['Keep moving', 'No pause', 'Loop it', 'Stay close', 'One more time'], speed: 1, field: 'paper'};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field}), {W, H, sq} = st, src = [].concat(props.rows ?? []).map(r => sc(r).replace(/\*/g, '')), N = sq ? 5 : 8, pitch = H / N, size = pitch * .8, out = outOf(props);
  const hair = g(st), rows = Array.from({length: N}, (_, i) => {
    const it = i % 2 === 1, font = it ? F.italic : F.head, unit = `${src[i % src.length]}   ·   `, uw = measure(unit, size, {font}), reps = Math.ceil(W / uw) + 2, grp = g(st);
    const node = text(grp, 0, i * pitch + pitch / 2 + capH(size) / 2, unit.repeat(reps), {font, size, color: it ? st.accent : st.fg}).attr('xml:space', 'preserve').style('white-space', 'pre');
    if (i) hair.append('line').attr('x1', 0).attr('x2', W).attr('y1', i * pitch).attr('y2', i * pitch).attr('stroke', st.ruleC).attr('stroke-width', 1.5).attr('stroke-opacity', .28);
    return {grp, node, uw, dir: it ? 1 : -1, v: 44 * (props.speed ?? 1) * (1 + hash(i, 4) * .5), off: hash(i, 9) * uw};
  });
  const beat = .9, order = k => (k * 3 + 1) % N;
  return {seek(t) {
    const q = gone(t, out); hair.attr('opacity', ease(span(t, 0, .5)) * (1 - q));
    rows.forEach((r, i) => {
      const s = (r.off + t * r.v) % r.uw; r.node.attr('transform', `translate(${(r.dir < 0 ? -s : s - r.uw).toFixed(1)} 0)`);
      let on = 0; for (let k = 0; k * beat < meta.duration + beat; k++) if (order(k) === i) on = Math.max(on, ease(span(t, .5 + k * beat, .35)) * (1 - ease(span(t, .5 + (k + 1) * beat, .35))));
      r.grp.attr('opacity', (ease(span(t, i * .05, .45)) * (.2 + .8 * on) * (1 - q)).toFixed(3));
    });
  }};
}
