import { html, nothing } from 'lit';
import { DocElement } from '../../kit/core/element.ts';
import { replaceDocument } from '../../kit/core/document-tools.ts';
import { t } from '../../kit/core/i18n.ts';
import type { Doc } from '../../doc/index.ts';
import { readWorksheet, setField } from './model.ts';
import '../../kit/ui/document-source.ts';
export const tag = 'to-worksheet-editor';
export class WorksheetEditor extends DocElement<ReturnType<typeof readWorksheet>> {
  protected read(doc: Doc) {
    return readWorksheet(doc);
  }
  focusFirst() {
    this.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true });
  }
  render() {
    const v = this.view;
    if (!v) return nothing;
    return html`<article class="sky-document">
      <p class="sky-eyebrow">${t('sky-worksheet')}</p><h1>${this.doc.head.title || t('sky-worksheet')}</h1>
      ${v.intro.map((line) => html`<p class="sky-note">${line}</p>`)}
      <div class="sky-grid">${v.fields.map(
        (field) => html`<label class="sky-card sky-field">
        <span>${field.label}</span>
        ${
          field.calculated
            ? html`<output aria-live="polite">${field.value}</output>`
            : field.unit === 'check'
              ? html`<input type="checkbox" .checked=${field.raw === '1'} @change=${(e: Event) => this.edit(setField(this.doc, field.index, (e.target as HTMLInputElement).checked ? '1' : '0'))} />`
              : html`<input type=${field.unit === 'text' ? 'text' : 'number'} step="any" .value=${field.raw} @input=${(e: Event) => this.edit(setField(this.doc, field.index, (e.target as HTMLInputElement).value), 'field:' + field.index)} />`
        }
        ${field.unit && !['number', 'text', 'check'].includes(field.unit) ? html`<small>${field.unit}</small>` : nothing}
        ${field.hint ? html`<small class="sky-muted">${field.hint}</small>` : nothing}
      </label>`,
      )}</div>
      ${v.checks.map(
        (check) =>
          html`<p><label><input type="checkbox" .checked=${check.done} @change=${(e: Event) => {
            const block = this.doc.blocks[check.index];
            if (block.k === 'li') this.edit([{ op: 'splice', at: check.index, n: 1, blocks: [{ ...block, done: (e.target as HTMLInputElement).checked }] }]);
          }} /> ${check.label}</label></p>`,
      )}
      <p class="sky-muted">${t('sky-link-state')}</p>
      <to-document-source .value=${this.value} @sourcechange=${(e: CustomEvent<string>) => this.edit(replaceDocument(this.doc, e.detail))}></to-document-source>
    </article>`;
  }
}
customElements.define(tag, WorksheetEditor);
