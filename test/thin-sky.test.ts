import { expect, test } from 'vitest';
import { applyAll, parse, write } from '../src/doc/index.ts';
import { encodeDoc, decodeDoc } from '../src/kit/core/codec.ts';
import { templates as worksheets } from '../src/apps/worksheet/templates.ts';
import { readWorksheet, setField } from '../src/apps/worksheet/model.ts';
import { templates as packs } from '../src/apps/study/templates.ts';
import { readStudy } from '../src/apps/study/model.ts';
import { templates as teams } from '../src/apps/team/templates.ts';
import { parseTeam, setTeamSource, teamSource } from '../src/apps/team/model.ts';
import { replaceDocument } from '../src/kit/core/document-tools.ts';

test('recipe scales, protects formula outputs, and survives a share-link round trip', () => {
  const doc = parse(worksheets().find((t) => t.id === 'recipe')!.doc);
  const original = readWorksheet(doc);
  expect(original.fields.find((f) => f.label === 'Flour')?.value).toBe('300');
  const changed = applyAll(doc, setField(doc, 1, '6'));
  expect(readWorksheet(changed).fields.find((f) => f.label === 'Flour')?.value).toBe('450');
  expect(setField(changed, 3, '999')).toEqual([]);
  const restored = parse(decodeDoc(encodeDoc(write(changed))));
  expect(readWorksheet(restored).fields.find((f) => f.label === 'Flour')?.value).toBe('450');
});

test('the Toki Pona study pack has content and a real cloze prompt', () => {
  const pack = readStudy(parse(packs().find((t) => t.id === 'toki-pona')!.doc));
  expect(pack.cards).toHaveLength(16);
  expect(pack.cards.at(-1)).toMatchObject({ front: 'ona […] pona.', back: 'li' });
  expect(pack.notes.join(' ')).toContain('except after mi alone or sina alone');
});

test('missing answers are skipped while an implicit cloze answer is kept', () => {
  const pack = readStudy(parse('Front | Back\n--- | ---\nEmpty | \nA {{word}} | \n'));
  expect(pack.cards).toEqual([{ front: 'A […]', back: 'word', hint: '' }]);
});

test('team text is preserved across document and URL round trips, including unfamiliar fields', () => {
  const source = 'Moss (Pikachu) (F) @ Light Ball\nAbility: Static\nTera Type: Grass\nUnfamiliar: preserved\n- Thunderbolt\n\nEevee\n- Tackle';
  const doc = applyAll(parse(''), setTeamSource(parse(''), source));
  const back = parse(decodeDoc(encodeDoc(write(doc))));
  expect(teamSource(back)).toBe(source);
  expect(parseTeam(teamSource(back))).toMatchObject([{ name: 'Moss (Pikachu) (F)', item: 'Light Ball', moves: ['Thunderbolt'] }, { name: 'Eevee' }]);
  expect(parseTeam(teamSource(parse(teams()[0].doc)))).toHaveLength(3);
});

test('source replacement removes old metadata while preserving all new content', () => {
  const before = parse('---\ntitle: Before\nold: gone\n---\nHello\n');
  const after = applyAll(before, replaceDocument(before, '---\ntitle: After\n---\nNew content\n'));
  expect(after.head).toEqual({ title: 'After' });
  expect(write(after)).toContain('New content');
});
