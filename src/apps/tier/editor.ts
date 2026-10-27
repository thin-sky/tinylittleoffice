import { html, nothing } from 'lit';
import { live } from 'lit/directives/live.js';
import { DocElement } from '../../kit/core/element.ts';
import { replaceDocument } from '../../kit/core/document-tools.ts';
import { t } from '../../kit/core/i18n.ts';
import type { Doc } from '../../doc/index.ts';
import { readTiers, writeTiers, moveTierItem } from './model.ts';
import '../../kit/ui/document-source.ts';
export const tag = 'to-tier-editor';
export class TierEditor extends DocElement<ReturnType<typeof readTiers>> {
  static properties = { status: { state: true } };
  declare status: string;
  private dragged: { from: number; item: number } | null = null;
  constructor() {
    super();
    this.status = '';
  }
  protected read(doc: Doc) {
    return readTiers(doc);
  }
  focusFirst() {
    this.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true });
  }
  private rename(index: number, name: string) {
    const tiers = readTiers(this.doc);
    name = name.trim();
    if (!name || tiers.some((x, i) => i !== index && x.name === name)) {
      this.status = t('sky-unique-tier');
      this.requestUpdate();
      return;
    }
    tiers[index].name = name;
    this.status = '';
    this.edit(writeTiers(this.doc, tiers));
  }
  private move(from: number, item: number, to: number, position?: number) {
    const name = this.view[from]?.items[item];
    for (const details of this.querySelectorAll<HTMLDetailsElement>('details[open]')) details.open = false;
    this.edit(moveTierItem(this.doc, from, item, to, position));
    this.status = t('sky-item-moved', { item: name || '', tier: this.view[to]?.name || '' });
  }
  render() {
    if (!this.view) return nothing;
    return html`<article class="sky-document">
      <p class="sky-eyebrow">${t('sky-tier')}</p><h1>${this.doc.head.title || t('sky-tier')}</h1>
      <p>${t('sky-tier-help')}</p>
      <div class="sky-tiers">${this.view.map(
        (tier, from) => html`<section class="sky-tier-row" aria-label=${tier.name}
        @dragover=${(e: DragEvent) => {
          if (this.dragged) e.preventDefault();
        }}
        @drop=${(e: DragEvent) => {
          e.preventDefault();
          if (this.dragged) this.move(this.dragged.from, this.dragged.item, from);
          this.dragged = null;
        }}>
        <div class="sky-tier-label"><input aria-label=${t('sky-tier-name', { name: tier.name })} .value=${live(tier.name)} @change=${(e: Event) => this.rename(from, (e.target as HTMLInputElement).value)} />
        <button class="to-btn" type="button" aria-label=${t('sky-remove-tier', { name: tier.name })} ?disabled=${tier.items.length > 0 || this.view.length < 2} @click=${() =>
          this.edit(
            writeTiers(
              this.doc,
              this.view.filter((_, i) => i !== from),
            ),
          )}>${t('common-delete')}</button></div>
        <ul class="sky-tier-cards">${tier.items.map(
          (item, index) => html`<li class="sky-tier-item" draggable="true" @dragstart=${(e: DragEvent) => {
            this.dragged = { from, item: index };
            e.dataTransfer?.setData('text/plain', item);
            if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
          }} @dragend=${() => (this.dragged = null)}>
          <span>${item}</span><details><summary aria-label=${t('sky-edit-item', { item })}>${t('common-edit')}</summary>
            <label class="sky-field"><span>${t('sky-item-text')}</span><input .value=${live(item)} @change=${(e: Event) => {
              const tiers = readTiers(this.doc);
              const value = (e.target as HTMLInputElement).value.trim();
              if (value) {
                tiers[from].items[index] = value;
                this.edit(writeTiers(this.doc, tiers));
              }
            }} /></label>
            <label class="sky-field"><span>${t('sky-move-to')}</span><select aria-label=${t('sky-move-item', { item })} .value=${String(from)} @change=${(e: Event) => this.move(from, index, Number((e.target as HTMLSelectElement).value))}>${this.view.map((x, n) => html`<option value=${n}>${x.name}</option>`)}</select></label>
            <div class="sky-actions"><button type="button" class="to-btn" aria-label=${t('sky-earlier-item', { item })} ?disabled=${index === 0} @click=${() => this.move(from, index, from, index - 1)}>↑</button><button type="button" class="to-btn" aria-label=${t('sky-later-item', { item })} ?disabled=${index === tier.items.length - 1} @click=${() => this.move(from, index, from, index + 1)}>↓</button><button type="button" class="to-btn" aria-label=${t('sky-delete-item', { item })} @click=${() => {
              const tiers = readTiers(this.doc);
              tiers[from].items.splice(index, 1);
              this.edit(writeTiers(this.doc, tiers));
            }}>${t('common-delete')}</button></div>
          </details>
        </li>`,
        )}</ul>
      </section>`,
      )}</div>
      <p role="status" class="sky-muted">${this.status}</p>
      <form class="sky-card" @submit=${(e: SubmitEvent) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement,
          data = new FormData(form),
          tiers = readTiers(this.doc);
        const items = String(data.get('items') || '')
          .split('\n')
          .map((x) => x.trim())
          .filter(Boolean);
        const tier = tiers[Number(data.get('tier'))];
        if (tier && items.length) {
          tier.items.push(...items);
          this.edit(writeTiers(this.doc, tiers));
          form.reset();
        }
      }}>
        <label class="sky-field"><span>${t('sky-add-items')}</span><textarea class="sky-item-input" name="items" required></textarea></label>
        <div class="sky-actions"><label>${t('sky-move-to')} <select name="tier">${this.view.map((x, n) => html`<option value=${n} ?selected=${n === this.view.length - 1}>${x.name}</option>`)}</select></label><button type="submit" class="to-btn sky-primary">${t('sky-add-cards')}</button></div>
      </form>
      <form class="sky-actions" @submit=${(e: SubmitEvent) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement,
          name = String(new FormData(form).get('name') || '').trim();
        if (!name || this.view.some((x) => x.name === name)) {
          this.status = t('sky-unique-tier');
          return;
        }
        this.edit(writeTiers(this.doc, [...this.view, { name, items: [] }]));
        form.reset();
        this.status = '';
      }}>
        <label>${t('sky-new-tier')} <input name="name" required /></label><button type="submit" class="to-btn">${t('sky-add-tier')}</button>
      </form>
      <p class="sky-muted">${t('sky-link-state')}</p>
      <to-document-source .value=${this.value} @sourcechange=${(e: CustomEvent<string>) => this.edit(replaceDocument(this.doc, e.detail))}></to-document-source>
    </article>`;
  }
}
customElements.define(tag, TierEditor);
