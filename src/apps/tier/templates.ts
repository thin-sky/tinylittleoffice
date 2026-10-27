import { parse, write } from '../../doc/index.ts';
import { t } from '../../kit/core/i18n.ts';
import type { Template } from '../../kit/core/app.ts';
export const templates = (): Template[] => [
  {
    id: 'snacks',
    name: t('sky-tier-example'),
    blurb: t('sky-tier-example-blurb'),
    doc: write(
      parse(`---
title: Snack rankings
---
Tier | Item
--- | ---
S | 🍿 Popcorn
A | 🍎 Apple slices
B | 🥨 Pretzels
C | 
D | 
Unranked | 🍫 Chocolate
Unranked | 🧀 Cheese
Unranked | 🍓 Strawberries
`),
    ),
  },
];
