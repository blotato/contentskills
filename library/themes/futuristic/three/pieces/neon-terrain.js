import {glowStage, rand} from './_fx.js';

// A low flight down a valley of noise-displaced wireframe mountains toward a slotted sun.
// The heights are computed in the vertex shader; the grid is drawn in the fragment shader, so the
// hills are solid black and hide what is behind them. Backdrop: "the future", "the journey", a title bed.
// The terrain repeats every 40 units and one loop travels exactly that far, so it is seamless.
export const meta = {duration: 8, loop: true};

export function mount(el) {
  const {T, scene, camera, mat, solid, geo, play} = glowStage(el, {fov: 62, glow: 1.05});
  const uniforms = {uPhase: {value: 0}};
  const plane = new T.PlaneGeometry(72, 62, 180, 155); plane.rotateX(-Math.PI / 2); plane.translate(0, 0, -31.4);
  scene.add(new T.Mesh(plane, solid(/* glsl */`
    uniform float uPhase; varying vec3 vP; varying vec2 vC;
    float vnoise(vec2 p, float wrap) {          // value noise that repeats along the direction of travel
      vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f); float a = mod(i.y, wrap), b = mod(i.y + 1., wrap);
      return mix(mix(hash2(vec2(i.x, a)), hash2(vec2(i.x + 1., a)), u.x), mix(hash2(vec2(i.x, b)), hash2(vec2(i.x + 1., b)), u.x), u.y);
    }
    void main() {
      vC = vec2(position.x, position.z - uPhase * 40.);
      float valley = smoothstep(1.2, 11., abs(vC.x + 1.6 * sin(vC.y * TAU / 40.)));
      float h = valley * (6.5 * vnoise(vC * .15, 6.) + 1.8 * vnoise(vC * .4 + 3.3, 16.));
      vP = vec3(position.x, h, position.z); gl_Position = projectionMatrix * viewMatrix * vec4(vP, 1.);
    }`, /* glsl */`
    uniform float uPhase; varying vec3 vP; varying vec2 vC;
    void main() {
      vec2 g = abs(fract(vC - .5) - .5), w = fwidth(vC);
      vec2 l2 = 1. - smoothstep(w * .7, w * 1.9 + .01, g);
      float l = max(l2.x, l2.y) * (1. - smoothstep(.25, .6, max(w.x, w.y)));    // far lines melt instead of shimmering
      float dist = -vP.z, fog = exp(-dist * .05);
      vec3 c = mix(CYAN, MAGENTA, smoothstep(.6, 4.6, vP.y));
      float wave = exp(-abs(dist - fract(uPhase * 2.) * 62.) * .7);            // a scan wave running out to the horizon
      gl_FragColor = vec4(c * fog * (l * 1.15 + .035 + .05 * smoothstep(1., 6., vP.y)) + WHITE * wave * fog * (l * 1.2 + .06), 1.);
    }`, uniforms)));

  // Sun: a disc cut by slits that widen toward the horizon.
  const sun = new T.Mesh(new T.PlaneGeometry(40, 40), mat(`varying vec2 vUv; void main() { vUv = uv * 2. - 1.; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`, /* glsl */`
    uniform float uPhase; varying vec2 vUv;
    void main() {
      float r = length(vUv), disc = smoothstep(.62, .61, r);
      float y = vUv.y / .62 * .5 + .5, slit = smoothstep(.0, .06, fract(y * 9. - uPhase * 2.) - (.75 - y) * .9);
      vec3 c = mix(MAGENTA, AMBER, smoothstep(.1, .9, y));
      gl_FragColor = vec4(c * disc * slit * .95 + mix(MAGENTA, AMBER, .4) * exp(-r * 3.2) * .45 * smoothstep(1., .55, r), 1.);
    }`, uniforms, {depthTest: true}));
  sun.position.set(0, 8.5, -95); scene.add(sun);

  const stars = [], seeds = [];
  for (let i = 0; i < 500; i++) { stars.push((rand(i) * 2 - 1) * 150, 6 + rand(i + 700) * 70, -110); seeds.push(rand(i + 1400)); }
  scene.add(new T.Points(geo({position: [stars, 3], aSeed: [seeds, 1]}), mat(/* glsl */`
    attribute float aSeed; uniform float uPhase; varying float vA;
    void main() { vec4 mv = modelViewMatrix * vec4(position, 1.); vA = .35 + .65 * pow(.5 + .5 * sin(uPhase * TAU * (1. + floor(aSeed * 3.)) + aSeed * 40.), 3.);
      gl_PointSize = (.25 + .5 * aSeed) * uPx / -mv.z; gl_Position = projectionMatrix * mv; }`,
    `varying float vA; void main() { gl_FragColor = vec4(WHITE * sprite(gl_PointCoord) * vA, 1.); }`, uniforms, {depthTest: true})));

  return play(t => {
    const phase = (t / meta.duration) % 1, a = phase * Math.PI * 2;
    uniforms.uPhase.value = phase;
    camera.position.set(-1.6 * Math.sin(a) * .55, 2.2 + .25 * Math.sin(a * 2), 0);
    camera.rotation.set(-.04, .05 * Math.cos(a), .07 * Math.cos(a));
  });
}
