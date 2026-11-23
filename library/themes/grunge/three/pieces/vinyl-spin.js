import {xeroxStage, font, VERT, C, jit} from './_fx.js';

// A record half out of its torn paper sleeve, spinning in held steps: grooves catch the light in two
// turning wedges, the red label carries props.label. Photocopied to dots and grain. Loops.
export const meta = {duration: 4, loop: true};
export const defaults = {label: 'SIDE A', sleeve: 'NOISE & CO.'};

const DISC = /* glsl */`
uniform sampler2D tLabel; uniform float uSpin; varying vec3 vObj;
void main() {
  float r = length(vObj.xy), a = atan(vObj.y, vObj.x);
  if (r < .08) discard;
  float groove = .5 + .5 * sin(r * 150.) * step(1.12, r) * step(r, 2.86);
  float band = step(.975, fract(r * 1.9 + .3)) * step(1.15, r);                        // gaps between tracks
  float sheen = pow(abs(cos(a - .6)), 14.) + .5 * pow(abs(cos(a + 1.1)), 30.);          // light does not turn with the disc
  float tone = .05 + groove * .09 + sheen * (.55 + .3 * groove) - band * .05;
  vec3 col = vec3(tone);
  if (r < 1.05) {
    float c = cos(uSpin), s = sin(uSpin); vec2 q = mat2(c, s, -s, c) * vObj.xy / 2.1 + .5;
    vec3 lab = texture2D(tLabel, q).rgb; col = lab * (.8 + .3 * sheen);
  }
  gl_FragColor = vec4(col, 1.);
}`;

export function mount(el, props = defaults) {
  const {T, scene, camera, light, shader, paper, flat, mesh, tex, grime, tornGeo, play} = xeroxStage(el, {dots: .75, grain: .2, cells: 95});
  const label = tex((ctx, w, h) => {
    ctx.fillStyle = C.red; ctx.fillRect(0, 0, w, h); grime(ctx, w, h, 5, false); ctx.fillStyle = '#141311'; ctx.textAlign = 'center';
    const text = String(props.label).toUpperCase(); let size = 110; ctx.font = font(size); size = Math.min(size, size * w * .62 / ctx.measureText(text).width); ctx.font = font(size); ctx.fillText(text, w / 2, h * .36);
    ctx.font = font(30, 'type'); ctx.fillText('33 RPM · STEREO', w / 2, h * .7); ctx.lineWidth = 5; ctx.strokeStyle = '#141311'; ctx.beginPath(); ctx.arc(w / 2, h / 2, w * .46, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(w * .2, h * .42); ctx.lineTo(w * .8, h * .42); ctx.stroke();
  }, 512, 512);
  const group = new T.Group(); scene.add(group);
  const discMat = shader(VERT, DISC, {tLabel: {value: label}, uSpin: {value: 0}}), disc = mesh(new T.CircleGeometry(3, 72), discMat, group); disc.position.set(2.3, .6, .1);
  const sleeveText = String(props.sleeve).toUpperCase();
  const sleeveMap = tex((ctx, w, h) => { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); grime(ctx, w, h, 8); ctx.fillStyle = '#141311'; ctx.fillRect(w * .08, h * .08, w * .84, h * .2); ctx.fillStyle = C.bone; ctx.textAlign = 'left'; let size = 90; ctx.font = font(size, 'cond'); size = Math.min(size, size * w * .76 / ctx.measureText(sleeveText).width); ctx.font = font(size, 'cond'); ctx.fillText(sleeveText, w * .12, h * .18 + size * .36);
    ctx.fillStyle = '#141311'; for (let i = 0; i < 9; i++) ctx.fillRect(w * .08, h * (.36 + i * .06), w * (.3 + ((i * 37) % 50) / 100), h * .012); ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(w * .76, h * .78, w * .11, 0, 7); ctx.fill(); }, 512, 512);
  const sleeve = new T.Group(); group.add(sleeve); sleeve.position.set(-1.7, -.6, .3); sleeve.rotation.z = .1;
  mesh(tornGeo(6.3, 6.3, 5, .1), flat('#050505'), sleeve).position.set(.14, -.16, -.05);
  mesh(tornGeo(6.3, 6.3, 5, .1), paper(C.bone, {map: sleeveMap, amb: .7, cut: 0}), sleeve);
  light.set(.3, .4, .85); group.rotation.set(-.42, .18, -.12);
  return play((th, t, s) => {
    const u = th / meta.duration; discMat.uniforms.uSpin.value = u * Math.PI * 4;
    const j = jit(Math.floor(th * 12 / 2), 4, .03, .008); group.position.set(j.x, j.y + .1, 0); group.rotation.z = -.12 + j.r; disc.position.x = 2.3 + .12 * Math.sin(u * Math.PI * 2);
    camera.position.set(.3, 0, 14.5 * Math.max(1, 1.04 / camera.aspect)); camera.lookAt(0, 0, 0);
  });
}
