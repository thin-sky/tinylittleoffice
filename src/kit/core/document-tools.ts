/** Shared document edits for the thin-sky apps; replacements remain undoable. */
import { apply, parse, write, type Doc, type Op } from '../../doc/index.ts';
export const documentTitle = (text: string): string => parse(text).head.title ?? '';
export const titledDocument = (text: string, title: string): string => write(apply(parse(text), { op: 'head', key: 'title', value: title.replace(/\n/g, ' ').trim() || undefined }));
export function replaceDocument(before: Doc, text: string): Op[] {
  const after = parse(text);
  return [
    ...[...new Set([...Object.keys(before.head), ...Object.keys(after.head)])].map((key): Op => ({ op: 'head', key, value: after.head[key] })),
    { op: 'splice', at: 0, n: before.blocks.length, blocks: after.blocks },
  ];
}

/** Replace the first table, keeping the rest of the document and its metadata. */
export function replaceTable(doc: Doc, names: string[], rows: string[][]): Op[] {
  const at = doc.blocks.findIndex((b) => b.k === 'table');
  const before = doc.blocks[at];
  return [
    {
      op: 'splice',
      at: at < 0 ? doc.blocks.length : at,
      n: at < 0 ? 0 : 1,
      blocks: [{ ...(before?.k === 'table' ? before : {}), k: 'table', cols: names.map((name) => ({ name, type: 'text' })), rows }],
    },
  ];
}
