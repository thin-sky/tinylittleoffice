/** Text cards as exportable pages, without DOM or application dependencies. */
import type { Page } from '../core/app.ts';
import { text, wrapText, rect, LINE, MUTED, SHADE } from './draw.ts';
export function recordPage(title: string, records: { title: string; lines: string[] }[], small = false): Page {
  let y = 66;
  let svg = text(36, 42, title, { px: 25, bold: true });
  const visible = small ? records.slice(0, 3) : records;
  for (const card of visible) {
    const heading = wrapText(card.title, 608, 19, true);
    const lines = card.lines.flatMap((line) => wrapText(line, 608, 16));
    const height = 30 + heading.length * 25 + lines.length * 22;
    svg += rect(36, y, 648, height, SHADE, 'rx="10" stroke="' + LINE + '"');
    let cy = y + 29;
    for (const line of heading) {
      svg += text(56, cy, line, { px: 19, bold: true });
      cy += 25;
    }
    for (const line of lines) {
      svg += text(56, cy, line, { px: 16, fill: MUTED });
      cy += 22;
    }
    y += height + 14;
  }
  return { w: 720, h: Math.max(180, y + 22), svg, alt: [title, ...visible.flatMap((r) => [r.title, ...r.lines])].join('\n') };
}
