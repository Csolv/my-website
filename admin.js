(function () {
  'use strict';

  /* ─────────────────────────────────────────
     CONSTANTS
  ───────────────────────────────────────── */
  /* Password is never stored in plaintext — compared as SHA-256 hash only */
  var PASS_HASH = '87ac7086beadc393a2992e2531be5d797f518889a1c73850a1555ce0d8d0b4d2';
  var SESSION_KEY = 'adc-adm';
  var DRAFT_PREFIX = 'adc-draft-';
  var WORKER_URL = 'https://adc-grant-proxy.YOUR-SUBDOMAIN.workers.dev';

  var ADC_CONTEXT = [
    'Asociación Deportiva Curundú (ADC) es una organización sin fines de lucro fundada en 2014 en el barrio de Curundú, Ciudad de Panamá — una de las comunidades urbanas más vulnerables de Centroamérica.',
    '',
    'MISIÓN: Promover el desarrollo integral de niños y jóvenes a través del fútbol, la educación y la nutrición.',
    '',
    'IMPACTO ACTUAL:',
    '- Más de 70 jóvenes en programas activos',
    '- Más de 60 atletas en entrenamiento continuo',
    '- 5+ jugadores que han llegado a selecciones nacionales juveniles de Panamá',
    '- 11 años de servicio ininterrumpido a la comunidad',
    '- Múltiples títulos en torneos nacionales juveniles',
    '',
    'PROGRAMAS:',
    '1. Fútbol: Entrenamiento estructurado por categorías U10–U18, disciplina deportiva, torneos nacionales',
    '2. Educación: Apoyo académico, prevención de deserción escolar, habilidades de vida',
    '3. Nutrición: Alimentación para atletas, educación nutricional para familias',
    '',
    'COMUNIDAD: Curundú es un barrio urbano densamente poblado con altos índices de pobreza, desempleo y deserción escolar. Acceso limitado a infraestructura deportiva y educativa. ADC opera directamente en esta comunidad desde 2014.',
    '',
    'ALIADOS: Duke Engage (EE.UU.), Afrolatinx Travel, Cristalina, CR Enterprise, BY.',
    '',
    'ORGANIZACIÓN: 100% sin fines de lucro. Dirigida por voluntarios. Todo el financiamiento va directamente a programas para los jóvenes.'
  ].join('\n');

  var ADC_CONTEXT_SHORT = [
    'Asociación Deportiva Curundú (ADC) — nonprofit founded 2014 in Curundú, Panama City.',
    'Mission: sport, education, nutrition for 70+ youth.',
    'Impact: 60+ active athletes, 5+ national team players, 11 years serving the community.',
    'Community: Curundú is one of Panama\'s most underserved urban neighborhoods.',
    'Partners: Duke Engage, Afrolatinx Travel, Cristalina, CR Enterprise, BY.'
  ].join('\n');

  var sessionCount = 0;

  /* ─────────────────────────────────────────
     CSS INJECTION
  ───────────────────────────────────────── */
  var css = [
    ':root {',
    '  --adm-green:   #0a6e3c;',
    '  --adm-green-d: #064d2a;',
    '  --adm-green-l: #e8f5ee;',
    '  --adm-red:     #c0392b;',
    '  --adm-gray:    #5a5a5a;',
    '  --adm-border:  #dde3dd;',
    '  --adm-bg:      #f4f6f4;',
    '}',

    /* Trigger button — sits in the footer, not fixed */
    '#adm-trigger {',
    '  background: none;',
    '  border: none;',
    '  color: rgba(255,255,255,0.55);',
    '  font-size: 0.72rem;',
    '  font-family: inherit;',
    '  cursor: pointer;',
    '  letter-spacing: 0.04em;',
    '  padding: 0;',
    '  transition: color 0.15s;',
    '  text-decoration: none;',
    '  display: inline-block;',
    '}',
    '#adm-trigger:hover {',
    '  color: rgba(255,255,255,0.9);',
    '}',

    /* Overlay */
    '#adm-overlay {',
    '  position: fixed;',
    '  inset: 0;',
    '  z-index: 10000;',
    '  display: none;',
    '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;',
    '  font-size: 14px;',
    '  color: #1a1a1a;',
    '}',

    /* Login screen */
    '#adm-login {',
    '  position: absolute;',
    '  inset: 0;',
    '  background: rgba(6,77,42,0.97);',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  padding: 1rem;',
    '}',
    '#adm-login-card {',
    '  background: #fff;',
    '  border-radius: 12px;',
    '  padding: 2.5rem 2rem;',
    '  width: 100%;',
    '  max-width: 360px;',
    '  text-align: center;',
    '  box-shadow: 0 8px 40px rgba(0,0,0,0.35);',
    '}',
    '#adm-login-card .adm-login-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }',
    '#adm-login-card h2 { margin: 0 0 0.25rem; font-size: 1.25rem; color: var(--adm-green-d); }',
    '#adm-login-card p { margin: 0 0 1.5rem; color: var(--adm-gray); font-size: 0.85rem; }',
    '#adm-pass-input {',
    '  width: 100%;',
    '  box-sizing: border-box;',
    '  border: 1.5px solid var(--adm-border);',
    '  border-radius: 6px;',
    '  padding: 0.6rem 0.8rem;',
    '  font-size: 0.95rem;',
    '  margin-bottom: 0.75rem;',
    '  outline: none;',
    '  transition: border-color 0.15s;',
    '}',
    '#adm-pass-input:focus { border-color: var(--adm-green); }',
    '#adm-login-btn {',
    '  width: 100%;',
    '  background: var(--adm-green);',
    '  color: #fff;',
    '  border: none;',
    '  border-radius: 6px;',
    '  padding: 0.65rem;',
    '  font-size: 0.95rem;',
    '  cursor: pointer;',
    '  font-weight: 600;',
    '  transition: background 0.15s;',
    '}',
    '#adm-login-btn:hover { background: var(--adm-green-d); }',
    '#adm-login-err {',
    '  color: var(--adm-red);',
    '  font-size: 0.82rem;',
    '  margin-top: 0.6rem;',
    '  display: none;',
    '}',

    /* Admin panel */
    '#adm-panel {',
    '  position: absolute;',
    '  inset: 0;',
    '  display: flex;',
    '  flex-direction: column;',
    '  background: var(--adm-bg);',
    '}',

    /* Header */
    '#adm-header {',
    '  background: var(--adm-green-d);',
    '  color: #fff;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: space-between;',
    '  padding: 0 1.25rem;',
    '  height: 52px;',
    '  flex-shrink: 0;',
    '  position: sticky;',
    '  top: 0;',
    '  z-index: 2;',
    '}',
    '#adm-header .adm-logo { font-size: 1rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; }',
    '#adm-header .adm-badge {',
    '  background: rgba(255,255,255,0.18);',
    '  border-radius: 4px;',
    '  padding: 2px 7px;',
    '  font-size: 0.68rem;',
    '  letter-spacing: 0.06em;',
    '  font-weight: 700;',
    '}',
    '#adm-header .adm-hdr-right { display: flex; gap: 0.5rem; align-items: center; }',
    '.adm-hdr-btn {',
    '  background: rgba(255,255,255,0.12);',
    '  color: #fff;',
    '  border: 1px solid rgba(255,255,255,0.25);',
    '  border-radius: 5px;',
    '  padding: 0.3rem 0.75rem;',
    '  font-size: 0.78rem;',
    '  cursor: pointer;',
    '  transition: background 0.15s;',
    '}',
    '.adm-hdr-btn:hover { background: rgba(255,255,255,0.22); }',

    /* Body layout */
    '#adm-body {',
    '  display: flex;',
    '  flex: 1;',
    '  overflow: hidden;',
    '}',

    /* Sidebar */
    '#adm-sidebar {',
    '  width: 220px;',
    '  flex-shrink: 0;',
    '  background: #fff;',
    '  border-right: 1.5px solid var(--adm-border);',
    '  overflow-y: auto;',
    '  padding: 1rem 0;',
    '}',
    '.adm-sidebar-section {',
    '  padding: 0.75rem 1rem 0.25rem;',
    '  font-size: 0.68rem;',
    '  font-weight: 700;',
    '  letter-spacing: 0.07em;',
    '  color: #999;',
    '  text-transform: uppercase;',
    '}',
    '.adm-nav-item {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 0.6rem;',
    '  padding: 0.55rem 1rem;',
    '  cursor: pointer;',
    '  border-radius: 0;',
    '  color: #333;',
    '  font-size: 0.875rem;',
    '  transition: background 0.12s, color 0.12s;',
    '  border: none;',
    '  background: none;',
    '  width: 100%;',
    '  text-align: left;',
    '}',
    '.adm-nav-item:hover { background: var(--adm-green-l); color: var(--adm-green-d); }',
    '.adm-nav-item.active { background: var(--adm-green-l); color: var(--adm-green); font-weight: 600; border-left: 3px solid var(--adm-green); }',

    /* Main content area */
    '#adm-main {',
    '  flex: 1;',
    '  overflow-y: auto;',
    '  padding: 1.5rem;',
    '}',

    /* Panels */
    '.adm-view { display: none; }',
    '.adm-view.active { display: block; }',

    /* Cards */
    '.adm-card {',
    '  background: #fff;',
    '  border: 1.5px solid var(--adm-border);',
    '  border-radius: 10px;',
    '  padding: 1.25rem 1.5rem;',
    '  margin-bottom: 1.25rem;',
    '}',
    '.adm-card h3 {',
    '  margin: 0 0 1rem;',
    '  font-size: 1rem;',
    '  color: var(--adm-green-d);',
    '}',

    /* Stat cards */
    '.adm-stats { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.25rem; }',
    '.adm-stat {',
    '  background: #fff;',
    '  border: 1.5px solid var(--adm-border);',
    '  border-radius: 10px;',
    '  padding: 1rem 1.25rem;',
    '  flex: 1;',
    '  min-width: 140px;',
    '}',
    '.adm-stat .adm-stat-val { font-size: 1.75rem; font-weight: 700; color: var(--adm-green); }',
    '.adm-stat .adm-stat-lbl { font-size: 0.78rem; color: var(--adm-gray); margin-top: 0.2rem; }',

    /* Quick actions */
    '.adm-quick-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }',

    /* Form grid */
    '.adm-form-grid {',
    '  display: grid;',
    '  grid-template-columns: 1fr 1fr;',
    '  gap: 1rem;',
    '}',
    '.adm-form-grid .adm-full { grid-column: 1 / -1; }',
    '.adm-field { display: flex; flex-direction: column; gap: 0.3rem; }',
    '.adm-field label { font-size: 0.8rem; font-weight: 600; color: #444; }',
    '.adm-field input, .adm-field select, .adm-field textarea {',
    '  border: 1.5px solid var(--adm-border);',
    '  border-radius: 6px;',
    '  padding: 0.5rem 0.7rem;',
    '  font-size: 0.875rem;',
    '  font-family: inherit;',
    '  outline: none;',
    '  transition: border-color 0.15s;',
    '  background: #fff;',
    '  width: 100%;',
    '  box-sizing: border-box;',
    '}',
    '.adm-field input:focus, .adm-field select:focus, .adm-field textarea:focus {',
    '  border-color: var(--adm-green);',
    '}',
    '.adm-field textarea { resize: vertical; }',

    /* Checkboxes */
    '.adm-checks { display: flex; flex-wrap: wrap; gap: 0.6rem 1.2rem; margin-top: 0.3rem; }',
    '.adm-checks label {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 0.35rem;',
    '  font-size: 0.82rem;',
    '  cursor: pointer;',
    '  color: #333;',
    '}',
    '.adm-checks input[type=checkbox] { width: 15px; height: 15px; accent-color: var(--adm-green); cursor: pointer; }',

    /* Buttons */
    '.adm-btn {',
    '  display: inline-flex;',
    '  align-items: center;',
    '  gap: 0.4rem;',
    '  border-radius: 6px;',
    '  padding: 0.55rem 1.1rem;',
    '  font-size: 0.875rem;',
    '  font-family: inherit;',
    '  font-weight: 600;',
    '  cursor: pointer;',
    '  border: none;',
    '  transition: background 0.15s, transform 0.1s, opacity 0.15s;',
    '}',
    '.adm-btn:hover { transform: translateY(-1px); }',
    '.adm-btn:active { transform: translateY(0); }',
    '.adm-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }',
    '.adm-btn-primary { background: var(--adm-green); color: #fff; }',
    '.adm-btn-primary:hover { background: var(--adm-green-d); }',
    '.adm-btn-outline {',
    '  background: #fff;',
    '  color: var(--adm-green);',
    '  border: 1.5px solid var(--adm-green);',
    '}',
    '.adm-btn-outline:hover { background: var(--adm-green-l); }',
    '.adm-btn-danger { background: #fff; color: var(--adm-red); border: 1.5px solid var(--adm-red); }',
    '.adm-btn-danger:hover { background: #fdf0ef; }',
    '.adm-btn-sm { padding: 0.3rem 0.7rem; font-size: 0.78rem; }',

    /* Buttons row */
    '.adm-btns-row { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1rem; }',

    /* Context toggle */
    '.adm-context-toggle {',
    '  background: none;',
    '  border: 1.5px solid var(--adm-border);',
    '  border-radius: 6px;',
    '  padding: 0.45rem 0.85rem;',
    '  font-size: 0.78rem;',
    '  cursor: pointer;',
    '  color: var(--adm-gray);',
    '  font-family: inherit;',
    '  margin-bottom: 0.75rem;',
    '}',
    '.adm-context-toggle:hover { background: var(--adm-green-l); color: var(--adm-green-d); }',
    '#adm-ctx-body { display: none; }',
    '#adm-ctx-body textarea {',
    '  width: 100%;',
    '  box-sizing: border-box;',
    '  border: 1.5px solid var(--adm-border);',
    '  border-radius: 6px;',
    '  padding: 0.6rem 0.75rem;',
    '  font-size: 0.78rem;',
    '  font-family: monospace;',
    '  line-height: 1.5;',
    '  resize: vertical;',
    '  outline: none;',
    '}',
    '#adm-ctx-body textarea:focus { border-color: var(--adm-green); }',

    /* Output area */
    '#adm-output-wrap { display: none; margin-top: 1.25rem; }',
    '.adm-output-header {',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: space-between;',
    '  margin-bottom: 0.6rem;',
    '}',
    '.adm-success-banner {',
    '  background: #e8f5ee;',
    '  border: 1.5px solid #b2dbc4;',
    '  color: var(--adm-green-d);',
    '  border-radius: 7px;',
    '  padding: 0.55rem 0.9rem;',
    '  font-size: 0.82rem;',
    '  font-weight: 600;',
    '  flex: 1;',
    '}',
    '#adm-grant-output {',
    '  white-space: pre-wrap;',
    '  background: #fafafa;',
    '  border: 1.5px solid var(--adm-border);',
    '  border-radius: 7px;',
    '  padding: 1rem 1.1rem;',
    '  max-height: 500px;',
    '  overflow-y: auto;',
    '  font-size: 0.85rem;',
    '  line-height: 1.6;',
    '  color: #1a1a1a;',
    '  font-family: inherit;',
    '}',
    '.adm-error-banner {',
    '  background: #fdf0ef;',
    '  border: 1.5px solid #f0b3ae;',
    '  color: var(--adm-red);',
    '  border-radius: 7px;',
    '  padding: 0.6rem 0.9rem;',
    '  font-size: 0.83rem;',
    '  margin-top: 0.75rem;',
    '  display: none;',
    '}',

    /* Drafts */
    '.adm-draft-card {',
    '  background: #fff;',
    '  border: 1.5px solid var(--adm-border);',
    '  border-radius: 8px;',
    '  padding: 1rem 1.1rem;',
    '  margin-bottom: 0.85rem;',
    '  display: flex;',
    '  align-items: flex-start;',
    '  justify-content: space-between;',
    '  gap: 1rem;',
    '}',
    '.adm-draft-card .adm-draft-info { flex: 1; }',
    '.adm-draft-card .adm-draft-funder { font-weight: 700; font-size: 0.95rem; color: var(--adm-green-d); }',
    '.adm-draft-card .adm-draft-meta { font-size: 0.78rem; color: var(--adm-gray); margin-top: 0.2rem; }',
    '.adm-draft-card .adm-draft-actions { display: flex; gap: 0.4rem; flex-shrink: 0; }',
    '.adm-empty-state { text-align: center; color: var(--adm-gray); padding: 2.5rem 1rem; font-size: 0.9rem; }',
    '.adm-empty-state .adm-empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }',

    /* Resources */
    '.adm-resources-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.85rem; }',
    '.adm-resource-card {',
    '  background: #fff;',
    '  border: 1.5px solid var(--adm-border);',
    '  border-radius: 8px;',
    '  padding: 1rem 1.1rem;',
    '  text-decoration: none;',
    '  color: inherit;',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 0.75rem;',
    '  transition: border-color 0.15s, box-shadow 0.15s;',
    '}',
    '.adm-resource-card:hover {',
    '  border-color: var(--adm-green);',
    '  box-shadow: 0 2px 10px rgba(10,110,60,0.12);',
    '}',
    '.adm-resource-card .adm-res-icon { font-size: 1.5rem; }',
    '.adm-resource-card .adm-res-name { font-weight: 600; font-size: 0.875rem; color: var(--adm-green-d); }',
    '.adm-resource-card .adm-res-url { font-size: 0.72rem; color: var(--adm-gray); margin-top: 0.15rem; }',

    /* Pendientes */
    '.adm-pending-list { list-style: none; padding: 0; margin: 0; }',
    '.adm-pending-list li {',
    '  display: flex;',
    '  align-items: flex-start;',
    '  gap: 0.6rem;',
    '  padding: 0.65rem 0;',
    '  border-bottom: 1px solid var(--adm-border);',
    '  font-size: 0.875rem;',
    '  line-height: 1.45;',
    '  color: #333;',
    '}',
    '.adm-pending-list li:last-child { border-bottom: none; }',
    '.adm-pending-list .adm-todo-icon { flex-shrink: 0; margin-top: 1px; }',

    /* Spinner */
    '@keyframes adm-spin { to { transform: rotate(360deg); } }',
    '.adm-spinner {',
    '  display: inline-block;',
    '  width: 14px;',
    '  height: 14px;',
    '  border: 2px solid rgba(255,255,255,0.35);',
    '  border-top-color: #fff;',
    '  border-radius: 50%;',
    '  animation: adm-spin 0.7s linear infinite;',
    '}',

    /* Accordion pendientes */
    '.adm-acc-item {',
    '  border: 1.5px solid var(--adm-border);',
    '  border-radius: 8px;',
    '  margin-bottom: 0.6rem;',
    '  overflow: hidden;',
    '}',
    '.adm-acc-trigger {',
    '  width: 100%;',
    '  background: #fff;',
    '  border: none;',
    '  text-align: left;',
    '  padding: 0.8rem 1rem;',
    '  cursor: pointer;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: space-between;',
    '  gap: 0.75rem;',
    '  font-family: inherit;',
    '  font-size: 0.875rem;',
    '  font-weight: 600;',
    '  color: #222;',
    '  transition: background 0.12s;',
    '}',
    '.adm-acc-trigger:hover { background: var(--adm-green-l); }',
    '.adm-acc-trigger .adm-acc-left { display: flex; align-items: center; gap: 0.6rem; flex: 1; }',
    '.adm-acc-trigger .adm-acc-tag {',
    '  font-size: 0.68rem;',
    '  font-weight: 700;',
    '  padding: 2px 7px;',
    '  border-radius: 4px;',
    '  letter-spacing: 0.04em;',
    '  flex-shrink: 0;',
    '}',
    '.adm-tag-urgent { background: #fdecea; color: #b71c1c; }',
    '.adm-tag-content { background: #fff3e0; color: #e65100; }',
    '.adm-tag-feature { background: #e8f5e9; color: #1b5e20; }',
    '.adm-tag-transfer { background: #e3f2fd; color: #0d47a1; }',
    '.adm-acc-chevron { font-size: 0.7rem; color: var(--adm-gray); flex-shrink: 0; transition: transform 0.2s; }',
    '.adm-acc-item.open .adm-acc-chevron { transform: rotate(180deg); }',
    '.adm-acc-body {',
    '  display: none;',
    '  padding: 0.75rem 1rem 0.9rem 2.6rem;',
    '  background: #fafafa;',
    '  border-top: 1px solid var(--adm-border);',
    '  font-size: 0.83rem;',
    '  line-height: 1.6;',
    '  color: #444;',
    '}',
    '.adm-acc-item.open .adm-acc-body { display: block; }',
    '.adm-acc-body ul { margin: 0.4rem 0 0 1rem; padding: 0; }',
    '.adm-acc-body ul li { margin-bottom: 0.25rem; }',
    '.adm-acc-body .adm-acc-who { margin-top: 0.5rem; font-size: 0.78rem; color: var(--adm-gray); }',

    /* Mobile */
    '@media (max-width: 680px) {',
    '  #adm-sidebar { display: none; }',
    '  #adm-main { padding: 1rem; }',
    '  .adm-form-grid { grid-template-columns: 1fr; }',
    '  .adm-form-grid .adm-full { grid-column: 1; }',
    '  .adm-stats { flex-direction: column; }',
    '  .adm-resources-grid { grid-template-columns: 1fr; }',
    '}',
  ].join('\n');

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ─────────────────────────────────────────
     HTML INJECTION
  ───────────────────────────────────────── */
  var overlayHTML = [
    '<div id="adm-overlay">',

    /* ── LOGIN ── */
    '  <div id="adm-login">',
    '    <div id="adm-login-card">',
    '      <div class="adm-login-icon">⚽</div>',
    '      <h2>ADC Administración</h2>',
    '      <p>Panel privado — solo para el equipo de ADC</p>',
    '      <input type="password" id="adm-pass-input" placeholder="Contraseña" autocomplete="current-password">',
    '      <button id="adm-login-btn">Entrar</button>',
    '      <div id="adm-login-err">Contraseña incorrecta</div>',
    '    </div>',
    '  </div>',

    /* ── PANEL ── */
    '  <div id="adm-panel">',

    /* Header */
    '    <div id="adm-header">',
    '      <div class="adm-logo">',
    '        <span>⚽ ADC Admin</span>',
    '        <span class="adm-badge">PRIVADO</span>',
    '      </div>',
    '      <div class="adm-hdr-right">',
    '        <button class="adm-hdr-btn" id="adm-logout-btn">Cerrar sesión</button>',
    '        <button class="adm-hdr-btn" id="adm-close-btn">✕ Cerrar</button>',
    '      </div>',
    '    </div>',

    /* Body */
    '    <div id="adm-body">',

    /* Sidebar */
    '      <nav id="adm-sidebar">',
    '        <div class="adm-sidebar-section">PRINCIPAL</div>',
    '        <button class="adm-nav-item active" data-view="dashboard">🏠 Dashboard</button>',
    '        <div class="adm-sidebar-section">GRANTS</div>',
    '        <button class="adm-nav-item" data-view="nueva">📝 Nueva Propuesta</button>',
    '        <button class="adm-nav-item" data-view="borradores">💾 Borradores Guardados</button>',
    '        <button class="adm-nav-item" data-view="recursos">🔗 Recursos de Grants</button>',
    '        <div class="adm-sidebar-section">SITIO</div>',
    '        <button class="adm-nav-item" data-view="analytics">📈 Google Analytics</button>',
    '        <button class="adm-nav-item" data-view="pendientes">⚠️ Pendientes</button>',
    '      </nav>',

    /* Main */
    '      <main id="adm-main">',

    /* ── Dashboard ── */
    '        <div class="adm-view active" id="adm-view-dashboard">',
    '          <h2 style="margin:0 0 1.25rem;font-size:1.2rem;color:var(--adm-green-d)">👋 Bienvenido al panel de ADC</h2>',
    '          <div class="adm-stats">',
    '            <div class="adm-stat"><div class="adm-stat-val" id="adm-stat-count">0</div><div class="adm-stat-lbl">Propuestas generadas (sesión)</div></div>',
    '            <div class="adm-stat"><div class="adm-stat-val" id="adm-stat-drafts">0</div><div class="adm-stat-lbl">Borradores guardados</div></div>',
    '            <div class="adm-stat"><div class="adm-stat-val">~$0.003</div><div class="adm-stat-lbl">Costo estimado por propuesta</div></div>',
    '          </div>',
    '          <div class="adm-card">',
    '            <h3>Acciones rápidas</h3>',
    '            <div class="adm-quick-actions">',
    '              <button class="adm-btn adm-btn-primary" data-view="nueva">📝 Nueva Propuesta</button>',
    '              <button class="adm-btn adm-btn-outline" data-view="borradores">💾 Ver Borradores</button>',
    '              <button class="adm-btn adm-btn-outline" data-view="recursos">🔗 Ver Recursos</button>',
    '            </div>',
    '          </div>',
    '        </div>',

    /* ── Nueva Propuesta ── */
    '        <div class="adm-view" id="adm-view-nueva">',
    '          <div class="adm-card">',
    '            <h3>📝 Nueva Propuesta de Grant</h3>',
    '            <div class="adm-form-grid">',

    /* Row 1 */
    '              <div class="adm-field">',
    '                <label for="g-funder">Nombre de la fundación / organismo</label>',
    '                <input type="text" id="g-funder" placeholder="Ej: U.S. Soccer Foundation, UNICEF Panamá...">',
    '              </div>',
    '              <div class="adm-field">',
    '                <label for="g-amount">Monto solicitado (USD)</label>',
    '                <input type="text" id="g-amount" placeholder="Ej: $15,000">',
    '              </div>',

    /* Row 2 */
    '              <div class="adm-field">',
    '                <label for="g-focus">Área de enfoque</label>',
    '                <select id="g-focus">',
    '                  <option>Deporte juvenil</option>',
    '                  <option>Educación</option>',
    '                  <option>Nutrición</option>',
    '                  <option>Desarrollo comunitario</option>',
    '                  <option>Igualdad de género</option>',
    '                  <option>Salud y bienestar</option>',
    '                  <option>Infraestructura deportiva</option>',
    '                  <option>Becas académicas</option>',
    '                  <option>Prevención de violencia</option>',
    '                  <option>Otro</option>',
    '                </select>',
    '              </div>',
    '              <div class="adm-field">',
    '                <label for="g-type">Tipo de documento</label>',
    '                <select id="g-type">',
    '                  <option>Propuesta completa</option>',
    '                  <option>Solo declaración de necesidades</option>',
    '                  <option>Solo plan de impacto</option>',
    '                  <option>Solo presupuesto narrativo</option>',
    '                  <option>Resumen ejecutivo (1 página)</option>',
    '                </select>',
    '              </div>',

    /* Row 3 */
    '              <div class="adm-field">',
    '                <label for="g-tone">Tono</label>',
    '                <select id="g-tone">',
    '                  <option>Formal y académico</option>',
    '                  <option>Comunitario y personal</option>',
    '                  <option>Urgente (situación de crisis)</option>',
    '                  <option>Corporativo / RSE</option>',
    '                </select>',
    '              </div>',
    '              <div class="adm-field">',
    '                <label for="g-lang">Idioma</label>',
    '                <select id="g-lang">',
    '                  <option>Español</option>',
    '                  <option>English</option>',
    '                </select>',
    '              </div>',

    /* Row 4 */
    '              <div class="adm-field">',
    '                <label for="g-wordlimit">Límite de palabras</label>',
    '                <input type="number" id="g-wordlimit" placeholder="Ej: 1000">',
    '              </div>',
    '              <div class="adm-field">',
    '                <label for="g-deadline">Fecha límite de entrega</label>',
    '                <input type="date" id="g-deadline">',
    '              </div>',

    /* Sections checkboxes */
    '              <div class="adm-field adm-full">',
    '                <label>Secciones a incluir</label>',
    '                <div class="adm-checks">',
    '                  <label><input type="checkbox" name="g-sections" value="Introducción y misión" checked> ✅ Introducción y misión</label>',
    '                  <label><input type="checkbox" name="g-sections" value="Declaración de necesidades" checked> ✅ Declaración de necesidades</label>',
    '                  <label><input type="checkbox" name="g-sections" value="Objetivos y metas" checked> ✅ Objetivos y metas</label>',
    '                  <label><input type="checkbox" name="g-sections" value="Plan de actividades" checked> ✅ Plan de actividades</label>',
    '                  <label><input type="checkbox" name="g-sections" value="Presupuesto narrativo" checked> ✅ Presupuesto narrativo</label>',
    '                  <label><input type="checkbox" name="g-sections" value="Plan de evaluación"> Plan de evaluación</label>',
    '                  <label><input type="checkbox" name="g-sections" value="Sostenibilidad"> Sostenibilidad</label>',
    '                  <label><input type="checkbox" name="g-sections" value="Perfil organizacional"> Perfil organizacional</label>',
    '                </div>',
    '              </div>',

    /* Questions */
    '              <div class="adm-field adm-full">',
    '                <label for="g-questions">Preguntas específicas del grant</label>',
    '                <textarea id="g-questions" rows="6" placeholder="Ej:\n1. ¿Cuál es el impacto esperado en la comunidad?\n2. ¿Cómo se medirá el éxito del programa?\n3. ¿Qué diferencia a su organización de otras?\n4. ¿Cuál es el plan de sostenibilidad a largo plazo?"></textarea>',
    '              </div>',

    /* Notes */
    '              <div class="adm-field adm-full">',
    '                <label for="g-notes">Instrucciones adicionales (opcional)</label>',
    '                <textarea id="g-notes" rows="3" placeholder="Ej: Enfocarse en el programa de nutrición, mencionar alianza con Duke Engage, no incluir estadísticas de deserción escolar..."></textarea>',
    '              </div>',

    '            </div>', /* end form-grid */

    /* ADC Context card */
    '            <div style="margin-top:1.25rem;">',
    '              <button class="adm-context-toggle" id="adm-ctx-toggle">📋 Ver / editar contexto ADC ▸</button>',
    '              <div id="adm-ctx-body">',
    '                <textarea id="adm-ctx-text" rows="10"></textarea>',
    '              </div>',
    '            </div>',

    /* Action buttons */
    '            <div class="adm-btns-row">',
    '              <button class="adm-btn adm-btn-primary" id="adm-generate-btn">✨ Generar propuesta</button>',
    '              <button class="adm-btn adm-btn-outline" id="adm-save-draft-btn">💾 Guardar borrador</button>',
    '              <button class="adm-btn adm-btn-outline" id="adm-clear-btn">🗑 Limpiar</button>',
    '            </div>',

    /* Error */
    '            <div class="adm-error-banner" id="adm-gen-error"></div>',

    /* Output */
    '            <div id="adm-output-wrap">',
    '              <div class="adm-output-header">',
    '                <div class="adm-success-banner">✅ Borrador generado — revisa y personaliza antes de enviar</div>',
    '                <button class="adm-btn adm-btn-outline adm-btn-sm" id="adm-copy-btn" style="margin-left:0.75rem;">📋 Copiar</button>',
    '              </div>',
    '              <div id="adm-grant-output"></div>',
    '              <div class="adm-btns-row">',
    '                <button class="adm-btn adm-btn-outline" id="adm-save-output-btn">💾 Guardar este borrador</button>',
    '              </div>',
    '            </div>',

    '          </div>', /* end card */
    '        </div>',   /* end view-nueva */

    /* ── Borradores ── */
    '        <div class="adm-view" id="adm-view-borradores">',
    '          <div class="adm-card">',
    '            <h3>💾 Borradores Guardados</h3>',
    '            <div id="adm-drafts-list"></div>',
    '          </div>',
    '        </div>',

    /* ── Recursos ── */
    '        <div class="adm-view" id="adm-view-recursos">',
    '          <div class="adm-card">',
    '            <h3>🔗 Recursos de Grants</h3>',
    '            <div class="adm-resources-grid" id="adm-resources-grid"></div>',
    '          </div>',
    '        </div>',

    /* ── Analytics ── */
    '        <div class="adm-view" id="adm-view-analytics">',
    '          <div class="adm-card">',
    '            <h3>📈 Google Analytics — ADC (G-5VQJH72CD2)</h3>',
    '            <p style="font-size:0.82rem;color:var(--adm-gray);margin-bottom:1rem;">Google Analytics no permite incrustación directa (iframe bloqueado). Usa los accesos rápidos a continuación para abrir cada reporte directamente en GA4.</p>',
    '            <div class="adm-resources-grid" id="adm-ga-grid"></div>',
    '          </div>',
    '          <div class="adm-card">',
    '            <h3>ℹ️ Datos clave de la propiedad</h3>',
    '            <ul style="list-style:none;padding:0;margin:0;font-size:0.875rem;line-height:2;">',
    '              <li><strong>Measurement ID:</strong> G-5VQJH72CD2</li>',
    '              <li><strong>Cuenta:</strong> connorsolvason (pendiente transferir a ADC)</li>',
    '              <li><strong>Sitio:</strong> csolv.github.io/my-website</li>',
    '              <li><strong>Estado:</strong> Activo — instalado en las 11 páginas</li>',
    '            </ul>',
    '          </div>',
    '        </div>',

    /* ── Pendientes ── */
    '        <div class="adm-view" id="adm-view-pendientes">',
    '          <div class="adm-card">',
    '            <h3>⚠️ Pendientes del Sitio</h3>',
    '            <p style="font-size:0.82rem;color:var(--adm-gray);margin-bottom:1rem;">Haz clic en cualquier ítem para ver detalles y pasos a seguir.</p>',
    '            <div id="adm-pending-list"></div>',
    '          </div>',
    '        </div>',

    '      </main>',
    '    </div>',   /* end adm-body */
    '  </div>',    /* end adm-panel */
    '</div>',      /* end adm-overlay */

  ].join('\n');

  var wrapper = document.createElement('div');
  wrapper.innerHTML = overlayHTML;
  while (wrapper.firstChild) {
    document.body.appendChild(wrapper.firstChild);
  }

  /* Inject trigger into footer-copy line */
  var footerCopy = document.querySelector('.footer-copy');
  var triggerBtn = document.createElement('button');
  triggerBtn.id = 'adm-trigger';
  triggerBtn.textContent = '🔒 Administración';
  if (footerCopy) {
    footerCopy.appendChild(document.createTextNode(' · '));
    footerCopy.appendChild(triggerBtn);
  } else {
    /* Fallback: append at end of footer, or body if no footer */
    var footer = document.querySelector('.site-footer') || document.body;
    footer.appendChild(triggerBtn);
  }

  /* ─────────────────────────────────────────
     ELEMENT REFS
  ───────────────────────────────────────── */
  var overlay     = document.getElementById('adm-overlay');
  var loginScreen = document.getElementById('adm-login');
  var panel       = document.getElementById('adm-panel');
  var passInput   = document.getElementById('adm-pass-input');
  var loginBtn    = document.getElementById('adm-login-btn');
  var loginErr    = document.getElementById('adm-login-err');
  var logoutBtn   = document.getElementById('adm-logout-btn');
  var closeBtn    = document.getElementById('adm-close-btn');
  var trigger     = document.getElementById('adm-trigger');
  var ctxToggle   = document.getElementById('adm-ctx-toggle');
  var ctxBody     = document.getElementById('adm-ctx-body');
  var ctxText     = document.getElementById('adm-ctx-text');
  var genBtn      = document.getElementById('adm-generate-btn');
  var saveDraftBtn   = document.getElementById('adm-save-draft-btn');
  var clearBtn    = document.getElementById('adm-clear-btn');
  var copyBtn     = document.getElementById('adm-copy-btn');
  var saveOutBtn  = document.getElementById('adm-save-output-btn');
  var outputWrap  = document.getElementById('adm-output-wrap');
  var grantOutput = document.getElementById('adm-grant-output');
  var genError    = document.getElementById('adm-gen-error');
  var statCount   = document.getElementById('adm-stat-count');
  var statDrafts  = document.getElementById('adm-stat-drafts');

  /* Set context textarea default */
  ctxText.value = ADC_CONTEXT_SHORT;

  /* ─────────────────────────────────────────
     AUTH HELPERS
  ───────────────────────────────────────── */
  function isAuthed() {
    try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch(e) { return false; }
  }
  function setAuthed(v) {
    try { if (v) sessionStorage.setItem(SESSION_KEY, '1'); else sessionStorage.removeItem(SESSION_KEY); } catch(e) {}
  }

  function showOverlay() {
    overlay.style.display = 'block';
    if (isAuthed()) {
      loginScreen.style.display = 'none';
      panel.style.display = 'flex';
      refreshDraftCount();
    } else {
      loginScreen.style.display = 'flex';
      panel.style.display = 'none';
      passInput.value = '';
      loginErr.style.display = 'none';
      setTimeout(function(){ passInput.focus(); }, 80);
    }
  }

  function hideOverlay() {
    overlay.style.display = 'none';
  }

  /* ─────────────────────────────────────────
     TRIGGER & CLOSE
  ───────────────────────────────────────── */
  trigger.addEventListener('click', showOverlay);
  closeBtn.addEventListener('click', hideOverlay);

  logoutBtn.addEventListener('click', function () {
    setAuthed(false);
    hideOverlay();
  });

  /* ─────────────────────────────────────────
     LOGIN
  ───────────────────────────────────────── */
  function attemptLogin() {
    var raw = passInput.value;
    if (!raw) return;
    /* Hash the input with SHA-256 — plaintext never compared directly */
    var enc = new TextEncoder().encode(raw);
    crypto.subtle.digest('SHA-256', enc).then(function (buf) {
      var hex = Array.from(new Uint8Array(buf))
        .map(function (b) { return b.toString(16).padStart(2, '0'); })
        .join('');
      if (hex === PASS_HASH) {
        setAuthed(true);
        loginErr.style.display = 'none';
        loginScreen.style.display = 'none';
        panel.style.display = 'flex';
        refreshDraftCount();
      } else {
        loginErr.style.display = 'block';
        passInput.select();
      }
    });
  }

  loginBtn.addEventListener('click', attemptLogin);
  passInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') attemptLogin();
  });

  /* ─────────────────────────────────────────
     NAV
  ───────────────────────────────────────── */
  var allNavItems = document.querySelectorAll('.adm-nav-item[data-view]');
  var allViews    = document.querySelectorAll('.adm-view');

  function switchView(viewName) {
    allNavItems.forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-view') === viewName);
    });
    allViews.forEach(function (el) {
      el.classList.toggle('active', el.id === 'adm-view-' + viewName);
    });
    if (viewName === 'borradores') renderDrafts();
    if (viewName === 'recursos')   renderResources();
    if (viewName === 'pendientes') renderPendientes();
    if (viewName === 'analytics')  renderGA();
    if (viewName === 'dashboard')  refreshDraftCount();
  }

  allNavItems.forEach(function (btn) {
    btn.addEventListener('click', function () {
      switchView(btn.getAttribute('data-view'));
    });
  });

  /* Quick action buttons (dashboard) */
  document.querySelectorAll('.adm-btn[data-view]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      switchView(btn.getAttribute('data-view'));
    });
  });

  /* ─────────────────────────────────────────
     CONTEXT TOGGLE
  ───────────────────────────────────────── */
  var ctxOpen = false;
  ctxToggle.addEventListener('click', function () {
    ctxOpen = !ctxOpen;
    ctxBody.style.display = ctxOpen ? 'block' : 'none';
    ctxToggle.textContent = ctxOpen
      ? '📋 Ver / editar contexto ADC ▾'
      : '📋 Ver / editar contexto ADC ▸';
  });

  /* ─────────────────────────────────────────
     DRAFT HELPERS
  ───────────────────────────────────────── */
  function getDrafts() {
    var drafts = [];
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.indexOf(DRAFT_PREFIX) === 0) {
        try {
          var val = JSON.parse(localStorage.getItem(key));
          val._key = key;
          drafts.push(val);
        } catch (e) {}
      }
    }
    drafts.sort(function (a, b) {
      var ta = parseInt(a._key.replace(DRAFT_PREFIX, ''), 10) || 0;
      var tb = parseInt(b._key.replace(DRAFT_PREFIX, ''), 10) || 0;
      return tb - ta;
    });
    return drafts;
  }

  function saveDraft(funder, amount, focus, text) {
    var key = DRAFT_PREFIX + Date.now();
    var obj = {
      funder: funder || '(sin nombre)',
      amount: amount || '',
      focus: focus || '',
      date: new Date().toISOString().slice(0, 10),
      text: text || ''
    };
    localStorage.setItem(key, JSON.stringify(obj));
    refreshDraftCount();
    return key;
  }

  function refreshDraftCount() {
    var count = getDrafts().length;
    if (statDrafts) statDrafts.textContent = count;
  }

  function getFormValues() {
    var sections = [];
    document.querySelectorAll('input[name="g-sections"]:checked').forEach(function (cb) {
      sections.push(cb.value);
    });
    return {
      funder:    document.getElementById('g-funder').value.trim(),
      amount:    document.getElementById('g-amount').value.trim(),
      focus:     document.getElementById('g-focus').value,
      type:      document.getElementById('g-type').value,
      tone:      document.getElementById('g-tone').value,
      lang:      document.getElementById('g-lang').value,
      wordlimit: document.getElementById('g-wordlimit').value.trim(),
      deadline:  document.getElementById('g-deadline').value,
      sections:  sections,
      questions: document.getElementById('g-questions').value.trim(),
      notes:     document.getElementById('g-notes').value.trim()
    };
  }

  /* ─────────────────────────────────────────
     GRANT GENERATION
  ───────────────────────────────────────── */
  function buildPrompt(f) {
    var lines = [];

    var langInstr = f.lang === 'English'
      ? 'Write the entire proposal in English.'
      : 'Escribe toda la propuesta en español.';
    lines.push(langInstr);
    lines.push('');

    lines.push('Tipo de documento: ' + f.type);
    lines.push('Tono: ' + f.tone);
    lines.push('Área de enfoque: ' + f.focus);

    if (f.funder)    lines.push('Fundación / organismo destinatario: ' + f.funder);
    if (f.amount)    lines.push('Monto solicitado: ' + f.amount);
    if (f.wordlimit) lines.push('Límite de palabras aproximado: ' + f.wordlimit + ' palabras');
    if (f.deadline)  lines.push('Fecha límite de entrega: ' + f.deadline);

    if (f.sections.length > 0) {
      lines.push('');
      lines.push('Secciones requeridas:');
      f.sections.forEach(function (s) { lines.push('- ' + s); });
    }

    if (f.questions) {
      lines.push('');
      lines.push('Preguntas específicas del grant que deben responderse:');
      lines.push(f.questions);
    }

    if (f.notes) {
      lines.push('');
      lines.push('Instrucciones adicionales:');
      lines.push(f.notes);
    }

    lines.push('');
    lines.push('Genera ahora el documento completo, listo para presentar, basado en el contexto de ADC proporcionado.');

    return lines.join('\n');
  }

  genBtn.addEventListener('click', function () {
    var f = getFormValues();

    genError.style.display = 'none';
    outputWrap.style.display = 'none';
    grantOutput.textContent = '';

    var prompt = buildPrompt(f);
    var systemCtx = ctxText.value.trim() || ADC_CONTEXT;

    /* Loading state */
    var spinner = document.createElement('span');
    spinner.className = 'adm-spinner';
    genBtn.disabled = true;
    genBtn.textContent = '';
    genBtn.appendChild(spinner);
    genBtn.appendChild(document.createTextNode(' Generando...'));

    fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system: systemCtx, prompt: prompt })
    })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      var text = (data && data.result) ? data.result
               : (data && data.content) ? data.content
               : (data && typeof data.text === 'string') ? data.text
               : JSON.stringify(data);

      grantOutput.textContent = text;
      outputWrap.style.display = 'block';
      sessionCount++;
      statCount.textContent = sessionCount;

      /* Store text for save button */
      saveOutBtn._lastText   = text;
      saveOutBtn._lastFunder = f.funder;
      saveOutBtn._lastAmount = f.amount;
      saveOutBtn._lastFocus  = f.focus;
    })
    .catch(function (err) {
      genError.textContent = '❌ Error al generar: ' + err.message + '. Verifica que el worker esté configurado.';
      genError.style.display = 'block';
    })
    .finally(function () {
      genBtn.disabled = false;
      genBtn.textContent = '✨ Generar propuesta';
    });
  });

  /* Copy */
  copyBtn.addEventListener('click', function () {
    var text = grantOutput.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        copyBtn.textContent = '✅ Copiado';
        setTimeout(function () { copyBtn.textContent = '📋 Copiar'; }, 2000);
      });
    } else {
      /* Fallback */
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch(e) {}
      document.body.removeChild(ta);
      copyBtn.textContent = '✅ Copiado';
      setTimeout(function () { copyBtn.textContent = '📋 Copiar'; }, 2000);
    }
  });

  /* Save output */
  saveOutBtn.addEventListener('click', function () {
    if (!saveOutBtn._lastText) return;
    saveDraft(saveOutBtn._lastFunder, saveOutBtn._lastAmount, saveOutBtn._lastFocus, saveOutBtn._lastText);
    saveOutBtn.textContent = '✅ Guardado';
    setTimeout(function () { saveOutBtn.textContent = '💾 Guardar este borrador'; }, 2000);
  });

  /* Save draft (form values only, no text) */
  saveDraftBtn.addEventListener('click', function () {
    var f = getFormValues();
    saveDraft(f.funder, f.amount, f.focus, '');
    saveDraftBtn.textContent = '✅ Guardado';
    setTimeout(function () { saveDraftBtn.textContent = '💾 Guardar borrador'; }, 2000);
  });

  /* Clear form */
  clearBtn.addEventListener('click', function () {
    ['g-funder','g-amount','g-wordlimit','g-deadline','g-questions','g-notes'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.querySelectorAll('input[name="g-sections"]').forEach(function (cb) {
      cb.checked = ['Introducción y misión','Declaración de necesidades','Objetivos y metas','Plan de actividades','Presupuesto narrativo'].indexOf(cb.value) !== -1;
    });
    outputWrap.style.display = 'none';
    genError.style.display = 'none';
    grantOutput.textContent = '';
  });

  /* ─────────────────────────────────────────
     DRAFTS VIEW
  ───────────────────────────────────────── */
  function renderDrafts() {
    var container = document.getElementById('adm-drafts-list');
    container.innerHTML = '';
    var drafts = getDrafts();

    if (drafts.length === 0) {
      container.innerHTML = '<div class="adm-empty-state"><div class="adm-empty-icon">📂</div>No hay borradores guardados aún.</div>';
      return;
    }

    drafts.forEach(function (d) {
      var card = document.createElement('div');
      card.className = 'adm-draft-card';

      var info = document.createElement('div');
      info.className = 'adm-draft-info';
      info.innerHTML = '<div class="adm-draft-funder">' + escHtml(d.funder || '(sin nombre)') + '</div>'
        + '<div class="adm-draft-meta">'
        + (d.date ? d.date + ' · ' : '')
        + escHtml(d.focus || '') + (d.amount ? ' · ' + escHtml(d.amount) : '')
        + '</div>';

      var actions = document.createElement('div');
      actions.className = 'adm-draft-actions';

      var loadBtn = document.createElement('button');
      loadBtn.className = 'adm-btn adm-btn-outline adm-btn-sm';
      loadBtn.textContent = '📂 Cargar';
      loadBtn.addEventListener('click', function () {
        loadDraft(d);
        switchView('nueva');
      });

      var delBtn = document.createElement('button');
      delBtn.className = 'adm-btn adm-btn-danger adm-btn-sm';
      delBtn.textContent = '🗑 Eliminar';
      delBtn.addEventListener('click', function () {
        localStorage.removeItem(d._key);
        renderDrafts();
        refreshDraftCount();
      });

      actions.appendChild(loadBtn);
      actions.appendChild(delBtn);
      card.appendChild(info);
      card.appendChild(actions);
      container.appendChild(card);
    });
  }

  function loadDraft(d) {
    var set = function (id, val) {
      var el = document.getElementById(id);
      if (el && val !== undefined && val !== null) el.value = val;
    };
    set('g-funder', d.funder);
    set('g-amount', d.amount);

    var focusSel = document.getElementById('g-focus');
    if (focusSel && d.focus) {
      for (var i = 0; i < focusSel.options.length; i++) {
        if (focusSel.options[i].value === d.focus) { focusSel.selectedIndex = i; break; }
      }
    }

    if (d.text) {
      grantOutput.textContent = d.text;
      outputWrap.style.display = 'block';
      saveOutBtn._lastText   = d.text;
      saveOutBtn._lastFunder = d.funder;
      saveOutBtn._lastAmount = d.amount;
      saveOutBtn._lastFocus  = d.focus;
    } else {
      outputWrap.style.display = 'none';
    }
  }

  /* ─────────────────────────────────────────
     RESOURCES VIEW
  ───────────────────────────────────────── */
  var RESOURCES = [
    { icon: '⚽', name: 'US Soccer Foundation',         url: 'https://www.ussoccerfoundation.org/grants/' },
    { icon: '🌍', name: 'UNICEF Panama',                url: 'https://www.unicef.org/partnerships/grants' },
    { icon: '🔍', name: 'Candid / GuideStar',           url: 'https://www.guidestar.org' },
    { icon: '💰', name: 'Foundation Directory (Candid)', url: 'https://candid.org' },
    { icon: '🏛', name: 'FIFA Foundation',              url: 'https://www.fifafoundation.org' },
    { icon: '🌱', name: 'Comic Relief / Sport Relief',  url: 'https://www.comicrelief.com' },
    { icon: '🏥', name: 'Inter-American Development Bank', url: 'https://www.iadb.org' },
    { icon: '📋', name: 'Grants.gov',                   url: 'https://www.grants.gov' },
    { icon: '🇵🇦', name: 'IFARHU Panama',               url: 'https://www.ifarhu.gob.pa' },
    { icon: '💼', name: 'Laureus Sport for Good',       url: 'https://www.laureus.com/grants' },
  ];

  function renderResources() {
    var grid = document.getElementById('adm-resources-grid');
    if (grid.children.length > 0) return; /* already rendered */
    RESOURCES.forEach(function (r) {
      var a = document.createElement('a');
      a.className = 'adm-resource-card';
      a.href = r.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.innerHTML = '<span class="adm-res-icon">' + r.icon + '</span>'
        + '<div><div class="adm-res-name">' + escHtml(r.name) + '</div>'
        + '<div class="adm-res-url">' + escHtml(r.url) + '</div></div>';
      grid.appendChild(a);
    });
  }

  /* ─────────────────────────────────────────
     ANALYTICS VIEW
  ───────────────────────────────────────── */
  var GA_LINKS = [
    { icon: '🏠', name: 'Resumen general',       url: 'https://analytics.google.com/analytics/web/#/p' + '000000000' + '/reports/intelligenthome', label: 'Home' },
    { icon: '👥', name: 'Usuarios en tiempo real', url: 'https://analytics.google.com/analytics/web/', label: 'Realtime' },
    { icon: '📄', name: 'Páginas más vistas',     url: 'https://analytics.google.com/analytics/web/', label: 'Pages' },
    { icon: '🌐', name: 'Fuentes de tráfico',     url: 'https://analytics.google.com/analytics/web/', label: 'Traffic' },
    { icon: '🗺️', name: 'Ubicación de visitantes', url: 'https://analytics.google.com/analytics/web/', label: 'Geo' },
    { icon: '📱', name: 'Dispositivos usados',    url: 'https://analytics.google.com/analytics/web/', label: 'Tech' },
    { icon: '🔍', name: 'Google Search Console',  url: 'https://search.google.com/search-console',    label: 'GSC' },
    { icon: '📊', name: 'Abrir GA4 completo',     url: 'https://analytics.google.com',               label: 'Full' },
  ];

  function renderGA() {
    var grid = document.getElementById('adm-ga-grid');
    if (!grid || grid.children.length > 0) return;
    GA_LINKS.forEach(function (r) {
      var a = document.createElement('a');
      a.className = 'adm-resource-card';
      a.href = r.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.innerHTML = '<span class="adm-res-icon">' + r.icon + '</span>'
        + '<div><div class="adm-res-name">' + escHtml(r.name) + '</div>'
        + '<div class="adm-res-url">analytics.google.com</div></div>';
      grid.appendChild(a);
    });
  }

  /* ─────────────────────────────────────────
     PENDIENTES VIEW
  ───────────────────────────────────────── */
  var PENDIENTES = [
    {
      icon: '🚨', tag: 'urgent', tagLabel: 'URGENTE',
      title: 'Desplegar Cloudflare Worker (activa el generador de grants)',
      detail: 'El generador de grants está construido pero inactivo. Requiere 3 pasos:',
      steps: [
        'Instalar Wrangler: npm install -g wrangler',
        'Ejecutar: wrangler deploy desde la carpeta adc-admin/',
        'Agregar clave de API: wrangler secret put ANTHROPIC_API_KEY',
        'Actualizar WORKER_URL en admin.js con el subdominio real',
      ],
      who: 'Responsable: Connor (requiere cuenta Cloudflare + clave Anthropic)'
    },
    {
      icon: '🔑', tag: 'transfer', tagLabel: 'TRANSFERENCIA',
      title: 'Transferir repositorio GitHub a cuenta de ADC',
      detail: 'Sin esta transferencia, el sitio depende de la cuenta personal de Connor. Si Connor pierde acceso, ADC pierde el sitio.',
      steps: [
        'Crear cuenta GitHub para ADC (ej. github.com/adcurundu)',
        'Settings → Danger Zone → Transfer ownership en el repo my-website',
        'ADC acepta la transferencia desde su cuenta',
      ],
      who: 'Responsable: Connor + Andrés/César (necesitan email de ADC)'
    },
    {
      icon: '📊', tag: 'transfer', tagLabel: 'TRANSFERENCIA',
      title: 'Transferir Google Analytics (G-5VQJH72CD2) a cuenta ADC',
      detail: 'Analytics está en la cuenta personal de Connor. Si ADC no tiene acceso, no puede ver datos de tráfico ni donaciones.',
      steps: [
        'Crear cuenta Google para ADC (adcurundu@gmail.com ya existe)',
        'GA4 → Admin → Account Access Management → Add user con rol Editor',
        'Transferir propiedad completa cuando ADC confirme acceso',
      ],
      who: 'Responsable: Connor — pendiente crear acceso ADC'
    },
    {
      icon: '📅', tag: 'feature', tagLabel: 'FUNCIÓN',
      title: 'Conectar Google Calendar en vivo (reemplaza eventos hardcodeados)',
      detail: 'Actualmente todos los eventos del calendario están escritos en el código JavaScript. ADC no puede actualizarlos sin editar código.',
      steps: [
        'Ir a calendar.google.com con cuenta adcurundu@gmail.com',
        'Configuración del calendario → Integrar → copiar Calendar ID',
        'Enviar el Calendar ID a Connor para insertar el embed',
        'Verificar horarios reales: Sub-8/10 Lun/Mié 3:30–5:30, Sub-12/14 Mar/Jue 4:00–6:00',
      ],
      who: 'Necesita: Calendar ID de adcurundu@gmail.com → enviar a Connor'
    },
    {
      icon: '📸', tag: 'feature', tagLabel: 'FUNCIÓN',
      title: 'Instagram auto-feed en el homepage (LightWidget / Behold.so)',
      detail: 'Las fotos de Instagram no se actualizan automáticamente. Hay que conectar @adcurundu a un widget.',
      steps: [
        'Opción A (gratis): LightWidget.com → conectar @adcurundu → copiar código embed',
        'Opción B (gratis): Behold.so → mismo proceso',
        'Insertar código en index.html donde aparece el placeholder de Instagram',
      ],
      who: 'Necesita: acceso de ADC a su cuenta de Instagram para autorizar widget'
    },
    {
      icon: '💬', tag: 'content', tagLabel: 'CONTENIDO',
      title: 'Testimonios reales de atletas — "Voces de Curundú"',
      detail: 'La sección de testimonios existe con placeholders. Sin historias reales, el impacto de ADC no se comunica.',
      steps: [
        '2–3 citas de atletas o familias sobre cómo ADC cambió su vida',
        'Foto del atleta (o foto del equipo si prefieren privacidad)',
        'Nombre y edad del atleta (o seudónimo si se prefiere)',
      ],
      who: 'Necesita: Andrés o César recopilar testimonios de familias'
    },
    {
      icon: '💰', tag: 'urgent', tagLabel: 'URGENTE',
      title: 'Botón de donación real (PayPal, Yappy, GoFundMe)',
      detail: 'El botón de donar no tiene destino real. Cada día sin donaciones reales es ingresos perdidos.',
      steps: [
        'Confirmar plataforma preferida: PayPal Giving Fund, GoFundMe Charity, o Yappy (Panama)',
        'Crear cuenta y obtener link de donación',
        'Enviar link a Connor para actualizar donar.html',
        'También confirmar dirección de entrega para donaciones de equipos deportivos',
      ],
      who: 'Necesita: Andrés/César decidir plataforma y enviar link'
    },
    {
      icon: '🤖', tag: 'feature', tagLabel: 'FUNCIÓN',
      title: 'Chatbot público con Claude API real',
      detail: 'El chatbot actual usa respuestas predefinidas. Con la misma infraestructura del Worker, puede responder en español e inglés con IA.',
      steps: [
        'Completar primero: desplegar Cloudflare Worker (ítem #1)',
        'Actualizar chatbot.js para llamar al Worker en lugar de respuestas estáticas',
        'Agregar contexto de ADC al system prompt del chatbot',
      ],
      who: 'Depende de: Cloudflare Worker desplegado + clave API'
    },
    {
      icon: '📝', tag: 'feature', tagLabel: 'FUNCIÓN',
      title: 'Netlify CMS para editar el blog sin código',
      detail: 'Actualmente cada artículo del blog es un archivo HTML que requiere edición de código. Con Decap CMS, los fundadores pueden publicar desde un formulario web.',
      steps: [
        'Mover el repo a un repositorio privado en la cuenta GitHub de ADC',
        'Instalar Decap CMS: agregar admin/index.html y admin/config.yml',
        'Conectar con Netlify Identity para autenticación',
        'Capacitar a Andrés/César en el editor visual',
      ],
      who: 'Depende de: transferencia de repo GitHub (ítem #2)'
    },
    {
      icon: '❓', tag: 'content', tagLabel: 'CONTENIDO',
      title: 'Completar respuestas del FAQ',
      detail: 'Varias preguntas frecuentes tienen respuestas incompletas o placeholder.',
      steps: [
        'Dirección exacta del campo/cancha en Curundú',
        'Grupos de edad confirmados (¿Sub-8 hasta Sub-16?)',
        'Número de registro oficial como nonprofit en Panamá',
        'Costo del programa (¿gratis para todas las familias?)',
        'Horario de inscripción y proceso de selección',
      ],
      who: 'Necesita: Andrés o César responder estas preguntas'
    },
    {
      icon: '🔗', tag: 'content', tagLabel: 'CONTENIDO',
      title: 'URLs de patrocinadores BY y CR Enterprise',
      detail: 'El logo bar de patrocinadores no tiene links activos para BY ni CR Enterprise.',
      steps: [
        'Confirmar si BY y CR Enterprise tienen sitios web públicos',
        'Enviar URLs a Connor para actualizar el código',
        'Confirmar si hay patrocinadores nuevos a agregar',
      ],
      who: 'Necesita: Andrés/César confirmar URLs'
    },
    {
      icon: '🏛', tag: 'transfer', tagLabel: 'TRANSFERENCIA',
      title: 'Registrar ADC en Google for Nonprofits',
      detail: 'Google for Nonprofits da acceso gratuito a Google Workspace, Google Ad Grants ($10,000/mes en anuncios gratis), y YouTube Nonprofit.',
      steps: [
        'Registrar en google.com/nonprofits con número de registro nonprofit de ADC',
        'Requiere: certificado de organización sin fines de lucro de Panamá',
        'Una vez aprobado, solicitar Google Ad Grants para visibilidad en búsquedas',
      ],
      who: 'Necesita: Andrés/César + número de registro oficial de ADC'
    },
    {
      icon: '📣', tag: 'feature', tagLabel: 'FUNCIÓN',
      title: 'Newsletter real con Mailchimp o similar',
      detail: 'El formulario de newsletter existe pero no envía emails a ningún lado.',
      steps: [
        'Crear cuenta gratuita en Mailchimp (hasta 500 suscriptores gratis)',
        'Obtener embed code del formulario de Mailchimp',
        'Reemplazar el formulario placeholder en index.html y contactanos.html',
      ],
      who: 'Responsable: Connor — solo necesita acceso Mailchimp de ADC'
    },
    {
      icon: '📊', tag: 'feature', tagLabel: 'FUNCIÓN',
      title: 'Estadísticas del sitio manejables sin código (stats.json)',
      detail: 'Los números de impacto (70+ atletas, 60+ familias, etc.) están hardcodeados en el HTML. ADC no puede actualizarlos sin editar código.',
      steps: [
        'Crear archivo data/stats.json con los números actuales',
        'Actualizar index.html para leer del JSON con fetch()',
        'ADC puede actualizar números editando un solo archivo JSON',
      ],
      who: 'Responsable: Connor — simple cambio técnico'
    },
    {
      icon: '🌐', tag: 'feature', tagLabel: 'FUNCIÓN',
      title: 'Versión bilingüe español/inglés',
      detail: 'El sitio es solo en español. Donantes internacionales y aliados como Duke Engage necesitan versión en inglés.',
      steps: [
        'Opción rápida: agregar toggle de traducción (Google Translate widget)',
        'Opción completa: duplicar páginas con sufijo -en.html',
        'Prioridad: traducir donar.html y acercadeadc.html primero',
      ],
      who: 'Responsable: Connor — con ayuda de traducciones de ADC'
    },
  ];

  function renderPendientes() {
    var container = document.getElementById('adm-pending-list');
    if (!container || container.children.length > 0) return;
    PENDIENTES.forEach(function (item, idx) {
      var tagClass = 'adm-tag-' + item.tag;
      var div = document.createElement('div');
      div.className = 'adm-acc-item';
      var stepsHTML = '';
      if (item.steps && item.steps.length) {
        stepsHTML = '<ul>' + item.steps.map(function (s) {
          return '<li>' + escHtml(s) + '</li>';
        }).join('') + '</ul>';
      }
      div.innerHTML =
        '<button class="adm-acc-trigger">' +
          '<span class="adm-acc-left">' +
            '<span>' + item.icon + '</span>' +
            '<span>' + escHtml(item.title) + '</span>' +
          '</span>' +
          '<span class="adm-acc-tag ' + tagClass + '">' + escHtml(item.tagLabel) + '</span>' +
          '<span class="adm-acc-chevron">▼</span>' +
        '</button>' +
        '<div class="adm-acc-body">' +
          '<p style="margin:0 0 0.4rem;">' + escHtml(item.detail) + '</p>' +
          stepsHTML +
          (item.who ? '<p class="adm-acc-who">👤 ' + escHtml(item.who) + '</p>' : '') +
        '</div>';
      div.querySelector('.adm-acc-trigger').addEventListener('click', function () {
        div.classList.toggle('open');
      });
      container.appendChild(div);
    });
  }

  /* ─────────────────────────────────────────
     UTILITY
  ───────────────────────────────────────── */
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */
  refreshDraftCount();

  /* ─────────────────────────────────────────
     PUBLIC API
  ───────────────────────────────────────── */
  window.adcAdmin = {
    open:   showOverlay,
    close:  hideOverlay,
    nav:    switchView,
    isAuth: isAuthed
  };

})();
