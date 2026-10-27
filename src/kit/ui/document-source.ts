/** Optional source editing; the host applies it as undoable kernel operations. */
import { LitElement, html } from 'lit';
import { t } from '../core/i18n.ts';
class DocumentSource extends LitElement {
  static properties = { value: {}, draft: { state: true } };
  declare value: string;
  declare draft: string;
  constructor() {
    super();
    this.value = '';
    this.draft = '';
  }
  createRenderRoot() {
    return this;
  }
  render() {
    return html`<details class="sky-source" @toggle=${(e: Event) => {
      if ((e.target as HTMLDetailsElement).open) this.draft = this.value;
    }}>
      <summary>${t('sky-customize')}</summary><p>${t('sky-source-hint')}</p>
      <textarea aria-label=${t('sky-document-source')} spellcheck="false" .value=${this.draft} @input=${(e: Event) => (this.draft = (e.target as HTMLTextAreaElement).value)}></textarea>
      <button type="button" class="to-btn" @click=${() => this.dispatchEvent(new CustomEvent('sourcechange', { detail: this.draft, bubbles: true }))}>${t('sky-apply')}</button>
    </details>`;
  }
}
customElements.define('to-document-source', DocumentSource);
