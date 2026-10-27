import type { Doc } from '../../doc/index.ts';
import { dayToYmd } from '../../doc/index.ts';
import type { Page } from '../../kit/core/app.ts';
import { text, wrapText, rect, INK, LINE, MUTED, SHADE } from '../../kit/draw/draw.ts';
import { t } from '../../kit/core/i18n.ts';
import { dateWords } from '../../kit/core/dates.ts';
import { DATE_COLORS, dateString, readDates, monthGrid, shiftMonth } from './model.ts';
export function datesPage(doc: Doc, small = false): Page {
  const v = readDates(doc),
    title = doc.head.title || t('sky-dates');
  const heading = wrapText(title, 1000, 26, true);
  let svg = heading.map((line, i) => text(24, 36 + i * 32, line, { px: 26, bold: true })).join('');
  const legend = v.groups.flatMap((g) => wrapText(g.name, 970, 16).map((line, i) => ({ line, color: g.color, first: i === 0 })));
  const top = 62 + (heading.length - 1) * 32;
  legend.forEach((entry, i) => {
    if (entry.first) svg += rect(24, top + i * 22 - 12, 12, 12, DATE_COLORS[entry.color].hex);
    svg += text(46, top + i * 22, entry.line, { px: 16, fill: MUTED });
  });
  const startY = top + legend.length * 22 + 20,
    count = small ? 3 : 12;
  const cols = Array.from({ length: 7 }, (_, i) => (v.weekStart + i) % 7).filter((w) => v.weekends || ![0, 6].includes(w));
  for (let i = 0; i < count; i++) {
    const month = shiftMonth(v.month, i),
      [y, m] = month.split('-').map(Number),
      x = 24 + (i % 3) * 352,
      y0 = startY + Math.floor(i / 3) * 260;
    svg += text(x, y0 + 20, dateWords({ month: 'long', year: 'numeric', timeZone: 'UTC' }).format(Date.UTC(y, m - 1, 1)), { px: 20, bold: true });
    const cw = 320 / cols.length;
    cols.forEach((wd, n) => (svg += text(x + n * cw + 5, y0 + 46, dateWords({ weekday: 'short', timeZone: 'UTC' }).format(Date.UTC(2027, 0, 3 + wd)), { px: 12, fill: MUTED })));
    monthGrid(month, v.weekStart, v.weekends).forEach((week, row) =>
      week.forEach((day, col) => {
        if (day === null) return;
        const px = x + col * cw,
          py = y0 + 55 + row * 30,
          groups = v.groups.filter((g) => g.ranges.some((r) => day >= r.start && day <= r.end));
        svg += rect(px, py, cw - 3, 28, SHADE, 'stroke="' + LINE + '"');
        svg += text(px + 7, py + 19, String(dayToYmd(day).d), { px: 14, fill: INK });
        groups.forEach((g, n) => (svg += rect(px + (n * (cw - 3)) / groups.length, py + 24, (cw - 3) / groups.length, 4, DATE_COLORS[g.color].hex)));
      }),
    );
  }
  return {
    w: 1080,
    h: startY + Math.ceil(count / 3) * 260,
    svg,
    alt: [title, ...v.groups.map((g) => g.name + ': ' + g.ranges.map((r) => dateString(r.start) + (r.end > r.start ? '–' + dateString(r.end) : '')).join(', '))].join('\n'),
  };
}
