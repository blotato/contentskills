import {glowStage, rand} from './_fx.js';
import {span, easeOut} from '../../hud.js';

// A planet drawn as a cloud of points — bright where a noise field says "land" — wrapped in a rim of
// atmosphere, with comets of data arcing between hubs on its surface. The far side shows through, dimmed.
// "global", "the network", "connections", "traffic between regions". The land shapes are abstract, not Earth.
export const meta = {duration: 8};
const N = 17000, HUBS = 13, ARCS = 18, STEPS = 150;

export function mount(el) {
  const {T, scene, camera, mat, geo, fit, play} = glowStage(el, {fov: 34, glow: 1.1});
  const R = 2.6, globe = new T.Group(); scene.add(globe);
  const uniforms = {uIn: {value: 0}};
  const surface = [];
  for (let i = 0; i < N; i++) { const y = 1 - 2 * (i + .5) / N, r = Math.sqrt(1 - y * y), a = i * 2.399963; surface.push(R * r * Math.cos(a), R * y, R * r * Math.sin(a)); }
  const facing = `float facing(vec3 p, vec4 mv) { return dot(normalize(normalMatrix * normalize(p)), normalize(-mv.xyz)); }`;
  globe.add(new T.Points(geo({position: [surface, 3]}), mat(facing + /* glsl */`
    uniform float uIn; varying vec3 vCol; varying float vA;
    void main() {
      vec3 n = normalize(position); float land = smoothstep(-.02, .08, fbm(n * 1.55 + 4.2) + .12 * noise(n * 6.));
      vec4 mv = modelViewMatrix * vec4(position, 1.); float f = facing(position, mv), front = smoothstep(-.15, .25, f);
      float sweep = exp(-abs(fract(n.y * .5 + .5 - uTime * .16) - .5) * 30.);          // a scan line climbing the globe
      vCol = mix(TEAL, CYAN, land) + WHITE * sweep * .8;
      vA = (mix(.1, .85, land) + sweep * .5) * mix(.14, 1., front) * step(n.y * .5 + .5, uIn * 1.05);
      gl_PointSize = mix(.022, .05, land) * (1. + sweep) * uPx / -mv.z; gl_Position = projectionMatrix * mv;
    }`, `varying vec3 vCol; varying float vA; void main() { gl_FragColor = vec4(vCol * sprite(gl_PointCoord) * vA, 1.); }`, uniforms)));

  const air = new T.Mesh(new T.SphereGeometry(R * 1.03, 64, 48), mat(`varying vec3 vN, vV; void main() { vec4 mv = modelViewMatrix * vec4(position, 1.); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`, /* glsl */`
    uniform float uIn; varying vec3 vN, vV;
    void main() { float f = 1. - max(dot(normalize(vN), normalize(vV)), 0.); gl_FragColor = vec4((CYAN * pow(f, 3.2) * .9 + MAGENTA * pow(f, 7.) * .5 + TEAL * .025) * uIn, 1.); }`, uniforms));
  scene.add(air);

  const hubs = Array.from({length: HUBS}, (_, i) => { const y = (rand(i * 3 + 1) - .5) * 1.5, a = i / HUBS * 6.2832 + rand(i + 40), r = Math.sqrt(1 - y * y); return new T.Vector3(r * Math.cos(a), y, r * Math.sin(a)); });
  const apos = [], ainfo = [];
  for (let k = 0; k < ARCS; k++) {
    const a = hubs[k % HUBS], b = hubs[(k * 5 + 3 + (k >> 2)) % HUBS], angle = a.angleTo(b), seed = rand(k + 77);
    if (angle < .2) continue;
    for (let i = 0; i <= STEPS; i++) { const u = i / STEPS, p = a.clone().multiplyScalar(Math.sin((1 - u) * angle)).addScaledVector(b, Math.sin(u * angle)).normalize().multiplyScalar(R * (1.01 + Math.sin(u * Math.PI) * angle * .2));
      apos.push(p.x, p.y, p.z); ainfo.push(u, seed, k); }
  }
  globe.add(new T.Points(geo({position: [apos, 3], aInfo: [ainfo, 3]}), mat(facing + /* glsl */`
    attribute vec3 aInfo; uniform float uIn; varying vec3 vCol; varying float vA;
    void main() {
      float u = aInfo.x, seed = aInfo.y, start = 1.2 + seed * 3.;
      float drawn = step(u, (uTime - start) / .9);                              // the arc draws itself once...
      float q = fract((uTime - start) * (.3 + .2 * seed)) * 1.5, tail = q - u;  // ...then comets run along it
      float comet = step(0., tail) * exp(-tail * 7.) * step(start, uTime);
      vec4 mv = modelViewMatrix * vec4(position, 1.); float front = mix(.2, 1., smoothstep(-.2, .2, facing(position, mv)));
      vCol = mod(aInfo.z, 3.) < .5 ? MAGENTA : AMBER; vCol = mix(vCol, WHITE, comet * .7);
      vA = drawn * (.2 + comet * 1.3) * front;
      gl_PointSize = (.045 + .09 * comet) * uPx / -mv.z; gl_Position = projectionMatrix * mv;
    }`, `varying vec3 vCol; varying float vA; void main() { gl_FragColor = vec4(vCol * sprite(gl_PointCoord) * vA, 1.); }`, uniforms)));
  globe.add(new T.Points(geo({position: [hubs.flatMap(h => [h.x * R * 1.01, h.y * R * 1.01, h.z * R * 1.01]), 3], aSeed: [hubs.map((_, i) => rand(i + 9)), 1]}), mat(facing + /* glsl */`
    attribute float aSeed; uniform float uIn; varying float vA, vPulse;
    void main() { vec4 mv = modelViewMatrix * vec4(position, 1.); vA = mix(.15, 1., smoothstep(-.1, .2, facing(position, mv))) * step(.9 + aSeed, uTime);
      vPulse = fract(uTime * .7 + aSeed); gl_PointSize = .55 * uPx / -mv.z; gl_Position = projectionMatrix * mv; }`, /* glsl */`
    varying float vA, vPulse;
    void main() { float d = length(gl_PointCoord - .5) * 2.;
      gl_FragColor = vec4(AMBER * (smoothstep(.22, .0, d) * 1.6 + smoothstep(.07, .0, abs(d - vPulse * .9)) * (1. - vPulse) * 1.2) * vA, 1.); }`, uniforms)));

  const stars = []; for (let i = 0; i < 300; i++) stars.push((rand(i + .3) - .5) * 40, (rand(i + 300) - .5) * 40, -12 - rand(i + 600) * 10);
  scene.add(new T.Points(geo({position: [stars, 3]}), mat(`varying float vA; void main() { vec4 mv = modelViewMatrix * vec4(position, 1.); vA = .25 + .5 * hash(position.x); gl_PointSize = .09 * uPx / -mv.z; gl_Position = projectionMatrix * mv; }`,
    `varying float vA; void main() { gl_FragColor = vec4(mix(CYAN, WHITE, .5) * sprite(gl_PointCoord) * vA, 1.); }`)));

  return play(t => {
    uniforms.uIn.value = easeOut(span(t, 0, 1.6));
    globe.rotation.set(.38, t * .3 - .6, .12);
    camera.position.set(0, 0, fit(3.25) * (1.12 - .12 * easeOut(span(t, 0, 4))));
  });
}
