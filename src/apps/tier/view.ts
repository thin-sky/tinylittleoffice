import type { Page } from '../../kit/core/app.ts';
import { text, wrapText, rect, INK, LINE, SHADE } from '../../kit/draw/draw.ts';
import type { Tier } from './model.ts';
export function tierPage(title: string, tiers: Tier[], small = false): Page {
  const colors = ['#fecaca', '#fed7aa', '#fef08a', '#bbf7d0', '#bfdbfe', '#ddd6fe'];
  const heading = wrapText(title, 648, 25, true);
  let svg = heading.map((line, i) => text(24, 38 + i * 31, line, { px: 25, bold: true })).join('');
  let y = 58 + (heading.length - 1) * 31;
  const visible = small ? tiers.slice(0, 6) : tiers;
  for (const [i, tier] of visible.entries()) {
    const labels = wrapText(tier.name, 88, 20, true);
    const lines = wrapText(tier.items.join(' · ') || '—', 520, 18);
    const h = Math.max(70, 24 + Math.max(labels.length * 25, lines.length * 26));
    svg += rect(24, y, 672, h, SHADE, 'stroke="' + LINE + '"');
    svg += rect(24, y, 120, h, colors[i % colors.length]);
    labels.forEach((label, n) => (svg += text(38, y + 32 + n * 25, label, { px: 20, bold: true, fill: INK })));
    lines.forEach((line, n) => (svg += text(160, y + 32 + n * 26, line, { px: 18, fill: INK })));
    y += h + 5;
  }
  return { w: 720, h: Math.max(180, y + 24), svg, alt: [title, ...visible.map((t) => t.name + ': ' + t.items.join(', '))].join('\n') };
}
