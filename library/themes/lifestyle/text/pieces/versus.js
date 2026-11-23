import {stage, look, C, up, fit, capH, glyphs, settle, txt, cornerLabels, fade, glide, swell, span, drift} from '../../kit.js';

// Two choices, one above the other: a panel in the first accent slides up from below to cover
// the lower half of the paper, each word settles into its half, and a small ink disc with the
// mark in serif italic sits on the seam. Notes sit under each word in caps.
export const meta = {duration: 5, live: true};
export const defaults = {a: 'SLOW', b: 'BUSY', mark: 'or', aNote: 'does less, enjoys it', bNote: 'does more, misses it', labels: ['Pick one', 'No wrong answer'], accents: ['leaf', 'sun']};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'title', accent: props.accents?.[0]}), {root, W, H} = st, A = look(props.accents?.[0]), B = look(props.accents?.[1] ?? 'sun'), m = 90, a = up(props.a), b = up(props.b), flat = s => up(s).replace(/\n/g, ' ');
  const size = Math.min(fit([a, b], W - m * 2, 380), H * .17 / capH(1)), cap = capH(size), panel = root.append('rect').attr('x', 0).attr('width', W).attr('fill', B.accent);
  const upper = root.append('g'), lower = root.append('g'), ya = H * .25 + cap / 2, yb = H * (st.sq ? .75 : .655) + cap / 2 - 20;   // tall frames: stay above the caption line
  const wa = glyphs(upper, a, W / 2, ya, size, {anchor: 'middle', color: C.ink}), wb = glyphs(lower, b, W / 2, yb, size, {anchor: 'middle', color: B.on});
  const na = txt(upper, W / 2, ya + 70, flat(props.aNote), {size: fit(flat(props.aNote), W - m * 2, 28, {role: 'label'}), role: 'label', anchor: 'middle', color: C.soft});
  const nb = txt(lower, W / 2, yb + 70, flat(props.bNote), {size: fit(flat(props.bNote), W - m * 2, 28, {role: 'label'}), role: 'label', anchor: 'middle', color: B.on});
  const r = 92, seal = root.append('g').attr('transform', `translate(${W / 2} ${H / 2})`).append('g'); seal.append('circle').attr('r', r).attr('fill', C.ink); seal.append('circle').attr('r', r - 12).attr('fill', 'none').attr('stroke', A.accent).attr('stroke-width', 3);
  const msize = fit(String(props.mark).toLowerCase(), r * 1.3, 96, {role: 'serif'}); txt(seal, 0, msize * .26, String(props.mark).toLowerCase(), {size: msize, role: 'serif', anchor: 'middle', color: C.cream});
  const corners = cornerLabels(st, props.labels);
  return {
    seek(t) {
      const e = swell(span(t, .1, 1.1)); panel.attr('y', H - (H / 2) * e).attr('height', H / 2 * e + 2);
      settle(wa, span(t, .5, 1.3), 0, .4); settle(wb, span(t, .9, 1.3), 0, .4);
      na.attr('opacity', fade(t, 1.3, .6)); nb.attr('opacity', fade(t, 1.7, .6));
      upper.attr('transform', `translate(0 ${-(drift(t, 1) - 1) * 14})`); lower.attr('transform', `translate(0 ${(drift(t, 1) - 1) * 14})`);
      seal.attr('transform', `scale(${glide(span(t, 1.0, .9))}) rotate(${-8 + 8 * glide(span(t, 1.0, 1.4))})`).attr('opacity', fade(t, 1.0, .4)); corners.set(t, .7);
    },
  };
}
