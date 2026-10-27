/** Ordered tiers and their cards are ordinary table rows, edited through kernel operations. */
import { firstTable, tableAt, type Doc, type Op } from '../../doc/index.ts';
import { replaceTable } from '../../kit/core/document-tools.ts';
export interface Tier {
  name: string;
  items: string[];
}
export function readTiers(doc: Doc): Tier[] {
  const groups: Tier[] = [];
  for (const row of tableAt(doc, firstTable(doc))?.rows ?? []) {
    const name = row[0]?.trim();
    if (!name) continue;
    let group = groups.find((g) => g.name === name);
    if (!group) groups.push((group = { name, items: [] }));
    if (row[1]?.trim()) group.items.push(row[1]);
  }
  return groups;
}
export const writeTiers = (doc: Doc, tiers: Tier[]): Op[] =>
  replaceTable(
    doc,
    ['Tier', 'Item'],
    tiers.flatMap((t) => (t.items.length ? t.items.map((item) => [t.name, item]) : [[t.name, '']])),
  );
export function moveTierItem(doc: Doc, from: number, item: number, to: number, position?: number): Op[] {
  const tiers = readTiers(doc);
  if (!tiers[from] || !tiers[to] || !Number.isInteger(item) || item < 0 || item >= tiers[from].items.length) return [];
  const [value] = tiers[from].items.splice(item, 1);
  const at = position === undefined ? tiers[to].items.length : Math.max(0, Math.min(position, tiers[to].items.length));
  tiers[to].items.splice(at, 0, value);
  return writeTiers(doc, tiers);
}
