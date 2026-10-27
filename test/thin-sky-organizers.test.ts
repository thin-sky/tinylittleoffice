import { expect, test } from 'vitest';
import { applyAll, parse, write } from '../src/doc/index.ts';
import { encodeDoc, decodeDoc } from '../src/kit/core/codec.ts';
import { readTiers, writeTiers, moveTierItem } from '../src/apps/tier/model.ts';
import { civilDay, dateString, readDates, selectDates, writeDateGroups, monthGrid, datesIcs } from '../src/apps/dates/model.ts';
import { datesPage } from '../src/apps/dates/view.ts';
const roundTrip = (doc: ReturnType<typeof parse>) => parse(decodeDoc(encodeDoc(write(doc))));
const day = (date: string) => civilDay(date)!;

test('tier movement is positional, preserves duplicate cards and empty tiers, and survives URL encoding', () => {
  const doc = parse('Tier | Item\n--- | ---\nS | \nA | same\nA | same\nPool | 🌿 A\\|B\n');
  const moved = applyAll(doc, moveTierItem(doc, 1, 1, 0));
  expect(readTiers(roundTrip(moved))).toEqual([
    { name: 'S', items: ['same'] },
    { name: 'A', items: ['same'] },
    { name: 'Pool', items: ['🌿 A|B'] },
  ]);
  const swapped = applyAll(moved, moveTierItem(moved, 2, 0, 1, 0));
  expect(readTiers(swapped)[1].items).toEqual(['🌿 A|B', 'same']);
  expect(readTiers(swapped)[2].items).toEqual([]);
  expect(moveTierItem(doc, 0, 99, 1)).toEqual([]);
  const punctuation = applyAll(doc, writeTiers(doc, [{ name: 'S | A', items: ['<b>text</b>', 'one\ntwo'] }]));
  expect(readTiers(roundTrip(punctuation))).toEqual(readTiers(punctuation));
});

test('deselecting one day splits only its active group and adding a range is idempotent', () => {
  let doc = parse('');
  doc = applyAll(
    doc,
    writeDateGroups(doc, [
      { name: 'Time off', color: 3, ranges: [{ start: day('2027-01-15'), end: day('2027-01-18') }] },
      { name: 'Study', color: 0, ranges: [{ start: day('2027-01-16'), end: day('2027-01-16') }] },
    ]),
  );
  doc = applyAll(doc, selectDates(doc, 0, day('2027-01-16')));
  expect(readDates(doc).groups[0].ranges).toEqual([
    { start: day('2027-01-15'), end: day('2027-01-15') },
    { start: day('2027-01-17'), end: day('2027-01-18') },
  ]);
  expect(readDates(doc).groups[1].ranges).toEqual([{ start: day('2027-01-16'), end: day('2027-01-16') }]);
  for (let n = 0; n < 2; n++) doc = applyAll(doc, selectDates(doc, 0, day('2027-01-16'), day('2027-01-16'), false));
  expect(readDates(roundTrip(doc)).groups[0].ranges).toEqual([{ start: day('2027-01-15'), end: day('2027-01-18') }]);
});

test('calendar dates reject normalization, support leap days and keep civil days across DST', () => {
  expect(civilDay('2027-02-29')).toBeNull();
  expect(civilDay('2027-04-31')).toBeNull();
  expect(civilDay('2028-02-29')).not.toBeNull();
  expect(dateString(day('2027-03-13') + 1)).toBe('2027-03-14');
  const monday = monthGrid('2027-01', 1, false);
  expect(monday[0]).toEqual([null, null, null, null, day('2027-01-01')]);
  expect(monday.flat().filter((x) => x !== null)).toHaveLength(21);
  expect(monthGrid('2028-02', 0, true).flat()).toContain(day('2028-02-29'));
});

test('calendar export includes the last day and escapes group names, while the page shows twelve months', () => {
  const source = parse('---\ntitle: A year\nmonth: 2027-01\n---\nGroup | Start | End | Color\n--- | --- | --- | ---\nA, B; C | 2027-12-30 | 2028-01-02 | purple\n');
  const ics = datesIcs(source, 0);
  expect(ics).toContain('DTSTART;VALUE=DATE:20271230');
  expect(ics).toContain('DTEND;VALUE=DATE:20280103');
  expect(ics).toContain('SUMMARY:A\\, B\\; C');
  const page = datesPage(source);
  expect(page.svg).toContain('December 2027');
  expect(page.alt).toContain('2027-12-30–2028-01-02');
});

test('a calendar keeps its opening month when its first dates are edited and shared', () => {
  const blank = parse('Group | Start | End | Color\n--- | --- | --- | ---\nDates | | | indigo\n');
  const initial = readDates(blank).month;
  const changed = applyAll(blank, selectDates(blank, 0, day(initial + '-15')));
  expect(roundTrip(changed).head.month).toBe(initial);
  const old = parse('Group | Start | End | Color\n--- | --- | --- | ---\nDates | 2027-12-01 | 2027-12-02 | indigo\n');
  expect(readDates(old).month).toBe('2027-12');
});
