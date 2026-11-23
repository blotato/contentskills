import {glowStage, rand} from './_fx.js';
import {span, easeOut} from '../../hud.js';

// An energy shield: a dome of hexagonal cells rises over a glowing core, then takes hits — each
// impact dents the surface (vertex shader) and sends a ring of lit cells racing across it (fragment shader).
// "security", "protection", "defence", "blocked", "firewall".
export const meta = {duration: 8};
const R = 3;
const HITS = [[-.5, .62, .6, 2.6], [.62, .42, .66, 3.8], [.05, .9, .42, 5], [-.78, .3, .55, 5.9], [.3, .55, .78, 6.9]];

export function mount(el) {
  const {T, scene, camera, mat, geo, aspect, fitBox, dust, play} = glowStage(el, {fov: 34, glow: .9});
  const hits = HITS.map(([x, y, z, t]) => { const v = new T.Vector3(x, y, z).normalize(); return new T.Vector4(v.x, v.y, v.z, t); });
  const uniforms = {uHit: {value: hits}, uUp: {value: 0}};
  const ripple = /* glsl */`
    uniform vec4 uHit[${HITS.length}]; uniform float uUp;
    // x: travelling ring, y: flash at the point of impact
    vec2 ripple(vec3 d) { vec2 r = vec2(0.);
      for (int i = 0; i < ${HITS.length}; i++) { float age = uTime - uHit[i].w; if (age > 0.) { float a = acos(clamp(dot(d, uHit[i].xyz), -1., 1.));
        r += vec2(exp(-pow((a - age * 1.5) * 6., 2.)) * exp(-age * 1.3), exp(-a * a * 22.) * exp(-age * 4.)); } }
      return r; }`;
  const dome = new T.Mesh(new T.SphereGeometry(R, 120, 60, 0, Math.PI * 2, 0, Math.PI / 2), mat(ripple + /* glsl */`
    varying vec3 vD, vN, vW;
    void main() { vD = normalize(position); vec2 r = ripple(vD);
      vec4 w = modelMatrix * vec4(position * (1. - r.x * .035 - r.y * .09), 1.); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal);
      gl_Position = projectionMatrix * viewMatrix * w; }`, ripple + /* glsl */`
    varying vec3 vD, vN, vW;
    // Hexagonal cells: convert to axial coordinates, round to the nearest cell (cube rounding). xy = offset from the cell centre, zw = centre.
    vec4 hexCell(vec2 p) {
      vec2 q = vec2(p.x - p.y * .57735, p.y * 1.1547); vec3 c = vec3(q, -q.x - q.y), r = floor(c + .5), e = abs(r - c);
      if (e.x > e.y && e.x > e.z) r.x = -r.y - r.z; else if (e.y > e.z) r.y = -r.x - r.z;
      vec2 centre = vec2(r.x + r.y * .5, r.y * .8660254); return vec4(p - centre, centre);
    }
    void main() {
      vec3 d = normalize(vD); const float SCALE = 8.;
      vec4 h = hexCell(d.xz / (1. + d.y) * SCALE);              // stereographic map: cells keep their shape all over the dome
      float ed = max(abs(h.x), max(abs(dot(h.xy, vec2(.5, .8660254))), abs(dot(h.xy, vec2(-.5, .8660254)))));
      float w = fwidth(ed), line = smoothstep(.455 - w, .485, ed);
      vec2 c = h.zw / SCALE; vec3 cd = vec3(2. * c.x, 1. - dot(c, c), 2. * c.y) / (1. + dot(c, c));   // direction of the cell's centre
      vec2 r = ripple(cd); float seed = hash2(h.zw);
      float fres = pow(1. - abs(dot(normalize(vN), normalize(cameraPosition - vW))), 2.4);
      float up = uUp * 1.15 - d.y * .15, on = step(1. - d.y, up + seed * .08), front = exp(-abs(1. - d.y - up) * 16.) * step(uUp, .999);
      float idle = step(.965, hash2(h.zw + floor(uTime * 5.))) * .22 + .05 * sin(uTime * 2. + seed * 40.);
      vec3 col = CYAN * (line * (.3 + fres * .7) + fres * .15 + .006 + idle * (1. - line))
               + mix(CYAN, WHITE, .5) * r.x * (line * 1.5 + .4) + MAGENTA * r.y * (.8 + line) + WHITE * r.y * r.y * .5;
      gl_FragColor = vec4((col * on + AMBER * front * (.5 + line)) * (gl_FrontFacing ? 1. : .2), 1.);
    }`, uniforms, {side: T.DoubleSide}));
  scene.add(dome);

  const floor = new T.Mesh(new T.PlaneGeometry(9, 9), mat(`varying vec2 vUv; void main() { vUv = uv * 2. - 1.; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`, /* glsl */`
    uniform float uUp; varying vec2 vUv;
    void main() { float r = length(vUv) * 4.5, a = atan(vUv.y, vUv.x);
      float c = smoothstep(.05, 0., abs(r - ${R}.)) * 1.3 + smoothstep(.03, 0., abs(r - 3.3)) * step(.35, fract(a / TAU * 36. + uTime * .05)) + smoothstep(.03, 0., abs(r - 3.62)) * step(.6, fract(a / TAU * 8. - uTime * .08)) * .7
              + smoothstep(.02, 0., abs(fract(r * 2.) - .5) - .47) * .08 * step(r, ${R}.);
      gl_FragColor = vec4(CYAN * c * smoothstep(0., .15, uUp), 1.); }`, uniforms, {side: T.DoubleSide}));
  floor.rotation.x = -Math.PI / 2; scene.add(floor);

  const core = new T.Mesh(new T.IcosahedronGeometry(.62, 1), mat(`varying vec3 vB; attribute vec3 aB; void main() { vB = aB; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    `varying vec3 vB; void main() { float e = min(vB.x, min(vB.y, vB.z)); gl_FragColor = vec4(AMBER * (smoothstep(.07, .0, e) + .12), 1.); }`, {}, {side: T.DoubleSide}));
  { const g = core.geometry.toNonIndexed(), n = g.attributes.position.count, b = new Float32Array(n * 3); for (let i = 0; i < n; i++) b[i * 3 + i % 3] = 1; g.setAttribute('aB', new T.BufferAttribute(b, 3)); core.geometry = g; }
  core.position.y = 1.05; scene.add(core);
  const halo = new T.Mesh(new T.PlaneGeometry(5, 5), mat(`varying vec2 vUv; void main() { vUv = uv * 2. - 1.; vec4 mv = modelViewMatrix * vec4(0., 0., 0., 1.); mv.xy += position.xy; gl_Position = projectionMatrix * mv; }`,
    `varying vec2 vUv; void main() { float r = length(vUv); gl_FragColor = vec4(AMBER * (exp(-r * 6.) * .9 + exp(-r * 2.5) * .12) * smoothstep(1., .5, r) * (.85 + .15 * sin(uTime * 3.)), 1.); }`));
  halo.position.y = 1.05; scene.add(halo);

  // Incoming shots: a short comet of points that reaches the dome exactly at each hit time.
  const shots = []; HITS.forEach((_, i) => { for (let k = 0; k < 26; k++) shots.push(i, k / 26, rand(i * 30 + k)); });
  const bolts = new T.Points(geo({position: [shots, 3]}), mat(/* glsl */`
    uniform vec4 uHit[${HITS.length}]; varying float vA;
    void main() { vec4 hit = uHit[int(position.x + .5)]; float left = hit.w - uTime, k = position.y;
      vec3 p = hit.xyz * (${R}. + max(0., left + k * .07) * 17.) + (hash3(vec3(position.z, 1., 2.)) * .05 * k);
      vec4 mv = modelViewMatrix * vec4(p, 1.); vA = step(0., left) * step(left, 1.1) * (1. - k) * (1. - k);
      gl_PointSize = (.3 - .22 * k) * uPx / -mv.z; gl_Position = projectionMatrix * mv; }`,
    `varying float vA; void main() { gl_FragColor = vec4(mix(MAGENTA, WHITE, vA * .6) * sprite(gl_PointCoord) * vA * 1.3, 1.); }`, uniforms));
  bolts.frustumCulled = false; scene.add(bolts);

  dust({count: 200, box: [22, 12, 14], center: [0, 3, -3]});

  return play(t => {
    uniforms.uUp.value = easeOut(span(t, .2, 1.8));
    core.rotation.set(t * .5, t * .8, 0);
    const a = .3 * Math.sin(t * .35 - .5), d = (aspect() < .8 ? fitBox(3.7, 3.2) : fitBox(3.8, 2.4)) * (1.2 - .2 * easeOut(span(t, 0, 3)));
    camera.position.set(Math.sin(a) * d, 2.5, Math.cos(a) * d); camera.lookAt(0, 1.15, 0);
  });
}
