import {C, stage, txt, label, fit, pad2, draw, clipBox, leave, fade, glide, span, swell, mix, clamp} from '../../kit.js';
import {inks, plate, small, pointer, typeLine, check, loadImages, spring} from './_ui.js';

// A storyboard laid out for review, like a contact sheet. Shot cards are dealt onto the sheet at their
// cues (they overshoot and settle), each with its picture, number and a short label; an accent frame
// steps through them ("shot by shot"); then the pointer picks one, it is shown large, a note types itself
// beside it and a tick marks the note as applied.
//   shots: [{title}]            images: one picture address per shot, from the server root (optional: blank cards without)
//   times: when each card lands   steps: [{shot, at}] the accent frame's stops   note: {text, shot, at, seconds, done}
//   layout: 'strip' (a filmstrip row with the current shot enlarged underneath, `big` px wide) or 'grid' (rows of cards; the picked one grows)
// (x, y) is the top-left of the sheet, `w` its width. Pictures are decoded before mount resolves, so seek(t) stays pure.
export const meta = {duration: 5, live: true};
export const defaults = {title: 'Storyboard', kicker: 'For review', layout: 'strip', big: 300, cols: 3, times: null, step: .12, startAt: .2, steps: null, images: null,
  note: {text: 'Tighter here', shot: 1, at: 2.2, seconds: .5, done: 'Applied'},
  shots: [{title: 'Hook'}, {title: 'Problem'}, {title: 'Idea'}, {title: 'Proof'}, {title: 'How'}, {title: 'Ask'}], x: 70, y: 600, w: 940, theme: 'bone', accent: 'poppy'};

export async function mount(el, props = defaults) {
  const pics = await loadImages(props.images ?? []), st = stage(el, {mode: 'overlay', accent: props.accent}), ink = inks(props.theme), {x, y, w} = props, n = props.shots.length, strip = props.layout !== 'grid', pad = 44;
  const cols = strip ? n : props.cols, rowsN = Math.ceil(n / cols), gap = strip ? 14 : 20, cw = (w - pad * 2 - gap * (cols - 1)) / cols, ph = strip ? cw * 1.5 : cw * 1.04, ch = ph + (strip ? 0 : 58), top = 92;
  const bigW = props.big, bigH = bigW * 16 / 9, bigY = top + ch + 34, noteH = strip ? 0 : 116, h = strip ? bigY + bigH + pad : top + rowsN * ch + (rowsN - 1) * gap + 26 + noteH + 20;
  const g = st.root.append('g'), sheet = g.append('g'); plate(sheet, st, x, y, w, h, props.theme);
  small(sheet, x + pad, y + 58, props.title, ink, {color: ink.head}); small(sheet, x + w - pad, y + 58, props.kicker, ink, {anchor: 'end'});
  const tone = i => props.theme === 'ink' ? ['#1A2238', '#222B44', '#151C2F'][i % 3] : ['#D6DFEE', '#C9D4E6', '#E4EAF4'][i % 3];
  const picture = (parent, i, pw, phh) => { const c = parent.append('g'); c.append('rect').attr('width', pw).attr('height', phh).attr('fill', tone(i));
    if (pics[i]) c.append('image').attr('href', pics[i]).attr('width', pw).attr('height', phh).attr('preserveAspectRatio', 'xMidYMid slice').attr('clip-path', clipBox(st, 0, 0, pw, phh)); return c; };
  const cards = props.shots.map((shot, i) => {
    const cx = x + pad + (i % cols) * (cw + gap), cy = y + top + Math.floor(i / cols) * (ch + gap), card = sheet.append('g'), inner = picture(card, i, cw, ph);
    if (strip) { inner.append('rect').attr('width', 46).attr('height', 40).attr('fill', C.ink); txt(inner, 23, 30, pad2(i + 1), {size: 28, role: 'num', color: C.white, anchor: 'middle'}); }
    else { txt(card, 0, ph + 44, pad2(i + 1), {size: 42, role: 'num', color: ink.head}); label(card, 52, ph + 40, shot.title, {size: Math.min(22, fit(String(shot.title).toUpperCase(), cw - 56, 22 * 1.18, {role: 'label'}) / 1.18), color: ink.head}); }
    return {card, cx, cy, at: props.times?.[i] ?? props.startAt + i * props.step};
  });
  const steps = props.steps ?? [], note = props.note, pick = note ? Math.min(n - 1, note.shot ?? 0) : 0, ring = sheet.append('rect').attr('fill', 'none').attr('stroke', st.ink.accent).attr('stroke-width', 7);
  /** The shot the accent frame is on at t, and the time it got there. */
  const current = t => { let s = {shot: -1, at: 0}; for (const k of steps) if (t >= k.at) s = k; if (note && t >= note.at) s = {shot: pick, at: note.at}; return s; };
  // strip: the enlarged shot under the row, with its number and label beside it
  const bx = x + pad, by = y + bigY, bigs = strip ? props.shots.map((shot, i) => { const b = sheet.append('g').attr('transform', `translate(${bx} ${by})`), frame = b.append('g'); frame.append('rect').attr('width', bigW).attr('height', bigH).attr('fill', '#000').attr('filter', st.lift); picture(frame, i, bigW, bigH);
    const side = b.append('g'), tx = bigW + 44; txt(side, tx, 170, pad2(i + 1), {size: 220, role: 'num', color: ink.head}); const t = String(shot.title).toUpperCase(); txt(side, tx, 262, t, {size: Math.min(68, fit(t, w - pad * 2 - tx, 60, {role: 'wide'})), role: 'wide', color: ink.head}); return {b, frame, side}; }) : [];
  // the note: typed beside the enlarged shot (strip) or along the bottom of the sheet (grid)
  const nx = strip ? bx + bigW + 44 : x + pad + 62, ny = strip ? by + 430 : y + h - noteH + 62, nw = strip ? w - pad * 2 - bigW - 44 : w - pad * 2 - 90;
  const noteG = sheet.append('g'), line = note ? typeLine(noteG, nx + (strip ? 0 : 0), ny, note.text, {size: Math.min(strip ? 54 : 46, fit(note.text, nw, strip ? 54 : 46, {role: 'bold'})), color: ink.head, role: 'bold', caret: st.ink.accent}) : null;
  if (note) { noteG.append('rect').attr('x', strip ? nx : x + pad).attr('y', ny - 78).attr('width', strip ? nw : w - pad * 2).attr('height', 2).attr('fill', ink.line).attr('opacity', ink.faint); if (strip) small(noteG, nx, ny - 96, 'Note', ink); else noteG.append('circle').attr('cx', x + pad + 22).attr('cy', ny - 16).attr('r', 20).attr('fill', st.ink.accent); }
  const doneG = sheet.append('g'), dy0 = strip ? ny + 84 : ny, dx0 = strip ? nx : x + w - pad - 250, tick = check(doneG, dx0, dy0 - 40, 46, st.ink.accent, 6), doneT = note?.done ? small(doneG, dx0 + 60, dy0 - 4, note.done, ink, {color: st.ink.accent, size: 26}) : null;
  const hand = note ? pointer(g, st, {accent: st.ink.accent}) : null, target = cards[pick];
  return {
    seek(t) {
      const out = leave(t, props.life, .22), into = glide(span(t, 0, .26));
      g.attr('opacity', fade(t, 0, .1) * (1 - out)); sheet.attr('transform', `translate(0 ${(1 - into) * 70 + out * 30})`);
      const now = current(t), grown = note && !strip ? swell(span(t, note.at + .04, .3)) : 0;
      cards.forEach(({card, cx, cy, at}, i) => {
        const q = spring(span(t, at, .3)), up = i === pick ? grown : 0, s = mix(1.5, 1, Math.min(1.2, q)) * (1 + .16 * up);
        card.attr('transform', `translate(${cx + cw / 2} ${cy + ch / 2 + (1 - q) * 60}) scale(${s}) translate(${-cw / 2} ${-ch / 2})`).attr('opacity', clamp((t - at) / .08) * (i === pick || !grown ? 1 : 1 - .45 * grown));
        if (up > 0) card.raise();
      });
      const on = cards[now.shot], rq = on ? glide(span(t, now.at, .16)) : 0, m = 12 * (1 - rq) + 5, k = on && now.shot === pick ? 1 + .16 * grown : 1;
      if (on) ring.attr('x', on.cx + cw / 2 - cw * k / 2 - m).attr('y', on.cy + ch / 2 - ch * k / 2 - m).attr('width', cw * k + 2 * m).attr('height', (strip ? ph : ph) * k + (strip ? 0 : 58 * k) + 2 * m).raise(); ring.attr('opacity', on ? clamp((t - now.at) / .06) : 0);
      bigs.forEach(({b, frame, side}, i) => { const act = i === now.shot, q = act ? spring(span(t, now.at, .26)) : 0; b.attr('opacity', act ? clamp((t - now.at) / .07) : 0); frame.attr('transform', `translate(${bigW / 2} ${bigH / 2}) scale(${mix(.86, 1, q)}) translate(${-bigW / 2} ${-bigH / 2})`); side.attr('transform', `translate(${(1 - glide(span(t, now.at, .22))) * 40} 0)`); });
      if (!note) { doneG.attr('opacity', 0); return; }
      const typing = note.at + .22, secs = note.seconds ?? Math.max(.4, note.text.length * .04), done = typing + secs + .08;
      noteG.attr('opacity', fade(t, note.at + .08, .16)); line.node.attr('opacity', t >= typing - .02 ? 1 : 0); line.bar.attr('visibility', t >= typing - .02 ? null : 'hidden'); line.set(t, typing, secs, t > done + .2);
      doneG.attr('opacity', clamp((t - done) / .08)); draw(tick, glide(span(t, done, .22))); doneT?.attr('opacity', fade(t, done + .06, .16));
      const px = target.cx + cw * .62, py = target.cy + ph * .66;
      hand.set(t, [{t: note.at - .5, x: x + w - 60, y: y + h + 90}, {t: note.at - .03, x: px, y: py, move: .4}, {t: note.at + .5, x: px, y: py}, {t: note.at + 1, x: px + 90, y: py + 220, move: .5}], [note.at], 1 - fade(t, note.at + .7, .3));
    },
  };
}
