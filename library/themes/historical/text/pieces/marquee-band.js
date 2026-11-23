import {C, F, stage, tone, fillOf, inkOn, up, oneLine, measure, capH, torn, span, settle, leave, presence} from '../../kit.js';

// A band across the picture that keeps moving, slowly, like a newsreel title strip: the main text
// repeating along a torn band of colour, with a thin charcoal strip above it running the other
// way. Sits below the captions by default.
export const meta = {duration: 4, live: true};
export const defaults = {text: 'NEW CHAPTER', sub: 'OUT NOW', y: 1770, height: 120, color: 'crimson', second: 'char', tilt: -1, speed: 1};

/** The text repeated end to end with a diamond between copies; set(offset) scrolls it. `y` is the baseline. */
function run(g, W, str, y, size, color, o) {
  const unit = up(oneLine(str)), gap = size * 1.3, w = measure(unit, size, o) + gap, n = Math.ceil(W / w) + 3, group = g.append('g'), cap = capH(size, o);
  for (let i = -1; i < n; i++) {
    group.append('text').attr('x', i * w + gap / 2).attr('y', y).attr('fill', color).style('font', `${o.weight} ${size}px ${o.font}`).style('letter-spacing', `${o.spacing}em`).text(unit);
    group.append('path').attr('d', `M${i * w} ${y - cap / 2 - size * .16}l${size * .16} ${size * .16}l${-size * .16} ${size * .16}l${-size * .16} ${-size * .16}Z`).attr('fill', color).attr('opacity', .7);
  }
  return offset => group.attr('transform', `translate(${-((offset % w) + w) % w} 0)`);
}

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {root, W} = st, h = props.height, h2 = h * .44, fill = tone(props.color), second = tone(props.second) === fill ? 'char' : tone(props.second);
  const g = root.append('g'), clipId = 'mq' + Math.round(props.y), thin = g.append('g'), wide = g.append('g');
  thin.append('path').attr('d', torn(-80, -h / 2 - h2 + 6, W + 160, h2, {seed: 3, rough: 3, step: 20, sides: 't'})).attr('fill', fillOf(second));
  wide.append('path').attr('d', torn(-80, -h / 2, W + 160, h, {seed: 5, rough: 5, step: 22, sides: 'tb'})).attr('fill', fillOf(fill));
  if (fill === 'crimson') for (let i = 0; i < 4; i++) wide.append('path').attr('d', `M${-80 + i * 90} ${-h / 2 + h * (.16 + i * .22)}h${W * (.5 + .1 * i)}`).attr('stroke', C.blood).attr('stroke-width', 2 + i % 2 * 2).attr('opacity', .45);
  const o1 = {font: F.head, weight: 700, spacing: .05}, s1 = h * .5 / capH(1, o1), set1 = run(wide, W, props.text, capH(s1, o1) / 2, s1, inkOn(fill), o1);
  const o2 = {font: F.type, weight: 400, spacing: .14}, s2 = h2 * .42 / capH(1, o2), set2 = props.sub ? run(thin, W, props.sub, -h / 2 - h2 / 2 + 6 + capH(s2, o2) / 2, s2, inkOn(second), o2) : null;
  return {seek(t) {
    const x = leave(t, props.life); root.attr('opacity', presence(t, props.life));
    g.attr('transform', `translate(${W / 2} ${props.y + 30 * x}) rotate(${props.tilt}) translate(${-W / 2} 0)`);
    wide.attr('transform', `translate(0 ${30 * (1 - settle(span(t, 0, .7)))})`).attr('opacity', span(t, 0, .4)); thin.attr('transform', `translate(0 ${20 * (1 - settle(span(t, .2, .7)))})`).attr('opacity', props.sub ? span(t, .2, .4) : 0);
    set1(t * 70 * props.speed); set2?.(-t * 44 * props.speed);
  }};
}
