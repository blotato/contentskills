import {C, F, stage, g, text, label, measure, capH, fieldOf, span, glide, ease, leave} from '../../kit.js';
import {sc, labelW} from './_local.js';

// A running band across the footage: a paper strip between two hairlines wipes in from the left; the phrase runs
// slowly through it, alternately in upright serif and accent italic; a small ink tab at the left holds the sub line.
// Props: text, sub, y (centre), height, speed, tilt, field (paper|ink|wine|stone|blush).
export const meta = {duration: 4, live: true};
export const defaults = {text: 'New episode', sub: 'Out now', y: 1330, height: 104, speed: 1, tilt: 0, field: 'paper'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), W = 1080, f = fieldOf(props.field ?? 'paper'), h = Math.max(72, props.height ?? 104), y = (props.y ?? 1330) - h / 2, str = sc(props.text).replace(/\*/g, '');
  const cid = st.uid('band'), cr = st.defs.append('clipPath').attr('id', cid).append('rect').attr('x', -40).attr('y', y - 4).attr('height', h + 8), band = g(st).attr('clip-path', `url(#${cid})`);
  const outer = band.append('g'); if (props.tilt) outer.attr('transform', `rotate(${props.tilt} ${W / 2} ${y + h / 2})`);
  outer.append('rect').attr('x', -60).attr('y', y).attr('width', W + 120).attr('height', h).attr('fill', f.bg).attr('fill-opacity', .96);
  for (const yy of [y + 9, y + h - 9]) outer.append('line').attr('x1', -60).attr('x2', W + 60).attr('y1', yy).attr('y2', yy).attr('stroke', f.fg).attr('stroke-width', 1.5);
  const size = Math.max(40, (h - 18) * .68), by = y + h / 2 + capH(size) / 2 - 1, dot = '   ·   ', run = outer.append('g');
  const wa = measure(str + dot, size), wb = measure(str + dot, size, {font: F.italic}), P = wa + wb, reps = Math.ceil(W / P) + 2;
  for (let i = 0; i < reps; i++) { text(run, i * P, by, str + dot, {size, color: f.fg}).attr('xml:space', 'preserve').style('white-space', 'pre'); text(run, i * P + wa, by, str + dot, {font: F.italic, size, color: f.accent}).attr('xml:space', 'preserve').style('white-space', 'pre'); }
  const tw = props.sub ? labelW(props.sub, 28) + 52 : 0, tab = props.sub ? outer.append('g') : null, tf = f.dark ? fieldOf('paper') : fieldOf('ink');
  if (tab) { tab.append('rect').attr('x', -60).attr('y', y).attr('width', 70 + tw + 60).attr('height', h).attr('fill', tf.bg); label(tab, 70 + 14, y + h / 2 + 10, props.sub, {size: 28, color: tf.fg}); }
  const life = props.life ?? meta.duration;
  return {seek(t) {
    const a = glide(span(t, 0, .5)), b = ease(leave(t, life, .3));
    cr.attr('x', -40 + (W + 80) * b).attr('width', Math.max(0, (W + 80) * (a - b)));
    run.attr('transform', `translate(${(-((t * 80 * (props.speed ?? 1)) % P)).toFixed(1)} 0)`); tab?.attr('opacity', ease(span(t, .3, .3)));
  }};
}
