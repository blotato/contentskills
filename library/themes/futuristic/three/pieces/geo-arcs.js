import {glowStage, rand} from './_fx.js';
import {C, F, span, easeOut, easeInOut, typed} from '../../hud.js';

// A globe with named places at real coordinates and routes arcing between them. The sphere is a
// latitude/longitude lattice of points (no coastlines), turned so the places face the camera; each
// place pings and is labelled, each route draws and then carries comets. Labels fade as they turn away.
// For "from here to there": shipping, flights, expansion, where the users are.
//   props: points [{name, lat, lon}] (degrees, north and east positive), routes [[fromIndex, toIndex], ...]
//          (omit routes to link the first point to every other)
export const meta = {duration: 9};
export const defaults = {points: [{name: 'LONDON', lat: 51.5, lon: -.1}, {name: 'NEW YORK', lat: 40.7, lon: -74}, {name: 'LAGOS', lat: 6.5, lon: 3.4}, {name: 'DUBAI', lat: 25.2, lon: 55.3}, {name: 'SAO PAULO', lat: -23.5, lon: -46.6}], routes: null};
const R = 2.6, STEPS = 120;

export function mount(el, props = defaults) {
  const {T, scene, camera, mat, geo, fit, dust, label, play} = glowStage(el, {fov: 34, glow: 1.1});
  const at = (lat, lon) => { const a = lat * Math.PI / 180, b = lon * Math.PI / 180; return new T.Vector3(Math.cos(a) * Math.cos(b), Math.sin(a), -Math.cos(a) * Math.sin(b)); };
  const places = props.points.slice(0, 12).map(p => ({...p, v: at(p.lat, p.lon)}));
  const routes = (props.routes || places.slice(1).map((_, i) => [0, i + 1])).filter(([a, b]) => places[a] && places[b] && a !== b);
  const globe = new T.Group(); scene.add(globe);
  const facing = `float facing(vec3 p, vec4 mv) { return dot(normalize(normalMatrix * normalize(p)), normalize(-mv.xyz)); }`;
  const uniforms = {uIn: {value: 0}};

  const grid = [], kind = [];
  for (let lat = -84; lat <= 84; lat += 6) for (let lon = -180; lon < 180; lon += 2) { const v = at(lat, lon); grid.push(v.x * R, v.y * R, v.z * R); kind.push(lat === 0 ? 1 : 0); }
  for (let lon = -180; lon < 180; lon += 12) for (let lat = -84; lat <= 84; lat += 2) { const v = at(lat, lon); grid.push(v.x * R, v.y * R, v.z * R); kind.push(0); }
  globe.add(new T.Points(geo({position: [grid, 3], aKind: [kind, 1]}), mat(facing + /* glsl */`
    attribute float aKind; uniform float uIn; varying float vA;
    void main() { vec3 n = normalize(position); vec4 mv = modelViewMatrix * vec4(position, 1.); float front = smoothstep(-.15, .25, facing(position, mv));
      float sweep = exp(-abs(fract(n.y * .5 + .5 - uTime * .14) - .5) * 26.);
      vA = (.3 + .35 * aKind + sweep * .7) * mix(.14, 1., front) * step(n.y * .5 + .5, uIn * 1.05);
      gl_PointSize = (.026 + .012 * aKind) * (1. + sweep) * uPx / -mv.z; gl_Position = projectionMatrix * mv; }`,
    `varying float vA; void main() { gl_FragColor = vec4(mix(TEAL, CYAN, .6) * sprite(gl_PointCoord) * vA, 1.); }`, uniforms)));
  scene.add(new T.Mesh(new T.SphereGeometry(R * 1.03, 64, 48), mat(`varying vec3 vN, vV; void main() { vec4 mv = modelViewMatrix * vec4(position, 1.); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`, /* glsl */`
    uniform float uIn; varying vec3 vN, vV;
    void main() { float f = 1. - max(dot(normalize(vN), normalize(vV)), 0.); gl_FragColor = vec4((CYAN * pow(f, 3.) * .85 + MAGENTA * pow(f, 7.) * .5 + TEAL * .03) * uIn, 1.); }`, uniforms)));

  const start = i => 2 + i * .45;                                  // when route i begins to draw
  const apos = [], ainfo = [];
  routes.forEach(([a, b], k) => { const A = places[a].v, B = places[b].v, angle = Math.max(.02, A.angleTo(B));
    for (let i = 0; i <= STEPS; i++) { const u = i / STEPS, p = A.clone().multiplyScalar(Math.sin((1 - u) * angle)).addScaledVector(B, Math.sin(u * angle)).normalize().multiplyScalar(R * (1.012 + Math.sin(u * Math.PI) * angle * .17));
      apos.push(p.x, p.y, p.z); ainfo.push(u, start(k), k); } });
  globe.add(new T.Points(geo({position: [apos, 3], aInfo: [ainfo, 3]}), mat(facing + /* glsl */`
    attribute vec3 aInfo; varying vec3 vCol; varying float vA;
    void main() { float u = aInfo.x, since = uTime - aInfo.y, drawn = step(u, since / .9);
      float q = fract(since * .38) * 1.45, tail = q - u, comet = step(0., tail) * exp(-tail * 7.) * step(.9, since);
      float tip = exp(-abs(since / .9 - u) * 30.) * step(since, .9) * step(0., since);
      vec4 mv = modelViewMatrix * vec4(position, 1.); float front = mix(.2, 1., smoothstep(-.2, .2, facing(position, mv)));
      vCol = mix(mod(aInfo.z, 2.) < .5 ? MAGENTA : AMBER, WHITE, clamp(comet * .7 + tip, 0., 1.)); vA = drawn * (.3 + comet * 1.3 + tip * 2.) * front;
      gl_PointSize = (.05 + .09 * comet + .08 * tip) * uPx / -mv.z; gl_Position = projectionMatrix * mv; }`,
    `varying vec3 vCol; varying float vA; void main() { gl_FragColor = vec4(vCol * sprite(gl_PointCoord) * vA, 1.); }`)));
  const born = i => .9 + i * .22;
  globe.add(new T.Points(geo({position: [places.flatMap(p => [p.v.x * R * 1.012, p.v.y * R * 1.012, p.v.z * R * 1.012]), 3], aBorn: [places.map((_, i) => born(i)), 1]}), mat(facing + /* glsl */`
    attribute float aBorn; varying float vA, vPulse, vPop;
    void main() { vec4 mv = modelViewMatrix * vec4(position, 1.); vA = mix(.15, 1., smoothstep(-.1, .2, facing(position, mv))) * step(aBorn, uTime);
      vPulse = fract((uTime - aBorn) * .6); vPop = exp(-max(0., uTime - aBorn) * 3.); gl_PointSize = .7 * uPx / -mv.z; gl_Position = projectionMatrix * mv; }`, /* glsl */`
    varying float vA, vPulse, vPop;
    void main() { float d = length(gl_PointCoord - .5) * 2.;
      gl_FragColor = vec4((AMBER * (smoothstep(.2, .0, d) * 1.6 + smoothstep(.06, .0, abs(d - vPulse * .9)) * (1. - vPulse)) + WHITE * vPop * smoothstep(.5, 0., d)) * vA, 1.); }`)));
  const tags = places.map(p => { const l = label('', {size: .26, color: C.white, anchor: -1}); l.position.copy(p.v).multiplyScalar(R * 1.07); globe.add(l); return l; });
  dust({count: 260, box: [26, 26, 10], center: [0, 0, -7], size: .05});

  const centre = places.reduce((s, p) => s.add(p.v), new T.Vector3()).normalize(), yaw = Math.atan2(-centre.x, centre.z), pitch = Math.asin(centre.y) * .75, v = new T.Vector3();
  return play(t => {
    uniforms.uIn.value = easeOut(span(t, 0, 1.4));
    globe.rotation.set(pitch, yaw + .55 - .75 * easeInOut(span(t, 0, 4.5)) - .04 * Math.max(0, t - 4.5), 0);
    places.forEach((p, i) => { v.copy(p.v).applyEuler(globe.rotation);
      tags[i].set(typed(String(p.name), span(t, born(i) + .15, .4))).show(Math.min(1, Math.max(0, (v.z - .1) / .3))); });
    camera.position.set(0, 0, fit(3.3) * (1.22 - .22 * easeOut(span(t, 0, 3.5))));
  });
}
