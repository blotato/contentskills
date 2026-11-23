import {C, glide, span, fade, drift, type} from '../../kit.js';
import {studio} from './_studio.js';

// The theme's frame device in 3D: one clean, sharp card floating over the out-of-focus ground,
// tilting a few degrees as it settles. It carries one word, a hairline and a line of small print.
export const meta = {duration: 6, live: true};
export const defaults = {field: 'noir', accent: 'poppy', word: 'Atelier', kicker: 'Chapter one', note: 'Illustrative · sample card', paper: 'bone', ratio: .76, speed: 1};

export function mount(el, props = defaults) {
  const {T, scene, render, view, shadow, canvasTex, ink, dark} = studio(el, {field: props.field, accent: props.accent, z: 13, fov: 30, width: 6.6, fog: false}), k = 1 / Math.max(.1, props.speed || 1);
  const h = 5.6, w = h * props.ratio, paper = C[props.paper] ?? props.paper, onDark = ['ink', 'coal'].includes(props.paper), fg = onDark ? C.white : C.ink, up = s => String(s ?? '').toUpperCase();
  const tex = canvasTex(Math.round(1024 * props.ratio), 1024, (c, W, H) => {
    c.fillStyle = paper; c.fillRect(0, 0, W, H); const m = 70, set = (role, size) => { const f = type[role]; c.font = `${f.weight} ${size}px ${f.font}`; c.letterSpacing = `${f.spacing * size}px`; };
    c.fillStyle = fg; c.globalAlpha = .6; set('label', 21); let kicker = up(props.kicker); while (kicker.length > 4 && c.measureText(kicker).width > W - m * 2 - 50) kicker = kicker.slice(0, -2); c.fillText(kicker, m, m + 20);
    c.globalAlpha = 1; c.fillStyle = ink.accent; c.beginPath(); c.arc(W - m - 7, m + 12, 8, 0, 7); c.fill();
    let size = 150; set('tall', size); const word = up(props.word); while (size > 40 && c.measureText(word).width > W - m * 2) { size -= 4; set('tall', size); }
    c.fillStyle = fg; c.fillText(word, m - size * .03, H * .6);
    c.globalAlpha = .5; c.fillRect(m, H * .6 + 44, W - m * 2, 2);
    c.globalAlpha = .6; set('label', 19); let note = up(props.note); while (note.length > 4 && c.measureText(note).width > W - m * 2) note = note.slice(0, -2); c.fillText(note, m, H - m);
  });
  const rig = new T.Group(); scene.add(rig);
  const card = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({map: tex, transparent: true})), sh = shadow(w, h, dark ? .7 : .28); sh.position.set(.2, -.3, -.6); rig.add(sh, card);
  return {seek(t) {
    const q = glide(span(t, .05 * k, 1.6 * k)), o = fade(t, 0, .45 * k);
    card.material.opacity = o; sh.material.opacity = (dark ? .7 : .28) * o;
    rig.rotation.set(.1 * (1 - q) + .025 * Math.sin(t * .5), -.5 * (1 - q) - .12 + .05 * Math.sin(t * .37), -.02 * q);
    rig.position.set(0, -.5 * (1 - q) + .05 * Math.sin(t * .6), -2.5 * (1 - q));
    view(0, 0, 1 / drift(t, .04)); render();
  }};
}
