import {C, stage, look, up, fit, capH, txt, disc, uid, slam, jit, presence, leave} from '../../kit.js';

// A round paper sticker slapped onto the footage: a roughly cut disc with a word in heavy caps,
// a line of typewriter text round the rim, and an inked ring. Lands like a stamp and keeps boiling.
export const meta = {duration: 3.5, live: true};
export const defaults = {text: 'NEW', ring: 'LIMITED RUN', x: 850, y: 340, r: 160, accent: 'red', solid: false, tilt: -12};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {root, defs} = st, ink = look(props.accent), r = props.r, fill = props.solid ? ink.accent : C.bone, fg = props.solid ? ink.on : ink.accent === C.bone ? C.soot : C.red;
  const g = root.append('g'), inner = g.append('g');
  inner.append('path').attr('d', disc(r, 3)).attr('fill', '#000').attr('opacity', .45).attr('transform', 'translate(7 9)'); inner.append('path').attr('d', disc(r + 5, 8)).attr('fill', C.white); inner.append('path').attr('d', disc(r, 3)).attr('fill', fill);
  inner.append('circle').attr('r', r * .86).attr('fill', 'none').attr('stroke', props.solid ? ink.on : C.soot).attr('stroke-width', 4).attr('stroke-dasharray', '14 9');
  const id = uid(st), rr = r * .64; defs.append('path').attr('id', id).attr('d', `M${-rr} 0A${rr} ${rr} 0 1 1 ${rr} 0A${rr} ${rr} 0 1 1 ${-rr} 0`);
  const ring = up(props.ring), text = `${ring} × ${ring} × `, rs = Math.min(r * .19, 2 * Math.PI * rr / (text.length * .62));
  inner.append('text').attr('fill', props.solid ? ink.on : C.soot).style('font', `400 ${rs}px "Special Elite"`).style('letter-spacing', '.06em').append('textPath').attr('href', '#' + id).text(text);
  const size = fit(up(props.text), r * 1.05, r * .62); txt(inner, 0, capH(size) / 2, up(props.text), {size, role: 'head', color: fg, anchor: 'middle'});
  return {seek(t) {
    const s = st.tick(t), k = slam(t, .05), x = leave(t, props.life), j = jit(s, 3, 2 + k.hit * 8, .8 + k.hit * 3);
    g.attr('transform', `translate(${props.x + j.x} ${props.y + j.y}) rotate(${props.tilt + j.r}) scale(${k.s * (x > .5 ? 0 : 1)})`).attr('opacity', k.o * presence(t, props.life));
  }};
}
