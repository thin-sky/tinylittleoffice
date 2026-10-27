import { parse, write } from '../../doc/index.ts';
import { t } from '../../kit/core/i18n.ts';
import type { Template } from '../../kit/core/app.ts';
export const templates = (): Template[] => [
  {
    id: 'plans',
    name: t('sky-dates-example'),
    blurb: t('sky-dates-example-blurb'),
    doc: write(
      parse(`---
title: A year of small adventures
month: 2027-01
week-start: monday
---
Group | Start | End | Color
--- | --- | --- | ---
Time off | 2027-01-15 | 2027-01-18 | green
Time off | 2027-04-05 | 2027-04-09 | green
Study together | 2027-01-16 | 2027-01-16 | indigo
Study together | 2027-02-06 | 2027-02-06 | indigo
`),
    ),
  },
];
