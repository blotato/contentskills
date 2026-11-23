import {scene, hex, C, clamp, span, mix, easeInOut, easeOut, hash, noise, lamp, step} from './_scene.js';

// A shaft of cold light falling through a barred window into a dark room, with dust turning
// slowly inside it. The light wavers as if something passes outside. Loops.
export const meta = {duration: 10, live: true, loop: true};
export const defaults = {light: '#b9c8ee', motes: 420};

export function mount(el, props = defaults) {
  const s = scene(el, {background: '#030406', fov: 42, z: 9, flicker: 0}), {T} = s, col = new T.Color(props.light), win = new T.Vector3(2.4, 3.6, -3), hit = new T.Vector3(-1.6, -3.2, 1.5);
  const frame = new T.Group(); frame.position.copy(win); frame.rotation.y = -.5; s.scene.add(frame); const pane = new T.Mesh(new T.PlaneGeometry(2, 2.8), new T.MeshBasicMaterial({color: hex(props.light)})); frame.add(pane);
  [-.5, 0, .5].forEach(x => { const b = new T.Mesh(new T.PlaneGeometry(.09, 2.8), new T.MeshBasicMaterial({color: 0x030406})); b.position.set(x * 1.3, 0, .01); frame.add(b); }); [-.5, .5].forEach(y => { const b = new T.Mesh(new T.PlaneGeometry(2, .09), new T.MeshBasicMaterial({color: 0x030406})); b.position.set(0, y * 1.4, .01); frame.add(b); });
  const halo = s.glow(props.light, 9, .5); halo.position.copy(win); s.scene.add(halo);
  // The shaft: a few stacked translucent quads from the window to the floor, brightest at the window.
  const beamMat = new T.ShaderMaterial({transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide, uniforms: {c: {value: new T.Vector3(col.r, col.g, col.b)}, k: {value: 1}},
    vertexShader: 'varying vec2 v; void main(){ v = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: 'precision highp float; varying vec2 v; uniform vec3 c; uniform float k; void main(){ float bars = .55 + .45 * smoothstep(.1, .0, abs(fract(v.x * 4.) - .5) - .38); float a = pow(1. - v.y, 1.6) * smoothstep(0., .12, v.x) * smoothstep(1., .88, v.x) * bars; gl_FragColor = vec4(c * a * .2 * k, 1.); }'});
  const beams = [-.5, 0, .5].map(o => { const g = new T.BufferGeometry(), a = win.clone().add(new T.Vector3(-.9, 0, o * .8)), b = win.clone().add(new T.Vector3(.9, 0, o * .8)), c2 = hit.clone().add(new T.Vector3(1.9, 0, o * 2.2)), d = hit.clone().add(new T.Vector3(-1.9, 0, o * 2.2));
    g.setAttribute('position', new T.Float32BufferAttribute([a.x, a.y, a.z, b.x, b.y, b.z, c2.x, c2.y, c2.z, a.x, a.y, a.z, c2.x, c2.y, c2.z, d.x, d.y, d.z], 3)); g.setAttribute('uv', new T.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2)); const m = new T.Mesh(g, beamMat); s.scene.add(m); return m; });
  const floor = s.glow(props.light, 7, .35); floor.rotation.x = -Math.PI / 2; floor.position.set(hit.x, -3.19, hit.z); floor.scale.set(1, 1.5, 1); s.scene.add(floor);
  const n = props.motes, pos = new Float32Array(n * 3), geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3));
  const dust = new T.Points(geo, new T.PointsMaterial({color: hex(props.light), size: .09, transparent: true, opacity: .8, map: s.glow('#fff', 1).material.map, depthWrite: false, blending: T.AdditiveBlending})); s.scene.add(dust);
  return {seek(t) {
    const q = (t / meta.duration) % 1, v = .75 + .25 * Math.sin(q * Math.PI * 2) * Math.sin(q * Math.PI * 6) - (hash(step(t, 12), 3) < .05 ? .4 : 0); beamMat.uniforms.k.value = v; pane.material.color.setScalar(.6 * v + .2).multiply(col); halo.material.opacity = .5 * v; floor.material.opacity = .35 * v; dust.material.opacity = .8 * v;
    for (let i = 0; i < n; i++) { const u = (hash(i, 1) + q * (1 + Math.floor(hash(i, 2) * 2))) % 1, w = hash(i, 3) * 2 - 1, d = hash(i, 4) * 2 - 1, spread = .9 + u * 1.2;
      pos[i * 3] = mix(win.x, hit.x, u) + w * spread + Math.sin(q * Math.PI * 2 + i) * .12; pos[i * 3 + 1] = mix(win.y, hit.y, u) + Math.cos(q * Math.PI * 2 * 2 + i) * .1; pos[i * 3 + 2] = mix(win.z, hit.z, u) + d * (.4 + u * 1.1); }
    geo.attributes.position.needsUpdate = true; s.camera.position.set(Math.sin(q * Math.PI * 2) * .3, 0, 9); s.camera.lookAt(.3, .2, 0); s.finish(t);
  }};
}
