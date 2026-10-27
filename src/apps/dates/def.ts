import { CalendarCheck } from 'lucide';
import { defineApp } from '../../kit/core/app.ts';
import { documentTitle, titledDocument } from '../../kit/core/document-tools.ts';
import { parse, write } from '../../doc/index.ts';
import { t } from '../../kit/core/i18n.ts';
import { datesCalendar, datesIcs } from './model.ts';
import { datesPage } from './view.ts';
export default defineApp({
  id: 'dates',
  get name() {
    return t('sky-dates');
  },
  get noun() {
    return t('sky-dates-noun');
  },
  get group() {
    return t('sky-tools');
  },
  icon: CalendarCheck,
  get blurb() {
    return t('sky-dates-blurb');
  },
  blank: () => 'Group | Start | End | Color\n--- | --- | --- | ---\nMy dates | | | indigo\n',
  templates: () => import('./templates.ts').then((m) => m.templates()),
  editor: () => import('./editor.ts'),
  title: documentTitle,
  retitle: titledDocument,
  view: (source, opts) => [datesPage(parse(source), opts?.small)],
  exports: [{ ext: 'ics', label: () => t('cal-icalendar-ics'), mime: 'text/calendar;charset=utf-8', shows: null, build: (source) => datesIcs(parse(source), Date.now()) }],
  handoffs: [{ to: 'cal', label: () => t('sky-open-calendar'), convert: (source) => write(datesCalendar(parse(source))) }],
});
