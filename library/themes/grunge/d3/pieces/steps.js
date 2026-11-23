import {C, span, hold, txt, scrawl, scribble, brush, clipLive, easeOut, up, fit, capH, measure} from '../../kit.js';
import {card} from './_card.js';

// A to-do list scrawled on the wall: boxes drawn by hand, ticked off in red one by one; the step being ticked sits on a lime stroke.
export const meta = {duration: 4.2};
export const defaults = {title: 'The plan', unit: 'Illustrative · in this order', done: 3, clear: false,
  items: ['Find the hook', 'Write it short', 'Shoot one take', 'Post it today']};

export function mount(el, props = defaults) {
  const {st, body, fine, ink, intro, top} = card(el, props), items = props.items.slice(0, 6).map(up), n = items.length, pitch = Math.min(150, (915 - top) / n), bs = Math.min(70, pitch * .52), size = Math.min(pitch * .42, fit(items, 680, 60)), cap = capH(size), done = props.done ?? n;
  const rows = items.map((label, i) => {
    const y = top + 26 + i * pitch + pitch / 2, hot = i === done - 1, reveal = clipLive(st), w = measure(label, size);
    const mark = hot ? body.append('path').attr('d', brush(206, y - cap * .95, w + 40, cap * 1.9, {seed: i + 3, dry: 0})).attr('fill', C.lime).attr('fill-rule', 'evenodd').attr('clip-path', reveal.url) : null;
    const box = scrawl(body, s => scribble.box(96, y - bs / 2, bs, bs, s), {color: C.bone, width: 6, seed: i * 4 + 1});
    const tick = i < done ? scrawl(body, s => scribble.check(96 + bs / 2, y - 4, bs * .46, s), {color: ink.accent, width: 11, seed: i * 4 + 2}) : null;
    return {y, box, tick, mark, reveal, w, hot, text: txt(fine, 226, y + cap / 2, label, {size, role: 'head', color: hot ? C.soot : i < done ? C.bone : C.dust}), num: txt(fine, 916, y + 9, `0${i + 1}`, {size: 23, anchor: 'end', color: C.dust})};
  });
  return {seek(t) {
    const s = intro(t), h = hold(t), step = Math.min(.5, 2.2 / n);
    rows.forEach(({y, box, tick, mark, reveal, w, hot, text, num}, i) => { const at = .5 + i * .14; box.draw(span(h, at, .25), s); text.attr('opacity', h >= at + .1 ? 1 : 0); num.attr('opacity', h >= at + .1 ? 1 : 0);
      const ta = .5 + n * .14 + .2 + i * step; tick?.draw(span(h, ta, .2), s); if (hot) text.attr('fill', h >= ta + .2 ? C.soot : C.bone); if (mark) reveal.set(180, y - 90, (w + 110) * easeOut(span(h, ta + .1, .25)), 180); });
  }};
}
