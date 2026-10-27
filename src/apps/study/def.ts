import { GraduationCap } from 'lucide';
import { parse } from '../../doc/index.ts';
import { defineApp } from '../../kit/core/app.ts';
import { documentTitle, titledDocument } from '../../kit/core/document-tools.ts';
import { t } from '../../kit/core/i18n.ts';
import { recordPage } from '../../kit/draw/record-page.ts';
import { readStudy } from './model.ts';
export default defineApp({
  id: 'study',
  get name() {
    return t('sky-study');
  },
  get noun() {
    return t('sky-study-noun');
  },
  get group() {
    return t('sky-tools');
  },
  icon: GraduationCap,
  get blurb() {
    return t('sky-study-blurb');
  },
  blank: () => 'Front | Back | Hint\n--- | --- | ---\nYour first question | Your answer | A helpful clue\n',
  templates: () => import('./templates.ts').then((m) => m.templates()),
  editor: () => import('./editor.ts'),
  title: documentTitle,
  retitle: titledDocument,
  view: (text, opts) => {
    const doc = parse(text),
      study = readStudy(doc);
    return [
      recordPage(
        doc.head.title || t('sky-study'),
        study.cards.map((c) => ({ title: c.front, lines: [c.back, c.hint].filter(Boolean) })),
        opts?.small,
      ),
    ];
  },
});
