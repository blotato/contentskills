import {scene, hex, C, clamp, span, mix, easeInOut, easeOut, hash, noise, lamp, step} from './_scene.js';

// A full moon behind torn cloud: the clouds drift across and smother it, the light comes and goes,
// and a horizon of black treetops sits along the bottom. Drawn in one shader. Loops.
export const meta = {duration: 12, live: true, loop: true};
export const defaults = {tint: '#8f9fd0', moon: [.5, .64], size: .13};

export function mount(el, props = defaults) {
  const s = scene(el, {background: '#04060c', fov: 40, z: 1, flicker: .2}), {T} = s, c = new T.Color(props.tint);
  const mat = new T.ShaderMaterial({uniforms: {q: {value: 0}, aspect: {value: 1}, tint: {value: new T.Vector3(c.r, c.g, c.b)}, moon: {value: new T.Vector2(...props.moon)}, size: {value: props.size}}, depthTest: false,
    vertexShader: 'varying vec2 v; void main(){ v = uv; gl_Position = vec4(position.xy, 0., 1.); }',
    fragmentShader: `precision highp float; varying vec2 v; uniform float q, aspect, size; uniform vec3 tint; uniform vec2 moon;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(h(i), h(i + vec2(1., 0.)), f.x), mix(h(i + vec2(0., 1.)), h(i + vec2(1., 1.)), f.x), f.y); }
      float fbm(vec2 p){ float a = .5, s = 0.; for (int i = 0; i < 5; i++) { s += a * n(p); p = p * 2.03 + 7.1; a *= .5; } return s; }
      void main(){
        vec2 p = vec2((v.x - .5) * aspect, v.y - .5), m = vec2((moon.x - .5) * aspect, moon.y - .5); float d = length(p - m), ang = q * 6.2831853;
        vec2 drift = vec2(cos(ang), sin(ang)) * 1.6;                                   // a circle in noise space, so the loop closes
        float cl = fbm(p * 2.6 + drift + vec2(0., 3.)) * .6 + fbm(p * 5.2 - drift.yx * 1.3) * .4; cl = smoothstep(.36, .72, cl);
        float disc = smoothstep(size, size - .006, d), spots = fbm((p - m) * 22.) * .22;
        float halo = exp(-d * 5.5) * .55 + exp(-d * 1.6) * .22;
        vec3 col = vec3(.012, .016, .03) + tint * halo * (1. - cl * .55) + vec3(.9, .93, 1.) * disc * (1. - spots) * (1. - cl * .93);
        col += tint * cl * (.09 + .6 * exp(-d * 3.2));                                 // clouds lit from behind near the moon
        float ridge = .11 + .05 * n(vec2(v.x * 9., 1.)) + .035 * n(vec2(v.x * 40., 2.)) + .02 * step(.6, n(vec2(v.x * 90., 3.))) * n(vec2(v.x * 300., 4.));
        col *= smoothstep(ridge - .004, ridge + .004, v.y);
        gl_FragColor = vec4(col, 1.); }`});
  const quad = new T.Mesh(new T.PlaneGeometry(2, 2), mat); quad.frustumCulled = false; s.scene.add(quad);
  return {seek(t) { mat.uniforms.q.value = (t / meta.duration) % 1; mat.uniforms.aspect.value = s.camera.aspect; s.finish(t); }};
}
