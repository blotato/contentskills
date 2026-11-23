import {glowStage, rand} from './_fx.js';
import {span, easeOut, easeInOut} from '../../hud.js';

// A hologram of an abstract knotted form, projected from an emitter: it prints itself from the base
// upward, then turns with fresnel rim light, travelling scanlines and bursts of glitch that shear
// whole slices sideways (done in the vertex shader). "the prototype", "the model", "a new technology".
export const meta = {duration: 8};

export function mount(el) {
  const {T, scene, camera, mat, geo, fitBox, play} = glowStage(el, {fov: 34, glow: 1.15});
  const uniforms = {uReveal: {value: 0}};
  const knot = new T.Mesh(new T.TorusKnotGeometry(1.55, .5, 280, 36, 2, 3), mat(/* glsl */`
    uniform float uReveal; varying vec3 vN, vW; varying vec2 vUv; varying float vG;
    void main() {
      vec3 p = position + normal * fbm(position * 1.3 + uTime * .35) * .09;
      vec4 w = modelMatrix * vec4(p, 1.);
      // glitch: now and then a horizontal slice of the object jumps sideways for a few frames
      float tick = floor(uTime * 9.), band = floor(w.y * 2.6 + tick * .37);
      vG = step(.86, hash(band * 1.3 + tick)) * step(.74, hash(tick * .71)) * step(.05, uReveal);
      w.x += vG * (hash(band + tick * 3.1) - .5) * 1.3;
      vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); vUv = uv;
      gl_Position = projectionMatrix * viewMatrix * w;
    }`, /* glsl */`
    uniform float uReveal; varying vec3 vN, vW; varying vec2 vUv; varying float vG;
    void main() {
      float f = pow(1. - abs(dot(normalize(vN), normalize(cameraPosition - vW))), 2.1);
      float scan = smoothstep(.35, 1., sin(vW.y * 46. - uTime * 6.) * .5 + .5);
      float sweep = exp(-abs(fract(vW.y * .11 - uTime * .21) - .5) * 16.);
      vec2 g = abs(fract(vUv * vec2(140., 18.)) - .5); float wire = smoothstep(.42, .5, max(g.x, g.y));
      float front = uReveal * 7.6 - 3.8, edge = exp(-abs(vW.y - front) * 10.) * step(uReveal, .995);
      float flick = .86 + .14 * step(.4, hash(floor(uTime * 24.)));
      vec3 c = CYAN * (f * .62 + scan * .1 * (.3 + f) + wire * .2 * (.25 + f) + .012) + WHITE * f * f * f * .3 + CYAN * sweep * .22;
      c = mix(c, MAGENTA * (f + .5), vG);
      gl_FragColor = vec4(c * step(vW.y, front) * flick + AMBER * edge * .7, 1.);
    }`, uniforms, {side: T.DoubleSide}));
  scene.add(knot);

  // Emitter: rings on the floor and a cone of light with drifting streaks.
  const base = -3.5;
  const cone = new T.Mesh(new T.CylinderGeometry(3.3, .7, 7, 64, 1, true), mat(`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`, /* glsl */`
    uniform float uReveal; varying vec2 vUv;
    void main() { float streak = .5 + .5 * noise(vec3(vUv.x * 60., vUv.y * 2. - uTime * .8, uTime * .3));
      gl_FragColor = vec4(CYAN * pow(1. - vUv.y, 2.4) * (.05 + .16 * streak) * smoothstep(0., .1, uReveal), 1.); }`, uniforms, {side: T.DoubleSide}));
  cone.position.y = base + 3.5; scene.add(cone);
  const rings = new T.Mesh(new T.PlaneGeometry(6.4, 6.4), mat(`varying vec2 vUv; void main() { vUv = uv * 2. - 1.; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`, /* glsl */`
    uniform float uReveal; varying vec2 vUv;
    void main() { float r = length(vUv), a = atan(vUv.y, vUv.x);
      float c = smoothstep(.02, 0., abs(r - .24)) + smoothstep(.012, 0., abs(r - .5)) * step(.3, fract(a / TAU * 24. + uTime * .2)) + smoothstep(.02, 0., abs(r - .78)) * step(.5, fract(a / TAU * 6. - uTime * .12))
              + smoothstep(.01, 0., abs(r - .94)) + exp(-r * 7.) * 1.4;
      float ripple = smoothstep(.03, 0., abs(r - fract(uTime * .5))) * (1. - fract(uTime * .5));
      gl_FragColor = vec4((CYAN * c + AMBER * ripple) * smoothstep(0., .08, uReveal), 1.); }`, uniforms, {side: T.DoubleSide}));
  rings.rotation.x = -Math.PI / 2; rings.position.y = base; scene.add(rings);
  const dust = [], seeds = [];
  for (let i = 0; i < 420; i++) { const a = rand(i) * 6.283, r = .3 + rand(i + 50) * 2.9; dust.push(Math.cos(a) * r, rand(i + 99), Math.sin(a) * r); seeds.push(rand(i + 7)); }
  scene.add(new T.Points(geo({position: [dust, 3], aSeed: [seeds, 1]}), mat(/* glsl */`
    attribute float aSeed; uniform float uReveal; varying float vA;
    void main() { float y = fract(position.y + uTime * (.05 + .1 * aSeed)); vec3 p = vec3(position.x * (.3 + y), ${base.toFixed(1)} + y * 7., position.z * (.3 + y));
      vec4 mv = modelViewMatrix * vec4(p, 1.); vA = sin(y * PI) * (.3 + .7 * aSeed) * smoothstep(0., .1, uReveal);
      gl_PointSize = (.03 + .07 * aSeed) * uPx / -mv.z; gl_Position = projectionMatrix * mv; }`,
    `varying float vA; void main() { gl_FragColor = vec4(mix(CYAN, WHITE, .3) * sprite(gl_PointCoord) * vA, 1.); }`, uniforms)));

  return play(t => {
    uniforms.uReveal.value = easeInOut(span(t, .3, 2.2));
    knot.rotation.set(.3 * Math.sin(t * .5), .55 * Math.sin(t * .42 + .6), t * .45);
    const d = fitBox(3.5, 4.1); camera.position.set(0, 1.5 - .5 * easeOut(span(t, 0, 3)), d); camera.lookAt(0, -.35, 0);
  });
}
