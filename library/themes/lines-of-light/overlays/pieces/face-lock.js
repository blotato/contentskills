import {C, stage, up, span, ease, io, mix, light, ring, flash, dot, title, mono, faceAt, typed, leave} from '../../kit.js';

// Brackets of light that lock onto the speaker's face and follow it. The four corners draw in from
// a wider box and settle; a red dot marks the lock, a blue flash confirms it, and a leader line
// runs to a label on whichever side has more room. Give `track` [[t, x, y, w, h], ...] or a fixed
// `box` (0..1); in a footage project the player supplies the face position itself (`locate`).
export const meta = {duration: 4, live: true, wantsFaces: true};
export const defaults = {label: 'LOCKED ON', detail: 'THE ONE WHO SHIPS', box: {x: .3, y: .22, w: .4, h: .22}, track: null};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', shade: props.shade}), {root, W, H} = st, len = 60;
  const corners = [0, 1, 2, 3].map(() => light(root, [[0, 0], [0, 0], [0, 0]], {width: 3}));
  const leader = light(root, [[0, 0], [0, 0], [0, 0]], {width: 2}), red = dot(root, 0, 0, {color: 'red', r: 9}), blue = flash(root, 0, 0, {color: 'blue', r: 260});
  const label = root.group(), name = title(label, up(props.label), 0, -4, 30, {anchor: 'start', track: .32, halo: 5}), detail = mono(label, 0, 58, '', {size: 24, track: .12, opacity: 0, halo: 4, weight: 500});
  return {seek(t) {
    const x = leave(t, props.life, .5), tail = ease(x), b = faceAt(props, t), lock = io(span(t, 0, .8)), grow = mix(1.35, 1, lock);
    const w = Math.min(b.w * W * 1.15, W * .62) * grow, h = Math.min(b.h * H * 1.08, w * 1.35), cx = (b.x + b.w / 2) * W, cy = (b.y + b.h / 2) * H, x0 = cx - w / 2, y0 = cy - h / 2;
    [[x0, y0, 1, 1], [x0 + w, y0, -1, 1], [x0 + w, y0 + h, -1, -1], [x0, y0 + h, 1, -1]].forEach(([px, py, sx, sy], i) => corners[i].set([[px, py + sy * len], [px, py], [px + sx * len, py]]).range(tail, ease(span(t, i * .08, .6))));
    red.at(x0, y0).set(ease(span(t, .7, .2)) * (1 - x)); blue.at(cx, cy).set(t > .8 ? .35 * (1 - ease((t - .8) / .9)) * (1 - x) : 0);
    // The label sits above the box on a rule of light that runs up from the top-right corner.
    const lx = Math.max(70, Math.min(W - 430, x0)), ly = Math.max(290, y0 - 110);
    leader.set([[x0 + w, y0 - 14], [x0 + w, ly + 18], [lx, ly + 18]]).range(tail, ease(span(t, .8, .6)));
    label.attr('transform', `translate(${lx} ${ly})`); name.show(ease(span(t, 1.1, .8)), 1 - x);
    detail.select('tspan').text(typed(up(props.detail), span(t, 1.4, .6))); detail.attr('opacity', .9 * (1 - x));
  }};
}
