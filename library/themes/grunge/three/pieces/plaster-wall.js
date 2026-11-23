import {xeroxStage, font, VERT, C, jit} from './_fx.js';

// A cracked plaster wall under a raking light that swings slowly across it, picking the cracks and
// lumps out and letting them go again. A word is stencilled on it in chipped red paint. Loops.
// A background: put a title or a diagram over it.
export const meta = {duration: 6, loop: true};
export const defaults = {word: 'LOUD', paint: true};

const WALL = /* glsl */`
uniform vec3 uLight; uniform sampler2D tWord; uniform float uPaint, uAspect; varying vec2 vUv;
float crack(vec2 p) {                                                              // thin valleys where warped noise crosses its midline
  vec2 w = p + vec2(fbm(p * 2.7 + 3.), fbm(p * 2.7 + 9.)) * .35;
  float a = abs(vnoise(w * .9 + 7.) - .5), b = abs(vnoise(w * 1.9 + 19.) - .5);
  return smoothstep(.012, 0., a) + .7 * smoothstep(.009, 0., b) * step(.5, vnoise(p * .8 + 2.));
}
float height(vec2 p) {
  float lump = fbm(p * 1.1) * .35 + fbm(p * 9.) * .1;
  float chip = smoothstep(.6, .63, fbm(p * 1.7 + 31.));                            // flaked-off patches
  return lump - crack(p) * .5 - chip * .22;
}
void main() {
  vec2 p = (vUv - .5) * vec2(uAspect, 1.) * 5.;
  float e = .012, h = height(p), hx = height(p + vec2(e, 0.)), hy = height(p + vec2(0., e));
  vec3 n = normalize(vec3(-(hx - h) / e * .16, -(hy - h) / e * .16, 1.));
  float l = max(dot(n, normalize(uLight)), 0.);
  float tone = (.3 + .3 * fbm(p * .7 + 3.)) * (.2 + 1.05 * l) * (1. - .55 * crack(p));
  vec3 col = vec3(tone);
  // chipped paint: the stencil mask, eaten where the plaster flaked
  vec2 wuv = (vUv - .5) / vec2(.84, .84 * uAspect * .39) + .5;
  float m = (wuv.x > 0. && wuv.x < 1. && wuv.y > 0. && wuv.y < 1.) ? texture2D(tWord, wuv).r : 0.;
  float worn = smoothstep(.3, .4, fbm(p * 6. + 2.) + .25 * fbm(p * 19.)) * (1. - .3 * smoothstep(.6, .63, fbm(p * 1.7 + 31.)));
  col = mix(col, RED * (.55 + .6 * l), m * worn * uPaint);
  gl_FragColor = vec4(col, 1.);
}`;

export function mount(el, props = defaults) {
  const {T, scene, camera, light, shader, mesh, tex, play, U} = xeroxStage(el, {dots: .35, grain: .26, cells: 130, contrast: 1.5});
  const word = String(props.word).toUpperCase();
  const map = tex((ctx, w, h) => { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; let size = 300; ctx.font = font(size, 'cond'); size = Math.min(size, size * w * .92 / ctx.measureText(word).width); ctx.font = font(size, 'cond'); ctx.fillText(word, w / 2, h / 2 + size * .37); }, 1024, 400);
  const mat = shader(VERT, WALL, {uLight: {value: light}, tWord: {value: map}, uPaint: {value: props.paint ? 1 : 0}, uAspect: {value: 1}});
  const wall = mesh(new T.PlaneGeometry(2, 2), mat); wall.frustumCulled = false;
  camera.position.set(0, 0, 5);
  return play((th, t, s) => {
    const u = th / meta.duration * Math.PI * 2, d = 5 * Math.tan(camera.fov * Math.PI / 360);
    wall.scale.set(d * camera.aspect * 1.04, d * 1.04, 1); mat.uniforms.uAspect.value = camera.aspect;
    const j = jit(Math.floor(th * 6), 3, .012, 0); wall.position.set(j.x, j.y, 0);
    light.set(Math.cos(u) * .95, .25 + Math.sin(u) * .5, .3 + .12 * Math.sin(u * 2));
  });
}
