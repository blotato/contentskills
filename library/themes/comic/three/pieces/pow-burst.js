import {toonStage, C, burstShape, sparkShape, starShape, cutout, span, spring, boil, rand} from './_toon.js';

// An impact: three jagged bursts stacked in depth pop out of the page one after another and rock
// in space, a star lands on top, and sparks circle the lot over turning zoom lines. For "boom",
// "big news", "it worked".
export const meta = {duration: 5, live: true};
export const defaults = {colors: ['red', 'yellow', 'white'], star: 'blue', background: 'blue'};

export function mount(el, props = defaults) {
  const bg = C[props.background] ?? C.blue, {T, scene, render, setTurn} = toonStage(el, {background: bg, dots: bg === C.blue ? '#1946a3' : C.ink, rays: 34, ray: bg === C.blue ? C.sky : C.white, hole: .2, from: [1, 0]});
  const rig = new T.Group(); scene.add(rig);
  // Each layer exists in three slightly different drawings; the boil swaps between them.
  const layers = [1.62, 1.22, .84].map((r, i) => {
    const group = new T.Group(), frames = [0, 1, 2].map(k => { const c = cutout(burstShape(r, {points: 13 - i, depth: .6 + i * .03, seed: i * 5 + k * 13 + 1}), C[props.colors[i]] ?? props.colors[i], {grow: 1.07 + i * .02, depth: .16, side: C.ink, shadow: i ? 0 : .1}); group.add(c); return c; });
    group.position.z = -.5 + i * .45; rig.add(group); return {group, frames};
  });
  const star = cutout(starShape(.5), C[props.star] ?? props.star, {grow: 1.16, depth: .14}); star.position.z = .95; rig.add(star);
  const sparks = Array.from({length: 7}, (_, i) => { const s = cutout(sparkShape(.16 + rand(i, 3) * .16), i % 2 ? C.white : C.yellow, {grow: 1.3}); scene.add(s); return s; });
  return {seek(t) {
    setTurn(t * .25);
    const b = boil(t);
    layers.forEach(({group, frames}, i) => {
      frames.forEach((f, k) => { f.visible = (b + i) % 3 === k; });
      group.scale.setScalar(Math.max(.001, spring(span(t, .1 + i * .16, .5))) * (1 + .03 * Math.sin(t * 5 + i)));
      group.rotation.z = Math.sin(t * 1.1 + i * 1.7) * .16 + (i - 1) * .12;
    });
    star.scale.setScalar(Math.max(.001, spring(span(t, .65, .5)))); star.rotation.z = Math.sin(t * 2.2) * .25; star.rotation.y = Math.sin(t * 1.6) * .5;
    rig.rotation.set(Math.sin(t * .8) * .22, Math.sin(t * .6 + 1) * .5, 0);
    sparks.forEach((s, i) => {
      const a = t * (.5 + rand(i, 5) * .5) * (i % 2 ? 1 : -1) + i * .9, r = 1.75 + rand(i, 7) * .45;
      s.position.set(Math.cos(a) * r, Math.sin(a) * r * 1.25, 1.2); s.rotation.z = t * 2 * (i % 2 ? 1 : -1);
      s.scale.setScalar(Math.max(.001, spring(span(t, .8 + i * .08, .4))) * (1 + .3 * Math.sin(t * 7 + i * 2)));
    });
    render();
  }};
}
