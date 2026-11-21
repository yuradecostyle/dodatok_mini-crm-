<!doctype html>
<html lang="uk">
<head>
    @include('_head')
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Mini CRM</title>
</head>
<body>
<header class="topbar">
    <button class="icon-btn back hidden" id="backBtn" aria-label="Назад">←</button>
    <h1 id="title">Сьогодні</h1>
    <button class="icon-btn" id="settingsBtn" aria-label="Налаштування">⚙️</button>
</header>

<main class="view" id="view"><div class="loader">Завантаження…</div></main>

<button class="fab" id="fab" aria-label="Додати">＋</button>

<nav class="tabbar" id="tabbar">
    <button data-tab="home" class="active">
        <svg viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>Сьогодні
    </button>
    <button data-tab="finance">
        <svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18"/><path d="M16 15h2"/></svg>Фінанси
    </button>
    <button data-tab="planner">
        <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="m9 15 2 2 4-4"/></svg>Планер<i class="dot hidden" id="dotPlanner"></i>
    </button>
    <button data-tab="projects">
        <svg viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>Проєкти
    </button>
    <button data-tab="leads">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></svg>Ліди<i class="dot hidden" id="dotLeads"></i>
    </button>
</nav>

<script src="/app/app.js?v={{ $jsVersion }}"></script>
</body>
</html>
