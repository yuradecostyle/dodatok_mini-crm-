/* Mini CRM 2.0 — особисті фінанси, планер, проєкти, ліди */
'use strict';

/* ================= Довідники ================= */
const SCOPES = {
  production: { label: 'Виробництво', icon: '🏭', color: 'var(--c-production)' },
  home: { label: 'Дім', icon: '🏠', color: 'var(--c-home)' },
  personal: { label: 'Особисте', icon: '👤', color: 'var(--c-personal)' }
};
const CATS = {
  production: ['Матеріали', 'Комплектуючі', 'Обладнання', 'Інструмент', 'Оренда цеху', 'Зарплата працівникам', 'Доставка', 'Електроенергія', 'Реклама', 'Податки', 'Оплата постачальнику', 'Інше'],
  home: ['Продукти', 'Комунальні', 'Ремонт', 'Побутова хімія', 'Техніка', 'Меблі', 'Діти', 'Тварини', 'Інше'],
  personal: ['Транспорт', 'Пальне', 'Кафе', 'Здоровʼя', 'Одяг', 'Звʼязок', 'Розваги', 'Навчання', 'Подарунки', 'Підписки', 'Інше'],
  income: ['Оплата від клієнта', 'Продажі', 'Зарплата', 'Інвестиції', 'Повернення боргу', 'Інше']
};
const CAT_ICON = {
  'Матеріали': '🧱', 'Комплектуючі': '🔩', 'Обладнання': '⚙️', 'Інструмент': '🛠️', 'Оренда цеху': '🏭', 'Зарплата працівникам': '👷',
  'Доставка': '🚚', 'Електроенергія': '⚡', 'Реклама': '📣', 'Податки': '🧾', 'Оплата постачальнику': '📦', 'Продукти': '🛒',
  'Комунальні': '💡', 'Ремонт': '🔨', 'Побутова хімія': '🧴', 'Техніка': '📺', 'Меблі': '🛋️', 'Діти': '🧸', 'Тварини': '🐾',
  'Транспорт': '🚕', 'Пальне': '⛽', 'Кафе': '☕', 'Здоровʼя': '💊', 'Одяг': '👕', 'Звʼязок': '📱', 'Розваги': '🎬', 'Навчання': '📚',
  'Подарунки': '🎁', 'Підписки': '🔁', 'Оплата від клієнта': '🤝', 'Продажі': '💼', 'Зарплата': '💳', 'Інвестиції': '📈',
  'Повернення боргу': '↩️', 'Повернення інвестицій': '📉', 'Інше': '•'
};
/* Типи рекламних каналів; самі канали (джерела) користувач додає сам */
const CHANNELS = {
  viber: { label: 'Viber', icon: '💜', color: '#7360f2' },
  telegram: { label: 'Telegram', icon: '✈️', color: '#229ed9' },
  instagram: { label: 'Instagram', icon: '📸', color: '#e1306c' },
  facebook: { label: 'Facebook', icon: '📘', color: '#1877f2' },
  tiktok: { label: 'TikTok', icon: '🎵', color: '#222222' },
  google: { label: 'Google / реклама', icon: '🔎', color: '#ea4335' },
  site: { label: 'Сайт', icon: '🌐', color: '#0ea5e9' },
  olx: { label: 'OLX / Prom', icon: '🛒', color: '#0f9d8a' },
  youtube: { label: 'YouTube', icon: '▶️', color: '#ff0000' },
  phone: { label: 'Дзвінок', icon: '☎️', color: '#10b981' },
  referral: { label: 'Рекомендація', icon: '🤝', color: '#f59e0b' },
  offline: { label: 'Офлайн / виставка', icon: '🏪', color: '#64748b' },
  other: { label: 'Інше', icon: '📣', color: '#6d5efc' }
};
const chOf = (src) => CHANNELS[src?.channel] || CHANNELS.other;
const LEAD_STATUS = {
  new: { label: 'Новий', short: 'Нові', cls: '' },
  work: { label: 'В роботі', short: 'В роботі', cls: 'amber' },
  offer: { label: 'Пропозиція', short: 'Пропоз.', cls: 'blue' },
  won: { label: 'Успішно', short: 'Успіх', cls: 'green' },
  lost: { label: 'Відмова', short: 'Відмова', cls: 'red' }
};
const UTIL = [
  { name: 'Електроенергія', icon: '⚡', unit: 'кВт·год' }, { name: 'Газ', icon: '🔥', unit: 'м³' },
  { name: 'Вода', icon: '💧', unit: 'м³' }, { name: 'Опалення', icon: '♨️', unit: 'Гкал' },
  { name: 'Вивіз сміття', icon: '🗑️' }, { name: 'Інтернет', icon: '🌐' }, { name: 'Квартплата / ОСББ', icon: '🏢' },
  { name: 'Домофон', icon: '🔔' }, { name: 'Інше', icon: '🧾' }
];
const REMIND = { '': 'Без нагадування', 0: 'У момент справи', 5: 'За 5 хвилин', 15: 'За 15 хвилин', 30: 'За 30 хвилин', 60: 'За 1 годину', 120: 'За 2 години', 1440: 'За 1 день' };
const PRIORITY = { low: 'Звичайний', mid: 'Важливий', high: 'Терміновий' };
const P_COLORS = ['#6d5efc', '#a855f7', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#0ea5e9', '#14b8a6', '#64748b'];
const P_EMOJI = ['📁', '🏗️', '🪵', '🛋️', '🏠', '💼', '🎯', '🚀', '🧰', '🎨', '📦', '⭐'];
const MONTHS = ['січень', 'лютий', 'березень', 'квітень', 'травень', 'червень', 'липень', 'серпень', 'вересень', 'жовтень', 'листопад', 'грудень'];
const MONTHS_G = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];
const MONTHS_S = ['січ', 'лют', 'бер', 'кві', 'тра', 'чер', 'лип', 'сер', 'вер', 'жов', 'лис', 'гру'];
const DOW = ['неділя', 'понеділок', 'вівторок', 'середа', 'четвер', "пʼятниця", 'субота'];
const SOUNDS = { chime: 'Дзвіночок', melody: 'Мелодія', alarm: 'Сигнал', drop: 'Крапля', soft: 'Мʼякий акорд', none: 'Без звуку' };

/* ================= Утиліти ================= */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s) => { const [y, m, d] = s.slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); };
const today = () => iso(new Date());
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
const monthKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
const shiftMonth = (key, n) => { const [y, m] = key.split('-').map(Number); return monthKey(new Date(y, m - 1 + n, 1)); };
const monthTitle = (key) => { const [y, m] = key.split('-').map(Number); const t = MONTHS[m - 1]; return t[0].toUpperCase() + t.slice(1) + ' ' + y; };
const fDate = (s) => { if (!s) return ''; const d = parse(s); return `${d.getDate()} ${MONTHS_G[d.getMonth()]}`; };
const fDateY = (s) => { if (!s) return ''; const d = parse(s); return `${d.getDate()} ${MONTHS_G[d.getMonth()]}${d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : ''}`; };
const nowLocal = () => { const d = new Date(); return `${iso(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const weekStart = (s) => { const d = parse(s); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return iso(d); };
const sum = (a) => a.reduce((x, y) => x + (Number(y) || 0), 0);
const money = (n, sign = false) => {
  const v = Math.round((Number(n) || 0) * 100) / 100;
  const s = Math.abs(v).toLocaleString('uk-UA', { maximumFractionDigits: 2 });
  return (v < 0 ? '−' : sign && v > 0 ? '+' : '') + s + ' ₴';
};
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const ls = {
  get: (k, d) => { try { const v = localStorage.getItem('mc.' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem('mc.' + k, JSON.stringify(v)); } catch { /* приватний режим */ } }
};
const checkSvg = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

function toast(msg) {
  $('.toast')?.remove();
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

/* ================= API ================= */
const CSRF = document.querySelector('meta[name=csrf-token]')?.content;
async function api(method, url, body) {
  const res = await fetch(url, {
    method,
    credentials: 'same-origin',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': CSRF, 'X-Requested-With': 'XMLHttpRequest' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  if (res.status === 401) { location.href = '/login'; throw new Error('auth'); }
  if (res.status === 419) { location.reload(); throw new Error('csrf'); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const first = data.errors ? Object.values(data.errors)[0][0] : data.message;
    toast(first || 'Помилка сервера');
    throw new Error(first || res.status);
  }
  return data;
}

let S = { sources: [], leads: [], projects: [], tasks: [], settlements: [], utilities: [], transactions: [] };
async function refresh() { S = await api('GET', '/api/state'); render(); }
async function create(res, data, { reload = false } = {}) {
  const it = await api('POST', `/api/${res}`, data);
  if (reload) await refresh(); else { S[res].unshift(it); render(); }
  return it;
}
async function update(res, item, data, { reload = false } = {}) {
  const it = await api('PUT', `/api/${res}/${item.id}`, data);
  Object.assign(item, it);
  if (reload) await refresh(); else render();
  return item;
}
async function remove(res, item, { reload = false } = {}) {
  await api('DELETE', `/api/${res}/${item.id}`);
  S[res] = S[res].filter((x) => x.id !== item.id);
  if (reload) await refresh(); else render();
}
const byId = (res, id) => S[res].find((x) => x.id === Number(id));
const srcOf = (lead) => (lead?.source_id ? byId('sources', lead.source_id) : null);
const srcBadge = (src) => (src ? `<span class="src" style="background:${chOf(src).color}">${chOf(src).icon} ${esc(src.name)}</span>` : '<span class="pill gray">без джерела</span>');

/* ================= Стан інтерфейсу ================= */
const ui = {
  tab: 'home', sub: ls.get('sub', 'ops'), month: monthKey(), finFilter: 'all',
  repMode: 'month', repMonth: monthKey(), repYear: new Date().getFullYear(),
  utilMonth: monthKey(), setDir: 'payable', showClosed: false,
  taskView: ls.get('taskView', 'day'), taskDate: today(),
  projFilter: 'active', projectId: null, showDone: false,
  leadStatus: 'all', leadQuery: ''
};
const TITLES = { home: 'Сьогодні', finance: 'Фінанси', planner: 'Планер', projects: 'Проєкти', leads: 'Ліди' };

function go(tab, opts = {}) {
  ui.tab = tab;
  if (tab !== 'projects') ui.projectId = null;
  Object.assign(ui, opts);
  $$('#tabbar button').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  render();
  window.scrollTo(0, 0);
}

function render() {
  const v = $('#view');
  const proj = ui.tab === 'projects' && ui.projectId ? byId('projects', ui.projectId) : null;
  if (ui.tab === 'projects' && ui.projectId && !proj) ui.projectId = null;
  $('#title').textContent = proj ? 'Проєкт' : TITLES[ui.tab];
  $('#backBtn').classList.toggle('hidden', !proj);
  ({ home: renderHome, finance: renderFinance, planner: renderPlanner, projects: proj ? () => renderProject(v, proj) : renderProjects, leads: renderLeads })[ui.tab](v);
  bind(v);
  badges();
}

function badges() {
  const t = today();
  const late = S.tasks.filter((x) => !x.done && x.date && x.date <= t).length;
  const leads = S.leads.filter((x) => x.status === 'new' || (x.next_date && x.next_date <= t && ['new', 'work', 'offer'].includes(x.status))).length;
  const set = (id, n) => { const el = $('#' + id); el.classList.toggle('hidden', !n); el.textContent = n; };
  set('dotPlanner', late); set('dotLeads', leads);
}

/* Універсальні обробники кліків через data-атрибути */
function bind(v) {
  $$('[data-go]', v).forEach((el) => el.addEventListener('click', () => { const [tab, sub] = el.dataset.go.split(':'); go(tab, sub ? { sub } : {}); }));
  $$('[data-check]', v).forEach((el) => el.addEventListener('click', (e) => { e.stopPropagation(); toggleTask(el.dataset.check); }));
  $$('[data-task]', v).forEach((el) => el.addEventListener('click', () => editTask(byId('tasks', el.dataset.task))));
  $$('[data-tx]', v).forEach((el) => el.addEventListener('click', () => editTx(byId('transactions', el.dataset.tx))));
  $$('[data-lead]', v).forEach((el) => el.addEventListener('click', () => showLead(byId('leads', el.dataset.lead))));
  $$('[data-project]', v).forEach((el) => el.addEventListener('click', () => openProject(el.dataset.project)));
  $$('[data-util]', v).forEach((el) => el.addEventListener('click', () => editUtility(byId('utilities', el.dataset.util))));
  $$('[data-set]', v).forEach((el) => el.addEventListener('click', () => showSettlement(byId('settlements', el.dataset.set))));
  $$('form[data-quick]', v).forEach((f) => f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = f.querySelector('input');
    const title = input.value.trim();
    if (!title) return;
    const extra = JSON.parse(f.dataset.quick || '{}');
    input.value = '';
    const p = parseTaskText(title, extra.date);
    const data = { priority: 'low', ...extra, title: p.title || title };
    if (p.date) data.date = p.date;
    if (p.time) data.time = p.time;
    if (p.remind_minutes !== null) { data.remind_minutes = p.remind_minutes; ensurePushAsked(); }
    await create('tasks', data);
    toast(p.date || p.time ? `Додано${p.date ? ' на ' + fDate(p.date) : ''}${p.time ? ' о ' + p.time : ''}${data.remind_minutes != null ? ' 🔔' : ''}` : 'Додано');
  }));
  $$('form[data-quick] [data-mic]', v).forEach((b) => b.addEventListener('click', () => {
    const f = b.closest('form');
    dictate(f.querySelector('input'), b, { onFinal: () => f.requestSubmit() });
  }));
}

function openProject(id) {
  ui.tab = 'projects'; ui.projectId = Number(id); ui.showDone = false;
  $$('#tabbar button').forEach((b) => b.classList.toggle('active', b.dataset.tab === 'projects'));
  history.pushState({ project: id }, '');
  render(); window.scrollTo(0, 0);
}

/* ================= Нижня панель і форми ================= */
/* Стек вікон: кожне нове вікно відкривається поверх попереднього, «←» повертає на крок назад */
const stack = [];
let restoring = false;
let reopened = false;
function openSheet(html, mount, opts = {}) {
  const entry = { html, mount, reopen: opts.reopen || null, save: opts.save || null };
  if (restoring) { stack[stack.length - 1] = entry; reopened = true; } else {
    stack[stack.length - 1]?.save?.();
    stack.push(entry);
    if (!history.state?.sheet) history.pushState({ sheet: true }, '');
  }
  drawSheet();
}
function drawSheet() {
  const top = stack[stack.length - 1];
  let bg = $('.sheet-bg');
  if (!bg) {
    bg = document.createElement('div');
    bg.className = 'sheet-bg';
    document.body.appendChild(bg);
    bg.addEventListener('click', (e) => { if (e.target === bg) closeAll(); });
  }
  document.body.style.overflow = 'hidden';
  const m = top.html.match(/^\s*<h2>([\s\S]*?)<\/h2>/);
  const title = m ? m[1] : '';
  const body = m ? top.html.slice(m[0].length) : top.html;
  const deep = stack.length > 1;
  bg.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>
    <div class="sheet-head"><button class="icon-btn sm" data-sback aria-label="Назад">←</button><h2>${title}</h2>${deep ? '<button class="icon-btn sm" data-sclose aria-label="Закрити все">✕</button>' : ''}</div>${body}</div>`;
  bg.querySelector('[data-sback]').addEventListener('click', back);
  bg.querySelector('[data-sclose]')?.addEventListener('click', closeAll);
  top.mount?.($('.sheet', bg));
}
function hideSheet() { $('.sheet-bg')?.remove(); document.body.style.overflow = ''; }
/* Перебудувати вікно з актуальними даними (opener може бути асинхронним) */
async function runReopen(top) {
  restoring = true; reopened = false;
  try { await top.reopen(); } finally { restoring = false; }
  return reopened;
}
/** Крок назад: закрити верхнє вікно й показати попереднє (з оновленими даними). */
async function back() {
  if (!stack.length) return false;
  stack.pop();
  if (!stack.length) { hideSheet(); return true; }
  const top = stack[stack.length - 1];
  if (top.reopen) {
    if (!(await runReopen(top))) return back(); // запис зник (наприклад, видалено) — ще крок назад
  } else drawSheet();
  return true;
}
/** Перемалювати поточне вікно з актуальними даними. */
async function refreshTop() {
  const top = stack[stack.length - 1];
  if (top?.reopen && !(await runReopen(top))) back();
}
function closeAll() { stack.length = 0; hideSheet(); }
const closeSheet = back;

/**
 * Форма. fields: [{name,label,type,options,required,half,placeholder,list,show:(values)=>bool}]
 * type: text|number|date|time|month|select|textarea|toggle|color|emoji
 */
function openForm(opts) {
  const { title, fields, values = {}, onSave, onDelete, extra = '', mount, submit = 'Зберегти', rebuild } = opts;
  let saved = null;
  const opt = (o) => (Array.isArray(o) ? o.map((x) => [x, x]) : Object.entries(o));
  const field = (f) => {
    const v = values[f.name] ?? f.default ?? '';
    let input;
    if (f.type === 'select') {
      input = `<select name="${f.name}">${opt(typeof f.options === 'function' ? f.options(values) : f.options).map(([k, l]) => `<option value="${esc(k)}" ${String(k) === String(v ?? '') ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
    } else if (f.type === 'textarea') {
      input = `<textarea name="${f.name}" placeholder="${esc(f.placeholder || '')}">${esc(v)}</textarea>`;
    } else if (f.type === 'toggle' || f.type === 'color' || f.type === 'emoji') {
      const items = f.type === 'color' ? P_COLORS.map((c) => [c, '']) : f.type === 'emoji' ? P_EMOJI.map((c) => [c, c]) : opt(f.options);
      const cls = f.type === 'color' ? 'colors' : 'tog';
      input = `<div class="${cls}" data-tog="${f.name}">${items.map(([k, l]) => `<button type="button" data-v="${esc(k)}" class="${String(k) === String(v) ? 'active' : ''}" ${f.type === 'color' ? `style="background:${k}"` : ''}>${esc(l)}</button>`).join('')}</div><input type="hidden" name="${f.name}" value="${esc(v)}">`;
    } else {
      const num = f.type === 'number' ? 'inputmode="decimal" step="any"' : '';
      input = `<input type="${f.type || 'text'}" name="${f.name}" value="${esc(v)}" ${num} placeholder="${esc(f.placeholder || '')}" ${f.list ? `list="dl-${f.name}"` : ''} autocomplete="off">` +
        (f.list ? `<datalist id="dl-${f.name}">${f.list.map((x) => `<option value="${esc(x)}">`).join('')}</datalist>` : '');
    }
    if (f.mic) input = `<div class="with-mic">${input}<button type="button" class="mic" data-mic-for="${f.name}" aria-label="Надиктувати">🎤</button></div>`;
    return `<div class="f" data-field="${f.name}"><label>${esc(f.label)}</label>${input}${f.after || ''}</div>`;
  };
  let body = '';
  for (let i = 0; i < fields.length; i++) {
    const f = fields[i];
    if (f.half && fields[i + 1]?.half) { body += `<div class="frow">${field(f)}${field(fields[i + 1])}</div>`; i++; } else body += field(f);
  }
  openSheet(`<h2>${esc(title)}</h2><form id="sf" novalidate>${body}${extra}
    <button class="btn" type="submit">${esc(submit)}</button>
    ${onDelete ? '<button class="btn danger" type="button" id="sfDel">Видалити</button>' : ''}</form>`, (root) => {
    const form = $('#sf', root);
    const read = () => Object.fromEntries(new FormData(form).entries());
    const vis = () => fields.forEach((f) => { if (f.show) { const el = root.querySelector(`[data-field="${f.name}"]`); el && el.classList.toggle('hidden', !f.show(read())); } });
    $$('[data-tog]', root).forEach((g) => g.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      $$('button', g).forEach((x) => x.classList.toggle('active', x === b));
      const h = root.querySelector(`input[name="${g.dataset.tog}"]`);
      h.value = b.dataset.v; h.dispatchEvent(new Event('change', { bubbles: true }));
    }));
    form.addEventListener('change', vis); vis();
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = read();
      for (const f of fields) {
        const hidden = f.show && !f.show(data);
        if (hidden) { delete data[f.name]; continue; }
        if (typeof data[f.name] === 'string') data[f.name] = data[f.name].trim();
        if (f.required && !data[f.name]) { toast(`Заповніть «${f.label}»`); return; }
        if (f.type === 'number') data[f.name] = data[f.name] === '' ? null : parseFloat(String(data[f.name]).replace(',', '.'));
        if (data[f.name] === '' && f.nullable !== false) data[f.name] = null;
      }
      const btn = form.querySelector('button[type=submit]');
      btn.disabled = true;
      try { if (await onSave(data) !== false) back(); } catch (err) { /* toast вже показано */ } finally { btn.disabled = false; }
    });
    if (onDelete) $('#sfDel', root).addEventListener('click', async () => { if (confirm('Видалити?')) { try { await onDelete(); } catch { return; } back(); toast('Видалено'); } });
    saved = read;
    $$('[data-mic-for]', root).forEach((b) => b.addEventListener('click', () => {
      const el = root.querySelector(`[name="${b.dataset.micFor}"]`);
      dictate(el, b, { append: el.tagName === 'TEXTAREA', onFinal: (text) => opts.onVoice?.(text, root, b.dataset.micFor) });
    }));
    mount?.(root, read);
  }, {
    save: () => { if (saved) { const cur = saved(); saved = () => cur; } },
    reopen: () => { const cur = saved ? saved() : {}; rebuild ? rebuild(cur) : openForm({ ...opts, values: { ...values, ...cur } }); }
  });
}

/* ================= Обчислення ================= */
const inPeriod = (tx, key) => tx.date.startsWith(key);
/* Інвестиції — це не дохід і не витрата: рахуються окремо */
const operating = (tx) => tx.kind !== 'investment';
function settlementPaid(s) { return sum(S.transactions.filter((t) => t.settlement_id === s.id).map((t) => t.amount)); }
function outstanding(dir) {
  return sum(S.settlements.filter((s) => s.direction === dir && !s.closed).map((s) => Math.max(0, s.amount - settlementPaid(s))));
}
const counterparties = (dir) => [...new Set([
  ...S.settlements.filter((s) => !dir || s.direction === dir).map((s) => s.counterparty),
  ...S.transactions.filter((t) => t.counterparty && (!dir || (dir === 'payable' ? t.type === 'expense' : t.type === 'income'))).map((t) => t.counterparty)
])].filter(Boolean).sort();
const investors = () => [...new Set(S.transactions.filter((t) => t.kind === 'investment' && t.counterparty).map((t) => t.counterparty))].sort();
const projOptions = () => ({ '': '— без проєкту —', ...Object.fromEntries(S.projects.filter((p) => p.status !== 'done' || true).map((p) => [p.id, `${p.emoji || '📁'} ${p.name}`])) });
const taskSort = (a, b) => (a.done - b.done) || ((a.time || '99').localeCompare(b.time || '99')) || ({ high: 0, mid: 1, low: 2 }[a.priority] - { high: 0, mid: 1, low: 2 }[b.priority]) || (a.position - b.position) || (a.id - b.id);

/* ================= СЬОГОДНІ ================= */
function renderHome(v) {
  const t = today(); const mk = monthKey(); const d = new Date();
  const mtx = S.transactions.filter((x) => inPeriod(x, mk) && operating(x));
  const inc = sum(mtx.filter((x) => x.type === 'income').map((x) => x.amount));
  const exp = sum(mtx.filter((x) => x.type === 'expense').map((x) => x.amount));
  const byScope = (s) => sum(mtx.filter((x) => x.type === 'expense' && x.scope === s).map((x) => x.amount));
  const todays = S.tasks.filter((x) => x.date === t).sort(taskSort);
  const overdue = S.tasks.filter((x) => !x.done && x.date && x.date < t);
  const done = todays.filter((x) => x.done).length;
  const h = d.getHours();
  const hello = h < 5 ? 'Доброї ночі' : h < 12 ? 'Доброго ранку' : h < 18 ? 'Доброго дня' : 'Доброго вечора';
  const contact = S.leads.filter((x) => x.next_date && x.next_date <= t && ['new', 'work', 'offer'].includes(x.status));
  const unpaid = S.utilities.filter((u) => !u.paid && u.amount > 0);
  const upcoming = S.tasks.filter((x) => !x.done && x.remind_at && x.remind_at >= nowLocal()).sort((a, b) => a.remind_at.localeCompare(b.remind_at)).slice(0, 4);
  const active = S.projects.filter((p) => p.status === 'active').slice(0, 3);

  v.innerHTML = `
    <p class="muted" style="margin:0 2px 12px;font-weight:600">${hello}! ${DOW[d.getDay()][0].toUpperCase() + DOW[d.getDay()].slice(1)}, ${d.getDate()} ${MONTHS_G[d.getMonth()]}</p>
    <div class="hero" data-go="finance:report" style="cursor:pointer">
      <div class="lbl">Результат за ${MONTHS[d.getMonth()]}</div>
      <div class="big">${money(inc - exp, true)}</div>
      <div class="cols"><div>Доходи<b>${money(inc)}</b></div><div>Витрати<b>${money(exp)}</b></div></div>
    </div>
    <div class="grid2">
      <div class="kpi click" data-go="finance:report"><div class="lbl">🏭 Виробництво</div><div class="val">${money(byScope('production'))}</div><div class="sub">витрати за місяць</div></div>
      <div class="kpi click" data-go="finance:report"><div class="lbl">🏠 Дім</div><div class="val">${money(byScope('home'))}</div><div class="sub">витрати за місяць</div></div>
      <div class="kpi click" data-go="finance:settlements"><div class="lbl">📦 Борг постачальникам</div><div class="val">${money(outstanding('payable'))}</div></div>
      <div class="kpi click" data-go="finance:settlements"><div class="lbl">🤝 Очікую від клієнтів</div><div class="val">${money(outstanding('receivable'))}</div></div>
    </div>

    <div class="sec"><h2>Справи на сьогодні</h2><button class="link" data-go="planner">Планер →</button></div>
    <div class="card row" style="padding:14px">
      <div class="ring" style="--p:${pct(done, todays.length)}"><span>${pct(done, todays.length)}%</span></div>
      <div class="grow"><b>Виконано ${done} з ${todays.length}</b><div class="small muted">${overdue.length ? `<span style="color:var(--red);font-weight:700">Прострочено: ${overdue.length}</span>` : 'Без прострочених справ'}</div></div>
    </div>
    <div class="list">
      <form class="quick" data-quick='${JSON.stringify({ date: t })}'><input placeholder="Швидко додати справу на сьогодні…" enterkeyhint="done"><button type="button" class="mic" data-mic aria-label="Надиктувати">🎤</button><button>＋</button></form>
      ${todays.length ? todays.map(taskHtml).join('') : '<div class="empty" style="padding:22px">На сьогодні нічого. Додайте справу вище ✨</div>'}
    </div>

    ${upcoming.length ? `<div class="sec"><h2>🔔 Найближчі нагадування</h2></div>
      <div class="list">${upcoming.map((x) => `<div class="item click" data-task="${x.id}"><div class="ico">⏰</div><div class="grow"><div class="t">${esc(x.title)}</div><div class="s">${fDate(x.remind_at)} о ${x.remind_at.slice(11, 16)}</div></div></div>`).join('')}</div>` : ''}

    ${contact.length ? `<div class="sec"><h2>🎯 Звʼязатися сьогодні</h2><button class="link" data-go="leads">Ліди →</button></div>
      <div class="list">${contact.map(leadHtml).join('')}</div>` : ''}

    ${unpaid.length ? `<div class="sec"><h2>💡 Неоплачена комуналка</h2><button class="link" data-go="finance:utilities">Усі →</button></div>
      <div class="list">${unpaid.slice(0, 4).map(utilHtml).join('')}</div>` : ''}

    ${active.length ? `<div class="sec"><h2>📁 Проєкти в роботі</h2><button class="link" data-go="projects">Усі →</button></div>${active.map(projectCard).join('')}` : ''}
  `;
}

/* ================= ФІНАНСИ ================= */
const FIN_SUBS = [['ops', 'Операції'], ['report', 'Звіт'], ['utilities', 'Комуналка'], ['settlements', 'Розрахунки'], ['invest', 'Інвестиції']];
function renderFinance(v) {
  if (!FIN_SUBS.some(([k]) => k === ui.sub)) ui.sub = 'ops';
  ls.set('sub', ui.sub);
  const seg = `<div class="seg">${FIN_SUBS.map(([k, l]) => `<button data-sub="${k}" class="${ui.sub === k ? 'active' : ''}">${l}</button>`).join('')}</div>`;
  const body = { ops: finOps, report: finReport, utilities: finUtilities, settlements: finSettlements, invest: finInvest }[ui.sub]();
  v.innerHTML = seg + body;
  $$('[data-sub]', v).forEach((b) => b.addEventListener('click', () => { ui.sub = b.dataset.sub; render(); }));
  $$('[data-nav]', v).forEach((b) => b.addEventListener('click', () => {
    const n = Number(b.dataset.nav);
    if (ui.sub === 'ops') ui.month = shiftMonth(ui.month, n);
    if (ui.sub === 'utilities') ui.utilMonth = shiftMonth(ui.utilMonth, n);
    if (ui.sub === 'report') { if (ui.repMode === 'month') ui.repMonth = shiftMonth(ui.repMonth, n); else ui.repYear += n; }
    render();
  }));
  $$('[data-ff]', v).forEach((b) => b.addEventListener('click', () => { ui.finFilter = b.dataset.ff; render(); }));
  $$('[data-rm]', v).forEach((b) => b.addEventListener('click', () => { ui.repMode = b.dataset.rm; render(); }));
  $$('[data-dir]', v).forEach((b) => b.addEventListener('click', () => { ui.setDir = b.dataset.dir; render(); }));
  $('#showClosed', v)?.addEventListener('click', () => { ui.showClosed = !ui.showClosed; render(); });
  $('#copyUtil', v)?.addEventListener('click', copyUtilities);
  $$('[data-upaid]', v).forEach((el) => el.addEventListener('click', async (e) => {
    e.stopPropagation(); const u = byId('utilities', el.dataset.upaid);
    await update('utilities', u, { paid: !u.paid }, { reload: true });
    toast(u.paid ? 'Оплачено — додано у витрати «Дім»' : 'Позначено як неоплачене');
  }));
}

function navBar(title, sub = '') {
  return `<div class="nav"><button class="arr" data-nav="-1">‹</button><div class="p">${title}${sub ? `<small>${sub}</small>` : ''}</div><button class="arr" data-nav="1">›</button></div>`;
}

function txHtml(x) {
  const inc = x.type === 'income';
  const sc = SCOPES[x.scope];
  const proj = x.project_id ? byId('projects', x.project_id) : null;
  const icon = CAT_ICON[x.category] || (inc ? '⬇️' : '⬆️');
  const sub = [x.counterparty, proj ? `${proj.emoji || '📁'} ${proj.name}` : '', x.note].filter(Boolean).join(' · ') || (inc ? 'Дохід' : sc ? sc.label : 'Витрата');
  return `<div class="item click" data-tx="${x.id}">
    <div class="ico" style="${sc ? `background:color-mix(in srgb, ${sc.color} 15%, transparent)` : inc ? 'background:var(--green-soft)' : ''}">${icon}</div>
    <div class="grow"><div class="t">${esc(x.category)}</div><div class="s">${esc(sub)}</div></div>
    <div class="end"><div class="amt ${inc ? 'plus' : 'minus'}">${inc ? '+' : '−'}${money(x.amount)}</div>${sc ? `<div class="s">${sc.icon} ${sc.label}</div>` : ''}</div>
  </div>`;
}

function finOps() {
  let list = S.transactions.filter((x) => inPeriod(x, ui.month));
  const inc = sum(list.filter((x) => x.type === 'income' && operating(x)).map((x) => x.amount));
  const exp = sum(list.filter((x) => x.type === 'expense' && operating(x)).map((x) => x.amount));
  if (ui.finFilter === 'income') list = list.filter((x) => x.type === 'income');
  else if (ui.finFilter !== 'all') list = list.filter((x) => x.type === 'expense' && x.scope === ui.finFilter);
  const groups = {};
  list.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id).forEach((x) => (groups[x.date] ||= []).push(x));
  const chips = [['all', 'Усі'], ['production', '🏭 Виробництво'], ['home', '🏠 Дім'], ['personal', '👤 Особисте'], ['income', '⬇️ Доходи']];
  return `${navBar(monthTitle(ui.month))}
    <div class="grid2" style="margin-bottom:12px">
      <div class="kpi"><div class="lbl">Доходи</div><div class="val plus">+${money(inc)}</div></div>
      <div class="kpi"><div class="lbl">Витрати</div><div class="val">−${money(exp)}</div></div>
    </div>
    <div class="chips">${chips.map(([k, l]) => `<button class="chip ${ui.finFilter === k ? 'active' : ''}" data-ff="${k}">${l}</button>`).join('')}</div>
    ${Object.keys(groups).length ? Object.entries(groups).map(([d, xs]) => `
      <div class="sec" style="margin-top:12px"><h2 style="font-size:14px">${fDate(d)}</h2><span class="small muted">${money(sum(xs.map((x) => (x.type === 'income' ? x.amount : -x.amount))), true)}</span></div>
      <div class="list">${xs.map(txHtml).join('')}</div>`).join('')
    : '<div class="empty"><div class="e">💸</div>Операцій за цей місяць немає.<br>Натисніть «＋», щоб додати витрату чи дохід.</div>'}`;
}

function finReport() {
  const isMonth = ui.repMode === 'month';
  const key = isMonth ? ui.repMonth : String(ui.repYear);
  const all = S.transactions.filter((x) => x.date.startsWith(key));
  const tx = all.filter(operating);
  const inv = all.filter((x) => !operating(x));
  const invNet = sum(inv.map((x) => (x.type === 'income' ? x.amount : -x.amount)));
  const inc = tx.filter((x) => x.type === 'income');
  const exp = tx.filter((x) => x.type === 'expense');
  const I = sum(inc.map((x) => x.amount)); const E = sum(exp.map((x) => x.amount));
  const scopeRows = Object.entries(SCOPES).map(([k, s]) => {
    const xs = exp.filter((x) => x.scope === k);
    const total = sum(xs.map((x) => x.amount));
    const cats = {}; xs.forEach((x) => { cats[x.category] = (cats[x.category] || 0) + x.amount; });
    const top = Object.entries(cats).sort((a, b) => b[1] - a[1]);
    return { k, s, total, top };
  });
  const other = sum(exp.filter((x) => !x.scope).map((x) => x.amount));
  const maxScope = Math.max(...scopeRows.map((r) => r.total), 1);
  const incGroups = [
    ['🤝 Від клієнтів', sum(inc.filter((x) => x.kind === 'client' || x.category === 'Оплата від клієнта').map((x) => x.amount))]
  ];
  incGroups.push(['💼 Інші доходи', I - incGroups[0][1]]);
  const util = S.utilities.filter((u) => u.period.startsWith(key));
  const utilByService = {}; util.forEach((u) => { utilByService[u.service] = (utilByService[u.service] || 0) + u.amount; });
  const byProject = {};
  exp.filter((x) => x.project_id).forEach((x) => { byProject[x.project_id] = (byProject[x.project_id] || 0) + x.amount; });

  let chart = '';
  if (!isMonth) {
    const months = Array.from({ length: 12 }, (_, i) => {
      const k = `${ui.repYear}-${pad(i + 1)}`;
      const xs = S.transactions.filter((x) => x.date.startsWith(k) && operating(x));
      return { i, inc: sum(xs.filter((x) => x.type === 'income').map((x) => x.amount)), exp: sum(xs.filter((x) => x.type === 'expense').map((x) => x.amount)) };
    });
    const mx = Math.max(...months.map((m) => Math.max(m.inc, m.exp)), 1);
    chart = `<div class="card"><h3>📊 По місяцях</h3><div class="chart">${months.map((m) => `<div class="m"><div class="bars"><i class="in" style="height:${(m.inc / mx) * 100}%"></i><i class="out" style="height:${(m.exp / mx) * 100}%"></i></div><small>${MONTHS_S[m.i]}</small></div>`).join('')}</div>
      <div class="legend"><span><i style="background:var(--green)"></i>Доходи</span><span><i style="background:var(--accent)"></i>Витрати</span></div></div>`;
  }

  return `<div class="seg" style="max-width:260px"><button data-rm="month" class="${isMonth ? 'active' : ''}">Місяць</button><button data-rm="year" class="${!isMonth ? 'active' : ''}">Рік</button></div>
    ${navBar(isMonth ? monthTitle(ui.repMonth) : `${ui.repYear} рік`, 'зведений звіт')}
    <div class="grid3" style="margin-bottom:12px">
      <div class="kpi"><div class="lbl">Доходи</div><div class="val plus" style="font-size:16px">${money(I)}</div></div>
      <div class="kpi"><div class="lbl">Витрати</div><div class="val" style="font-size:16px">${money(E)}</div></div>
      <div class="kpi"><div class="lbl">Результат</div><div class="val ${I - E < 0 ? 'neg' : 'plus'}" style="font-size:16px">${money(I - E)}</div></div>
    </div>
    ${chart}
    <div class="card"><h3>💸 Витрати за напрямами <span class="right">${money(E)}</span></h3>
      ${scopeRows.map((r) => `<div class="bar-row">
        <div class="top"><span class="row" style="gap:8px"><i class="scope-dot" style="background:${r.s.color}"></i>${r.s.icon} ${r.s.label}</span><b>${money(r.total)} <span class="muted small">· ${pct(r.total, E)}%</span></b></div>
        <div class="bar"><i style="width:${(r.total / maxScope) * 100}%;background:${r.s.color}"></i></div>
        ${r.top.length ? `<div class="small muted" style="margin-top:6px">${r.top.slice(0, 5).map(([c, a]) => `${CAT_ICON[c] || ''} ${esc(c)} <b style="color:var(--ink-2)">${money(a)}</b>`).join(' · ')}</div>` : ''}
      </div>`).join('')}
      ${other ? `<div class="small muted">Інші витрати без напряму: <b>${money(other)}</b></div>` : ''}
    </div>
    ${Object.keys(byProject).length ? `<div class="card"><h3>🏭 Виробництво по проєктах</h3>${Object.entries(byProject).sort((a, b) => b[1] - a[1]).map(([id, a]) => { const p = byId('projects', id); return `<div class="bar-row" data-project="${id}" style="cursor:pointer"><div class="top"><span>${p ? `${p.emoji || '📁'} ${esc(p.name)}` : 'Проєкт'}</span><b>${money(a)}</b></div></div>`; }).join('')}</div>` : ''}
    <div class="card"><h3>💰 Доходи <span class="right">${money(I)}</span></h3>
      ${incGroups.map(([l, a]) => `<div class="bar-row"><div class="top"><span>${l}</span><b>${money(a)}</b></div><div class="bar green"><i style="width:${pct(a, I)}%"></i></div></div>`).join('')}
    </div>
    ${inv.length ? `<div class="card" data-go="finance:invest" style="cursor:pointer"><h3>📈 Інвестиції за період <span class="right">не входять у результат</span></h3>
      <div class="row" style="justify-content:space-between;padding:3px 0"><span>Отримано</span><b class="plus">${money(sum(inv.filter((x) => x.type === 'income').map((x) => x.amount)))}</b></div>
      <div class="row" style="justify-content:space-between;padding:3px 0"><span>Повернуто</span><b>${money(sum(inv.filter((x) => x.type === 'expense').map((x) => x.amount)))}</b></div>
      <div class="row" style="justify-content:space-between;padding:3px 0"><span>Чисто залучено</span><b>${money(invNet)}</b></div></div>` : ''}
    <div class="card"><h3>💡 Комунальні послуги <span class="right">${money(sum(util.map((u) => u.amount)))}</span></h3>
      ${Object.keys(utilByService).length ? Object.entries(utilByService).sort((a, b) => b[1] - a[1]).map(([s, a]) => `<div class="row" style="justify-content:space-between;padding:5px 0"><span>${(UTIL.find((x) => x.name === s) || {}).icon || '🧾'} ${esc(s)}</span><b>${money(a)}</b></div>`).join('') : '<div class="muted small">Немає записів за період</div>'}
    </div>
    <div class="card"><h3>📒 Розрахунки на сьогодні</h3>
      <div class="row" style="justify-content:space-between;padding:4px 0"><span>📦 Винен постачальникам</span><b class="neg">${money(outstanding('payable'))}</b></div>
      <div class="row" style="justify-content:space-between;padding:4px 0"><span>🤝 Мають сплатити клієнти</span><b class="plus">${money(outstanding('receivable'))}</b></div>
    </div>`;
}

function utilHtml(u) {
  const svc = UTIL.find((x) => x.name === u.service) || UTIL[UTIL.length - 1];
  const use = u.meter_curr != null && u.meter_prev != null ? `${+(u.meter_curr - u.meter_prev).toFixed(3)} ${svc.unit || ''}` : '';
  const late = !u.paid && u.due_date && u.due_date < today();
  return `<div class="item click" data-util="${u.id}">
    <div class="ico">${svc.icon}</div>
    <div class="grow"><div class="t">${esc(u.service)}</div>
      <div class="s">${[monthTitle(u.period), use, u.due_date && !u.paid ? `до ${fDate(u.due_date)}` : ''].filter(Boolean).join(' · ')}</div></div>
    <div class="end"><div class="amt">${money(u.amount)}</div>
      <button class="pill ${u.paid ? 'green' : late ? 'red' : 'amber'}" data-upaid="${u.id}" style="border:0;margin-top:4px">${u.paid ? '✓ оплачено' : 'не оплачено'}</button></div>
  </div>`;
}

function finUtilities() {
  const list = S.utilities.filter((u) => u.period === ui.utilMonth).sort((a, b) => a.service.localeCompare(b.service));
  const total = sum(list.map((u) => u.amount)); const paid = sum(list.filter((u) => u.paid).map((u) => u.amount));
  const year = ui.utilMonth.slice(0, 4);
  const yearList = S.utilities.filter((u) => u.period.startsWith(year));
  const bySvc = {}; yearList.forEach((u) => { bySvc[u.service] = (bySvc[u.service] || 0) + u.amount; });
  const prev = S.utilities.filter((u) => u.period === shiftMonth(ui.utilMonth, -1));
  return `${navBar(monthTitle(ui.utilMonth), 'комунальні послуги')}
    <div class="grid2" style="margin-bottom:12px">
      <div class="kpi"><div class="lbl">Нараховано</div><div class="val">${money(total)}</div></div>
      <div class="kpi"><div class="lbl">Залишилось сплатити</div><div class="val ${total - paid > 0 ? 'neg' : 'plus'}">${money(total - paid)}</div></div>
    </div>
    <div class="list">${list.length ? list.map(utilHtml).join('') : `<div class="empty"><div class="e">💡</div>Записів за цей місяць немає.${prev.length ? '<br><button class="btn sm sec" id="copyUtil" style="margin-top:12px">Скопіювати послуги з минулого місяця</button>' : '<br>Натисніть «＋», щоб додати послугу.'}</div>`}</div>
    <p class="hint">Позначка «оплачено» автоматично додає витрату в напрям «🏠 Дім → Комунальні».</p>
    ${Object.keys(bySvc).length ? `<div class="card"><h3>📅 За ${year} рік <span class="right">${money(sum(Object.values(bySvc)))}</span></h3>${Object.entries(bySvc).sort((a, b) => b[1] - a[1]).map(([s, a]) => `<div class="row" style="justify-content:space-between;padding:5px 0"><span>${(UTIL.find((x) => x.name === s) || {}).icon || '🧾'} ${esc(s)}</span><b>${money(a)}</b></div>`).join('')}</div>` : ''}`;
}

async function copyUtilities() {
  const prev = S.utilities.filter((u) => u.period === shiftMonth(ui.utilMonth, -1));
  for (const u of prev) {
    await api('POST', '/api/utilities', { service: u.service, period: ui.utilMonth, meter_prev: u.meter_curr, tariff: u.tariff, amount: u.meter_curr != null ? 0 : u.amount, paid: false });
  }
  await refresh();
  toast(`Скопійовано послуг: ${prev.length}. Внесіть нові показники.`);
}

function settlementCard(s) {
  const paid = settlementPaid(s); const left = Math.max(0, s.amount - paid);
  const late = !s.closed && left > 0 && s.due_date && s.due_date < today();
  return `<div class="item click" data-set="${s.id}" style="align-items:flex-start">
    <div class="ico">${s.direction === 'payable' ? '📦' : '🤝'}</div>
    <div class="grow"><div class="t">${esc(s.counterparty)}</div><div class="s">${esc(s.title)}</div>
      <div class="bar green" style="margin-top:8px"><i style="width:${pct(paid, s.amount)}%"></i></div>
      <div class="tags">${s.closed || left <= 0 ? '<span class="pill green">✓ розраховано</span>' : `<span class="pill ${late ? 'red' : 'amber'}">залишок ${money(left)}</span>`}${s.due_date && left > 0 && !s.closed ? `<span class="pill ${late ? 'red' : 'gray'}">до ${fDate(s.due_date)}</span>` : ''}</div>
    </div>
    <div class="end"><div class="amt">${money(s.amount)}</div><div class="s">сплачено ${money(paid)}</div></div>
  </div>`;
}

function finSettlements() {
  const dir = ui.setDir;
  let list = S.settlements.filter((s) => s.direction === dir);
  const open = list.filter((s) => !s.closed && settlementPaid(s) < s.amount - 0.009);
  if (!ui.showClosed) list = open;
  const byCp = {};
  open.forEach((s) => { byCp[s.counterparty] = (byCp[s.counterparty] || 0) + Math.max(0, s.amount - settlementPaid(s)); });
  return `<div class="seg"><button data-dir="payable" class="${dir === 'payable' ? 'active' : ''}">📦 Постачальникам</button><button data-dir="receivable" class="${dir === 'receivable' ? 'active' : ''}">🤝 Від клієнтів</button></div>
    <div class="kpi" style="margin-bottom:12px"><div class="lbl">${dir === 'payable' ? 'Загальний борг постачальникам' : 'Очікую отримати від клієнтів'}</div><div class="val ${dir === 'payable' ? 'neg' : 'plus'}" style="font-size:26px">${money(outstanding(dir))}</div><div class="sub">${open.length} відкритих рахунків</div></div>
    ${Object.keys(byCp).length > 1 ? `<div class="card"><h3>${dir === 'payable' ? 'По постачальниках' : 'По клієнтах'}</h3>${Object.entries(byCp).sort((a, b) => b[1] - a[1]).map(([c, a]) => `<div class="row" style="justify-content:space-between;padding:4px 0"><span>${esc(c)}</span><b>${money(a)}</b></div>`).join('')}</div>` : ''}
    <div class="list">${list.length ? list.map(settlementCard).join('') : `<div class="empty"><div class="e">${dir === 'payable' ? '📦' : '🤝'}</div>${dir === 'payable' ? 'Немає відкритих розрахунків з постачальниками' : 'Немає очікуваних оплат від клієнтів'}.<br>Натисніть «＋», щоб додати рахунок.</div>`}</div>
    <button class="link" id="showClosed">${ui.showClosed ? 'Сховати закриті' : 'Показати й закриті'}</button>`;
}

function finInvest() {
  const tx = S.transactions.filter((x) => x.kind === 'investment');
  const got = sum(tx.filter((x) => x.type === 'income').map((x) => x.amount));
  const back = sum(tx.filter((x) => x.type === 'expense').map((x) => x.amount));
  const by = {};
  tx.forEach((x) => { const k = x.counterparty || 'Без імені'; by[k] = (by[k] || 0) + (x.type === 'income' ? x.amount : -x.amount); });
  const mx = Math.max(...Object.values(by).map(Math.abs), 1);
  return `<div class="hero" style="background:linear-gradient(135deg,#0ea5e9,#6d5efc)">
      <div class="lbl">Отримано інвестицій</div><div class="big">${money(got)}</div>
      <div class="cols"><div>Повернуто<b>${money(back)}</b></div><div>Залучено (чисті)<b>${money(got - back)}</b></div></div>
    </div>
    ${Object.keys(by).length ? `<div class="card"><h3>👥 По інвесторах</h3>${Object.entries(by).sort((a, b) => b[1] - a[1]).map(([n, a]) => `<div class="bar-row"><div class="top"><span>${esc(n)}</span><b>${money(a)}</b></div><div class="bar"><i style="width:${(Math.abs(a) / mx) * 100}%"></i></div></div>`).join('')}</div>` : ''}
    <div class="sec"><h2>Історія</h2></div>
    <div class="list">${tx.length ? tx.sort((a, b) => b.date.localeCompare(a.date)).map((x) => `<div class="item click" data-tx="${x.id}"><div class="ico" style="background:${x.type === 'income' ? 'var(--green-soft)' : 'var(--red-soft)'}">${x.type === 'income' ? '📈' : '📉'}</div><div class="grow"><div class="t">${esc(x.counterparty || 'Інвестор')}</div><div class="s">${fDateY(x.date)}${x.note ? ' · ' + esc(x.note) : ''}</div></div><div class="amt ${x.type === 'income' ? 'plus' : ''}">${x.type === 'income' ? '+' : '−'}${money(x.amount)}</div></div>`).join('') : '<div class="empty"><div class="e">📈</div>Інвестицій ще не зафіксовано.<br>Натисніть «＋», щоб додати.</div>'}</div>`;
}

/* ---------- Форми фінансів ---------- */
function editTx(x, preset = {}) {
  const isNew = !x;
  const v = x ? { ...x } : { type: 'expense', scope: 'production', date: today(), ...preset };
  if (!v.category) v.category = v.type === 'income' ? CATS.income[0] : CATS[v.scope || 'production'][0];
  const catOptions = (val) => (val.type === 'income' ? CATS.income : CATS[val.scope || 'production'] || CATS.production);
  const fields = [
    { name: 'type', label: 'Тип', type: 'toggle', options: { expense: '⬆️ Витрата', income: '⬇️ Дохід' } },
    { name: 'scope', label: 'Напрям', type: 'toggle', options: { production: '🏭 Виробництво', home: '🏠 Дім', personal: '👤 Особисте' }, show: (d) => d.type === 'expense' },
    { name: 'amount', label: 'Сума, ₴', type: 'number', required: true, half: true },
    { name: 'date', label: 'Дата', type: 'date', required: true, half: true },
    { name: 'category', label: 'Категорія', type: 'select', options: catOptions },
    { name: 'counterparty', label: 'Контрагент (постачальник, клієнт, магазин)', list: counterparties(), placeholder: 'Необовʼязково' },
    { name: 'project_id', label: 'Проєкт', type: 'select', options: projOptions(), show: (d) => d.type === 'income' || d.scope === 'production' },
    { name: 'note', label: 'Коментар', placeholder: 'Необовʼязково' }
  ];
  openForm({
    title: isNew ? 'Нова операція' : 'Операція', fields, values: v,
    mount: (root, read) => {
      root.querySelector('#sf').addEventListener('change', (e) => {
        if (!['type', 'scope'].includes(e.target.name)) return;
        const sel = root.querySelector('select[name=category]');
        sel.innerHTML = catOptions(read()).map((c) => `<option>${esc(c)}</option>`).join('');
      });
    },
    onSave: async (d) => {
      if (!(d.amount > 0)) { toast('Вкажіть суму'); return false; }
      if (d.type === 'income') d.scope = null;
      const base = x?.kind || preset.kind;
      d.kind = ['supplier', 'client', 'utility'].includes(base) ? base : d.category === 'Інвестиції' || base === 'investment' ? 'investment' : 'regular';
      d.project_id = d.project_id ? Number(d.project_id) : null;
      if (isNew) { if (preset.settlement_id) d.settlement_id = preset.settlement_id; await create('transactions', d); toast('Збережено'); } else await update('transactions', x, d);
    },
    onDelete: isNew ? null : () => remove('transactions', x)
  });
}

function editInvestment(x) {
  const isNew = !x;
  const v = x ? { ...x, dir: x.type } : { dir: 'income', date: today() };
  openForm({
    title: isNew ? 'Інвестиція' : 'Редагувати інвестицію', values: v,
    fields: [
      { name: 'dir', label: 'Рух коштів', type: 'toggle', options: { income: '📈 Отримано', expense: '📉 Повернуто' } },
      { name: 'counterparty', label: 'Інвестор', required: true, list: investors() },
      { name: 'amount', label: 'Сума, ₴', type: 'number', required: true, half: true },
      { name: 'date', label: 'Дата', type: 'date', required: true, half: true },
      { name: 'note', label: 'Умови / коментар', type: 'textarea' }
    ],
    onSave: async (d) => {
      if (!(d.amount > 0)) { toast('Вкажіть суму'); return false; }
      const data = { type: d.dir, kind: 'investment', scope: null, category: d.dir === 'income' ? 'Інвестиції' : 'Повернення інвестицій', amount: d.amount, date: d.date, counterparty: d.counterparty, note: d.note };
      if (isNew) await create('transactions', data); else await update('transactions', x, data);
      toast('Збережено');
    },
    onDelete: isNew ? null : () => remove('transactions', x)
  });
}

function editUtility(u, preset = {}) {
  const isNew = !u;
  const v = u ? { ...u } : { service: UTIL[0].name, period: ui.utilMonth, paid: false, ...preset };
  v.paid = v.paid ? '1' : '0';
  openForm({
    title: isNew ? 'Комунальна послуга' : u.service, values: v,
    fields: [
      { name: 'service', label: 'Послуга', type: 'select', options: UTIL.map((x) => x.name) },
      { name: 'period', label: 'За місяць', type: 'month', required: true, half: true },
      { name: 'due_date', label: 'Сплатити до (нагадування)', type: 'date', half: true },
      { name: 'meter_prev', label: 'Попередній показник', type: 'number', half: true },
      { name: 'meter_curr', label: 'Поточний показник', type: 'number', half: true },
      { name: 'tariff', label: 'Тариф, ₴ за одиницю', type: 'number', half: true },
      { name: 'amount', label: 'Сума до сплати, ₴', type: 'number', required: true, half: true },
      { name: 'paid', label: 'Статус', type: 'toggle', options: { 0: 'Не оплачено', 1: '✓ Оплачено' } },
      { name: 'note', label: 'Коментар' }
    ],
    extra: '<p class="hint" id="calcHint"></p>',
    mount: (root, read) => {
      const calc = () => {
        const d = read(); const p = parseFloat(d.meter_prev); const c = parseFloat(d.meter_curr); const t = parseFloat(d.tariff);
        if (!isNaN(p) && !isNaN(c) && !isNaN(t) && c >= p) {
          const a = Math.round((c - p) * t * 100) / 100;
          root.querySelector('input[name=amount]').value = a;
          $('#calcHint', root).textContent = `Розраховано: ${+(c - p).toFixed(3)} × ${t} = ${money(a)}`;
        }
      };
      $$('input[name=meter_prev],input[name=meter_curr],input[name=tariff]', root).forEach((i) => i.addEventListener('input', calc));
    },
    onSave: async (d) => {
      d.paid = d.paid === '1';
      d.amount = d.amount || 0;
      if (isNew) await create('utilities', d, { reload: true }); else await update('utilities', u, d, { reload: true });
      toast(d.paid ? 'Збережено й додано у витрати' : 'Збережено');
    },
    onDelete: isNew ? null : () => remove('utilities', u, { reload: true })
  });
}

function editSettlement(s) {
  const isNew = !s;
  const v = s ? { ...s, closed: s.closed ? '1' : '0' } : { direction: ui.setDir, date: today(), closed: '0' };
  openForm({
    title: isNew ? (v.direction === 'payable' ? 'Рахунок постачальника' : 'Очікувана оплата від клієнта') : 'Редагувати розрахунок', values: v,
    fields: [
      { name: 'direction', label: 'Тип', type: 'toggle', options: { payable: '📦 Я винен постачальнику', receivable: '🤝 Клієнт винен мені' } },
      { name: 'counterparty', label: 'Постачальник / клієнт', required: true, list: counterparties() },
      { name: 'title', label: 'За що', required: true, placeholder: 'Напр.: Плита МДФ, рахунок №125' },
      { name: 'amount', label: 'Сума, ₴', type: 'number', required: true, half: true },
      { name: 'date', label: 'Дата', type: 'date', half: true },
      { name: 'due_date', label: 'Термін оплати (нагадування о 09:00)', type: 'date' },
      { name: 'closed', label: 'Статус', type: 'toggle', options: { 0: 'Відкритий', 1: 'Закритий' }, show: () => !isNew },
      { name: 'note', label: 'Коментар', type: 'textarea' }
    ],
    onSave: async (d) => {
      if (!(d.amount > 0)) { toast('Вкажіть суму'); return false; }
      d.closed = d.closed === '1';
      if (isNew) await create('settlements', d); else await update('settlements', s, d);
      toast('Збережено');
    },
    onDelete: isNew ? null : () => remove('settlements', s, { reload: true })
  });
}

function showSettlement(s) {
  const pays = S.transactions.filter((t) => t.settlement_id === s.id).sort((a, b) => b.date.localeCompare(a.date));
  const paid = sum(pays.map((t) => t.amount)); const left = Math.max(0, s.amount - paid);
  const pay = s.direction === 'payable';
  openSheet(`
    <h2>${pay ? '📦' : '🤝'} ${esc(s.counterparty)}</h2>
    <div class="meta"><span class="pill gray">${esc(s.title)}</span>${s.due_date ? `<span class="pill ${left > 0 && s.due_date < today() ? 'red' : 'gray'}">термін ${fDate(s.due_date)}</span>` : ''}${s.closed ? '<span class="pill green">закрито</span>' : ''}</div>
    <div class="grid3" style="margin-bottom:12px">
      <div class="kpi"><div class="lbl">Сума</div><div class="val" style="font-size:16px">${money(s.amount)}</div></div>
      <div class="kpi"><div class="lbl">Сплачено</div><div class="val plus" style="font-size:16px">${money(paid)}</div></div>
      <div class="kpi"><div class="lbl">Залишок</div><div class="val ${left ? 'neg' : 'plus'}" style="font-size:16px">${money(left)}</div></div>
    </div>
    ${s.note ? `<div class="detail">${esc(s.note)}</div>` : ''}
    ${left > 0 ? `<button class="btn" id="addPay">${pay ? '💸 Внести оплату постачальнику' : '💰 Зафіксувати оплату від клієнта'}</button>` : ''}
    <div class="sec"><h2 style="font-size:15px">Оплати</h2></div>
    <div class="list">${pays.length ? pays.map(txHtml).join('') : '<div class="empty" style="padding:18px">Оплат ще не було</div>'}</div>
    <div class="btns"><button class="btn ghost" id="editSet">Редагувати</button>${!s.closed ? '<button class="btn ghost" id="closeSet">Закрити рахунок</button>' : ''}</div>
  `, (root) => {
    $('#addPay', root)?.addEventListener('click', () => {
      editTx(null, pay
        ? { type: 'expense', scope: 'production', category: 'Оплата постачальнику', counterparty: s.counterparty, amount: left, note: s.title, settlement_id: s.id, kind: 'supplier' }
        : { type: 'income', category: 'Оплата від клієнта', counterparty: s.counterparty, amount: left, note: s.title, settlement_id: s.id, kind: 'client' });
    });
    $$('[data-tx]', root).forEach((el) => el.addEventListener('click', () => editTx(byId('transactions', el.dataset.tx))));
    $('#editSet', root).addEventListener('click', () => editSettlement(s));
    $('#closeSet', root)?.addEventListener('click', async () => { await update('settlements', s, { closed: true }); refreshTop(); toast('Рахунок закрито'); });
  }, { reopen: () => showSettlement(byId('settlements', s.id)) });
}

/* ================= ПЛАНЕР ================= */
function taskHtml(x, ctx = {}) {
  const t = today();
  const late = !x.done && x.date && x.date < t;
  const p = x.project_id && !ctx.inProject ? byId('projects', x.project_id) : null;
  const meta = [
    x.time ? `<span>🕒 ${esc(x.time)}</span>` : '',
    x.date && (ctx.showDate || late) ? `<span class="pill ${late ? 'red' : 'gray'}">${late ? 'прострочено · ' : ''}${fDate(x.date)}</span>` : '',
    p ? `<span class="pill" style="background:color-mix(in srgb, ${p.color} 15%, transparent);color:${p.color}">${p.emoji || '📁'} ${esc(p.name)}</span>` : '',
    x.remind_at && !x.done ? `<span class="pill blue">🔔 ${x.date === t ? x.remind_at.slice(11, 16) : fDate(x.remind_at) + ' ' + x.remind_at.slice(11, 16)}</span>` : '',
    x.priority === 'high' ? '<span class="pill red">терміново</span>' : '',
    x.note ? `<span class="ellipsis" style="max-width:100%">${esc(x.note)}</span>` : ''
  ].filter(Boolean).join('');
  return `<div class="task p-${x.priority} ${x.done ? 'done' : ''}">
    <button class="check ${x.done ? 'on' : ''}" data-check="${x.id}" aria-label="Виконано">${checkSvg}</button>
    <div class="b" data-task="${x.id}"><div class="t">${esc(x.title)}</div>${meta ? `<div class="m">${meta}</div>` : ''}</div>
  </div>`;
}

async function toggleTask(id) {
  const x = byId('tasks', id); if (!x) return;
  x.done = !x.done; render();
  if (x.done) { navigator.vibrate?.(12); }
  try { await update('tasks', x, { done: x.done }); } catch { x.done = !x.done; render(); }
}

function renderPlanner(v) {
  ls.set('taskView', ui.taskView);
  const views = [['day', 'День'], ['week', 'Тиждень'], ['month', 'Місяць'], ['inbox', 'Списки']];
  let html = `<div class="seg">${views.map(([k, l]) => `<button data-tv="${k}" class="${ui.taskView === k ? 'active' : ''}">${l}</button>`).join('')}</div>`;
  const t = today(); const d = parse(ui.taskDate);

  if (ui.taskView === 'day') {
    const list = S.tasks.filter((x) => x.date === ui.taskDate).sort(taskSort);
    const done = list.filter((x) => x.done).length;
    const overdue = ui.taskDate === t ? S.tasks.filter((x) => !x.done && x.date && x.date < t).sort((a, b) => a.date.localeCompare(b.date)) : [];
    html += navBar(`${d.getDate()} ${MONTHS_G[d.getMonth()]}`, ui.taskDate === t ? 'сьогодні' : DOW[d.getDay()]) + `
      <div class="card row"><div class="ring" style="--p:${pct(done, list.length)}"><span>${pct(done, list.length)}%</span></div>
        <div class="grow"><b>Виконано ${done} з ${list.length}</b><div class="small muted">${list.filter((x) => x.remind_at && !x.done).length} з нагадуванням</div></div>
        <button class="btn sm sec" id="bulkBtn">☰ Списком</button></div>
      <div class="list"><form class="quick" data-quick='${JSON.stringify({ date: ui.taskDate })}'><input placeholder="Нова справа на цей день…" enterkeyhint="done"><button type="button" class="mic" data-mic aria-label="Надиктувати">🎤</button><button>＋</button></form>
        ${list.length ? list.map((x) => taskHtml(x)).join('') : '<div class="empty" style="padding:24px"><div class="e">🗓️</div>Справ на цей день немає</div>'}</div>
      ${overdue.length ? `<div class="sec"><h2 style="color:var(--red)">Прострочені · ${overdue.length}</h2><button class="link" id="moveOverdue">На сьогодні →</button></div><div class="list">${overdue.map((x) => taskHtml(x, { showDate: true })).join('')}</div>` : ''}
      ${list.some((x) => !x.done) && ui.taskDate <= t ? '<button class="btn ghost" id="moveUndone">Перенести невиконані на завтра</button>' : ''}`;
  } else if (ui.taskView === 'week') {
    const ws = weekStart(ui.taskDate); const we = addDays(ws, 6);
    const wt = S.tasks.filter((x) => x.date && x.date >= ws && x.date <= we);
    html += navBar(`${fDate(ws)} – ${fDate(we)}`, `виконано ${wt.filter((x) => x.done).length} з ${wt.length}`) + `<div class="board" id="board">${Array.from({ length: 7 }, (_, i) => {
      const day = addDays(ws, i); const dd = parse(day);
      const list = wt.filter((x) => x.date === day).sort(taskSort);
      return `<div class="col ${day === t ? 'today' : ''}" ${day === t ? 'id="todayCol"' : ''}>
        <div class="col-h"><div><b>${DOW[dd.getDay()]}</b> <span class="small muted">${dd.getDate()}.${pad(dd.getMonth() + 1)}${list.length ? ` · ${list.filter((x) => x.done).length}/${list.length}` : ''}</span></div><button class="add" data-addday="${day}">＋</button></div>
        ${list.length ? list.map((x) => taskHtml(x)).join('') : '<div class="empty" style="padding:16px">—</div>'}</div>`;
    }).join('')}</div>`;
  } else if (ui.taskView === 'month') {
    const y = d.getFullYear(); const m = d.getMonth(); const mk = `${y}-${pad(m + 1)}`;
    const start = weekStart(`${mk}-01`);
    const mt = S.tasks.filter((x) => x.date?.startsWith(mk));
    html += navBar(monthTitle(mk), `виконано ${mt.filter((x) => x.done).length} з ${mt.length}`);
    let cells = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map((x) => `<div class="dw">${x}</div>`).join('');
    for (let i = 0; i < 42; i++) {
      const day = addDays(start, i);
      if (i === 35 && !day.startsWith(mk)) break;
      const list = S.tasks.filter((x) => x.date === day); const dn = list.filter((x) => x.done).length;
      const cls = !list.length ? '' : dn === list.length ? 'all' : day < t ? 'late' : '';
      cells += `<button class="day ${day.startsWith(mk) ? '' : 'out'} ${day === t ? 'today' : ''}" data-day="${day}"><span class="n">${parse(day).getDate()}</span>${list.length ? `<span class="c ${cls}">${dn}/${list.length}</span>` : ''}</button>`;
    }
    html += `<div class="month">${cells}</div><p class="hint">Натисніть на день, щоб відкрити його справи.</p>`;
  } else {
    const inbox = S.tasks.filter((x) => !x.date && !x.project_id).sort(taskSort);
    const open = inbox.filter((x) => !x.done); const done = inbox.filter((x) => x.done);
    html += `<div class="card row"><div class="grow"><b>Швидкий список</b><div class="small muted">Справи без дати й проєкту. Вставте кілька рядків, щоб додати їх одним разом.</div></div><button class="btn sm sec" id="bulkBtn">☰ Списком</button></div>
      <div class="list"><form class="quick" data-quick='{}'><input placeholder="Що потрібно зробити?" enterkeyhint="done"><button type="button" class="mic" data-mic aria-label="Надиктувати">🎤</button><button>＋</button></form>
        ${open.length ? open.map((x) => taskHtml(x)).join('') : '<div class="empty" style="padding:24px"><div class="e">📝</div>Список порожній</div>'}</div>
      ${done.length ? `<div class="sec"><h2 style="font-size:15px">Виконані · ${done.length}</h2><button class="link" id="clearDone">Очистити</button></div><div class="list">${done.map((x) => taskHtml(x)).join('')}</div>` : ''}`;
  }

  v.innerHTML = html;
  $$('[data-tv]', v).forEach((b) => b.addEventListener('click', () => { ui.taskView = b.dataset.tv; render(); }));
  $$('[data-nav]', v).forEach((b) => b.addEventListener('click', () => {
    const n = Number(b.dataset.nav);
    if (ui.taskView === 'day') ui.taskDate = addDays(ui.taskDate, n);
    else if (ui.taskView === 'week') ui.taskDate = addDays(ui.taskDate, 7 * n);
    else { const x = parse(ui.taskDate); ui.taskDate = iso(new Date(x.getFullYear(), x.getMonth() + n, 1)); }
    render();
  }));
  $('.nav .p', v)?.addEventListener('click', () => { ui.taskDate = today(); render(); });
  $$('[data-addday]', v).forEach((b) => b.addEventListener('click', () => editTask(null, { date: b.dataset.addday })));
  $$('[data-day]', v).forEach((b) => b.addEventListener('click', () => { ui.taskDate = b.dataset.day; ui.taskView = 'day'; render(); }));
  $('#bulkBtn', v)?.addEventListener('click', () => bulkTasks({ date: ui.taskView === 'day' ? ui.taskDate : null }));
  $('#moveOverdue', v)?.addEventListener('click', async () => {
    for (const x of S.tasks.filter((x) => !x.done && x.date && x.date < t)) await api('PUT', `/api/tasks/${x.id}`, { date: t });
    await refresh(); toast('Перенесено на сьогодні');
  });
  $('#moveUndone', v)?.addEventListener('click', async () => {
    const tm = addDays(ui.taskDate, 1);
    for (const x of S.tasks.filter((x) => !x.done && x.date === ui.taskDate)) await api('PUT', `/api/tasks/${x.id}`, { date: tm });
    await refresh(); toast('Перенесено на завтра');
  });
  $('#clearDone', v)?.addEventListener('click', async () => {
    if (!confirm('Видалити виконані справи зі списку?')) return;
    for (const x of S.tasks.filter((x) => !x.date && !x.project_id && x.done)) await api('DELETE', `/api/tasks/${x.id}`);
    await refresh();
  });
  const tc = $('#todayCol', v); if (tc) $('#board', v).scrollLeft = tc.offsetLeft - 16;
}

function bulkTasks(preset = {}) {
  openForm({
    title: 'Додати списком', submit: 'Створити справи', values: { project_id: preset.project_id || '', date: preset.date || '' },
    fields: [
      { name: 'lines', label: 'Кожен рядок — окрема справа (🎤 — кожна фраза з нового рядка)', type: 'textarea', required: true, mic: true, placeholder: 'Купити фурнітуру\nЗателефонувати постачальнику\nПорахувати кошторис' },
      { name: 'project_id', label: 'Проєкт', type: 'select', options: projOptions(), half: true },
      { name: 'date', label: 'Дата (необовʼязково)', type: 'date', half: true }
    ],
    mount: (root) => { const ta = root.querySelector('textarea'); ta.style.minHeight = '170px'; setTimeout(() => ta.focus(), 250); },
    onSave: async (d) => {
      const lines = d.lines.split('\n').map((s) => s.trim()).filter(Boolean);
      if (!lines.length) return false;
      const created = await api('POST', '/api/tasks/bulk', { lines, project_id: d.project_id ? Number(d.project_id) : null, date: d.date || null });
      S.tasks.push(...created); render();
      toast(`Створено справ: ${created.length}`);
    }
  });
}

const REPEAT = { none: 'Не повторювати', daily: 'Щодня (7 днів)', weekdays: 'По буднях (2 тижні)', weekly: 'Щотижня (8 тижнів)', monthly: 'Щомісяця (6 місяців)' };
function editTask(x, preset = {}) {
  const isNew = !x;
  const v = x ? { ...x, remind_minutes: x.remind_minutes ?? '' } : { date: ui.tab === 'planner' && ui.taskView !== 'inbox' ? ui.taskDate : '', priority: 'low', remind_minutes: '', repeat: 'none', ...preset };
  const fields = [
    { name: 'title', label: 'Справа', required: true, placeholder: 'Що потрібно зробити?', mic: true },
    { name: 'project_id', label: 'Проєкт', type: 'select', options: projOptions() },
    { name: 'date', label: 'Дата', type: 'date', half: true },
    { name: 'time', label: 'Час', type: 'time', half: true },
    { name: 'remind_minutes', label: '🔔 Нагадування', type: 'select', options: REMIND },
    { name: 'priority', label: 'Пріоритет', type: 'toggle', options: PRIORITY },
    { name: 'note', label: 'Нотатки', type: 'textarea' }
  ];
  if (isNew) fields.push({ name: 'repeat', label: 'Повторення', type: 'select', options: REPEAT });
  openForm({
    title: isNew ? 'Нова справа' : 'Справа', fields, values: v,
    extra: `<p class="hint" id="remHint"></p>`,
    onVoice: (text, root) => {
      const p = parseTaskText(text);
      const set = (n, val) => { const el = root.querySelector(`[name="${n}"]`); if (el && val != null) { el.value = val; el.dispatchEvent(new Event('change', { bubbles: true })); } };
      set('title', p.title || text);
      if (p.date) set('date', p.date);
      if (p.time) set('time', p.time);
      if (p.remind_minutes !== null) set('remind_minutes', String(p.remind_minutes));
    },
    mount: (root, read) => {
      const h = () => { const d = read(); $('#remHint', root).textContent = d.remind_minutes !== '' ? (!d.date ? '⚠️ Для нагадування вкажіть дату.' : !d.time ? 'Час не вказано — нагадаю о 09:00.' : '') : ''; };
      root.querySelector('#sf').addEventListener('change', h); h();
    },
    onSave: async (d) => {
      const rep = d.repeat; delete d.repeat;
      d.project_id = d.project_id ? Number(d.project_id) : null;
      d.remind_minutes = d.remind_minutes === null || d.remind_minutes === '' ? null : Number(d.remind_minutes);
      if (d.remind_minutes !== null) { if (!d.date) { toast('Для нагадування потрібна дата'); return false; } ensurePushAsked(); }
      if (!isNew) { await update('tasks', x, d); toast('Збережено'); return; }
      const dates = [d.date];
      if (d.date && rep && rep !== 'none') {
        if (rep === 'daily') for (let i = 1; i < 7; i++) dates.push(addDays(d.date, i));
        if (rep === 'weekly') for (let i = 1; i < 8; i++) dates.push(addDays(d.date, 7 * i));
        if (rep === 'monthly') for (let i = 1; i < 6; i++) { const p = parse(d.date); dates.push(iso(new Date(p.getFullYear(), p.getMonth() + i, p.getDate()))); }
        if (rep === 'weekdays') for (let i = 1; dates.length < 10 && i < 20; i++) { const n = addDays(d.date, i); const w = parse(n).getDay(); if (w && w !== 6) dates.push(n); }
      }
      for (const dt of dates) S.tasks.push(await api('POST', '/api/tasks', { ...d, date: dt }));
      render();
      toast(dates.length > 1 ? `Створено справ: ${dates.length}` : 'Справу додано');
    },
    onDelete: isNew ? null : () => remove('tasks', x)
  });
}

/* ================= ПРОЄКТИ ================= */
function projectStats(p) {
  const ts = S.tasks.filter((t) => t.project_id === p.id);
  const done = ts.filter((t) => t.done).length;
  const spent = sum(S.transactions.filter((t) => t.project_id === p.id && t.type === 'expense').map((t) => t.amount));
  const got = sum(S.transactions.filter((t) => t.project_id === p.id && t.type === 'income').map((t) => t.amount));
  return { total: ts.length, done, open: ts.length - done, spent, got };
}

function projectCard(p) {
  const st = projectStats(p);
  const lead = p.lead_id ? byId('leads', p.lead_id) : null;
  const late = p.due_date && p.due_date < today() && p.status !== 'done';
  return `<div class="pcard" data-project="${p.id}" style="--pc:${p.color}">
    <div class="em">${p.emoji || '📁'}</div>
    <div class="grow"><div style="font-weight:800;font-size:16px" class="ellipsis">${esc(p.name)}</div>
      <div class="small muted ellipsis">${[st.open ? `${st.open} відкритих справ` : st.total ? 'Усе виконано ✓' : 'Без справ', p.due_date ? `${late ? '⚠️ ' : ''}до ${fDate(p.due_date)}` : '', lead ? srcOf(lead)?.name : ''].filter(Boolean).join(' · ')}</div>
      <div class="bar" style="margin-top:9px"><i style="width:${pct(st.done, st.total)}%;background:${p.color}"></i></div></div>
    <div class="ring" style="--p:${pct(st.done, st.total)};background:conic-gradient(${p.color} calc(var(--p) * 1%), var(--bg) 0)"><span>${pct(st.done, st.total)}%</span></div>
  </div>`;
}

function renderProjects(v) {
  const f = ui.projFilter;
  const list = S.projects.filter((p) => p.status === f);
  const cnt = (s) => S.projects.filter((p) => p.status === s).length;
  v.innerHTML = `<div class="seg">${[['active', 'Активні'], ['paused', 'На паузі'], ['done', 'Завершені']].map(([k, l]) => `<button data-pf="${k}" class="${f === k ? 'active' : ''}">${l} · ${cnt(k)}</button>`).join('')}</div>
    ${list.length ? list.map(projectCard).join('') : `<div class="empty"><div class="e">📁</div>${f === 'active' ? 'Створіть перший проєкт кнопкою «＋».<br>До кожного проєкту можна додати список справ.' : 'Тут порожньо'}</div>`}`;
  $$('[data-pf]', v).forEach((b) => b.addEventListener('click', () => { ui.projFilter = b.dataset.pf; render(); }));
}

function renderProject(v, p) {
  const st = projectStats(p);
  const lead = p.lead_id ? byId('leads', p.lead_id) : null;
  const ts = S.tasks.filter((t) => t.project_id === p.id).sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999') || taskSort(a, b));
  const open = ts.filter((t) => !t.done); const done = ts.filter((t) => t.done);
  const txs = S.transactions.filter((t) => t.project_id === p.id).sort((a, b) => b.date.localeCompare(a.date));
  v.innerHTML = `
    <div class="phead" style="--pc:${p.color}">
      <div style="font-size:30px">${p.emoji || '📁'}</div>
      <h2>${esc(p.name)}</h2>
      <div class="meta"><span>${{ active: '🟢 Активний', paused: '⏸ На паузі', done: '✅ Завершено' }[p.status]}</span>${p.due_date ? `<span>📅 до ${fDateY(p.due_date)}</span>` : ''}<span>✓ ${st.done}/${st.total}</span>${lead ? `<span>${chOf(srcOf(lead)).icon} ${esc(lead.name)}</span>` : ''}</div>
      <div class="bar"><i style="width:${pct(st.done, st.total)}%"></i></div>
    </div>
    ${p.description ? `<div class="detail">${esc(p.description)}</div>` : ''}
    <div class="btns" style="margin:0 0 12px"><button class="btn sm ghost" id="pEdit">✏️ Редагувати</button><button class="btn sm ghost" id="pBulk">☰ Справи списком</button>${lead ? `<button class="btn sm ghost" data-lead="${lead.id}">🎯 Лід</button>` : ''}</div>
    <div class="sec" style="margin-top:6px"><h2>Справи · ${open.length}</h2></div>
    <div class="list"><form class="quick" data-quick='${JSON.stringify({ project_id: p.id })}'><input placeholder="Додати справу до проєкту…" enterkeyhint="done"><button type="button" class="mic" data-mic aria-label="Надиктувати">🎤</button><button>＋</button></form>
      ${open.length ? open.map((t) => taskHtml(t, { inProject: true, showDate: true })).join('') : '<div class="empty" style="padding:22px">Відкритих справ немає</div>'}</div>
    ${done.length ? `<button class="link" id="pDone">${ui.showDone ? 'Сховати' : 'Показати'} виконані (${done.length})</button>${ui.showDone ? `<div class="list" style="margin-top:8px">${done.map((t) => taskHtml(t, { inProject: true })).join('')}</div>` : ''}` : ''}
    <div class="sec"><h2>💸 Фінанси проєкту</h2><button class="link" id="pTx">＋ Операція</button></div>
    <div class="grid2" style="margin-bottom:12px"><div class="kpi"><div class="lbl">Витрати</div><div class="val">${money(st.spent)}</div></div><div class="kpi"><div class="lbl">Надходження</div><div class="val plus">${money(st.got)}</div></div></div>
    ${txs.length ? `<div class="list">${txs.slice(0, 20).map(txHtml).join('')}</div>` : ''}
  `;
  $('#pEdit', v).addEventListener('click', () => editProject(p));
  $('#pBulk', v).addEventListener('click', () => bulkTasks({ project_id: p.id }));
  $('#pDone', v)?.addEventListener('click', () => { ui.showDone = !ui.showDone; render(); });
  $('#pTx', v).addEventListener('click', () => editTx(null, { type: 'expense', scope: 'production', project_id: p.id }));
}

function editProject(p, preset = {}) {
  const isNew = !p;
  const v = p ? { ...p } : { status: 'active', color: P_COLORS[S.projects.length % P_COLORS.length], emoji: '📁', ...preset };
  openForm({
    title: isNew ? 'Новий проєкт' : 'Редагувати проєкт', values: v,
    fields: [
      { name: 'name', label: 'Назва', required: true, placeholder: 'Кухня для Олени, ремонт офісу…' },
      { name: 'emoji', label: 'Іконка', type: 'emoji' },
      { name: 'color', label: 'Колір', type: 'color' },
      { name: 'due_date', label: 'Дедлайн', type: 'date', half: true },
      { name: 'status', label: 'Статус', type: 'select', options: { active: 'Активний', paused: 'На паузі', done: 'Завершено' }, half: true },
      { name: 'lead_id', label: 'Повʼязаний лід (клієнт)', type: 'select', options: { '': '— немає —', ...Object.fromEntries(S.leads.map((l) => [l.id, `${l.name}${srcOf(l) ? ' · ' + srcOf(l).name : ''}`])) } },
      { name: 'description', label: 'Опис', type: 'textarea' }
    ],
    onSave: async (d) => {
      d.lead_id = d.lead_id ? Number(d.lead_id) : null;
      if (isNew) { const it = await create('projects', d); closeAll(); openProject(it.id); toast('Проєкт створено'); return false; }
      await update('projects', p, d);
      toast('Збережено');
    },
    onDelete: isNew ? null : async () => { ui.projectId = null; await remove('projects', p, { reload: true }); }
  });
}

/* ================= ЛІДИ ================= */
function leadHtml(x) {
  const st = LEAD_STATUS[x.status]; const src = srcOf(x);
  const late = x.next_date && x.next_date < today() && ['new', 'work', 'offer'].includes(x.status);
  return `<div class="item click" data-lead="${x.id}">
    <div class="ico" style="background:color-mix(in srgb, ${chOf(src).color} 15%, transparent)">${esc((x.name || '?').trim()[0]?.toUpperCase() || '?')}</div>
    <div class="grow"><div class="t">${esc(x.name)}</div><div class="s">${esc(x.request || 'Без опису')}</div>
      <div class="tags">${srcBadge(src)}<span class="pill ${st.cls}">${st.label}</span>${x.next_date && ['new', 'work', 'offer'].includes(x.status) ? `<span class="pill ${late ? 'red' : 'gray'}">📅 ${fDate(x.next_date)}</span>` : ''}</div></div>
    <div class="end">${x.amount ? `<div class="amt">${money(x.amount)}</div>` : ''}<div class="s">${fDate(x.date)}</div></div>
  </div>`;
}

function renderLeads(v) {
  const counts = Object.fromEntries(Object.keys(LEAD_STATUS).map((k) => [k, S.leads.filter((x) => x.status === k).length]));
  let list = S.leads.slice();
  if (ui.leadStatus !== 'all') list = list.filter((x) => x.status === ui.leadStatus);
  if (ui.leadQuery) { const q = ui.leadQuery.toLowerCase(); list = list.filter((x) => [x.name, x.contact, x.request, x.note].join(' ').toLowerCase().includes(q)); }
  const groups = [...S.sources.map((s) => ({ s, xs: S.leads.filter((x) => x.source_id === s.id) }))];
  const none = S.leads.filter((x) => !srcOf(x));
  if (none.length) groups.push({ s: null, xs: none });
  const srcStats = groups.map(({ s, xs }) => ({ s, n: xs.length, won: xs.filter((x) => x.status === 'won').length, sum: sum(xs.filter((x) => x.status === 'won').map((x) => x.amount)) }));
  const maxN = Math.max(...srcStats.map((x) => x.n), 1);
  const pipeline = sum(S.leads.filter((x) => ['new', 'work', 'offer'].includes(x.status)).map((x) => x.amount));
  const closed = counts.won + counts.lost;
  v.innerHTML = `
    <div class="pipe">${Object.entries(LEAD_STATUS).map(([k, s]) => `<button data-ls="${k}" class="${ui.leadStatus === k ? 'active' : ''}"><b>${counts[k]}</b><small>${s.short}</small></button>`).join('')}</div>
    <div class="grid2" style="margin-bottom:12px">
      <div class="kpi"><div class="lbl">💼 Потенційно в роботі</div><div class="val">${money(pipeline)}</div></div>
      <div class="kpi"><div class="lbl">🏆 Конверсія</div><div class="val">${pct(counts.won, closed)}%</div><div class="sub">${counts.won} з ${closed} закритих</div></div>
    </div>
    <input class="search" id="leadQ" placeholder="🔍 Пошук за імʼям, запитом, контактом…" value="${esc(ui.leadQuery)}">
    ${ui.leadStatus !== 'all' ? `<p class="hint">Фільтр: <b>${LEAD_STATUS[ui.leadStatus].label}</b> · <button class="link" data-ls="${ui.leadStatus}">показати всіх</button></p>` : ''}
    <div class="list">${list.length ? list.map(leadHtml).join('') : '<div class="empty"><div class="e">🎯</div>Лідів поки немає.<br>Натисніть «＋», щоб зафіксувати людину, запит і джерело.</div>'}</div>
    <div class="card"><h3>📣 Рекламні канали <button class="link right" id="srcManage" style="margin-left:auto">⚙️ Керувати</button></h3>
      ${srcStats.length ? srcStats.map((x) => `<div class="bar-row"><div class="top"><span>${x.s ? `${chOf(x.s).icon} ${esc(x.s.name)}` : '— без джерела'}</span><span><b>${x.n}</b> <span class="muted small">· успіх ${x.won}${x.sum ? ' · ' + money(x.sum) : ''}</span></span></div><div class="bar"><i style="width:${(x.n / maxN) * 100}%;background:${x.s ? chOf(x.s).color : 'var(--muted)'}"></i></div></div>`).join('') : '<div class="muted small">Каналів ще немає</div>'}
      <button class="btn sm sec" id="srcAdd" style="margin-top:12px">＋ Додати канал</button></div>`;
  $('#srcManage', v).addEventListener('click', manageSources);
  $('#srcAdd', v).addEventListener('click', () => editSource());
  $$('[data-ls]', v).forEach((b) => b.addEventListener('click', () => { ui.leadStatus = ui.leadStatus === b.dataset.ls ? 'all' : b.dataset.ls; render(); }));
  const q = $('#leadQ', v);
  q.addEventListener('input', () => { ui.leadQuery = q.value; const pos = q.selectionStart; render(); const n = $('#leadQ'); n.focus(); n.setSelectionRange(pos, pos); });
}

function contactLinks(lead) {
  const c = (lead.contact || '').trim(); if (!c) return '';
  const phone = /^\+?[\d\s()-]{7,}$/.test(c) ? c.replace(/[^\d+]/g, '') : null;
  const digits = phone ? phone.replace(/\D/g, '') : '';
  const user = /^@?[A-Za-z][\w]{3,}$/.test(c) ? c.replace(/^@/, '') : null;
  const out = [];
  if (phone) out.push(`<a class="btn sm ghost" href="tel:${esc(phone)}">📞 Подзвонити</a>`);
  const ch = srcOf(lead)?.channel;
  if (ch === 'viber' && phone) out.push(`<a class="btn sm ghost" href="viber://chat?number=%2B${digits}">💜 Viber</a>`);
  if (ch === 'telegram' || (!phone && user)) {
    if (user) out.push(`<a class="btn sm ghost" href="https://t.me/${esc(user)}" target="_blank" rel="noopener">✈️ Telegram</a>`);
    else if (phone) out.push(`<a class="btn sm ghost" href="https://t.me/+${digits}" target="_blank" rel="noopener">✈️ Telegram</a>`);
  }
  return out.length ? `<div class="btns" style="margin:0 0 12px">${out.join('')}</div>` : '';
}

function showLead(x) {
  if (!x) return;
  const src = srcOf(x);
  const proj = S.projects.find((p) => p.lead_id === x.id);
  openSheet(`
    <h2>${esc(x.name)}</h2>
    <div class="meta">${srcBadge(src)}<span class="pill ${LEAD_STATUS[x.status].cls}">${LEAD_STATUS[x.status].label}</span><span class="pill gray">${fDateY(x.date)}</span>${x.amount ? `<span class="pill green">${money(x.amount)}</span>` : ''}${x.next_date ? `<span class="pill amber">📅 контакт ${fDate(x.next_date)}</span>` : ''}</div>
    ${x.contact ? `<p style="margin:0 0 8px"><b>Контакт:</b> ${esc(x.contact)}</p>` : ''}
    ${contactLinks(x)}
    <div class="detail">${esc(x.request) || '<span class="muted">Запит не описано</span>'}${x.note ? `\n\n<span class="muted">Нотатки:</span>\n${esc(x.note)}` : ''}</div>
    <div class="f"><label>Етап</label><div class="tog" id="lst">${Object.entries(LEAD_STATUS).map(([k, s]) => `<button type="button" data-v="${k}" class="${x.status === k ? 'active' : ''}" style="font-size:12px;padding:9px 2px">${s.short}</button>`).join('')}</div></div>
    ${proj ? `<button class="btn" id="lProj">📁 Відкрити проєкт «${esc(proj.name)}»</button>` : '<button class="btn" id="lProj">📁 Створити проєкт для ліда</button>'}
    <div class="btns"><button class="btn ghost" id="lTask">✅ Справа-нагадування</button><button class="btn ghost" id="lEdit">✏️ Редагувати</button></div>
  `, (root) => {
    $('#lst', root).addEventListener('click', async (e) => {
      const b = e.target.closest('button'); if (!b) return;
      await update('leads', x, { status: b.dataset.v }); refreshTop(); toast(`Етап: ${LEAD_STATUS[x.status].label}`);
      if (x.status === 'won' && x.amount && confirm(`Створити очікувану оплату ${money(x.amount)} від «${x.name}» у розрахунках?`)) {
        await create('settlements', { direction: 'receivable', counterparty: x.name, title: x.request?.slice(0, 120) || 'Замовлення', amount: x.amount, date: today() });
        toast('Додано в «Розрахунки → Від клієнтів»');
      }
    });
    $('#lProj', root).addEventListener('click', () => { if (proj) { closeAll(); openProject(proj.id); } else editProject(null, { name: x.name, lead_id: x.id, description: x.request }); });
    $('#lTask', root).addEventListener('click', () => editTask(null, { title: `Звʼязатися: ${x.name}`, note: x.request, date: x.next_date || today(), time: '10:00', remind_minutes: 0, priority: 'mid' }));
    $('#lEdit', root).addEventListener('click', () => editLead(x));
  }, { reopen: () => showLead(byId('leads', x.id)) });
}

function editLead(x, preset = {}) {
  const isNew = !x;
  const v = x ? { ...x, ...preset } : { source_id: ls.get('lastSource', S.sources[0]?.id || ''), status: 'new', date: today(), ...preset };
  if (v.source_id && !byId('sources', v.source_id)) v.source_id = S.sources[0]?.id || '';
  openForm({
    title: isNew ? 'Новий лід' : 'Редагувати ліда', values: v,
    rebuild: (cur) => editLead(x, { ...cur, ...(newSourceId ? { source_id: newSourceId } : {}) }),
    extraTop: '',
    fields: [
      { name: 'name', label: 'Імʼя / компанія', required: true },
      { name: 'source_id', label: 'Рекламний канал (джерело)', type: 'select', options: { '': '— не вказано —', ...Object.fromEntries(S.sources.map((s) => [s.id, `${chOf(s).icon} ${s.name}`])) }, after: '<button type="button" class="link" id="newSrc">＋ Новий канал</button>' },
      { name: 'contact', label: 'Контакт (телефон або @username)', placeholder: '+380… або @username' },
      { name: 'request', label: 'Що потрібно / запит', type: 'textarea' },
      { name: 'status', label: 'Етап', type: 'select', options: Object.fromEntries(Object.entries(LEAD_STATUS).map(([k, s]) => [k, s.label])), half: true },
      { name: 'amount', label: 'Потенційна сума, ₴', type: 'number', half: true },
      { name: 'date', label: 'Дата звернення', type: 'date', required: true, half: true },
      { name: 'next_date', label: 'Наступний контакт 🔔', type: 'date', half: true },
      { name: 'note', label: 'Нотатки', type: 'textarea' }
    ],
    mount: (root) => { newSourceId = null; $('#newSrc', root).addEventListener('click', () => editSource()); },
    onSave: async (d) => {
      if (d.next_date) ensurePushAsked();
      d.source_id = d.source_id ? Number(d.source_id) : null;
      if (d.source_id) ls.set('lastSource', d.source_id);
      if (isNew) await create('leads', d); else await update('leads', x, d);
      toast('Збережено');
    },
    onDelete: isNew ? null : () => remove('leads', x)
  });
}

/* ---------- Рекламні канали ---------- */
let newSourceId = null;
function manageSources() {
  openSheet(`<h2>📣 Рекламні канали</h2>
    <p class="hint" style="margin-top:0">Канали — це джерела, з яких приходять ліди. Додайте рекламу в Instagram, Facebook, сайт, OLX, рекомендації тощо.</p>
    <div class="list">${S.sources.length ? S.sources.map((s) => {
      const n = S.leads.filter((l) => l.source_id === s.id).length;
      return `<div class="item click" data-src="${s.id}"><div class="ico" style="background:color-mix(in srgb, ${chOf(s).color} 15%, transparent)">${chOf(s).icon}</div><div class="grow"><div class="t">${esc(s.name)}</div><div class="s">${chOf(s).label} · лідів: ${n}</div></div><span class="muted">›</span></div>`;
    }).join('') : '<div class="empty" style="padding:20px">Каналів ще немає</div>'}</div>
    <button class="btn" id="srcNew">＋ Додати канал</button>`, (root) => {
    $$('[data-src]', root).forEach((el) => el.addEventListener('click', () => editSource(byId('sources', el.dataset.src))));
    $('#srcNew', root).addEventListener('click', () => editSource());
  }, { reopen: manageSources });
}

function editSource(src) {
  const isNew = !src;
  openForm({
    title: isNew ? 'Новий рекламний канал' : 'Редагувати канал', values: src ? { ...src } : { channel: 'instagram' },
    fields: [
      { name: 'name', label: 'Назва каналу', required: true, placeholder: 'Напр.: Реклама Instagram, Сайт, OLX' },
      { name: 'channel', label: 'Тип', type: 'select', options: Object.fromEntries(Object.entries(CHANNELS).map(([k, c]) => [k, `${c.icon} ${c.label}`])) }
    ],
    onSave: async (d) => {
      if (isNew) { const it = await create('sources', { ...d, position: S.sources.length + 1 }); S.sources.push(S.sources.shift()); newSourceId = it.id; S.sources.sort((a, b) => a.position - b.position || a.id - b.id); render(); }
      else await update('sources', src, d);
      toast('Канал збережено');
    },
    onDelete: isNew ? null : async () => {
      const n = S.leads.filter((l) => l.source_id === src.id).length;
      if (n && !confirm(`Канал використовують ${n} лід(ів) — вони залишаться без джерела. Продовжити?`)) throw new Error('cancel');
      await remove('sources', src, { reload: true });
    }
  });
}

/* ================= Додати (FAB) ================= */
function fab() {
  if (ui.tab === 'finance') return ({ ops: () => editTx(), report: () => editTx(), utilities: () => editUtility(), settlements: () => editSettlement(), invest: () => editInvestment() })[ui.sub]();
  if (ui.tab === 'planner') return ui.taskView === 'inbox' ? bulkTasks() : editTask();
  if (ui.tab === 'projects') return ui.projectId ? editTask(null, { project_id: ui.projectId, date: '' }) : editProject();
  if (ui.tab === 'leads') return editLead();
  const opts = [
    ['voice', '🎤', 'Справа голосом', () => voiceTask()],
    ['task', '✅', 'Справа', () => editTask(null, { date: today() })],
    ['list', '☰', 'Справи списком', () => bulkTasks({ date: today() })],
    ['exp', '⬆️', 'Витрата', () => editTx()],
    ['inc', '⬇️', 'Дохід', () => editTx(null, { type: 'income' })],
    ['lead', '🎯', 'Лід', () => editLead()],
    ['proj', '📁', 'Проєкт', () => editProject()],
    ['util', '💡', 'Комуналка', () => editUtility()],
    ['set', '📦', 'Рахунок постачальника', () => editSettlement()]
  ];
  openSheet(`<h2>Додати</h2><div class="grid2">${opts.map(([k, i, l]) => `<button class="kpi click" data-add="${k}" style="border:0;text-align:left;display:flex;gap:10px;align-items:center"><span class="ico" style="width:38px;height:38px">${i}</span><b style="font-size:14px">${l}</b></button>`).join('')}</div>`, (root) => {
    $$('[data-add]', root).forEach((b) => b.addEventListener('click', () => { closeAll(); opts.find((o) => o[0] === b.dataset.add)[3](); }));
  });
}

/* ================= Сповіщення та звук ================= */
let audio = null;
function unlockAudio() {
  try { audio ||= new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === 'suspended') audio.resume(); } catch { /* немає звуку */ }
}
function playSound(name = ls.get('sound', 'chime')) {
  if (name === 'none') return;
  unlockAudio(); if (!audio) return;
  const t0 = audio.currentTime + 0.02;
  const tone = (f, start, dur, type = 'sine', vol = 0.25) => {
    const o = audio.createOscillator(); const g = audio.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0 + start);
    g.gain.setValueAtTime(0.0001, t0 + start); g.gain.exponentialRampToValueAtTime(vol, t0 + start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + start + dur);
    o.connect(g).connect(audio.destination); o.start(t0 + start); o.stop(t0 + start + dur + 0.05);
  };
  const P = {
    chime: () => { tone(1318, 0, 0.6); tone(1760, 0.18, 0.9); },
    melody: () => [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tone(f, i * 0.14, 0.3, 'triangle', 0.22)),
    alarm: () => [0, 0.25, 0.5, 0.9, 1.15, 1.4].forEach((s) => tone(880, s, 0.16, 'square', 0.12)),
    drop: () => { tone(1200, 0, 0.25); tone(800, 0.12, 0.3); tone(600, 0.26, 0.45); },
    soft: () => [440, 554, 659].forEach((f) => tone(f, 0, 1.4, 'sine', 0.12))
  };
  (P[name] || P.chime)();
}
document.addEventListener('pointerdown', unlockAudio, { once: true });

function banner(title, body) {
  $('.banner')?.remove();
  const b = document.createElement('div');
  b.className = 'banner';
  b.innerHTML = `<div class="ico">🔔</div><div class="grow"><b>${esc(title)}</b><div class="small muted">${esc(body || '')}</div></div><button class="icon-btn" style="width:34px;height:34px">✕</button>`;
  document.body.appendChild(b);
  b.querySelector('button').addEventListener('click', () => b.remove());
  setTimeout(() => b.remove(), 12000);
}

const b64ToU8 = (b) => { const p = '='.repeat((4 - (b.length % 4)) % 4); const r = atob((b + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from([...r].map((c) => c.charCodeAt(0))); };
const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent);
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

async function pushStatus() {
  if (!pushSupported()) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  const reg = await navigator.serviceWorker.ready;
  return (await reg.pushManager.getSubscription()) ? 'on' : 'off';
}

async function enablePush() {
  if (!pushSupported()) {
    toast(isIOS() && !isStandalone() ? 'На iPhone спершу встановіть додаток: Поділитися → На екран «Додому»' : 'Цей браузер не підтримує сповіщення');
    return false;
  }
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') { toast('Сповіщення не дозволено'); return false; }
  const reg = await navigator.serviceWorker.ready;
  const { publicKey } = await api('GET', '/api/push/key');
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToU8(publicKey) });
  await api('POST', '/api/push/subscribe', sub.toJSON());
  ls.set('pushAsked', true);
  toast('🔔 Сповіщення увімкнено на цьому пристрої');
  return true;
}

async function disablePush() {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) { await api('POST', '/api/push/unsubscribe', { endpoint: sub.endpoint }); await sub.unsubscribe(); }
  toast('Сповіщення вимкнено на цьому пристрої');
}

async function ensurePushAsked() {
  if (!pushSupported() || ls.get('pushAsked', false)) return;
  if ((await pushStatus()) === 'off' && confirm('Увімкнути сповіщення на цьому пристрої, щоб нагадування приходили навіть коли додаток закритий?')) await enablePush();
  ls.set('pushAsked', true);
}

/* Повідомлення від service worker */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
  navigator.serviceWorker.addEventListener('message', (e) => {
    const m = e.data || {};
    if (m.type === 'reminder') { playSound(); navigator.vibrate?.([200, 100, 200]); banner(m.payload?.title, m.payload?.body); refresh(); }
    if (m.type === 'refresh') refresh();
    if (m.type === 'open' && m.url) openUrl(m.url);
  });
}

/* Резерв: коли push не увімкнено, нагадування спрацьовують у відкритому додатку */
const fired = new Set(ls.get('fired', []));
setInterval(async () => {
  if (document.hidden) return;
  if ((await pushStatus().catch(() => 'off')) === 'on') return;
  const now = nowLocal(); const ago = (() => { const d = new Date(Date.now() - 10 * 60000); return `${iso(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`; })();
  S.tasks.filter((t) => !t.done && t.remind_at && t.remind_at <= now && t.remind_at >= ago && !fired.has(t.id + '@' + t.remind_at)).forEach((t) => {
    fired.add(t.id + '@' + t.remind_at); ls.set('fired', [...fired].slice(-200));
    playSound(); banner('🔔 ' + t.title, t.time ? 'О ' + t.time : '');
  });
}, 30000);

/* ================= Голосове введення ================= */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let activeRec = null;
/** Надиктувати текст у поле (українська). append — дописати новим рядком. */
function dictate(input, btn, { append = false, onFinal } = {}) {
  if (activeRec) { activeRec.stop(); return; }
  if (!SR) {
    input.focus();
    toast('Голос: натисніть 🎤 на клавіатурі телефону й говоріть');
    return;
  }
  const r = new SR();
  r.lang = 'uk-UA'; r.interimResults = true; r.continuous = false; r.maxAlternatives = 1;
  const before = append && input.value.trim() ? input.value.replace(/\s+$/, '') + '\n' : '';
  let text = '';
  activeRec = r;
  btn?.classList.add('rec');
  navigator.vibrate?.(15);
  r.onresult = (e) => {
    text = [...e.results].map((x) => x[0].transcript).join(' ').trim();
    input.value = before + text;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };
  r.onerror = (e) => {
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') toast('Дозвольте доступ до мікрофона в налаштуваннях браузера');
    else if (e.error === 'no-speech') toast('Не почув — спробуйте ще раз');
    else if (e.error !== 'aborted') toast('Розпізнавання недоступне. Скористайтеся 🎤 на клавіатурі');
  };
  r.onend = () => {
    activeRec = null;
    btn?.classList.remove('rec');
    if (text) { text = text.charAt(0).toUpperCase() + text.slice(1); input.value = before + text; onFinal?.(text); }
  };
  try { r.start(); } catch { activeRec = null; btn?.classList.remove('rec'); input.focus(); }
}

const WEEKDAYS = [['неділ', 0], ['понеділ', 1], ['вівтор', 2], ['серед', 3], ['четвер', 4], ['пʼятниц', 5], ["п'ятниц", 5], ['пятниц', 5], ['субот', 6]];
/**
 * Розбір фрази: «завтра о 15:30 подзвонити постачальнику» → дата, час, нагадування.
 * Якщо названо час — нагадування ставиться на цей час.
 */
function parseTaskText(raw, baseDate) {
  let t = ' ' + String(raw || '').replace(/[’`]/g, 'ʼ').trim() + ' ';
  let date = null; let time = null; let remind = null;
  const cut = (re) => { const m = t.match(re); if (m) t = t.replace(m[0], ' '); return m; };
  if (cut(/\s(?:нагадай|нагадати|нагадування)(?:\s+мені)?[,]?\s/i)) remind = 0;
  if (cut(/\sпіслязавтра[,]?\s/i)) date = addDays(today(), 2);
  else if (cut(/\sзавтра[,]?\s/i)) date = addDays(today(), 1);
  else if (cut(/\sсьогодні[,]?\s/i)) date = today();
  else {
    const m = cut(/\s(?:в|у|во)?\s?(понеділ\S*|вівтор\S*|серед\S*|четвер\S*|пʼ?ятниц\S*|п'ятниц\S*|субот\S*|неділ\S*)[,]?\s/i);
    if (m) {
      const w = m[1].toLowerCase(); const wd = WEEKDAYS.find(([k]) => w.startsWith(k))?.[1];
      if (wd !== undefined) { let d = new Date(); let n = (wd - d.getDay() + 7) % 7; if (n === 0) n = 7; date = addDays(today(), n); }
    }
  }
  const tm = cut(/\s(?:о|об)\s+(\d{1,2})(?:(?:[:.]|\s)(\d{2}))?(?:\s*год\S*)?[,]?\s/i) || cut(/\s(?:в|у)\s+(\d{1,2})[:.](\d{2})[,]?\s/i) || cut(/\s(\d{1,2})[:.](\d{2})[,]?\s/);
  if (tm) { const h = +tm[1]; const mi = +(tm[2] || 0); if (h < 24 && mi < 60) time = `${pad(h)}:${pad(mi)}`; }
  let title = t.replace(/\s+/g, ' ').trim().replace(/^[,.;:\s-]+|[,.;:\s-]+$/g, '');
  title = title.charAt(0).toUpperCase() + title.slice(1);
  if ((time || remind !== null) && !date) date = baseDate || today();
  if (time && remind === null) remind = 0;
  return { title, date, time, remind_minutes: remind };
}

function voiceTask(preset = {}) {
  const projOpts = projOptions();
  openSheet(`<h2>🎤 Справа голосом</h2>
    <div class="voice-box"><button class="voice-big" id="vBig" aria-label="Говорити">🎤</button>
      <div class="small muted">Натисніть і скажіть, наприклад:<br><b>«Завтра о 10 подзвонити постачальнику»</b></div></div>
    <div class="f"><label>Розпізнаний текст</label><textarea id="vText" placeholder="Тут зʼявиться текст — його можна виправити"></textarea></div>
    <div class="parsed" id="vParsed"></div>
    <div class="f"><label>Проєкт</label><select id="vProj">${Object.entries(projOpts).map(([k, l]) => `<option value="${esc(k)}" ${String(k) === String(preset.project_id || '') ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div>
    <button class="btn" id="vSave">Зберегти справу</button>`, (root) => {
    const ta = $('#vText', root); const big = $('#vBig', root);
    const preview = () => {
      const p = parseTaskText(ta.value);
      $('#vParsed', root).innerHTML = ta.value.trim() ? [
        `<span class="pill">✅ ${esc(p.title || '—')}</span>`,
        p.date ? `<span class="pill gray">📅 ${fDate(p.date)}</span>` : '<span class="pill gray">без дати</span>',
        p.time ? `<span class="pill gray">🕒 ${p.time}</span>` : '',
        p.remind_minutes !== null ? '<span class="pill blue">🔔 нагадаю</span>' : ''
      ].join('') : '';
    };
    ta.addEventListener('input', preview);
    big.addEventListener('click', () => dictate(ta, big, { onFinal: preview }));
    $('#vSave', root).addEventListener('click', async () => {
      const raw = ta.value.trim(); if (!raw) { toast('Скажіть або впишіть справу'); return; }
      const p = parseTaskText(raw);
      const data = { title: p.title || raw, priority: 'low', project_id: $('#vProj', root).value ? Number($('#vProj', root).value) : null };
      if (p.date) data.date = p.date;
      if (p.time) data.time = p.time;
      if (p.remind_minutes !== null) { data.remind_minutes = p.remind_minutes; ensurePushAsked(); }
      await create('tasks', data);
      toast(`Справу додано${p.date ? ' на ' + fDate(p.date) : ''}${p.time ? ' о ' + p.time : ''}`);
      back();
    });
    setTimeout(() => big.click(), 150);
  });
}

/* ================= Налаштування ================= */
async function openSettings() {
  const st = await pushStatus().catch(() => 'unsupported');
  const stLabel = { on: '<span class="pill green">увімкнено</span>', off: '<span class="pill gray">вимкнено</span>', denied: '<span class="pill red">заблоковано в браузері</span>', unsupported: '<span class="pill gray">недоступно</span>' }[st];
  const sound = ls.get('sound', 'chime');
  const theme = ls.get('theme', 'auto');
  openSheet(`
    <h2>⚙️ Налаштування</h2>
    <div class="card flat"><h3>🔔 Сповіщення ${stLabel}</h3>
      <p class="small muted" style="margin:0 0 10px">Нагадування про справи, контакти з лідами, оплати постачальникам і комуналку приходять із сервера, навіть коли додаток закритий.</p>
      ${isIOS() && !isStandalone() ? '<p class="small" style="color:var(--amber);font-weight:700">На iPhone сповіщення працюють лише у встановленому додатку: Safari → Поділитися → «На екран „Додому“».</p>' : ''}
      <div class="btns" style="margin-top:0">${st === 'on' ? '<button class="btn sm sec" id="pTest">Надіслати тест</button><button class="btn sm ghost" id="pOff">Вимкнути</button>' : '<button class="btn sm" id="pOn">Увімкнути на цьому пристрої</button>'}</div>
    </div>
    <div class="card flat"><h3>🎵 Звук нагадування</h3>
      <div class="f" style="margin-bottom:8px"><label>У відкритому додатку</label><div class="row"><select id="snd" class="grow" style="padding:11px;border-radius:12px;border:1.5px solid var(--line);background:var(--surface)">${Object.entries(SOUNDS).map(([k, l]) => `<option value="${k}" ${k === sound ? 'selected' : ''}>${l}</option>`).join('')}</select><button class="btn sm sec" id="sndPlay">▶︎</button></div></div>
      <details class="small muted"><summary style="font-weight:700;cursor:pointer;color:var(--ink-2)">Як поставити власний звук для сповіщень на телефоні</summary>
        <p><b>Android:</b> встановіть додаток (Chrome → ⋮ → «Встановити додаток»). Потім: Налаштування телефону → Програми → <b>Mini CRM</b> → Сповіщення → категорія сповіщень → <b>Звук</b> → оберіть будь-яку мелодію, зокрема свою.</p>
        <p><b>iPhone:</b> iOS використовує системний звук для сповіщень вебзастосунків, змінити його окремо для Mini CRM не можна. Можна ввімкнути «Важливі сповіщення» у Фокусі для Mini CRM, щоб вони пробивалися в режимі «Не турбувати». Вибраний вище звук грає, коли додаток відкритий.</p>
      </details>
    </div>
    <div class="card flat"><h3>🎨 Тема</h3><div class="tog" id="theme">${[['auto', 'Авто'], ['light', 'Світла'], ['dark', 'Темна']].map(([k, l]) => `<button data-v="${k}" class="${theme === k ? 'active' : ''}">${l}</button>`).join('')}</div></div>
    <div class="card flat"><h3>🔐 Обліковий запис</h3>
      <form id="pwd"><div class="f"><label>Поточний пароль</label><input type="password" name="current" autocomplete="current-password"></div>
      <div class="f"><label>Новий пароль (мін. 10 символів)</label><input type="password" name="password" autocomplete="new-password"></div>
      <button class="btn sm sec" type="submit">Змінити пароль</button></form>
    </div>
    <div class="btns"><a class="btn ghost" href="/api/export">⬇️ Резервна копія (JSON)</a><button class="btn danger" id="logout">Вийти</button></div>
    <p class="hint" style="text-align:center">Mini CRM 2.0 · дані зберігаються на вашому сервері</p>
  `, (root) => {
    $('#pOn', root)?.addEventListener('click', async () => { if (await enablePush()) refreshTop(); });
    $('#pOff', root)?.addEventListener('click', async () => { await disablePush(); refreshTop(); });
    $('#pTest', root)?.addEventListener('click', async () => { const r = await api('POST', '/api/push/test'); toast(r.sent ? `Надіслано на пристроїв: ${r.sent}` : 'Немає підписаних пристроїв'); });
    $('#snd', root).addEventListener('change', (e) => { ls.set('sound', e.target.value); playSound(e.target.value); });
    $('#sndPlay', root).addEventListener('click', () => playSound($('#snd', root).value));
    $('#theme', root).addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; ls.set('theme', b.dataset.v); applyTheme(); $$('#theme button', root).forEach((x) => x.classList.toggle('active', x === b)); });
    $('#pwd', root).addEventListener('submit', async (e) => {
      e.preventDefault(); const d = Object.fromEntries(new FormData(e.target).entries());
      await api('POST', '/api/account/password', d); e.target.reset(); toast('Пароль змінено');
    });
    $('#logout', root).addEventListener('click', async () => {
      await fetch('/logout', { method: 'POST', headers: { 'X-CSRF-TOKEN': CSRF }, credentials: 'same-origin' });
      location.href = '/login';
    });
  }, { reopen: openSettings });
}

function applyTheme() {
  const t = ls.get('theme', 'auto');
  if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.dataset.theme = t;
}

/* ================= Старт ================= */
function openUrl(url) {
  const p = new URL(url, location.origin).searchParams;
  const tab = p.get('tab');
  if (tab) go(tab, p.get('sub') ? { sub: p.get('sub') } : {});
  if (p.get('task')) { const t = byId('tasks', p.get('task')); if (t) { if (t.date) { ui.taskDate = t.date; ui.taskView = 'day'; render(); } editTask(t); } }
  if (p.get('lead')) showLead(byId('leads', p.get('lead')));
}

$$('#tabbar button').forEach((b) => b.addEventListener('click', () => go(b.dataset.tab)));
$('#settingsBtn').addEventListener('click', openSettings);
$('#fab').addEventListener('click', fab);
$('#backBtn').addEventListener('click', () => { ui.projectId = null; render(); window.scrollTo(0, 0); });
// Системна кнопка «Назад» (Android, жест у браузері): спершу закриває вікна по одному, потім проєкт
window.addEventListener('popstate', () => {
  if (stack.length) { back(); if (stack.length) history.pushState({ sheet: true }, ''); return; }
  if (ui.projectId) { ui.projectId = null; render(); }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') back(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh().catch(() => {}); });
applyTheme();
['gesturestart', 'gesturechange'].forEach((ev) => document.addEventListener(ev, (e) => e.preventDefault(), { passive: false }));

refresh().then(() => {
  if (location.search) { openUrl(location.href); history.replaceState(null, '', '/'); }
}).catch(() => { $('#view').innerHTML = '<div class="empty"><div class="e">📡</div>Немає звʼязку з сервером.<br><button class="btn sm sec" onclick="location.reload()" style="margin-top:12px">Спробувати ще</button></div>'; });
