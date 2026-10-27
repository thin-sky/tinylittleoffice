/** A worksheet is a named-value table, evaluated by the existing spreadsheet engine. */
import { evaluate, firstTable, formatValue, plainText, tableAt, type Doc, type Op } from '../../doc/index.ts';
export function readWorksheet(doc: Doc) {
  const at = firstTable(doc);
  const table = tableAt(doc, at);
  const values = evaluate(doc, at)?.values ?? [];
  return {
    at,
    intro: doc.blocks.filter((b) => b.k === 'p' || b.k === 'quote').map((b) => plainText(b.runs)),
    fields: (table?.rows ?? []).map((row, index) => ({
      index,
      label: row[0] ?? '',
      raw: row[1] ?? '',
      unit: row[2] ?? '',
      hint: row[3] ?? '',
      calculated: (row[1] ?? '').startsWith('='),
      value: formatValue(values[index]?.[1] ?? null),
    })),
    checks: doc.blocks.flatMap((b, index) => (b.k === 'li' && b.done !== undefined ? [{ index, label: plainText(b.runs), done: b.done }] : [])),
  };
}
export function setField(doc: Doc, row: number, value: string): Op[] {
  const at = firstTable(doc);
  const table = tableAt(doc, at);
  if (!table?.rows[row] || table.rows[row][1]?.startsWith('=')) return [];
  return [{ op: 'cells', at, r: row, c: 1, values: [[value]] }];
}
