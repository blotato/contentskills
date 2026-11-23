import {C, F, stage, card, text, label, measure, fit, span, ease, glide, leave} from '../../kit.js';

// A follow button being pressed: a paper pill with a round monogram, the handle in serif and a tracked sub-line; the
// wine "Follow" button turns into an outlined "Following" with a tick at `pressAt`.
// Props: handle, sub, initial, photo (a server path: your picture in the circle instead of the initial), label, done, pressAt,
// x (centre), y (top), w, field, doneColor (fills the pressed button, white type). The handle shrinks to fit beside the button.
export const meta = {duration: 2.4, live: true};
export const defaults = {handle: 'yourhandle', sub: 'Daily notes', initial: 'Y', label: 'Follow', done: 'Following', pressAt: .7, x: 540, y: 270, w: 860, field: 'paper'};

const loadPhoto = url => !url ? Promise.resolve(null) : new Promise(done => {
  const img = new Image(); img.onerror = () => done(null);
  img.onload = () => { const c = document.createElement('canvas'), d = 240; c.width = c.height = d;
    const k = Math.max(d / img.naturalWidth, d / img.naturalHeight), w = img.naturalWidth * k, h = img.naturalHeight * k;
    c.getContext('2d').drawImage(img, (d - w) / 2, (d - h) * .3, w, h); done(c.toDataURL('image/jpeg', .9)); };
  img.src = url;
});

export async function mount(el, props = defaults) {
  const photo = await loadPhoto(props.photo);
  const st = stage(el, {mode: 'overlay'}), w = props.w ?? 860, x = (props.x ?? 540) - w / 2, y = props.y ?? 270, h = 170;
  const cd = card(st, st.root, {x, y, w, h, field: props.field, radius: 85}), f = cd.f, cy = y + h / 2;
  cd.body.append('circle').attr('cx', x + 85).attr('cy', cy).attr('r', 56).attr('fill', f.accent);
  if (photo) {
    const clip = `${st.id}-photo`; st.defs.append('clipPath').attr('id', clip).append('circle').attr('cx', x + 85).attr('cy', cy).attr('r', 53);
    cd.body.append('image').attr('href', photo).attr('x', x + 32).attr('y', cy - 53).attr('width', 106).attr('height', 106).attr('clip-path', `url(#${clip})`);
  } else text(cd.body, x + 85, cy + 26, props.initial ?? 'Y', {font: F.serif, weight: 600, size: 76, anchor: 'middle', color: f.bg});
  const room = w - 37 - 300 - 166 - 28;        // from the handle's start to just before the button
  text(cd.body, x + 166, cy + (props.sub ? 2 : 20), props.handle, {font: F.head, size: fit(props.handle, room, 64, {font: F.head}), color: f.fg});
  if (props.sub) label(cd.body, x + 168, cy + 46, props.sub, {size: 26, color: f.sub});      // short: it shares the row with the button
  const bw = 300, bh = 96, bx = x + w - 37 - bw, by = cy - bh / 2;
  const btn = cd.body.append('rect').attr('x', bx).attr('y', by).attr('width', bw).attr('height', bh).attr('rx', bh / 2).attr('stroke', f.accent).attr('stroke-width', 3);
  const lb = label(cd.body, bx + bw / 2, cy + 12, props.label, {size: 32, anchor: 'middle', track: .14, weight: 700});
  const tick = cd.body.append('path').attr('fill', 'none').attr('stroke', f.accent).attr('stroke-width', 5).attr('stroke-linecap', 'round').attr('stroke-linejoin', 'round').attr('pathLength', 1).attr('stroke-dasharray', 1);
  const life = props.life ?? meta.duration, pa = props.pressAt ?? .7;
  return {seek(t) {
    cd.set({a: span(t, 0, .4), b: leave(t, life, .26)});
    const done = t >= pa, press = 1 - .05 * Math.sin(Math.PI * span(t, pa - .08, .2)), q = glide(span(t, pa, .28)), str = (done ? props.done : props.label) ?? '';
    btn.attr('fill', done ? (props.doneColor ?? f.bg) : f.accent).attr('transform', `translate(${bx + bw / 2} ${cy}) scale(${press.toFixed(3)}) translate(${-(bx + bw / 2)} ${-cy})`);
    const tw = measure(str.toUpperCase(), 32, {font: F.sans, weight: 700, track: .14}), lx = bx + bw / 2 + (done ? 20 : 0);
    lb.attr('fill', done ? (props.doneColor ? '#FFFFFF' : f.accent) : f.bg).attr('x', lx + .14 * 16).select('tspan').attr('x', lx + .14 * 16).text(str.toUpperCase());
    const ax = lx - tw / 2 - 34; tick.attr('d', `M${ax} ${cy + 1}L${ax + 9} ${cy + 11}L${ax + 26} ${cy - 10}`).attr('stroke-dashoffset', done ? 1 - q : 1).attr('stroke', props.doneColor ? '#FFFFFF' : f.accent);
  }};
}
