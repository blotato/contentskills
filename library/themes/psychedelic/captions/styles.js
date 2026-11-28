// Psychedelic theme caption styles. See /library/_shared/captions.js for the engine.
// Like the rest of the theme: Poppins capitals straight on the footage, lit like blacklight paint.
// The big styles use the theme lettering (dark navy body, thin cyan rim, soft magenta glow); the
// quieter ones are white with the same glow. The only accent is highlighter yellow, on the word
// being spoken or the words the storyboard marks as emphasis.
import {esc, bare, clamp, eachWord} from '/library/_shared/captions.js';

const white = '#FFFFFF', deep = '#050826', navy = '#0B1452', cyan = '#19E3FF', magenta = '#FF2BD6', hl = '#E6FF3D';
const glow = `0 0 1.1cqw ${magenta},0 0 .35cqw ${magenta},0 .2cqw 1.2cqw ${deep}`;
const fx = n => n.toFixed(3);
/** A hard outline of width `w` em in `color`, as text shadows (works on any HTML text). */
const ring = (w, color) => [[1, 0], [-1, 0], [0, 1], [0, -1], [.7, .7], [-.7, .7], [.7, -.7], [-.7, -.7]].map(([x, y]) => `${fx(x * w)}em ${fx(y * w)}em 0 ${color}`).join(',');
/** The theme lettering for HTML text: navy body, a thin rim in `rim`, a glow in `halo`. */
const neon = (rim = cyan, halo = magenta) => `color:${navy};text-shadow:${ring(.05, rim)},0 0 .3em ${halo},0 0 .12em ${halo}`;
/** 0..1: how far a word has come up at t, over `len` seconds from its start. Fast in, long settle. */
const up = (w, t, len = .22) => 1 - Math.pow(1 - clamp((t - w.start) / len), 3);
/** One word as letters that pop in one after another, a little large, and settle. */
const letters = (w, t, {step = .028, len = .16} = {}) => [...bare(w.text)].map((c, i, all) => {
  const q = clamp((t - w.start - i * Math.min(step, .22 / all.length)) / len), e = 1 - Math.pow(1 - q, 3);
  return `<i style="opacity:${fx(Math.min(1, e * 2))};transform:scale(${fx(1.35 - .35 * e)})">${esc(c)}</i>`;
}).join('');

export const styles = [
  {
    id: 'one-word', name: 'Neon word', font: 'Poppins',
    description: 'One big word at a time in the theme lettering: navy body, cyan rim, magenta glow; its letters pop in one after another as it is spoken. The theme default.',
    group: {maxWords: 1, maxChars: 14},
    css: `.cap-one-word{bottom:13.5%;font:700 9cqw/1.1 Poppins;text-transform:uppercase;letter-spacing:.01em;${neon()}}
          .cap-one-word i{font-style:normal;display:inline-block;transform-origin:50% 70%}`,
    render: (p, t) => letters(p.words[0], t),
  },
  {
    id: 'tall-word', name: 'Highlighter word', font: 'Poppins',
    description: 'One big word at a time with a highlighter rim and glow instead of cyan and magenta. For the lines that matter most; use it sparingly.',
    group: {maxWords: 1, maxChars: 14},
    css: `.cap-tall-word{bottom:13.5%;font:700 9cqw/1.1 Poppins;text-transform:uppercase;letter-spacing:.01em;${neon(hl, hl)}}
          .cap-tall-word i{font-style:normal;display:inline-block;transform-origin:50% 70%}`,
    render: (p, t) => letters(p.words[0], t),
  },
  {
    id: 'phrase', name: 'Neon phrase', font: 'Poppins',
    description: 'A short phrase in the theme lettering; each word comes up as it is spoken and stays.',
    group: {maxWords: 3, maxChars: 18},
    css: `.cap-phrase{bottom:13.5%;font:700 6cqw/1.4 Poppins;text-transform:uppercase;letter-spacing:.02em;${neon()}}
          .cap-phrase span{display:inline-block;transform-origin:50% 70%}`,
    render: (p, t) => eachWord(p, t, w => { const q = t >= w.start ? up(w, t, .26) : 0; return `<span style="opacity:${fx(Math.min(1, q * 2))};transform:scale(${fx(1.2 - .2 * q)})">${esc(bare(w.text))}</span>`; }),
  },
  {
    id: 'hairline', name: 'Highlighter', font: 'Poppins',
    description: 'A phrase in glowing white caps; the word being spoken turns highlighter yellow.',
    group: {maxWords: 3, maxChars: 18},
    css: `.cap-hairline{bottom:13.5%;font:700 5.4cqw/1.5 Poppins;color:${white};text-transform:uppercase;letter-spacing:.02em;text-shadow:${glow}}
          .cap-hairline b{font-weight:700;color:${hl};text-shadow:0 0 1.1cqw ${hl}99,0 .2cqw 1.2cqw ${deep}}
          .cap-hairline i{font-style:normal;opacity:.6}`,
    render: (p, t) => eachWord(p, t, (w, i, on, spoken) => on ? `<b>${esc(bare(w.text))}</b>` : spoken ? esc(bare(w.text)) : `<i>${esc(bare(w.text))}</i>`),
  },
  {
    id: 'small-print', name: 'Small print', font: 'Poppins',
    description: 'The quietest: small tracked-out white caps with a soft glow; unspoken words wait dimmed, the spoken one is full white.',
    group: {maxWords: 4, maxChars: 24},
    css: `.cap-small-print{bottom:12%;font:600 3.5cqw/1.6 Poppins;color:${white};text-transform:uppercase;letter-spacing:.22em;text-shadow:${glow}}
          .cap-small-print span{display:inline-block}`,
    render: (p, t) => eachWord(p, t, (w, i, on, spoken) => `<span style="opacity:${fx(spoken ? .5 + .5 * up(w, t, .2) : .5)}">${esc(bare(w.text))}</span>`),
  },
  {
    id: 'ink-bar', name: 'Night bar', font: 'Poppins',
    description: 'White caps on a deep navy bar with a thin cyan edge; the spoken word is underlined in highlighter. The most readable choice on bright footage.',
    group: {maxWords: 3, maxChars: 18},
    css: `.cap-ink-bar{bottom:13%;font:700 4.6cqw/1.4 Poppins;color:${white};text-transform:uppercase;letter-spacing:.06em}
          .cap-ink-bar>span{display:inline-block;background:${deep}E6;border:.06em solid ${cyan};border-radius:.5em;box-shadow:0 0 1.4cqw ${magenta}88;padding:.5em 1em}
          .cap-ink-bar b{font-weight:700;box-shadow:0 .12em 0 ${hl}}`,
    render: (p, t) => `<span>${eachWord(p, t, (w, i, on) => on ? `<b>${esc(bare(w.text))}</b>` : esc(bare(w.text)))}</span>`,
  },
  {
    id: 'ink-word', name: 'Glow word', font: 'Poppins',
    description: 'One big white word at a time with a magenta glow and no rim. Lighter than the neon word; for busy, dark pictures.',
    group: {maxWords: 1, maxChars: 14},
    css: `.cap-ink-word{bottom:13.5%;font:700 8.6cqw/1.1 Poppins;color:${white};text-transform:uppercase;letter-spacing:.01em;text-shadow:${glow}}
          .cap-ink-word i{font-style:normal;display:inline-block;transform-origin:50% 70%}`,
    render: (p, t) => letters(p.words[0], t),
  },
];

/** Kinetic phrase: words land as they are spoken, a size too large, settling in a few frames; emphasised words (storyboard "emphasis") are bigger on a colour block that wipes in behind them, level 2 stands alone and huge. */
const kinetic = (id, name, description, look, block, on) => ({
  id, name, font: 'Poppins', description,
  group: {maxWords: 3, maxChars: 16},
  css: `.cap-${id}{bottom:12.5%;font:700 6.2cqw/1.3 Poppins;text-transform:uppercase;letter-spacing:.005em;${look}}
        .cap-${id} span{display:inline-block;transform-origin:50% 70%;margin:0 .1em}
        .cap-${id} b{font-weight:700;display:inline-block;transform-origin:50% 70%;margin:0 .12em;font-size:1.3em;line-height:1.06;color:${on};text-shadow:none;border-radius:.14em;background:linear-gradient(${block},${block}) left 50%/var(--q) 100% no-repeat;padding:.06em .2em .04em}
        .cap-${id} b.solo{font-size:2.05em;letter-spacing:-.01em}`,
  render: (p, t) => p.words.map(w => {
    const q = t >= w.start ? up(w, t, .14) : 0, pose = `opacity:${fx(Math.min(1, q * 3))};transform:scale(${fx((w.emph ? 1.5 : 1.28) - (w.emph ? .5 : .28) * q)})`;
    return w.emph ? `<b class="${w.solo ? 'solo' : ''}" style="${pose};--q:${fx(up(w, t - .03, .14) * 100)}%">${esc(bare(w.text))}</b>` : `<span style="${pose}">${esc(bare(w.text))}</span>`;
  }).join(' '),
});
styles.push(
  kinetic('kinetic', 'Kinetic', 'Fast edits: glowing white caps in short phrases, each word landing a size too large and settling as it is spoken. Words marked in the storyboard’s "emphasis" come up bigger in navy on a highlighter block that wipes in; level 2 stands alone, huge.', `color:${white};text-shadow:${glow}`, hl, navy),
  kinetic('kinetic-ink', 'Kinetic neon', 'The kinetic style in the theme lettering (navy body, cyan rim, magenta glow); emphasis in navy on a highlighter block.', neon(), hl, navy),
  kinetic('kinetic-bold', 'Kinetic cyan', 'The kinetic style in plain white with a dark shadow; emphasis in navy on a cyan block. For shots where yellow is already in the picture.', `color:${white};text-shadow:0 .2cqw 1.2cqw ${deep},0 0 .4cqw ${deep}`, cyan, navy),
);

/** Outline pop: white capitals with a heavy navy outline, a few words at a time, straight on the footage;
 *  emphasised words (storyboard "emphasis") turn highlighter yellow and land a size too large. The talking-head reel look. */
const outline = w => [[1, 0], [-1, 0], [0, 1], [0, -1], [.7, .7], [-.7, .7], [.7, -.7], [-.7, -.7]].map(([x, y]) => `${fx(x * w)}em ${fx(y * w)}em 0 ${deep}`).concat(`0 0 ${fx(w * 3.4)}em ${magenta}`).join(',');
styles.push({
  id: 'outline-pop', name: 'Outline pop', font: 'Poppins',
  description: 'White capitals with a heavy navy outline and a magenta halo, up to three words at a time, shown whole; words in the storyboard’s "emphasis" turn highlighter yellow and pop. Reads over any footage, light or dark.',
  group: {maxWords: 3, maxChars: 16},
  css: `.cap-outline-pop{bottom:30%;font:700 7.4cqw/1.16 Poppins;color:${white};text-transform:uppercase;letter-spacing:.01em;text-shadow:${outline(.06)}}
        .cap-outline-pop span{display:inline-block;margin:0 .07em;transform-origin:50% 80%}
        .cap-outline-pop span.e{color:${hl}}`,
  render: (p, t) => p.words.map(w => {
    const q = t >= w.start ? up(w, t, .12) : 1, big = w.emph ? .3 : 0;        // the whole phrase shows at once; a keyword pops as it is spoken
    return `<span class="${w.emph ? 'e' : ''}" style="transform:scale(${fx(1 + big * (1 - q))})">${esc(bare(w.text))}</span>`;
  }).join(' '),
});
