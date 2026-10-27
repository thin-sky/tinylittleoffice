import { parse, write } from '../../doc/index.ts';
import type { Template } from '../../kit/core/app.ts';
import { t } from '../../kit/core/i18n.ts';
export const templates = (): Template[] => [
  {
    id: 'rain',
    name: t('sky-rain-team'),
    blurb: t('sky-rain-team-blurb'),
    doc: write(
      parse(
        [
          '---',
          'title: A little rain team',
          '---',
          '```showdown',
          'Pelipper @ Damp Rock',
          'Ability: Drizzle',
          'EVs: 248 HP / 252 Def / 8 SpD',
          'Bold Nature',
          '- Hurricane',
          '- Surf',
          '- U-turn',
          '- Roost',
          '',
          'Barraskewda @ Choice Band',
          'Ability: Swift Swim',
          'EVs: 252 Atk / 4 SpD / 252 Spe',
          'Adamant Nature',
          '- Liquidation',
          '- Close Combat',
          '- Psychic Fangs',
          '- Flip Turn',
          '',
          'Ferrothorn @ Leftovers',
          'Ability: Iron Barbs',
          'EVs: 252 HP / 4 Def / 252 SpD',
          'Careful Nature',
          '- Power Whip',
          '- Knock Off',
          '- Leech Seed',
          '- Stealth Rock',
          '```',
          '',
        ].join('\n'),
      ),
    ),
  },
];
