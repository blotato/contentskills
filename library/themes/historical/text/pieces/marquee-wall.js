import {C, F, stage, up, oneLine, capH, cardMove, fillOf, span, settle} from '../../kit.js';
import {ticker} from './_cards.js';

// A wall of newsreel tickers: rows of words crawling slowly in alternating directions, by turns
// bold capitals, a crimson band, outlined capitals, a typewritten strip and a serif line.
// `rows` repeat to fill the frame; `speed` scales the crawl.
export const meta = {duration: 6, live: true};
export const defaults = {rows: ['FROM THE ARCHIVE', 'ON THE RECORD', 'DATES AND PLACES', 'PAPERS AND PRINTS', 'THEN AND NOW'], field: 'night', speed: 1};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field}), {root, W, H, ink, sq} = st, n = sq ? 6 : 9, rowH = H * 1.08 / n, g = root.append('g').attr('transform', `rotate(-3 ${W / 2} ${H / 2})`);
  const looks = [{weight: 700, color: ink.text}, {band: ink.bar === 'bone' ? C.bone : C.crimson, weight: 500, color: ink.bar === 'bone' ? '#15181d' : C.bone, mark: ink.bar === 'bone' ? C.crimson : C.blood},
    {weight: 700, color: ink.dim, outline: true}, {band: C.char, font: F.type, weight: 400, color: C.silver, k: .5}, {font: F.italic, weight: 400, color: ink.sub, caps: false, k: .8}];
  const rows = Array.from({length: n}, (_, i) => {
    const look = looks[i % looks.length], raw = oneLine(props.rows[i % props.rows.length]), str = look.caps === false ? raw.charAt(0) + raw.slice(1).toLowerCase() : up(raw), y = -H * .04 + i * rowH, size = rowH * .56 * (look.k ?? 1), o = {font: look.font ?? F.head, weight: look.weight};
    const row = g.append('g'), band = look.band ? row.append('rect').attr('x', -300).attr('y', y + rowH * .12).attr('width', W + 600).attr('height', rowH * .76).attr('fill', look.band) : null;
    const strip = ticker(row, W, str, y + rowH / 2 + capH(size, o) / 2, size, {...o, color: look.color, mark: look.mark ?? ink.accent, outline: look.outline});
    return {row, strip, dir: i % 2 ? 1 : -1, rate: 34 + (i * 37 % 5) * 9};
  });
  return {seek(t) {
    st.live(t); root.attr('transform', cardMove(st, t, {dur: meta.duration, zoom: .05}));
    rows.forEach(({row, strip, dir, rate}, i) => { strip.set(dir * (t * rate * props.speed + i * 173)); row.attr('opacity', settle(span(t, i * .09, .8))); });
  }};
}
