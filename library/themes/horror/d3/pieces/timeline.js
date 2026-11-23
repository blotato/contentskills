import {card, BOX, C, F, series, up, clamp, span, mix, easeOut, easeInOut, hash, noise, step, lamp, flickerOn, jitter, typed, blink, pad, comma, measure, capH, fit, txt, letters, rough, roughBox, hair, draw, sheet, ekg, linear, radial, clipBox} from './_card.js';

// A night laid out on a vertical line: times typed on the left, what happened on the right, each
// entry switching on in turn. The entry at `mark` is rose.
export const meta = {duration: 6, live: true};
export const defaults = {title: 'The last night', unit: 'Reconstructed · illustrative', events: [{time: '9:40 PM', label: 'LIGHTS OUT'}, {time: '11:15 PM', label: 'FIRST NOISE UPSTAIRS'}, {time: '1:02 AM', label: 'THE DOG WILL NOT SETTLE'}, {time: '3:14 AM', label: 'THE KNOCK'}, {time: '3:15 AM', label: 'NOBODY THERE'}], mark: 3, step: .75};

export function mount(el, props = defaults) {
  const c = card(el, props), g = c.area, ev = props.events, n = ev.length, pitch = (BOX.h - 40) / n, x = BOX.x0 + 250, spine = hair(g, rough(x, BOX.y0 + 10, x, BOX.y1 - 10, 5, 1.5, 60), C.bone, 2, .5);
  const rows = ev.map((e, i) => { const y = BOX.y0 + 30 + i * pitch + pitch / 2, hot = i === props.mark, size = Math.min(42, fit(up(e.label), BOX.x1 - x - 50, 42));
    return {e, hot, time: txt(g, x - 34, y + 10, '', {size: 30, font: F.type, weight: 400, spacing: .04, anchor: 'end', color: hot ? C.rose : C.fog}), dot: g.append('circle').attr('cx', x).attr('cy', y).attr('r', hot ? 11 : 7).attr('fill', hot ? C.rose : C.bone), line: letters(g, up(e.label), x + 40, y + 14, size, {anchor: 'start', marks: false, color: hot ? C.rose : C.bone, seed: 30 + i})}; });
  return {seek(t) {
    c.head(t); draw(spine, easeInOut(span(t, .5, .7 + n * props.step * .8)));
    rows.forEach((r, i) => { const at = .9 + i * props.step; r.time.text(typed(up(r.e.time), span(t, at, .35))); r.dot.attr('opacity', flickerOn(t, at + .1, .2, i) * (r.hot ? lamp(t, 4, .6, 2.4) : 1)); r.line.show(t, {at: at + .2, spread: .35}); });
  }};
}
