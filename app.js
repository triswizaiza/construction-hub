/**
 * Construction Hub v3.1 - Enterprise Site & Financial Management
 * Premium PWA with Google Drive / Google Sheets Cloud Sync Integration
 */
(function () {
  'use strict';

  // ==============================
  // DATA LAYER & DEFAULTS
  // ==============================
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

  const DEFAULT_PROJECTS = [
    {
      id: 1, name: 'Skyline Tower Alpha', status: 'In Progress', budget: 25500000000, spent: 14200000000, completion: 65,
      manager: 'Sarah Jenkins', location: 'SCBD, Jakarta Selatan', dueDate: '2026-11-15',
      weather: { condition: 'Cerah Berawan', temp: 32, rainRisk: 'Rendah', icon: 'sun', alert: null },
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
    },
    {
      id: 2, name: 'Harbor Retail & Resort Complex', status: 'In Progress', budget: 18000000000, spent: 5100000000, completion: 40,
      manager: 'David Chen', location: 'PIK 2, Tangerang', dueDate: '2027-02-28',
      weather: { condition: 'Hujan Deras', temp: 27, rainRisk: 'Tinggi', icon: 'cloud-rain', alert: 'Dewatering aktif zona B3' },
      cashflow: [
        { month: 'Mar', budgeted: 1500000000, actual: 1200000000 },
        { month: 'Apr', budgeted: 2000000000, actual: 1800000000 },
        { month: 'Mei', budgeted: 2000000000, actual: 1100000000 },
        { month: 'Jun', budgeted: 2500000000, actual: 1000000000 },
      ],
      phases: [
        { id: 201, name: 'Perizinan & AMDAL', status: 'Completed', progress: 100, start: '2026-02-01', end: '2026-04-01' },
        { id: 202, name: 'Pemancangan & Sheet Pile', status: 'In Progress', progress: 75, start: '2026-04-02', end: '2026-08-30' },
        { id: 203, name: 'Fondasi Pile Cap & Tie Beam', status: 'Pending', progress: 0, start: '2026-08-15', end: '2026-11-30' },
        { id: 204, name: 'Struktur Atas Retail Wing', status: 'Pending', progress: 0, start: '2026-11-01', end: '2027-02-28' }
      ]
    },
    {
      id: 3, name: 'Westside Residential Estate', status: 'Completed', budget: 32000000000, spent: 31400000000, completion: 100,
      manager: 'Marcus Johnson', location: 'BSD City, Tangerang Selatan', dueDate: '2025-12-20',
      weather: { condition: 'Cerah', temp: 31, rainRisk: 'Rendah', icon: 'sun', alert: null },
      cashflow: [
        { month: 'Jul', budgeted: 4000000000, actual: 4200000000 },
        { month: 'Agu', budgeted: 5000000000, actual: 5100000000 },
        { month: 'Sep', budgeted: 6000000000, actual: 5800000000 },
        { month: 'Okt', budgeted: 7000000000, actual: 6900000000 },
        { month: 'Nov', budgeted: 5500000000, actual: 5200000000 },
        { month: 'Des', budgeted: 4500000000, actual: 4200000000 },
      ],
      phases: [
        { id: 301, name: 'Tahap 1 - Cluster Townhouse (40 Unit)', status: 'Completed', progress: 100, start: '2025-01-01', end: '2025-07-01' },
        { id: 302, name: 'Tahap 2 - Apartment Tower B', status: 'Completed', progress: 100, start: '2025-05-01', end: '2025-11-15' },
        { id: 303, name: 'Landscaping & Serah Terima', status: 'Completed', progress: 100, start: '2025-11-16', end: '2025-12-20' }
      ]
    }
  ];

  const DEFAULT_BOQ = [
    { id: 1, name: 'Beton ReadyMix K-350 Slump 12±2', category: 'Material', quantity: 650, unit: 'm³', unitCost: 1350000 },
    { id: 2, name: 'Besi Tulangan Ulir D16 SNI (KS/MG)', category: 'Material', quantity: 85, unit: 'Ton', unitCost: 12800000 },
    { id: 3, name: 'Bekisting Multiplek Film Face 12mm', category: 'Material', quantity: 2400, unit: 'm²', unitCost: 185000 },
    { id: 4, name: 'Sewa Excavator Komatsu PC200-8MO', category: 'Equipment', quantity: 180, unit: 'Jam', unitCost: 380000 },
    { id: 5, name: 'Sewa Tower Crane Potain MC 85', category: 'Equipment', quantity: 6, unit: 'Bulan', unitCost: 85000000 },
    { id: 6, name: 'Upah Tukang Batu & Pembesian', category: 'Labor', quantity: 1200, unit: 'HOK', unitCost: 175000 },
    { id: 7, name: 'Upah Mandor & Pelaksana', category: 'Labor', quantity: 180, unit: 'Hari', unitCost: 450000 },
    { id: 8, name: 'Subkon Plumbing & Fire System', category: 'Subcontractor', quantity: 1, unit: 'Paket', unitCost: 3500000000 },
    { id: 9, name: 'Subkon MEP & HVAC System', category: 'Subcontractor', quantity: 1, unit: 'Paket', unitCost: 5200000000 }
  ];

  const DEFAULT_LOGS = [
    { id: 101, date: '2026-08-01', project: 'Skyline Tower Alpha', author: 'Sarah Jenkins', summary: 'Pengecoran plat lantai 12 berhasil dengan 14 truk ready mix K-350. Slump test passed. Curing compound telah diaplikasikan.', weather: 'Cerah (32°C)', workers: 48, safety: 'PASS', photo: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=600&q=80' },
    { id: 102, date: '2026-07-31', project: 'Harbor Retail Complex', author: 'David Chen', summary: 'Pemancangan tiang pancang titik ke-42 dari 120. Delay 2 jam akibat hujan deras. Pompa dewatering 24 jam aktif di zona B3.', weather: 'Hujan (27°C)', workers: 26, safety: 'WARNING', photo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80' },
    { id: 103, date: '2026-07-30', project: 'Skyline Tower Alpha', author: 'Sarah Jenkins', summary: 'Pemasangan scaffolding lantai 13-14. Inspeksi K3 terjadwal dilaksanakan tanpa temuan. Safety induction 12 pekerja baru.', weather: 'Berawan (30°C)', workers: 52, safety: 'PASS', photo: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80' }
  ];

  const NOTIFICATIONS = [
    { id: 1, type: 'warning', title: 'Cuaca Hujan Deras', desc: 'PIK 2 - Risiko tinggi untuk pekerjaan pemancangan', time: '10 menit lalu', read: false },
    { id: 2, type: 'success', title: 'Progres Updated', desc: 'Skyline Tower - Fase Struktur Atas naik ke 55%', time: '2 jam lalu', read: false },
    { id: 3, type: 'info', title: 'BOQ Diubah', desc: 'Mike Ross mengubah harga satuan Beton K-350', time: '5 jam lalu', read: true },
    { id: 4, type: 'danger', title: 'Budget Alert', desc: 'Harbor Complex mendekati batas anggaran fase 2', time: '1 hari lalu', read: true },
  ];

  // ==============================
  // STATE ENGINE (localStorage & Cloud)
  // ==============================
  const load = (k, d) => { try { const v = localStorage.getItem('chub_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const save = (k, v) => {
    try {
      localStorage.setItem('chub_' + k, JSON.stringify(v));
      // Auto-sync with Google Drive if configured
      if (state.googleSheetUrl && (k === 'projects' || k === 'boq' || k === 'logs')) {
        pushToGoogleSheets();
      }
    } catch (e) {}
  };

  let state = {
    projects: load('projects', DEFAULT_PROJECTS),
    boq: load('boq', DEFAULT_BOQ),
    logs: load('logs', DEFAULT_LOGS),
    notifs: load('notifs', NOTIFICATIONS),
    user: load('user', USERS[0]),
    revenue: load('revenue', 45000000000),
    budget: load('budget', 100000000000),
    dark: load('dark', true),
    googleSheetUrl: load('googleSheetUrl', ''),
    syncing: false,
    tab: 'dashboard',
    detailId: null,
    search: '',
    boqFilter: 'All',
    boqSort: 'name',
    showNotifs: false,
    showUserMenu: false,
    editingBoqId: null,
  };

  let deferredPWA = null;

  // ==============================
  // GOOGLE SHEETS CLOUD SYNC ENGINE
  // ==============================
  function pushToGoogleSheets() {
    if (!state.googleSheetUrl) return;
    state.syncing = true;
    renderHeaderSyncStatus();
    
    fetch(state.googleSheetUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projects: state.projects,
        boq: state.boq,
        siteLogs: state.logs,
        user: state.user.name
      })
    }).then(() => {
      state.syncing = false;
      renderHeaderSyncStatus();
      console.log('[GoogleSheets] Data pushed successfully');
    }).catch(err => {
      state.syncing = false;
      renderHeaderSyncStatus();
      console.warn('[GoogleSheets] Push error:', err);
    });
  }

  function pullFromGoogleSheets() {
    if (!state.googleSheetUrl) return;
    state.syncing = true;
    toast('Menghubungkan ke Google Drive...', 'info');
    renderHeaderSyncStatus();

    fetch(state.googleSheetUrl)
      .then(res => res.json())
      .then(res => {
        state.syncing = false;
        if (res && res.projects && res.projects.length) {
          state.projects = res.projects;
          save('projects', state.projects);
        }
        if (res && res.boq && res.boq.length) {
          state.boq = res.boq;
          save('boq', state.boq);
        }
        if (res && res.siteLogs && res.siteLogs.length) {
          state.logs = res.siteLogs;
          save('logs', state.logs);
        }
        toast('Selesai! Data terbaru ditarik dari Google Drive 📁', 'success');
        render();
      })
      .catch(err => {
        state.syncing = false;
        renderHeaderSyncStatus();
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
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPWA = e; });

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
              <span class="text-[9px] bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-2 py-0.5 rounded-full font-bold">PRO v3.1</span>
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
                  <p class="text-xs font-bold">${n.title}</p>
                  <p class="text-[11px] text-slate-500 mt-0.5">${n.desc}</p>
                  <p class="text-[10px] text-slate-400 mt-1">${n.time}</p>
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
    return `
    <div class="space-y-6 animate-fade-in">
      <!-- Greeting -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p class="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Dashboard Overview</p>
          <h2 class="text-2xl sm:text-3xl font-black tracking-tight">Selamat ${new Date().getHours() < 12 ? 'Pagi' : new Date().getHours() < 17 ? 'Siang' : 'Malam'}, ${state.user.name.split(' ')[0]} 👋</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Berikut ringkasan portofolio konstruksi Anda hari ini.</p>
        </div>
        <div class="flex gap-2">
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

        <!-- Weather & Risk -->
        <div class="lg:col-span-2 card-gradient-blue rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-black uppercase tracking-[0.15em] text-indigo-300">Live Weather & Safety</span>
              <i data-lucide="cloud-lightning" class="w-5 h-5 text-amber-400 animate-pulse-slow"></i>
            </div>
            <h4 class="text-lg font-black mt-3">Monitor Cuaca Proyek</h4>
            <p class="text-xs text-indigo-200/70 mt-1">Deteksi dini risiko cuaca lapangan real-time.</p>
          </div>
          <div class="space-y-2.5 my-4">
            ${state.projects.map(p => `
              <div class="p-3 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between gap-2">
                <div class="min-w-0">
                  <p class="text-xs font-bold truncate">${p.name}</p>
                  <p class="text-[10px] text-indigo-200/70 flex items-center gap-1 mt-0.5"><i data-lucide="map-pin" class="w-3 h-3 text-cyan-400"></i>${p.location}</p>
                </div>
                <div class="text-right shrink-0">
                  <div class="flex items-center gap-1 justify-end">
                    <i data-lucide="${p.weather.icon}" class="w-3.5 h-3.5 ${p.weather.rainRisk === 'Tinggi' ? 'text-amber-400' : 'text-emerald-400'}"></i>
                    <span class="text-xs font-bold">${p.weather.temp}°C</span>
                  </div>
                  <p class="text-[9px] ${p.weather.rainRisk === 'Tinggi' ? 'text-amber-300' : 'text-emerald-300'} font-semibold">${p.weather.condition}</p>
                </div>
              </div>
            `).join('')}
          </div>
          ${state.projects.some(p => p.weather.alert) ? `
            <div class="p-3 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center gap-2 text-xs">
              <i data-lucide="alert-triangle" class="w-4 h-4 text-amber-400 shrink-0"></i>
              <span class="font-bold text-amber-200">${state.projects.find(p => p.weather.alert)?.weather.alert}</span>
            </div>
          ` : ''}
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
                  <td class="p-4"><p class="font-bold text-slate-900 dark:text-white">${p.name}</p><p class="text-[10px] text-slate-400 mt-0.5">${p.location}</p></td>
                  <td class="p-4 hidden sm:table-cell font-medium text-slate-600 dark:text-slate-300">${p.manager}</td>
                  <td class="p-4 font-bold">${fmtShort(p.budget)}</td>
                  <td class="p-4 font-bold hidden md:table-cell">${fmtShort(p.spent)}</td>
                  <td class="p-4"><div class="flex items-center gap-2"><div class="w-16 sm:w-24 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden"><div class="bg-indigo-500 h-full rounded-full" style="width:${p.completion}%"></div></div><span class="font-black text-xs">${p.completion}%</span></div></td>
                  <td class="p-4"><span class="badge ${h.badge}"><i data-lucide="${h.icon}" class="w-3 h-3"></i>${h.t}</span></td>
                  <td class="p-4 text-right"><button class="open-detail text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:underline" data-id="${p.id}">Lihat →</button></td>
                </tr>`;
              }).join('')}
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
    const q = state.search.toLowerCase();
    const filtered = state.projects.filter(p =>
      p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.manager.toLowerCase().includes(q)
    );
    return `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p class="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Project Management</p>
          <h2 class="text-2xl font-black tracking-tight">Proyek Konstruksi (${state.projects.length})</h2>
        </div>
        <div class="flex items-center gap-3">
          <div class="relative flex-1 sm:w-60">
            <i data-lucide="search" class="w-4 h-4 absolute left-3 top-2.5 text-slate-400"></i>
            <input id="search-input" type="text" value="${state.search}" placeholder="Cari proyek / lokasi / PM..." class="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"/>
          </div>
          ${hasPerm('edit_projects') ? `<button id="add-project-btn" class="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all shrink-0"><i data-lucide="plus" class="w-4 h-4"></i>Tambah</button>` : ''}
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        ${filtered.map((p, i) => {
          const h = health(p);
          return `
          <div class="card p-0 animate-slide-up" style="animation-delay: ${i * 80}ms; animation-fill-mode: both">
            <!-- Card Top Gradient -->
            <div class="h-2 bg-gradient-to-r ${p.status === 'Completed' ? 'from-emerald-500 to-teal-500' : p.status === 'In Progress' ? 'from-indigo-500 to-violet-500' : 'from-slate-400 to-slate-500'}"></div>
            <div class="p-5 space-y-4">
              <div class="flex items-start justify-between gap-2">
                <span class="badge ${p.status === 'Completed' ? 'badge-success' : p.status === 'In Progress' ? 'badge-info' : 'badge-neutral'}">${p.status}</span>
                <span class="badge ${h.badge}"><i data-lucide="${h.icon}" class="w-3 h-3"></i>${h.t}</span>
              </div>
              <div>
                <h3 class="text-base font-black hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer open-detail transition-colors" data-id="${p.id}">${p.name}</h3>
                <p class="text-[11px] text-slate-500 mt-1 flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3 text-indigo-500"></i>${p.location}</p>
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
                <span class="text-slate-400 flex items-center gap-1"><i data-lucide="user" class="w-3 h-3"></i>${p.manager}</span>
                <button class="open-detail bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg transition-all text-[11px]" data-id="${p.id}">Detail & Gantt →</button>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }

  // ==============================
  // 3. PROJECT DETAIL + GANTT + CASHFLOW
  // ==============================
  function detailHTML() {
    const p = state.projects.find(x => x.id === state.detailId);
    if (!p) return '<p class="text-center py-16 text-slate-500">Proyek tidak ditemukan.</p>';
    const h = health(p);
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
                <span class="text-[11px] text-slate-400 flex items-center gap-1"><i data-lucide="calendar" class="w-3 h-3"></i>Jatuh Tempo: ${p.dueDate}</span>
              </div>
              <h2 class="text-xl sm:text-2xl font-black">${p.name}</h2>
              <p class="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                <span class="flex items-center gap-1"><i data-lucide="map-pin" class="w-3.5 h-3.5 text-indigo-500"></i>${p.location}</span>
                <span class="flex items-center gap-1"><i data-lucide="user" class="w-3.5 h-3.5 text-emerald-500"></i>PM: ${p.manager}</span>
              </p>
            </div>
            <div class="flex items-center gap-3">
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
                  <h4 class="text-xs font-bold">${ph.name}</h4>
                  <p class="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <i data-lucide="calendar" class="w-3 h-3"></i>${ph.start} → ${ph.end}
                  </p>
                </div>
                <div>
                  <div class="flex items-center justify-between text-xs mb-1.5">
                    <span class="badge ${ph.progress === 100 ? 'badge-success' : ph.progress > 0 ? 'badge-info' : 'badge-neutral'}">${ph.status}</span>
                    <span class="font-black">${ph.progress}%</span>
                  </div>
                  <div class="gantt-track">
                    <div class="gantt-bar ${ph.progress === 100 ? 'completed' : ph.progress > 0 ? 'in-progress' : 'pending'}" style="width:${Math.max(ph.progress, 2)}%">
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
                  <span class="text-[10px] font-bold text-slate-500">${cf.month}</span>
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

      <!-- Weather Card -->
      <div class="card p-5 flex flex-col sm:flex-row items-center gap-4">
        <div class="p-3 rounded-xl ${p.weather.rainRisk === 'Tinggi' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}">
          <i data-lucide="${p.weather.icon}" class="w-8 h-8"></i>
        </div>
        <div class="flex-1 text-center sm:text-left">
          <h4 class="text-sm font-bold">Kondisi Cuaca: ${p.weather.condition} (${p.weather.temp}°C)</h4>
          <p class="text-xs text-slate-500 mt-0.5">Tingkat Risiko Hujan: <span class="font-bold ${p.weather.rainRisk === 'Tinggi' ? 'text-amber-500' : 'text-emerald-500'}">${p.weather.rainRisk}</span></p>
        </div>
        ${p.weather.alert ? `<div class="badge badge-warning shrink-0"><i data-lucide="alert-triangle" class="w-3 h-3"></i>${p.weather.alert}</div>` : `<div class="badge badge-success shrink-0"><i data-lucide="shield-check" class="w-3 h-3"></i>Aman untuk bekerja</div>`}
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
                    ${isEditing ? `<input class="inline-edit boq-edit-field font-bold" data-id="${item.id}" data-field="name" value="${item.name}"/>` : item.name}
                  </td>
                  <td class="p-4"><span class="badge ${catBadge}">${item.category}</span></td>
                  <td class="p-4 font-bold">
                    ${isEditing ? `<input type="number" class="inline-edit boq-edit-field font-bold w-20" data-id="${item.id}" data-field="quantity" value="${item.quantity}"/>` : item.quantity.toLocaleString('id-ID')}
                  </td>
                  <td class="p-4 text-slate-500">${item.unit}</td>
                  <td class="p-4 font-bold">
                    ${isEditing ? `<input type="number" class="inline-edit boq-edit-field font-bold w-32" data-id="${item.id}" data-field="unitCost" value="${item.unitCost}"/>` : fmtIDR(item.unitCost)}
                  </td>
                  <td class="p-4 font-black text-indigo-600 dark:text-indigo-400">${fmtIDR(t)}</td>
                  ${hasPerm('edit_boq') ? `
                    <td class="p-4 text-right flex items-center justify-end gap-1">
                      <button class="boq-edit-btn p-2 rounded-lg ${isEditing ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600'} transition-all" data-id="${item.id}">
                        <i data-lucide="${isEditing ? 'check' : 'edit-2'}" class="w-4 h-4"></i>
                      </button>
                      <button class="boq-del-btn p-2 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 text-slate-400 hover:text-rose-600 transition-all" data-id="${item.id}">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                      </button>
                    </td>
                  ` : ''}
                </tr>`;
              }).join('')}
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
              <img src="${log.photo}" alt="${log.project}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy"/>
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div class="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <i data-lucide="calendar" class="w-3 h-3 text-cyan-400"></i>${log.date}
              </div>
              <div class="absolute bottom-3 right-3">
                <span class="badge ${log.safety === 'PASS' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}" style="font-size: 0.6rem">
                  <i data-lucide="${log.safety === 'PASS' ? 'shield-check' : 'shield-alert'}" class="w-3 h-3"></i>K3: ${log.safety}
                </span>
              </div>
              <h3 class="absolute bottom-3 left-3 text-white font-black text-sm drop-shadow-lg">${log.project}</h3>
            </div>
            <div class="p-5 space-y-3">
              <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">${log.summary}</p>
              <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                <span class="text-slate-400 flex items-center gap-1"><i data-lucide="cloud" class="w-3 h-3 text-cyan-500"></i>${log.weather}</span>
                <span class="text-slate-400 flex items-center gap-1"><i data-lucide="users" class="w-3 h-3 text-indigo-500"></i>${log.workers} Pekerja</span>
              </div>
              <p class="text-[10px] text-slate-400">Pengawas: <span class="font-bold text-slate-600 dark:text-slate-300">${log.author}</span></p>
            </div>
          </div>
        `).join('')}
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

    // Sync status click -> open GDrive Modal
    document.getElementById('sync-status-badge')?.addEventListener('click', openGDriveModal);
    document.getElementById('gdrive-modal-btn')?.addEventListener('click', openGDriveModal);

    // Tab navigation
    document.querySelectorAll('.tab-btn, .mobile-nav-item').forEach(b => b.addEventListener('click', () => {
      state.tab = b.dataset.tab;
      state.showNotifs = false;
      render();
    }));

    // Dark mode
    document.getElementById('dark-btn')?.addEventListener('click', () => { state.dark = !state.dark; save('dark', state.dark); render(); });

    // Notifications
    document.getElementById('notif-btn')?.addEventListener('click', (e) => { e.stopPropagation(); state.showNotifs = !state.showNotifs; render(); });
    document.getElementById('mark-all-read')?.addEventListener('click', () => { state.notifs.forEach(n => n.read = true); save('notifs', state.notifs); render(); });

    // Close notification on outside click
    document.addEventListener('click', (e) => {
      if (state.showNotifs && !e.target.closest('#notif-btn') && !e.target.closest('#notif-dropdown')) {
        state.showNotifs = false; render();
      }
    }, { once: true });

    // PWA install
    document.getElementById('pwa-btn')?.addEventListener('click', () => { if (deferredPWA) { deferredPWA.prompt(); deferredPWA = null; } });

    // User menu -> PAM tab
    document.getElementById('user-btn')?.addEventListener('click', () => { state.tab = 'pam'; state.showNotifs = false; render(); });

    // Open project detail
    document.querySelectorAll('.open-detail').forEach(b => b.addEventListener('click', () => {
      state.detailId = parseInt(b.dataset.id); state.tab = 'detail'; render();
    }));

    // Back
    document.getElementById('back-btn')?.addEventListener('click', () => { state.tab = 'projects'; render(); });

    // Search
    document.getElementById('search-input')?.addEventListener('input', e => { state.search = e.target.value; render(); });

    // Phase slider
    document.querySelectorAll('.phase-slider').forEach(s => s.addEventListener('input', e => {
      const pId = parseInt(s.dataset.project), phId = parseInt(s.dataset.phase), val = parseInt(e.target.value);
      const proj = state.projects.find(p => p.id === pId);
      if (!proj) return;
      const ph = proj.phases.find(x => x.id === phId);
      if (!ph) return;
      ph.progress = val;
      ph.status = val === 100 ? 'Completed' : val > 0 ? 'In Progress' : 'Pending';
      proj.completion = Math.round(proj.phases.reduce((a, x) => a + x.progress, 0) / proj.phases.length);
      if (proj.completion === 100) proj.status = 'Completed';
      else if (proj.completion > 0) proj.status = 'In Progress';
      save('projects', state.projects);
      render();
    }));

    // BOQ category filter
    document.querySelectorAll('.boq-cat-btn').forEach(b => b.addEventListener('click', () => { state.boqFilter = b.dataset.cat; render(); }));

    // BOQ sort
    document.getElementById('boq-sort')?.addEventListener('change', e => { state.boqSort = e.target.value; render(); });

    // BOQ inline edit toggle
    document.querySelectorAll('.boq-edit-btn').forEach(b => b.addEventListener('click', () => {
      const id = parseInt(b.dataset.id);
      if (state.editingBoqId === id) {
        document.querySelectorAll(`.boq-edit-field[data-id="${id}"]`).forEach(inp => {
          const field = inp.dataset.field, val = inp.value;
          const item = state.boq.find(x => x.id === id);
          if (item) item[field] = field === 'name' ? val : parseFloat(val) || 0;
        });
        save('boq', state.boq);
        state.editingBoqId = null;
        toast('Item RAB berhasil diperbarui', 'success');
      } else {
        state.editingBoqId = id;
      }
      render();
    }));

    // BOQ delete
    document.querySelectorAll('.boq-del-btn').forEach(b => b.addEventListener('click', () => {
      const id = parseInt(b.dataset.id);
      state.boq = state.boq.filter(x => x.id !== id);
      save('boq', state.boq);
      toast('Item RAB dihapus', 'success');
      render();
    }));

    // Add BOQ item
    document.getElementById('add-boq-btn')?.addEventListener('click', () => {
      state.boq.push({ id: Date.now(), name: 'Item Baru', category: 'Material', quantity: 1, unit: 'pcs', unitCost: 0 });
      state.editingBoqId = state.boq[state.boq.length - 1].id;
      save('boq', state.boq);
      render();
    });

    // Export CSV
    document.getElementById('csv-btn')?.addEventListener('click', () => {
      let csv = '\uFEFF"Uraian","Kategori","Volume","Satuan","Harga Satuan","Total"\n';
      state.boq.forEach(b => { csv += `"${b.name}","${b.category}",${b.quantity},"${b.unit}",${b.unitCost},${b.quantity * b.unitCost}\n`; });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = `RAB_ConstructionHub_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click(); toast('CSV berhasil diunduh', 'success');
    });

    // Print
    document.getElementById('export-pdf-btn')?.addEventListener('click', () => window.print());

    // Switch user (PAM)
    document.querySelectorAll('.switch-user-btn').forEach(b => b.addEventListener('click', () => {
      const u = USERS.find(x => x.id === b.dataset.uid);
      if (u) { state.user = u; save('user', u); state.editingBoqId = null; toast(`Masuk sebagai: ${u.name} (${u.role})`, 'success'); render(); }
    }));

    // FAB
    document.getElementById('fab-btn')?.addEventListener('click', openAddProjectModal);
    document.getElementById('add-project-btn')?.addEventListener('click', openAddProjectModal);

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
            <input type="url" id="gscript-url" value="${state.googleSheetUrl}" placeholder="https://script.google.com/macros/s/.../exec" class="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl font-mono text-[11px] focus:ring-2 focus:ring-emerald-500/30 outline-none"/>
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
      state.googleSheetUrl = url;
      save('googleSheetUrl', url);
      close();
      if (url) {
        toast('Google Drive berhasil terhubung!', 'success');
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
  function openAddProjectModal() {
    if (!hasPerm('edit_projects')) return toast('Akses ditolak', 'error');
    const root = document.getElementById('modal-root');
    root.innerHTML = `
    <div class="modal-overlay" id="modal-bg">
      <div class="modal-content p-6 space-y-5">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 class="text-base font-black flex items-center gap-2"><i data-lucide="building-2" class="w-5 h-5 text-indigo-500"></i>Tambah Proyek Baru</h3>
          <button id="close-modal" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"><i data-lucide="x" class="w-5 h-5 text-slate-400"></i></button>
        </div>
        <form id="project-form" class="space-y-4 text-xs">
          <div><label class="block font-bold text-slate-500 mb-1.5">Nama Proyek *</label><input type="text" id="pf-name" required placeholder="Contoh: Gedung Kantor Tower C" class="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"/></div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="block font-bold text-slate-500 mb-1.5">Lokasi *</label><input type="text" id="pf-loc" required placeholder="Jakarta Selatan" class="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500/30 outline-none"/></div>
            <div><label class="block font-bold text-slate-500 mb-1.5">Project Manager</label><input type="text" id="pf-pm" value="${state.user.name}" class="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500/30 outline-none"/></div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="block font-bold text-slate-500 mb-1.5">Anggaran (IDR) *</label><input type="number" id="pf-budget" required placeholder="15000000000" class="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500/30 outline-none"/></div>
            <div><label class="block font-bold text-slate-500 mb-1.5">Target Selesai</label><input type="date" id="pf-date" class="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500/30 outline-none"/></div>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" id="cancel-modal" class="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 font-bold rounded-xl">Batal</button>
            <button type="submit" class="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25">Simpan Proyek</button>
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
      state.projects.push({
        id: Date.now(), name: document.getElementById('pf-name').value,
        location: document.getElementById('pf-loc').value,
        manager: document.getElementById('pf-pm').value || state.user.name,
        budget: parseFloat(document.getElementById('pf-budget').value) || 0,
        dueDate: document.getElementById('pf-date').value || '2027-06-01',
        spent: 0, completion: 0, status: 'Planning',
        weather: { condition: 'Cerah', temp: 30, rainRisk: 'Rendah', icon: 'sun', alert: null },
        cashflow: [],
        phases: [
          { id: Date.now() + 1, name: 'Perencanaan & Perizinan', status: 'In Progress', progress: 20, start: new Date().toISOString().slice(0, 10), end: '2027-01-01' },
          { id: Date.now() + 2, name: 'Pekerjaan Substructure', status: 'Pending', progress: 0, start: '2027-01-02', end: '2027-03-01' }
        ]
      });
      save('projects', state.projects);
      close(); toast('Proyek baru berhasil ditambahkan!', 'success');
      state.tab = 'projects'; render();
    };
  }

  function openAddLogModal() {
    if (!hasPerm('add_sitelog')) return toast('Akses ditolak', 'error');
    const root = document.getElementById('modal-root');
    root.innerHTML = `
    <div class="modal-overlay" id="modal-bg">
      <div class="modal-content p-6 space-y-5">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 class="text-base font-black flex items-center gap-2"><i data-lucide="clipboard-check" class="w-5 h-5 text-indigo-500"></i>Buat Laporan Harian</h3>
          <button id="close-modal" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"><i data-lucide="x" class="w-5 h-5 text-slate-400"></i></button>
        </div>
        <form id="log-form" class="space-y-4 text-xs">
          <div><label class="block font-bold text-slate-500 mb-1.5">Proyek *</label>
            <select id="lf-proj" required class="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30">
              ${state.projects.filter(p => p.status !== 'Completed').map(p => `<option value="${p.name}">${p.name}</option>`).join('')}
            </select>
          </div>
          <div><label class="block font-bold text-slate-500 mb-1.5">Ringkasan Laporan *</label><textarea id="lf-sum" required rows="3" placeholder="Deskripsi pekerjaan hari ini..." class="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"></textarea></div>
          <div class="grid grid-cols-3 gap-3">
            <div><label class="block font-bold text-slate-500 mb-1.5">Cuaca</label><input type="text" id="lf-weather" value="Cerah (30°C)" class="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30"/></div>
            <div><label class="block font-bold text-slate-500 mb-1.5">Jumlah Pekerja</label><input type="number" id="lf-workers" value="30" class="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30"/></div>
            <div><label class="block font-bold text-slate-500 mb-1.5">Status K3</label>
              <select id="lf-safety" class="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30">
                <option value="PASS">PASS</option><option value="WARNING">WARNING</option>
              </select>
            </div>
          </div>
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
      state.logs.unshift({
        id: Date.now(), date: new Date().toISOString().slice(0, 10),
        project: document.getElementById('lf-proj').value,
        author: state.user.name,
        summary: document.getElementById('lf-sum').value,
        weather: document.getElementById('lf-weather').value,
        workers: parseInt(document.getElementById('lf-workers').value) || 0,
        safety: document.getElementById('lf-safety').value,
        photo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80'
      });
      save('logs', state.logs);
      close(); toast('Laporan harian berhasil disimpan!', 'success');
      render();
    };
  }

  // ==============================
  // BOOT
  // ==============================
  function boot() {
    render();
    if (state.googleSheetUrl) {
      pullFromGoogleSheets();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
