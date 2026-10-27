import { ListOrdered } from 'lucide';
import { defineApp } from '../../kit/core/app.ts';
import { documentTitle, titledDocument } from '../../kit/core/document-tools.ts';
import { parse } from '../../doc/index.ts';
import { t } from '../../kit/core/i18n.ts';
import { readTiers } from './model.ts';
import { tierPage } from './view.ts';
export default defineApp({
  id: 'tier',
  get name() {
    return t('sky-tier');
  },
  get noun() {
    return t('sky-tier-noun');
  },
  get group() {
    return t('sky-tools');
  },
  icon: ListOrdered,
  get blurb() {
    return t('sky-tier-blurb');
  },
  blank: () => 'Tier | Item\n--- | ---\nS | \nA | \nB | \nC | \nD | \nUnranked | \n',
  templates: () => import('./templates.ts').then((m) => m.templates()),
  editor: () => import('./editor.ts'),
  title: documentTitle,
  retitle: titledDocument,
  view: (source, opts) => {
    const doc = parse(source);
    return [tierPage(doc.head.title || t('sky-tier'), readTiers(doc), opts?.small)];
  },
});
