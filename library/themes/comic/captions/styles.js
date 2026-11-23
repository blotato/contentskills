// Comic Book theme caption styles. See /library/_shared/captions.js for the engine.
// Everything is flat colour, black ink and hard shadows; words pop on with the theme's overshoot.
import {esc, bare, clamp, back, eachWord} from '/library/_shared/captions.js';

const INK = '#16121c', PAPER = '#f7edd0', WHITE = '#fffbf0', RED = '#e2242c', YELLOW = '#ffd61e', BLUE = '#2767d9', SKY = '#49b8ea';
/** 0 -> 1 with an overshoot over `len` seconds after a word starts. */
const pop = (w, t, len = .16) => back((t - w.start) / len);
/** A small fixed tilt per word, so lettering looks placed by hand. */
const tilt = (i, by = 3) => ((i * 7919) % 5 - 2) / 2 * by;

export const styles = [
  {
    id: 'caption-box', name: 'Caption box', font: 'Comic Neue',
    description: 'Hand-lettered caps in a yellow caption box with an ink border and hard shadow; the spoken word flips to a red box. The theme default — reads over any footage.',
    group: {maxWords: 4, maxChars: 20},
    css: `.cap-caption-box{bottom:17%;font:700 6.4cqw/1.5 "Comic Neue";text-transform:uppercase;color:${INK}}
          .cap-caption-box .box{display:inline-block;background:${YELLOW};border:.65cqw solid ${INK};box-shadow:1.1cqw 1.1cqw 0 ${INK};padding:.25em .55em;transform:rotate(-1.5deg)}
          .cap-caption-box span{display:inline-block;padding:0 .18em;margin:0 -.04em}
          .cap-caption-box span.on{background:${RED};color:${WHITE};box-shadow:0 0 0 .35cqw ${INK}}`,
    render: (p, t) => `<div class="box">${eachWord(p, t, (w, i, on) => `<span class="${on ? 'on' : ''}"${on ? ` style="transform:scale(${(.85 + .15 * pop(w, t)).toFixed(3)}) rotate(${tilt(i)}deg)"` : ''}>${esc(bare(w.text))}</span>`)}</div>`,
  },
  {
    id: 'shout', name: 'Shout', font: 'Bangers',
    description: 'Big slanted comic caps in white with a thick ink outline and hard shadow; the spoken word turns yellow, grows and tilts.',
    group: {maxWords: 3, maxChars: 16},
    css: `.cap-shout{bottom:17%;font:400 10.6cqw/1.25 Bangers;letter-spacing:.04em;text-transform:uppercase;color:${WHITE}}
          .cap-shout span{display:inline-block;margin:0 .1em;-webkit-text-stroke:1.7cqw ${INK};paint-order:stroke fill;text-shadow:.9cqw .9cqw 0 ${INK}}
          .cap-shout span.on{color:${YELLOW}}`,
    render: (p, t) => eachWord(p, t, (w, i, on) => `<span class="${on ? 'on' : ''}"${on ? ` style="transform:scale(${(1 + .22 * pop(w, t)).toFixed(3)}) rotate(${-4 + tilt(i, 2)}deg)"` : ''}>${esc(bare(w.text))}</span>`),
  },
  {
    id: 'balloon', name: 'Speech balloon', font: 'Comic Neue',
    description: 'A white speech balloon with an ink outline and a tail; words are lettered in as they are spoken and the balloon pops on with each phrase.',
    group: {maxWords: 4, maxChars: 20},
    css: `.cap-balloon{bottom:18%;font:700 6.1cqw/1.3 "Comic Neue";text-transform:uppercase;color:${INK}}
          .cap-balloon .b{position:relative;display:inline-block;background:${WHITE};border:.65cqw solid ${INK};border-radius:5cqw;box-shadow:1.1cqw 1.1cqw 0 ${INK};padding:.5em .95em}
          .cap-balloon .b:before{content:"";position:absolute;left:24%;top:-3.1cqw;width:5cqw;height:5cqw;background:${WHITE};border-left:.65cqw solid ${INK};border-top:.65cqw solid ${INK};transform:skewX(28deg) rotate(45deg) scale(.8,1.25);transform-origin:50% 50%}
          .cap-balloon span{display:inline-block}
          .cap-balloon span.on{color:${RED}}`,
    render: (p, t) => `<div class="b" style="transform:scale(${(.6 + .4 * back((t - p.start) / .2)).toFixed(3)})">${eachWord(p, t, (w, i, on, spoken) => `<span class="${on ? 'on' : ''}" style="${spoken ? `transform:scale(${(.5 + .5 * pop(w, t, .12)).toFixed(3)})` : 'visibility:hidden'}">${esc(w.text)}</span>`)}</div>`,
  },
  {
    id: 'ink-pop', name: 'Ink pop', font: 'Luckiest Guy',
    description: 'Each word slams in oversized as it is spoken and settles, in alternating primaries with an ink outline, as if stamped onto the page.',
    group: {maxWords: 3, maxChars: 15},
    css: `.cap-ink-pop{bottom:17%;font:400 9cqw/1.3 "Luckiest Guy";text-transform:uppercase}
          .cap-ink-pop span{display:inline-block;margin:0 .12em;-webkit-text-stroke:1.6cqw ${INK};paint-order:stroke fill;text-shadow:.85cqw .85cqw 0 ${INK}}`,
    render: (p, t) => eachWord(p, t, (w, i, on, spoken) => {
      const q = pop(w, t, .2), color = [YELLOW, SKY, YELLOW, WHITE][i % 4];
      return `<span style="color:${on ? color : WHITE};${spoken ? `transform:scale(${(2.1 - 1.1 * q).toFixed(3)}) rotate(${((1 - q) * (i % 2 ? 9 : -9) + tilt(i, 2.5)).toFixed(2)}deg)` : 'visibility:hidden'}">${esc(bare(w.text))}</span>`;
    }),
  },
  {
    id: 'slab-plate', name: 'Slab plate', font: 'Bebas Neue',
    description: 'Condensed caps on a slanted red plate with an ink edge and hard shadow, like a lower-third slab; the spoken word sits on its own yellow plate.',
    group: {maxWords: 4, maxChars: 18},
    css: `.cap-slab-plate{bottom:17%;font:400 8.4cqw/1.2 "Bebas Neue";letter-spacing:.05em;text-transform:uppercase;color:${WHITE}}
          .cap-slab-plate .p{display:inline-block;background:${RED};border:.6cqw solid ${INK};box-shadow:1.1cqw 1.1cqw 0 ${INK};padding:.16em .5em .08em;transform:skewX(-9deg) rotate(-1.5deg)}
          .cap-slab-plate span{display:inline-block;padding:0 .16em;transform:skewX(9deg)}
          .cap-slab-plate span.on{background:${YELLOW};color:${INK};box-shadow:0 0 0 .4cqw ${INK}}`,
    render: (p, t) => `<div class="p">${eachWord(p, t, (w, i, on) => `<span class="${on ? 'on' : ''}"${on ? ` style="transform:skewX(9deg) scale(${(.8 + .2 * pop(w, t)).toFixed(3)})"` : ''}>${esc(bare(w.text))}</span>`)}</div>`,
  },
  {
    id: 'sound-effect', name: 'Sound effect', font: 'Bangers',
    description: 'One word at a time, huge, filled with Ben-Day dots and inked like a sound effect; each word bursts in and tilts the other way. For punchy lines.',
    group: {maxWords: 1, maxChars: 12},
    css: `.cap-sound-effect{bottom:18%;font:400 18cqw/1.1 Bangers;letter-spacing:.04em;text-transform:uppercase}
          .cap-sound-effect .s{display:inline-grid}
          .cap-sound-effect .s>*{grid-area:1/1;padding:0 .12em}
          .cap-sound-effect .back{color:${INK};-webkit-text-stroke:2.4cqw ${INK};text-shadow:1.3cqw 1.3cqw 0 ${INK}}
          .cap-sound-effect .front{color:transparent;background:radial-gradient(circle,${RED} 0 34%,transparent 37%) 0 0/3cqw 3cqw,radial-gradient(circle,${RED} 0 34%,transparent 37%) 1.5cqw 1.5cqw/3cqw 3cqw,linear-gradient(${YELLOW},${YELLOW});-webkit-background-clip:text;background-clip:text}`,
    render: (p, t) => {
      const w = p.words[0], q = back((t - w.start) / .18), n = Math.round(w.start * 10), text = esc(bare(w.text));
      return `<div class="s" style="transform:scale(${(.4 + .6 * q).toFixed(3)}) rotate(${n % 2 ? 5 : -6}deg)"><span class="back">${text}</span><span class="front">${text}</span></div>`;
    },
  },
];
