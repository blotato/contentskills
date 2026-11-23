import {toonStage, C, hex, label, span, spring, easeOut, rand} from './_toon.js';

// An explainer: comic panels whip in from off the page one at a time and land in a fanned
// stack, each with a shouted word on it. `items` are the words (2-5, short), in order.
export const meta = {duration: 6, live: true};
export const defaults = {items: ['IDEA', 'SCRIPT', 'SHOOT', 'POST'], colors: ['red', 'blue', 'green', 'purple', 'orange'], step: .75};

export function mount(el, props = defaults) {
  const {T, scene, render} = toonStage(el, {background: C.yellow, dots: C.orange, rays: 30, ray: '#ffe566', hole: .28, from: [0, 0]});
  const n = props.items.length, h = Math.min(1.25, 4.6 / n), w = h * 2.1, shades = {red: '#a8121b', blue: '#1946a3', green: '#1f7a40', purple: '#4c2892', orange: '#d25f0d'};
  const cards = props.items.map((text, i) => {
    const name = props.colors[i % props.colors.length], {texture} = label(text, {panel: C[name] ?? name, dots: shades[name] ?? C.ink, color: i % 2 ? C.white : C.yellow, size: 300, w: 1024, h: 488}), g = new T.Group();
    const face = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({map: texture})), shadow = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({color: hex(C.ink)}));
    shadow.position.set(.09, -.09, -.02); g.add(shadow, face); scene.add(g);
    const y = ((n - 1) / 2 - i) * h * .98;
    return {g, home: [(i % 2 ? .22 : -.22) * (w < 2.2 ? 1 : .6), y, i * .12], tilt: (i % 2 ? -1 : 1) * (.05 + rand(i, 3) * .05), from: i % 2 ? 1 : -1, at: .25 + i * props.step};
  });
  return {seek(t) {
    cards.forEach((c, i) => {
      const q = span(t, c.at, .5), s = spring(q), e = easeOut(q);
      c.g.visible = q > 0;
      c.g.position.set(c.home[0] + c.from * (1 - e) * 7, c.home[1] + Math.sin(t * 1.4 + i) * .03, c.home[2]);
      c.g.rotation.set(0, c.from * (1 - e) * 1.1, c.tilt + c.from * (1 - s) * .5);
      c.g.scale.setScalar(.7 + .3 * s);
    });
    render();
  }};
}
