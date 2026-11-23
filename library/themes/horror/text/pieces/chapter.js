import {C, F, stage, fieldOf, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, brackets, cornerLabels, clipBox, linear} from '../../kit.js';

// A chapter card: the number huge and barely there, in outline, behind a small tracked "chapter"
// line and the title. `mark` from other themes is ignored.
export const meta = {duration: 5, live: true};
export const defaults = {number: '02', kicker: 'Chapter', title: 'THE BASEMENT', note: 'WHERE THE SOUND\nWAS COMING FROM', labels: ['SECTION', 'KEEP WATCHING', '', 'PT. 02'], mark: '', field: 'slate'};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field}), {root, W, H, k} = st, m = 110, number = String(props.number), title = up(props.title);
  const nsize = Math.min(fit(number, W * .8, 900, {spacing: 0}), H * .5), ncap = capH(nsize), cy = H * .49;
  const ghost = txt(root, W / 2, cy + ncap / 2, number, {size: nsize, font: F.head, weight: 400, anchor: 'middle', spacing: 0, color: 'none'}).attr('stroke', C.fog).attr('stroke-width', 3).attr('mask', st.wear);
  const tsize = Math.min(fit(title, W - m * 2, 140), H * .08), tcap = capH(tsize), head = letters(root, title, W / 2, cy + tcap / 2, tsize, {seed: 5});
  const kick = txt(root, W / 2, cy - tcap * .9 - 56, up(oneLine(props.kicker)) + ' ' + number, {size: 30 + 6 * k, anchor: 'middle', color: C.rose, spacing: .5, weight: 600});
  const note = txt(root, W / 2, cy + tcap / 2 + 84, up(props.note), {size: 28 + 4 * k, anchor: 'middle', color: C.fog, spacing: .3, leading: 1.6}), corners = cornerLabels(st, props.labels);
  return {seek(t) {
    st.tick(t); ghost.attr('opacity', .55 * lamp(t, 6, .9, 1.6) * span(t, 0, 1.2)).attr('transform', `translate(${W / 2} ${cy}) scale(${1 + t * .012}) translate(${-W / 2} ${-cy})`);
    kick.attr('opacity', flickerOn(t, .4, .3, 1)); head.show(t, {at: .8, spread: .8}); note.attr('opacity', flickerOn(t, 2.1, .3, 2) * .85); corners(t, 1.4);
  }};
}
