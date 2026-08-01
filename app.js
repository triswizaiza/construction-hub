/**
 * Construction Hub - Enterprise Site & Financial Management Engine
 * Mobile & Desktop Responsive PWA Application
 */

(function () {
  // --- INITIAL DATA & SEED STATE ---
  const DEFAULT_USERS = [
    { id: 'u1', name: 'Bambang Soeprapto', role: 'CEO / Admin', initials: 'BS', color: 'bg-indigo-600', email: 'bambang@constructionhub.co.id' },
    { id: 'u2', name: 'Sarah Jenkins', role: 'Project Manager', initials: 'SJ', color: 'bg-emerald-600', email: 'sarah.j@constructionhub.co.id' },
    { id: 'u3', name: 'Mike Ross', role: 'Chief Estimator', initials: 'MR', color: 'bg-amber-600', email: 'mike.r@constructionhub.co.id' },
    { id: 'u4', name: 'PT Megah Utama', role: 'Stakeholder', initials: 'MU', color: 'bg-slate-600', email: 'client@megahutama.com' }
  ];

  const PERMISSIONS = {
    'CEO / Admin': ['edit_company', 'edit_projects', 'edit_boq', 'manage_users', 'export_data', 'add_sitelog'],
    'Project Manager': ['edit_projects', 'add_sitelog', 'export_data'],
    'Chief Estimator': ['edit_boq', 'export_data'],
    'Stakeholder': [] // Read-Only
  };

  const DEFAULT_PROJECTS = [
    {
      id: 1,
      name: 'Skyline Tower Alpha',
      status: 'In Progress',
      budget: 25500000000,
      spent: 14200000000,
      completion: 65,
      manager: 'Sarah Jenkins',
      location: 'SCBD, Jakarta Selatan',
      dueDate: '2026-11-15',
      weather: { condition: 'Cerah', temp: 32, rainRisk: 'Rendah', alert: 'Aman untuk pengecoran' },
      phases: [
        { id: 101, name: 'Persiapan Lahan & Excavation', status: 'Completed', progress: 100, startDate: '2026-01-10', endDate: '2026-03-01' },
        { id: 102, name: 'Pekerjaan Fondasi & Substructure', status: 'Completed', progress: 100, startDate: '2026-03-02', endDate: '2026-06-15' },
        { id: 103, name: 'Struktur Atas & Framing Steel', status: 'In Progress', progress: 55, startDate: '2026-06-16', endDate: '2026-09-30' },
        { id: 104, name: 'Instalasi MEP (Mechanical/Electrical)', status: 'Pending', progress: 0, startDate: '2026-09-01', endDate: '2026-11-01' },
        { id: 105, name: 'Finishing Interior & Architectural', status: 'Pending', progress: 0, startDate: '2026-10-01', endDate: '2026-11-15' }
      ]
    },
    {
      id: 2,
      name: 'Harbor Retail & Resort Complex',
      status: 'In Progress',
      budget: 18000000000,
      spent: 12100000000,
      completion: 40,
      manager: 'David Chen',
      location: 'Pantai Indah Kapuk 2, Tangerang',
      dueDate: '2027-02-28',
      weather: { condition: 'Hujan Sedang', temp: 28, rainRisk: 'Tinggi', alert: 'Waspada galian tanah & pompa dewatering' },
      phases: [
        { id: 201, name: 'Perizinan & AMDAL', status: 'Completed', progress: 100, startDate: '2026-02-01', endDate: '2026-04-01' },
        { id: 202, name: 'Pembersihan & Pemancangan Tiang Pancang', status: 'In Progress', progress: 75, startDate: '2026-04-02', endDate: '2026-08-30' },
        { id: 203, name: 'Pembangunan Pondasi Rawa', status: 'Pending', progress: 0, startDate: '2026-08-15', endDate: '2026-11-30' }
      ]
    },
    {
      id: 3,
      name: 'Westside Residential Estate',
      status: 'Completed',
      budget: 32000000000,
      spent: 31400000000,
      completion: 100,
      manager: 'Marcus Johnson',
      location: 'BSD City, Tangerang Selatan',
      dueDate: '2025-12-20',
      weather: { condition: 'Cerah', temp: 31, rainRisk: 'Rendah', alert: 'Proyek Selesai & Serah Terima' },
      phases: [
        { id: 301, name: 'Tahap 1 - Cluster Townhouse (40 Unit)', status: 'Completed', progress: 100, startDate: '2025-01-01', endDate: '2025-07-01' },
        { id: 302, name: 'Tahap 2 - Apartment Tower B', status: 'Completed', progress: 100, startDate: '2025-05-01', endDate: '2025-11-15' },
        { id: 303, name: 'Landscaping & Handover', status: 'Completed', progress: 100, startDate: '2025-11-16', endDate: '2025-12-20' }
      ]
    }
  ];

  const DEFAULT_BOQ = [
    { id: 1, name: 'Beton ReadyMix K-350 Slump 12', category: 'Material', quantity: 650, unit: 'm³', unitCost: 1350000 },
    { id: 2, name: 'Besi Ulir Beton Ulir D16 & D19 (Ulir SNI)', category: 'Material', quantity: 85, unit: 'Ton', unitCost: 12800000 },
    { id: 3, name: 'Sewa Excavator Komatsu PC200 + Bahan Bakar', category: 'Equipment', quantity: 180, unit: 'Jam', unitCost: 320000 },
    { id: 4, name: 'Upah Tukang Batu & Pembesian', category: 'Labor', quantity: 1200, unit: 'HOK', unitCost: 175000 },
    { id: 5, name: 'Upah Mandor & Project Engineer', category: 'Labor', quantity: 180, unit: 'Hari', unitCost: 450000 },
    { id: 6, name: 'Pekerjaan Subkon Plumbing & Hydrant Fire System', category: 'Subcontractor', quantity: 1, unit: 'Paket', unitCost: 3500000000 }
  ];

  const DEFAULT_SITE_LOGS = [
    {
      id: 101,
      date: '2026-08-01',
      projectName: 'Skyline Tower Alpha',
      author: 'Sarah Jenkins',
      summary: 'Pengecoran plat lantai 12 berjalan lancar dengan 14 truk ready mix. Pengujian slump sesuai spesifikasi K-350.',
      weather: 'Cerah (32°C)',
      workersCount: 48,
      safetyStatus: 'Pass (Nihil Kecelakaan)',
      photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 102,
      date: '2026-07-31',
      projectName: 'Harbor Retail & Resort Complex',
      author: 'David Chen',
      summary: 'Pemancangan tiang pancang mencapai titik ke-42. Terjadi penundaan 2 jam karena hujan deras di sore hari.',
      weather: 'Hujan (27°C)',
      workersCount: 26,
      safetyStatus: 'Warning (Pompa Dewatering Aktif)',
      photoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80'
    }
  ];

  // --- STATE CONTROLLER WITH LOCALSTORAGE PERSISTENCE ---
  function loadState(key, defaultVal) {
    try {
      const saved = localStorage.getItem('ch_' + key);
      return saved ? JSON.parse(saved) : defaultVal;
    } catch (e) {
      return defaultVal;
    }
  }

  function saveState(key, val) {
    try {
      localStorage.setItem('ch_' + key, JSON.stringify(val));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  // App State
  let projects = loadState('projects', DEFAULT_PROJECTS);
  let boqItems = loadState('boq', DEFAULT_BOQ);
  let siteLogs = loadState('siteLogs', DEFAULT_SITE_LOGS);
  let currentUser = loadState('currentUser', DEFAULT_USERS[0]);
  let estimatedRevenue = loadState('estimatedRevenue', 45000000000);
  let companyBudget = loadState('companyBudget', 100000000000);
  let isDarkMode = loadState('darkMode', false);

  // Active View State
  let activeTab = 'dashboard'; // 'dashboard', 'projects', 'boq', 'sitelog', 'pam'
  let searchQuery = '';
  let selectedProjectId = null;
  let filterCategory = 'All';
  let deferredPrompt = null; // For PWA install

  // --- UTILITY FUNCTIONS ---
  function formatIDR(num) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
  }

  function formatCompactIDR(num) {
    if (!num) return 'Rp 0';
    if (num >= 1e9) return `Rp ${(num / 1e9).toFixed(1)} M`;
    if (num >= 1e6) return `Rp ${(num / 1e6).toFixed(1)} Jt`;
    if (num >= 1e3) return `Rp ${(num / 1e3).toFixed(1)} Rb`;
    return formatIDR(num);
  }

  function hasPermission(perm) {
    const userRole = currentUser.role || 'Stakeholder';
    return (PERMISSIONS[userRole] || []).includes(perm);
  }

  function showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    const bgClass = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-rose-600' : 'bg-blue-600';
    toast.className = `fixed top-5 right-5 z-50 ${bgClass} text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold animate-bounce`;
    toast.innerHTML = `<i data-lucide="${type === 'success' ? 'check-circle' : 'info'}" class="w-5 h-5"></i><span>${msg}</span>`;
    document.body.appendChild(toast);
    if (window.lucide) lucide.createIcons();
    setTimeout(() => toast.remove(), 3200);
  }

  // --- PWA PROMPT LISTENER ---
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const btn = document.getElementById('pwa-install-btn');
    if (btn) btn.classList.remove('hidden');
  });

  // --- CORE COMPUTATION ENGINE ---
  function getCalculations() {
    let totalMaterial = 0, totalLabor = 0, totalEquipment = 0, totalSubcon = 0, totalBoqCost = 0;
    boqItems.forEach(item => {
      const cost = (item.quantity || 0) * (item.unitCost || 0);
      totalBoqCost += cost;
      if (item.category === 'Material') totalMaterial += cost;
      if (item.category === 'Labor') totalLabor += cost;
      if (item.category === 'Equipment') totalEquipment += cost;
      if (item.category === 'Subcontractor') totalSubcon += cost;
    });

    const grossProfit = estimatedRevenue - totalBoqCost;
    const profitMargin = estimatedRevenue > 0 ? ((grossProfit / estimatedRevenue) * 100).toFixed(1) : 0;

    const totalAllocatedBudget = projects.reduce((acc, p) => acc + p.budget, 0);
    const totalSpentAmount = projects.reduce((acc, p) => acc + p.spent, 0);
    const activeProjectsCount = projects.filter(p => p.status === 'In Progress').length;

    return {
      totalMaterial, totalLabor, totalEquipment, totalSubcon, totalBoqCost,
      grossProfit, profitMargin, totalAllocatedBudget, totalSpentAmount, activeProjectsCount
    };
  }

  function getProjectHealth(project) {
    if (project.spent > project.budget) return { text: 'Over Budget (Kritis)', color: 'bg-rose-500 text-white', icon: 'alert-triangle' };
    const expectedSpendRatio = project.completion / 100;
    const actualSpendRatio = project.budget > 0 ? project.spent / project.budget : 0;
    if (actualSpendRatio > expectedSpendRatio + 0.15) return { text: 'At Risk (Perlu Pengawasan)', color: 'bg-amber-500 text-white', icon: 'alert-circle' };
    return { text: 'On Track (Aman)', color: 'bg-emerald-500 text-white', icon: 'check-circle' };
  }

  // --- RENDER ENGINE ---
  function renderApp() {
    const root = document.getElementById('app-root');
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.style.display = 'none';

    // Apply dark mode class
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const calc = getCalculations();

    root.innerHTML = `
      <!-- TOP NAVIGATION BAR (Desktop & Mobile Header) -->
      <header class="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          <!-- Logo & Title -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <i data-lucide="hard-hat" class="w-6 h-6"></i>
            </div>
            <div>
              <h1 class="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                CONSTRUCTION HUB
                <span class="text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-semibold uppercase">PWA v2.5</span>
              </h1>
              <p class="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Enterprise Site & Financial Control System</p>
            </div>
          </div>

          <!-- Desktop Navigation Tabs -->
          <nav class="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/50">
            ${renderNavButton('dashboard', 'layout-dashboard', 'Dashboard')}
            ${renderNavButton('projects', 'folder-kanban', 'Proyek (' + projects.length + ')')}
            ${renderNavButton('boq', 'calculator', 'BOQ / RAB')}
            ${renderNavButton('sitelog', 'clipboard-check', 'Log Lapangan')}
            ${renderNavButton('pam', 'shield-check', 'Access (PAM)')}
          </nav>

          <!-- Right Action Controls -->
          <div class="flex items-center gap-2 sm:gap-3">
            <!-- PWA Install Prompt Button -->
            <button id="pwa-install-btn" class="hidden bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all">
              <i data-lucide="download" class="w-4 h-4"></i>
              <span class="hidden sm:inline">Install App</span>
            </button>

            <!-- Dark Mode Switcher -->
            <button id="dark-toggle-btn" class="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all" title="Toggle Dark/Light Mode">
              <i data-lucide="${isDarkMode ? 'sun' : 'moon'}" class="w-5 h-5"></i>
            </button>

            <!-- User PAM Avatar Badge -->
            <div class="relative group">
              <button id="user-menu-btn" class="flex items-center gap-2.5 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-500 transition-all">
                <div class="w-8 h-8 rounded-lg ${currentUser.color || 'bg-blue-600'} text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  ${currentUser.initials}
                </div>
                <div class="text-left hidden sm:block">
                  <p class="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">${currentUser.name}</p>
                  <p class="text-[10px] font-semibold text-blue-600 dark:text-blue-400">${currentUser.role}</p>
                </div>
                <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- MAIN CONTENT CONTAINER -->
      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        ${renderActiveTabContent(calc)}
      </main>

      <!-- MOBILE BOTTOM NAVIGATION BAR -->
      <div class="mobile-bottom-nav">
        ${renderMobileNavItem('dashboard', 'layout-dashboard', 'Dashboard')}
        ${renderMobileNavItem('projects', 'folder-kanban', 'Proyek')}
        ${renderMobileNavItem('boq', 'calculator', 'RAB')}
        ${renderMobileNavItem('sitelog', 'clipboard-check', 'Log Site')}
        ${renderMobileNavItem('pam', 'shield-check', 'PAM')}
      </div>

      <!-- FLOATING ACTION BUTTON (Mobile Quick Add) -->
      ${hasPermission('edit_projects') ? `
        <button id="fab-add-btn" class="fab-btn" title="Tambah Proyek Baru">
          <i data-lucide="plus" class="w-7 h-7"></i>
        </button>
      ` : ''}

      <!-- MODALS CONTAINER -->
      <div id="modal-container"></div>
    `;

    // Re-initialize Lucide Icons
    if (window.lucide) {
      lucide.createIcons();
    }

    // Attach Event Listeners
    attachEvents();
  }

  function renderNavButton(tabId, icon, label) {
    const isActive = activeTab === tabId;
    return `
      <button class="nav-tab-btn flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
        isActive 
          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/80 dark:border-slate-700' 
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
      }" data-tab="${tabId}">
        <i data-lucide="${icon}" class="w-4 h-4"></i>
        <span>${label}</span>
      </button>
    `;
  }

  function renderMobileNavItem(tabId, icon, label) {
    const isActive = activeTab === tabId;
    return `
      <button class="mobile-nav-item ${isActive ? 'active' : ''}" data-tab="${tabId}">
        <i data-lucide="${icon}" class="w-5 h-5"></i>
        <span>${label}</span>
      </button>
    `;
  }

  // --- TAB CONTENTS RENDERER ---
  function renderActiveTabContent(calc) {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardTab(calc);
      case 'projects':
        return renderProjectsTab();
      case 'boq':
        return renderBOQTab(calc);
      case 'sitelog':
        return renderSiteLogTab();
      case 'pam':
        return renderPAMTab();
      case 'project-details':
        return renderProjectDetailsTab();
      default:
        return renderDashboardTab(calc);
    }
  }

  // 1. DASHBOARD TAB
  function renderDashboardTab(calc) {
    return `
      <div class="space-y-6">
        <!-- Page Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Executive Dashboard</h2>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Ringkasan real-time kinerja portofolio & risiko finansial proyek.</p>
          </div>
          <div class="flex items-center gap-2">
            <button id="quick-export-btn" class="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md hover:bg-slate-800 transition-all">
              <i data-lucide="file-text" class="w-4 h-4"></i>
              <span>Cetak Laporan Portfolio</span>
            </button>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Budget Portofolio</span>
              <div class="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <i data-lucide="landmark" class="w-5 h-5"></i>
              </div>
            </div>
            <p class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-2">${formatCompactIDR(calc.totalAllocatedBudget)}</p>
            <p class="text-[11px] text-slate-500 font-medium mt-1">Alokasi ${projects.length} Proyek Aktif</p>
          </div>

          <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Biaya Terpakai</span>
              <div class="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <i data-lucide="banknote" class="w-5 h-5"></i>
              </div>
            </div>
            <p class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-2">${formatCompactIDR(calc.totalSpentAmount)}</p>
            <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div class="bg-emerald-500 h-full rounded-full" style="width: ${Math.min(100, (calc.totalSpentAmount / (calc.totalAllocatedBudget || 1)) * 100)}%"></div>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Estimasi Gross Margin</span>
              <div class="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                <i data-lucide="trending-up" class="w-5 h-5"></i>
              </div>
            </div>
            <p class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-2">${calc.profitMargin}%</p>
            <p class="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i> ${formatCompactIDR(calc.grossProfit)} Estimasi Profit
            </p>
          </div>

          <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Status Cuaca Lapangan</span>
              <div class="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400">
                <i data-lucide="cloud-rain" class="w-5 h-5"></i>
              </div>
            </div>
            <p class="text-lg font-bold text-slate-900 dark:text-white mt-2 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span> Waspada Hujan
            </p>
            <p class="text-[11px] text-slate-500 font-medium mt-1">1 Lokasi Proyek dalam Risiko Cuaca</p>
          </div>
        </div>

        <!-- Middle Section: Visual Cost Breakdown & Weather Alert -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Cost Breakdown Chart -->
          <div class="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <i data-lucide="pie-chart" class="w-5 h-5 text-blue-600"></i>
                Komposisi Biaya RAB (Rencana Anggaran Biaya)
              </h3>
              <span class="text-xs text-slate-500 font-medium">Total: ${formatCompactIDR(calc.totalBoqCost)}</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-2">
              <!-- SVG Donut Chart -->
              <div class="flex justify-center relative">
                ${renderDonutChart(calc)}
              </div>

              <!-- Legend Details -->
              <div class="space-y-3">
                ${renderLegendRow('Material & Bahan', calc.totalMaterial, calc.totalBoqCost, '#2563eb')}
                ${renderLegendRow('Tenaga Kerja (Labor)', calc.totalLabor, calc.totalBoqCost, '#f59e0b')}
                ${renderLegendRow('Peralatan & Alat Berat', calc.totalEquipment, calc.totalBoqCost, '#10b981')}
                ${renderLegendRow('Subkontraktor', calc.totalSubcon, calc.totalBoqCost, '#8b5cf6')}
              </div>
            </div>
          </div>

          <!-- Site Weather & Safety Monitor Widget -->
          <div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div class="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
            
            <div>
              <div class="flex items-center justify-between">
                <span class="text-xs font-extrabold uppercase tracking-widest text-cyan-400">Live Weather & Safety</span>
                <i data-lucide="cloud-sun" class="w-6 h-6 text-amber-400"></i>
              </div>
              <h4 class="text-xl font-black mt-3">Pantau Risiko Lapangan</h4>
              <p class="text-xs text-slate-300 mt-1">Sistem deteksi dini cuaca untuk keamanan pengecoran & alat berat.</p>
            </div>

            <div class="space-y-3 my-4">
              ${projects.map(p => `
                <div class="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-between gap-2">
                  <div>
                    <p class="text-xs font-bold text-white">${p.name}</p>
                    <p class="text-[10px] text-slate-300 flex items-center gap-1">
                      <i data-lucide="map-pin" class="w-3 h-3 text-cyan-400"></i> ${p.location}
                    </p>
                  </div>
                  <div class="text-right">
                    <span class="text-xs font-bold ${p.weather.rainRisk === 'Tinggi' ? 'text-amber-400' : 'text-emerald-400'}">
                      ${p.weather.condition} (${p.weather.temp}°C)
                    </span>
                    <p class="text-[9px] text-slate-300">Risiko: ${p.weather.rainRisk}</p>
                  </div>
                </div>
              `).join('')}
            </div>

            <button id="view-sitelogs-link-btn" class="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-sm border border-white/20 transition-all flex items-center justify-center gap-2">
              <i data-lucide="shield-alert" class="w-4 h-4 text-amber-400"></i>
              <span>Buka Log Keamanan Lapangan</span>
            </button>
          </div>

        </div>

        <!-- Bottom Section: Quick Project Status Table -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <i data-lucide="activity" class="w-5 h-5 text-blue-600"></i>
              Ringkasan Proyek Utama
            </h3>
            <button class="nav-tab-btn text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline" data-tab="projects">
              Lihat Semua Proyek →
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead class="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th class="p-4">Nama Proyek</th>
                  <th class="p-4">Lokasi & Manager</th>
                  <th class="p-4">Anggaran (IDR)</th>
                  <th class="p-4">Realisasi (Spent)</th>
                  <th class="p-4">Progres</th>
                  <th class="p-4">Status Kesehatan</th>
                  <th class="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                ${projects.map(p => {
                  const health = getProjectHealth(p);
                  return `
                    <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td class="p-4 font-bold text-slate-900 dark:text-white">${p.name}</td>
                      <td class="p-4">
                        <div class="font-medium text-slate-700 dark:text-slate-300">${p.manager}</div>
                        <div class="text-[10px] text-slate-400">${p.location}</div>
                      </td>
                      <td class="p-4 font-semibold text-slate-800 dark:text-slate-200">${formatCompactIDR(p.budget)}</td>
                      <td class="p-4 font-semibold text-slate-800 dark:text-slate-200">${formatCompactIDR(p.spent)}</td>
                      <td class="p-4">
                        <div class="flex items-center gap-2">
                          <div class="w-20 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div class="bg-blue-600 h-full rounded-full" style="width: ${p.completion}%"></div>
                          </div>
                          <span class="font-bold text-slate-700 dark:text-slate-300">${p.completion}%</span>
                        </div>
                      </td>
                      <td class="p-4">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${health.color}">
                          <i data-lucide="${health.icon}" class="w-3 h-3"></i> ${health.text}
                        </span>
                      </td>
                      <td class="p-4 text-right">
                        <button class="open-project-btn p-2 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 transition-all" data-id="${p.id}">
                          Detail →
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function renderLegendRow(label, value, total, color) {
    const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
    return `
      <div class="flex items-center justify-between text-xs">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full" style="background-color: ${color}"></span>
          <span class="font-medium text-slate-700 dark:text-slate-300">${label}</span>
        </div>
        <div class="font-bold text-slate-900 dark:text-white">
          ${formatCompactIDR(value)} <span class="text-slate-400 text-[10px] font-normal">(${percent}%)</span>
        </div>
      </div>
    `;
  }

  function renderDonutChart(calc) {
    const total = calc.totalBoqCost || 1;
    const slices = [
      { value: calc.totalMaterial, color: '#2563eb' },
      { value: calc.totalLabor, color: '#f59e0b' },
      { value: calc.totalEquipment, color: '#10b981' },
      { value: calc.totalSubcon, color: '#8b5cf6' }
    ];

    let cumulativePercent = 0;
    function getCoords(pct) {
      const x = Math.cos(2 * Math.PI * pct);
      const y = Math.sin(2 * Math.PI * pct);
      return [x, y];
    }

    const paths = slices.map((s, i) => {
      if (s.value === 0) return '';
      const startPct = cumulativePercent;
      const slicePct = s.value / total;
      cumulativePercent += slicePct;
      const endPct = cumulativePercent;

      const [startX, startY] = getCoords(startPct);
      const [endX, endY] = getCoords(endPct);
      const largeArc = slicePct > 0.5 ? 1 : 0;

      if (slicePct >= 0.999) {
        return `<circle cx="0" cy="0" r="1" fill="${s.color}" />`;
      }

      return `<path d="M ${startX} ${startY} A 1 1 0 ${largeArc} 1 ${endX} ${endY} L 0 0" fill="${s.color}" />`;
    }).join('');

    return `
      <svg viewBox="-1 -1 2 2" class="w-48 h-48 sm:w-56 sm:h-56 transform -rotate-90 filter drop-shadow-md">
        ${paths}
        <circle cx="0" cy="0" r="0.7" class="fill-white dark:fill-slate-900" />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
        <span class="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Total RAB</span>
        <span class="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">${formatCompactIDR(calc.totalBoqCost)}</span>
      </div>
    `;
  }

  // 2. PROJECTS TAB
  function renderProjectsTab() {
    const filtered = projects.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.manager.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return `
      <div class="space-y-6">
        <!-- Header & Search Controls -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-white">Manajemen Proyek Konstruksi</h2>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Jadwal interaktif, Gantt chart, dan kontrol fase pekerjaan.</p>
          </div>
          
          <div class="flex items-center gap-3">
            <div class="relative flex-1 sm:w-64">
              <i data-lucide="search" class="w-4 h-4 absolute left-3 top-3 text-slate-400"></i>
              <input id="project-search-input" type="text" placeholder="Cari proyek / lokasi..." value="${searchQuery}" class="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" />
            </div>

            ${hasPermission('edit_projects') ? `
              <button id="add-project-modal-btn" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all shrink-0">
                <i data-lucide="plus" class="w-4 h-4"></i>
                <span>Tambah Proyek</span>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Project Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${filtered.map(p => {
            const health = getProjectHealth(p);
            return `
              <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all space-y-4">
                
                <div>
                  <div class="flex items-start justify-between gap-2">
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      p.status === 'Completed' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' :
                      p.status === 'In Progress' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'bg-slate-100 text-slate-700'
                    }">${p.status}</span>
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${health.color}">
                      ${health.text}
                    </span>
                  </div>

                  <h3 class="text-lg font-extrabold text-slate-900 dark:text-white mt-3 hover:text-blue-600 cursor-pointer open-project-btn" data-id="${p.id}">
                    ${p.name}
                  </h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                    <i data-lucide="map-pin" class="w-3.5 h-3.5 text-blue-500"></i> ${p.location}
                  </p>
                </div>

                <!-- Metrics & Progress -->
                <div class="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div class="flex justify-between text-xs">
                    <span class="text-slate-400">Total Budget:</span>
                    <span class="font-bold text-slate-900 dark:text-white">${formatCompactIDR(p.budget)}</span>
                  </div>
                  <div class="flex justify-between text-xs">
                    <span class="text-slate-400">Terpakai:</span>
                    <span class="font-bold text-slate-900 dark:text-white">${formatCompactIDR(p.spent)}</span>
                  </div>

                  <div>
                    <div class="flex justify-between text-xs mb-1">
                      <span class="text-slate-500 font-medium">Progres Fisik</span>
                      <span class="font-bold text-blue-600 dark:text-blue-400">${p.completion}%</span>
                    </div>
                    <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div class="bg-blue-600 h-full rounded-full transition-all duration-500" style="width: ${p.completion}%"></div>
                    </div>
                  </div>
                </div>

                <!-- Footer Card Info -->
                <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span class="text-slate-400 flex items-center gap-1">
                    <i data-lucide="user" class="w-3.5 h-3.5"></i> ${p.manager}
                  </span>
                  <button class="open-project-btn bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-400 dark:hover:text-white transition-all text-xs" data-id="${p.id}">
                    Lihat Timeline & Gantt →
                  </button>
                </div>

              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // 3. PROJECT DETAILS & GANTT TIMELINE TAB
  function renderProjectDetailsTab() {
    const project = projects.find(p => p.id === selectedProjectId);
    if (!project) return `<div class="p-8 text-center"><p class="text-slate-500">Proyek tidak ditemukan.</p></div>`;

    const health = getProjectHealth(project);

    return `
      <div class="space-y-6">
        <!-- Back Navigation -->
        <button id="back-to-projects-btn" class="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
          <i data-lucide="arrow-left" class="w-4 h-4"></i> Kembali ke Daftar Proyek
        </button>

        <!-- Project Hero Card -->
        <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${health.color}">${health.text}</span>
                <span class="text-xs text-slate-400">Jatuh Tempo: ${project.dueDate}</span>
              </div>
              <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white">${project.name}</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                <i data-lucide="map-pin" class="w-4 h-4 text-blue-500"></i> ${project.location} | <i data-lucide="user" class="w-4 h-4 text-emerald-500"></i> PM: ${project.manager}
              </p>
            </div>

            <div class="flex items-center gap-3">
              ${hasPermission('edit_projects') ? `
                <button id="edit-project-details-btn" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md">
                  <i data-lucide="edit-2" class="w-4 h-4"></i> Edit Informasi Proyek
                </button>
              ` : ''}
            </div>
          </div>

          <!-- Project Budget Stats -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <span class="text-xs text-slate-400 font-bold uppercase">Target Budget</span>
              <p class="text-lg font-black text-slate-900 dark:text-white mt-1">${formatIDR(project.budget)}</p>
            </div>
            <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <span class="text-xs text-slate-400 font-bold uppercase">Realisasi (Spent)</span>
              <p class="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">${formatIDR(project.spent)}</p>
            </div>
            <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <span class="text-xs text-slate-400 font-bold uppercase">Progres Rata-Rata Fase</span>
              <p class="text-lg font-black text-blue-600 dark:text-blue-400 mt-1">${project.completion}%</p>
            </div>
          </div>
        </div>

        <!-- Interactive Gantt Schedule Timeline -->
        <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <i data-lucide="calendar" class="w-5 h-5 text-blue-600"></i>
              Jadwal Waktu & Gantt Chart Timeline
            </h3>
            <span class="text-xs text-slate-400 font-medium">Geser slider untuk update progres fase</span>
          </div>

          <div class="gantt-container pt-2">
            ${project.phases.map(phase => `
              <div class="gantt-row">
                <div>
                  <h4 class="text-xs font-extrabold text-slate-900 dark:text-white">${phase.name}</h4>
                  <p class="text-[10px] text-slate-400">${phase.startDate} - ${phase.endDate}</p>
                </div>
                <div>
                  <div class="flex items-center justify-between text-xs mb-1">
                    <span class="font-bold ${phase.progress === 100 ? 'text-emerald-600' : 'text-blue-600'}">${phase.status}</span>
                    <span class="font-extrabold text-slate-800 dark:text-slate-200">${phase.progress}%</span>
                  </div>
                  <div class="gantt-track">
                    <div class="gantt-bar ${phase.progress === 100 ? 'bg-emerald-600' : 'bg-blue-600'}" style="width: ${phase.progress}%">
                      ${phase.progress > 20 ? phase.progress + '%' : ''}
                    </div>
                  </div>
                  ${hasPermission('edit_projects') ? `
                    <div class="mt-2 flex items-center gap-2">
                      <input type="range" min="0" max="100" value="${phase.progress}" class="phase-progress-slider w-full accent-blue-600" data-phase-id="${phase.id}" />
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // 4. BOQ / RAB TAB
  function renderBOQTab(calc) {
    const filteredBOQ = filterCategory === 'All' ? boqItems : boqItems.filter(b => b.category === filterCategory);

    return `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-white">Bill of Quantities (BOQ / RAB)</h2>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Estimasi harga satuan, kuantitas material, upah, dan margin keuntungan.</p>
          </div>

          <div class="flex items-center gap-2">
            ${hasPermission('edit_boq') ? `
              <button id="add-boq-item-btn" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md">
                <i data-lucide="plus" class="w-4 h-4"></i> Tambah Item RAB
              </button>
            ` : ''}
            <button id="export-boq-csv-btn" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md">
              <i data-lucide="download" class="w-4 h-4"></i> Ekspor CSV
            </button>
          </div>
        </div>

        <!-- Margin Meter Bar -->
        <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div class="flex justify-between items-center text-xs">
            <span class="font-bold text-slate-700 dark:text-slate-300">Estimasi Pendapatan Kontrak: ${formatIDR(estimatedRevenue)}</span>
            <span class="font-bold text-emerald-600">Profit Margin: ${calc.profitMargin}% (${formatIDR(calc.grossProfit)})</span>
          </div>
          <div class="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden flex">
            <div class="bg-blue-600 h-full" style="width: ${Math.min(100, (calc.totalBoqCost / estimatedRevenue) * 100)}%" title="Biaya Operasional RAB"></div>
            <div class="bg-emerald-500 h-full" style="width: ${Math.max(0, calc.profitMargin)}%" title="Gross Profit Margin"></div>
          </div>
        </div>

        <!-- Category Filters -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2">
          ${['All', 'Material', 'Labor', 'Equipment', 'Subcontractor'].map(cat => `
            <button class="boq-filter-btn px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterCategory === cat 
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }" data-cat="${cat}">
              ${cat}
            </button>
          `).join('')}
        </div>

        <!-- RAB Table -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead class="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th class="p-4">Uraian Pekerjaan / Material</th>
                  <th class="p-4">Kategori</th>
                  <th class="p-4">Volume / Qty</th>
                  <th class="p-4">Satuan</th>
                  <th class="p-4">Harga Satuan (IDR)</th>
                  <th class="p-4">Total Biaya</th>
                  ${hasPermission('edit_boq') ? `<th class="p-4 text-right">Aksi</th>` : ''}
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                ${filteredBOQ.map(item => {
                  const itemTotal = (item.quantity || 0) * (item.unitCost || 0);
                  return `
                    <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td class="p-4 font-extrabold text-slate-900 dark:text-white">${item.name}</td>
                      <td class="p-4">
                        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          item.category === 'Material' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                          item.category === 'Labor' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' :
                          item.category === 'Equipment' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' :
                          'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                        }">${item.category}</span>
                      </td>
                      <td class="p-4 font-bold">${item.quantity}</td>
                      <td class="p-4">${item.unit}</td>
                      <td class="p-4 font-bold text-slate-800 dark:text-slate-200">${formatIDR(item.unitCost)}</td>
                      <td class="p-4 font-extrabold text-blue-600 dark:text-blue-400">${formatIDR(itemTotal)}</td>
                      ${hasPermission('edit_boq') ? `
                        <td class="p-4 text-right">
                          <button class="delete-boq-btn text-rose-500 hover:text-rose-700 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all" data-id="${item.id}">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                          </button>
                        </td>
                      ` : ''}
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // 5. SITE LOG & INSPECTION TAB
  function renderSiteLogTab() {
    return `
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-white">Log Lapangan & Inspeksi K3</h2>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Catatan harian pengawasan proyek, jumlah pekerja, & audit keselamatan kerja.</p>
          </div>

          ${hasPermission('add_sitelog') ? `
            <button id="add-sitelog-modal-btn" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md">
              <i data-lucide="plus" class="w-4 h-4"></i> Buat Laporan Harian
            </button>
          ` : ''}
        </div>

        <!-- Site Logs Feed Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${siteLogs.map(log => `
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between">
              
              <div class="h-48 w-full overflow-hidden relative">
                <img src="${log.photoUrl}" alt="Site Photo" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                <div class="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <i data-lucide="calendar" class="w-3 h-3 text-cyan-400"></i> ${log.date}
                </div>
                <div class="absolute bottom-3 right-3 bg-emerald-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md">
                  ${log.safetyStatus}
                </div>
              </div>

              <div class="p-6 space-y-3">
                <div class="flex items-center justify-between">
                  <h3 class="text-base font-extrabold text-slate-900 dark:text-white">${log.projectName}</h3>
                  <span class="text-xs text-slate-400 flex items-center gap-1">
                    <i data-lucide="users" class="w-3.5 h-3.5 text-blue-500"></i> ${log.workersCount} Pekerja
                  </span>
                </div>

                <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">${log.summary}</p>

                <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span class="flex items-center gap-1">
                    <i data-lucide="cloud" class="w-3.5 h-3.5 text-cyan-500"></i> ${log.weather}
                  </span>
                  <span class="font-semibold text-slate-700 dark:text-slate-300">Pengawas: ${log.author}</span>
                </div>
              </div>

            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 6. PAM (PRIVILEGED ACCESS MANAGEMENT) TAB
  function renderPAMTab() {
    return `
      <div class="space-y-6">
        <div>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white">Privileged Access Management (PAM)</h2>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Ganti akun & peran (Role) untuk menguji otorisasi serta batas akses keamanan.</p>
        </div>

        <!-- Active User Profile Card -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl border border-white/30">
              ${currentUser.initials}
            </div>
            <div>
              <h3 class="text-xl font-extrabold">${currentUser.name}</h3>
              <p class="text-xs text-blue-100 font-medium">${currentUser.email}</p>
              <span class="inline-block mt-2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white text-blue-700">
                ${currentUser.role}
              </span>
            </div>
          </div>

          <div class="text-right sm:border-l border-white/20 sm:pl-6">
            <span class="text-xs text-blue-200">Izin Akses Aktif:</span>
            <div class="flex flex-wrap gap-1 mt-1 justify-end">
              ${(PERMISSIONS[currentUser.role] || []).map(p => `
                <span class="px-2 py-0.5 rounded bg-white/20 text-[10px] font-semibold">${p}</span>
              `).join('') || '<span class="text-xs italic text-blue-200">Hanya Membaca (Read-Only)</span>'}
            </div>
          </div>
        </div>

        <!-- Role Switcher Selection -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${DEFAULT_USERS.map(u => `
            <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border ${u.id === currentUser.id ? 'border-blue-600 ring-2 ring-blue-600/30' : 'border-slate-200 dark:border-slate-800'} shadow-sm space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl ${u.color} text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  ${u.initials}
                </div>
                <div>
                  <h4 class="text-sm font-extrabold text-slate-900 dark:text-white">${u.name}</h4>
                  <p class="text-xs text-blue-600 dark:text-blue-400 font-bold">${u.role}</p>
                </div>
              </div>

              <div class="text-[11px] text-slate-500 space-y-1">
                <p class="font-bold text-slate-700 dark:text-slate-300">Hak Akses Modul:</p>
                <ul class="list-disc list-inside text-slate-400">
                  ${(PERMISSIONS[u.role] || []).map(p => `<li>${p}</li>`).join('') || '<li>Read-Only View</li>'}
                </ul>
              </div>

              <button class="switch-user-btn w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 font-bold text-xs rounded-xl transition-all" data-user-id="${u.id}">
                ${u.id === currentUser.id ? 'Akun Aktif ✓' : 'Ganti ke Akun Ini'}
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // --- EVENT HANDLERS & LISTENERS ---
  function attachEvents() {
    // Navigation Tab Clicks
    document.querySelectorAll('.nav-tab-btn, .mobile-nav-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = btn.getAttribute('data-tab');
        if (tab) {
          activeTab = tab;
          renderApp();
        }
      });
    });

    // Dark Mode Toggle Button
    const darkBtn = document.getElementById('dark-toggle-btn');
    if (darkBtn) {
      darkBtn.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        saveState('darkMode', isDarkMode);
        renderApp();
      });
    }

    // PWA Install Button
    const pwaBtn = document.getElementById('pwa-install-btn');
    if (pwaBtn && deferredPrompt) {
      pwaBtn.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            showToast('PWA Terpasang dengan Sukses!', 'success');
          }
          deferredPrompt = null;
          pwaBtn.classList.add('hidden');
        });
      });
    }

    // Quick Export Report
    const exportBtn = document.getElementById('quick-export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Open Project Details
    document.querySelectorAll('.open-project-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'));
        if (id) {
          selectedProjectId = id;
          activeTab = 'project-details';
          renderApp();
        }
      });
    });

    // Back to Projects
    const backBtn = document.getElementById('back-to-projects-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        activeTab = 'projects';
        renderApp();
      });
    }

    // Project Search Input
    const searchInput = document.getElementById('project-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        const grid = document.querySelector('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3');
        if (grid) {
          // Soft re-render search list
          renderApp();
        }
      });
    }

    // Phase Progress Slider
    document.querySelectorAll('.phase-progress-slider').forEach(slider => {
      slider.addEventListener('change', (e) => {
        const phaseId = parseInt(e.target.getAttribute('data-phase-id'));
        const newProgress = parseInt(e.target.value);

        const project = projects.find(p => p.id === selectedProjectId);
        if (project && phaseId) {
          const phase = project.phases.find(ph => ph.id === phaseId);
          if (phase) {
            phase.progress = newProgress;
            phase.status = newProgress === 100 ? 'Completed' : newProgress > 0 ? 'In Progress' : 'Pending';

            // Recalculate average progress
            const avg = Math.round(project.phases.reduce((acc, ph) => acc + ph.progress, 0) / project.phases.length);
            project.completion = avg;
            if (avg === 100) project.status = 'Completed';

            saveState('projects', projects);
            showToast(`Progres fase "${phase.name}" diperbarui ke ${newProgress}%`, 'success');
            renderApp();
          }
        }
      });
    });

    // BOQ Filter Category
    document.querySelectorAll('.boq-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterCategory = btn.getAttribute('data-cat') || 'All';
        renderApp();
      });
    });

    // Delete BOQ Item
    document.querySelectorAll('.delete-boq-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'));
        if (id) {
          boqItems = boqItems.filter(b => b.id !== id);
          saveState('boq', boqItems);
          showToast('Item RAB berhasil dihapus', 'success');
          renderApp();
        }
      });
    });

    // Export BOQ to CSV
    const exportCsvBtn = document.getElementById('export-boq-csv-btn');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        let csv = 'Uraian,Kategori,Kuantitas,Satuan,Harga Satuan (IDR),Total (IDR)\n';
        boqItems.forEach(b => {
          csv += `"${b.name}","${b.category}",${b.quantity},"${b.unit}",${b.unitCost},${b.quantity * b.unitCost}\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BOQ_RAB_ConstructionHub_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        showToast('File CSV berhasil diunduh', 'success');
      });
    }

    // Switch User (PAM)
    document.querySelectorAll('.switch-user-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const uid = btn.getAttribute('data-user-id');
        const found = DEFAULT_USERS.find(u => u.id === uid);
        if (found) {
          currentUser = found;
          saveState('currentUser', currentUser);
          showToast(`Akun berganti ke: ${currentUser.name} (${currentUser.role})`, 'success');
          renderApp();
        }
      });
    });

    // FAB / Modal Add Project Click
    const fabBtn = document.getElementById('fab-add-btn');
    const addProjectBtn = document.getElementById('add-project-modal-btn');
    if (fabBtn) fabBtn.addEventListener('click', openAddProjectModal);
    if (addProjectBtn) addProjectBtn.addEventListener('click', openAddProjectModal);

    // View Site Logs Link Button
    const viewLogsBtn = document.getElementById('view-sitelogs-link-btn');
    if (viewLogsBtn) {
      viewLogsBtn.addEventListener('click', () => {
        activeTab = 'sitelog';
        renderApp();
      });
    }
  }

  // --- MODALS ENGINE ---
  function openAddProjectModal() {
    if (!hasPermission('edit_projects')) {
      showToast('Akses Ditolak: Membutuhkan peran CEO atau PM', 'error');
      return;
    }

    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = `
      <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white dark:bg-slate-900 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 border border-slate-200 dark:border-slate-800">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 class="text-base font-extrabold text-slate-900 dark:text-white">Tambah Proyek Konstruksi</h3>
            <button id="close-modal-btn" class="text-slate-400 hover:text-slate-600">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <form id="add-project-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Proyek</label>
              <input type="text" id="m-name" required placeholder="Contoh: Gedung Office Tower C" class="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lokasi Proyek</label>
              <input type="text" id="m-location" required placeholder="Contoh: Kebayoran Baru, Jakarta" class="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Anggaran Proyek (IDR)</label>
              <input type="number" id="m-budget" required placeholder="15000000000" class="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Project Manager (PM)</label>
              <input type="text" id="m-manager" value="${currentUser.name}" class="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl" />
            </div>

            <div class="pt-3 flex justify-end gap-2">
              <button type="button" id="cancel-modal-btn" class="px-4 py-2 bg-slate-100 dark:bg-slate-800 font-bold rounded-xl text-slate-600 dark:text-slate-300">Batal</button>
              <button type="submit" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md">Simpan Proyek</button>
            </div>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();

    document.getElementById('close-modal-btn').onclick = () => modalContainer.innerHTML = '';
    document.getElementById('cancel-modal-btn').onclick = () => modalContainer.innerHTML = '';

    document.getElementById('add-project-form').onsubmit = (e) => {
      e.preventDefault();
      const newP = {
        id: Date.now(),
        name: document.getElementById('m-name').value,
        location: document.getElementById('m-location').value,
        budget: parseFloat(document.getElementById('m-budget').value) || 0,
        spent: 0,
        completion: 0,
        status: 'In Progress',
        manager: document.getElementById('m-manager').value,
        dueDate: '2027-01-01',
        weather: { condition: 'Cerah', temp: 30, rainRisk: 'Rendah', alert: 'Proyek Baru Diinisiasi' },
        phases: [
          { id: Date.now() + 1, name: 'Persiapan Lahan & Perizinan', status: 'In Progress', progress: 20, startDate: '2026-08-01', endDate: '2026-09-30' },
          { id: Date.now() + 2, name: 'Pekerjaan Substructure', status: 'Pending', progress: 0, startDate: '2026-10-01', endDate: '2026-12-31' }
        ]
      };

      projects.push(newP);
      saveState('projects', projects);
      modalContainer.innerHTML = '';
      showToast('Proyek baru berhasil ditambahkan!', 'success');
      activeTab = 'projects';
      renderApp();
    };
  }

  // --- APP INITIALIZATION ---
  document.addEventListener('DOMContentLoaded', () => {
    renderApp();
  });

  // Direct boot if already loaded
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    renderApp();
  }
})();
