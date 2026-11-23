// Horror theme caption styles. See /library/_shared/captions.js for the engine.
// Each style is a pure function of (phrase, time): the flicker comes from a hash of the time, not a timer.
import {esc, bare, clamp, eachWord, activeIndex} from '/library/_shared/captions.js';

const BONE = '#e9e6df', ROSE = '#e0556b', FOG = '#8d979f', VOID = '#030405';
const edge = '0 0 .12em rgba(0,0,0,.9),0 .04em .3em rgba(0,0,0,.85),0 0 .6em rgba(0,0,0,.6)';
const hash = (n, seed = 0) => { const x = Math.sin(n * 127.1 + seed * 311.7 + 74.7) * 43758.5453; return x - Math.floor(x); };
/** A word switching on like a bad tube: a few stuttering frames, then steady. */
const stutter = (t, start, seed) => { const q = (t - start) / .22; return q <= 0 ? 0 : q >= 1 ? 1 : hash(Math.floor(q * 7), seed) < .45 ? .15 : 1; };

export const styles = [
  {
    id: 'bone-track', name: 'Bone track', font: 'Barlow Condensed',
    description: 'Small tracked capitals in bone white; the spoken word turns rose. The theme default — quiet, and readable over any footage.',
    group: {maxWords: 4, maxChars: 22},
    css: `.cap-bone-track{bottom:16%;font:600 6.2cqw/1.4 "Barlow Condensed";color:${BONE};text-transform:uppercase;letter-spacing:.2em;text-shadow:${edge}}
          .cap-bone-track span{display:inline-block;padding:0 .12em}
          .cap-bone-track span.on{color:${ROSE}}`,
    render: (p, t) => eachWord(p, t, (w, i, on) => `<span class="${on ? 'on' : ''}">${esc(bare(w.text))}</span>`),
  },
  {
    id: 'flicker-in', name: 'Flicker in', font: 'Bebas Neue',
    description: 'Tall capitals that switch on word by word as they are spoken, each stuttering for a few frames; the first letter of the spoken word is rose.',
    group: {maxWords: 3, maxChars: 18},
    css: `.cap-flicker-in{bottom:16%;font:400 9cqw/1.25 "Bebas Neue";color:${BONE};letter-spacing:.14em;text-shadow:${edge}}
          .cap-flicker-in span{display:inline-block;padding:0 .1em}
          .cap-flicker-in i{font-style:normal;color:${ROSE}}`,
    render: (p, t) => eachWord(p, t, (w, i, on, said) => { const s = esc(bare(w.text)); return `<span style="opacity:${said ? stutter(t, w.start, i + 3) : 0}">${on ? `<i>${s[0]}</i>${s.slice(1)}` : s}</span>`; }),
  },
  {
    id: 'typewriter', name: 'Typewriter', font: 'Special Elite',
    description: 'A worn typewriter keeping up with the voice, letter by letter, on a dark strip with a rose bar and a block cursor.',
    group: {maxWords: 5, maxChars: 26},
    css: `.cap-typewriter{bottom:15%}
          .cap-typewriter b{display:inline-block;font:400 5.6cqw/1.5 "Special Elite";color:${BONE};background:rgba(3,4,5,.72);border-left:.14em solid ${ROSE};padding:.25em .6em .15em;letter-spacing:.03em;text-align:left;white-space:pre-wrap}
          .cap-typewriter u{text-decoration:none;color:${ROSE}}`,
    render: (p, t) => {
      const text = p.words.map((w, i) => { const s = bare(w.text), q = clamp((t - w.start) / Math.max(.08, Math.min(.3, w.end - w.start))); return t < w.start ? '' : (i ? ' ' : '') + s.slice(0, Math.max(1, Math.round(s.length * q))); }).join('');
      return `<b>${esc(text)}<u>${Math.floor(t * 4) % 2 ? '▌' : ' '}</u></b>`;
    },
  },
  {
    id: 'redacted', name: 'Redacted', font: 'Courier Prime',
    description: 'Every word starts as a black marker bar and is uncovered as it is spoken, like a document being declassified one word at a time.',
    group: {maxWords: 4, maxChars: 22},
    css: `.cap-redacted{bottom:15%;font:700 5.6cqw/1.75 "Courier Prime";color:${BONE};text-shadow:${edge}}
          .cap-redacted span{display:inline-block;padding:0 .22em;margin:0 .04em}
          .cap-redacted span.bar{background:${VOID};color:transparent;text-shadow:none;box-shadow:0 0 0 .03em #2b343b}
          .cap-redacted span.on{color:${ROSE}}`,
    render: (p, t) => eachWord(p, t, (w, i, on, said) => `<span class="${said ? (on ? 'on' : '') : 'bar'}">${esc(bare(w.text))}</span>`),
  },
  {
    id: 'whisper', name: 'Whisper', font: 'IM Fell English',
    description: 'Lower-case old book type, small and wide; words surface slowly out of the dark as they are said and the spoken one is brightest.',
    group: {maxWords: 5, maxChars: 26},
    css: `.cap-whisper{bottom:16%;font:400 6cqw/1.4 "IM Fell English";color:${BONE};text-transform:lowercase;letter-spacing:.1em;text-shadow:${edge}}
          .cap-whisper span{display:inline-block;padding:0 .1em}`,
    render: (p, t) => eachWord(p, t, (w, i, on, said) => `<span style="opacity:${said ? (on ? 1 : .78) * clamp((t - w.start) / .3) : 0};filter:blur(${said ? (1 - clamp((t - w.start) / .35)) * .12 : 0}em)">${esc(bare(w.text))}</span>`),
  },
  {
    id: 'tape', name: 'Tape subtitle', font: 'VT323',
    description: 'Camcorder subtitles: blocky tape lettering on black boxes; the spoken word is rose and now and then a word jumps a pixel.',
    group: {maxWords: 4, maxChars: 22},
    css: `.cap-tape{bottom:15%;font:400 7.4cqw/1.35 VT323;color:${BONE};text-transform:uppercase;letter-spacing:.06em}
          .cap-tape span{display:inline-block;background:rgba(3,4,5,.82);padding:0 .28em;margin:.06em 0}
          .cap-tape span.on{color:${ROSE}}`,
    render: (p, t) => eachWord(p, t, (w, i, on) => `<span class="${on ? 'on' : ''}" style="transform:translateX(${hash(Math.floor(t * 12), i) < .08 ? .12 : 0}em)">${esc(bare(w.text))}</span>`),
  },
  {
    id: 'one-word', name: 'One word', font: 'Bebas Neue',
    description: 'One word at a time, large and widely tracked, cutting in with a stutter; its first letter is rose.',
    group: {maxWords: 1, maxChars: 14},
    css: `.cap-one-word{bottom:17%;font:400 15cqw/1.1 "Bebas Neue";color:${BONE};letter-spacing:.16em;text-shadow:${edge}}
          .cap-one-word i{font-style:normal;color:${ROSE}}`,
    render: (p, t) => { const w = p.words[activeIndex(p, t)] ?? p.words[0], s = esc(bare(w.text)); return `<span style="opacity:${stutter(t, w.start, 2)}"><i>${s[0]}</i>${s.slice(1)}</span>`; },
  },
];
