// Lines of Light caption styles. See /library/_shared/captions.js for the engine.
// Each style is a pure function of (phrase, time). The landing ramp (orange -> red -> white) is the
// same one the kit uses for titles (kit.js landColor), copied here so captions need no DOM.
import {esc, bare, clamp, eachWord, activeIndex} from '/library/_shared/captions.js';

const CORE = '#f5f3ff', RED = '#ff2e40', BLUE = '#286eff', LILAC = '#f0d6f2', DIM = '#8a9696';
const ease = x => 1 - Math.pow(1 - clamp(x), 4);
/** Landing colour for k 0..1: saturated orange, burning red, cooling to white. */
const land = k => { k = clamp(k); const c = k < .4 ? [255, 95 - 75 * k / .4, 30 * k / .4] : [255 - 10 * (k - .4) / .6, 20 + 223 * (k - .4) / .6, 30 + 225 * (k - .4) / .6]; return `rgb(${c.map(Math.round).join(',')})`; };
/** Dark edge for footage plus a soft glow in the given colour. */
const edge = (glow = 'rgba(240,214,242,.45)') => `0 0 .1em rgba(0,0,0,.9),0 .03em .25em rgba(0,0,0,.85),0 0 .5em ${glow}`;
/** The red/blue echo of a line of light, as text-shadow. */
const echo = (d = .045) => `-${d}em -${d * .8}em 0 rgba(255,46,64,.75),${d}em ${d * .8}em 0 rgba(40,110,255,.75)`;

export const styles = [
  {
    id: 'landing', name: 'Landing', font: 'Michroma',
    description: 'Tracked Michroma capitals. Each word lands as it is spoken: saturated orange, burning through red, cooling to white while its tracking closes in. The theme default.',
    group: {maxWords: 3, maxChars: 14},
    css: `.cap-landing{bottom:16%;left:22%;right:22%;font:400 5cqw/1.6 Michroma;color:${CORE};text-transform:uppercase}
          .cap-landing span{display:inline-block;padding:0 .14em}`,
    render: (p, t) => eachWord(p, t, (w, i, on, said) => {
      const a = said ? ease((t - w.start) / .55) : 0, k = clamp((a - .2) / .8), col = land(k);
      return `<span style="opacity:${said ? Math.min(1, a * 5) : 0};color:${col};letter-spacing:${(.22 + (1 - a) * .2).toFixed(3)}em;text-shadow:${edge(col.replace('rgb', 'rgba').replace(')', `,${(.25 + .5 * (1 - k)).toFixed(2)})`))}">${esc(bare(w.text))}</span>`;
    }),
  },
  {
    id: 'echo', name: 'Echo', font: 'Michroma',
    description: 'White Michroma capitals split like the lines: a red echo up-left and a blue one down-right, with a lilac glow. The spoken word is brightest; the rest of the phrase waits dim.',
    group: {maxWords: 4, maxChars: 20},
    css: `.cap-echo{bottom:16%;font:400 5.2cqw/1.6 Michroma;color:${CORE};text-transform:uppercase;letter-spacing:.2em}
          .cap-echo span{display:inline-block;padding:0 .1em;text-shadow:${edge()}}
          .cap-echo span.on{text-shadow:${echo()},${edge('rgba(240,214,242,.7)')}}`,
    render: (p, t) => eachWord(p, t, (w, i, on, said) => `<span class="${on ? 'on' : ''}" style="opacity:${on ? 1 : said ? .85 : .4}">${esc(bare(w.text))}</span>`),
  },
  {
    id: 'light-underline', name: 'Light underline', font: 'Michroma',
    description: 'Calm white capitals with a line of light under the spoken word: a white core with red and blue echoes, drawing out from the word\'s centre as it starts.',
    group: {maxWords: 4, maxChars: 22},
    css: `.cap-light-underline{bottom:16%;font:400 5cqw/1.9 Michroma;color:${CORE};text-transform:uppercase;letter-spacing:.2em}
          .cap-light-underline span{display:inline-block;position:relative;padding:0 .12em;text-shadow:${edge()}}
          .cap-light-underline i{position:absolute;left:50%;bottom:.05em;height:.06em;background:${CORE};transform:translateX(-50%);box-shadow:-.04em -.04em 0 ${RED},.04em .04em 0 ${BLUE},0 0 .3em ${LILAC}}`,
    render: (p, t) => eachWord(p, t, (w, i, on) => `<span>${esc(bare(w.text))}${on ? `<i style="width:${(ease((t - w.start) / .35) * 88).toFixed(1)}%"></i>` : ''}</span>`),
  },
  {
    id: 'one-word', name: 'One word', font: 'Michroma',
    description: 'One big word at a time, centred, landing orange to white with the red and blue echo fading out as it cools. For punchy, fast speech.',
    group: {maxWords: 1, maxChars: 14},
    css: `.cap-one-word{bottom:17%;font:400 9cqw/1.3 Michroma;text-transform:uppercase}`,
    render: (p, t) => {
      const w = p.words[0], a = ease((t - w.start) / .5), k = clamp((a - .15) / .85), e = (1 - k) * .06;
      return `<span style="display:inline-block;color:${land(k)};letter-spacing:${(.2 + (1 - a) * .25).toFixed(3)}em;opacity:${Math.min(1, a * 5)};text-shadow:-${e.toFixed(3)}em 0 0 rgba(255,46,64,.8),${e.toFixed(3)}em 0 0 rgba(40,110,255,.8),${edge()}">${esc(bare(w.text))}</span>`;
    },
  },
  {
    id: 'mono-sub', name: 'Mono subtitle', font: 'IBM Plex Mono',
    description: 'Quiet IBM Plex Mono subtitles in sentence case, typed out with the voice and led by a red cursor. Said words settle to a soft white; good for long explanations.',
    group: {maxWords: 6, maxChars: 30},
    css: `.cap-mono-sub{bottom:15%;font:500 4.6cqw/1.5 "IBM Plex Mono";color:${CORE};letter-spacing:.02em;text-shadow:${edge()}}
          .cap-mono-sub u{text-decoration:none;color:${RED};text-shadow:0 0 .4em ${RED}}`,
    render: (p, t) => {
      const text = p.words.map((w, i) => { const s = bare(w.text), q = clamp((t - w.start) / Math.max(.08, Math.min(.3, w.end - w.start))); return t < w.start ? '' : (i ? ' ' : '') + s.slice(0, Math.max(1, Math.round(s.length * q))); }).join('');
      return `${esc(text)}<u>${Math.floor(t * 3) % 2 ? '▍' : ' '}</u>`;
    },
  },
  {
    id: 'prompt', name: 'Prompt card', font: 'IBM Plex Mono',
    description: 'The phrase typed into a thin frame of light, like the prompt card in the original reels: a hairline box with red and blue echoes, a small PROMPT tag and mono text.',
    group: {maxWords: 5, maxChars: 26},
    css: `.cap-prompt{bottom:15%}
          .cap-prompt b{display:inline-block;position:relative;font:400 4.4cqw/1.5 "IBM Plex Mono";color:${CORE};text-align:left;padding:.55em .8em .45em;border:.12cqw solid ${CORE};background:rgba(4,5,6,.72);box-shadow:-.35cqw -.3cqw 0 -.05cqw rgba(255,46,64,.8),.35cqw .3cqw 0 -.05cqw rgba(40,110,255,.8),0 0 2cqw rgba(240,214,242,.35);white-space:pre-wrap}
          .cap-prompt small{position:absolute;left:.8em;top:-1.5em;font:400 2.4cqw Michroma;letter-spacing:.3em;color:${DIM};text-shadow:${edge()}}`,
    render: (p, t) => {
      const text = p.words.map((w, i) => { const s = bare(w.text), q = clamp((t - w.start) / Math.max(.08, Math.min(.3, w.end - w.start))); return t < w.start ? '' : (i ? ' ' : '') + s.slice(0, Math.max(1, Math.round(s.length * q))); }).join('');
      return `<b><small>PROMPT</small>${esc(text)}${Math.floor(t * 3) % 2 ? '▍' : ' '}</b>`;
    },
  },
];
