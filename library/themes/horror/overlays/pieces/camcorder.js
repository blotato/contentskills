import {C, F, stage, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, comma, timecode, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, ekg, brackets, clipBox, clipPath, linear, radial} from '../../kit.js';

// Found-footage camcorder frame: corner brackets, a blinking REC light and running timecode at the
// top, date, tape mode and battery at the bottom, and a tracking line that rolls through now and
// then. Everything stays at the edges.
export const meta = {duration: 6, live: true};
export const defaults = {label: 'REC', date: 'OCT 31 1998', clock: '02:14', mode: 'SP', note: 'NIGHT MODE', battery: .35, inset: 56, startSeconds: 760};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root, W, H} = st, m = props.inset, o = {font: F.vhs, weight: 400, spacing: .06, halo: 8};
  const shade = (y, flip) => root.append('rect').attr('y', y).attr('width', W).attr('height', 280).attr('fill', linear(st, flip ? [[0, '#000', 0], [1, '#000', .6]] : [[0, '#000', .6], [1, '#000', 0]])); shade(0); shade(H - 280, true);
  const frame = hair(root, brackets(m, m, W - m * 2, H - m * 2, 90), C.bone, 5, .9);
  const dot = root.append('circle').attr('cx', m + 62).attr('cy', m + 76).attr('r', 17).attr('fill', C.rose), rec = txt(root, m + 96, m + 96, up(props.label), {...o, size: 68});
  const code = txt(root, W - m - 44, m + 96, '', {...o, size: 68, anchor: 'end'}), date = txt(root, m + 44, H - m - 50, up(props.date), {...o, size: 60}), clock = txt(root, m + 44, H - m - 116, '', {...o, size: 60});
  const mode = txt(root, W - m - 44, H - m - 50, up(props.mode) + '  ▶', {...o, size: 60, anchor: 'end'}), note = txt(root, W - m - 44, H - m - 116, up(props.note), {...o, size: 44, anchor: 'end', color: C.fog});
  const bx = W / 2 - 60, by = m + 50, batt = root.append('g'); batt.append('rect').attr('x', bx).attr('y', by).attr('width', 110).attr('height', 50).attr('fill', 'none').attr('stroke', C.bone).attr('stroke-width', 5); batt.append('rect').attr('x', bx + 112).attr('y', by + 14).attr('width', 10).attr('height', 22).attr('fill', C.bone);
  const cell = batt.append('rect').attr('x', bx + 9).attr('y', by + 9).attr('height', 32).attr('width', 92 * clamp(props.battery)).attr('fill', props.battery < .4 ? C.rose : C.bone);
  const band = root.append('rect').attr('width', W).attr('height', 46).attr('fill', st.fill('static')).attr('opacity', 0);
  return {seek(t) {
    root.attr('opacity', presence(t, props.life, 1)); const [jx, jy] = jitter(t, 1, 7); frame.attr('transform', `translate(${jx} ${jy})`);
    dot.attr('opacity', blink(t, .8)); code.text(timecode(t, props.startSeconds)); clock.text(`${props.clock}:${pad((t + 7) % 60)}`); cell.attr('opacity', props.battery < .4 ? .4 + .6 * blink(t, 1.5) : 1);
    const k = Math.floor(t / 2.3), q = t / 2.3 - k, on = hash(k, 3) < .7 && q < .5; band.attr('opacity', on ? .75 : 0).attr('y', (hash(k, 4) < .5 ? .02 + q * .4 : .98 - q * .4) * H).attr('transform', `translate(${-hash(step(t), 5) * 200} 0)`).attr('width', W + 200);
  }};
}
