import {glowStage, rand} from './_fx.js';
import {span, easeOut} from '../../hud.js';

// A living orb of plasma: a sphere whose surface is pushed around by flowing noise in the vertex shader
// (with the normals recomputed, so the rim light follows every bulge), drawn as glowing contour lines
// over a dark body, inside a halo and a swarm of orbiting sparks.
// "energy", "the AI", "the core idea", "something alive and powerful".
export const meta = {duration: 8};

export function mount(el) {
  const {T, scene, camera, mat, solid, geo, fit, play} = glowStage(el, {fov: 34, glow: 1.2});
  const uniforms = {uIn: {value: 0}};
  const orb = new T.Mesh(new T.IcosahedronGeometry(1, 30), solid(/* glsl */`
    uniform float uIn; varying vec3 vN, vW; varying float vD;
    float field(vec3 n) { return fbm(n * 1.25 + vec3(0., uTime * .22, uTime * .13)) + .3 * noise(n * 3.4 - vec3(uTime * .35, 0., uTime * .2)); }
    vec3 surface(vec3 n) { return n * (2. + .62 * field(n) * uIn); }
    void main() {
      vec3 n = normalize(position), t1 = normalize(cross(n, vec3(.21, 1., .37))), t2 = cross(n, t1);
      vec3 p = surface(n), a = surface(normalize(n + t1 * .03)), b = surface(normalize(n + t2 * .03));
      vec3 normal2 = normalize(cross(a - p, b - p)); if (dot(normal2, n) < 0.) normal2 = -normal2;
      vD = field(n); vec4 w = modelMatrix * vec4(p * uIn, 1.); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal2);
      gl_Position = projectionMatrix * viewMatrix * w;
    }`, /* glsl */`
    varying vec3 vN, vW; varying float vD;
    void main() {
      float f = pow(1. - max(dot(normalize(vN), normalize(cameraPosition - vW)), 0.), 2.);
      float x = vD * 9. - uTime * .35, w = fwidth(x), band = 1. - smoothstep(w * .8, w * 2.2 + .05, abs(fract(x) - .5));
      vec3 tint = mix(CYAN, MAGENTA, smoothstep(-.25, .45, vD));
      vec3 c = tint * (f * 1.25 + band * (.22 + f * .9) + .02) + AMBER * smoothstep(.38, .75, vD) * (.3 + band * .9) + WHITE * pow(f, 4.) * .7;
      gl_FragColor = vec4(c, 1.);
    }`, uniforms));
  scene.add(orb);

  const halo = new T.Mesh(new T.PlaneGeometry(13, 13), mat(`varying vec2 vUv; void main() { vUv = uv * 2. - 1.; vec4 mv = modelViewMatrix * vec4(0., 0., 0., 1.); mv.xy += position.xy; gl_Position = projectionMatrix * mv; }`, /* glsl */`
    uniform float uIn; varying vec2 vUv;
    void main() { float r = length(vUv) * 6.5, a = atan(vUv.y, vUv.x);
      float rays = .7 + .3 * noise(vec3(a * 3., r * .4 - uTime * .5, uTime * .2));
      gl_FragColor = vec4(mix(CYAN, MAGENTA, smoothstep(2., 5.5, r)) * exp(-max(0., r - 1.9) * 1.25) * .5 * rays * smoothstep(6.5, 4.5, r) * uIn, 1.); }`, uniforms, {depthTest: true}));
  scene.add(halo);

  const sparks = [];
  for (let i = 0; i < 1500; i++) sparks.push(3 + Math.pow(rand(i + .1), 2) * 2.4, rand(i + 2000) * 6.2832, rand(i + 4000), rand(i + 6000));
  const swarm = new T.Points(geo({position: [new Array(1500 * 3).fill(0), 3], aOrbit: [sparks, 4]}), mat(/* glsl */`
    attribute vec4 aOrbit; uniform float uIn; varying vec3 vCol; varying float vA;
    void main() {
      float r = aOrbit.x, a = aOrbit.y + uTime * (.9 / r) * (.6 + aOrbit.w), tilt = (aOrbit.z - .5) * 1.5;
      vec3 p = vec3(cos(a) * r, sin(a * 2. + aOrbit.w * 6.) * .12, sin(a) * r); p.xy = rot(tilt) * p.xy; p.yz = rot(aOrbit.w * 2. - 1.) * p.yz;
      vec4 mv = modelViewMatrix * vec4(p * mix(.3, 1., uIn), 1.);
      vCol = aOrbit.w > .85 ? AMBER : aOrbit.z > .6 ? MAGENTA : CYAN; vA = (.3 + .7 * aOrbit.w) * uIn;
      gl_PointSize = (.03 + .07 * aOrbit.w * aOrbit.w) * uPx / -mv.z; gl_Position = projectionMatrix * mv;
    }`, `varying vec3 vCol; varying float vA; void main() { gl_FragColor = vec4(vCol * sprite(gl_PointCoord) * vA, 1.); }`, uniforms, {depthTest: true}));
  swarm.frustumCulled = false; scene.add(swarm);

  return play(t => {
    uniforms.uIn.value = easeOut(span(t, 0, 1.4));
    orb.rotation.set(.2, t * .18, 0);
    camera.position.set(0, 0, fit(3.4) * (1.1 - .1 * easeOut(span(t, 0, 5))));
  });
}
