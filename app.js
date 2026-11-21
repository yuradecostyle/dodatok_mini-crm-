/* Mini CRM — фінанси, повідомлення, справи, ліди. Дані зберігаються локально на телефоні. */
'use strict';

/* ---------- Сховище ---------- */
const STORE_KEY = 'minicrm.v1';
const DEFAULT_STATE = {
  tx: [],      // фінанси: {id, type:'income'|'expense', amount, category, date, note}
  msgs: [],    // повідомлення: {id, channel, kind, from, contact, text, status, date, due}
  tasks: [],   // справи: {id, title, date, time, priority, done, note, doneAt}
  leads: [],   // ліди: {id, name, contact, request, source, status, amount, date, next, note}
  settings: { currency: '₴', tgToken: '', tgOffset: 0 },
  notified: {} // ключі нагадувань, які вже спрацювали
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const s = JSON.parse(raw);
    return { ...structuredClone(DEFAULT_STATE), ...s, settings: { ...DEFAULT_STATE.settings, ...(s.settings || {}) } };
  } catch (e) {
    return structuredClone(DEFAULT_STATE);
  }
}
let state = loadState();
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
  catch (e) { toast('Не вдалося зберегти дані'); }
  updateBadges();
}

/* ---------- Довідники ---------- */
const EXPENSE_CATS = ['Продукти', 'Транспорт', 'Житло', 'Комуналка', "Зв'язок", 'Кафе', 'Здоровʼя', 'Одяг', 'Розваги', 'Реклама', 'Бізнес', 'Інше'];
const INCOME_CATS = ['Зарплата', 'Клієнти', 'Фріланс', 'Продажі', 'Подарунок', 'Інше'];
const CHANNELS = {
  email: { label: 'Пошта', icon: '✉️' },
  telegram: { label: 'Telegram', icon: '✈️' },
  viber: { label: 'Viber', icon: '📞' }
};
const MSG_KINDS = { personal: 'Особисте', group: 'Група' };
const MSG_STATUS = {
  new: { label: 'Нове', cls: '' },
  reply: { label: 'Відповісти', cls: 'amber' },
  wait: { label: 'Чекаю відповідь', cls: 'gray' },
  done: { label: 'Оброблено', cls: 'green' }
};
const LEAD_SOURCES = ['Instagram', 'Facebook', 'Telegram', 'Viber', 'Email', 'Сайт', 'Google', 'OLX', 'Дзвінок', 'Рекомендація', 'Інше'];
const LEAD_STATUS = {
  new: { label: 'Новий', short: 'Нові', cls: '' },
  work: { label: 'В роботі', short: 'В роботі', cls: 'amber' },
  offer: { label: 'Пропозиція', short: 'Пропоз.', cls: 'amber' },
  won: { label: 'Успішно', short: 'Успіх', cls: 'green' },
  lost: { label: 'Відмова', short: 'Відмова', cls: 'red' }
};
const PRIORITY = { high: 'Високий', mid: 'Середній', low: 'Звичайний' };

/* ---------- Утиліти ---------- */
const $ = (s, el = document) => el.querySelector(s);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const today = () => toISO(new Date());
const addDays = (iso, n) => { const d = fromISO(iso); d.setDate(d.getDate() + n); return toISO(d); };
const nowLocal = () => { const d = new Date(); return `${toISO(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const MONTHS = ['січень', 'лютий', 'березень', 'квітень', 'травень', 'червень', 'липень', 'серпень', 'вересень', 'жовтень', 'листопад', 'грудень'];
const MONTHS_GEN = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];
const DOW = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const DOW_FULL = ['неділя', 'понеділок', 'вівторок', 'середа', 'четвер', "п'ятниця", 'субота'];
const fmtDate = (iso) => { if (!iso) return ''; const d = fromISO(iso.slice(0, 10)); return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`; };
const fmtDateTime = (s) => { if (!s) return ''; const t = s.length > 10 ? ' ' + s.slice(11, 16) : ''; return fmtDate(s) + t; };
const fmtMoney = (n) => (Math.round(n * 100) / 100).toLocaleString('uk-UA', { maximumFractionDigits: 2 }) + ' ' + state.settings.currency;
const weekStart = (iso) => { const d = fromISO(iso); const w = (d.getDay() + 6) % 7; d.setDate(d.getDate() - w); return toISO(d); };
const sum = (arr) => arr.reduce((a, b) => a + b, 0);

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { t.hidden = true; }, 2400);
}

/* ---------- Навігація ---------- */
const ui = {
  tab: 'home',
  finMonth: today().slice(0, 7),
  finFilter: 'all',
  msgChannel: 'all',
  msgStatus: 'open',
  taskView: 'day',
  taskDate: today(),
  leadStatus: 'all',
  leadQuery: ''
};
const TITLES = { home: 'Головна', finance: 'Фінанси', messages: 'Повідомлення', tasks: 'Справи', leads: 'Ліди' };

function go(tab) {
  ui.tab = tab;
  document.querySelectorAll('.tabbar button').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  $('#screenTitle').textContent = TITLES[tab];
  $('#fab').hidden = tab === 'home';
  render();
  window.scrollTo(0, 0);
}

function render() {
  const v = $('#view');
  ({ home: renderHome, finance: renderFinance, messages: renderMessages, tasks: renderTasks, leads: renderLeads })[ui.tab](v);
}

function updateBadges() {
  const m = state.msgs.filter((x) => x.status === 'new' || x.status === 'reply').length;
  const l = state.leads.filter((x) => x.status === 'new').length;
  const mb = $('#msgBadge'), lb = $('#leadBadge');
  mb.hidden = !m; mb.textContent = m;
  lb.hidden = !l; lb.textContent = l;
}

/* ---------- Нижня панель (форми) ---------- */
function openSheet(html, onMount) {
  $('#sheetContent').innerHTML = html;
  $('#sheetBackdrop').hidden = false;
  document.body.style.overflow = 'hidden';
  if (onMount) onMount($('#sheetContent'));
}
function closeSheet() {
  $('#sheetBackdrop').hidden = true;
  $('#sheetContent').innerHTML = '';
  document.body.style.overflow = '';
}

/**
 * Універсальна форма.
 * fields: [{name,label,type:'text'|'number'|'date'|'datetime-local'|'time'|'select'|'textarea'|'toggle', options, required, half}]
 */
function openForm({ title, fields, values = {}, onSave, onDelete, extraHtml = '' }) {
  const fieldHtml = (f) => {
    const val = values[f.name] ?? f.default ?? '';
    const req = f.required ? 'required' : '';
    let input;
    if (f.type === 'select') {
      const opts = Array.isArray(f.options) ? f.options.map((o) => [o, o]) : Object.entries(f.options);
      input = `<select name="${f.name}" ${req}>${opts.map(([k, lbl]) => `<option value="${esc(k)}" ${String(k) === String(val) ? 'selected' : ''}>${esc(typeof lbl === 'object' ? lbl.label : lbl)}</option>`).join('')}</select>`;
    } else if (f.type === 'textarea') {
      input = `<textarea name="${f.name}" ${req} placeholder="${esc(f.placeholder || '')}">${esc(val)}</textarea>`;
    } else if (f.type === 'toggle') {
      const opts = Object.entries(f.options);
      input = `<div class="toggle-group" data-toggle="${f.name}">${opts.map(([k, lbl]) => `<button type="button" data-v="${esc(k)}" class="${k} ${String(k) === String(val) ? 'active' : ''}">${esc(lbl)}</button>`).join('')}</div><input type="hidden" name="${f.name}" value="${esc(val)}">`;
    } else {
      const extra = f.type === 'number' ? 'inputmode="decimal" step="any" min="0"' : '';
      input = `<input type="${f.type || 'text'}" name="${f.name}" value="${esc(val)}" ${req} ${extra} placeholder="${esc(f.placeholder || '')}">`;
    }
    return `<div class="field"><label>${esc(f.label)}</label>${input}</div>`;
  };
  // групуємо half-поля попарно
  let body = '';
  for (let i = 0; i < fields.length; i++) {
    const f = fields[i];
    if (f.half && fields[i + 1]?.half) { body += `<div class="field-row">${fieldHtml(f)}${fieldHtml(fields[i + 1])}</div>`; i++; }
    else body += fieldHtml(f);
  }
  openSheet(`
    <h2>${esc(title)}</h2>
    <form id="sheetForm" novalidate>
      ${body}
      ${extraHtml}
      <button class="btn" type="submit">Зберегти</button>
      ${onDelete ? '<button class="btn danger" type="button" id="delBtn">Видалити</button>' : ''}
    </form>`, (root) => {
    root.querySelectorAll('[data-toggle]').forEach((g) => {
      g.addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (!b) return;
        g.querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === b));
        const hidden = root.querySelector(`input[name="${g.dataset.toggle}"]`);
        hidden.value = b.dataset.v;
        hidden.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
    const form = $('#sheetForm', root);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      for (const f of fields) {
        if (f.required && !String(data[f.name] || '').trim()) { toast(`Заповніть поле «${f.label}»`); return; }
        if (f.type === 'number') data[f.name] = data[f.name] === '' ? 0 : parseFloat(String(data[f.name]).replace(',', '.')) || 0;
        if (typeof data[f.name] === 'string') data[f.name] = data[f.name].trim();
      }
      if (onSave(data) === false) return;
      save(); closeSheet(); render();
    });
    if (onDelete) $('#delBtn', root).addEventListener('click', () => {
      if (confirm('Видалити запис?')) { onDelete(); save(); closeSheet(); render(); toast('Видалено'); }
    });
    if (fields._onMount) fields._onMount(root);
    const first = root.querySelector('input:not([type=hidden]), textarea');
    if (first && !values.id && window.innerWidth > 700) first.focus();
  });
}

/* ================= ГОЛОВНА ================= */
function renderHome(v) {
  const t = today();
  const month = t.slice(0, 7);
  const monthTx = state.tx.filter((x) => x.date.startsWith(month));
  const inc = sum(monthTx.filter((x) => x.type === 'income').map((x) => x.amount));
  const exp = sum(monthTx.filter((x) => x.type === 'expense').map((x) => x.amount));
  const balance = sum(state.tx.map((x) => (x.type === 'income' ? x.amount : -x.amount)));
  const todays = state.tasks.filter((x) => x.date === t).sort(taskSort);
  const doneCnt = todays.filter((x) => x.done).length;
  const overdue = state.tasks.filter((x) => !x.done && x.date < t);
  const openMsgs = state.msgs.filter((x) => x.status === 'new' || x.status === 'reply');
  const newLeads = state.leads.filter((x) => x.status === 'new');
  const activeLeads = state.leads.filter((x) => ['new', 'work', 'offer'].includes(x.status));
  const d = new Date();

  v.innerHTML = `
    <p class="hint" style="margin-top:0">Сьогодні ${DOW_FULL[d.getDay()]}, ${d.getDate()} ${MONTHS_GEN[d.getMonth()]}</p>
    <div class="balance-card">
      <div class="label">Загальний баланс</div>
      <div class="value">${fmtMoney(balance)}</div>
      <div class="row">
        <div>Доходи за ${MONTHS[d.getMonth()]}<b>+${fmtMoney(inc)}</b></div>
        <div>Витрати<b>−${fmtMoney(exp)}</b></div>
      </div>
    </div>

    <div class="grid2">
      <div class="stat clickable" data-go="messages"><div class="label">💬 Без відповіді</div><div class="value">${openMsgs.length}</div></div>
      <div class="stat clickable" data-go="leads"><div class="label">🎯 Нові ліди</div><div class="value">${newLeads.length}<span class="hint" style="font-size:13px;font-weight:500"> / ${activeLeads.length} активних</span></div></div>
    </div>

    <div class="section-title">Справи на сьогодні <button class="link" data-go="tasks">Усі →</button></div>
    <div class="card" style="padding-bottom:6px">
      <div class="progress-row"><span>Виконано ${doneCnt} з ${todays.length}</span><span>${todays.length ? Math.round(doneCnt / todays.length * 100) : 0}%</span></div>
      <div class="progress"><div style="width:${todays.length ? doneCnt / todays.length * 100 : 0}%"></div></div>
      ${overdue.length ? `<p class="hint" style="color:var(--red);margin-bottom:0">⚠️ Прострочених справ: ${overdue.length}</p>` : ''}
    </div>
    <div class="list">${todays.length ? todays.slice(0, 6).map(taskHtml).join('') : '<div class="empty">На сьогодні справ немає 🎉</div>'}</div>

    ${openMsgs.length ? `
      <div class="section-title">Потребують відповіді <button class="link" data-go="messages">Усі →</button></div>
      <div class="list">${openMsgs.slice(0, 4).map(msgHtml).join('')}</div>` : ''}

    ${newLeads.length ? `
      <div class="section-title">Нові запити <button class="link" data-go="leads">Усі →</button></div>
      <div class="list">${newLeads.slice(0, 4).map(leadHtml).join('')}</div>` : ''}
  `;
  bindCommon(v);
}

function bindCommon(v) {
  v.querySelectorAll('[data-go]').forEach((el) => el.addEventListener('click', () => go(el.dataset.go)));
  v.querySelectorAll('[data-check]').forEach((el) => el.addEventListener('click', (e) => { e.stopPropagation(); toggleTask(el.dataset.check); }));
  v.querySelectorAll('[data-task]').forEach((el) => el.addEventListener('click', () => editTask(state.tasks.find((x) => x.id === el.dataset.task))));
  v.querySelectorAll('[data-msg]').forEach((el) => el.addEventListener('click', () => showMsg(el.dataset.msg)));
  v.querySelectorAll('[data-lead]').forEach((el) => el.addEventListener('click', () => showLead(el.dataset.lead)));
  v.querySelectorAll('[data-tx]').forEach((el) => el.addEventListener('click', () => editTx(state.tx.find((x) => x.id === el.dataset.tx))));
}

/* ================= ФІНАНСИ ================= */
function renderFinance(v) {
  const [y, m] = ui.finMonth.split('-').map(Number);
  const monthTx = state.tx.filter((x) => x.date.startsWith(ui.finMonth)).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const inc = sum(monthTx.filter((x) => x.type === 'income').map((x) => x.amount));
  const exp = sum(monthTx.filter((x) => x.type === 'expense').map((x) => x.amount));
  const shown = ui.finFilter === 'all' ? monthTx : monthTx.filter((x) => x.type === ui.finFilter);

  const byCat = {};
  monthTx.filter((x) => x.type === 'expense').forEach((x) => { byCat[x.category] = (byCat[x.category] || 0) + x.amount; });
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const maxCat = cats[0]?.[1] || 1;

  // групування за днями
  const groups = {};
  shown.forEach((x) => { (groups[x.date] ||= []).push(x); });

  v.innerHTML = `
    <div class="navrow">
      <button class="navbtn" data-m="-1">‹</button>
      <div class="period">${MONTHS[m - 1][0].toUpperCase() + MONTHS[m - 1].slice(1)} ${y}</div>
      <button class="navbtn" data-m="1">›</button>
    </div>
    <div class="grid2">
      <div class="stat"><div class="label">Доходи</div><div class="value" style="color:var(--green)">+${fmtMoney(inc)}</div></div>
      <div class="stat"><div class="label">Витрати</div><div class="value" style="color:var(--red)">−${fmtMoney(exp)}</div></div>
    </div>
    <div class="card" style="margin-top:12px">
      <div class="progress-row"><span>Залишок за місяць</span><b style="color:${inc - exp >= 0 ? 'var(--green)' : 'var(--red)'}">${fmtMoney(inc - exp)}</b></div>
    </div>

    ${cats.length ? `<div class="section-title">Витрати за категоріями</div>
    <div class="card">${cats.map(([c, a]) => `
      <div class="bar-row"><div class="top"><span>${esc(c)}</span><b>${fmtMoney(a)} <span class="hint">· ${Math.round(a / exp * 100)}%</span></b></div>
      <div class="bar"><div style="width:${a / maxCat * 100}%"></div></div></div>`).join('')}</div>` : ''}

    <div class="section-title">Операції</div>
    <div class="segmented">
      ${[['all', 'Усі'], ['income', 'Доходи'], ['expense', 'Витрати']].map(([k, l]) => `<button data-f="${k}" class="${ui.finFilter === k ? 'active' : ''}">${l}</button>`).join('')}
    </div>
    ${Object.keys(groups).length ? Object.entries(groups).map(([d, list]) => `
      <div class="section-title" style="margin-top:12px">${fmtDate(d)}</div>
      <div class="list">${list.map(txHtml).join('')}</div>`).join('')
    : '<div class="empty"><div class="big">💰</div>Операцій ще немає.<br>Натисніть «＋», щоб додати дохід чи витрату.</div>'}
  `;
  v.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => {
    const d = new Date(y, m - 1 + Number(b.dataset.m), 1);
    ui.finMonth = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; render();
  }));
  v.querySelectorAll('[data-f]').forEach((b) => b.addEventListener('click', () => { ui.finFilter = b.dataset.f; render(); }));
  bindCommon(v);
}

function txHtml(x) {
  const plus = x.type === 'income';
  return `<div class="item clickable" data-tx="${x.id}">
    <div class="avatar">${plus ? '⬇️' : '⬆️'}</div>
    <div class="main"><div class="title">${esc(x.category)}</div><div class="sub">${esc(x.note || (plus ? 'Дохід' : 'Витрата'))}</div></div>
    <div class="right amount ${plus ? 'plus' : 'minus'}">${plus ? '+' : '−'}${fmtMoney(x.amount)}</div>
  </div>`;
}

function editTx(x) {
  const isNew = !x;
  x = x || { type: 'expense', date: today(), category: EXPENSE_CATS[0] };
  const fields = [
    { name: 'type', label: 'Тип', type: 'toggle', options: { expense: 'Витрата', income: 'Дохід' } },
    { name: 'amount', label: `Сума, ${state.settings.currency}`, type: 'number', required: true, half: true },
    { name: 'date', label: 'Дата', type: 'date', required: true, half: true },
    { name: 'category', label: 'Категорія', type: 'select', options: x.type === 'income' ? INCOME_CATS : EXPENSE_CATS },
    { name: 'note', label: 'Коментар', placeholder: 'Напр.: оплата від клієнта' }
  ];
  fields._onMount = (root) => {
    root.querySelector('input[name=type]').addEventListener('change', (e) => {
      const list = e.target.value === 'income' ? INCOME_CATS : EXPENSE_CATS;
      root.querySelector('select[name=category]').innerHTML = list.map((c) => `<option>${esc(c)}</option>`).join('');
    });
  };
  openForm({
    title: isNew ? 'Нова операція' : 'Операція',
    fields, values: x,
    onSave: (d) => {
      if (d.amount <= 0) { toast('Сума має бути більшою за 0'); return false; }
      if (isNew) state.tx.push({ id: uid(), ...d }); else Object.assign(x, d);
      toast('Збережено');
    },
    onDelete: isNew ? null : () => { state.tx = state.tx.filter((t) => t.id !== x.id); }
  });
}

/* ================= ПОВІДОМЛЕННЯ ================= */
function renderMessages(v) {
  let list = state.msgs.slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  if (ui.msgChannel !== 'all') list = list.filter((x) => x.channel === ui.msgChannel);
  if (ui.msgStatus === 'open') list = list.filter((x) => x.status !== 'done');
  else if (ui.msgStatus !== 'all') list = list.filter((x) => x.status === ui.msgStatus);

  const cnt = (ch) => state.msgs.filter((x) => (ch === 'all' || x.channel === ch) && x.status !== 'done').length;

  v.innerHTML = `
    <div class="chips">
      ${[['all', 'Усі канали'], ...Object.entries(CHANNELS).map(([k, c]) => [k, c.icon + ' ' + c.label])].map(([k, l]) =>
        `<button class="chip ${ui.msgChannel === k ? 'active' : ''}" data-ch="${k}">${l} · ${cnt(k)}</button>`).join('')}
    </div>
    <div class="segmented">
      ${[['open', 'Активні'], ['reply', 'Відповісти'], ['wait', 'Чекаю'], ['all', 'Усі']].map(([k, l]) => `<button data-st="${k}" class="${ui.msgStatus === k ? 'active' : ''}">${l}</button>`).join('')}
    </div>
    ${state.settings.tgToken ? `<button class="btn secondary" id="tgSync" style="margin:0 0 12px">✈️ Завантажити нові з Telegram-бота</button>` : ''}
    <div class="list">${list.length ? list.map(msgHtml).join('') : '<div class="empty"><div class="big">📭</div>Тут порожньо.<br>Додавайте важливі повідомлення з пошти, Telegram та Viber, щоб нічого не загубити.</div>'}</div>
    <p class="hint">Порада: підключіть Telegram-бота в ⚙️ Налаштуваннях — повідомлення з груп, куди доданий бот, підтягуватимуться автоматично.</p>
  `;
  v.querySelectorAll('[data-ch]').forEach((b) => b.addEventListener('click', () => { ui.msgChannel = b.dataset.ch; render(); }));
  v.querySelectorAll('[data-st]').forEach((b) => b.addEventListener('click', () => { ui.msgStatus = b.dataset.st; render(); }));
  const sync = $('#tgSync', v); if (sync) sync.addEventListener('click', syncTelegram);
  bindCommon(v);
}

function msgHtml(x) {
  const ch = CHANNELS[x.channel] || CHANNELS.email;
  const st = MSG_STATUS[x.status] || MSG_STATUS.new;
  const overdue = x.due && x.status !== 'done' && x.due < nowLocal();
  return `<div class="item clickable ${x.status === 'new' ? 'unread' : ''}" data-msg="${x.id}">
    <div class="avatar av-${x.channel}">${ch.icon}</div>
    <div class="main">
      <div class="title">${esc(x.from || 'Без імені')}</div>
      <div class="sub wrap">${esc(x.text)}</div>
      <div class="sub tags">${x.kind === 'group' ? '<span class="pill gray">Група</span> ' : ''}<span class="pill ${st.cls}">${st.label}</span>${x.due ? ` <span class="pill ${overdue ? 'red' : 'gray'}">⏰ ${fmtDateTime(x.due)}</span>` : ''}</div>
    </div>
    <div class="right sub">${fmtDate(x.date)}</div>
  </div>`;
}

function msgLink(x) {
  const c = (x.contact || '').trim();
  if (!c) return null;
  if (x.channel === 'email') return { href: `mailto:${encodeURIComponent(c)}`, label: 'Написати листа' };
  if (x.channel === 'telegram') {
    if (/^https?:\/\//.test(c)) return { href: c, label: 'Відкрити в Telegram' };
    if (/^\+?\d[\d\s-]{6,}$/.test(c)) return { href: `https://t.me/+${c.replace(/\D/g, '')}`, label: 'Відкрити в Telegram' };
    return { href: `https://t.me/${encodeURIComponent(c.replace(/^@/, ''))}`, label: 'Відкрити в Telegram' };
  }
  if (x.channel === 'viber') return { href: `viber://chat?number=%2B${c.replace(/\D/g, '')}`, label: 'Відкрити у Viber' };
  return null;
}

function showMsg(id) {
  const x = state.msgs.find((m) => m.id === id); if (!x) return;
  if (x.status === 'new') { x.status = 'reply'; save(); render(); }
  const ch = CHANNELS[x.channel];
  const link = msgLink(x);
  openSheet(`
    <h2>${ch.icon} ${esc(x.from || 'Без імені')}</h2>
    <div class="meta">
      <span class="pill">${ch.label}</span><span class="pill gray">${MSG_KINDS[x.kind] || ''}</span>
      <span class="pill gray">${fmtDateTime(x.date)}</span>
      ${x.due ? `<span class="pill amber">⏰ відповісти до ${fmtDateTime(x.due)}</span>` : ''}
    </div>
    <div class="detail-text">${esc(x.text) || '<span class="hint">Без тексту</span>'}</div>
    <div class="field"><label>Статус</label>
      <div class="toggle-group" id="msgSt">${Object.entries(MSG_STATUS).map(([k, s]) => `<button type="button" data-v="${k}" class="${x.status === k ? 'active' : ''}" style="font-size:12px;padding:8px 2px">${s.label}</button>`).join('')}</div>
    </div>
    ${link ? `<a class="btn" href="${esc(link.href)}" target="_blank" rel="noopener">${link.label}</a>` : ''}
    <div class="btn-row" style="margin-top:8px">
      <button class="btn secondary" id="toLead">🎯 У ліди</button>
      <button class="btn secondary" id="toTask">✅ У справи</button>
    </div>
    <div class="btn-row" style="margin-top:8px">
      <button class="btn secondary" id="editMsg">Редагувати</button>
      <button class="btn danger" id="delMsg">Видалити</button>
    </div>
  `, (root) => {
    $('#msgSt', root).addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      x.status = b.dataset.v; save(); render(); closeSheet(); toast(`Статус: ${MSG_STATUS[x.status].label}`);
    });
    $('#toLead', root).addEventListener('click', () => {
      const src = { email: 'Email', telegram: 'Telegram', viber: 'Viber' }[x.channel];
      editLead(null, { name: x.from, contact: x.contact, request: x.text, source: src });
    });
    $('#toTask', root).addEventListener('click', () => {
      editTask(null, { title: `Відповісти: ${x.from || ch.label}`, note: x.text, date: x.due ? x.due.slice(0, 10) : today(), time: x.due ? x.due.slice(11, 16) : '' });
    });
    $('#editMsg', root).addEventListener('click', () => editMsg(x));
    $('#delMsg', root).addEventListener('click', () => {
      if (confirm('Видалити повідомлення?')) { state.msgs = state.msgs.filter((m) => m.id !== x.id); save(); closeSheet(); render(); }
    });
  });
}

function editMsg(x) {
  const isNew = !x;
  x = x || { channel: ui.msgChannel !== 'all' ? ui.msgChannel : 'telegram', kind: 'personal', status: 'reply', date: nowLocal() };
  openForm({
    title: isNew ? 'Нове повідомлення' : 'Редагувати повідомлення',
    fields: [
      { name: 'channel', label: 'Канал', type: 'toggle', options: Object.fromEntries(Object.entries(CHANNELS).map(([k, c]) => [k, c.icon + ' ' + c.label])) },
      { name: 'kind', label: 'Тип чату', type: 'toggle', options: MSG_KINDS },
      { name: 'from', label: 'Від кого / назва групи', required: true, placeholder: 'Олена / Група «Клієнти»' },
      { name: 'contact', label: 'Контакт (email, @username або телефон)', placeholder: '@username, +380…, name@mail.com' },
      { name: 'text', label: 'Суть повідомлення', type: 'textarea', placeholder: 'Що потрібно зробити або відповісти' },
      { name: 'status', label: 'Статус', type: 'select', options: Object.fromEntries(Object.entries(MSG_STATUS).map(([k, s]) => [k, s.label])), half: true },
      { name: 'date', label: 'Отримано', type: 'datetime-local', half: true },
      { name: 'due', label: 'Нагадати / відповісти до', type: 'datetime-local' }
    ],
    values: x,
    onSave: (d) => { if (isNew) state.msgs.push({ id: uid(), ...d }); else Object.assign(x, d); toast('Збережено'); },
    onDelete: isNew ? null : () => { state.msgs = state.msgs.filter((m) => m.id !== x.id); }
  });
}

/* Telegram Bot API: отримуємо повідомлення, які бачить бот (особисті повідомлення боту та групи, куди його додано). */
async function syncTelegram() {
  const token = state.settings.tgToken;
  if (!token) { toast('Додайте токен бота в Налаштуваннях'); return; }
  toast('Завантаження…');
  try {
    const url = `https://api.telegram.org/bot${encodeURIComponent(token)}/getUpdates?timeout=0&offset=${state.settings.tgOffset || 0}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.ok) throw new Error(data.description || 'Помилка Telegram');
    let added = 0;
    for (const u of data.result) {
      state.settings.tgOffset = u.update_id + 1;
      const m = u.message || u.channel_post || u.edited_message;
      if (!m) continue;
      const isGroup = m.chat && m.chat.type !== 'private';
      const author = m.from ? [m.from.first_name, m.from.last_name].filter(Boolean).join(' ') : '';
      const from = isGroup ? `${m.chat.title}${author ? ' — ' + author : ''}` : author || m.chat.username || 'Telegram';
      const contact = isGroup ? (m.chat.username ? '@' + m.chat.username : '') : (m.from?.username ? '@' + m.from.username : '');
      const d = new Date(m.date * 1000);
      state.msgs.push({
        id: uid(), channel: 'telegram', kind: isGroup ? 'group' : 'personal', from, contact,
        text: m.text || m.caption || '[медіа]', status: 'new',
        date: `${toISO(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`, due: ''
      });
      added++;
    }
    save(); render();
    toast(added ? `Додано повідомлень: ${added}` : 'Нових повідомлень немає');
  } catch (e) {
    toast('Telegram: ' + e.message);
  }
}

/* ================= СПРАВИ ================= */
const taskSort = (a, b) => (a.done - b.done) || ((a.time || '99') .localeCompare(b.time || '99')) || ({ high: 0, mid: 1, low: 2 }[a.priority] - { high: 0, mid: 1, low: 2 }[b.priority]);

function taskHtml(x) {
  const overdue = !x.done && x.date < today();
  return `<div class="task prio-${x.priority || 'low'} ${x.done ? 'done' : ''}">
    <button class="check ${x.done ? 'on' : ''}" data-check="${x.id}" aria-label="Виконано">${x.done ? '✓' : ''}</button>
    <div class="main" data-task="${x.id}">
      <div class="title">${esc(x.title)}</div>
      ${(x.time || x.note || overdue || x.priority === 'high' || remindAt(x)) ? `<div class="sub">
        ${x.time ? `<span>🕒 ${esc(x.time)}</span>` : ''}
        ${remindAt(x) ? `<span class="pill">🔔 ${x.snoozeUntil ? 'відкладено до ' + fmtClock(remindAt(x)) : (x.date === today() || x.remind === '1440' ? fmtClock(remindAt(x)) : REMIND[x.remind])}</span>` : ''}
        ${overdue ? `<span class="pill red">прострочено · ${fmtDate(x.date)}</span>` : ''}
        ${x.priority === 'high' ? '<span class="pill red">важливо</span>' : ''}
        ${x.note ? `<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%">${esc(x.note)}</span>` : ''}
      </div>` : ''}
    </div>
  </div>`;
}

function toggleTask(id) {
  const x = state.tasks.find((t) => t.id === id); if (!x) return;
  x.done = !x.done;
  x.doneAt = x.done ? new Date().toISOString() : null;
  x.snoozeUntil = null;
  save(); render();
  if (x.done && navigator.vibrate) navigator.vibrate(15);
}

function renderTasks(v) {
  const views = [['day', 'День'], ['week', 'Тиждень'], ['month', 'Місяць']];
  let head = `<div class="segmented">${views.map(([k, l]) => `<button data-tv="${k}" class="${ui.taskView === k ? 'active' : ''}">${l}</button>`).join('')}</div>`;
  let body = '';
  const t = today();
  const d = fromISO(ui.taskDate);

  if (ui.taskView === 'day') {
    const list = state.tasks.filter((x) => x.date === ui.taskDate).sort(taskSort);
    const done = list.filter((x) => x.done).length;
    const overdue = ui.taskDate === t ? state.tasks.filter((x) => !x.done && x.date < t).sort((a, b) => a.date.localeCompare(b.date)) : [];
    head += navRow(`${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`, ui.taskDate === t ? 'сьогодні' : DOW_FULL[d.getDay()]);
    head += remindersBlock();
    body = `
      <div class="card"><div class="progress-row"><span>Виконано ${done} з ${list.length}</span><span>${list.length ? Math.round(done / list.length * 100) : 0}%</span></div>
      <div class="progress"><div style="width:${list.length ? done / list.length * 100 : 0}%"></div></div></div>
      <div class="list">${list.length ? list.map(taskHtml).join('') : '<div class="empty"><div class="big">🗓️</div>Справ на цей день немає</div>'}</div>
      ${overdue.length ? `<div class="section-title">Прострочені <button class="link" id="moveOverdue">Перенести на сьогодні</button></div><div class="list">${overdue.map(taskHtml).join('')}</div>` : ''}
      ${list.some((x) => !x.done) && ui.taskDate <= t ? '<button class="btn secondary" id="moveUndone" style="margin-top:12px">Перенести невиконані на завтра</button>' : ''}`;
  } else if (ui.taskView === 'week') {
    const ws = weekStart(ui.taskDate);
    const we = addDays(ws, 6);
    const weekTasks = state.tasks.filter((x) => x.date >= ws && x.date <= we);
    const done = weekTasks.filter((x) => x.done).length;
    head += navRow(`${fmtDate(ws)} – ${fmtDate(we)}`, `виконано ${done}/${weekTasks.length}`);
    body = `<div class="board" id="board">${Array.from({ length: 7 }, (_, i) => {
      const day = addDays(ws, i);
      const dd = fromISO(day);
      const list = weekTasks.filter((x) => x.date === day).sort(taskSort);
      const dn = list.filter((x) => x.done).length;
      return `<div class="column ${day === t ? 'today' : ''}" ${day === t ? 'id="todayCol"' : ''}>
        <div class="column-head"><div><b>${DOW_FULL[dd.getDay()]}</b> <span class="hint">${dd.getDate()}.${pad(dd.getMonth() + 1)}${list.length ? ` · ${dn}/${list.length}` : ''}</span></div>
        <button class="add" data-addday="${day}">＋</button></div>
        ${list.length ? list.map(taskHtml).join('') : '<div class="empty">—</div>'}
      </div>`;
    }).join('')}</div>`;
  } else {
    const y = d.getFullYear(), m = d.getMonth();
    const first = new Date(y, m, 1);
    const start = weekStart(toISO(first));
    const monthKey = `${y}-${pad(m + 1)}`;
    const mt = state.tasks.filter((x) => x.date.startsWith(monthKey));
    const done = mt.filter((x) => x.done).length;
    head += navRow(`${MONTHS[m][0].toUpperCase() + MONTHS[m].slice(1)} ${y}`, `виконано ${done}/${mt.length}`);
    let cells = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map((x) => `<div class="dow">${x}</div>`).join('');
    for (let i = 0; i < 42; i++) {
      const day = addDays(start, i);
      if (i === 35 && !day.startsWith(monthKey)) break;
      const list = state.tasks.filter((x) => x.date === day);
      const dn = list.filter((x) => x.done).length;
      const cls = !list.length ? '' : dn === list.length ? 'all' : (day < t ? 'none' : 'part');
      cells += `<button class="day ${day.startsWith(monthKey) ? '' : 'other'} ${day === t ? 'today' : ''}" data-day="${day}">
        <span class="n">${fromISO(day).getDate()}</span>
        ${list.length ? `<span class="cnt ${cls}">${dn}/${list.length}</span>` : ''}
      </button>`;
    }
    body = `<div class="month">${cells}</div>
      <div class="card" style="margin-top:12px"><div class="progress-row"><span>Прогрес місяця</span><span>${mt.length ? Math.round(done / mt.length * 100) : 0}%</span></div>
      <div class="progress"><div style="width:${mt.length ? done / mt.length * 100 : 0}%"></div></div></div>
      <p class="hint">Натисніть на день, щоб побачити та відмітити справи.</p>`;
  }

  v.innerHTML = head + body;
  v.querySelectorAll('[data-tv]').forEach((b) => b.addEventListener('click', () => { ui.taskView = b.dataset.tv; render(); }));
  v.querySelectorAll('[data-nav]').forEach((b) => b.addEventListener('click', () => {
    const n = Number(b.dataset.nav);
    if (ui.taskView === 'day') ui.taskDate = addDays(ui.taskDate, n);
    else if (ui.taskView === 'week') ui.taskDate = addDays(ui.taskDate, 7 * n);
    else { const x = fromISO(ui.taskDate); ui.taskDate = toISO(new Date(x.getFullYear(), x.getMonth() + n, 1)); }
    render();
  }));
  const todayBtn = $('[data-today]', v); if (todayBtn) todayBtn.addEventListener('click', () => { ui.taskDate = today(); render(); });
  v.querySelectorAll('[data-addday]').forEach((b) => b.addEventListener('click', () => editTask(null, { date: b.dataset.addday })));
  v.querySelectorAll('[data-day]').forEach((b) => b.addEventListener('click', () => { ui.taskDate = b.dataset.day; ui.taskView = 'day'; render(); }));
  const mo = $('#moveOverdue', v);
  if (mo) mo.addEventListener('click', () => { state.tasks.forEach((x) => { if (!x.done && x.date < t) x.date = t; }); save(); render(); toast('Перенесено на сьогодні'); });
  const mu = $('#moveUndone', v);
  if (mu) mu.addEventListener('click', () => {
    const tomorrow = addDays(ui.taskDate, 1);
    state.tasks.forEach((x) => { if (!x.done && x.date === ui.taskDate) x.date = tomorrow; });
    save(); render(); toast('Перенесено на завтра');
  });
  v.querySelectorAll('[data-notify]').forEach((b) => b.addEventListener('click', askNotifyPermission));
  bindCommon(v);
  const tc = $('#todayCol', v); if (tc) $('#board', v).scrollLeft = tc.offsetLeft - 16;
}

function remindersBlock() {
  const hasAny = state.tasks.some((x) => remindAt(x));
  const perm = 'Notification' in window ? Notification.permission : 'unsupported';
  let html = '';
  if (hasAny && perm === 'default') html += `<div class="card" style="display:flex;gap:10px;align-items:center"><div style="flex:1">🔔 Дозвольте сповіщення, щоб отримувати нагадування про справи</div><button class="btn small" data-notify>Увімкнути</button></div>`;
  if (hasAny && perm === 'denied') html += '<p class="hint" style="color:var(--red)">Сповіщення заблоковані в налаштуваннях браузера — нагадування показуватимуться лише у відкритому додатку.</p>';
  const up = upcomingReminders(24);
  if (up.length) html += `<div class="card"><h3>🔔 Найближчі нагадування</h3>${up.slice(0, 5).map(({ t, at }) =>
    `<div class="progress-row" style="margin:6px 0;cursor:pointer" data-task="${t.id}"><span style="color:var(--text)">${esc(t.title)}</span><b>${at.toDateString() === new Date().toDateString() ? '' : fmtDate(toISO(at)) + ' '}${fmtClock(at)}</b></div>`).join('')}</div>`;
  return html;
}

function navRow(title, sub) {
  return `<div class="navrow">
    <button class="navbtn" data-nav="-1">‹</button>
    <div class="period" data-today style="cursor:pointer">${title}<small>${sub}</small></div>
    <button class="navbtn" data-nav="1">›</button>
  </div>`;
}

const REMIND = { '': 'Без нагадування', 0: 'У момент справи', 5: 'За 5 хвилин', 15: 'За 15 хвилин', 30: 'За 30 хвилин', 60: 'За 1 годину', 120: 'За 2 години', 1440: 'За 1 день' };

/* ---------- Нагадування для справ ---------- */
function remindAt(t) {
  if (t.remind === '' || t.remind == null || t.done) return null;
  const [h, m] = (t.time || '09:00').split(':').map(Number);
  const d = fromISO(t.date); d.setHours(h, m, 0, 0);
  if (t.snoozeUntil) return new Date(t.snoozeUntil);
  return new Date(d.getTime() - Number(t.remind) * 60000);
}
const remindKey = (t, at) => `${t.id}@${at.getTime()}`;
const fmtClock = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

function upcomingReminders(hours = 24) {
  const now = Date.now(), until = now + hours * 3600000;
  return state.tasks.map((t) => ({ t, at: remindAt(t) }))
    .filter((r) => r.at && r.at.getTime() >= now && r.at.getTime() <= until)
    .sort((a, b) => a.at - b.at);
}

async function askNotifyPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const r = await Notification.requestPermission();
  if (r === 'granted') toast('🔔 Сповіщення увімкнено');
  render();
  return r === 'granted';
}

async function notify(title, body, tag) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const opts = { body, tag, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', vibrate: [200, 100, 200], requireInteraction: true, data: { tab: 'tasks' } };
  try {
    const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
    if (reg) { await reg.showNotification(title, opts); return; }
  } catch (e) { /* fallback нижче */ }
  try { new Notification(title, opts); } catch (e) { /* ignore */ }
}

function checkReminders() {
  const now = Date.now();
  const due = [];
  for (const t of state.tasks) {
    const at = remindAt(t);
    if (!at) continue;
    const key = remindKey(t, at);
    // спрацьовує, якщо час настав, але не пізніше ніж 12 год тому
    if (at.getTime() <= now && at.getTime() > now - 12 * 3600000 && !state.notified[key]) {
      state.notified[key] = now;
      due.push(t);
    }
  }
  // прибираємо старі записи
  for (const [k, v] of Object.entries(state.notified)) if (v < now - 7 * 86400000) delete state.notified[k];
  if (!due.length) return;
  save();
  due.forEach((t) => notify(`🔔 ${t.title}`, `${t.time ? 'О ' + t.time + ' · ' : ''}${fmtDate(t.date)}${t.note ? '\n' + t.note : ''}`, 'task-' + t.id));
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  showReminderSheet(due);
}

function showReminderSheet(list) {
  if (!$('#sheetBackdrop').hidden) return; // не перебиваємо відкриту форму — є системне сповіщення
  openSheet(`
    <h2>🔔 Нагадування</h2>
    ${list.map((t) => `<div class="card" style="box-shadow:none;background:var(--bg)">
      <div style="font-weight:700;font-size:17px">${esc(t.title)}</div>
      <div class="hint" style="margin:4px 0 10px">${t.time ? '🕒 ' + esc(t.time) + ' · ' : ''}${fmtDate(t.date)}${t.note ? '<br>' + esc(t.note) : ''}</div>
      <div class="btn-row">
        <button class="btn small" data-rdone="${t.id}">✓ Виконано</button>
        <button class="btn small secondary" data-rsnooze="${t.id}" data-min="10">+10 хв</button>
        <button class="btn small secondary" data-rsnooze="${t.id}" data-min="60">+1 год</button>
      </div></div>`).join('')}
    <button class="btn secondary" id="rClose">Закрити</button>
  `, (root) => {
    const finish = (id) => { const c = root.querySelector(`[data-rdone="${id}"]`)?.closest('.card'); if (c) c.remove(); if (!root.querySelector('.card')) closeSheet(); };
    root.querySelectorAll('[data-rdone]').forEach((b) => b.addEventListener('click', () => {
      const t = state.tasks.find((x) => x.id === b.dataset.rdone);
      if (t) { t.done = true; t.doneAt = new Date().toISOString(); t.snoozeUntil = null; save(); render(); }
      finish(b.dataset.rdone);
    }));
    root.querySelectorAll('[data-rsnooze]').forEach((b) => b.addEventListener('click', () => {
      const t = state.tasks.find((x) => x.id === b.dataset.rsnooze);
      if (t) { t.snoozeUntil = Date.now() + Number(b.dataset.min) * 60000; save(); render(); toast(`Нагадаю о ${fmtClock(new Date(t.snoozeUntil))}`); }
      finish(b.dataset.rsnooze);
    }));
    $('#rClose', root).addEventListener('click', closeSheet);
  });
}

/* Файл .ics — подія з будильником у системному календарі (спрацює, навіть коли додаток закрито) */
function downloadIcs(t) {
  const [h, m] = (t.time || '09:00').split(':').map(Number);
  const start = fromISO(t.date); start.setHours(h, m, 0, 0);
  const end = new Date(start.getTime() + 30 * 60000);
  const f = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const txt = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/[,;]/g, (c) => '\\' + c).replace(/\n/g, '\\n');
  const mins = t.remind === '' || t.remind == null ? 15 : Number(t.remind);
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MiniCRM//UK', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
    `UID:${t.id}@minicrm`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(start)}`, `DTEND:${f(end)}`,
    `SUMMARY:${txt(t.title)}`, t.note ? `DESCRIPTION:${txt(t.note)}` : '',
    'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${txt(t.title)}`, `TRIGGER:-PT${mins}M`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR'
  ].filter(Boolean).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  a.download = `${t.title.slice(0, 40).replace(/[^\p{L}\d ]/gu, '') || 'sprava'}.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast('Відкрийте файл, щоб додати в календар');
}

const REPEAT = { none: 'Не повторювати', daily: 'Щодня (7 днів)', weekdays: 'Будні (2 тижні)', weekly: 'Щотижня (4 тижні)' };

function editTask(x, preset = {}) {
  const isNew = !x;
  x = x || { date: ui.tab === 'tasks' ? ui.taskDate : today(), priority: 'low', repeat: 'none', ...preset };
  const fields = [
    { name: 'title', label: 'Справа', required: true, placeholder: 'Що потрібно зробити?' },
    { name: 'date', label: 'Дата', type: 'date', required: true, half: true },
    { name: 'time', label: 'Час', type: 'time', half: true },
    { name: 'priority', label: 'Пріоритет', type: 'toggle', options: { low: 'Звичайний', mid: 'Середній', high: 'Високий' } },
    { name: 'remind', label: '🔔 Нагадати', type: 'select', options: REMIND },
    { name: 'note', label: 'Нотатки', type: 'textarea' }
  ];
  if (isNew) fields.push({ name: 'repeat', label: 'Повторення', type: 'select', options: REPEAT });
  fields._onMount = (root) => {
    const hint = $('#remindHint', root);
    const upd = () => {
      const r = root.querySelector('[name=remind]').value;
      const t = root.querySelector('[name=time]').value;
      hint.textContent = r !== '' && !t ? 'Час не вказано — нагадування спрацює о 09:00.' : '';
    };
    root.querySelectorAll('[name=remind],[name=time]').forEach((el) => el.addEventListener('change', upd));
    upd();
    const cal = $('#icsBtn', root);
    if (cal) cal.addEventListener('click', () => downloadIcs(x));
  };
  openForm({
    title: isNew ? 'Нова справа' : 'Справа',
    fields, values: x,
    extraHtml: `<p class="hint" id="remindHint"></p>${isNew ? '' : '<button type="button" class="btn secondary" id="icsBtn">📅 Додати в календар телефону</button>'}`,
    onSave: (d) => {
      const rep = d.repeat; delete d.repeat;
      if (d.remind !== '') askNotifyPermission();
      d.snoozeUntil = null;
      if (!isNew) { Object.assign(x, d); toast('Збережено'); return; }
      const dates = [d.date];
      if (rep === 'daily') for (let i = 1; i < 7; i++) dates.push(addDays(d.date, i));
      if (rep === 'weekly') for (let i = 1; i < 4; i++) dates.push(addDays(d.date, 7 * i));
      if (rep === 'weekdays') { for (let i = 1; dates.length < 10 && i < 20; i++) { const n = addDays(d.date, i); const w = fromISO(n).getDay(); if (w !== 0 && w !== 6) dates.push(n); } }
      dates.forEach((dt) => state.tasks.push({ id: uid(), ...d, date: dt, done: false }));
      toast(dates.length > 1 ? `Створено справ: ${dates.length}` : 'Справу додано');
    },
    onDelete: isNew ? null : () => { state.tasks = state.tasks.filter((t) => t.id !== x.id); }
  });
}

/* ================= ЛІДИ ================= */
function renderLeads(v) {
  const counts = Object.fromEntries(Object.keys(LEAD_STATUS).map((k) => [k, state.leads.filter((x) => x.status === k).length]));
  let list = state.leads.slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  if (ui.leadStatus !== 'all') list = list.filter((x) => x.status === ui.leadStatus);
  if (ui.leadQuery) {
    const q = ui.leadQuery.toLowerCase();
    list = list.filter((x) => [x.name, x.contact, x.request, x.source, x.note].join(' ').toLowerCase().includes(q));
  }

  // статистика за джерелами
  const bySrc = {};
  state.leads.forEach((x) => {
    const s = (bySrc[x.source] ||= { total: 0, won: 0, sum: 0 });
    s.total++; if (x.status === 'won') { s.won++; s.sum += Number(x.amount) || 0; }
  });
  const srcs = Object.entries(bySrc).sort((a, b) => b[1].total - a[1].total);
  const maxSrc = srcs[0]?.[1].total || 1;
  const pipelineSum = sum(state.leads.filter((x) => ['new', 'work', 'offer'].includes(x.status)).map((x) => Number(x.amount) || 0));
  const wonSum = sum(state.leads.filter((x) => x.status === 'won').map((x) => Number(x.amount) || 0));
  const closed = counts.won + counts.lost;

  v.innerHTML = `
    <div class="pipeline">
      ${Object.entries(LEAD_STATUS).map(([k, s]) => `<button data-ls="${k}" class="${ui.leadStatus === k ? 'active' : ''}"><b>${counts[k]}</b><small>${s.short}</small></button>`).join('')}
    </div>
    <div class="grid2" style="margin-bottom:12px">
      <div class="stat"><div class="label">У роботі (потенційно)</div><div class="value" style="font-size:18px">${fmtMoney(pipelineSum)}</div></div>
      <div class="stat"><div class="label">Закрито успішно · конверсія</div><div class="value" style="font-size:18px">${fmtMoney(wonSum)} <span class="hint">· ${closed ? Math.round(counts.won / closed * 100) : 0}%</span></div></div>
    </div>
    <input class="search" id="leadSearch" placeholder="🔍 Пошук за імʼям, запитом, контактом…" value="${esc(ui.leadQuery)}">
    ${ui.leadStatus !== 'all' ? `<p class="hint">Фільтр: <b>${LEAD_STATUS[ui.leadStatus].label}</b> · <button class="link" data-ls="all">показати всіх</button></p>` : ''}
    <div class="list" id="leadList">${list.length ? list.map(leadHtml).join('') : '<div class="empty"><div class="big">🎯</div>Лідів поки немає.<br>Натисніть «＋», щоб зафіксувати новий запит і джерело звернення.</div>'}</div>

    ${srcs.length ? `<div class="section-title">Звідки приходять клієнти</div>
    <div class="card">${srcs.map(([s, o]) => `
      <div class="bar-row"><div class="top"><span>${esc(s)}</span><span><b>${o.total}</b> <span class="hint">· успішних ${o.won}${o.sum ? ' · ' + fmtMoney(o.sum) : ''}</span></span></div>
      <div class="bar"><div style="width:${o.total / maxSrc * 100}%"></div></div></div>`).join('')}</div>` : ''}
  `;
  v.querySelectorAll('[data-ls]').forEach((b) => b.addEventListener('click', () => { ui.leadStatus = ui.leadStatus === b.dataset.ls ? 'all' : b.dataset.ls; render(); }));
  const s = $('#leadSearch', v);
  s.addEventListener('input', () => {
    ui.leadQuery = s.value;
    const pos = s.selectionStart;
    render();
    const ns = $('#leadSearch'); ns.focus(); ns.setSelectionRange(pos, pos);
  });
  bindCommon(v);
}

function leadHtml(x) {
  const st = LEAD_STATUS[x.status] || LEAD_STATUS.new;
  const overdue = x.next && x.next < today() && ['new', 'work', 'offer'].includes(x.status);
  return `<div class="item clickable" data-lead="${x.id}">
    <div class="avatar">${esc((x.name || '?').trim()[0]?.toUpperCase() || '?')}</div>
    <div class="main">
      <div class="title">${esc(x.name)}</div>
      <div class="sub">${esc(x.request || 'Без опису')}</div>
      <div class="sub tags"><span class="pill gray">${esc(x.source)}</span> <span class="pill ${st.cls}">${st.label}</span>${x.next ? ` <span class="pill ${overdue ? 'red' : 'gray'}">📅 ${fmtDate(x.next)}</span>` : ''}</div>
    </div>
    <div class="right">${x.amount ? `<div class="amount">${fmtMoney(Number(x.amount))}</div>` : ''}<div class="sub">${fmtDate(x.date)}</div></div>
  </div>`;
}

function showLead(id) {
  const x = state.leads.find((l) => l.id === id); if (!x) return;
  const c = (x.contact || '').trim();
  const phone = /^\+?\d[\d\s()-]{6,}$/.test(c) ? c.replace(/[^\d+]/g, '') : null;
  const email = /@.+\./.test(c) ? c : null;
  const tg = /^@\w+$/.test(c) ? c.slice(1) : null;
  openSheet(`
    <h2>${esc(x.name)}</h2>
    <div class="meta">
      <span class="pill gray">Джерело: ${esc(x.source)}</span>
      <span class="pill ${LEAD_STATUS[x.status].cls}">${LEAD_STATUS[x.status].label}</span>
      <span class="pill gray">${fmtDate(x.date)}</span>
      ${x.amount ? `<span class="pill green">${fmtMoney(Number(x.amount))}</span>` : ''}
      ${x.next ? `<span class="pill amber">Наступний крок: ${fmtDate(x.next)}</span>` : ''}
    </div>
    ${c ? `<p style="margin:0 0 8px"><b>Контакт:</b> ${esc(c)}</p>` : ''}
    <div class="detail-text">${esc(x.request) || '<span class="hint">Запит не описано</span>'}${x.note ? `\n\n<span class="hint">Нотатки:</span>\n${esc(x.note)}` : ''}</div>
    <div class="field"><label>Етап</label>
      <div class="toggle-group" id="leadSt">${Object.entries(LEAD_STATUS).map(([k, s]) => `<button type="button" data-v="${k}" class="${x.status === k ? 'active' : ''}" style="font-size:11px;padding:8px 2px">${s.short}</button>`).join('')}</div>
    </div>
    <div class="btn-row">
      ${phone ? `<a class="btn small secondary" href="tel:${esc(phone)}">📞 Подзвонити</a><a class="btn small secondary" href="viber://chat?number=%2B${esc(phone.replace(/\D/g, ''))}">Viber</a><a class="btn small secondary" href="https://t.me/+${esc(phone.replace(/\D/g, ''))}" target="_blank" rel="noopener">Telegram</a>` : ''}
      ${tg ? `<a class="btn small secondary" href="https://t.me/${esc(tg)}" target="_blank" rel="noopener">✈️ Telegram</a>` : ''}
      ${email ? `<a class="btn small secondary" href="mailto:${esc(email)}">✉️ Лист</a>` : ''}
    </div>
    <button class="btn secondary" id="leadTask">✅ Створити справу (нагадування)</button>
    <div class="btn-row" style="margin-top:8px">
      <button class="btn secondary" id="editLead">Редагувати</button>
      <button class="btn danger" id="delLead">Видалити</button>
    </div>
  `, (root) => {
    $('#leadSt', root).addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      x.status = b.dataset.v; save(); render(); closeSheet(); toast(`Етап: ${LEAD_STATUS[x.status].label}`);
      if (x.status === 'won' && x.amount && confirm(`Додати ${fmtMoney(Number(x.amount))} у доходи?`)) {
        state.tx.push({ id: uid(), type: 'income', amount: Number(x.amount), category: 'Клієнти', date: today(), note: x.name });
        save(); render(); toast('Дохід додано у Фінанси');
      }
    });
    $('#leadTask', root).addEventListener('click', () => editTask(null, { title: `Звʼязатися: ${x.name}`, note: x.request, date: x.next || today(), priority: 'mid' }));
    $('#editLead', root).addEventListener('click', () => editLead(x));
    $('#delLead', root).addEventListener('click', () => {
      if (confirm('Видалити ліда?')) { state.leads = state.leads.filter((l) => l.id !== x.id); save(); closeSheet(); render(); }
    });
  });
}

function editLead(x, preset = {}) {
  const isNew = !x;
  x = x || { source: 'Instagram', status: 'new', date: today(), ...preset };
  openForm({
    title: isNew ? 'Новий лід' : 'Редагувати ліда',
    fields: [
      { name: 'name', label: 'Імʼя / компанія', required: true },
      { name: 'contact', label: 'Контакт (телефон, @username, email)', placeholder: '+380…' },
      { name: 'request', label: 'Потенційний запит', type: 'textarea', placeholder: 'Що цікавить клієнта?' },
      { name: 'source', label: 'Джерело звернення', type: 'select', options: LEAD_SOURCES, half: true },
      { name: 'status', label: 'Етап', type: 'select', options: Object.fromEntries(Object.entries(LEAD_STATUS).map(([k, s]) => [k, s.label])), half: true },
      { name: 'amount', label: `Потенційна сума, ${state.settings.currency}`, type: 'number', half: true },
      { name: 'date', label: 'Дата звернення', type: 'date', half: true },
      { name: 'next', label: 'Наступний контакт', type: 'date' },
      { name: 'note', label: 'Нотатки', type: 'textarea' }
    ],
    values: x,
    onSave: (d) => { if (isNew) state.leads.push({ id: uid(), ...d }); else Object.assign(x, d); toast('Збережено'); },
    onDelete: isNew ? null : () => { state.leads = state.leads.filter((l) => l.id !== x.id); }
  });
}

/* ================= НАЛАШТУВАННЯ ================= */
function openSettings() {
  openSheet(`
    <h2>⚙️ Налаштування</h2>
    <form id="setForm">
      <div class="field"><label>Валюта</label>
        <select name="currency">${['₴', '$', '€', 'zł'].map((c) => `<option ${state.settings.currency === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
      </div>
      <div class="field"><label>Токен Telegram-бота (необовʼязково)</label>
        <input name="tgToken" value="${esc(state.settings.tgToken)}" placeholder="123456:ABC-DEF…" autocomplete="off">
      </div>
      <p class="hint">Створіть бота через <code>@BotFather</code>, вставте токен і додайте бота в потрібні групи (у BotFather вимкніть <code>/setprivacy</code>, щоб бот бачив усі повідомлення групи). Особисті чати Telegram/Viber та пошта додаються вручну кнопкою «＋» — їх API не дозволяє читати без сервера.</p>
      <button class="btn" type="submit">Зберегти</button>
    </form>
    <div class="section-title">Резервна копія</div>
    <div class="btn-row">
      <button class="btn secondary" id="exportBtn">⬇️ Експорт</button>
      <label class="btn secondary" style="margin-top:8px">⬆️ Імпорт<input type="file" id="importFile" accept="application/json" hidden></label>
    </div>
    <button class="btn secondary" id="demoBtn">✨ Заповнити демо-даними</button>
    <button class="btn danger" id="resetBtn">Очистити всі дані</button>
    <p class="hint">Дані зберігаються тільки на цьому пристрої. Регулярно робіть експорт, щоб не втратити їх.</p>
  `, (root) => {
    $('#setForm', root).addEventListener('submit', (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target).entries());
      if (d.tgToken !== state.settings.tgToken) state.settings.tgOffset = 0;
      state.settings.currency = d.currency;
      state.settings.tgToken = d.tgToken.trim();
      save(); closeSheet(); render(); toast('Налаштування збережено');
    });
    $('#exportBtn', root).addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = `minicrm-${today()}.json`; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    $('#importFile', root).addEventListener('change', async (e) => {
      const f = e.target.files[0]; if (!f) return;
      try {
        const s = JSON.parse(await f.text());
        if (!Array.isArray(s.tasks) || !Array.isArray(s.tx)) throw new Error();
        state = { ...structuredClone(DEFAULT_STATE), ...s, settings: { ...DEFAULT_STATE.settings, ...(s.settings || {}) } };
        save(); closeSheet(); render(); toast('Дані відновлено');
      } catch { toast('Невірний файл резервної копії'); }
    });
    $('#demoBtn', root).addEventListener('click', () => { fillDemo(); closeSheet(); render(); toast('Додано демо-дані'); });
    $('#resetBtn', root).addEventListener('click', () => {
      if (confirm('Видалити ВСІ дані без можливості відновлення?')) { state = structuredClone(DEFAULT_STATE); save(); closeSheet(); render(); }
    });
  });
}

function fillDemo() {
  const t = today();
  const at = (days, time = '10:00') => `${addDays(t, days)}T${time}`;
  state.tx.push(
    { id: uid(), type: 'income', amount: 25000, category: 'Зарплата', date: addDays(t, -3), note: 'Основна робота' },
    { id: uid(), type: 'income', amount: 6500, category: 'Клієнти', date: addDays(t, -1), note: 'Оплата від ТОВ «Світанок»' },
    { id: uid(), type: 'expense', amount: 1240, category: 'Продукти', date: t, note: 'Сільпо' },
    { id: uid(), type: 'expense', amount: 3200, category: 'Реклама', date: addDays(t, -2), note: 'Таргет Instagram' },
    { id: uid(), type: 'expense', amount: 450, category: 'Транспорт', date: addDays(t, -1), note: 'Таксі' },
    { id: uid(), type: 'expense', amount: 2100, category: 'Комуналка', date: addDays(t, -4), note: '' }
  );
  state.msgs.push(
    { id: uid(), channel: 'telegram', kind: 'personal', from: 'Олена Коваль', contact: '@olena_k', text: 'Добрий день! Чи можна перенести зустріч на четвер?', status: 'new', date: at(0, '09:12'), due: at(0, '18:00') },
    { id: uid(), channel: 'viber', kind: 'group', from: 'Група «Партнери Київ»', contact: '', text: 'Хто може взяти замовлення на наступний тиждень?', status: 'reply', date: at(-1, '15:40'), due: '' },
    { id: uid(), channel: 'email', kind: 'personal', from: 'Бухгалтерія', contact: 'buh@example.com', text: 'Надішліть, будь ласка, акт виконаних робіт за місяць.', status: 'wait', date: at(-2, '11:05'), due: at(1, '12:00') }
  );
  state.tasks.push(
    { id: uid(), title: 'Передзвонити Олені', date: t, time: '11:00', priority: 'high', done: false, note: '', remind: '15' },
    { id: uid(), title: 'Підготувати комерційну пропозицію', date: t, time: '14:00', priority: 'mid', done: false, note: 'Для Андрія' },
    { id: uid(), title: 'Сплатити інтернет', date: t, time: '', priority: 'low', done: true, note: '' },
    { id: uid(), title: 'Зустріч з клієнтом', date: addDays(t, 1), time: '10:30', priority: 'high', done: false, note: '', remind: '60' },
    { id: uid(), title: 'Пост в Instagram', date: addDays(t, 2), time: '', priority: 'low', done: false, note: '' },
    { id: uid(), title: 'Надіслати акт бухгалтерії', date: addDays(t, -1), time: '', priority: 'mid', done: false, note: '' }
  );
  state.leads.push(
    { id: uid(), name: 'Андрій Петренко', contact: '+380671234567', request: 'Ремонт офісу 60 м², потрібен кошторис', source: 'Instagram', status: 'new', amount: 45000, date: t, next: addDays(t, 1), note: '' },
    { id: uid(), name: 'ТОВ «Світанок»', contact: 'info@svitanok.ua', request: 'Щомісячне обслуговування', source: 'Рекомендація', status: 'won', amount: 6500, date: addDays(t, -10), next: '', note: '' },
    { id: uid(), name: 'Марина', contact: '@marina_shop', request: 'Консультація щодо реклами', source: 'Telegram', status: 'work', amount: 8000, date: addDays(t, -3), next: t, note: '' },
    { id: uid(), name: 'Ігор', contact: '+380931112233', request: 'Запитував ціну, не підійшла', source: 'OLX', status: 'lost', amount: 3000, date: addDays(t, -6), next: '', note: '' }
  );
  save();
}

/* ---------- Ініціалізація ---------- */
document.querySelectorAll('.tabbar button').forEach((b) => b.addEventListener('click', () => go(b.dataset.tab)));
$('#settingsBtn').addEventListener('click', openSettings);
$('#fab').addEventListener('click', () => {
  ({ finance: () => editTx(), messages: () => editMsg(), tasks: () => editTask(), leads: () => editLead() })[ui.tab]?.();
});
$('#sheetBackdrop').addEventListener('click', (e) => { if (e.target.id === 'sheetBackdrop') closeSheet(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });

updateBadges();
go('home');
if (!state.notified) state.notified = {};
checkReminders();
setInterval(checkReminders, 20000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { checkReminders(); render(); } });
if (new URLSearchParams(location.search).get('tab') === 'tasks') go('tasks');

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
