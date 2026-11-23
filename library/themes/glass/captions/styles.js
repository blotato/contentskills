// Glass theme caption styles. See /library/_shared/captions.js for the engine.
// Like the rest of the theme: clean Inter Tight, words coming up out of a soft blur as they are spoken,
// on frosted-glass pills (smoked tint, bright rim, rounded) or straight on the footage. One azure accent.
import {esc, bare, clamp, eachWord} from '/library/_shared/captions.js';

const white = '#FFFFFF', ink = '#0A0F1C', bone = '#F3F6FB', azure = '#2563EB';      // the theme accent, one step deeper for captions so white type on it passes 4.5:1
const shadow = '0 .2cqw 1.4cqw #0009,0 0 .5cqw #0006';
const fx = n => n.toFixed(3);
/** 0..1: how far a word has come up at t, over `len` seconds from its start. Fast in, long settle. */
const up = (w, t, len = .22) => 1 - Math.pow(1 - clamp((t - w.start) / len), 3);
/** One word as letters that arrive one after another out of blur (`scatter` = in mixed order). */
const letters = (w, t, {step = .028, len = .16, scatter = false} = {}) => [...bare(w.text)].map((c, i, all) => {
  const order = scatter ? (i * 7 + 3) % all.length : i, q = clamp((t - w.start - order * Math.min(step, .22 / all.length)) / len), e = 1 - Math.pow(1 - q, 3);
  return `<i style="opacity:${fx(e)};filter:blur(${fx((1 - e) * .12)}em)">${esc(c)}</i>`;
}).join('');

/** The glass pill: smoked frosted glass with a bright rim, rounded; the spoken word sits on an azure lozenge. */
const pill = `background:linear-gradient(180deg,rgba(255,255,255,.16),rgba(255,255,255,.02) 55%),rgba(10,15,28,.66);border:.18cqw solid rgba(255,255,255,.42);box-shadow:0 1.2cqw 3cqw rgba(5,10,26,.45),inset 0 .25cqw 0 rgba(255,255,255,.35)`;

export const styles = [
  {
    id: 'glass-pill', name: 'Glass pill', font: 'Inter Tight',
    description: 'The theme default: a short phrase in bold white on a smoked-glass pill with a bright rim; the spoken word lights up on an azure lozenge, words still to come wait dimmed.',
    group: {maxWords: 3, maxChars: 20},
    css: `.cap-glass-pill{bottom:13%;font:800 5.6cqw/1.1 "Inter Tight";color:${white};letter-spacing:-.02em}
          .cap-glass-pill>span{display:inline-block;${pill};border-radius:1em;padding:.22em .32em .26em}
          .cap-glass-pill i,.cap-glass-pill b{font-style:normal;display:inline-block;padding:.04em .2em .08em;border-radius:.4em;margin:0 .01em}
          .cap-glass-pill i{opacity:.55}
          .cap-glass-pill b{font-weight:800;background:${azure};box-shadow:inset 0 .08em 0 rgba(255,255,255,.35)}`,
    render: (p, t) => `<span>${eachWord(p, t, (w, i, on, spoken) => { const q = t >= w.start ? up(w, t, .14) : 0;
      return on ? `<b style="transform:scale(${fx(1.12 - .12 * q)})">${esc(bare(w.text))}</b>` : `<i${spoken ? ' style="opacity:1"' : ''}>${esc(bare(w.text))}</i>`; })}</span>`,
  },
  {
    id: 'glass-word', name: 'Glass word', font: 'Inter Tight',
    description: 'One heavy word at a time on a small frosted pill, popping up from slightly too large as it is spoken. For the fastest stretches.',
    group: {maxWords: 1, maxChars: 14},
    css: `.cap-glass-word{bottom:13.5%;font:800 6.2cqw/1.05 "Inter Tight";color:${white};letter-spacing:-.03em}
          .cap-glass-word>span{display:inline-block;${pill};border-radius:.5em;padding:.1em .36em .14em}`,
    render: (p, t) => { const w = p.words[0], q = up(w, t, .16); return `<span style="transform:scale(${fx(1.16 - .16 * q)});opacity:${fx(Math.min(1, q * 2.5))}">${esc(bare(w.text))}</span>`; },
  },
  {
    id: 'one-word', name: 'One word', font: 'Inter Tight',
    description: 'One heavy white word at a time, typed on letter by letter out of blur as it is spoken. The theme default: the caption is the word.',
    group: {maxWords: 1, maxChars: 14},
    css: `.cap-one-word{bottom:13.5%;font:800 8.6cqw/1.05 "Inter Tight";color:${white};text-transform:uppercase;letter-spacing:-.012em;text-shadow:${shadow}}
          .cap-one-word i{font-style:normal;display:inline-block}`,
    render: (p, t) => letters(p.words[0], t),
  },
  {
    id: 'tall-word', name: 'Tall word', font: 'Inter Tight',
    description: 'One light condensed word at a time; its letters arrive in mixed order while wide tracking closes up.',
    group: {maxWords: 1, maxChars: 14},
    css: `.cap-tall-word{bottom:13.5%;font:400 12cqw/1.05 "Inter Tight";color:${white};text-transform:uppercase;text-shadow:${shadow};white-space:nowrap}
          .cap-tall-word i{font-style:normal;display:inline-block}`,
    render: (p, t) => { const w = p.words[0], e = 1 - Math.pow(1 - clamp((t - w.start) / .5), 4); return `<span style="letter-spacing:${fx(.06 + .3 * (1 - e))}em;margin-right:${fx(-.06 - .3 * (1 - e))}em">${letters(w, t, {scatter: true, len: .24})}</span>`; },
  },
  {
    id: 'phrase', name: 'Phrase', font: 'Inter Tight',
    description: 'A short phrase in bold white caps; each word comes up out of blur as it is spoken and stays.',
    group: {maxWords: 3, maxChars: 18},
    css: `.cap-phrase{bottom:13.5%;font:700 5.6cqw/1.35 "Inter Tight";color:${white};text-transform:uppercase;letter-spacing:.01em;text-shadow:${shadow}}
          .cap-phrase span{display:inline-block}`,
    render: (p, t) => eachWord(p, t, w => { const q = t >= w.start ? up(w, t, .26) : 0; return `<span style="opacity:${fx(q)};filter:blur(${fx((1 - q) * .1)}em)">${esc(bare(w.text))}</span>`; }),
  },
  {
    id: 'hairline', name: 'Hairline', font: 'Inter Tight',
    description: 'A phrase in bold white caps; a azure hairline draws under the word being spoken.',
    group: {maxWords: 3, maxChars: 18},
    css: `.cap-hairline{bottom:13.5%;font:700 5.4cqw/1.5 "Inter Tight";color:${white};text-transform:uppercase;letter-spacing:.01em;text-shadow:${shadow}}
          .cap-hairline b{font-weight:700;background:linear-gradient(${azure},${azure}) left 100%/var(--q) .09em no-repeat;padding-bottom:.14em}
          .cap-hairline i{font-style:normal;opacity:.55}`,
    render: (p, t) => eachWord(p, t, (w, i, on, spoken) => on ? `<b style="--q:${fx(up(w, t, .2) * 100)}%">${esc(bare(w.text))}</b>` : spoken ? esc(bare(w.text)) : `<i>${esc(bare(w.text))}</i>`),
  },
  {
    id: 'small-print', name: 'Small print', font: 'Inter Tight',
    description: 'The quietest: small tracked-out caps like a credit line; unspoken words wait dimmed, the spoken one is full white.',
    group: {maxWords: 4, maxChars: 24},
    css: `.cap-small-print{bottom:12%;font:600 3.5cqw/1.6 "Inter Tight";color:${white};text-transform:uppercase;letter-spacing:.22em;text-shadow:${shadow}}
          .cap-small-print span{display:inline-block}`,
    render: (p, t) => eachWord(p, t, (w, i, on, spoken) => `<span style="opacity:${fx(spoken ? .5 + .5 * up(w, t, .2) : .5)}">${esc(bare(w.text))}</span>`),
  },
  {
    id: 'ink-bar', name: 'Ink bar', font: 'Inter Tight',
    description: 'White caps on a near-black bar with square corners; the spoken word is underlined in azure. The most readable choice on bright footage and on bone cards.',
    group: {maxWords: 3, maxChars: 18},
    css: `.cap-ink-bar{bottom:13%;font:700 4.6cqw/1.4 "Inter Tight";color:${white};text-transform:uppercase;letter-spacing:.06em}
          .cap-ink-bar>span{display:inline-block;background:${ink};padding:.5em 1em .5em 1.06em}
          .cap-ink-bar b{font-weight:700;box-shadow:0 .12em 0 ${azure}}`,
    render: (p, t) => `<span>${eachWord(p, t, (w, i, on) => on ? `<b>${esc(bare(w.text))}</b>` : esc(bare(w.text)))}</span>`,
  },
  {
    id: 'ink-word', name: 'Ink word', font: 'Inter Tight',
    description: 'One heavy word at a time in near-black, for bone cards and very bright pictures.',
    group: {maxWords: 1, maxChars: 14},
    css: `.cap-ink-word{bottom:13.5%;font:800 8.6cqw/1.05 "Inter Tight";color:${ink};text-transform:uppercase;letter-spacing:-.012em;text-shadow:0 0 1.2cqw ${bone}}
          .cap-ink-word i{font-style:normal;display:inline-block}`,
    render: (p, t) => letters(p.words[0], t),
  },
];

/** Kinetic phrase: words land as they are spoken, a size too large and soft, settling in a few frames; emphasised words (storyboard "emphasis") are bigger on a colour block that wipes in behind them, level 2 stands alone and huge. */
const kinetic = (id, name, description, color, glow, block, on) => ({
  id, name, font: 'Inter Tight', description,
  group: {maxWords: 3, maxChars: 16},
  css: `.cap-${id}{bottom:12.5%;font:800 6.4cqw/1.3 "Inter Tight";color:${color};text-transform:uppercase;letter-spacing:-.008em;text-shadow:${glow}}
        .cap-${id} span{display:inline-block;transform-origin:50% 70%;margin:0 .1em}
        .cap-${id} b{font-weight:800;display:inline-block;transform-origin:50% 70%;margin:0 .12em;font-size:1.3em;line-height:1.06;color:${on};text-shadow:none;background:linear-gradient(${block},${block}) left 50%/var(--q) 100% no-repeat;padding:.06em .22em .04em;border-radius:.22em}
        .cap-${id} b.solo{font-size:2.05em;letter-spacing:-.02em}`,
  render: (p, t) => p.words.map(w => {
    const q = t >= w.start ? up(w, t, .14) : 0, pose = `opacity:${fx(Math.min(1, q * 3))};transform:scale(${fx((w.emph ? 1.5 : 1.28) - (w.emph ? .5 : .28) * q)});filter:blur(${fx((1 - q) * .08)}em)`;
    return w.emph ? `<b class="${w.solo ? 'solo' : ''}" style="${pose};--q:${fx(up(w, t - .03, .14) * 100)}%">${esc(bare(w.text))}</b>` : `<span style="${pose}">${esc(bare(w.text))}</span>`;
  }).join(' '),
});
styles.push(
  kinetic('kinetic', 'Kinetic', 'Fast edits: heavy white caps in short phrases, each word landing a size too large and settling as it is spoken. Words marked in the storyboard\u2019s "emphasis" come up bigger on a azure block that wipes in; level 2 stands alone, huge.', white, shadow, azure, white),
  kinetic('kinetic-ink', 'Kinetic ink', 'The kinetic style in near-black, for bone and sun cards and backdrops; emphasis on a azure block.', ink, `0 0 1.4cqw ${bone},0 0 .5cqw ${bone}`, azure, white),
  kinetic('kinetic-bold', 'Kinetic bold', 'The kinetic style for azure and cobalt backdrops: white caps, emphasis in near-black on a white block.', white, 'none', white, ink),
);
