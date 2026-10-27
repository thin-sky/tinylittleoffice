/** Date groups and inclusive ranges, stored in a normal document table. Civil days avoid DST shifts. */
import { firstTable, tableAt, dayToYmd, ymdToDay, ymdString, type Doc, type Op } from '../../doc/index.ts';
import { replaceTable } from '../../kit/core/document-tools.ts';
import { icsDate, icsStamp, icsText, vcalendar } from '../../kit/file/ics.ts';
import { CAL_COLORS } from '../cal/model.ts';
export const DATE_COLORS = Object.values(CAL_COLORS);
export interface DateRange {
  start: number;
  end: number;
}
export interface DateGroup {
  name: string;
  color: number;
  ranges: DateRange[];
}
export const dateString = (day: number): string => {
  const { y, m, d } = dayToYmd(day);
  return ymdString(y, m, d);
};
export function civilDay(value: string): number | null {
  if (!/^[1-9]\d{3}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split('-').map(Number),
    day = ymdToDay(y, m, d);
  return dateString(day) === value ? day : null;
}
export function shiftMonth(month: string, offset: number): string {
  const [y, m] = month.split('-').map(Number);
  return dateString(ymdToDay(y, m + offset, 1)).slice(0, 7);
}
export function readDates(doc: Doc) {
  const groups: DateGroup[] = [];
  for (const row of tableAt(doc, firstTable(doc))?.rows ?? []) {
    const name = row[0]?.trim();
    if (!name) continue;
    let group = groups.find((g) => g.name === name);
    if (!group) {
      const color = DATE_COLORS.findIndex((c) => c.word === row[3]);
      groups.push((group = { name, color: color < 0 ? groups.length % DATE_COLORS.length : color, ranges: [] }));
    }
    const start = civilDay(row[1] || ''),
      end = civilDay(row[2] || row[1] || '');
    if (start !== null && end !== null && end >= start) group.ranges.push({ start, end });
  }
  const today = new Date(),
    first = groups.flatMap((g) => g.ranges).reduce((day, range) => Math.min(day, range.start), Infinity),
    fallback = Number.isFinite(first) ? dateString(first).slice(0, 7) : ymdString(today.getFullYear(), today.getMonth() + 1, 1).slice(0, 7);
  const month = civilDay((doc.head.month || '') + '-01') === null ? fallback : doc.head.month;
  return { groups, month, weekStart: doc.head['week-start'] === 'sunday' ? 0 : 1, weekends: doc.head.weekends !== 'false' };
}
/** Normalize inclusive ranges without expanding them into one row per day. */
function mergeRanges(ranges: DateRange[]): DateRange[] {
  const sorted = ranges.map((r) => ({ ...r })).sort((a, b) => a.start - b.start || a.end - b.end);
  const out: DateRange[] = [];
  for (const range of sorted) {
    const last = out.at(-1);
    if (last && range.start <= last.end + 1) last.end = Math.max(last.end, range.end);
    else out.push(range);
  }
  return out;
}
export function writeDateGroups(doc: Doc, groups: DateGroup[]): Op[] {
  const ops = replaceTable(
    doc,
    ['Group', 'Start', 'End', 'Color'],
    groups.flatMap((g) => {
      const ranges = mergeRanges(g.ranges),
        color = DATE_COLORS[g.color]?.word || DATE_COLORS[0].word;
      return ranges.length ? ranges.map((r) => [g.name, dateString(r.start), dateString(r.end), color]) : [[g.name, '', '', color]];
    }),
  );
  if (civilDay((doc.head.month || '') + '-01') === null) ops.push({ op: 'head', key: 'month', value: readDates(doc).month });
  return ops;
}
export function selectDates(doc: Doc, index: number, start: number, end = start, toggle = true): Op[] {
  const { groups } = readDates(doc),
    group = groups[index];
  if (!group || !Number.isInteger(start) || !Number.isInteger(end) || end < start) return [];
  const contains = group.ranges.some((r) => r.start <= start && r.end >= start);
  if (toggle && start === end && contains) {
    group.ranges = group.ranges.flatMap((r) =>
      start < r.start || start > r.end ? [r] : [...(r.start < start ? [{ start: r.start, end: start - 1 }] : []), ...(start < r.end ? [{ start: start + 1, end: r.end }] : [])],
    );
  } else group.ranges.push({ start, end });
  return writeDateGroups(doc, groups);
}
export function monthGrid(month: string, weekStart: number, weekends: boolean): (number | null)[][] {
  const [y, m] = month.split('-').map(Number),
    first = ymdToDay(y, m, 1),
    next = ymdToDay(y, m + 1, 1);
  const pad = (dayToYmd(first).wd - weekStart + 7) % 7;
  const weeks: (number | null)[][] = [];
  for (let n = 0; n < pad + next - first; n += 7) {
    const week = Array.from({ length: 7 }, (_, i) => {
      const d = first + n + i - pad;
      return d >= first && d < next ? d : null;
    });
    weeks.push(week.filter((_, i) => weekends || ![0, 6].includes((weekStart + i) % 7)));
  }
  return weeks.filter((w) => w.some((d) => d !== null));
}
/** The existing calendar exporter supplies escaped, folded iCalendar events. */
export function datesCalendar(doc: Doc): Doc {
  return {
    head: { title: doc.head.title || '' },
    blocks: readDates(doc).groups.flatMap((g) =>
      mergeRanges(g.ranges).map((r) => ({ k: 'li' as const, depth: 0, runs: [{ t: dateString(r.start) + (r.end > r.start ? ' to ' + dateString(r.end) : '') + ': ' + g.name }] })),
    ),
  };
}

/** All-day events use an exclusive end in iCalendar; the table keeps the inclusive last day. */
export function datesIcs(doc: Doc, stamp: number): string {
  const events = readDates(doc).groups.flatMap((group, g) =>
    mergeRanges(group.ranges).map((range, r) => [
      'BEGIN:VEVENT',
      `UID:dates-${range.start.toString(36)}-${range.end.toString(36)}-${g}-${r}@thin-sky-office`,
      `DTSTAMP:${icsStamp(stamp)}`,
      `DTSTART;VALUE=DATE:${icsDate(dateString(range.start))}`,
      `DTEND;VALUE=DATE:${icsDate(dateString(range.end + 1))}`,
      `SUMMARY:${icsText(group.name)}`,
      'END:VEVENT',
    ]),
  );
  return vcalendar(events, 'PocketCalendar');
}
