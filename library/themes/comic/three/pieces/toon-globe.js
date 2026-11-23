import {toonStage, C, v3, sparkShape, cutout, span, spring, rand} from './_toon.js';

// A printed globe: flat sea and land with an ink coastline, halftone shadow on the night side,
// a thick ink outline, a tilted ring and sparks in orbit. For "everywhere", "worldwide", "online".
export const meta = {duration: 8, loop: true};

export function mount(el) {
  const {T, scene, render, ink, flat, uniforms, setTurn} = toonStage(el, {background: C.red, dots: '#a8121b', rays: 28, ray: '#f0434a', hole: .34, from: [0, 0]});
  const globe = new T.Mesh(new T.SphereGeometry(1.45, 64, 40), new T.ShaderMaterial({
    uniforms: {...uniforms, uSea: {value: v3(C.sky)}, uLand: {value: v3(C.green)}, uInk: {value: v3(C.ink)}, uShade: {value: v3(C.blue)}},
    vertexShader: `varying vec3 vN, vP; void main() { vN = normalMatrix * normal; vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: `uniform vec2 uRes; uniform vec3 uSea, uLand, uInk, uShade; varying vec3 vN, vP;
      vec3 h3(vec3 p) { p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6))); return fract(sin(p) * 43758.5453) * 2. - 1.; }
      float noise(vec3 p) { vec3 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
        return mix(mix(mix(dot(h3(i), f), dot(h3(i + vec3(1, 0, 0)), f - vec3(1, 0, 0)), u.x), mix(dot(h3(i + vec3(0, 1, 0)), f - vec3(0, 1, 0)), dot(h3(i + vec3(1, 1, 0)), f - vec3(1, 1, 0)), u.x), u.y),
                   mix(mix(dot(h3(i + vec3(0, 0, 1)), f - vec3(0, 0, 1)), dot(h3(i + vec3(1, 0, 1)), f - vec3(1, 0, 1)), u.x), mix(dot(h3(i + vec3(0, 1, 1)), f - vec3(0, 1, 1)), dot(h3(i + vec3(1, 1, 1)), f - vec3(1, 1, 1)), u.x), u.y), u.z); }
      void main() {
        float n = noise(vP * 1.25 + 3.) + .45 * noise(vP * 2.9 + 9.), e = fwidth(n) * 2.4 + .012;
        vec3 col = mix(uSea, uLand, step(.06, n)); col = mix(col, uInk, 1. - smoothstep(0., e, abs(n - .06)));
        float l = dot(normalize(vN), normalize(vec3(-.45, .7, .55))), a = smoothstep(.3, -.55, l) * .95, size = uRes.y / 56.;
        vec2 p = mat2(.7071, -.7071, .7071, .7071) * gl_FragCoord.xy / size; float r = sqrt(a) * .74;
        col = mix(col, uShade, a <= .001 ? 0. : smoothstep(r + 1.2 / size, r - 1.2 / size, length(fract(p) - .5)));
        if (l > .955) col = vec3(1., .98, .94);
        gl_FragColor = vec4(col, 1.);
      }`,
  }));
  ink(globe, .075); const tilt = new T.Group(); tilt.rotation.z = .35; tilt.add(globe); scene.add(tilt);
  const ring = new T.Mesh(new T.TorusGeometry(2.05, .055, 10, 90), flat(C.yellow)); ink(ring, .035); const ringTilt = new T.Group(); ringTilt.rotation.set(1.25, .25, 0); ringTilt.add(ring); scene.add(ringTilt);
  const moon = new T.Mesh(new T.SphereGeometry(.2, 24, 16), flat(C.yellow)); ink(moon, .05); ringTilt.add(moon);
  const sparks = Array.from({length: 5}, (_, i) => { const s = cutout(sparkShape(.2 + rand(i, 2) * .12), C.white, {grow: 1.28}); s.position.set((rand(i, 4) - .5) * 3.2, (rand(i, 6) - .5) * 4.6, 1.6); if (Math.hypot(s.position.x, s.position.y) < 1.9) s.position.multiplyScalar(1.9 / Math.hypot(s.position.x, s.position.y)); scene.add(s); return s; });
  return {seek(t) {
    const p = t / meta.duration, a = p * Math.PI * 2;
    globe.rotation.y = a; moon.position.set(Math.cos(a * 2) * 2.05, Math.sin(a * 2) * 2.05, 0); setTurn(a);
    globe.scale.setScalar(1 + .012 * Math.sin(a * 4));
    sparks.forEach((s, i) => { s.scale.setScalar(.75 + .35 * Math.sin(a * 3 + i * 1.9)); s.rotation.z = Math.sin(a * 2 + i) * .6; });
    render();
  }};
}
