import {filmStage, C, hash} from './_film.js';

// A backdrop: dust motes drifting through a cold shaft of light in a dark room, over a corner of the
// table. Quiet enough to sit behind a title or a Lottie accent. Loops seamlessly.
export const meta = {duration: 8, loop: true};
export const defaults = {motes: 260};

export function mount(el, props = defaults) {
  const {T, scene, camera, mat, mesh, table, play} = filmStage(el, {fov: 40, near: 10, far: 30});
  table(60, -4);
  const beams = [0, 1, 2].map(i => { const m = mesh(new T.PlaneGeometry(5 + i * 2.4, 26), mat(i ? C.steel : C.silver, {glow: 1, opacity: .2 - i * .05, additive: true, side: T.DoubleSide})); m.position.set(-1 + i * .5, 2, -3 - i * 1.5); m.rotation.z = -.5; return m; });
  const n = props.motes, geo = new T.BufferGeometry(), pos = new Float32Array(n * 3), seedOf = i => [hash(i * 1.3), hash(i * 2.7), hash(i * 4.1), hash(i * 6.3)];
  geo.setAttribute('position', new T.BufferAttribute(pos, 3));
  const points = new T.Points(geo, new T.ShaderMaterial({transparent: true, depthWrite: false, blending: T.AdditiveBlending, uniforms: {uSize: {value: 1}},
    vertexShader: 'uniform float uSize; varying float vA; void main() { vec4 mv = modelViewMatrix * vec4(position, 1.); float inBeam = smoothstep(4.5, .5, abs(position.x + position.y * .55 + .2)); vA = .12 + .88 * inBeam; gl_PointSize = uSize * (64. / -mv.z) * (.6 + .8 * fract(position.z * 7.3)); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'varying float vA; void main() { float d = length(gl_PointCoord - .5); gl_FragColor = vec4(vec3(.82, .88, .98) * vA * smoothstep(.5, .1, d), 1.); }'}));
  scene.add(points);
  return play(t => {
    const u = t / meta.duration, w = u * 6.2832;
    for (let i = 0; i < n; i++) { const [a, b, c, d] = seedOf(i), k = 1 + Math.floor(d * 2);           // whole turns per loop keep it seamless
      pos[i * 3] = (a - .5) * 16 + Math.sin(w * k + b * 6.28) * .6; pos[i * 3 + 1] = ((b + u * k + c) % 1 - .5) * -14 + Math.sin(w + a * 6.28) * .3; pos[i * 3 + 2] = (c - .5) * 10 + Math.cos(w * k + a * 6.28) * .5; }
    geo.attributes.position.needsUpdate = true; points.material.uniforms.uSize.value = (el.clientHeight || 600) / 500;
    beams.forEach((m, i) => m.material.uniforms.uOpacity.value = (.2 - i * .05) * (1 + .25 * Math.sin(w + i * 2.1)));
    camera.position.set(Math.sin(w) * .4, .4 + Math.cos(w) * .2, 13); camera.lookAt(0, 0, 0);
  });
}
