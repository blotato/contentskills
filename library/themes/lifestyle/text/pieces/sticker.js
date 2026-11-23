import {stage, look, C, up, fit, capH, measure, txt, blob, fade, glide, span, leave} from '../../kit.js';

// Overlay: a round paper sticker. A soft blob in the accent colour grows in with a disc on top,
// a short word sits in the middle in heavy type and a caps phrase runs slowly around the rim.
// It eases in with a small turn (no bounce) and keeps turning very slowly. `solid` fills the
// disc with the accent; otherwise it is paper. (x, y) is the centre, r the radius.
export const meta = {duration: 4.5, live: true};
export const defaults = {text: 'New', ring: 'Fresh this week', x: 850, y: 340, r: 150, accent: 'leaf', solid: false, tilt: -10};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root, defs, id} = st, ink = look(props.accent), r = props.r, o = {role: 'label'}, flat = s => String(s ?? '').replace(/\n/g, ' ');
  const g = root.append('g').attr('transform', `translate(${props.x} ${props.y})`).append('g'), back = g.append('path').attr('fill', props.solid ? C.paper : ink.accent);
  const disc = g.append('g').attr('filter', st.lift); disc.append('circle').attr('r', r * .86).attr('fill', props.solid ? ink.accent : C.paper);
  const fg = props.solid ? ink.on : C.ink, rr = r * .68, path = `M0 ${-rr}A${rr} ${rr} 0 1 1 -0.01 ${-rr}`; defs.append('path').attr('id', id + '-rim').attr('d', path);
  const phrase = up(flat(props.ring)) + ' • ', one = measure(phrase, 100, o), round = 2 * Math.PI * rr, reps = Math.max(1, Math.round(round / (one * .2))), rsize = Math.min(r * .16, 100 * round / (one * reps));
  const rim = g.append('g'); rim.append('text').attr('fill', fg).style('font', `700 ${rsize}px "Inter Tight"`).style('letter-spacing', `${(round / reps - measure(phrase, rsize, {role: 'label', spacing: 0})) / [...phrase].length}px`).append('textPath').attr('href', `#${id}-rim`).text(phrase.repeat(reps));
  const size = Math.min(fit(flat(props.text), r * 1.0, r * .9), r * .5 / capH(1)); txt(g, 0, capH(size) / 2, flat(props.text), {size, role: 'head', anchor: 'middle', color: fg});
  return {
    seek(t) {
      const x = leave(t, props.life), e = glide(span(t, 0, .9)) * (1 - x);
      g.attr('transform', `rotate(${(props.tilt || 0) - (1 - e) * 40}) scale(${Math.max(.001, e)})`).attr('opacity', fade(t, 0, .3));
      back.attr('d', blob(r * 1.02, 6, t * .7)); rim.attr('transform', `rotate(${t * 9})`);
    },
  };
}
