import { origin } from '../../kit/core/network.ts';
import { parse, write } from '../../doc/index.ts';
import { t } from '../../kit/core/i18n.ts';
import type { Template } from '../../kit/core/app.ts';
export const templates = (): Template[] => [
  {
    id: 'toki-pona',
    name: t('sky-toki'),
    blurb: t('sky-toki-blurb'),
    doc: write(
      parse(`---
title: toki pona · first words
language: tok
---
A small, original beginner practice pack. Toki Pona words cover broad ideas; these English glosses are starting points, not one-to-one translations.

Use li between a subject and its predicate, except after mi alone or sina alone. Compare mi pona with ona li pona. Here mi pona can mean I am good, and ona li pona can mean they are good.

Front | Back | Hint
--- | --- | ---
toki | speech; language; to speak; hello | Communication
pona | good; simple; to improve | A broad positive idea
mi | I; me; we; us | First person
sina | you | Second person
ona | they; he; she; it | Third person
jan | person; human | People
ijo | thing; something | A general thing
moku | food; to eat; to drink | Eating
telo | water; liquid | Liquids
tomo | building; room; indoor space | Built spaces
suli | big; important; adult | Size or importance
lili | small; little; few | Smallness
mi pona. | I am good. | One possible reading; no li after mi alone
sina moku. | You are eating. | One possible reading; no li after sina alone
jan li moku. | A person is eating. | One possible reading; li marks the predicate
ona ==li== pona. | li | Supply the missing predicate marker

Reference: [lipu sona pona, basic sentences](${origin('tokiCourse')}/en/1/). Continue learning at [the official Toki Pona site](${origin('tokiHome')}/).
`),
    ),
  },
  {
    id: 'starter',
    name: t('sky-study-starter'),
    blurb: t('sky-study-starter-blurb'),
    doc: write(
      parse(`---
title: A tiny study pack
---
Reveal an answer, then decide whether to see it again. Customize the table to make this pack your own.

Front | Back | Hint
--- | --- | ---
What does a URL fragment start with? | # | The part that stays in your browser
In this app, the document lives in the ==link==. | link | Fill in the missing word
`),
    ),
  },
];
