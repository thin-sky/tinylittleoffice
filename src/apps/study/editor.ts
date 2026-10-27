import { html, nothing } from 'lit';
import { DocElement } from '../../kit/core/element.ts';
import { replaceDocument } from '../../kit/core/document-tools.ts';
import { t } from '../../kit/core/i18n.ts';
import type { Doc } from '../../doc/index.ts';
import { readStudy } from './model.ts';
import '../../kit/ui/document-source.ts';
export const tag = 'to-study-editor';
export class StudyEditor extends DocElement<ReturnType<typeof readStudy>> {
  static properties = { queue: { state: true }, revealed: { state: true }, reversed: { state: true }, browse: { state: true } };
  declare queue: number[];
  declare revealed: boolean;
  declare reversed: boolean;
  declare browse: boolean;
  constructor() {
    super();
    this.queue = [];
    this.revealed = false;
    this.reversed = false;
    this.browse = false;
  }
  private cardKey = '';
  protected read(doc: Doc) {
    const view = readStudy(doc);
    const cardKey = JSON.stringify(view.cards);
    if (cardKey !== this.cardKey) {
      this.cardKey = cardKey;
      this.queue = view.cards.map((_, i) => i);
      this.revealed = false;
    }
    return view;
  }
  focusFirst() {
    this.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
  }
  private restart(shuffle = false) {
    const queue = this.view.cards.map((_, i) => i);
    if (shuffle)
      for (let i = queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue[i], queue[j]] = [queue[j], queue[i]];
      }
    this.queue = queue;
    this.revealed = false;
  }
  private grade(again: boolean) {
    const [first, ...rest] = this.queue;
    this.queue = again ? [...rest, first] : rest;
    this.revealed = false;
    void this.updateComplete.then(() => this.querySelector<HTMLButtonElement>('.sky-reveal, .sky-restart')?.focus({ preventScroll: true }));
  }
  render() {
    if (!this.view) return nothing;
    const cards = this.view.cards,
      card = cards[this.queue[0]];
    const done = cards.length - this.queue.length;
    return html`<article class="sky-document">
      <p class="sky-eyebrow">${t('sky-study')}</p><h1>${this.doc.head.title || t('sky-study')}</h1>
      ${this.view.notes.map((line) => html`<p class="sky-note">${line}</p>`)}
      <div class="sky-actions">
        <button class="to-btn" type="button" aria-pressed=${this.browse} @click=${() => (this.browse = !this.browse)}>${t('sky-browse')}</button>
        <button class="to-btn" type="button" aria-pressed=${this.reversed} @click=${() => {
          this.reversed = !this.reversed;
          this.revealed = false;
        }}>${t('sky-reverse')}</button>
        <button class="to-btn" type="button" @click=${() => this.restart(true)}>${t('sky-shuffle')}</button>
      </div>
      <p class="sky-muted">${t('sky-session-progress', { done, total: cards.length })}</p>
      <progress class="sky-progress" aria-label=${t('sky-progress')} max=${Math.max(1, cards.length)} value=${done}></progress>
      ${
        this.browse
          ? html`<div class="sky-grid">${cards.map((c) => html`<section class="sky-card"><h2>${c.front}</h2><p>${c.back}</p>${c.hint ? html`<small>${c.hint}</small>` : nothing}</section>`)}</div>`
          : card
            ? html`<section class="sky-card sky-study-card" aria-label=${t('sky-flashcard')}>
              <p class="sky-eyebrow">${t('sky-question')}</p>
              <p class="sky-study-prompt" lang=${!this.reversed ? this.doc.head.language || nothing : nothing}>${this.reversed ? card.back : card.front}</p>
              ${card.hint && !this.reversed ? html`<p class="sky-muted">${card.hint}</p>` : nothing}
              ${
                this.revealed
                  ? html`<div class="sky-study-answer" aria-live="polite">${this.reversed ? card.front : card.back}</div><div class="sky-actions"><button type="button" class="to-btn" @click=${() => this.grade(true)}>${t('sky-again')}</button><button type="button" class="to-btn sky-primary" @click=${() => this.grade(false)}>${t('sky-got-it')}</button></div>`
                  : html`<div class="sky-actions"><button type="button" class="to-btn sky-primary sky-reveal" @click=${() => (this.revealed = true)}>${t('sky-reveal')}</button></div>`
              }
            </section>`
            : html`<section class="sky-card sky-study-card"><h2>${t(cards.length ? 'sky-session-done' : 'sky-no-cards')}</h2><button type="button" class="to-btn sky-restart" @click=${() => this.restart()}>${t('sky-restart')}</button></section>`
      }
      <p class="sky-muted">${t('sky-study-privacy')}</p>
      <to-document-source .value=${this.value} @sourcechange=${(e: CustomEvent<string>) => this.edit(replaceDocument(this.doc, e.detail))}></to-document-source>
    </article>`;
  }
}
customElements.define(tag, StudyEditor);
