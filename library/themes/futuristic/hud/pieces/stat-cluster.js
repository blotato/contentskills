import {C, F, series, hudStage, chamfer, plate, line, text, draw, span, presence, flicker, scramble, noise, easeOut} from '../../hud.js';

// A compact stack of small stats for a corner of the frame. Each value decodes from scrambled
// digits and has a tiny activity meter that keeps moving. `x`, `y` are the top-left corner in
// frame pixels. Supply your own items; the defaults are placeholders.
export const meta = {duration: 4, live: true};
export const defaults = {title: 'SAMPLE STATS', x: 60, y: 960, items: [{label: 'CLIPS POSTED', value: '12'}, {label: 'HOURS SAVED', value: '3.5'}, {label: 'DRAFTS LEFT', value: '4'}]};

export function mount(el, props = defaults) {
  const {root} = hudStage(el, {overlay: true}), w = 420, row = 132, h = 78 + props.items.length * row, g = root.append('g').attr('transform', `translate(${props.x} ${props.y})`);
  plate(g, chamfer(0, 0, w, h, 24), .66); const edge = line(g, chamfer(0, 0, w, h, 24), C.cyan, 3), tab = line(g, 'M0 26V0H150', C.amber, 7);
  const title = text(g, 28, 50, props.title, {size: 24, color: C.amber, spacing: '.22em'});
  const rows = props.items.map((d, i) => { const r = g.append('g').attr('transform', `translate(28 ${78 + i * row})`), color = series[i % series.length];
    const rule = line(r, `M0 0H${w - 56}`, C.dim, 2); text(r, 0, 36, d.label, {size: 24, color: C.white, spacing: '.14em'});
    const bars = Array.from({length: 9}, (_, k) => r.append('rect').attr('x', w - 56 - (9 - k) * 15).attr('width', 10).attr('fill', color));
    return {r, d, i, rule, bars, value: text(r, 0, 108, '', {size: 70, font: F.display, weight: 800, color, spacing: '0'})}; });
  return {
    seek(t) {
      root.attr('opacity', presence(t, props.life)); draw(edge, span(t, 0, .5)); draw(tab, span(t, .2, .3)); title.attr('opacity', flicker(t, .2));
      for (const p of rows) { const at = .4 + p.i * .3; p.r.attr('opacity', flicker(t, at)); draw(p.rule, span(t, at, .35));
        p.value.text(scramble(String(p.d.value), span(t, at + .05, .7), t, '0123456789'));
        p.bars.forEach((b, k) => { const v = (6 + noise(t * 2.6 + k * .7, p.i * 5 + 1) * 46) * easeOut(span(t, at + .2 + k * .03, .3)); b.attr('y', 112 - v).attr('height', v).attr('opacity', k === 8 ? 1 : .6); }); }
    },
  };
}
