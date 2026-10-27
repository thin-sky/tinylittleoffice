import { html, nothing } from 'lit';
import { live } from 'lit/directives/live.js';
import { styleMap } from 'lit/directives/style-map.js';
import { DocElement } from '../../kit/core/element.ts';
import { replaceDocument } from '../../kit/core/document-tools.ts';
import { t } from '../../kit/core/i18n.ts';
import { dateWords } from '../../kit/core/dates.ts';
import { dayToYmd, type Doc } from '../../doc/index.ts';
import { readDates, DATE_COLORS, civilDay, dateString, shiftMonth, monthGrid, selectDates, writeDateGroups } from './model.ts';
import '../../kit/ui/document-source.ts';
export const tag = 'to-dates-editor';
let groupId = 0;
export class DatesEditor extends DocElement<ReturnType<typeof readDates>> {
  static properties = { selected: { state: true }, status: { state: true } };
  declare selected: number;
  declare status: string;
  private anchor: number | null = null;
  private groupName = 'sky-date-group-' + groupId++;
  constructor() {
    super();
    this.selected = 0;
    this.status = '';
  }
  protected read(doc: Doc) {
    return readDates(doc);
  }
  focusFirst() {
    this.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true });
  }
  private get active() {
    return Math.max(0, Math.min(this.selected, this.view.groups.length - 1));
  }
  private pick(day: number, event: MouseEvent) {
    const start = event.shiftKey && this.anchor !== null ? Math.min(day, this.anchor) : day,
      end = event.shiftKey && this.anchor !== null ? Math.max(day, this.anchor) : day;
    this.edit(selectDates(this.doc, this.active, start, end));
    this.anchor = day;
    this.status = '';
  }
  private keys(event: KeyboardEvent) {
    const button = (event.target as Element).closest<HTMLButtonElement>('button[data-day]');
    if (!button) return;
    const buttons = [...button.closest('table')!.querySelectorAll<HTMLButtonElement>('button[data-day]')],
      at = buttons.indexOf(button),
      cols = this.view.weekends ? 7 : 5;
    const by: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols };
    if (by[event.key] !== undefined) {
      event.preventDefault();
      buttons[Math.max(0, Math.min(buttons.length - 1, at + by[event.key]))]?.focus();
    }
  }
  render() {
    if (!this.view) return nothing;
    const v = this.view,
      active = v.groups[this.active];
    const columns = Array.from({ length: 7 }, (_, i) => (v.weekStart + i) % 7).filter((wd) => v.weekends || ![0, 6].includes(wd));
    return html`<article class="sky-document sky-dates-document">
   <p class="sky-eyebrow">${t('sky-dates')}</p><h1>${this.doc.head.title || t('sky-dates')}</h1><p>${t('sky-dates-help')}</p>
   <fieldset class="sky-date-groups"><legend>${t('sky-date-group')}</legend>${v.groups.map(
     (g, i) =>
       html`<label class="sky-group" style=${styleMap({ '--sky-color': DATE_COLORS[g.color].hex })}><input type="radio" name=${this.groupName} .checked=${i === this.active} @change=${() => {
         this.selected = i;
         this.anchor = null;
         this.status = '';
       }} /><span>${g.name}</span></label>`,
   )}</fieldset>
   ${
     active
       ? html`<div class="sky-actions"><label class="sky-field"><span>${t('sky-group-name')}</span><input .value=${live(active.name)} @change=${(e: Event) => {
           const groups = readDates(this.doc).groups,
             name = (e.target as HTMLInputElement).value.trim();
           if (!name || groups.some((g, i) => i !== this.active && g.name === name)) {
             this.status = t('sky-unique-group');
             this.requestUpdate();
             return;
           }
           groups[this.active].name = name;
           this.edit(writeDateGroups(this.doc, groups));
           this.status = '';
         }} /></label>
    <label class="sky-field"><span>${t('sky-group-color')}</span><select .value=${String(active.color)} @change=${(e: Event) => {
      const groups = readDates(this.doc).groups;
      groups[this.active].color = Number((e.target as HTMLSelectElement).value);
      this.edit(writeDateGroups(this.doc, groups));
    }}>${DATE_COLORS.map((c, i) => html`<option value=${i}>${c.name()}</option>`)}</select></label>
    <button class="to-btn" type="button" @click=${() => {
      this.edit(
        writeDateGroups(
          this.doc,
          v.groups.filter((_, i) => i !== this.active),
        ),
      );
      this.selected = 0;
      this.anchor = null;
    }}>${t('sky-delete-group')}</button></div>`
       : nothing
   }
   <form class="sky-actions" @submit=${(e: SubmitEvent) => {
     e.preventDefault();
     const form = e.currentTarget as HTMLFormElement,
       name = String(new FormData(form).get('group') || '').trim();
     if (!name || v.groups.some((g) => g.name === name)) {
       this.status = t('sky-unique-group');
       return;
     }
     this.edit(writeDateGroups(this.doc, [...v.groups, { name, color: v.groups.length % DATE_COLORS.length, ranges: [] }]));
     this.selected = v.groups.length;
     this.anchor = null;
     this.status = '';
     form.reset();
   }}>
    <label>${t('sky-new-group')} <input name="group" required /></label><button class="to-btn" type="submit">${t('sky-add-group')}</button>
   </form>
   <div class="sky-actions">
    <label class="sky-field"><span>${t('sky-first-month')}</span><input type="month" .value=${v.month} @change=${(e: Event) => {
      const value = (e.target as HTMLInputElement).value;
      if (civilDay(value + '-01') !== null) this.edit([{ op: 'head', key: 'month', value }]);
    }} /></label>
    <label class="sky-field"><span>${t('sky-week-start')}</span><select .value=${v.weekStart === 0 ? 'sunday' : 'monday'} @change=${(e: Event) => this.edit([{ op: 'head', key: 'week-start', value: (e.target as HTMLSelectElement).value }])}><option value="monday">${t('sky-monday')}</option><option value="sunday">${t('sky-sunday')}</option></select></label>
    <label><input type="checkbox" .checked=${v.weekends} @change=${(e: Event) => this.edit([{ op: 'head', key: 'weekends', value: (e.target as HTMLInputElement).checked ? 'true' : 'false' }])} /> ${t('sky-show-weekends')}</label>
   </div>
   <form class="sky-card sky-actions" @submit=${(e: SubmitEvent) => {
     e.preventDefault();
     const data = new FormData(e.currentTarget as HTMLFormElement),
       start = civilDay(String(data.get('start') || '')),
       end = civilDay(String(data.get('end') || ''));
     if (start === null || end === null || end < start) {
       this.status = t('sky-date-order');
       return;
     }
     this.edit(selectDates(this.doc, this.active, start, end, false));
     this.status = '';
   }}>
    <label class="sky-field"><span>${t('sky-range-start')}</span><input type="date" name="start" required /></label><label class="sky-field"><span>${t('sky-range-end')}</span><input type="date" name="end" required /></label><button class="to-btn" type="submit" ?disabled=${!active}>${t('sky-add-range')}</button>
   </form>
   <p role="status" class="sky-muted">${this.status}</p>
   <div class="sky-months">${Array.from({ length: 12 }, (_, i) => {
     const month = shiftMonth(v.month, i),
       [year, m] = month.split('-').map(Number),
       caption = dateWords({ month: 'long', year: 'numeric', timeZone: 'UTC' }).format(Date.UTC(year, m - 1, 1));
     return html`<table class="sky-month" @keydown=${(e: KeyboardEvent) => this.keys(e)}><caption>${caption}</caption><thead><tr>${columns.map((wd) => html`<th scope="col">${dateWords({ weekday: 'short', timeZone: 'UTC' }).format(Date.UTC(2027, 0, 3 + wd))}</th>`)}</tr></thead><tbody>${monthGrid(
       month,
       v.weekStart,
       v.weekends,
     ).map(
       (week) =>
         html`<tr>${week.map((day) => {
           if (day === null) return html`<td></td>`;
           const groups = v.groups.filter((g) => g.ranges.some((r) => r.start <= day && r.end >= day)),
             pressed = !!active?.ranges.some((r) => r.start <= day && r.end >= day);
           return html`<td><button class="sky-day" type="button" data-day=${day} ?disabled=${!active} aria-label=${t('sky-day-label', { date: dateString(day), names: groups.map((g) => g.name).join(', ') || t('sky-unmarked') })} aria-pressed=${pressed} @click=${(e: MouseEvent) => this.pick(day, e)}>${dayToYmd(day).d}<span class="sky-day-marks" aria-hidden="true">${groups.map((g) => html`<span style=${styleMap({ backgroundColor: DATE_COLORS[g.color].hex })}></span>`)}</span></button></td>`;
         })}</tr>`,
     )}</tbody></table>`;
   })}</div>
   <h2>${t('sky-selected-ranges')}</h2><div class="sky-grid">${v.groups.map(
     (g, i) =>
       html`<section class="sky-card"><h3>${g.name}</h3><ul class="sky-ranges">${g.ranges.map(
         (range, n) =>
           html`<li><span>${dateString(range.start)}${range.end !== range.start ? ' – ' + dateString(range.end) : ''}</span><button class="to-btn" type="button" aria-label=${t('sky-remove-range', { name: g.name, start: dateString(range.start), end: dateString(range.end) })} @click=${() => {
             const groups = readDates(this.doc).groups;
             groups[i].ranges.splice(n, 1);
             this.edit(writeDateGroups(this.doc, groups));
           }}>${t('common-delete')}</button></li>`,
       )}</ul></section>`,
   )}</div>
   <p class="sky-muted">${t('sky-dates-credit')}</p><p class="sky-muted">${t('sky-link-state')}</p>
   <to-document-source .value=${this.value} @sourcechange=${(e: CustomEvent<string>) => this.edit(replaceDocument(this.doc, e.detail))}></to-document-source>
  </article>`;
  }
}
customElements.define(tag, DatesEditor);
