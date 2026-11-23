// Lifestyle theme caption styles. See /library/_shared/captions.js for the engine.
// Soft and calm like the rest of the theme: words fade up as they are spoken (no pops, no bounces),
// cream type with a soft shadow straight on the footage, or ink on a slip of the theme's paper.
import {esc, bare, clamp, eachWord} from '/library/_shared/captions.js';

const paper = '#E8F1DA', cream = '#F5F8E9', ink = '#2B221C', leaf = '#6CAE48', sun = '#E9B44C';
const shadow = '0 .25cqw 1.6cqw #1c261899,0 0 .5cqw #1c261866';
/** 0..1: how far a word has faded up at t (over `len` seconds from its start). Eased, no overshoot. */
const up = (w, t, len = .22) => { const q = clamp((t - w.start) / len); return q * q * (3 - 2 * q); };
const fx = n => n.toFixed(3);

export const styles = [
  {
    id: 'soft-word', name: 'Soft word', font: 'Inter Tight',
    description: 'Bold lowercase in cream with a soft shadow; each word fades up from pale to full strength as it is spoken. The theme default.',
    group: {maxWords: 4, maxChars: 20},
    css: `.cap-soft-word{bottom:17%;font:800 7.4cqw/1.22 "Inter Tight";color:${cream};text-transform:lowercase;letter-spacing:-.03em;word-spacing:.06em;text-shadow:${shadow}}
          .cap-soft-word span{display:inline-block}`,
    render: (p, t) => eachWord(p, t, w => { const q = up(w, t, .3); return `<span style="opacity:${fx(.42 + .58 * q)};transform:translateY(${fx((1 - q) * .1)}em)">${esc(bare(w.text))}</span>`; }),
  },
  {
    id: 'paper-slip', name: 'Paper slip', font: 'Inter Tight',
    description: 'Ink type on a slip of the theme’s paper; a leaf-green marker line draws under the word being spoken.',
    group: {maxWords: 4, maxChars: 22},
    css: `.cap-paper-slip{bottom:17%;font:800 6.1cqw/1.5 "Inter Tight";color:${ink};letter-spacing:-.025em;word-spacing:.06em}
          .cap-paper-slip>span{background:${paper};padding:.3em .55em;box-decoration-break:clone;-webkit-box-decoration-break:clone;box-shadow:0 .5cqw 1.8cqw #1c261840}
          .cap-paper-slip b{font-weight:800;background:linear-gradient(${leaf},${leaf}) left 92%/var(--q) .16em no-repeat}
          .cap-paper-slip i{font-style:normal;opacity:.5}`,
    render: (p, t) => `<span>${eachWord(p, t, (w, i, on, spoken) => on ? `<b style="--q:${fx(up(w, t, .25) * 100)}%">${esc(bare(w.text))}</b>` : spoken ? esc(bare(w.text)) : `<i>${esc(bare(w.text))}</i>`)}</span>`,
  },
  {
    id: 'wide-caps', name: 'Wide caps', font: 'Montserrat',
    description: 'Wide-tracked caps in cream; the spoken word sits in a leaf-green pill that fades in.',
    group: {maxWords: 3, maxChars: 15},
    css: `.cap-wide-caps{bottom:17%;font:800 5.3cqw/1.75 Montserrat;color:${cream};text-transform:uppercase;letter-spacing:.14em;text-shadow:${shadow}}
          .cap-wide-caps span{display:inline-block;padding:.12em .34em .12em .48em;border-radius:9em}
          .cap-wide-caps span.on{color:${ink};text-shadow:none}`,
    render: (p, t) => eachWord(p, t, (w, i, on) => on ? `<span class="on" style="background:rgba(108,174,72,${fx(up(w, t, .18))})">${esc(bare(w.text))}</span>` : `<span>${esc(bare(w.text))}</span>`),
  },
  {
    id: 'serif-note', name: 'Serif note', font: 'Instrument Serif Italic',
    description: 'A large serif italic in cream that builds word by word, each one fading up softly. For quiet, elegant lines.',
    group: {maxWords: 4, maxChars: 22},
    css: `.cap-serif-note{bottom:17%;font:400 9.2cqw/1.12 "Instrument Serif Italic";color:${cream};letter-spacing:-.01em;text-shadow:${shadow}}
          .cap-serif-note span{display:inline-block}`,
    render: (p, t) => eachWord(p, t, w => { const q = up(w, t, .4); return `<span style="opacity:${fx(q)};transform:translateY(${fx((1 - q) * .14)}em)">${esc(bare(w.text))}</span>`; }),
  },
  {
    id: 'handwritten', name: 'Handwritten', font: 'Caveat',
    description: 'A handwritten note in cream, tilted slightly; a sun-yellow marker stroke draws under the spoken word.',
    group: {maxWords: 4, maxChars: 22},
    css: `.cap-handwritten{bottom:17%;font:700 10cqw/1.05 Caveat;color:${cream};text-shadow:${shadow};rotate:-2.5deg}
          .cap-handwritten b{font-weight:700;background:linear-gradient(${sun},${sun}) left 88%/var(--q) .13em no-repeat;border-radius:.1em}
          .cap-handwritten i{font-style:normal;opacity:.6}`,
    render: (p, t) => eachWord(p, t, (w, i, on, spoken) => on ? `<b style="--q:${fx(up(w, t, .25) * 100)}%">${esc(bare(w.text))}</b>` : spoken ? esc(bare(w.text)) : `<i>${esc(bare(w.text))}</i>`),
  },
  {
    id: 'ink-pill', name: 'Ink pill', font: 'Inter Tight',
    description: 'Cream type in a dark ink pill; the spoken word turns leaf green. The most readable choice over busy footage.',
    group: {maxWords: 3, maxChars: 18},
    css: `.cap-ink-pill{bottom:17%;font:700 5.6cqw/1.4 "Inter Tight";color:${cream};letter-spacing:-.01em}
          .cap-ink-pill>span{display:inline-block;background:${ink};padding:.42em 1em .46em;border-radius:9em}
          .cap-ink-pill b{font-weight:700;color:#9FD67C}`,
    render: (p, t) => `<span>${eachWord(p, t, (w, i, on) => on ? `<b>${esc(bare(w.text))}</b>` : esc(bare(w.text)))}</span>`,
  },
  {
    id: 'big-word', name: 'One big word', font: 'Inter Tight',
    description: 'One heavy cream word at a time; its tracking starts wide and settles tight as it fades up, like the theme’s titles.',
    group: {maxWords: 1, maxChars: 14},
    css: `.cap-big-word{bottom:16%;font:900 12.5cqw/1.05 "Inter Tight";color:${cream};text-transform:uppercase;text-shadow:${shadow}}
          .cap-big-word span{display:inline-block}`,
    render: (p, t) => { const w = p.words[0], q = clamp((t - w.start) / .45), e = 1 - Math.pow(1 - q, 4); return `<span style="opacity:${fx(Math.min(1, q * 2.5))};letter-spacing:${fx(.16 * (1 - e) - .03)}em">${esc(bare(w.text))}</span>`; },
  },
];
