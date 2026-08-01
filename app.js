/**
 * Construction Hub v3.3 - Enterprise Site & Financial Management
 * Premium PWA with Google Drive / Google Sheets Cloud Sync Integration
 */
(function () {
  'use strict';

  // ==============================
  // DATA LAYER & DEFAULTS (CLEAN INITIAL DATA)
  // ==============================
  const DATA_VERSION = 'v3.3.2_operational_pulse';
  const CLOUD_SYNC_DELAY = 800;
  const DEFAULT_LOG_PHOTO = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80';

  const USERS = [
    { id: 'u1', name: 'Bambang Soeprapto', role: 'CEO / Admin', initials: 'BS', color: 'bg-indigo-600', email: 'bambang@constructionhub.co.id' },
    { id: 'u2', name: 'Sarah Jenkins', role: 'Project Manager', initials: 'SJ', color: 'bg-emerald-600', email: 'sarah.j@constructionhub.co.id' },
    { id: 'u3', name: 'Mike Ross', role: 'Chief Estimator', initials: 'MR', color: 'bg-amber-600', email: 'mike.r@constructionhub.co.id' },
    { id: 'u4', name: 'PT Megah Utama', role: 'Stakeholder', initials: 'MU', color: 'bg-slate-600', email: 'client@megahutama.com' }
  ];

  const PERMS = {
    'CEO / Admin': ['edit_company', 'edit_projects', 'edit_boq', 'manage_users', 'export_data', 'add_sitelog'],
    'Project Manager': ['edit_projects', 'add_sitelog', 'export_data'],
    'Chief Estimator': ['edit_boq', 'export_data'],
    'Stakeholder': []
  };

  // Minimal Seed Data: Only 1 sample project
  const DEFAULT_PROJECTS = [
    {
      id: 1, name: 'Proyek Contoh: Skyline Tower', status: 'In Progress', budget: 25500000000, spent: 14200000000, completion: 65,
      manager: 'Sarah Jenkins', location: 'SCBD, Jakarta Selatan', dueDate: '2026-11-15',
      cashflow: [
        { month: 'Jan', budgeted: 2000000000, actual: 1800000000 },
        { month: 'Feb', budgeted: 2500000000, actual: 2300000000 },
        { month: 'Mar', budgeted: 3000000000, actual: 3200000000 },
        { month: 'Apr', budgeted: 2800000000, actual: 2750000000 },
        { month: 'Mei', budgeted: 3200000000, actual: 2100000000 },
        { month: 'Jun', budgeted: 2500000000, actual: 2050000000 },
      ],
      phases: [
        { id: 101, name: 'Persiapan Lahan & Excavation', status: 'Completed', progress: 100, start: '2026-01-10', end: '2026-03-01' },
        { id: 102, name: 'Pekerjaan Fondasi & Substructure', status: 'Completed', progress: 100, start: '2026-03-02', end: '2026-06-15' },
        { id: 103, name: 'Struktur Atas & Steel Framing', status: 'In Progress', progress: 55, start: '2026-06-16', end: '2026-09-30' },
        { id: 104, name: 'Instalasi MEP (M/E/P)', status: 'In Progress', progress: 15, start: '2026-09-01', end: '2026-11-01' },
        { id: 105, name: 'Finishing Interior & Arsitektural', status: 'Pending', progress: 0, start: '2026-10-01', end: '2026-11-15' }
      ]
    }
  ];

  const DEFAULT_BOQ = [
    { id: 1, name: 'Beton ReadyMix K-350 Slump 12±2', category: 'Material', quantity: 650, unit: 'm³', unitCost: 1350000 },
    { id: 2, name: 'Upah Tukang Batu & Pembesian', category: 'Labor', quantity: 1200, unit: 'HOK', unitCost: 175000 },
    { id: 3, name: 'Sewa Excavator Komatsu PC200-8MO', category: 'Equipment', quantity: 180, unit: 'Jam', unitCost: 380000 }
  ];

  const DEFAULT_LOGS = [
    { id: 101, date: '2026-08-01', project: 'Proyek Contoh: Skyline Tower', author: 'Sarah Jenkins', summary: 'Pengecoran plat lantai 12 berhasil dengan 14 truk ready mix K-350. Slump test passed. Curing compound telah diaplikasikan.', workers: 48, safety: 'PASS', safetyNote: 'Toolbox meeting selesai dan area kerja dinyatakan aman.', photo: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=600&q=80' }
  ];

  const NOTIFICATIONS = [
    { id: 1, type: 'info', title: 'Selamat Datang di Construction Hub', desc: 'Sistem siap digunakan. Tambahkan proyek baru dari tombol (+)', time: 'Baru saja', read: false }
  ];

  // ==============================
  // STATE ENGINE (localStorage & Cloud)
  // ==============================
  const load = (k, d) => { try { const v = localStorage.getItem('chub_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const clone = value => JSON.parse(JSON.stringify(value));
  const textValue = (value, fallback = '') => typeof value === 'string' && value.trim() ? value.trim() : fallback;
  const numberValue = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  const clamp = (value, min, max) => Math.min(max, Math.max(min, numberValue(value, min)));
  const todayISO = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 10);
  };
  const addDaysISO = (dateValue, days) => {
    const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(String(dateValue || '')) ? String(dateValue) : todayISO();
    const date = new Date(`${safeDate}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  };
  const validDate = (value, fallback = todayISO()) => {
    const candidate = String(value || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(candidate)) return fallback;
    const parsed = new Date(`${candidate}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === candidate ? candidate : fallback;
  };
  const safeImageUrl = value => {
    try {
      const url = new URL(String(value || ''));
      return url.protocol === 'https:' ? url.href : DEFAULT_LOG_PHOTO;
    } catch (e) {
      return DEFAULT_LOG_PHOTO;
    }
  };

  function normalizeProject(project = {}, index = 0) {
    const phases = Array.isArray(project.phases) ? project.phases.map((phase, phaseIndex) => {
      const progress = clamp(phase.progress, 0, 100);
      return {
        id: numberValue(phase.id, Date.now() + index * 100 + phaseIndex),
        name: textValue(phase.name, `Fase ${phaseIndex + 1}`),
        status: progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Pending',
        progress,
        start: validDate(phase.start),
        end: validDate(phase.end, validDate(project.dueDate, addDaysISO(todayISO(), 365)))
      };
    }) : [];
    const completion = phases.length
      ? Math.round(phases.reduce((total, phase) => total + phase.progress, 0) / phases.length)
      : clamp(project.completion, 0, 100);
    const fallbackStatus = completion === 100 ? 'Completed' : completion > 0 ? 'In Progress' : 'Planning';
    return {
      id: numberValue(project.id, Date.now() + index),
      name: textValue(project.name, `Proyek ${index + 1}`),
      status: fallbackStatus,
      budget: Math.max(0, numberValue(project.budget)),
      spent: Math.max(0, numberValue(project.spent)),
      completion,
      manager: textValue(project.manager, 'Belum ditentukan'),
      location: textValue(project.location, 'Lokasi belum ditentukan'),
      dueDate: validDate(project.dueDate, addDaysISO(todayISO(), 365)),
      cashflow: Array.isArray(project.cashflow) ? project.cashflow.map(cf => ({
        month: textValue(cf.month, '-'),
        budgeted: Math.max(0, numberValue(cf.budgeted)),
        actual: Math.max(0, numberValue(cf.actual))
      })) : [],
      phases
    };
  }

  function normalizeBoqItem(item = {}, index = 0) {
    const categories = ['Material', 'Labor', 'Equipment', 'Subcontractor'];
    return {
      id: numberValue(item.id, Date.now() + index),
      name: textValue(item.name, `Item ${index + 1}`),
      category: categories.includes(item.category) ? item.category : 'Material',
      quantity: Math.max(0, numberValue(item.quantity)),
      unit: textValue(item.unit, 'pcs'),
      unitCost: Math.max(0, numberValue(item.unitCost))
    };
  }

  function normalizeLog(log = {}, index = 0) {
    return {
      id: numberValue(log.id, Date.now() + index),
      date: validDate(log.date),
      project: textValue(log.project, 'Proyek tidak diketahui'),
      author: textValue(log.author, 'Pengawas lapangan'),
      summary: textValue(log.summary, 'Tidak ada ringkasan.'),
      workers: Math.max(0, Math.round(numberValue(log.workers))),
      safety: log.safety === 'WARNING' ? 'WARNING' : 'PASS',
      safetyNote: textValue(log.safetyNote, log.safety === 'WARNING' ? 'Perlu tindak lanjut K3.' : ''),
      photo: safeImageUrl(log.photo)
    };
  }

  function normalizeNotification(notification = {}, index = 0) {
    return {
      id: numberValue(notification.id, Date.now() + index),
      type: ['info', 'warning', 'success', 'error'].includes(notification.type) ? notification.type : 'info',
      title: textValue(notification.title, 'Notifikasi'),
      desc: textValue(notification.desc, ''),
      time: textValue(notification.time, ''),
      read: notification.read === true
    };
  }

  const persistLocal = (k, v) => {
    try {
      localStorage.setItem('chub_' + k, JSON.stringify(v));
      return true;
    } catch (e) {
      console.warn(`[Storage] Gagal menyimpan ${k}:`, e);
      return false;
    }
  };
  const save = (k, v, options = {}) => {
    const saved = persistLocal(k, v);
    if (saved && options.sync !== false && state.googleSheetUrl && ['projects', 'boq', 'logs'].includes(k)) {
      queueGoogleSheetsPush();
    }
    return saved;
  };

  const loadedProjects = load('projects', DEFAULT_PROJECTS);
  const loadedBoq = load('boq', DEFAULT_BOQ);
  const loadedLogs = load('logs', DEFAULT_LOGS);
  const loadedNotifs = load('notifs', NOTIFICATIONS);
  const loadedUser = load('user', USERS[0]);
  const loadedGoogleSheetUrl = load('googleSheetUrl', '');

  let state = {
    projects: (Array.isArray(loadedProjects) ? loadedProjects : DEFAULT_PROJECTS).map(normalizeProject),
    boq: (Array.isArray(loadedBoq) ? loadedBoq : DEFAULT_BOQ).map(normalizeBoqItem),
    logs: (Array.isArray(loadedLogs) ? loadedLogs : DEFAULT_LOGS).map(normalizeLog),
    notifs: (Array.isArray(loadedNotifs) ? loadedNotifs : clone(NOTIFICATIONS)).filter(item => item && typeof item === 'object').map(normalizeNotification),
    user: USERS.find(user => user.id === loadedUser?.id) || USERS[0],
    revenue: Math.max(0, numberValue(load('revenue', 30000000000), 30000000000)),
    budget: Math.max(0, numberValue(load('budget', 25500000000), 25500000000)),
    dark: load('dark', true) !== false,
    googleSheetUrl: typeof loadedGoogleSheetUrl === 'string' && /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(loadedGoogleSheetUrl) ? loadedGoogleSheetUrl : '',
    syncing: false,
    tab: 'dashboard',
    detailId: null,
    search: '',
    boqFilter: 'All',
    boqSort: 'name',
    showNotifs: false,
    showUserMenu: false,
    editingBoqId: null,
    newBoqId: null,
    lastSyncAt: null,
  };

  let deferredPWA = null;
  let syncTimer = null;
  let syncQueued = false;

  // Non-destructive migration: preserve user data while normalizing the schema
  try {
    if (localStorage.getItem('chub_ver') !== DATA_VERSION) {
      persistLocal('projects', state.projects);
      persistLocal('boq', state.boq);
      persistLocal('logs', state.logs);
      localStorage.setItem('chub_ver', DATA_VERSION);
    }
  } catch (e) {}

  // Clear all localStorage and reset to 1 sample project
  function resetToSample() {
    localStorage.removeItem('chub_projects');
    localStorage.removeItem('chub_boq');
    localStorage.removeItem('chub_logs');
    localStorage.removeItem('chub_notifs');
    state.projects = clone(DEFAULT_PROJECTS).map(normalizeProject);
    state.boq = clone(DEFAULT_BOQ).map(normalizeBoqItem);
    state.logs = clone(DEFAULT_LOGS).map(normalizeLog);
    state.notifs = clone(NOTIFICATIONS);
    save('projects', state.projects, { sync: false });
    save('boq', state.boq, { sync: false });
    save('logs', state.logs, { sync: false });
    save('notifs', state.notifs, { sync: false });
    queueGoogleSheetsPush();
  }

  // ==============================
  // GOOGLE SHEETS CLOUD SYNC ENGINE
  // ==============================
  function queueGoogleSheetsPush() {
    if (!state.googleSheetUrl) return;
    syncQueued = true;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      syncTimer = null;
      pushToGoogleSheets();
    }, CLOUD_SYNC_DELAY);
  }

  function pushToGoogleSheets() {
    if (!state.googleSheetUrl) return;
    if (state.syncing) {
      syncQueued = true;
      return;
    }
    syncQueued = false;
    state.syncing = true;
    renderHeaderSyncStatus();

    fetch(state.googleSheetUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        projects: state.projects,
        boq: state.newBoqId ? state.boq.filter(item => item.id !== state.newBoqId) : state.boq,
        siteLogs: state.logs,
        user: state.user.name
      })
    }).then(() => {
      state.syncing = false;
      state.lastSyncAt = new Date();
      renderHeaderSyncStatus();
      console.log('[GoogleSheets] Data dikirim ke Apps Script');
    }).catch(err => {
      state.syncing = false;
      renderHeaderSyncStatus();
      console.warn('[GoogleSheets] Push error:', err);
      toast('Data tersimpan lokal, tetapi pengiriman ke Google Drive gagal', 'warning');
    }).finally(() => {
      if (syncQueued) queueGoogleSheetsPush();
    });
  }

  function pullFromGoogleSheets() {
    if (!state.googleSheetUrl) return;
    if (state.syncing) return toast('Sinkronisasi masih berlangsung', 'info');
    clearTimeout(syncTimer);
    syncTimer = null;
    syncQueued = false;
    state.syncing = true;
    toast('Menghubungkan ke Google Drive...', 'info');
    renderHeaderSyncStatus();

    fetch(state.googleSheetUrl)
      .then(res => res.json())
      .then(res => {
        state.syncing = false;
        if (res && Array.isArray(res.projects) && res.projects.length) {
          state.projects = res.projects.map(normalizeProject);
          save('projects', state.projects, { sync: false });
        }
        if (res && Array.isArray(res.boq) && res.boq.length) {
          state.boq = res.boq.map(normalizeBoqItem);
          save('boq', state.boq, { sync: false });
        }
        if (res && Array.isArray(res.siteLogs) && res.siteLogs.length) {
          state.logs = res.siteLogs.map(normalizeLog);
          save('logs', state.logs, { sync: false });
        }
        state.lastSyncAt = new Date();
        toast('Data terbaru berhasil ditarik dari Google Drive', 'success');
        render();
      })
      .catch(err => {
        state.syncing = false;
        renderHeaderSyncStatus();
        console.warn('[GoogleSheets] Pull error:', err);
        toast('Gagal menarik dari Google Drive (Cek URL Script)', 'warning');
      });
  }

  function renderHeaderSyncStatus() {
    const el = document.getElementById('sync-status-badge');
    if (!el) return;
    if (state.syncing) {
      el.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold animate-pulse cursor-pointer';
      el.innerHTML = `<i data-lucide="refresh-cw" class="w-3.5 h-3.5 animate-spin"></i><span>Sinkronisasi...</span>`;
    } else if (state.googleSheetUrl) {
      el.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold cursor-pointer hover:bg-emerald-500/20 transition-all';
      el.innerHTML = `<i data-lucide="cloud-check" class="w-3.5 h-3.5"></i><span class="hidden sm:inline">Google Drive Aktif</span>`;
    } else {
      el.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px] font-bold cursor-pointer hover:bg-indigo-500/10 hover:text-indigo-600 transition-all';
      el.innerHTML = `<i data-lucide="cloud-off" class="w-3.5 h-3.5"></i><span class="hidden sm:inline">Hubungkan GDrive</span>`;
    }
    if (window.lucide) lucide.createIcons({ nodes: [el] });
  }

  // ==============================
  // UTILITIES
  // ==============================
  const fmtIDR = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);
  const fmtShort = n => {
    if (!n) return 'Rp 0';
    if (n >= 1e12) return `Rp ${(n / 1e12).toFixed(1)} T`;
    if (n >= 1e9) return `Rp ${(n / 1e9).toFixed(1)} M`;
    if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(1)} Jt`;
    return fmtIDR(n);
  };
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[char]);
  const formatDate = value => {
    const safe = validDate(value, '');
    if (!safe) return '-';
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${safe}T00:00:00Z`));
  };
  const daysUntil = value => {
    const target = new Date(`${validDate(value)}T00:00:00Z`);
    const today = new Date(`${todayISO()}T00:00:00Z`);
    return Math.round((target - today) / 86400000);
  };
  const deadlineMeta = project => {
    if (project.status === 'Completed') return { label: 'Selesai', className: 'badge-success', icon: 'check-circle', days: 0 };
    const days = daysUntil(project.dueDate);
    if (days < 0) return { label: `Terlambat ${Math.abs(days)} hari`, className: 'badge-danger', icon: 'calendar-x', days };
    if (days <= 30) return { label: `${days} hari lagi`, className: 'badge-warning', icon: 'clock-3', days };
    return { label: `${days} hari lagi`, className: 'badge-info', icon: 'calendar-clock', days };
  };
  const csvCell = value => {
    let text = String(value ?? '');
    if (/^[=+\-@]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  const isValidGoogleScriptUrl = value => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && url.hostname === 'script.google.com' && /\/macros\/s\/.+\/exec$/.test(url.pathname);
    } catch (e) {
      return false;
    }
  };
  const hasPerm = p => (PERMS[state.user.role] || []).includes(p);
  const unreadCount = () => state.notifs.filter(n => !n.read).length;

  function toast(msg, type = 'info') {
    const el = document.createElement('div');
    const bg = { success: 'bg-emerald-600', error: 'bg-rose-600', warning: 'bg-amber-600', info: 'bg-indigo-600' }[type] || 'bg-indigo-600';
    const icon = { success: 'check-circle', error: 'alert-triangle', warning: 'alert-circle', info: 'info' }[type] || 'info';
    el.className = `toast ${bg} text-white`;
    el.innerHTML = `<i data-lucide="${icon}" class="w-5 h-5 shrink-0"></i><span>${msg}</span>`;
    document.body.appendChild(el);
    if (window.lucide) lucide.createIcons({ nodes: [el] });
    setTimeout(() => el.remove(), 3000);
  }

  function calc() {
    let mat = 0, lab = 0, eqp = 0, sub = 0, total = 0;
    state.boq.forEach(i => {
      const c = (i.quantity || 0) * (i.unitCost || 0);
      total += c;
      if (i.category === 'Material') mat += c;
      else if (i.category === 'Labor') lab += c;
      else if (i.category === 'Equipment') eqp += c;
      else if (i.category === 'Subcontractor') sub += c;
    });
    const profit = state.revenue - total;
    const margin = state.revenue > 0 ? ((profit / state.revenue) * 100).toFixed(1) : 0;
    const allocated = state.projects.reduce((a, p) => a + p.budget, 0);
    const spent = state.projects.reduce((a, p) => a + p.spent, 0);
    const active = state.projects.filter(p => p.status === 'In Progress').length;
    return { mat, lab, eqp, sub, total, profit, margin, allocated, spent, active };
  }

  function health(p) {
    if (p.spent > p.budget) return { t: 'Over Budget', badge: 'badge-danger', icon: 'alert-triangle' };
    const exp = p.completion / 100, act = p.budget > 0 ? p.spent / p.budget : 0;
    if (act > exp + 0.15) return { t: 'At Risk', badge: 'badge-warning', icon: 'alert-circle' };
    return { t: 'On Track', badge: 'badge-success', icon: 'check-circle' };
  }

  // PWA install
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPWA = e;
    if (document.getElementById('app-root')) render();
  });
  window.addEventListener('appinstalled', () => {
    deferredPWA = null;
    toast('Construction Hub berhasil diinstal', 'success');
    render();
  });

  // ==============================
  // RENDER CORE
  // ==============================
  function render() {
    const root = document.getElementById('app-root');
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.style.display = 'none';

    if (state.dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');

    const c = calc();

    root.innerHTML = `
      ${headerHTML(c)}
      <main class="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        ${tabContent(c)}
      </main>
      ${mobileNavHTML()}
      ${hasPerm('edit_projects') ? `<button id="fab-btn" class="fab-btn no-print" title="Tambah Proyek"><i data-lucide="plus" class="w-7 h-7"></i></button>` : ''}
      <div id="modal-root"></div>
    `;

    if (window.lucide) lucide.createIcons();
    bind();
  }

  // ==============================
  // HEADER
  // ==============================
  function headerHTML(c) {
    return `
    <header class="sticky top-0 z-40 glass no-print transition-all">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        <!-- Logo -->
        <div class="flex items-center gap-3 shrink-0">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <i data-lucide="building-2" class="w-5 h-5"></i>
          </div>
          <div class="hidden sm:block">
            <h1 class="text-sm font-black tracking-tight flex items-center gap-2">
              CONSTRUCTION HUB
              <span class="text-[9px] bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-2 py-0.5 rounded-full font-bold">PRO v3.3</span>
            </h1>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Enterprise Management</p>
          </div>
        </div>

        <!-- Desktop Nav -->
        <nav class="hidden lg:flex items-center bg-slate-100/80 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/30">
          ${['dashboard|layout-dashboard|Dashboard', 'projects|folder-kanban|Proyek', 'boq|calculator|BOQ / RAB', 'sitelog|clipboard-check|Log Lapangan', 'pam|shield-check|PAM'].map(t => {
            const [id, icon, label] = t.split('|');
            const active = state.tab === id;
            return `<button class="tab-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${active ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}" data-tab="${id}"><i data-lucide="${icon}" class="w-3.5 h-3.5"></i>${label}</button>`;
          }).join('')}
        </nav>

        <!-- Actions -->
        <div class="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <!-- Google Drive Sync Status Badge -->
          <div id="sync-status-badge"></div>

          ${deferredPWA ? `<button id="pwa-btn" class="hidden sm:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-2 rounded-xl shadow-md shadow-emerald-600/20 transition-all"><i data-lucide="download" class="w-3.5 h-3.5"></i>Install</button>` : ''}
          
          <button id="dark-btn" class="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" title="Theme">
            <i data-lucide="${state.dark ? 'sun' : 'moon'}" class="w-5 h-5"></i>
          </button>

          <!-- Notifications -->
          <div class="relative">
            <button id="notif-btn" class="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all relative">
              <i data-lucide="bell" class="w-5 h-5"></i>
              ${unreadCount() > 0 ? `<span class="notif-badge">${unreadCount()}</span>` : ''}
            </button>
            ${state.showNotifs ? notifDropdownHTML() : ''}
          </div>

          <!-- User Menu -->
          <button id="user-btn" class="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 hover:border-indigo-400 transition-all">
            <div class="w-8 h-8 rounded-lg ${state.user.color} text-white flex items-center justify-center font-black text-[11px] shadow-sm">${state.user.initials}</div>
            <div class="hidden sm:block text-left pr-1">
              <p class="text-[11px] font-bold leading-none">${state.user.name.split(' ')[0]}</p>
              <p class="text-[9px] font-semibold text-indigo-500 dark:text-indigo-400">${state.user.role.split(' / ')[0]}</p>
            </div>
          </button>
        </div>
      </div>
    </header>`;
  }

  function notifDropdownHTML() {
    return `
      <div class="notif-dropdown" id="notif-dropdown">
        <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 class="text-sm font-black">Notifikasi</h3>
          <button id="mark-all-read" class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Tandai Semua Dibaca</button>
        </div>
        <div class="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
          ${state.notifs.map(n => {
            const ic = { warning: 'alert-triangle', success: 'check-circle', info: 'info', danger: 'alert-octagon' }[n.type] || 'info';
            const col = { warning: 'text-amber-500', success: 'text-emerald-500', info: 'text-indigo-500', danger: 'text-rose-500' }[n.type];
            return `
              <div class="p-4 flex items-start gap-3 ${n.read ? 'opacity-60' : ''} hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div class="${col} mt-0.5"><i data-lucide="${ic}" class="w-4 h-4"></i></div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-bold">${escapeHTML(n.title)}</p>
                  <p class="text-[11px] text-slate-500 mt-0.5">${escapeHTML(n.desc)}</p>
                  <p class="text-[10px] text-slate-400 mt-1">${escapeHTML(n.time)}</p>
                </div>
                ${!n.read ? '<div class="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>' : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>`;
  }

  function mobileNavHTML() {
    const items = [
      ['dashboard', 'layout-dashboard', 'Dashboard'],
      ['projects', 'folder-kanban', 'Proyek'],
      ['boq', 'calculator', 'RAB'],
      ['sitelog', 'clipboard-check', 'Log'],
      ['pam', 'shield-check', 'PAM']
    ];
    return `
      <div class="mobile-bottom-nav no-print">
        ${items.map(([id, icon, label]) =>
          `<button class="mobile-nav-item ${state.tab === id ? 'active' : ''}" data-tab="${id}">
            <i data-lucide="${icon}" class="w-5 h-5"></i><span>${label}</span>
          </button>`
        ).join('')}
      </div>`;
  }

  // ==============================
  // TAB ROUTER
  // ==============================
  function tabContent(c) {
    switch (state.tab) {
      case 'dashboard': return dashboardHTML(c);
      case 'projects': return projectsHTML();
      case 'boq': return boqHTML(c);
      case 'sitelog': return sitelogHTML();
      case 'pam': return pamHTML();
      case 'detail': return detailHTML();
      default: return dashboardHTML(c);
    }
  }

  // ==============================
  // 1. DASHBOARD
  // ==============================
  function dashboardHTML(c) {
    const totalProjects = state.projects.length;
    const completedProjects = state.projects.filter(p => p.status === 'Completed').length;
    const overdueProjects = state.projects.filter(p => p.status !== 'Completed' && daysUntil(p.dueDate) < 0);
    const dueSoonProjects = state.projects.filter(p => p.status !== 'Completed' && daysUntil(p.dueDate) >= 0 && daysUntil(p.dueDate) <= 30);
    const warningLogs = state.logs.filter(log => log.safety === 'WARNING');
    const todayLogs = state.logs.filter(log => log.date === todayISO());
    const workersToday = todayLogs.reduce((total, log) => total + log.workers, 0);
    const latestWarning = [...warningLogs].sort((a, b) => b.date.localeCompare(a.date))[0];
    return `
    <div class="space-y-6 animate-fade-in">
      <!-- Greeting -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p class="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Dashboard Overview</p>
          <h2 class="text-2xl sm:text-3xl font-black tracking-tight">Selamat ${new Date().getHours() < 12 ? 'Pagi' : new Date().getHours() < 17 ? 'Siang' : 'Malam'}, ${escapeHTML(state.user.name.split(' ')[0])} 👋</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Berikut ringkasan portofolio konstruksi Anda hari ini.</p>
        </div>
        <div class="flex gap-2 flex-wrap">
          <button id="reset-sample-btn" class="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-3 py-2 rounded-xl transition-all">
            <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>Reset 1 Proyek
          </button>
          <button id="gdrive-modal-btn" class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all">
            <i data-lucide="cloud-cog" class="w-4 h-4"></i>${state.googleSheetUrl ? 'Pengaturan Google Drive' : 'Hubungkan Google Drive'}
          </button>
          <button id="export-pdf-btn" class="flex items-center gap-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all">
            <i data-lucide="printer" class="w-4 h-4"></i>Cetak Laporan
          </button>
        </div>
      </div>

      <!-- KPI Cards Row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        ${kpiCard('Total Budget Portofolio', fmtShort(c.allocated), `${totalProjects} Proyek Terdaftar`, 'landmark', 'from-indigo-500 to-violet-600', 0)}
        ${kpiCard('Total Realisasi Biaya', fmtShort(c.spent), `${((c.spent / (c.allocated || 1)) * 100).toFixed(0)}% dari Alokasi`, 'wallet', 'from-emerald-500 to-teal-600', 1)}
        ${kpiCard('Estimasi Gross Margin', `${c.margin}%`, `${fmtShort(c.profit)} Estimasi Profit`, 'trending-up', 'from-amber-500 to-orange-600', 2)}
        ${kpiCard('Proyek Aktif & Selesai', `${c.active} / ${completedProjects}`, `${totalProjects} Proyek Total`, 'activity', 'from-cyan-500 to-blue-600', 3)}
      </div>

      <!-- Mid Section -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <!-- Donut Chart -->
        <div class="lg:col-span-3 card p-6">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-sm font-black flex items-center gap-2"><i data-lucide="pie-chart" class="w-4 h-4 text-indigo-500"></i>Komposisi Biaya RAB</h3>
            <span class="text-[11px] text-slate-400 font-semibold">Total: ${fmtShort(c.total)}</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div class="flex justify-center relative">${donutSVG(c)}</div>
            <div class="space-y-4">
              ${legendRow('Material & Bahan', c.mat, c.total, '#4f46e5')}
              ${legendRow('Tenaga Kerja', c.lab, c.total, '#f59e0b')}
              ${legendRow('Peralatan Berat', c.eqp, c.total, '#10b981')}
              ${legendRow('Subkontraktor', c.sub, c.total, '#8b5cf6')}
            </div>
          </div>
        </div>

        <!-- Operational pulse: sourced from actual project and site-log data -->
        <div class="lg:col-span-2 card-gradient-blue rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-black uppercase tracking-[0.15em] text-indigo-300">Operational Pulse</span>
              <i data-lucide="shield-check" class="w-5 h-5 text-emerald-300"></i>
            </div>
            <h4 class="text-lg font-black mt-3">K3 & Tenggat Proyek</h4>
            <p class="text-xs text-indigo-200/70 mt-1">Ringkasan langsung dari log lapangan dan jadwal proyek.</p>
          </div>
          <div class="grid grid-cols-3 gap-2 my-4">
            <button class="tab-btn p-3 rounded-xl bg-white/10 border border-white/10 text-left hover:bg-white/15 transition-all" data-tab="sitelog">
              <span class="text-[9px] text-indigo-200/70 font-bold uppercase">Warning K3</span>
              <p class="text-xl font-black mt-1">${warningLogs.length}</p>
            </button>
            <button class="tab-btn p-3 rounded-xl bg-white/10 border border-white/10 text-left hover:bg-white/15 transition-all" data-tab="projects">
              <span class="text-[9px] text-indigo-200/70 font-bold uppercase">Tenggat ≤30 hari</span>
              <p class="text-xl font-black mt-1">${dueSoonProjects.length}</p>
            </button>
            <div class="p-3 rounded-xl bg-white/10 border border-white/10">
              <span class="text-[9px] text-indigo-200/70 font-bold uppercase">Pekerja Hari Ini</span>
              <p class="text-xl font-black mt-1">${workersToday}</p>
            </div>
          </div>
          ${overdueProjects.length ? `
            <div class="p-3 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center gap-2 text-xs">
              <i data-lucide="alert-triangle" class="w-4 h-4 text-amber-400 shrink-0"></i>
              <span class="font-bold text-amber-200">${overdueProjects.length} proyek melewati target penyelesaian.</span>
            </div>
          ` : latestWarning ? `
            <div class="p-3 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center gap-2 text-xs">
              <i data-lucide="shield-alert" class="w-4 h-4 text-amber-400 shrink-0"></i>
              <span class="font-bold text-amber-200 truncate">Tindak lanjut K3: ${escapeHTML(latestWarning.project)}</span>
            </div>
          ` : '<div class="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center gap-2 text-xs"><i data-lucide="shield-check" class="w-4 h-4 text-emerald-300"></i><span class="font-bold text-emerald-200">Tidak ada peringatan K3 aktif</span></div>'}
        </div>
      </div>

      <!-- Projects Summary Table -->
      <div class="card overflow-hidden">
        <div class="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 class="text-sm font-black flex items-center gap-2"><i data-lucide="briefcase" class="w-4 h-4 text-indigo-500"></i>Daftar Proyek</h3>
          <button class="tab-btn text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline" data-tab="projects">Lihat Semua →</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 dark:bg-slate-800/30 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <tr><th class="p-4">Proyek</th><th class="p-4 hidden sm:table-cell">Manager</th><th class="p-4">Budget</th><th class="p-4 hidden md:table-cell">Spent</th><th class="p-4">Progres</th><th class="p-4">Kesehatan</th><th class="p-4 text-right">Detail</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              ${state.projects.map(p => {
                const h = health(p);
                return `<tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td class="p-4"><p class="font-bold text-slate-900 dark:text-white">${escapeHTML(p.name)}</p><p class="text-[10px] text-slate-400 mt-0.5">${escapeHTML(p.location)}</p></td>
                  <td class="p-4 hidden sm:table-cell font-medium text-slate-600 dark:text-slate-300">${escapeHTML(p.manager)}</td>
                  <td class="p-4 font-bold">${fmtShort(p.budget)}</td>
                  <td class="p-4 font-bold hidden md:table-cell">${fmtShort(p.spent)}</td>
                  <td class="p-4"><div class="flex items-center gap-2"><div class="w-16 sm:w-24 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden"><div class="bg-indigo-500 h-full rounded-full" style="width:${p.completion}%"></div></div><span class="font-black text-xs">${p.completion}%</span></div></td>
                  <td class="p-4"><span class="badge ${h.badge}"><i data-lucide="${h.icon}" class="w-3 h-3"></i>${h.t}</span></td>
                  <td class="p-4 text-right"><button class="open-detail text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:underline" data-id="${p.id}">Lihat →</button></td>
                </tr>`;
              }).join('') || '<tr><td colspan="7" class="p-10 text-center text-slate-400">Belum ada proyek. Tambahkan proyek pertama Anda.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  }

  function kpiCard(label, value, sub, icon, gradient, delay) {
    return `
      <div class="kpi-card card p-5 animate-slide-up delay-${delay * 100 + 100}" style="animation-fill-mode: both">
        <div class="flex items-start justify-between">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">${label}</span>
          <div class="p-2 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg">
            <i data-lucide="${icon}" class="w-4 h-4"></i>
          </div>
        </div>
        <p class="text-xl sm:text-2xl font-black mt-2 counter-value">${value}</p>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">${sub}</p>
      </div>`;
  }

  function legendRow(label, val, total, color) {
    const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
    return `
      <div class="flex items-center justify-between text-xs group">
        <div class="flex items-center gap-2.5">
          <span class="w-3 h-3 rounded-full shadow-sm" style="background:${color}"></span>
          <span class="font-semibold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">${label}</span>
        </div>
        <div class="font-bold">
          ${fmtShort(val)} <span class="text-slate-400 text-[10px] font-medium">(${pct}%)</span>
        </div>
      </div>`;
  }

  function donutSVG(c) {
    const total = c.total || 1;
    const slices = [
      { v: c.mat, color: '#4f46e5' }, { v: c.lab, color: '#f59e0b' },
      { v: c.eqp, color: '#10b981' }, { v: c.sub, color: '#8b5cf6' }
    ];
    let cum = 0;
    const gc = p => [Math.cos(2 * Math.PI * p), Math.sin(2 * Math.PI * p)];
    const paths = slices.map(s => {
      if (!s.v) return '';
      const sp = cum, sl = s.v / total; cum += sl;
      if (sl >= 0.999) return `<circle cx="0" cy="0" r="1" fill="${s.color}"/>`;
      const [sx, sy] = gc(sp), [ex, ey] = gc(cum);
      return `<path d="M ${sx} ${sy} A 1 1 0 ${sl > 0.5 ? 1 : 0} 1 ${ex} ${ey} L 0 0" fill="${s.color}" class="hover:opacity-80 transition-opacity cursor-pointer"/>`;
    }).join('');
    return `
      <svg viewBox="-1 -1 2 2" class="w-44 h-44 sm:w-52 sm:h-52 transform -rotate-90 filter drop-shadow-md">${paths}<circle cx="0" cy="0" r="0.68" class="fill-white dark:fill-[#0f1629]"/></svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span class="text-[9px] font-black uppercase text-slate-400 tracking-widest">Total RAB</span>
        <span class="text-sm sm:text-base font-black">${fmtShort(c.total)}</span>
      </div>`;
  }

  // ==============================
  // 2. PROJECTS
  // ==============================
  function projectsHTML() {
    return `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p class="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Project Management</p>
          <h2 class="text-2xl font-black tracking-tight">Proyek Konstruksi (${state.projects.length})</h2>
          <p id="project-result-count" class="text-xs text-slate-400 mt-1"></p>
        </div>
        <div class="flex items-center gap-3">
          <div class="relative flex-1 sm:w-60">
            <i data-lucide="search" class="w-4 h-4 absolute left-3 top-2.5 text-slate-400"></i>
            <input id="search-input" type="search" value="${escapeHTML(state.search)}" placeholder="Cari proyek / lokasi / PM..." autocomplete="off" class="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"/>
          </div>
          ${hasPerm('edit_projects') ? `<button id="add-project-btn" class="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all shrink-0"><i data-lucide="plus" class="w-4 h-4"></i>Tambah</button>` : ''}
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        ${state.projects.map((p, i) => {
          const h = health(p);
          return `
          <div class="project-card card p-0 animate-slide-up" data-search="${encodeURIComponent(`${p.name} ${p.location} ${p.manager}`.toLowerCase())}" style="animation-delay: ${i * 80}ms; animation-fill-mode: both">
            <!-- Card Top Gradient -->
            <div class="h-2 bg-gradient-to-r ${p.status === 'Completed' ? 'from-emerald-500 to-teal-500' : p.status === 'In Progress' ? 'from-indigo-500 to-violet-500' : 'from-slate-400 to-slate-500'}"></div>
            <div class="p-5 space-y-4">
              <div class="flex items-start justify-between gap-2">
                <span class="badge ${p.status === 'Completed' ? 'badge-success' : p.status === 'In Progress' ? 'badge-info' : 'badge-neutral'}">${p.status}</span>
                <span class="badge ${h.badge}"><i data-lucide="${h.icon}" class="w-3 h-3"></i>${h.t}</span>
              </div>
              <div>
                <h3 class="text-base font-black hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer open-detail transition-colors" data-id="${p.id}">${escapeHTML(p.name)}</h3>
                <p class="text-[11px] text-slate-500 mt-1 flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3 text-indigo-500"></i>${escapeHTML(p.location)}</p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl space-y-2.5 border border-slate-100 dark:border-slate-700/30">
                <div class="flex justify-between text-xs"><span class="text-slate-400">Budget</span><span class="font-bold">${fmtShort(p.budget)}</span></div>
                <div class="flex justify-between text-xs"><span class="text-slate-400">Terpakai</span><span class="font-bold">${fmtShort(p.spent)}</span></div>
                <div>
                  <div class="flex justify-between text-xs mb-1"><span class="text-slate-500 font-medium">Progres</span><span class="font-black text-indigo-600 dark:text-indigo-400">${p.completion}%</span></div>
                  <div class="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div class="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-700" style="width:${p.completion}%"></div>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span class="text-slate-400 flex items-center gap-1"><i data-lucide="user" class="w-3 h-3"></i>${escapeHTML(p.manager)}</span>
                <button class="open-detail bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg transition-all text-[11px]" data-id="${p.id}">Detail & Gantt →</button>
              </div>
            </div>
          </div>`;
        }).join('')}
        <div id="project-empty-state" class="hidden md:col-span-2 xl:col-span-3 card p-10 text-center">
          <i data-lucide="search-x" class="w-10 h-10 mx-auto text-slate-300 mb-3"></i>
          <p class="font-bold text-slate-600 dark:text-slate-300">Proyek tidak ditemukan</p>
          <p class="text-xs text-slate-400 mt-1">Coba kata kunci nama, lokasi, atau project manager lain.</p>
        </div>
      </div>
    </div>`;
  }

  function applyProjectSearch() {
    const query = state.search.trim().toLowerCase();
    const cards = [...document.querySelectorAll('.project-card')];
    let visible = 0;
    cards.forEach(card => {
      let haystack = '';
      try { haystack = decodeURIComponent(card.dataset.search || ''); } catch (e) {}
      const matches = !query || haystack.includes(query);
      card.classList.toggle('hidden', !matches);
      if (matches) visible += 1;
    });
    document.getElementById('project-empty-state')?.classList.toggle('hidden', visible > 0);
    const count = document.getElementById('project-result-count');
    if (count) count.textContent = query ? `${visible} dari ${state.projects.length} proyek ditampilkan` : `${visible} proyek ditampilkan`;
  }

  // ==============================
  // 3. PROJECT DETAIL + GANTT + CASHFLOW
  // ==============================
  function detailHTML() {
    const p = state.projects.find(x => x.id === state.detailId);
    if (!p) return '<p class="text-center py-16 text-slate-500">Proyek tidak ditemukan.</p>';
    const h = health(p);
    const deadline = deadlineMeta(p);
    const projectLogs = state.logs.filter(log => log.project === p.name).sort((a, b) => b.date.localeCompare(a.date));
    const latestLog = projectLogs[0];
    const maxCF = Math.max(...(p.cashflow || []).map(cf => Math.max(cf.budgeted, cf.actual)), 1);
    return `
    <div class="space-y-6 animate-fade-in">
      <button id="back-btn" class="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"><i data-lucide="arrow-left" class="w-4 h-4"></i>Kembali</button>

      <!-- Hero -->
      <div class="card p-0 overflow-hidden">
        <div class="h-2 bg-gradient-to-r ${p.status === 'Completed' ? 'from-emerald-500 to-teal-500' : 'from-indigo-500 to-violet-500'}"></div>
        <div class="p-6">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 flex-wrap mb-2">
                <span class="badge ${h.badge}"><i data-lucide="${h.icon}" class="w-3 h-3"></i>${h.t}</span>
                <span class="text-[11px] text-slate-400 flex items-center gap-1"><i data-lucide="calendar" class="w-3 h-3"></i>Jatuh Tempo: ${formatDate(p.dueDate)}</span>
              </div>
              <h2 class="text-xl sm:text-2xl font-black">${escapeHTML(p.name)}</h2>
              <p class="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                <span class="flex items-center gap-1"><i data-lucide="map-pin" class="w-3.5 h-3.5 text-indigo-500"></i>${escapeHTML(p.location)}</span>
                <span class="flex items-center gap-1"><i data-lucide="user" class="w-3.5 h-3.5 text-emerald-500"></i>PM: ${escapeHTML(p.manager)}</span>
              </p>
            </div>
            <div class="flex items-center gap-3">
              ${hasPerm('edit_projects') ? `
                <div class="flex flex-col gap-2 no-print">
                  <button id="edit-project-btn" class="px-3 py-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold hover:bg-indigo-500/20 transition-all flex items-center gap-1.5"><i data-lucide="edit-2" class="w-3.5 h-3.5"></i>Edit</button>
                  <button id="delete-project-btn" class="px-3 py-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-bold hover:bg-rose-500/20 transition-all flex items-center gap-1.5"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i>Hapus</button>
                </div>
              ` : ''}
              <!-- Completion ring -->
              <div class="relative w-16 h-16">
                <svg class="w-16 h-16" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3" class="text-slate-200 dark:text-slate-700"/>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke-width="3" stroke-dasharray="${p.completion}, 100" stroke-linecap="round" class="text-indigo-500 progress-ring-circle"/>
                </svg>
                <div class="absolute inset-0 flex items-center justify-center"><span class="text-sm font-black">${p.completion}%</span></div>
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <div class="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
              <span class="text-[10px] text-slate-400 font-bold uppercase">Budget</span>
              <p class="text-sm font-black mt-0.5">${fmtShort(p.budget)}</p>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
              <span class="text-[10px] text-slate-400 font-bold uppercase">Realisasi</span>
              <p class="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">${fmtShort(p.spent)}</p>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
              <span class="text-[10px] text-slate-400 font-bold uppercase">Sisa Budget</span>
              <p class="text-sm font-black ${p.budget - p.spent < 0 ? 'text-rose-500' : ''} mt-0.5">${fmtShort(p.budget - p.spent)}</p>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
              <span class="text-[10px] text-slate-400 font-bold uppercase">Jumlah Fase</span>
              <p class="text-sm font-black mt-0.5">${p.phases.length} Fase</p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <!-- Gantt Timeline -->
        <div class="lg:col-span-3 card p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-black flex items-center gap-2"><i data-lucide="gantt-chart" class="w-4 h-4 text-indigo-500"></i>Gantt Chart Timeline</h3>
            <span class="text-[10px] text-slate-400 font-medium">Geser slider untuk update progres</span>
          </div>
          <div class="gantt-container">
            ${p.phases.map(ph => `
              <div class="gantt-row">
                <div>
                  <h4 class="text-xs font-bold">${escapeHTML(ph.name)}</h4>
                  <p class="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <i data-lucide="calendar" class="w-3 h-3"></i>${formatDate(ph.start)} → ${formatDate(ph.end)}
                  </p>
                </div>
                <div>
                  <div class="flex items-center justify-between text-xs mb-1.5">
                    <span class="phase-status-badge badge ${ph.progress === 100 ? 'badge-success' : ph.progress > 0 ? 'badge-info' : 'badge-neutral'}">${ph.status}</span>
                    <span class="phase-progress-value font-black">${ph.progress}%</span>
                  </div>
                  <div class="gantt-track">
                    <div class="phase-progress-bar gantt-bar ${ph.progress === 100 ? 'completed' : ph.progress > 0 ? 'in-progress' : 'pending'}" style="width:${Math.max(ph.progress, 2)}%">
                      ${ph.progress >= 25 ? ph.progress + '%' : ''}
                    </div>
                  </div>
                  ${hasPerm('edit_projects') ? `
                    <input type="range" min="0" max="100" value="${ph.progress}" class="phase-slider w-full mt-2" data-phase="${ph.id}" data-project="${p.id}"/>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Cash Flow Chart -->
        <div class="lg:col-span-2 card p-6 space-y-4">
          <h3 class="text-sm font-black flex items-center gap-2"><i data-lucide="bar-chart-3" class="w-4 h-4 text-indigo-500"></i>Cash Flow Bulanan</h3>
          ${(p.cashflow && p.cashflow.length) ? `
            <div class="flex items-end gap-2 justify-between px-2">
              ${p.cashflow.map(cf => `
                <div class="cashflow-bar-group">
                  <div class="cashflow-bar-container">
                    <div class="cashflow-bar bg-indigo-500/30 dark:bg-indigo-500/20" style="height: ${(cf.budgeted / maxCF) * 100}%" data-value="Rencana: ${fmtShort(cf.budgeted)}"></div>
                    <div class="cashflow-bar bg-indigo-500" style="height: ${(cf.actual / maxCF) * 100}%" data-value="Aktual: ${fmtShort(cf.actual)}"></div>
                  </div>
                  <span class="text-[10px] font-bold text-slate-500">${escapeHTML(cf.month)}</span>
                </div>
              `).join('')}
            </div>
            <div class="flex items-center justify-center gap-6 pt-2">
              <span class="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium"><span class="w-2.5 h-2.5 rounded bg-indigo-500/30 dark:bg-indigo-500/20"></span>Rencana</span>
              <span class="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium"><span class="w-2.5 h-2.5 rounded bg-indigo-500"></span>Aktual</span>
            </div>
          ` : `<p class="text-center text-xs text-slate-400 py-8">Data cash flow belum tersedia.</p>`}
        </div>
      </div>

      <!-- Project controls from schedule and site logs -->
      <div class="card p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="flex items-center gap-3">
          <div class="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"><i data-lucide="calendar-clock" class="w-7 h-7"></i></div>
          <div>
            <p class="text-[10px] font-bold uppercase text-slate-400">Kontrol Tenggat</p>
            <h4 class="text-sm font-black mt-0.5">${formatDate(p.dueDate)}</h4>
            <span class="badge ${deadline.className} mt-1"><i data-lucide="${deadline.icon}" class="w-3 h-3"></i>${deadline.label}</span>
          </div>
        </div>
        <div class="flex items-center gap-3 sm:border-l sm:border-slate-100 dark:sm:border-slate-800 sm:pl-4">
          <div class="p-3 rounded-xl ${latestLog?.safety === 'WARNING' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}"><i data-lucide="${latestLog?.safety === 'WARNING' ? 'shield-alert' : 'shield-check'}" class="w-7 h-7"></i></div>
          <div>
            <p class="text-[10px] font-bold uppercase text-slate-400">Inspeksi K3 Terakhir</p>
            <h4 class="text-sm font-black mt-0.5">${latestLog ? formatDate(latestLog.date) : 'Belum ada laporan'}</h4>
            <p class="text-xs text-slate-500 mt-1">${latestLog ? `${latestLog.workers} pekerja • K3 ${latestLog.safety}` : 'Tambahkan log lapangan untuk memulai pemantauan.'}</p>
          </div>
        </div>
      </div>
    </div>`;
  }

  // ==============================
  // 4. BOQ / RAB
  // ==============================
  function boqHTML(c) {
    let items = state.boqFilter === 'All' ? [...state.boq] : state.boq.filter(b => b.category === state.boqFilter);
    if (state.boqSort === 'cost-desc') items.sort((a, b) => (b.quantity * b.unitCost) - (a.quantity * a.unitCost));
    else if (state.boqSort === 'cost-asc') items.sort((a, b) => (a.quantity * a.unitCost) - (b.quantity * b.unitCost));
    else items.sort((a, b) => a.name.localeCompare(b.name));

    return `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p class="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Cost Estimation</p>
          <h2 class="text-2xl font-black tracking-tight">Bill of Quantities (RAB)</h2>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          ${hasPerm('edit_boq') ? `<button id="add-boq-btn" class="bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/25"><i data-lucide="plus" class="w-4 h-4"></i>Tambah Item</button>` : ''}
          <button id="csv-btn" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md"><i data-lucide="download" class="w-4 h-4"></i>Ekspor CSV</button>
        </div>
      </div>

      <!-- Revenue & Margin Meter -->
      <div class="card p-5 space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"><i data-lucide="receipt" class="w-5 h-5"></i></div>
            <div>
              <span class="text-[10px] font-bold uppercase text-slate-400">Estimasi Nilai Kontrak</span>
              <p class="text-lg font-black">${fmtIDR(state.revenue)}</p>
            </div>
          </div>
          <div class="text-right">
            <span class="text-[10px] font-bold uppercase text-slate-400">Gross Profit Margin</span>
            <p class="text-lg font-black ${Number(c.margin) >= 15 ? 'text-emerald-600' : Number(c.margin) >= 5 ? 'text-amber-600' : 'text-rose-600'}">${c.margin}%</p>
            <p class="text-[11px] text-slate-500">${fmtShort(c.profit)}</p>
          </div>
        </div>
        <div class="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          <div class="bg-gradient-to-r from-indigo-500 to-violet-500 h-full transition-all duration-500" style="width:${Math.min(100, (c.total / (state.revenue || 1)) * 100)}%"></div>
          <div class="bg-emerald-500 h-full transition-all duration-500" style="width:${Math.max(0, Number(c.margin))}%"></div>
        </div>
        <div class="flex items-center justify-between text-[10px] text-slate-400 font-medium">
          <span>Total Biaya RAB: ${fmtShort(c.total)}</span>
          <span class="flex items-center gap-3"><span class="flex items-center gap-1"><span class="w-2 h-2 rounded bg-indigo-500"></span>Biaya</span><span class="flex items-center gap-1"><span class="w-2 h-2 rounded bg-emerald-500"></span>Margin</span></span>
        </div>
      </div>

      <!-- Filter & Sort -->
      <div class="flex items-center gap-3 overflow-x-auto pb-1">
        <div class="flex items-center gap-1.5 shrink-0">
          ${['All', 'Material', 'Labor', 'Equipment', 'Subcontractor'].map(cat => `
            <button class="boq-cat-btn px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all ${state.boqFilter === cat ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25' : 'bg-white dark:bg-slate-800/50 text-slate-500 border border-slate-200 dark:border-slate-700/50 hover:text-indigo-600'}" data-cat="${cat}">${cat === 'All' ? 'Semua' : cat}</button>
          `).join('')}
        </div>
        <div class="ml-auto shrink-0">
          <select id="boq-sort" class="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-[11px] font-bold px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
            <option value="name" ${state.boqSort === 'name' ? 'selected' : ''}>Urutkan: Nama</option>
            <option value="cost-desc" ${state.boqSort === 'cost-desc' ? 'selected' : ''}>Biaya: Tertinggi</option>
            <option value="cost-asc" ${state.boqSort === 'cost-asc' ? 'selected' : ''}>Biaya: Terendah</option>
          </select>
        </div>
      </div>

      <!-- BOQ Table -->
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 dark:bg-slate-800/30 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th class="p-4">Uraian Pekerjaan / Material</th>
                <th class="p-4">Kategori</th>
                <th class="p-4">Volume</th>
                <th class="p-4">Satuan</th>
                <th class="p-4">Harga Satuan</th>
                <th class="p-4">Total Biaya</th>
                ${hasPerm('edit_boq') ? '<th class="p-4 text-right">Aksi</th>' : ''}
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              ${items.map(item => {
                const t = (item.quantity || 0) * (item.unitCost || 0);
                const isEditing = state.editingBoqId === item.id;
                const catBadge = { Material: 'badge-info', Labor: 'badge-warning', Equipment: 'badge-success', Subcontractor: 'badge-neutral' }[item.category] || 'badge-neutral';
                return `
                <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${isEditing ? 'ring-2 ring-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-900/10' : ''}">
                  <td class="p-4 font-bold max-w-[200px]">
                    ${isEditing ? `<input class="inline-edit boq-edit-field font-bold" data-id="${item.id}" data-field="name" value="${escapeHTML(item.name)}" required/>` : escapeHTML(item.name)}
                  </td>
                  <td class="p-4">
                    ${isEditing ? `<select class="inline-edit boq-edit-field font-bold" data-id="${item.id}" data-field="category">${['Material', 'Labor', 'Equipment', 'Subcontractor'].map(category => `<option value="${category}" ${category === item.category ? 'selected' : ''}>${category}</option>`).join('')}</select>` : `<span class="badge ${catBadge}">${escapeHTML(item.category)}</span>`}
                  </td>
                  <td class="p-4 font-bold">
                    ${isEditing ? `<input type="number" min="0" step="any" class="inline-edit boq-edit-field font-bold w-20" data-id="${item.id}" data-field="quantity" value="${item.quantity}"/>` : item.quantity.toLocaleString('id-ID')}
                  </td>
                  <td class="p-4 text-slate-500">${isEditing ? `<input class="inline-edit boq-edit-field font-bold w-20" data-id="${item.id}" data-field="unit" value="${escapeHTML(item.unit)}"/>` : escapeHTML(item.unit)}</td>
                  <td class="p-4 font-bold">
                    ${isEditing ? `<input type="number" min="0" step="any" class="inline-edit boq-edit-field font-bold w-32" data-id="${item.id}" data-field="unitCost" value="${item.unitCost}"/>` : fmtIDR(item.unitCost)}
                  </td>
                  <td class="p-4 font-black text-indigo-600 dark:text-indigo-400">${fmtIDR(t)}</td>
                  ${hasPerm('edit_boq') ? `
                    <td class="p-4 text-right flex items-center justify-end gap-1">
                      <button class="boq-edit-btn p-2 rounded-lg ${isEditing ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600'} transition-all" data-id="${item.id}" aria-label="${isEditing ? 'Simpan item' : 'Edit item'}">
                        <i data-lucide="${isEditing ? 'check' : 'edit-2'}" class="w-4 h-4"></i>
                      </button>
                      ${isEditing ? `<button class="boq-cancel-btn p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-all" data-id="${item.id}" aria-label="Batal edit"><i data-lucide="x" class="w-4 h-4"></i></button>` : ''}
                      <button class="boq-del-btn p-2 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 text-slate-400 hover:text-rose-600 transition-all" data-id="${item.id}" aria-label="Hapus item"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </td>
                  ` : ''}
                </tr>`;
              }).join('') || `<tr><td colspan="7" class="p-10 text-center text-slate-400">${state.boq.length ? 'Tidak ada item pada kategori ini.' : 'Belum ada item RAB.'}</td></tr>`}
            </tbody>
            <tfoot class="bg-slate-50 dark:bg-slate-800/30 border-t-2 border-indigo-500/30">
              <tr>
                <td class="p-4 font-black text-sm" colspan="${hasPerm('edit_boq') ? 5 : 5}">TOTAL RENCANA ANGGARAN BIAYA</td>
                <td class="p-4 font-black text-base text-indigo-600 dark:text-indigo-400" ${hasPerm('edit_boq') ? '' : ''}>${fmtIDR(c.total)}</td>
                ${hasPerm('edit_boq') ? '<td></td>' : ''}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>`;
  }

  // ==============================
  // 5. SITE LOG
  // ==============================
  function sitelogHTML() {
    return `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p class="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Field Reports</p>
          <h2 class="text-2xl font-black tracking-tight">Log Lapangan & Inspeksi K3</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Catatan harian pengawasan, foto proyek, & audit keselamatan kerja.</p>
        </div>
        ${hasPerm('add_sitelog') ? `<button id="add-log-btn" class="bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/25 shrink-0"><i data-lucide="plus" class="w-4 h-4"></i>Buat Laporan</button>` : ''}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        ${state.logs.map((log, i) => `
          <div class="card p-0 overflow-hidden animate-slide-up" style="animation-delay: ${i * 100}ms; animation-fill-mode: both">
            <div class="h-52 w-full overflow-hidden relative group">
              <img src="${escapeHTML(log.photo)}" alt="${escapeHTML(log.project)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy"/>
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div class="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <i data-lucide="calendar" class="w-3 h-3 text-cyan-400"></i>${formatDate(log.date)}
              </div>
              <div class="absolute bottom-3 right-3">
                <span class="badge ${log.safety === 'PASS' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}" style="font-size: 0.6rem">
                  <i data-lucide="${log.safety === 'PASS' ? 'shield-check' : 'shield-alert'}" class="w-3 h-3"></i>K3: ${log.safety}
                </span>
              </div>
              <h3 class="absolute bottom-3 left-3 text-white font-black text-sm drop-shadow-lg">${escapeHTML(log.project)}</h3>
            </div>
            <div class="p-5 space-y-3">
              <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">${escapeHTML(log.summary)}</p>
              ${log.safetyNote ? `<div class="p-3 rounded-xl ${log.safety === 'WARNING' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'} text-[11px] flex items-start gap-2"><i data-lucide="${log.safety === 'WARNING' ? 'triangle-alert' : 'clipboard-check'}" class="w-3.5 h-3.5 mt-0.5 shrink-0"></i><span>${escapeHTML(log.safetyNote)}</span></div>` : ''}
              <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                <span class="text-slate-400 flex items-center gap-1"><i data-lucide="users" class="w-3 h-3 text-indigo-500"></i>${log.workers} Pekerja</span>
                <span class="text-slate-400 flex items-center gap-1"><i data-lucide="hard-hat" class="w-3 h-3 text-amber-500"></i>K3 ${log.safety}</span>
              </div>
              <p class="text-[10px] text-slate-400">Pengawas: <span class="font-bold text-slate-600 dark:text-slate-300">${escapeHTML(log.author)}</span></p>
            </div>
          </div>
        `).join('') || '<div class="md:col-span-2 xl:col-span-3 card p-10 text-center text-slate-400">Belum ada laporan lapangan.</div>'}
      </div>
    </div>`;
  }

  // ==============================
  // 6. PAM
  // ==============================
  function pamHTML() {
    return `
    <div class="space-y-6 animate-fade-in">
      <div>
        <p class="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Security & Access</p>
        <h2 class="text-2xl font-black tracking-tight">Privileged Access Management</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Ganti peran pengguna untuk menguji otorisasi & batas akses keamanan sistem.</p>
      </div>

      <!-- Active User Hero -->
      <div class="rounded-2xl overflow-hidden relative">
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700"></div>
        <div class="absolute inset-0 opacity-10" style="background-image: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22><path d=%22M30 0L60 30L30 60L0 30Z%22 fill=%22white%22 fill-opacity=%220.1%22/></svg>'); background-size: 30px 30px;"></div>
        <div class="relative p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center gap-6">
          <div class="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-lg border border-white/20 flex items-center justify-center font-black text-3xl shadow-xl">${state.user.initials}</div>
          <div class="text-center sm:text-left flex-1">
            <h3 class="text-2xl font-black">${state.user.name}</h3>
            <p class="text-sm text-indigo-200 mt-0.5">${state.user.email}</p>
            <span class="inline-block mt-3 px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/20">${state.user.role}</span>
          </div>
          <div class="text-center sm:text-right sm:border-l border-white/20 sm:pl-6">
            <span class="text-xs text-indigo-200 block mb-2">Izin Akses Aktif:</span>
            <div class="flex flex-wrap gap-1.5 justify-center sm:justify-end">
              ${(PERMS[state.user.role] || []).map(p => `<span class="px-2.5 py-1 rounded-lg bg-white/15 text-[10px] font-bold">${p}</span>`).join('') || '<span class="text-xs italic text-indigo-200">Read-Only View</span>'}
            </div>
          </div>
        </div>
      </div>

      <!-- User Role Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        ${USERS.map(u => `
          <div class="card p-5 space-y-4 ${u.id === state.user.id ? 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/10' : ''}">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl ${u.color} text-white font-black flex items-center justify-center text-sm shadow-lg">${u.initials}</div>
              <div>
                <h4 class="text-sm font-black">${u.name}</h4>
                <p class="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">${u.role}</p>
              </div>
            </div>
            <div class="text-[11px] text-slate-500 space-y-1.5">
              <p class="font-bold text-slate-700 dark:text-slate-300 text-xs">Hak Akses:</p>
              <ul class="space-y-1">
                ${(PERMS[u.role] || []).map(p => `<li class="flex items-center gap-1.5"><i data-lucide="check" class="w-3 h-3 text-emerald-500"></i>${p}</li>`).join('') || '<li class="flex items-center gap-1.5"><i data-lucide="eye" class="w-3 h-3 text-slate-400"></i>Read-Only</li>'}
              </ul>
            </div>
            <button class="switch-user-btn w-full py-2.5 ${u.id === state.user.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white'} font-bold text-xs rounded-xl transition-all" data-uid="${u.id}">
              ${u.id === state.user.id ? '✓ Akun Aktif' : 'Ganti ke Akun Ini'}
            </button>
          </div>
        `).join('')}
      </div>
    </div>`;
  }

  // ==============================
  // EVENT BINDINGS
  // ==============================
  function bind() {
    renderHeaderSyncStatus();

    // Reset sample button
    document.getElementById('reset-sample-btn')?.addEventListener('click', () => {
      if (!window.confirm('Reset akan mengganti data proyek, RAB, dan log lokal dengan data sampel. Lanjutkan?')) return;
      resetToSample();
      toast('Data direset menjadi 1 proyek sampel', 'info');
      render();
    });

    // Sync status click -> open GDrive Modal
    document.getElementById('sync-status-badge')?.addEventListener('click', openGDriveModal);
    document.getElementById('gdrive-modal-btn')?.addEventListener('click', openGDriveModal);

    // Tab navigation
    document.querySelectorAll('.tab-btn, .mobile-nav-item').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.tab !== 'boq' && state.newBoqId) state.boq = state.boq.filter(item => item.id !== state.newBoqId);
      if (b.dataset.tab !== 'boq') {
        state.editingBoqId = null;
        state.newBoqId = null;
      }
      state.tab = b.dataset.tab;
      state.showNotifs = false;
      render();
    }));

    // Dark mode
    document.getElementById('dark-btn')?.addEventListener('click', () => { state.dark = !state.dark; save('dark', state.dark); render(); });

    // Notifications
    document.getElementById('notif-btn')?.addEventListener('click', (e) => { e.stopPropagation(); state.showNotifs = !state.showNotifs; render(); });
    document.getElementById('mark-all-read')?.addEventListener('click', () => { state.notifs.forEach(n => n.read = true); save('notifs', state.notifs); render(); });

    // PWA install
    document.getElementById('pwa-btn')?.addEventListener('click', () => { if (deferredPWA) { deferredPWA.prompt(); deferredPWA = null; } });

    // User menu -> PAM tab
    document.getElementById('user-btn')?.addEventListener('click', () => {
      if (state.newBoqId) state.boq = state.boq.filter(item => item.id !== state.newBoqId);
      state.editingBoqId = null;
      state.newBoqId = null;
      state.tab = 'pam';
      state.showNotifs = false;
      render();
    });

    // Open project detail
    document.querySelectorAll('.open-detail').forEach(b => b.addEventListener('click', () => {
      state.detailId = parseInt(b.dataset.id); state.tab = 'detail'; render();
    }));

    // Back
    document.getElementById('back-btn')?.addEventListener('click', () => { state.tab = 'projects'; render(); });

    // Search
    document.getElementById('search-input')?.addEventListener('input', e => {
      state.search = e.target.value;
      applyProjectSearch();
    });
    applyProjectSearch();

    // Phase slider
    document.querySelectorAll('.phase-slider').forEach(s => {
      const updatePhase = e => {
      const pId = parseInt(s.dataset.project), phId = parseInt(s.dataset.phase), val = clamp(e.target.value, 0, 100);
      const proj = state.projects.find(p => p.id === pId);
      if (!proj) return;
      const ph = proj.phases.find(x => x.id === phId);
      if (!ph) return;
      ph.progress = val;
      ph.status = val === 100 ? 'Completed' : val > 0 ? 'In Progress' : 'Pending';
      proj.completion = Math.round(proj.phases.reduce((a, x) => a + x.progress, 0) / proj.phases.length);
      if (proj.completion === 100) proj.status = 'Completed';
      else if (proj.completion > 0) proj.status = 'In Progress';
      else proj.status = 'Planning';
      const row = s.closest('.gantt-row');
      const value = row?.querySelector('.phase-progress-value');
      const bar = row?.querySelector('.phase-progress-bar');
      const badge = row?.querySelector('.phase-status-badge');
      if (value) value.textContent = `${val}%`;
      if (bar) {
        bar.style.width = `${Math.max(val, 2)}%`;
        bar.textContent = val >= 25 ? `${val}%` : '';
        bar.classList.toggle('completed', val === 100);
        bar.classList.toggle('in-progress', val > 0 && val < 100);
        bar.classList.toggle('pending', val === 0);
      }
      if (badge) {
        badge.textContent = ph.status;
        badge.className = `phase-status-badge badge ${val === 100 ? 'badge-success' : val > 0 ? 'badge-info' : 'badge-neutral'}`;
      }
      };
      s.addEventListener('input', updatePhase);
      s.addEventListener('change', e => {
        updatePhase(e);
        save('projects', state.projects);
        render();
      });
    });

    // BOQ category filter
    document.querySelectorAll('.boq-cat-btn').forEach(b => b.addEventListener('click', () => {
      if (state.editingBoqId) return toast('Simpan atau batalkan item yang sedang diedit', 'warning');
      state.boqFilter = b.dataset.cat;
      render();
    }));

    // BOQ sort
    document.getElementById('boq-sort')?.addEventListener('change', e => {
      if (state.editingBoqId) return toast('Simpan atau batalkan item yang sedang diedit', 'warning');
      state.boqSort = e.target.value;
      render();
    });

    // BOQ inline edit toggle
    document.querySelectorAll('.boq-edit-btn').forEach(b => b.addEventListener('click', () => {
      const id = parseInt(b.dataset.id);
      if (state.editingBoqId === id) {
        const item = state.boq.find(x => x.id === id);
        if (!item) return;
        let valid = true;
        document.querySelectorAll(`.boq-edit-field[data-id="${id}"]`).forEach(inp => {
          const field = inp.dataset.field;
          const value = inp.value.trim();
          if ((field === 'name' || field === 'unit') && !value) valid = false;
          if (field === 'quantity' || field === 'unitCost') item[field] = Math.max(0, numberValue(value));
          else item[field] = value;
        });
        if (!valid) return toast('Nama item dan satuan wajib diisi', 'warning');
        Object.assign(item, normalizeBoqItem(item));
        save('boq', state.boq);
        state.editingBoqId = null;
        state.newBoqId = null;
        toast('Item RAB berhasil diperbarui', 'success');
      } else {
        state.editingBoqId = id;
      }
      render();
    }));

    document.querySelectorAll('.boq-cancel-btn').forEach(b => b.addEventListener('click', () => {
      const id = parseInt(b.dataset.id);
      if (state.newBoqId === id) state.boq = state.boq.filter(item => item.id !== id);
      state.editingBoqId = null;
      state.newBoqId = null;
      render();
    }));

    // BOQ delete
    document.querySelectorAll('.boq-del-btn').forEach(b => b.addEventListener('click', () => {
      const id = parseInt(b.dataset.id);
      const item = state.boq.find(x => x.id === id);
      if (!item || !window.confirm(`Hapus item RAB "${item.name}"?`)) return;
      state.boq = state.boq.filter(x => x.id !== id);
      if (state.editingBoqId === id) state.editingBoqId = null;
      if (state.newBoqId === id) state.newBoqId = null;
      save('boq', state.boq);
      toast('Item RAB dihapus', 'success');
      render();
    }));

    // Add BOQ item
    document.getElementById('add-boq-btn')?.addEventListener('click', () => {
      const item = { id: Date.now(), name: 'Item Baru', category: 'Material', quantity: 1, unit: 'pcs', unitCost: 0 };
      state.boq.push(item);
      state.editingBoqId = item.id;
      state.newBoqId = item.id;
      state.boqFilter = 'All';
      render();
    });

    // Export CSV
    document.getElementById('csv-btn')?.addEventListener('click', () => {
      let csv = '\uFEFF"Uraian","Kategori","Volume","Satuan","Harga Satuan","Total"\n';
      state.boq.forEach(b => { csv += `${csvCell(b.name)},${csvCell(b.category)},${b.quantity},${csvCell(b.unit)},${b.unitCost},${b.quantity * b.unitCost}\n`; });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = `RAB_ConstructionHub_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
      toast('CSV berhasil diunduh', 'success');
    });

    // Print
    document.getElementById('export-pdf-btn')?.addEventListener('click', () => window.print());

    // Switch user (PAM)
    document.querySelectorAll('.switch-user-btn').forEach(b => b.addEventListener('click', () => {
      const u = USERS.find(x => x.id === b.dataset.uid);
      if (u) {
        if (state.newBoqId) state.boq = state.boq.filter(item => item.id !== state.newBoqId);
        state.user = u;
        save('user', u);
        state.editingBoqId = null;
        state.newBoqId = null;
        toast(`Masuk sebagai: ${u.name} (${u.role})`, 'success');
        render();
      }
    }));

    // FAB
    document.getElementById('fab-btn')?.addEventListener('click', () => openAddProjectModal());
    document.getElementById('add-project-btn')?.addEventListener('click', () => openAddProjectModal());

    document.getElementById('edit-project-btn')?.addEventListener('click', () => {
      const project = state.projects.find(item => item.id === state.detailId);
      if (project) openAddProjectModal(project);
    });
    document.getElementById('delete-project-btn')?.addEventListener('click', () => {
      if (!hasPerm('edit_projects')) return toast('Akses ditolak', 'error');
      const project = state.projects.find(item => item.id === state.detailId);
      if (!project || !window.confirm(`Hapus proyek "${project.name}" beserta jadwalnya?`)) return;
      state.projects = state.projects.filter(item => item.id !== project.id);
      save('projects', state.projects);
      state.detailId = null;
      state.tab = 'projects';
      toast('Proyek berhasil dihapus', 'success');
      render();
    });

    // Add site log
    document.getElementById('add-log-btn')?.addEventListener('click', openAddLogModal);
  }

  // ==============================
  // GOOGLE DRIVE MODAL
  // ==============================
  function openGDriveModal() {
    const root = document.getElementById('modal-root');
    root.innerHTML = `
    <div class="modal-overlay" id="modal-bg">
      <div class="modal-content p-6 space-y-5">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 class="text-base font-black flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <i data-lucide="cloud" class="w-5 h-5"></i>Google Drive / Sheets Cloud Sync
          </h3>
          <button id="close-modal" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"><i data-lucide="x" class="w-5 h-5 text-slate-400"></i></button>
        </div>
        <div class="space-y-4 text-xs">
          <p class="text-slate-600 dark:text-slate-300 leading-relaxed">
            Hubungkan aplikasi ke file Google Sheets yang ada di Google Drive Anda untuk sinkronisasi otomatis multi-user di HP & Laptop.
          </p>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">URL Google Apps Script Web App</label>
            <input type="url" id="gscript-url" value="${escapeHTML(state.googleSheetUrl)}" placeholder="https://script.google.com/macros/s/.../exec" class="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl font-mono text-[11px] focus:ring-2 focus:ring-emerald-500/30 outline-none"/>
          </div>

          <div class="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl space-y-2 text-[11px]">
            <p class="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5"><i data-lucide="info" class="w-4 h-4"></i>Belum punya URL Apps Script?</p>
            <p class="text-emerald-700 dark:text-emerald-400 leading-relaxed">
              Buka panduan lengkap pembuatan Apps Script di file <span class="font-bold underline">GOOGLE_SHEETS_SETUP.md</span> di repositori GitHub Anda.
            </p>
          </div>

          <div class="flex justify-between items-center pt-2">
            ${state.googleSheetUrl ? `<button type="button" id="pull-gdrive-btn" class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md"><i data-lucide="download-cloud" class="w-4 h-4"></i>Tarik Data Sekarang</button>` : '<div></div>'}
            <div class="flex gap-2">
              <button type="button" id="cancel-modal" class="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 font-bold rounded-xl">Tutup</button>
              <button type="button" id="save-gdrive-btn" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/25">Simpan & Hubungkan</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;

    if (window.lucide) lucide.createIcons();
    const close = () => { root.innerHTML = ''; };
    document.getElementById('close-modal').onclick = close;
    document.getElementById('cancel-modal').onclick = close;
    document.getElementById('modal-bg').addEventListener('click', e => { if (e.target.id === 'modal-bg') close(); });

    document.getElementById('save-gdrive-btn').onclick = () => {
      const url = document.getElementById('gscript-url').value.trim();
      if (url && !isValidGoogleScriptUrl(url)) {
        return toast('Gunakan URL Web App Google Apps Script yang berakhiran /exec', 'warning');
      }
      state.googleSheetUrl = url;
      save('googleSheetUrl', url);
      close();
      if (url) {
        toast('Google Drive terhubung. Menarik data terbaru...', 'success');
        pullFromGoogleSheets();
      } else {
        toast('Koneksi Google Drive dilepas', 'info');
        render();
      }
    };

    document.getElementById('pull-gdrive-btn')?.addEventListener('click', () => {
      close();
      pullFromGoogleSheets();
    });
  }

  // ==============================
  // MODALS OTHER
  // ==============================
  function openAddProjectModal(existingProject = null) {
    if (!hasPerm('edit_projects')) return toast('Akses ditolak', 'error');
    const editing = Boolean(existingProject);
    const formProject = existingProject || {
      name: '', location: '', manager: state.user.name, budget: '', spent: 0,
      dueDate: addDaysISO(todayISO(), 365)
    };
    const root = document.getElementById('modal-root');
    root.innerHTML = `
    <div class="modal-overlay" id="modal-bg">
      <div class="modal-content p-6 space-y-5">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 class="text-base font-black flex items-center gap-2"><i data-lucide="building-2" class="w-5 h-5 text-indigo-500"></i>${editing ? 'Edit Proyek' : 'Tambah Proyek Baru'}</h3>
          <button id="close-modal" aria-label="Tutup" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"><i data-lucide="x" class="w-5 h-5 text-slate-400"></i></button>
        </div>
        <form id="project-form" class="space-y-4 text-xs">
          <div><label class="block font-bold text-slate-500 mb-1.5" for="pf-name">Nama Proyek *</label><input type="text" id="pf-name" required maxlength="120" value="${escapeHTML(formProject.name)}" placeholder="Contoh: Gedung Kantor Tower C" class="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"/></div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label class="block font-bold text-slate-500 mb-1.5" for="pf-loc">Lokasi *</label><input type="text" id="pf-loc" required maxlength="120" value="${escapeHTML(formProject.location)}" placeholder="Jakarta Selatan" class="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500/30 outline-none"/></div>
            <div><label class="block font-bold text-slate-500 mb-1.5" for="pf-pm">Project Manager *</label><input type="text" id="pf-pm" required maxlength="100" value="${escapeHTML(formProject.manager)}" class="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500/30 outline-none"/></div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label class="block font-bold text-slate-500 mb-1.5" for="pf-budget">Anggaran (IDR) *</label><input type="number" min="1" step="1" id="pf-budget" required value="${formProject.budget}" placeholder="15000000000" class="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500/30 outline-none"/></div>
            <div><label class="block font-bold text-slate-500 mb-1.5" for="pf-date">Target Selesai *</label><input type="date" id="pf-date" required value="${formProject.dueDate}" class="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500/30 outline-none"/></div>
          </div>
          ${editing ? `<div><label class="block font-bold text-slate-500 mb-1.5" for="pf-spent">Realisasi Biaya (IDR)</label><input type="number" min="0" step="1" id="pf-spent" value="${formProject.spent}" class="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500/30 outline-none"/></div>` : ''}
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" id="cancel-modal" class="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 font-bold rounded-xl">Batal</button>
            <button type="submit" class="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25">${editing ? 'Simpan Perubahan' : 'Simpan Proyek'}</button>
          </div>
        </form>
      </div>
    </div>`;
    if (window.lucide) lucide.createIcons();
    const close = () => { root.innerHTML = ''; };
    document.getElementById('close-modal').onclick = close;
    document.getElementById('cancel-modal').onclick = close;
    document.getElementById('modal-bg').addEventListener('click', e => { if (e.target.id === 'modal-bg') close(); });
    document.getElementById('project-form').onsubmit = e => {
      e.preventDefault();
      const name = document.getElementById('pf-name').value.trim();
      const location = document.getElementById('pf-loc').value.trim();
      const manager = document.getElementById('pf-pm').value.trim();
      const budget = numberValue(document.getElementById('pf-budget').value);
      const dueDate = validDate(document.getElementById('pf-date').value, addDaysISO(todayISO(), 365));
      const duplicate = state.projects.some(project => project !== existingProject && project.name.toLowerCase() === name.toLowerCase());
      if (duplicate) return toast('Nama proyek sudah digunakan', 'warning');
      if (!name || !location || !manager || budget <= 0) return toast('Lengkapi data proyek dengan nilai yang valid', 'warning');

      if (editing) {
        const oldName = existingProject.name;
        Object.assign(existingProject, { name, location, manager, budget, dueDate, spent: Math.max(0, numberValue(document.getElementById('pf-spent').value)) });
        Object.assign(existingProject, normalizeProject(existingProject));
        if (oldName !== name) {
          state.logs.forEach(log => { if (log.project === oldName) log.project = name; });
          save('logs', state.logs, { sync: false });
        }
        state.detailId = existingProject.id;
        state.tab = 'detail';
      } else {
        if (daysUntil(dueDate) < 1) return toast('Target proyek baru minimal satu hari dari hari ini', 'warning');
        const firstPhaseEnd = addDaysISO(todayISO(), Math.max(0, Math.floor(daysUntil(dueDate) * 0.2)));
        state.projects.push(normalizeProject({
          id: Date.now(), name, location, manager, budget, dueDate,
          spent: 0, completion: 0, status: 'Planning', cashflow: [],
          phases: [
            { id: Date.now() + 1, name: 'Perencanaan & Perizinan', status: 'Pending', progress: 0, start: todayISO(), end: firstPhaseEnd },
            { id: Date.now() + 2, name: 'Pelaksanaan Konstruksi', status: 'Pending', progress: 0, start: addDaysISO(firstPhaseEnd, 1), end: dueDate }
          ]
        }, state.projects.length));
        state.tab = 'projects';
      }
      save('projects', state.projects);
      close();
      toast(editing ? 'Perubahan proyek berhasil disimpan' : 'Proyek baru berhasil ditambahkan', 'success');
      render();
    };
  }

  function openAddLogModal() {
    if (!hasPerm('add_sitelog')) return toast('Akses ditolak', 'error');
    const activeProjects = state.projects.filter(p => p.status !== 'Completed');
    if (!activeProjects.length) return toast('Tidak ada proyek aktif untuk dilaporkan', 'warning');
    const root = document.getElementById('modal-root');
    root.innerHTML = `
    <div class="modal-overlay" id="modal-bg">
      <div class="modal-content p-6 space-y-5">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 class="text-base font-black flex items-center gap-2"><i data-lucide="clipboard-check" class="w-5 h-5 text-indigo-500"></i>Buat Laporan Harian</h3>
          <button id="close-modal" aria-label="Tutup" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"><i data-lucide="x" class="w-5 h-5 text-slate-400"></i></button>
        </div>
        <form id="log-form" class="space-y-4 text-xs">
          <div><label class="block font-bold text-slate-500 mb-1.5">Proyek *</label>
            <select id="lf-proj" required class="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30">
              ${activeProjects.map(p => `<option value="${escapeHTML(p.name)}">${escapeHTML(p.name)}</option>`).join('')}
            </select>
          </div>
          <div><label class="block font-bold text-slate-500 mb-1.5" for="lf-sum">Ringkasan Laporan *</label><textarea id="lf-sum" required maxlength="1000" rows="3" placeholder="Deskripsi pekerjaan hari ini..." class="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"></textarea></div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><label class="block font-bold text-slate-500 mb-1.5" for="lf-date">Tanggal Laporan</label><input type="date" id="lf-date" value="${todayISO()}" required class="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30"/></div>
            <div><label class="block font-bold text-slate-500 mb-1.5" for="lf-workers">Jumlah Pekerja</label><input type="number" min="0" step="1" id="lf-workers" value="30" class="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30"/></div>
            <div><label class="block font-bold text-slate-500 mb-1.5">Status K3</label>
              <select id="lf-safety" class="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30">
                <option value="PASS">PASS</option><option value="WARNING">WARNING</option>
              </select>
            </div>
          </div>
          <div><label class="block font-bold text-slate-500 mb-1.5" for="lf-safety-note">Catatan / Tindak Lanjut K3</label><textarea id="lf-safety-note" maxlength="500" rows="2" placeholder="Contoh: Toolbox meeting selesai atau detail temuan K3..." class="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"></textarea></div>
          <div><label class="block font-bold text-slate-500 mb-1.5" for="lf-photo">URL Foto (opsional)</label><input type="url" id="lf-photo" placeholder="https://..." class="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30"/></div>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" id="cancel-modal" class="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 font-bold rounded-xl">Batal</button>
            <button type="submit" class="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25">Simpan Laporan</button>
          </div>
        </form>
      </div>
    </div>`;
    if (window.lucide) lucide.createIcons();
    const close = () => { root.innerHTML = ''; };
    document.getElementById('close-modal').onclick = close;
    document.getElementById('cancel-modal').onclick = close;
    document.getElementById('modal-bg').addEventListener('click', e => { if (e.target.id === 'modal-bg') close(); });
    document.getElementById('log-form').onsubmit = e => {
      e.preventDefault();
      const safety = document.getElementById('lf-safety').value;
      const safetyNote = document.getElementById('lf-safety-note').value.trim();
      if (safety === 'WARNING' && !safetyNote) return toast('Status WARNING memerlukan catatan tindak lanjut K3', 'warning');
      state.logs.unshift(normalizeLog({
        id: Date.now(), date: document.getElementById('lf-date').value,
        project: document.getElementById('lf-proj').value,
        author: state.user.name,
        summary: document.getElementById('lf-sum').value.trim(),
        workers: parseInt(document.getElementById('lf-workers').value) || 0,
        safety,
        safetyNote,
        photo: document.getElementById('lf-photo').value.trim() || DEFAULT_LOG_PHOTO
      }, state.logs.length));
      save('logs', state.logs);
      close(); toast('Laporan harian berhasil disimpan!', 'success');
      render();
    };
  }

  // ==============================
  // BOOT
  // ==============================
  function bindGlobalEvents() {
    document.addEventListener('click', event => {
      const target = event.target instanceof Element ? event.target : null;
      if (state.showNotifs && target && !target.closest('#notif-btn') && !target.closest('#notif-dropdown')) {
        state.showNotifs = false;
        render();
      }
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      const modalRoot = document.getElementById('modal-root');
      if (modalRoot?.innerHTML) modalRoot.innerHTML = '';
      if (state.showNotifs) {
        state.showNotifs = false;
        render();
      }
    });
  }

  function boot() {
    bindGlobalEvents();
    render();
    if (state.googleSheetUrl) {
      pullFromGoogleSheets();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
