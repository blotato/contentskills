import {C, glide, span} from '../../kit.js';
import {softStage, hex} from './_soft.js';

// A handful of photo prints dealt onto the paper one by one, fanning out as they land and then
// turning slowly — memories, a trip, "the highlights". `prints`: scene names (meadow, coast,
// dusk, alley, grove) or image URLs, bottom first (3-6).
export const meta = {duration: 7, live: true};
export const defaults = {prints: ['coast', 'meadow', 'dusk', 'grove', 'alley']};

export function mount(el, props = defaults) {
  const {T, scene, render, view, shadow, print} = softStage(el, {z: 12.5, width: 8.2, y: 0}), n = props.prints.length, loader = new T.TextureLoader();
  const pile = new T.Group(); scene.add(pile); pile.rotation.x = -.5;
  const cards = props.prints.map((name, i) => {
    const g = new T.Group(), paper = new T.Mesh(new T.PlaneGeometry(3, 3.7), new T.MeshBasicMaterial({color: hex(C.cream)}));
    const tex = /[/.]/.test(name) ? loader.load(name, () => render()) : print(name, i + 1); if (tex.colorSpace !== T.SRGBColorSpace) tex.colorSpace = T.SRGBColorSpace;
    const pic = new T.Mesh(new T.PlaneGeometry(2.64, 2.9), new T.MeshBasicMaterial({map: tex})); pic.position.set(0, .22, .004);
    const sh = shadow(2.3, .5); sh.rotation.x = 0; sh.position.set(.12, -.16, -.01); sh.scale.set(1, 1.2, 1);
    g.add(sh, paper, pic); pile.add(g);
    const spread = (i - (n - 1) / 2), home = {x: spread * 1.05, y: Math.abs(spread) * -.22 + .2, r: -spread * .2};
    return {g, home, i};
  });
  return {seek(t) {
    cards.forEach(({g, home, i}) => {
      const e = glide(span(t, .2 + i * .32, 1.3)), fan = glide(span(t, .2 + n * .32, 1.6)), wob = Math.sin(t * .5 + i * 1.3) * .03;
      g.position.set(home.x * (.25 + .75 * fan) + (1 - e) * 5.5, home.y * fan + (1 - e) * 1.2, i * .03 + (1 - e) * 2.5);
      g.rotation.z = home.r * (.3 + .7 * fan) + wob + (1 - e) * -.7; g.visible = t > .2 + i * .32;
    });
    pile.rotation.z = Math.sin(t * .22) * .05; pile.rotation.x = -.5 + .12 * glide(span(t, 0, 5));
    view(Math.sin(t * .2) * .08, 0, 1.05 - .05 * glide(span(t, 0, 6))); render();
  }};
}
