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
