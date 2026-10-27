import { expect, test } from 'vitest';
import { mount, until } from './helpers.ts';
import { appOf } from '../../src/kit/core/apps.ts';
import { encodeDoc } from '../../src/kit/core/codec.ts';
import { inScope, run } from '../../src/kit/core/commands.ts';
import { parse } from '../../src/doc/index.ts';

for (const host of ['write', 'outline', 'deck'])
  test(host + ' embeds each Thin Sky app through its real insert command', { timeout: 30000 }, async () => {
    for (const target of ['worksheet', 'study', 'team']) {
      const template = (await appOf(host)!.templates())[0];
      const shell = await mount('#/v1/' + host + '/' + encodeDoc(template.doc));
      await until(() => !!shell.editor && inScope(host).some((c) => c.id === host + '.insert.app.' + target), 5000);
      const command = inScope(host).find((c) => c.id === host + '.insert.app.' + target)!;
      const pending = run(command, shell.editor) as Promise<void>;
      await until(() => !!document.querySelector('to-doc-dialog dialog[open]'), 5000);
      expect(document.querySelector('to-doc-dialog to-' + target + '-editor')).not.toBeNull();
      if (target === 'team') {
        const input = document.querySelector<HTMLTextAreaElement>('to-doc-dialog textarea')!;
        input.value = 'Pikachu\n- Thunderbolt';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      document.querySelector<HTMLButtonElement>('.to-doc-dialog-done')!.click();
      await pending;
      expect(parse(shell.editor!.value).blocks.some((b) => b.k === 'fence' && b.lang === target)).toBe(true);
    }
  });
