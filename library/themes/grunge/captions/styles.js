// Grunge theme caption styles. See /library/_shared/captions.js for the engine.
// Everything is a pure function of (phrase, t); the wobble is a seeded step at 8 fps, like the rest of the theme.
import {esc, bare, clamp, eachWord} from '/library/_shared/captions.js';

const h = (n, s = 0) => { const x = Math.sin(n * 127.1 + s * 311.7 + 74.7) * 43758.5453; return x - Math.floor(x); };
const boil = t => Math.floor(t * 8);
/** Ragged strip edges as a clip-path polygon, different per seed. */
const torn = seed => { const pts = []; for (let i = 0; i <= 10; i++) pts.push(`${i * 10}% ${(h(i, seed) * 14).toFixed(1)}%`); for (let i = 10; i >= 0; i--) pts.push(`${i * 10}% ${(100 - h(i, seed + 5) * 14).toFixed(1)}%`); return `polygon(${pts.join(',')})`; };
const shadow = '0 0 1.2cqw #000,0 .3cqw .6cqw #000,0 0 .4cqw #000';

export const styles = [
  {
    id: 'torn-word', name: 'Torn word', font: 'Montserrat',
    description: 'Heavy bone capitals; the spoken word sits on a scrap of red paper torn at both edges, tilted a little differently each time. The theme default.',
    group: {maxWords: 3, maxChars: 16},
    css: `.cap-torn-word{bottom:17%;font:900 7.2cqw/1.45 Montserrat;color:#ece6d8;text-transform:uppercase;letter-spacing:-.01em;text-shadow:${shadow}}
          .cap-torn-word span{display:inline-block;padding:.02em .2em}
          .cap-torn-word span.on{background:#f2440f;color:#0b0a09;text-shadow:none;filter:drop-shadow(.3cqw .4cqw 0 #0b0a09)}`,
    render: (p, t) => eachWord(p, t, (w, i, on) => on ? `<span class="on" style="clip-path:${torn(i + w.start * 10)};transform:rotate(${((h(i, w.start) - .5) * 5 + (h(boil(t), i) - .5) * 1.4).toFixed(2)}deg)">${esc(bare(w.text))}</span>` : `<span>${esc(bare(w.text))}</span>`),
  },
  {
    id: 'highlighter', name: 'Highlighter', font: 'Montserrat',
    description: 'Bone capitals; a lime marker stroke is dragged behind each word as it is spoken and the word turns black.',
    group: {maxWords: 3, maxChars: 16},
    css: `.cap-highlighter{bottom:17%;font:900 7cqw/1.45 Montserrat;color:#ece6d8;text-transform:uppercase;text-shadow:${shadow}}
          .cap-highlighter span{display:inline-block;padding:0 .16em;position:relative}
          .cap-highlighter span.on{color:#0b0a09;text-shadow:none}
          .cap-highlighter span.on i{position:absolute;left:0;top:.12em;bottom:.1em;background:#b9f227;z-index:-1;border-radius:.1em .3em .12em .25em;transform:skewX(-8deg) rotate(-1.2deg)}`,
    render: (p, t) => eachWord(p, t, (w, i, on) => on ? `<span class="on"><i style="width:${(clamp((Math.floor((t - w.start) * 24) / 24) / .12) * 100).toFixed(0)}%"></i>${esc(bare(w.text))}</span>` : `<span>${esc(bare(w.text))}</span>`),
  },
  {
    id: 'typewriter', name: 'Typewriter', font: 'Special Elite',
    description: 'The line is typed onto a strip of bone paper letter by letter behind a block cursor. For notes, asides and anything read out.',
    group: {maxWords: 4, maxChars: 22},
    css: `.cap-typewriter{bottom:17%;font:400 5.4cqw/1.5 "Special Elite";color:#0b0a09;text-transform:uppercase}
          .cap-typewriter span{background:#ece6d8;padding:.34em .55em .22em;box-decoration-break:clone;-webkit-box-decoration-break:clone;box-shadow:.35cqw .45cqw 0 #0b0a09}
          .cap-typewriter i{display:inline-block;width:.5em;height:.9em;background:#f2440f;vertical-align:-.1em;margin-left:.1em}`,
    render: (p, t) => {
      let text = '';
      for (const w of p.words) { if (t < w.start) break; const q = clamp((t - w.start) / Math.max(.08, w.end - w.start)); text += (text ? ' ' : '') + w.text.slice(0, Math.ceil(w.text.length * q)); }
      return `<span style="display:inline;transform:rotate(-1deg)">${esc(text)}<i style="opacity:${Math.floor(t * 4) % 2 ? .2 : 1}"></i></span>`;
    },
  },
  {
    id: 'stamp-word', name: 'Stamp word', font: 'Anton',
    description: 'One tall condensed word at a time, stamped down oversized and crooked in red, then settling; the shout style.',
    group: {maxWords: 1, maxChars: 14},
    css: `.cap-stamp-word{bottom:18%;font:400 13cqw/1.1 Anton;color:#f2440f;text-transform:uppercase;letter-spacing:.01em;text-shadow:.5cqw .6cqw 0 #0b0a09,0 0 1.4cqw #000}
          .cap-stamp-word span{display:inline-block}`,
    render: (p, t) => eachWord(p, t, (w, i, on) => { const d = Math.floor((t - w.start) * 24) / 24, s = d < .04 ? 1.9 : d < .08 ? 1.3 : d < .12 ? .94 : 1, r = (h(w.start * 7, 1) - .5) * 7 + (h(boil(t), 2) - .5) * 1.2; return `<span style="transform:scale(${s}) rotate(${r.toFixed(2)}deg);opacity:${d < .04 ? .7 : 1}">${esc(bare(w.text))}</span>`; }),
  },
  {
    id: 'ransom', name: 'Ransom', font: 'Montserrat',
    description: 'Every word on its own cut-out scrap (bone, black or red, in three different faces) stuck down as it is spoken and left jittering.',
    group: {maxWords: 3, maxChars: 16},
    css: `.cap-ransom{bottom:17%;font:900 6.2cqw/1.7 Montserrat;text-transform:uppercase}
          .cap-ransom span{display:inline-block;padding:.12em .28em .06em;margin:0 .06em;box-shadow:.3cqw .4cqw 0 #0b0a09}
          .cap-ransom .a{background:#ece6d8;color:#0b0a09}.cap-ransom .b{background:#0b0a09;color:#ece6d8;font-family:Anton;font-weight:400;font-size:1.2em;outline:.08em solid #ece6d8}
          .cap-ransom .c{background:#f2440f;color:#0b0a09;font-family:"Special Elite";font-weight:400}.cap-ransom .d{background:#d6cdb9;color:#f2440f;font-family:Unbounded;font-size:.8em}`,
    render: (p, t) => eachWord(p, t, (w, i, on, spoken) => { const k = Math.floor(h(i, w.start * 3) * 4), r = (h(i, w.start) - .5) * 9 + (h(boil(t), i + 3) - .5) * 1.6; return `<span class="${'abcd'[k]}" style="transform:rotate(${r.toFixed(2)}deg) scale(${on && t - w.start < .08 ? 1.25 : 1});visibility:${spoken ? 'visible' : 'hidden'}">${esc(bare(w.text))}</span>`; }),
  },
  {
    id: 'marker', name: 'Marker', font: 'Permanent Marker',
    description: 'Handwritten in fat marker; the spoken word is red and gets a scratchy double underline.',
    group: {maxWords: 4, maxChars: 20},
    css: `.cap-marker{bottom:17%;font:400 7cqw/1.4 "Permanent Marker";color:#ece6d8;text-shadow:${shadow}}
          .cap-marker span{display:inline-block}
          .cap-marker span.on{color:#f2440f;border-bottom:.09em solid #f2440f;box-shadow:0 .16em 0 -.05em #f2440f;border-radius:0 0 40% 12%/0 0 .14em .1em}`,
    render: (p, t) => eachWord(p, t, (w, i, on) => `<span class="${on ? 'on' : ''}" style="transform:rotate(${((h(i, p.start) - .5) * 4 + (h(boil(t), i) - .5) * 1.2).toFixed(2)}deg)">${esc(bare(w.text))}</span>`),
  },
];
