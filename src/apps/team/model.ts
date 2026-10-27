/** Preserve the original Showdown export; cards are only a view of it. */
import { type Doc, type Op } from '../../doc/index.ts';
export function teamSource(doc: Doc): string {
  const fence = doc.blocks.find((b) => b.k === 'fence' && b.lang === 'showdown');
  return fence?.k === 'fence' ? fence.body : '';
}
export function parseTeam(source: string) {
  return source
    .replace(/\r\n?/g, '\n')
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean)
    .flatMap((block) => {
      const lines = block
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      if (lines[0]?.startsWith('===')) lines.shift();
      const first = lines.shift();
      if (!first) return [];
      const split = first.lastIndexOf(' @ ');
      return [
        {
          name: split < 0 ? first : first.slice(0, split),
          item: split < 0 ? '' : first.slice(split + 3),
          moves: lines.filter((l) => l.startsWith('- ')).map((l) => l.slice(2)),
          details: lines.filter((l) => !l.startsWith('- ')),
        },
      ];
    });
}
export function setTeamSource(doc: Doc, source: string): Op[] {
  const at = doc.blocks.findIndex((b) => b.k === 'fence' && b.lang === 'showdown');
  return [{ op: 'splice', at: at < 0 ? doc.blocks.length : at, n: at < 0 ? 0 : 1, blocks: [{ k: 'fence', lang: 'showdown', body: source.replace(/\r\n?/g, '\n').replace(/\n+$/, '') }] }];
}
