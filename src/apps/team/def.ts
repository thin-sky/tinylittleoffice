import { Layers } from 'lucide';
import { parse } from '../../doc/index.ts';
import { defineApp } from '../../kit/core/app.ts';
import { documentTitle, titledDocument } from '../../kit/core/document-tools.ts';
import { t } from '../../kit/core/i18n.ts';
import { recordPage } from '../../kit/draw/record-page.ts';
import { parseTeam, teamSource } from './model.ts';
export default defineApp({
  id: 'team',
  get name() {
    return t('sky-team');
  },
  get noun() {
    return t('sky-team-noun');
  },
  get group() {
    return t('sky-tools');
  },
  icon: Layers,
  get blurb() {
    return t('sky-team-blurb');
  },
  blank: () => '',
  templates: () => import('./templates.ts').then((m) => m.templates()),
  editor: () => import('./editor.ts'),
  title: documentTitle,
  retitle: titledDocument,
  view: (text, opts) => {
    const doc = parse(text),
      team = parseTeam(teamSource(doc));
    return [
      recordPage(
        doc.head.title || t('sky-team'),
        team.map((p) => ({ title: p.name, lines: [p.item, ...p.details, ...p.moves].filter(Boolean) })),
        opts?.small,
      ),
    ];
  },
  exports: [{ ext: 'txt', label: () => t('sky-showdown-export'), mime: 'text/plain;charset=utf-8', shows: 'text', build: (text) => teamSource(parse(text)) + '\n' }],
});
