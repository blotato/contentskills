import {textStage, capH, strip, clipBox, span, spring, easeOut, hash, vel} from '../kit.js';

// A wall of marquee strips, one phrase per row, scrolling in alternating directions with every
// other copy mirrored. Some rows are plain, some ruled, some inverted (a filled band with dark
// text). Rows open one after another and never stop moving. `rows` repeat down the frame.
export const meta = {duration: 5, live: true};
export const defaults = {rows: ['KEEP MOVING', 'NO PAUSE', 'LOOP IT', 'STAY LOUD', 'ONE MORE TIME'], accent: 'cyan', speed: 1};

export function mount(el, props = defaults) {
  const stage = textStage(el, {accent: props.accent, frame: false}), {root, W, H, ink} = stage, n = Math.max(5, Math.round(H / 174)), rh = H / n, size = rh * .56 / capH(1), cap = capH(size);
  // [band: 'fill' | 'rule' | null, band colour, text colour, opacity of the mirrored copies]
  const looks = [[null, null, ink.text, 1], ['fill', ink.accent, ink.on, 1], [null, null, ink.accent, .3], ['rule', ink.alt, ink.alt, 1], [null, null, ink.text, .3], ['fill', ink.third, ink.on, 1], ['rule', ink.accent, ink.text, .5]];
  const rows = Array.from({length: n}, (_, i) => {
    const [band, tint, color, ghost] = looks[i % looks.length], g = root.append('g').attr('transform', `translate(0 ${(i + .5) * rh})`).append('g').attr('clip-path', clipBox(stage, -20, -rh / 2, W + 40, rh));
    if (band === 'fill') g.append('rect').attr('x', -20).attr('y', -rh / 2 + 6).attr('width', W + 40).attr('height', rh - 12).attr('fill', tint);
    if (band === 'rule') g.append('path').attr('d', `M-20 ${-rh / 2 + 8}H${W + 20}M-20 ${rh / 2 - 8}H${W + 20}`).attr('stroke', tint).attr('stroke-width', 4);
    return {g, text: strip(g, stage, props.rows[i % props.rows.length], cap / 2, size, {color, ghost}), dir: i % 2 ? -1 : 1, rate: 110 + hash(i, 4) * 150};
  });
  return {
    seek(t) {
      rows.forEach((row, i) => {
        const q = span(t, .05 + i * .07, .55), kick = (1 - easeOut(q)) * 1400;
        row.g.attr('transform', `scale(1 ${spring(q)})`).attr('opacity', q > 0 ? 1 : 0);
        row.text.set(row.dir * (t * row.rate * props.speed + kick + i * 137), -row.dir * vel(q) * 10);
      });
    },
  };
}
