import {lightStage, circle, ease, io, span} from './_light.js';

// Orbits of light round a small wire core: tilted rings open one by one, then a comet with a
// fading tail runs each orbit at its own pace. The inner comet is red (the cause); every time it
// completes a lap the core flashes blue. Loops. "Everything revolves around", "the ecosystem", "in orbit".
export const meta = {duration: 8, loop: true};
export const defaults = {clear: false};
const ORB = [{r: 1.7, tx: .5, tz: .35, speed: .5}, {r: 2.4, tx: 1.15, tz: -.45, speed: .25}, {r: 3.1, tx: .3, tz: -.2, speed: .375}, {r: 3.8, tx: .85, tz: .25, speed: .125}];

export function mount(el, props = defaults) {
  const s = lightStage(el, props, {fov: 40, near: 8, far: 16}), {T, scene, camera} = s;
  camera.position.set(0, .8, 11.5); camera.lookAt(0, 0, 0);
  const root = new T.Group(); scene.add(root);
  const core = s.line([circle(.55, 48, 'z'), circle(.55, 48, 'x'), circle(.55, 48, 'y')], {opacity: .9}); root.add(core.obj);
  const fx = s.points(ORB.length + 1, {size: .3}); root.add(fx.obj);
  const orbits = ORB.map((o, i) => {
    const g = new T.Group(); g.rotation.set(o.tx, 0, o.tz); root.add(g);
    const path = circle(o.r, 160, 'y'), twice = [...path, ...path.slice(1)];
    const track = s.line(path, {opacity: .3, echo: false}), comet = s.line(twice, {color: i ? 'core' : 'red', echo: !!i, soft: .06});
    g.add(track.obj, comet.obj); return {o, g, track, comet, i};
  });
  return {seek(t) {
    s.hold(.85);
    core.draw(ease(span(t, 0, 1.2))); root.rotation.y = t * Math.PI * 2 / 16;
    for (const {o, g, track, comet, i} of orbits) {
      track.draw(io(span(t, .3 + i * .3, 1.6)));
      const on = t > 1.5 + i * .3, ph = (t * o.speed + i * .23) % 1, head = .5 + ph * .5;
      comet.range(head - .16, on ? head : 0);
      const a = ph * Math.PI * 2, p = [Math.cos(a) * o.r, 0, Math.sin(a) * o.r];
      const v = new T.Vector3(...p).applyEuler(g.rotation); fx.set(i, v, on ? 1 : 0, i ? .3 : .4, i ? 'core' : 'red');
    }
    const lap = ((t * ORB[0].speed) % 1); fx.set(ORB.length, [0, 0, 0], t > 2 ? .9 * Math.exp(-lap * 6) : 0, 1.6, 'blue');
    s.render(t);
  }};
}
