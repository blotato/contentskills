import {C, F, series, line, ring, text, draw, span, easeOut, flicker} from '../../hud.js';
import {card} from './_card.js';

// A dot-matrix world map that a scan beam reveals, with pinging hotspots and a ranked readout.
// The land outlines are deliberately coarse: a stylised map, not a geographic reference.
export const meta = {duration: 5, live: true};
export const defaults = {title: 'Where the audience is', unit: 'Illustrative · share of viewers', suffix: '%', clear: false,
  spots: [{label: 'North America', lon: -98, lat: 40, value: 38}, {label: 'Europe', lon: 12, lat: 50, value: 27}, {label: 'South Asia', lon: 78, lat: 22, value: 21}, {label: 'Brazil', lon: -50, lat: -12, value: 14}]};

const LAND = [
  [[-168, 65], [-160, 70], [-130, 70], [-110, 73], [-85, 72], [-78, 62], [-64, 60], [-55, 52], [-66, 44], [-75, 35], [-81, 25], [-90, 29], [-97, 26], [-97, 18], [-88, 16], [-83, 9], [-78, 8], [-85, 12], [-95, 15], [-105, 20], [-110, 24], [-117, 32], [-124, 40], [-124, 48], [-135, 58], [-150, 60], [-165, 55], [-160, 60]],
  [[-55, 60], [-42, 60], [-20, 70], [-20, 80], [-35, 83], [-60, 82], [-70, 77], [-55, 70]],
  [[-80, 8], [-72, 12], [-60, 10], [-50, 2], [-35, -6], [-39, -15], [-48, -26], [-57, -37], [-65, -42], [-68, -54], [-74, -50], [-72, -35], [-70, -18], [-81, -5]],
  [[-10, 36], [-9, 43], [-2, 44], [-4, 48], [3, 51], [8, 54], [5, 58], [6, 62], [14, 68], [26, 71], [45, 68], [70, 73], [105, 77], [140, 73], [180, 69], [180, 65], [163, 60], [157, 51], [143, 53], [135, 44], [128, 38], [122, 40], [122, 30], [110, 20], [108, 11], [103, 9], [100, 13], [98, 8], [103, 1], [97, 16], [90, 22], [80, 13], [77, 8], [72, 20], [67, 24], [57, 25], [60, 22], [52, 16], [44, 12], [35, 28], [36, 36], [27, 37], [23, 36], [20, 40], [13, 45], [18, 40], [15, 37], [12, 44], [3, 43], [0, 38], [-6, 36]],
  [[-17, 15], [-16, 24], [-6, 35], [10, 37], [20, 32], [32, 31], [37, 20], [43, 11], [51, 11], [41, -3], [40, -15], [35, -24], [27, -34], [18, -34], [12, -17], [9, 0], [-8, 4], [-13, 8]],
  [[114, -22], [122, -17], [131, -12], [136, -15], [142, -11], [153, -27], [150, -37], [140, -38], [131, -32], [116, -34]],
  [[-6, 50], [1, 51], [-2, 58], [-6, 57]], [[130, 32], [141, 36], [142, 44], [140, 41], [135, 35]], [[44, -24], [50, -15], [47, -14], [44, -18]],
  [[167, -46], [174, -41], [178, -38], [173, -35]], [[95, 5], [105, -6], [115, -8], [120, -3], [117, 4], [110, 1]], [[131, -2], [141, -3], [150, -8], [141, -9]],
];

export function mount(el, props = defaults) {
  const d3 = window.d3, {root, frame} = card(el, props), X = d3.scaleLinear().domain([-170, 182]).range([84, 916]), Y = d3.scaleLinear().domain([78, -58]).range([238, 650]);
  const dots = [];
  for (let lat = 74; lat >= -54; lat -= 4) for (let lon = -166; lon <= 178; lon += 4) if (LAND.some(p => d3.polygonContains(p, [lon, lat]))) {
    const x = X(lon), y = Y(lat), near = d3.min(props.spots, s => Math.hypot(X(s.lon) - x, Y(s.lat) - y) / (30 + s.value * 1.4));
    dots.push({x, heat: Math.max(0, 1 - near), node: root.append('circle').attr('cx', x).attr('cy', y).attr('r', 3.3).attr('fill', near < .55 ? C.amber : near < 1 ? C.cyan : C.teal)});
  }
  const beam = line(root, 'M0 232V656', C.cyan, 3), max = d3.max(props.spots, s => s.value);
  const spots = props.spots.map((s, i) => {
    const x = X(s.lon), y = Y(s.lat), g = root.append('g'), color = series[i % series.length];
    const halos = [0, 1].map(() => ring(g, x, y, 8, C.white, 2));
    g.append('rect').attr('x', x - 8).attr('y', y - 8).attr('width', 16).attr('height', 16).attr('fill', C.white).attr('transform', `rotate(45 ${x} ${y})`);
    text(g, x + 18, y - 14, String(i + 1).padStart(2, '0'), {size: 24, color: C.white, spacing: '0'});
    const col = i % 2, rowY = 726 + Math.floor(i / 2) * 104, rx = 84 + col * 430, row = root.append('g');
    text(row, rx, rowY, String(i + 1).padStart(2, '0'), {size: 24, color: C.amber, spacing: '0'});
    text(row, rx + 44, rowY, s.label.toUpperCase(), {size: 28, font: F.text, weight: 700, color: C.white, spacing: '.04em'});
    const value = text(row, rx + 400, rowY, '', {size: 32, font: F.display, weight: 800, color, anchor: 'end', spacing: '0'});
    line(row, `M${rx} ${rowY + 26}H${rx + 400}`, C.grid, 8);
    return {g, halos, row, value, s, at: 1.9 + i * .28, x, bar: line(row, `M${rx} ${rowY + 26}H${rx + 400 * s.value / max}`, color, 8)};
  });
  return {seek(t) {
    draw(frame, span(t, 0, .5));
    // First pass reveals the map; later passes are a slow idle sweep that brightens what it crosses.
    const first = span(t, .3, 1.5), sweep = first < 1 ? 60 + first * 900 : 60 + ((t - 1.8) / 3.2 % 1) * 900;
    beam.attr('transform', `translate(${sweep} 0)`).attr('opacity', t > .3 && sweep < 930 ? .8 : 0);
    for (const d of dots) { const lit = Math.exp(-Math.abs(sweep - d.x) / 26); d.node.attr('opacity', first < 1 && d.x > sweep ? 0 : Math.min(1, .5 + d.heat * .5 + lit * .6)).attr('r', 3.3 + lit * 1.6 + d.heat * 1.2 * Math.abs(Math.sin(t * 2.2 + d.x * .02))); }
    for (const p of spots) {
      p.g.attr('opacity', flicker(t, p.at)); p.row.attr('opacity', flicker(t, p.at + .15));
      p.halos.forEach((h, k) => { const u = ((t - p.at) / 1.6 + k / 2) % 1; h.attr('r', 8 + u * 46).attr('opacity', t > p.at ? 1 - u : 0); });
      const q = easeOut(span(t, p.at + .2, .8)); draw(p.bar, span(t, p.at + .2, .8)); p.value.text(Math.round(p.s.value * q) + (props.suffix ?? ''));
    }
  }};
}
