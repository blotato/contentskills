import {comicStage, C, tone, inkOn, capH, strip, inPanel, span, easeOut, vel} from '../../kit.js';

// A wall of printed bands: every row is a flat colour with an ink rule, its words running
// sideways in alternating directions, the whole wall tilted. The rows shoot in from alternating
// sides. `rows` are the phrases (they repeat down the wall); `accent` picks the panel colour.
export const meta = {duration: 5, live: true};
export const defaults = {rows: ['KEEP MOVING', 'NO PAUSE', 'LOOP IT', 'STAY LOUD', 'ONE MORE TIME'], accent: 'red', speed: 1};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {accent: props.accent}), {W, H, ink} = stage, n = Math.max(5, Math.round(H / 190)) + 2, rh = H * 1.16 / n, size = rh * .6 / capH(1), cap = capH(size), wall = inPanel(stage);
  const tilt = wall.g.append('g').attr('transform', `translate(${W / 2} ${H / 2}) rotate(-6) translate(${-W / 2} ${-H / 2 - rh * 1.1})`);
  const fills = [ink.plate, C.white, ink.alt, C.ink, ink.bg].map(tone);
  const rows = Array.from({length: n}, (_, i) => {
    const g = tilt.append('g').attr('transform', `translate(0 ${i * rh})`), fill = fills[i % fills.length], inner = g.append('g');
    inner.append('rect').attr('x', -W).attr('width', W * 3).attr('height', rh).attr('fill', fill).attr('stroke', C.ink).attr('stroke-width', 8);
    const lettering = fill === C.ink ? {color: C.yellow} : fill === C.white ? {color: ink.plate === C.white ? C.red : ink.plate, outline: size * .07, drop: size * .045} : {color: inkOn(fill) === C.ink ? C.ink : C.white, ...(inkOn(fill) === C.ink ? {} : {outline: size * .07, drop: size * .045})};
    return {inner, s: strip(inner, stage, props.rows[i % props.rows.length], rh / 2 + cap / 2, size, {...lettering, sepColor: fill === C.yellow ? C.white : C.yellow}), dir: i % 2 ? 1 : -1, rate: 90 + (i * 37) % 70};
  });
  wall.ink();
  return {
    seek(t) {
      rows.forEach(({inner, s, dir, rate}, i) => { const q = span(t, i * .05, .5); inner.attr('transform', `translate(${dir * (1 - easeOut(q)) * W * 1.6} 0)`); s.set(-dir * (t * rate * props.speed + i * 130), -dir * vel(q) * 24); });
    },
  };
}
