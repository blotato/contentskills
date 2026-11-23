import {C, F, series, line, text, draw, span, easeOut, flicker, hash, comma, mix} from '../../hud.js';
import {card} from './_card.js';

// A funnel whose stages switch on from the top while particles fall through and thin out at
// every step. The taper is fixed per stage; the numbers carry the data.
export const meta = {duration: 4.6, live: true};
export const defaults = {title: 'From view to sale', unit: 'Illustrative · people', clear: false,
  stages: [{label: 'Saw the video', value: 10000}, {label: 'Opened profile', value: 2400}, {label: 'Clicked the link', value: 600}, {label: 'Bought', value: 90}]};

export function mount(el, props = defaults) {
  const {root, frame} = card(el, props), S = props.stages, n = S.length, cx = 340, top = 250, gap = 20, h = (660 - gap * (n - 1)) / n, W = k => 500 - k * (360 / n), first = S[0].value;
  const stages = S.map((d, i) => {
    const y = top + i * (h + gap), a = W(i) / 2, b = W(i + 1) / 2, color = series[i % series.length], g = root.append('g'), share = d.value / first * 100;
    const shape = `M${cx - a} ${y}H${cx + a}L${cx + b} ${y + h}H${cx - b}Z`, fill = g.append('path').attr('d', shape).attr('fill', color).attr('fill-opacity', .14), edge = line(g, shape, color, 3);
    const pct = text(g, cx, y + h / 2 + 15, '', {size: 44, font: F.display, weight: 800, color: C.white, anchor: 'middle', spacing: '0'});
    const lead = line(g, `M${cx + (a + b) / 2 + 12} ${y + h / 2}H640`, color, 2), info = root.append('g');
    text(info, 660, y + h / 2 - 12, d.label.toUpperCase(), {size: Math.min(30, 262 / (d.label.length * .52)), font: F.text, weight: 700, color: C.white, spacing: '.04em'});
    return {d, g, fill, edge, pct, lead, info, share, at: .4 + i * .6, num: text(info, 660, y + h / 2 + 36, '', {size: 42, font: F.display, weight: 800, color, spacing: '0'})};
  });
  const height = n * h + (n - 1) * gap, drops = Array.from({length: 46}, (_, k) => ({k, node: root.append('rect').attr('width', 6).attr('height', 12).attr('fill', C.white)}));
  return {seek(t) {
    draw(frame, span(t, 0, .5));
    for (const s of stages) {
      const q = easeOut(span(t, s.at + .15, .9)); draw(s.edge, span(t, s.at, .55)); s.fill.attr('fill-opacity', flicker(t, s.at + .2) * (.14 + .05 * Math.sin(t * 3 + s.at * 4)));
      s.pct.attr('opacity', flicker(t, s.at + .25)).text((s.share * q >= 10 || s.share * q === 0 ? Math.round(s.share * q) : (s.share * q).toFixed(1)) + '%');
      draw(s.lead, span(t, s.at + .3, .3)); s.info.attr('opacity', flicker(t, s.at + .4)); s.num.text(comma(s.d.value * q));
    }
    // Each particle falls the whole way only if its seed clears every stage's share, so fewer survive lower down.
    for (const {k, node} of drops) {
      const u = (t * .22 + hash(k, 3)) % 1, stage = Math.min(n - 1, Math.floor(u * n)), keep = Math.pow(stages[stage].share / 100, .45), w = mix(W(stage), W(stage + 1), u * n - stage);
      node.attr('x', cx + (hash(k, 5) - .5) * w * .8 - 3).attr('y', top + u * height - 6).attr('opacity', hash(k, 7) < keep && t > stages[stage].at + .4 ? .75 * Math.sin(u * Math.PI) + .2 : 0);
    }
  }};
}
