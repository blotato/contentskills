import {glowStage, rand} from './_fx.js';

// A black hole: 44,000 points orbit in an accretion disk, faster toward the centre, hot amber inside
// cooling to magenta and cyan. The vertex shader bends light: whatever lies behind the hole is pushed
// outward around it, so the far side of the disk arches over the shadow. Seamless loop.
// "gravity", "the pull", "no way back", "everything gets drawn in"; also a dramatic backdrop.
export const meta = {duration: 8, loop: true};
const N = 44000, STARS = 1400;

export function mount(el) {
  const {T, scene, camera, mat, solid, geo, aspect, fitBox, play} = glowStage(el, {fov: 34, glow: 1.2});
  const uniforms = {uPhase: {value: 0}};
  const lens = /* glsl */`
    uniform float uPhase;
    // Bend a view-space point around the hole at view-space position c: points behind it slide outward.
    vec3 lens(vec3 v, vec3 c) { vec3 rel = v - c; float b = length(rel.xy), behind = smoothstep(0., 2.5, -rel.z);
      rel.xy *= sqrt(b * b + 7.5 * behind) / max(b, 1e-3); return c + rel; }`;
  const disk = [];
  for (let i = 0; i < N; i++) { const r = 1.75 + Math.pow(rand(i + .2), 1.7) * 5.2; disk.push(r, rand(i + 5000) * 6.2832, (rand(i * 1.3 + 77) - .5) * 2, rand(i * 2.1 + 31)); }
  const system = new T.Group(); scene.add(system);
  const cloud = new T.Points(geo({position: [new Array(N * 3).fill(0), 3], aDisk: [disk, 4]}), mat(lens + /* glsl */`
    attribute vec4 aDisk; varying vec3 vCol; varying float vA;
    void main() {
      float r = aDisk.x, laps = max(1., floor(6. * pow(r / 1.75, -1.5) + .5));       // whole turns per loop, so the loop closes
      float a = aDisk.y + uPhase * TAU * laps;
      float arms = .55 + .45 * sin(aDisk.y * 2. + log(r) * 5. + aDisk.w * 1.5);        // clumps that shear into spiral streaks
      vec3 p = vec3(cos(a) * r, aDisk.z * (.02 + .045 * r) * (.4 + arms), sin(a) * r);
      vec4 mv = modelViewMatrix * vec4(p, 1.); vec3 c = (modelViewMatrix * vec4(0., 0., 0., 1.)).xyz;
      mv.xyz = lens(mv.xyz, c);
      float heat = smoothstep(7., 1.75, r);
      vCol = mix(mix(TEAL, MAGENTA, smoothstep(.1, .55, heat)), AMBER, smoothstep(.5, .82, heat)) + WHITE * smoothstep(.86, 1., heat) * .7;
      vec3 toward = normalize(mat3(modelViewMatrix) * vec3(-sin(a), 0., cos(a)));
      float doppler = 1. + .6 * toward.z;                                               // the side swinging toward us is brighter
      vA = (.07 + .19 * heat * heat) * (.35 + arms) * doppler * (.6 + .8 * aDisk.w);
      gl_PointSize = (.04 + .05 * aDisk.w) * uPx / -mv.z; gl_Position = projectionMatrix * mv;
    }`, `varying vec3 vCol; varying float vA; void main() { gl_FragColor = vec4(vCol * sprite(gl_PointCoord) * vA, 1.); }`, uniforms, {depthTest: true}));
  cloud.frustumCulled = false; system.add(cloud);

  // The shadow hides what passes behind it; the thin photon ring hugs its edge.
  scene.add(new T.Mesh(new T.SphereGeometry(1.5, 48, 32), solid(`void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`, `void main() { gl_FragColor = vec4(0., 0., 0., 1.); }`)));
  const ring = new T.Mesh(new T.PlaneGeometry(6, 6), mat(`varying vec2 vUv; void main() { vUv = uv * 2. - 1.; vec4 mv = modelViewMatrix * vec4(0., 0., 0., 1.); mv.xy += position.xy; gl_Position = projectionMatrix * mv; }`, /* glsl */`
    uniform float uPhase; varying vec2 vUv;
    void main() { float r = length(vUv) * 3., a = atan(vUv.y, vUv.x); float d = abs(r - 1.56);
      float flare = .75 + .25 * sin(a * 3. + uPhase * TAU) * sin(a * 5. - uPhase * TAU * 2.);
      gl_FragColor = vec4(mix(AMBER, WHITE, .6) * smoothstep(.05, .0, d) * flare * 1.1 + AMBER * exp(-d * 5.) * .22 * step(1.5, r) * smoothstep(3., 2., r), 1.); }`, uniforms));
  scene.add(ring);

  const stars = []; for (let i = 0; i < STARS; i++) { const y = rand(i + .9) * 2 - 1, a = rand(i + 2000) * 6.2832, r = Math.sqrt(1 - y * y), d = 30 + rand(i + 4000) * 20; stars.push(r * Math.cos(a) * d, y * d, r * Math.sin(a) * d, rand(i + 6000)); }
  const sky = new T.Points(geo({position: [new Array(STARS * 3).fill(0), 3], aStar: [stars, 4]}), mat(lens + /* glsl */`
    attribute vec4 aStar; varying float vA;
    void main() { vec4 mv = modelViewMatrix * vec4(aStar.xyz, 1.); vec3 c = (modelViewMatrix * vec4(0., 0., 0., 1.)).xyz;
      vec3 rel = mv.xyz - c; float b = length(rel.xy), behind = step(rel.z, 0.);
      mv.xy = c.xy + rel.xy * sqrt(b * b + 60. * behind) / max(b, 1e-3);            // far stars squeeze into a ring around the shadow
      vA = behind * (.3 + .7 * pow(.5 + .5 * sin(uPhase * TAU * (1. + floor(aStar.w * 3.)) + aStar.w * 50.), 2.));
      gl_PointSize = (.12 + .25 * aStar.w) * uPx / -mv.z; gl_Position = projectionMatrix * mv; }`,
    `varying float vA; void main() { gl_FragColor = vec4(mix(CYAN, WHITE, .6) * sprite(gl_PointCoord) * vA * .8, 1.); }`, uniforms, {depthTest: true}));
  sky.frustumCulled = false; scene.add(sky);

  return play(t => {
    const phase = (t / meta.duration) % 1, a = phase * Math.PI * 2, tall = aspect() < .8;
    uniforms.uPhase.value = phase;
    system.rotation.set(0, 0, tall ? .95 : .2);
    const d = tall ? fitBox(4.6, 7.2) : fitBox(7.1, 4), lift = .25 + .03 * Math.sin(a);
    camera.position.set(Math.sin(.12 * Math.sin(a)) * d, Math.sin(lift) * d, Math.cos(lift) * d); camera.lookAt(0, 0, 0);
  });
}
