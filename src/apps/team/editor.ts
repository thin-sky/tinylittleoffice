import { html, nothing } from 'lit';
import { DocElement } from '../../kit/core/element.ts';
import { t } from '../../kit/core/i18n.ts';
import { type Doc } from '../../doc/index.ts';
import { parseTeam, setTeamSource, teamSource } from './model.ts';
export const tag = 'to-team-editor';
export class TeamEditor extends DocElement<ReturnType<typeof parseTeam>> {
  static properties = { status: { state: true } };
  declare status: string;
  constructor() {
    super();
    this.status = '';
  }
  protected read(doc: Doc) {
    return parseTeam(teamSource(doc));
  }
  focusFirst() {
    this.querySelector<HTMLTextAreaElement>('textarea')?.focus({ preventScroll: true });
  }
  private async copy() {
    try {
      await navigator.clipboard.writeText(teamSource(this.doc) + '\n');
      this.status = t('sky-copied');
    } catch {
      this.status = t('sky-copy-failed');
    }
  }
  render() {
    if (!this.view) return nothing;
    return html`<article class="sky-document">
      <p class="sky-eyebrow">${t('sky-team')}</p><h1>${this.doc.head.title || t('sky-team')}</h1><p>${t('sky-team-intro')}</p>
      <div class="sky-grid">${this.view.map((p) => html`<section class="sky-card"><h2>${p.name}</h2>${p.item ? html`<p><b>${p.item}</b></p>` : nothing}${p.details.map((line) => html`<p class="sky-muted">${line}</p>`)}<ul class="sky-team-list">${p.moves.map((move) => html`<li>${move}</li>`)}</ul></section>`)}</div>
      ${this.view.length > 6 ? html`<p role="status">${t('sky-team-many')}</p>` : nothing}
      <label class="sky-field"><span>${t('sky-showdown-export')}</span><textarea class="sky-paste" spellcheck="false" .value=${teamSource(this.doc)} @input=${(e: Event) => this.edit(setTeamSource(this.doc, (e.target as HTMLTextAreaElement).value), 'team-source')}></textarea></label>
      <div class="sky-actions"><button type="button" class="to-btn" @click=${() => void this.copy()}>${t('sky-copy-team')}</button><span role="status">${this.status}</span></div>
      <p class="sky-muted">${t('sky-team-limit')}</p>
    </article>`;
  }
}
customElements.define(tag, TeamEditor);
