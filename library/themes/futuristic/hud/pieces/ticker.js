import {C, F, hudStage, chamfer, plate, line, text, ticks, draw, span, presence, flicker, blink, easeOut} from '../../hud.js';

// A ticker tape across the frame: a labelled tab on the left and items scrolling past forever,
// separated by slashes. `y` is the top edge in frame pixels; `speed` is pixels per second.
export const meta = {duration: 6, live: true};
export const defaults = {label: 'LIVE', items: ['SAMPLE HEADLINE GOES HERE', 'SECOND ITEM IN THE QUEUE', 'THIRD ITEM · REPLACE WITH YOUR OWN'], y: 1640, speed: 170, color: 'cyan'};

export function mount(el, props = defaults) {
  const {root, defs, id} = hudStage(el, {overlay: true}), color = C[props.color] ?? C.cyan, h = 92, tab = props.label.length * 30 + 92, g = root.append('g').attr('transform', `translate(0 ${props.y})`);
  plate(g, `M0 0H1080V${h}H0Z`, .74); const rails = [line(g, 'M0 0H1080', color, 3), line(g, `M1080 ${h}H0`, color, 3)], rule = ticks(g, tab + 20, -22, 1040 - tab, 60, C.dim);
  defs.append('clipPath').attr('id', id + '-tape').append('rect').attr('x', tab + 14).attr('y', 0).attr('width', 1080 - tab - 14).attr('height', h);
  const tape = g.append('g').attr('clip-path', `url(#${id}-tape)`), copies = [0, 1].map(() => { const node = text(tape, 0, 62, '', {size: 42, font: F.text, weight: 700, color: C.white, spacing: '.05em'});
    for (const item of props.items) { node.append('tspan').text(item); node.append('tspan').attr('fill', C.amber).attr('dx', 28).text('//'); node.append('tspan').attr('dx', 28).text(''); } return node; });
  // Measured once at mount (fonts are loaded by then); the estimate covers a detached element.
  const length = (copies[0].node().getComputedTextLength() || props.items.join('').length * 25 + props.items.length * 90) + 28;
  const head = g.append('g'); head.append('path').attr('d', `M0 0H${tab - 24}L${tab} ${h / 2}L${tab - 24} ${h}H0Z`).attr('fill', C.amber);
  const lamp = head.append('circle').attr('cx', 38).attr('cy', h / 2).attr('r', 10).attr('fill', C.bg); text(head, 62, 60, props.label, {size: 36, font: F.display, weight: 900, color: C.bg, spacing: '.04em'});
  return {
    seek(t) {
      root.attr('opacity', presence(t, props.life)); rails.forEach(r => draw(r, span(t, 0, .5))); draw(rule, span(t, .3, .5));
      head.attr('transform', `translate(${-tab * (1 - easeOut(span(t, .1, .4)))} 0)`); lamp.attr('opacity', blink(t, 1.5) ? 1 : .2);
      const off = (Math.max(0, t - 1) * props.speed) % length; copies.forEach((c, k) => c.attr('x', tab + 40 - off + k * length).attr('opacity', flicker(t, .4)));
    },
  };
}
