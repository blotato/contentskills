// Editorial caption styles. See /library/_shared/captions.js for the engine.
// Each style is a pure function of (phrase, time). The user's recorded taste (style/profile.json) is the starting
// point: a small sentence-case serif on a tight box, the spoken word in the accent. Colours are the theme's, i.e. the
// footage's: aubergine ink, daylight paper, wine and blush. Words marked in a storyboard's "emphasis" are set in the
// italic; level 2 (a word alone) is larger. Nothing bounces: words clear from a soft fade or rise behind the baseline.
import {esc, bare, clamp, activeIndex} from '/library/_shared/captions.js';

const PAPER = '#EDF0EB', INK = '#26101A', WINE = '#7A2137', BLUSH = '#DFA78C', FOG = '#C3C8C1', UMBER = '#4B3933';
const fx = x => Math.round(x * 1000) / 1000;
const ease = x => 1 - Math.pow(1 - clamp(x), 3);
const inn = (p, t, len = .14) => ease((t - p.words[0].start) / len);
const serif = '"Instrument Serif"', ital = '"Instrument Serif Italic"';

/** A boxed serif phrase: said words solid, the spoken word in the accent, words to come dimmed; emphasis in italic. */
const boxed = (id, name, description, fg, bg, accent, dim, group = 'Boxed serif') => ({
  id, name, font: 'Instrument Serif', description, group: {maxWords: 3, maxChars: 22},
  css: `.cap-${id}{bottom:14%;font:400 6.6cqw/1.12 ${serif};color:${fg};letter-spacing:-.005em}
        .cap-${id}>span{display:inline-block;background:${bg};padding:.13em .42em .2em;border-radius:.07em}
        .cap-${id} i{font-style:normal;display:inline-block}
        .cap-${id} i.e{font-family:${ital}}
        .cap-${id}>span.solo{font-size:1.5em;padding:.08em .4em .16em}`,
  render: (p, t) => {
    const active = activeIndex(p, t), q = inn(p, t), solo = p.words.length === 1 && p.words[0].solo;
    const words = p.words.map((w, i) => `<i class="${w.emph ? 'e' : ''}" style="color:${i === active ? accent : fg};opacity:${i > active ? dim : 1}">${esc(bare(w.text))}</i>`).join(' ');
    return `<span class="${solo ? 'solo' : ''}" style="opacity:${fx(q)};transform:translateY(${fx((1 - q) * .14)}em)">${words}</span>`;
  },
});

export const styles = [
  boxed('column', 'Column', 'The theme default: a small sentence-case serif in daylight paper on a tight aubergine box. The spoken word turns blush, words to come wait dimmed; emphasised words are italic and a level-2 word stands alone, larger. Reads on bright rooms and dark ones.', PAPER, INK, BLUSH, .5),
  boxed('column-paper', 'Column, paper', 'The same on a paper box with ink type and the spoken word in wine: for ink and wine backdrops and dark footage.', INK, PAPER, WINE, .42),
  boxed('column-wine', 'Column, wine', 'Paper type on a wine box, the spoken word in blush: one accent stretch, or over a paper card.', PAPER, WINE, BLUSH, .55),
  {
    id: 'rise', name: 'Rise', font: 'Instrument Serif', group: {maxWords: 3, maxChars: 20},
    description: 'Each word rises from behind the baseline as it is spoken (a masked reveal, the theme\'s headline move) on an aubergine box that is already the full width of the phrase. Emphasised words are italic blush.',
    css: `.cap-rise{bottom:14%;font:400 7cqw/1.1 ${serif};color:${PAPER}}
          .cap-rise>span{display:inline-block;background:${INK};padding:.12em .42em .2em;border-radius:.07em}
          .cap-rise u{text-decoration:none;display:inline-block;overflow:hidden;vertical-align:bottom;padding-bottom:.12em;margin-bottom:-.12em}
          .cap-rise i{font-style:normal;display:inline-block}.cap-rise i.e{font-family:${ital};color:${BLUSH}}`,
    render: (p, t) => `<span style="opacity:${fx(inn(p, t, .1))}">` + p.words.map(w => { const q = ease((t - w.start) / .22); return `<u><i class="${w.emph ? 'e' : ''}" style="transform:translateY(${fx((1 - q) * 105)}%)">${esc(bare(w.text))}</i></u>`; }).join(' ') + '</span>',
  },
  {
    id: 'one-word', name: 'One word', font: 'Instrument Serif Italic', group: {maxWords: 1, maxChars: 14},
    description: 'One large italic word at a time in paper on an aubergine box, clearing from a soft blur as it is spoken. For a short stretch that should be read word by word.',
    css: `.cap-one-word{bottom:15%;font:400 11cqw/1.05 ${ital};color:${PAPER}}
          .cap-one-word>span{display:inline-block;background:${INK};padding:.06em .36em .16em;border-radius:.05em}`,
    render: (p, t) => { const w = p.words[0], q = ease((t - w.start) / .16); return `<span style="opacity:${fx(q)};filter:blur(${fx((1 - q) * .12)}em)">${esc(bare(w.text))}</span>`; },
  },
  {
    id: 'underline', name: 'Underline', font: 'Instrument Serif', group: {maxWords: 3, maxChars: 22},
    description: 'Ink serif on a soft paper strip; a wine rule draws under the word being spoken. The quietest style, for paper cards and bright walls.',
    css: `.cap-underline{bottom:14%;font:400 6.6cqw/1.16 ${serif};color:${INK}}
          .cap-underline>span{display:inline-block;background:rgba(237,240,235,.94);padding:.12em .42em .22em;border-radius:.07em}
          .cap-underline i{font-style:normal;display:inline-block;background:linear-gradient(${WINE},${WINE}) left 100%/var(--q) .07em no-repeat;padding-bottom:.06em}
          .cap-underline i.e{font-family:${ital};color:${WINE}}`,
    render: (p, t) => { const active = activeIndex(p, t); return `<span style="opacity:${fx(inn(p, t))}">` + p.words.map((w, i) => `<i class="${w.emph ? 'e' : ''}" style="--q:${i === active ? fx(ease((t - w.start) / .18) * 100) : 0}%;opacity:${i > active ? .45 : 1}">${esc(bare(w.text))}</i>`).join(' ') + '</span>'; },
  },
  {
    id: 'small-caps', name: 'Small caps', font: 'Inter Tight', group: {maxWords: 4, maxChars: 24},
    description: 'Small widely tracked grotesque capitals in paper on an aubergine strip, the spoken word in blush: a running caption under a busy graphic.',
    css: `.cap-small-caps{bottom:13%;font:600 4.3cqw/1.25 "Inter Tight";color:${PAPER};text-transform:uppercase;letter-spacing:.16em}
          .cap-small-caps>span{display:inline-block;background:${INK};padding:.34em .7em .34em .86em;border-radius:.06em}
          .cap-small-caps i{font-style:normal}`,
    render: (p, t) => { const active = activeIndex(p, t); return `<span style="opacity:${fx(inn(p, t))}">` + p.words.map((w, i) => `<i style="color:${i === active ? BLUSH : PAPER};opacity:${i > active ? .5 : 1}">${esc(bare(w.text))}</i>`).join(' ') + '</span>'; },
  },
];
