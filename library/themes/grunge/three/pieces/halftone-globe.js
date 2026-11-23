import {xeroxStage, VERT, C, jit} from './_fx.js';

// A globe printed as a coarse halftone: the light side breaks into big dots, the dark side fills in
// black. It turns in held steps inside a red marker orbit, with a red pin stuck in it. Loops.
export const meta = {duration: 6, loop: true};
export const defaults = {pin: {lat: 28, lon: 40}, tilt: 18};

const GLOBE = /* glsl */`
uniform vec3 uLight; varying vec3 vObj, vView;
void main() {
  vec3 n = normalize(vObj);
  vec2 sp = vec2(atan(n.z, n.x), asin(n.y));
  float land = fbm(n.xy * 2.3 + n.z * 1.7 + 4.) + .25 * fbm(n.yz * 5. + 2.) - .12 * abs(n.y);
  float isLand = smoothstep(.5, .53, land);
  vec3 vn = normalize(cross(dFdx(vView), dFdy(vView)));
  float l = max(dot(vn, normalize(uLight)), 0.);
  float tone = mix(.26, .95, isLand) * (.12 + .95 * l);
  tone *= 1. - .25 * step(.47, abs(fract(sp.y * 3.82) - .5)) * (1. - isLand);     // faint parallels on the sea
  gl_FragColor = vec4(vec3(tone), 1.);
}`;

export function mount(el, props = defaults) {
  const {T, scene, camera, light, shader, flat, mesh, play} = xeroxStage(el, {dots: 1, grain: .16, cells: 62, contrast: 1.15});
  const tilt = new T.Group(), globe = new T.Group(); tilt.add(globe); scene.add(tilt); tilt.rotation.z = -props.tilt * Math.PI / 180;
  mesh(new T.SphereGeometry(3, 56, 40), shader(VERT, GLOBE, {uLight: {value: light}}, {extensions: {derivatives: true}}), globe);
  const lat = props.pin.lat * Math.PI / 180, lon = props.pin.lon * Math.PI / 180, pin = new T.Group(); globe.add(pin);
  pin.position.set(Math.cos(lat) * Math.cos(lon) * 3, Math.sin(lat) * 3, Math.cos(lat) * Math.sin(lon) * 3); pin.lookAt(pin.position.clone().multiplyScalar(2));
  const stick = mesh(new T.CylinderGeometry(.03, .03, .8, 6), flat(C.bone), pin); stick.rotation.x = Math.PI / 2; stick.position.z = .4;
  mesh(new T.SphereGeometry(.26, 12, 10), flat(C.red), pin).position.z = .85;
  // Three slightly different hand-drawn orbits, swapped by boil step.
  const orbits = [0, 1, 2].map(k => { const pts = []; for (let i = 0; i <= 80; i++) { const a = i / 80 * Math.PI * 2.9 - 1, r = 4.25 + i * .006 + Math.sin(a * 3 + k * 2) * .09; pts.push(new T.Vector3(Math.cos(a) * r, Math.sin(a * 2 + k) * .07, Math.sin(a) * r)); }
    const m = mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 120, .055, 5), flat(C.red), tilt); m.rotation.x = .38; return m; });
  light.set(.7, .45, .55);
  return play((th, t, s) => {
    globe.rotation.y = th / meta.duration * Math.PI * 2;
    const j = jit(Math.floor(th * 12 / 2), 2, .03, .01); tilt.position.set(j.x, j.y, 0); tilt.rotation.x = .25 + j.r;
    orbits.forEach((o, i) => { o.visible = i === s % 3; });
    camera.position.set(0, 0, 14.5 * Math.max(1, 1.02 / camera.aspect)); camera.lookAt(0, 0, 0);
  });
}
