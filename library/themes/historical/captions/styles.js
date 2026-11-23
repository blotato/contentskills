// Historical theme caption styles. See /library/_shared/captions.js for the engine.
// Colours come from the theme kit; every style carries its own dark backing or shadow so it reads
// over bright and dark footage alike. Nothing bounces: words wipe, type or settle.
import {esc, bare, clamp, eachWord, activeIndex} from '/library/_shared/captions.js';
import {C} from '/library/themes/historical/kit.js';

const SHADOW = '0 .05em .1em rgba(0,0,0,.95),0 0 .35em rgba(0,0,0,.75),0 0 .9em rgba(0,0,0,.45)';
/** A slightly ragged block edge, like the kit's bars. */
const ROUGH = 'polygon(0 6%,1.5% 0,99% 3%,100% 40%,98.8% 96%,60% 100%,1% 97%,.6% 50%)';
const settle = x => 1 - Math.pow(1 - clamp(x), 4);

export const styles = [
  {
    id: 'bar-word', name: 'Bar word', font: 'Oswald',
    description: 'Condensed white capitals; the spoken word sits on a crimson bar. The theme default: reads cleanly over any footage.',
    group: {maxWords: 3, maxChars: 18},
    css: `.cap-bar-word{bottom:17%;font:600 7.6cqw/1.5 Oswald;color:${C.bone};text-transform:uppercase;letter-spacing:.04em;text-shadow:${SHADOW}}
          .cap-bar-word span{display:inline-block;padding:0 .2em;position:relative}
          .cap-bar-word span.on{text-shadow:none}
          .cap-bar-word span.on::before{content:"";position:absolute;inset:.1em 0 .06em;background:${C.crimson};clip-path:${ROUGH};z-index:-1;box-shadow:inset 0 -.1em 0 ${C.blood}}`,
    render: (p, t) => eachWord(p, t, (w, i, on) => `<span class="${on ? 'on' : ''}">${esc(bare(w.text))}</span>`),
  },
  {
    id: 'subtitle', name: 'Documentary subtitle', font: 'Old Standard TT Italic',
    description: 'A classic subtitle: book italic on a dark translucent strip. Words brighten as they are spoken and the current one is underlined in crimson.',
    group: {maxWords: 5, maxChars: 26},
    css: `.cap-subtitle{bottom:16%;font:400 5.6cqw/1.35 "Old Standard TT Italic";color:${C.mist}}
          .cap-subtitle p{display:inline-block;margin:0;padding:.28em .7em .34em;background:rgba(7,10,15,.78);border-left:.12em solid ${C.crimson}}
          .cap-subtitle b{font-weight:400;color:${C.bone}} .cap-subtitle b.on{box-shadow:0 .1em 0 ${C.crimson}}`,
    render: (p, t) => `<p>${eachWord(p, t, (w, i, on, spoken) => spoken ? `<b class="${on ? 'on' : ''}">${esc(w.text)}</b>` : esc(w.text))}</p>`,
  },
  {
    id: 'typewriter', name: 'Typewriter', font: 'Special Elite',
    description: 'Typed onto a strip of paper letter by letter, in time with the voice, with a crimson cursor.',
    group: {maxWords: 4, maxChars: 22},
    css: `.cap-typewriter{bottom:16.5%;font:400 5.4cqw/1.4 "Special Elite";color:#15181d;text-align:center}
          .cap-typewriter p{display:inline-block;margin:0;padding:.36em .7em .22em;background:${C.bone};clip-path:${ROUGH};text-align:left;white-space:pre}
          .cap-typewriter i{font-style:normal;opacity:0} .cap-typewriter u{text-decoration:none;display:inline-block;width:.5em;height:.95em;margin-left:.04em;vertical-align:-.12em;background:${C.crimson}}`,
    render: (p, t) => {
      const active = activeIndex(p, t);
      return `<p>${p.words.map((w, i) => {
        if (i < active) return esc(w.text);
        if (i > active) return `<i>${esc(w.text)}</i>`;
        const chars = [...w.text], n = Math.ceil(clamp((t - w.start) / Math.max(.08, (w.end - w.start) * .8)) * chars.length);
        return `${esc(chars.slice(0, n).join(''))}<u></u><i>${esc(chars.slice(n).join(''))}</i>`;
      }).join(' ')}</p>`;
    },
  },
  {
    id: 'date-box', name: 'Date box', font: 'Oswald',
    description: 'One or two words at a time in heavy capitals on a charcoal box with a crimson rule, pressed on like the theme\'s year plates. For short, weighty lines.',
    group: {maxWords: 2, maxChars: 12},
    css: `.cap-date-box{bottom:16.5%;font:700 9.4cqw/1.2 Oswald;color:${C.bone};text-transform:uppercase;letter-spacing:.03em}
          .cap-date-box p{display:inline-block;margin:0;padding:.12em .42em .16em;background:${C.char};clip-path:${ROUGH};border-bottom:.09em solid ${C.crimson}}
          .cap-date-box i{font-style:normal;opacity:.38}`,
    render: (p, t) => {
      const q = settle((t - p.start) / .28);
      return `<p style="transform:scale(${(1.14 - .14 * q).toFixed(3)});opacity:${clamp((t - p.start) / .1).toFixed(2)}">${eachWord(p, t, (w, i, on, spoken) => spoken ? esc(bare(w.text)) : `<i>${esc(bare(w.text))}</i>`)}</p>`;
    },
  },
  {
    id: 'brush-under', name: 'Brush underline', font: 'Oswald',
    description: 'White capitals with a dry crimson brush stroke that wipes in under each word as it is spoken.',
    group: {maxWords: 4, maxChars: 20},
    css: `.cap-brush-under{bottom:17%;font:500 7cqw/1.55 Oswald;color:${C.bone};text-transform:uppercase;letter-spacing:.05em;text-shadow:${SHADOW}}
          .cap-brush-under span{display:inline-block;position:relative;padding:0 .08em}
          .cap-brush-under em{position:absolute;left:-.05em;bottom:.08em;height:.2em;background:linear-gradient(${C.red},${C.crimson} 60%,${C.blood});clip-path:polygon(0 30%,8% 0,40% 18%,72% 4%,100% 26%,97% 78%,70% 100%,35% 82%,6% 100%);z-index:-1}`,
    render: (p, t) => eachWord(p, t, (w, i, on) => `<span>${esc(bare(w.text))}${on ? `<em style="width:${(settle((t - w.start) / .22) * 104).toFixed(1)}%"></em>` : ''}</span>`),
  },
  {
    id: 'newsreel', name: 'Newsreel', font: 'Oswald',
    description: 'Small wide-tracked capitals on a dark band between two thin rules, like a newsreel intertitle. Spoken words turn from grey to white.',
    group: {maxWords: 4, maxChars: 22},
    css: `.cap-newsreel{bottom:16.5%;font:500 4.9cqw/1.4 Oswald;color:${C.steel};text-transform:uppercase;letter-spacing:.2em}
          .cap-newsreel p{display:inline-block;margin:0;padding:.5em .8em .5em 1em;background:rgba(7,10,15,.82);border-top:.05em solid ${C.bone};border-bottom:.05em solid ${C.bone};box-shadow:0 -.16em 0 rgba(7,10,15,.82),0 .16em 0 rgba(7,10,15,.82)}
          .cap-newsreel b{font-weight:500;color:${C.bone}} .cap-newsreel b.on{color:#fff;box-shadow:0 .12em 0 ${C.crimson}}`,
    render: (p, t) => `<p>${eachWord(p, t, (w, i, on, spoken) => spoken ? `<b class="${on ? 'on' : ''}">${esc(bare(w.text))}</b>` : esc(bare(w.text)))}</p>`,
  },
];
