import { SlidersHorizontal } from 'lucide';
import { defineApp } from '../../kit/core/app.ts';
import { documentTitle, titledDocument } from '../../kit/core/document-tools.ts';
import { parse } from '../../doc/index.ts';
import { t } from '../../kit/core/i18n.ts';
import { recordPage } from '../../kit/draw/record-page.ts';
import { readWorksheet } from './model.ts';
export default defineApp({
  id: 'worksheet',
  get name() {
    return t('sky-worksheet');
  },
  get noun() {
    return t('sky-worksheet-noun');
  },
  get group() {
    return t('sky-tools');
  },
  icon: SlidersHorizontal,
  get blurb() {
    return t('sky-worksheet-blurb');
  },
  blank: () => 'Field:name | Value | Unit | Hint\n--- | --- | --- | ---\nQuantity | 2 | number | Change this value\nResult | =QUANTITY*3 | number | Recalculates automatically\n',
  templates: () => import('./templates.ts').then((m) => m.templates()),
  editor: () => import('./editor.ts'),
  title: documentTitle,
  retitle: titledDocument,
  view: (text, opts) => {
    const doc = parse(text),
      view = readWorksheet(doc);
    return [
      recordPage(
        doc.head.title || t('sky-worksheet'),
        view.fields.map((f) => ({ title: f.label, lines: [f.value + ' ' + (['number', 'check'].includes(f.unit) ? '' : f.unit), f.hint].filter(Boolean) })),
        opts?.small,
      ),
    ];
  },
});
