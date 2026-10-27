/** Study content stays in the document; practice progress stays in memory for this visit. */
import { firstTable, tableAt, plainText, type Doc } from '../../doc/index.ts';
export function readStudy(doc: Doc) {
  const table = tableAt(doc, firstTable(doc));
  return {
    notes: doc.blocks.filter((b) => b.k === 'p' || b.k === 'quote').map((b) => plainText(b.runs)),
    cards: (table?.rows ?? []).flatMap((row) => {
      const front = (row[0]?.trim() ?? '').replace(/==(.+?)==/g, '{{' + '$1' + '}}');
      const cloze = [...front.matchAll(/\{\{([^}]+)\}\}/g)].map((m) => m[1]);
      const back = row[1]?.trim() || cloze.join(', ');
      return front && back ? [{ front: front.replace(/\{\{[^}]+\}\}/g, '[…]'), back, hint: row[2] ?? '' }] : [];
    }),
  };
}
