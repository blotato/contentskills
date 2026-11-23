import {comicStage, C, look, up, wrap, capH, measure, txt, inked, rectPath, inkOn, spark, scaleTo, span, spring, leave} from '../../kit.js';

// The narrator's box: a flat rectangle with an ink line and hard shadow that pops into a corner
// and letters its text on, a line at a time, like a typewriter. (x, y) is its top-left corner.
// `lead` is the bold opening word(s) set in the plate face (MEANWHILE..., LATER...).
export const meta = {duration: 4, live: true};
export const defaults = {lead: 'MEANWHILE...', text: 'Back at the desk, the upload bar was not moving.', x: 60, y: 150, width: 720, size: 42, accent: 'yellow', rate: 34};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {overlay: true}), {root} = stage, ink = look(props.accent), o = {role: 'hand'}, size = props.size, pad = 26, lsize = size * 1.25;
  const lines = wrap(up(props.text), size, props.width - pad * 2, o), cap = capH(size, o), pitch = size * 1.22, lcap = props.lead ? capH(lsize, {role: 'slab'}) + 20 : 0;
  const w = Math.max(...lines.map(l => measure(l, size, o)), props.lead ? measure(up(props.lead), lsize, {role: 'slab'}) : 0) + pad * 2, h = lcap + cap + (lines.length - 1) * pitch + pad * 2;
  const g = root.append('g').attr('transform', `translate(${props.x + w / 2} ${props.y + h / 2})`).append('g'); inked(g, rectPath(-w / 2, -h / 2, w, h), {fill: ink.accent, width: 6, drop: 10});
  const on = inkOn(ink.accent), lead = props.lead ? txt(g, -w / 2 + pad, -h / 2 + pad + lcap - 20, up(props.lead), {size: lsize, role: 'slab', color: on === C.ink ? C.red : C.yellow}) : null;
  let count = 0; const rows = lines.map((line, i) => { const from = count; count += line.length; return {line, from, node: txt(g, -w / 2 + pad, -h / 2 + pad + lcap + cap + i * pitch, '', {size, role: 'hand', color: on})}; });
  const star = spark(g, w / 2, -h / 2, 30, C.white);
  return {
    seek(t) {
      const x = leave(t, props.life), typed = Math.max(0, (t - .45) * props.rate);
      scaleTo(g, spring(span(t, 0, .42)) * (1 - x), -1.5);
      lead?.attr('opacity', span(t, .25, .08));
      rows.forEach(r => r.node.say(r.line.slice(0, Math.max(0, Math.round(typed - r.from)))));
      scaleTo(star, spring(span(t, .5, .4)) * (1 + .18 * Math.sin(t * 6)), t * 60);
    },
  };
}
