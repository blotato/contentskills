// Futuristic theme caption styles. See /library/_shared/captions.js for the engine.
import {esc, bare, clamp, eachWord} from '/library/_shared/captions.js';

export const styles = [
  {
    id: 'hud-box', name: 'HUD box', font: 'Rajdhani',
    description: 'Uppercase technical caps; the spoken word sits in a notched cyan block. The theme default — reads cleanly over any footage.',
    group: {maxWords: 3, maxChars: 18},
    css: `.cap-hud-box{bottom:17%;font:700 7.6cqw/1.4 Rajdhani;color:#e9fcff;text-transform:uppercase;letter-spacing:.04em;text-shadow:0 0 1.2cqw #000,0 .3cqw .6cqw #000}
          .cap-hud-box span{padding:.02em .2em}
          .cap-hud-box span.on{background:#3ef0ff;color:#04070c;text-shadow:none;clip-path:polygon(.22em 0,100% 0,100% calc(100% - .22em),calc(100% - .22em) 100%,0 100%,0 .22em);filter:drop-shadow(0 0 1.5cqw #3ef0ff)}`,
    render: (p, t) => eachWord(p, t, (w, i, on) => `<span class="${on ? 'on' : ''}">${esc(bare(w.text))}</span>`),
  },
  {
    id: 'glow-word', name: 'Glow word', font: 'Orbitron',
    description: 'Wide display lettering; each word lights up cyan as it is spoken and stays faintly lit.',
    group: {maxWords: 3, maxChars: 15},
    css: `.cap-glow-word{bottom:17%;font:800 6cqw/1.35 Orbitron;color:#e9fcff99;text-transform:uppercase;text-shadow:0 0 1cqw #000,0 .3cqw .6cqw #000}
          .cap-glow-word b{font-weight:800;color:#fff;text-shadow:0 0 1cqw #3ef0ff,0 0 3cqw #3ef0ff,0 0 5cqw #17b9cf}
          .cap-glow-word u{text-decoration:none;color:#bdf7ff}`,
    render: (p, t) => eachWord(p, t, (w, i, on, spoken) => on ? `<b>${esc(bare(w.text))}</b>` : spoken ? `<u>${esc(bare(w.text))}</u>` : esc(bare(w.text))),
  },
  {
    id: 'bracket', name: 'Bracket lock', font: 'Rajdhani',
    description: 'Amber brackets snap around the spoken word, like a target lock moving through the sentence.',
    group: {maxWords: 4, maxChars: 20},
    css: `.cap-bracket{bottom:17%;font:700 7.2cqw/1.4 Rajdhani;color:#e9fcff;text-transform:uppercase;letter-spacing:.05em;text-shadow:0 0 1.2cqw #000,0 .3cqw .6cqw #000}
          .cap-bracket span{padding:0 .12em;border:.07em solid transparent;border-top:0;border-bottom:0}
          .cap-bracket span.on{color:#ffb300;border-color:#ffb300;box-shadow:inset .25em 0 0 -.18em #ffb300;background:linear-gradient(#ffb300,#ffb300) left top/.3em .07em no-repeat,linear-gradient(#ffb300,#ffb300) left bottom/.3em .07em no-repeat,linear-gradient(#ffb300,#ffb300) right top/.3em .07em no-repeat,linear-gradient(#ffb300,#ffb300) right bottom/.3em .07em no-repeat}`,
    render: (p, t) => eachWord(p, t, (w, i, on) => `<span class="${on ? 'on' : ''}">${esc(bare(w.text))}</span>`),
  },
  {
    id: 'terminal', name: 'Terminal', font: 'Share Tech Mono',
    description: 'Text typed onto a dark readout strip after a prompt mark. For system, data and code moments.',
    group: {maxWords: 4, maxChars: 22},
    css: `.cap-terminal{bottom:17%;font:400 5.2cqw/1.4 "Share Tech Mono";color:#3ef0ff;text-transform:uppercase}
          .cap-terminal span{background:#04070ce0;padding:.35em .6em;border-left:.14em solid #3ef0ff;box-decoration-break:clone;-webkit-box-decoration-break:clone}
          .cap-terminal i{display:inline-block;width:.5em;height:.95em;background:#ffb300;vertical-align:-.12em;margin-left:.12em}`,
    render: (p, t) => {
      let text = '';
      for (const w of p.words) { if (t < w.start) break; const q = clamp((t - w.start) / Math.max(.08, w.end - w.start)); text += (text ? ' ' : '') + w.text.slice(0, Math.ceil(w.text.length * q)); }
      return `<span>&gt; ${esc(text)}<i style="opacity:${Math.floor(t * 4) % 2 ? .25 : 1}"></i></span>`;
    },
  },
];
