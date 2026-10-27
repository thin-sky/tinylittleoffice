import { parse, write } from '../../doc/index.ts';
import { t } from '../../kit/core/i18n.ts';
import type { Template } from '../../kit/core/app.ts';
export const templates = (): Template[] => [
  {
    id: 'decision',
    name: t('sky-decision'),
    blurb: t('sky-decision-blurb'),
    doc: write(
      parse(`---
title: Should we build it?
---
Score each factor from 1 to 5. The weights favor usefulness over novelty.

Field:name | Value | Unit | Hint
--- | --- | --- | ---
Usefulness | 4 | number | How much does this help?
Confidence | 3 | number | How certain are we?
Ease | 4 | number | 5 means easiest to deliver
Score | =ROUND((USEFULNESS*3+CONFIDENCE*2+EASE)/6,2) | / 5 | Weighted result

- [ ] Talk to one person who would use this.
- [ ] Write the smallest next step.
`),
    ),
  },
  {
    id: 'recipe',
    name: t('sky-recipe'),
    blurb: t('sky-recipe-blurb'),
    doc: write(
      parse(`---
title: Everyday pancakes
---
An original recipe card. Change Wanted servings to scale the ingredients. Whisk the dry ingredients, mix in the wet ingredients, then cook spoonfuls in a lightly oiled pan until golden on both sides.

Field:name | Value | Unit | Hint
--- | --- | --- | ---
Base servings | 2 | number | The original batch
Wanted servings | 4 | number | Change this to resize the recipe
Scale | =WANTED_SERVINGS/BASE_SERVINGS | number | Batch multiplier
Flour | =150*SCALE | g | Plain flour
Milk | =200*SCALE | ml | Dairy or plant milk
Eggs | =1*SCALE | eggs | Beat before measuring fractional eggs
Baking powder | =1*SCALE | tsp | Mix into the flour
Sugar | =1*SCALE | tbsp | Optional

- [ ] Mix the batter.
- [ ] Heat the pan.
- [ ] Cook and serve.
`),
    ),
  },
  {
    id: 'rpg',
    name: t('sky-rpg'),
    blurb: t('sky-rpg-blurb'),
    doc: write(
      parse(`---
title: Moss, the lantern keeper
---
An original, system-neutral adventure sheet. Moss guides travelers through the flooded forest with a brass lantern and a very stubborn fox. Change the live values as the story unfolds.

Field:name | Value | Unit | Hint
--- | --- | --- | ---
Character | Moss | text | Name
Current health | 14 | number | Update during play
Maximum health | 18 | number | Full health
Health remaining | =ROUND(CURRENT_HEALTH/MAXIMUM_HEALTH*100,0) | % | Current condition
Strength | 2 | number | Add to a strength roll
Wits | 3 | number | Add to a wits roll
Supplies | 6 | number | One per travel day
Travel days | 2 | number | Planned journey
Supplies after travel | =SUPPLIES-TRAVEL_DAYS | number | Plan before leaving
Lantern lit | 1 | check | Mark when the lantern is burning

- [ ] Find the lost ferryman.
- [ ] Return the borrowed map.
`),
    ),
  },
];
