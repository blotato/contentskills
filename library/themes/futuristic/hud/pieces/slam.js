import {C, F, hudStage, chamfer, plate, line, text, ticks, draw, span, presence, spring, easeOut, typed, hash, flicker} from '../../hud.js';

// One big word that slams into place: it drops in oversized, overshoots and settles, with a
// colour split that snaps together, shock lines firing sideways and an occasional glitch
// afterwards. `y` is the vertical centre in frame pixels.
export const meta = {duration: 3, live: true};
export const defaults = {word: 'CONSISTENCY', kicker: 'THE ONE THING', y: 1180, color: 'cyan'};

export function mount(el, props = defaults) {
  const {root} = hudStage(el, {overlay: true}), color = C[props.color] ?? C.cyan, cx = 540, y = props.y, size = Math.min(300, 940 / (props.word.length * .86)), h = size * 1.5 + 60;
  const back = root.append('g'); plate(back, chamfer(40, y - h / 2, 1000, h, 30), .62);
  const bars = [line(root, `M540 ${y - h / 2}H40M540 ${y - h / 2}H1040`, color, 4), line(root, `M540 ${y + h / 2}H40M540 ${y + h / 2}H1040`, color, 4)];
  const shock = [0, 1, 2].map(k => line(root, '', C.white, 6 - k * 2)), rule = ticks(root, 60, y + h / 2 + 14, 400, 25, C.dim);
  const kicker = text(root, 60, y - h / 2 - 24, '', {size: 30, color: C.amber, spacing: '.3em'}), word = root.append('g');
  const layer = tone => text(word, 0, size * .36, props.word, {size, font: F.display, weight: 900, color: tone, anchor: 'middle', spacing: '.01em'});
  const ghostA = layer(C.magenta), ghostB = layer(C.cyan), main = layer(C.white);
  return {
    seek(t) {
      root.attr('opacity', presence(t, props.life));
      const q = span(t, .08, .5), s = 1 + 1.7 * (1 - spring(q)), jolt = t > .7 && hash(Math.floor(t * 9), 3) > .86 ? 1 : 0, split = 46 * (1 - easeOut(q)) + jolt * 10, shake = 22 * Math.exp(-9 * Math.max(0, t - .3)) * Math.sin(t * 60);
      word.attr('transform', `translate(${cx} ${y + shake}) scale(${s})`).attr('opacity', q > 0 ? 1 : 0);
      ghostA.attr('x', -split).attr('y', size * .36 + jolt * 4).attr('opacity', .85); ghostB.attr('x', split).attr('opacity', .85); main.attr('fill', jolt ? color : C.white);
      back.attr('opacity', span(t, .1, .15)); bars.forEach(b => draw(b, span(t, .28, .4)));
      shock.forEach((l, k) => { const u = span(t, .3 + k * .05, .5), reach = easeOut(u) * 520, off = (k - 1) * size * .34; l.attr('d', `M${cx - reach} ${y + off}h${-90 * (1 - u)}M${cx + reach} ${y + off}h${90 * (1 - u)}`).attr('opacity', u > 0 && u < 1 ? 1 - u : 0); });
      kicker.text(typed(props.kicker, span(t, .5, .4))); draw(rule, span(t, .55, .4));
    },
  };
}
