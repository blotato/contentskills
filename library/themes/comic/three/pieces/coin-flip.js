import {toonStage, C, hex, starShape, burstShape, cutout, span, spring, clamp} from './_toon.js';

// A big gold coin is flicked up, tumbles and smacks down flat with a burst, a hard shadow tracking
// it on the ground. For money, a decision, a bet, "heads or tails".
export const meta = {duration: 4.5};
export const defaults = {background: 'teal'};

export function mount(el, props = defaults) {
  const bg = C[props.background] ?? C.teal, {T, scene, render, toon, flat, ink} = toonStage(el, {background: bg, dots: bg === C.teal ? '#0d6a68' : C.ink, from: [1, 0], rays: 0});
  const coin = new T.Group(), body = new T.Mesh(new T.CylinderGeometry(1.25, 1.25, .2, 56), toon(C.yellow, C.orange, {hi: C.white})); ink(body, .07); coin.add(body);
  [1, -1].forEach(side => {
    const rim = new T.Mesh(new T.RingGeometry(.98, 1.06, 56), flat(C.ink, {side: T.DoubleSide})); rim.rotation.x = -Math.PI / 2; rim.position.y = side * .104; coin.add(rim);
    const star = cutout(starShape(.62), side > 0 ? C.red : C.blue, {grow: 1.14}); star.rotation.x = -Math.PI / 2 * side; star.position.y = side * .108; coin.add(star);
  });
  scene.add(coin);
  const shadow = new T.Mesh(new T.CircleGeometry(1.25, 48), flat(C.ink)); shadow.scale.set(1, .32, 1); shadow.position.set(.18, -2.05, -1); scene.add(shadow);
  const hit = cutout(burstShape(2.1, {points: 14, depth: .7, seed: 3}), C.white, {grow: 1.05}); hit.position.set(0, -1.2, -1.5); scene.add(hit);
  const rest = .95;      // the coin's resting tilt toward the camera, so its face reads
  return {seek(t) {
    const q = span(t, .3, 2.2), up = 4 * q * (1 - q), land = span(t, 2.5, .5), s = spring(land);
    coin.position.y = -1.2 + up * 2.7 - (q >= 1 ? (1 - s) * .0 : 0);
    coin.rotation.set(rest + (1 - Math.pow(1 - q, 2)) * Math.PI * 8, 0, Math.sin(q * Math.PI) * .25);
    coin.scale.setScalar(spring(span(t, 0, .4)) * (q >= 1 ? 1 + (1 - s) * .18 : 1));
    shadow.scale.set(1 - up * .45, .32 * (1 - up * .45), 1); shadow.visible = t > .1;
    hit.scale.setScalar(Math.max(.001, q >= 1 ? spring(land) * (1 - clamp((t - 3.1) / .5)) : 0)); hit.rotation.z = Math.floor(t * 7) % 2 * .12;
    render();
  }};
}
