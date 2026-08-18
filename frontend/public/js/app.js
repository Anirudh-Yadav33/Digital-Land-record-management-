/**
 * Digital Land Record & Property Registration Platform - Client Application
 */

const state = {
  token: localStorage.getItem('land_app_token') || null,
  user: JSON.parse(localStorage.getItem('land_app_user') || 'null'),
  lands: [],
  myLands: [],
  applications: [],
  myApplications: [],
  auditLogs: [],
  currentWizardStep: 1,
  registrationCoords: [
    { x: 500, y: 60 },
    { x: 620, y: 60 },
    { x: 620, y: 160 },
    { x: 500, y: 160 }
  ]
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  updateAuthUI();

  if (state.token && state.user) {
    if (state.user.role === 'admin') {
      switchView('admin-dash');
    } else {
      switchView('citizen-dash');
    }
  } else {
    switchView('landing');
  }

  // Initial map draw
  loadPublicLedger();
});

// Setup UI Event Listeners
function setupEventListeners() {
  // Navigation buttons
  document.getElementById('nav-landing-btn')?.addEventListener('click', () => switchView('landing'));
  document.getElementById('nav-dash-btn')?.addEventListener('click', () => {
    if (state.user?.role === 'admin') switchView('admin-dash');
    else switchView('citizen-dash');
  });
  document.getElementById('nav-ledger-btn')?.addEventListener('click', () => switchView('ledger-search'));
  document.getElementById('nav-login-btn')?.addEventListener('click', () => openModal('auth-modal'));
  document.getElementById('nav-register-prop-btn')?.addEventListener('click', () => switchView('register-property'));
  document.getElementById('nav-logout-btn')?.addEventListener('click', logout);

  // Auth Modal Forms
  document.getElementById('login-form')?.addEventListener('submit', handleLogin);
  document.getElementById('register-form')?.addEventListener('submit', handleRegister);
  document.getElementById('tab-login')?.addEventListener('click', () => toggleAuthTab('login'));
  document.getElementById('tab-register')?.addEventListener('click', () => toggleAuthTab('register'));

  // Quick Demo Logins
  document.getElementById('demo-user-btn')?.addEventListener('click', () => quickDemoLogin('user@land.gov', 'password123'));
  document.getElementById('demo-admin-btn')?.addEventListener('click', () => quickDemoLogin('admin@land.gov', 'password123'));

  // Registration Form Steps & Submit
  document.getElementById('step-1-next')?.addEventListener('click', () => setWizardStep(2));
  document.getElementById('step-2-prev')?.addEventListener('click', () => setWizardStep(1));
  document.getElementById('step-2-next')?.addEventListener('click', () => setWizardStep(3));
  document.getElementById('step-3-prev')?.addEventListener('click', () => setWizardStep(2));
  document.getElementById('step-3-next')?.addEventListener('click', () => {
    populateRegistrationReview();
    setWizardStep(4);
  });
  document.getElementById('step-4-prev')?.addEventListener('click', () => setWizardStep(3));
  document.getElementById('property-registration-form')?.addEventListener('submit', handlePropertyRegistration);

  // Search input
  document.getElementById('ledger-search-input')?.addEventListener('input', handleLedgerSearch);
}

// Router & View Switcher
function switchView(viewId) {
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));

  const targetView = document.getElementById(`view-${viewId}`);
  if (targetView) {
    targetView.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Trigger data loads per view
  if (viewId === 'citizen-dash' && state.token) {
    loadCitizenData();
  } else if (viewId === 'admin-dash' && state.token) {
    loadAdminData();
  } else if (viewId === 'ledger-search') {
    loadPublicLedger();
  } else if (viewId === 'landing') {
    loadLandingStats();
  }
}

// Toggle Auth Modal Tabs
function toggleAuthTab(tab) {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const tabLoginBtn = document.getElementById('tab-login');
  const tabRegBtn = document.getElementById('tab-register');

  if (tab === 'login') {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    tabLoginBtn.classList.add('active');
    tabRegBtn.classList.remove('active');
  } else {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    tabRegBtn.classList.add('active');
    tabLoginBtn.classList.remove('active');
  }
}

// Update Navigation & Auth UI
function updateAuthUI() {
  const loginNavBtn = document.getElementById('nav-login-btn');
  const dashNavBtn = document.getElementById('nav-dash-btn');
  const regPropBtn = document.getElementById('nav-register-prop-btn');
  const userBadge = document.getElementById('user-badge-container');

  if (state.token && state.user) {
    if (loginNavBtn) loginNavBtn.style.display = 'none';
    if (dashNavBtn) dashNavBtn.style.display = 'inline-flex';

    if (state.user.role === 'admin') {
      if (regPropBtn) regPropBtn.style.display = 'none';
    } else {
      if (regPropBtn) regPropBtn.style.display = 'inline-flex';
    }

    if (userBadge) {
      userBadge.style.display = 'flex';
      userBadge.innerHTML = `
        <div class="user-avatar">${state.user.name.charAt(0)}</div>
        <div>
          <div style="font-weight:700; line-height:1.2;">${state.user.name}</div>
          <span class="role-pill role-${state.user.role}">${state.user.role}</span>
        </div>
        <button id="nav-logout-btn" class="nav-btn nav-btn-ghost btn-sm" title="Sign Out">Logout</button>
      `;
      document.getElementById('nav-logout-btn')?.addEventListener('click', logout);
    }
  } else {
    if (loginNavBtn) loginNavBtn.style.display = 'inline-flex';
    if (dashNavBtn) dashNavBtn.style.display = 'none';
    if (regPropBtn) regPropBtn.style.display = 'none';
    if (userBadge) userBadge.style.display = 'none';
  }
}

// Authentication API Handlers
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('land_app_token', data.token);
    localStorage.setItem('land_app_user', JSON.stringify(data.user));

    closeModal('auth-modal');
    updateAuthUI();
    showToast(`Welcome back, ${data.user.name}!`, 'success');

    if (data.user.role === 'admin') switchView('admin-dash');
    else switchView('citizen-dash');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const role = document.getElementById('reg-role').value;
  const idNumber = document.getElementById('reg-id-number').value;

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, idNumber })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');

    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('land_app_token', data.token);
    localStorage.setItem('land_app_user', JSON.stringify(data.user));

    closeModal('auth-modal');
    updateAuthUI();
    showToast(`Account created successfully!`, 'success');

    if (data.user.role === 'admin') switchView('admin-dash');
    else switchView('citizen-dash');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function quickDemoLogin(email, password) {
  document.getElementById('login-email').value = email;
  document.getElementById('login-password').value = password;
  toggleAuthTab('login');
  openModal('auth-modal');

  const mockEvent = { preventDefault: () => {} };
  await handleLogin(mockEvent);
}

function logout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('land_app_token');
  localStorage.removeItem('land_app_user');
  updateAuthUI();
  switchView('landing');
  showToast('Logged out safely', 'info');
}

// Data Fetching: Citizen Dashboard
async function loadCitizenData() {
  if (!state.token || !state.user) return;

  try {
    // 1. Fetch user owned lands
    const resLands = await fetch(`/api/lands?ownerId=${state.user.id}`, {
      headers: { Authorization: `Bearer ${state.token}` }
    });
    const lands = await resLands.json();
    state.myLands = lands;
    renderMyLandRecords(lands);

    // 2. Fetch user applications
    const resApps = await fetch('/api/registrations/my', {
      headers: { Authorization: `Bearer ${state.token}` }
    });
    const apps = await resApps.json();
    state.myApplications = apps;
    renderMyApplications(apps);

    // Render Citizen Spatial Map
    renderSpatialMap('citizen-map-canvas', lands, null);
  } catch (err) {
    console.error('Error loading citizen data:', err);
  }
}

function renderMyLandRecords(lands) {
  const container = document.getElementById('my-lands-grid');
  if (!container) return;

  if (lands.length === 0) {
    container.innerHTML = `
      <div class="card" style="grid-column: 1 / -1; text-align:center; padding:3rem 1rem;">
        <h3 style="color:var(--text-muted);">No Verified Land Records Found</h3>
        <p style="color:var(--text-dark); margin:0.5rem 0 1.5rem 0;">You do not currently have any registered property titles on your name.</p>
        <button class="btn btn-primary" onclick="switchView('register-property')">+ Apply for Property Registration</button>
      </div>
    `;
    return;
  }

  container.innerHTML = lands
    .map(
      land => `
    <div class="card">
      <div class="card-header">
        <span class="badge badge-success">✓ Clear Title</span>
        <span style="font-size:0.8rem; font-family:monospace; color:var(--text-muted);">${land.id}</span>
      </div>
      <h3 style="font-size:1.15rem; margin-bottom:0.4rem;">${land.title}</h3>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">📍 ${land.district}, ${land.sector}</p>

      <div style="background:rgba(15,23,42,0.6); padding:0.8rem; border-radius:var(--radius-sm); font-size:0.85rem; margin-bottom:1.2rem;">
        <div style="display:flex; justify-content:space-between; margin-bottom:0.3rem;">
          <span style="color:var(--text-muted);">Parcel Area:</span>
          <strong>${land.areaSqFt.toLocaleString()} Sq. Ft</strong>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:0.3rem;">
          <span style="color:var(--text-muted);">Valuation:</span>
          <strong style="color:var(--accent-secondary);">$${land.valuationUsd.toLocaleString()}</strong>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span style="color:var(--text-muted);">Deed Ref:</span>
          <strong style="font-family:monospace;">${land.deedRef}</strong>
        </div>
      </div>

      <div style="display:flex; gap:0.5rem;">
        <button class="btn btn-primary btn-sm" style="flex:1;" onclick="viewDeedCertificate('${land.id}')">📜 View Deed Certificate</button>
      </div>
    </div>
  `
    )
    .join('');
}

function renderMyApplications(apps) {
  const container = document.getElementById('my-apps-table-body');
  if (!container) return;

  if (apps.length === 0) {
    container.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:2rem;">No active registration applications</td></tr>`;
    return;
  }

  container.innerHTML = apps
    .map(app => {
      let statusBadge = `<span class="badge badge-warning">⏳ Pending Review</span>`;
      if (app.status === 'APPROVED') statusBadge = `<span class="badge badge-success">✓ Approved</span>`;
      if (app.status === 'REJECTED') statusBadge = `<span class="badge badge-danger">✗ Rejected</span>`;
      if (app.status === 'FLAGGED_FRAUD') statusBadge = `<span class="badge badge-danger">⚠️ Fraud Risk Flagged</span>`;

      return `
      <tr>
        <td><strong style="font-family:monospace;">${app.id}</strong></td>
        <td><strong>${app.propertyTitle}</strong><br><span style="font-size:0.8rem; color:var(--text-muted);">${app.district}</span></td>
        <td>${app.areaSqFt.toLocaleString()} sq.ft</td>
        <td>$${app.proposedValuationUsd.toLocaleString()}</td>
        <td>${statusBadge}</td>
        <td><span style="font-size:0.8rem; color:var(--text-muted);">${new Date(app.submittedAt).toLocaleDateString()}</span></td>
      </tr>
    `;
    })
    .join('');
}

// Data Fetching: Admin Verification Portal
async function loadAdminData() {
  if (!state.token || state.user?.role !== 'admin') return;

  try {
    const resApps = await fetch('/api/admin/applications', {
      headers: { Authorization: `Bearer ${state.token}` }
    });
    const apps = await resApps.json();
    state.applications = apps;

    const resLands = await fetch('/api/lands');
    const lands = await resLands.json();
    state.lands = lands;

    const resLogs = await fetch('/api/admin/audit-logs', {
      headers: { Authorization: `Bearer ${state.token}` }
    });
    const logs = await resLogs.json();
    state.auditLogs = logs;

    renderAdminOverviewStats(apps, lands);
    renderAdminApplicationsQueue(apps);
    renderAdminAuditLogs(logs);

    renderSpatialMap('admin-map-canvas', lands, apps);
  } catch (err) {
    console.error('Error loading admin data:', err);
  }
}

function renderAdminOverviewStats(apps, lands) {
  const pendingCount = apps.filter(a => a.status === 'PENDING').length;
  const fraudCount = apps.filter(a => a.status === 'FLAGGED_FRAUD' || (a.fraudRisk && a.fraudRisk.level === 'CRITICAL')).length;

  document.getElementById('stat-pending-apps').textContent = pendingCount;
  document.getElementById('stat-fraud-flags').textContent = fraudCount;
  document.getElementById('stat-registered-lands').textContent = lands.length;
}

function renderAdminApplicationsQueue(apps) {
  const container = document.getElementById('admin-apps-table-body');
  if (!container) return;

  if (apps.length === 0) {
    container.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">No property registration applications in queue</td></tr>`;
    return;
  }

  container.innerHTML = apps
    .map(app => {
      let statusBadge = `<span class="badge badge-warning">Pending</span>`;
      if (app.status === 'APPROVED') statusBadge = `<span class="badge badge-success">Approved</span>`;
      if (app.status === 'REJECTED') statusBadge = `<span class="badge badge-danger">Rejected</span>`;
      if (app.status === 'FLAGGED_FRAUD') statusBadge = `<span class="badge badge-danger">Fraud Risk</span>`;

      const score = app.fraudRisk ? app.fraudRisk.score : 0;
      let scoreBadge = `<span class="badge badge-success">Risk: ${score}/100</span>`;
      if (score >= 70) scoreBadge = `<span class="badge badge-danger">Risk: ${score}/100 (CRITICAL)</span>`;
      else if (score >= 40) scoreBadge = `<span class="badge badge-warning">Risk: ${score}/100 (MEDIUM)</span>`;

      return `
      <tr>
        <td><strong style="font-family:monospace;">${app.id}</strong></td>
        <td><strong>${app.applicantName}</strong><br><span style="font-size:0.78rem; color:var(--text-muted);">${app.applicantEmail}</span></td>
        <td><strong>${app.propertyTitle}</strong><br><span style="font-size:0.78rem; color:var(--text-muted);">${app.district}</span></td>
        <td>$${app.proposedValuationUsd.toLocaleString()}</td>
        <td>${scoreBadge}</td>
        <td>${statusBadge}</td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="inspectApplicationModal('${app.id}')">🔍 Audit Application</button>
        </td>
      </tr>
    `;
    })
    .join('');
}

function renderAdminAuditLogs(logs) {
  const container = document.getElementById('admin-audit-table-body');
  if (!container) return;

  container.innerHTML = logs
    .slice(0, 10)
    .map(
      log => `
    <tr>
      <td style="font-size:0.8rem; color:var(--text-muted);">${new Date(log.timestamp).toLocaleString()}</td>
      <td><span class="badge badge-info">${log.action}</span></td>
      <td style="font-size:0.85rem;">${log.user}</td>
      <td style="font-size:0.85rem; color:var(--text-muted);">${log.details}</td>
    </tr>
  `
    )
    .join('');
}

// Admin Audit & Fraud Inspection Modal
function inspectApplicationModal(appId) {
  const app = state.applications.find(a => a.id === appId);
  if (!app) return;

  const content = document.getElementById('inspect-modal-body');
  if (!content) return;

  const fraud = app.fraudRisk || { score: 0, level: 'LOW', reasons: ['No fraud triggers found'] };
  let barColorClass = 'score-low';
  if (fraud.score >= 70) barColorClass = 'score-critical';
  else if (fraud.score >= 45) barColorClass = 'score-high';
  else if (fraud.score >= 20) barColorClass = 'score-medium';

  content.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid var(--border-color); padding-bottom:0.8rem;">
      <div>
        <span style="font-family:monospace; color:var(--text-muted); font-size:0.85rem;">APPLICATION AUDIT DOSSIER</span>
        <h2 style="font-size:1.4rem;">${app.propertyTitle}</h2>
      </div>
      <span class="badge badge-${app.status === 'APPROVED' ? 'success' : app.status === 'FLAGGED_FRAUD' || app.status === 'REJECTED' ? 'danger' : 'warning'}">
        Status: ${app.status}
      </span>
    </div>

    <!-- Automated Fraud Detection Engine Panel -->
    <div class="fraud-gauge-card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong style="color:var(--text-main); font-size:0.95rem;">🤖 AI/Algorithmic Fraud Audit Score</strong>
          <div style="font-size:0.8rem; color:var(--text-muted);">Spatial overlap, benchmark pricing & seller history verification</div>
        </div>
        <div style="text-align:right;">
          <span style="font-size:1.6rem; font-family:var(--font-heading); font-weight:800; color:${fraud.score >= 70 ? 'var(--accent-danger)' : fraud.score >= 35 ? 'var(--accent-warning)' : 'var(--accent-success)'};">
            ${fraud.score} / 100
          </span>
        </div>
      </div>

      <div class="fraud-score-bar-bg">
        <div class="fraud-score-bar-fill ${barColorClass}" style="width: ${fraud.score}%;"></div>
      </div>

      <div style="margin-top:0.8rem;">
        <strong style="font-size:0.85rem; color:var(--text-muted);">Audit Triggers & Findings:</strong>
        <ul style="font-size:0.85rem; margin-left:1.2rem; margin-top:0.4rem; color:var(--text-main);">
          ${fraud.reasons.map(r => `<li style="margin-bottom:0.3rem;">${r}</li>`).join('')}
        </ul>
      </div>
    </div>

    <!-- Application Details Grid -->
    <div class="grid-2" style="margin-top:1.2rem;">
      <div style="background:rgba(15,23,42,0.6); padding:1rem; border-radius:var(--radius-sm);">
        <h4 style="font-size:0.9rem; color:var(--accent-secondary); margin-bottom:0.6rem;">Applicant Details</h4>
        <p style="font-size:0.85rem;"><strong>Name:</strong> ${app.applicantName}</p>
        <p style="font-size:0.85rem;"><strong>Email:</strong> ${app.applicantEmail}</p>
        <p style="font-size:0.85rem;"><strong>National ID:</strong> ${app.applicantIdNumber}</p>
        <p style="font-size:0.85rem;"><strong>Phone:</strong> ${app.applicantPhone}</p>
      </div>

      <div style="background:rgba(15,23,42,0.6); padding:1rem; border-radius:var(--radius-sm);">
        <h4 style="font-size:0.9rem; color:var(--accent-secondary); margin-bottom:0.6rem;">Property Specifications</h4>
        <p style="font-size:0.85rem;"><strong>District:</strong> ${app.district} (${app.sector})</p>
        <p style="font-size:0.85rem;"><strong>Area:</strong> ${app.areaSqFt.toLocaleString()} sq.ft</p>
        <p style="font-size:0.85rem;"><strong>Proposed Valuation:</strong> $${app.proposedValuationUsd.toLocaleString()}</p>
        <p style="font-size:0.85rem;"><strong>Seller:</strong> ${app.sellerName} (${app.sellerIdNumber})</p>
      </div>
    </div>

    <!-- Verification Documents -->
    <div style="margin-top:1.2rem;">
      <strong style="font-size:0.9rem; color:var(--text-muted);">Submitted Cadastral Documents:</strong>
      <div style="display:flex; gap:0.6rem; flex-wrap:wrap; margin-top:0.5rem;">
        ${app.documents
          .map(
            doc => `
          <a href="${doc.url || '/uploads/' + (doc.filename || 'sample_deed.pdf')}" target="_blank" class="btn btn-secondary btn-sm">
            📄 ${doc.type}: ${doc.name}
          </a>
        `
          )
          .join('')}
      </div>
    </div>

    <!-- Action Bar -->
    <div style="margin-top:1.5rem; padding-top:1rem; border-top:1px solid var(--border-color);">
      <div class="form-group">
        <label class="form-label">Inspector Verification Notes</label>
        <textarea id="inspect-notes-input" class="form-textarea" rows="2" placeholder="Enter remarks, approval certificate reference, or rejection reason...">${app.inspectorNotes || ''}</textarea>
      </div>

      <div style="display:flex; justify-content:space-between; gap:0.8rem; margin-top:1rem;">
        <button class="btn btn-secondary btn-sm" onclick="reAuditFraud('${app.id}')">🔄 Re-scan Fraud Engine</button>

        <div style="display:flex; gap:0.8rem;">
          <button class="btn btn-danger" onclick="rejectApplicationAction('${app.id}')">✗ Reject Registration</button>
          <button class="btn btn-success" onclick="approveApplicationAction('${app.id}')">✓ Approve & Issue Land Title</button>
        </div>
      </div>
    </div>
  `;

  openModal('inspect-modal');
}

async function approveApplicationAction(appId) {
  const notes = document.getElementById('inspect-notes-input')?.value;

  try {
    const res = await fetch(`/api/admin/applications/${appId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.token}`
      },
      body: JSON.stringify({ inspectorNotes: notes })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Approval failed');

    closeModal('inspect-modal');
    showToast(`Application ${appId} Approved! Official Title Deed Issued: ${data.landRecord.id}`, 'success');
    loadAdminData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function rejectApplicationAction(appId) {
  const notes = document.getElementById('inspect-notes-input')?.value;

  try {
    const res = await fetch(`/api/admin/applications/${appId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.token}`
      },
      body: JSON.stringify({ inspectorNotes: notes })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Rejection failed');

    closeModal('inspect-modal');
    showToast(`Application ${appId} Rejected`, 'info');
    loadAdminData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function reAuditFraud(appId) {
  try {
    const res = await fetch(`/api/admin/applications/${appId}/fraud-check`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${state.token}` }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Fraud re-audit failed');

    showToast(`Fraud audit updated! Risk Score: ${data.fraudRisk.score}/100`, 'info');
    inspectApplicationModal(appId);
    loadAdminData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Digital Deed Certificate Viewer Modal
async function viewDeedCertificate(landId) {
  let land = state.myLands.find(l => l.id === landId) || state.lands.find(l => l.id === landId);

  if (!land) {
    try {
      const res = await fetch(`/api/lands/${landId}`);
      land = await res.json();
    } catch (e) {
      showToast('Could not fetch deed details', 'error');
      return;
    }
  }

  const modalBody = document.getElementById('deed-modal-body');
  if (!modalBody) return;

  modalBody.innerHTML = `
    <div style="border:4px double var(--accent-primary); padding:2rem; background:#0c1322; border-radius:var(--radius-md); text-align:center; position:relative;">
      <div style="position:absolute; top:15px; right:15px; background:var(--accent-primary); color:white; font-size:0.7rem; padding:0.2rem 0.6rem; border-radius:var(--radius-full); font-weight:700;">
        GOVERNMENT CERTIFIED
      </div>

      <div style="font-size:2rem; margin-bottom:0.2rem;">🏛️</div>
      <h2 style="font-family:var(--font-heading); color:var(--accent-secondary); letter-spacing:0.05em;">DIGITAL LAND TITLE CERTIFICATE</h2>
      <p style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase;">Central Bureau of Cadastral Control & Land Registration</p>
      
      <div style="height:1px; background:var(--border-color); margin:1.2rem 0;"></div>

      <div style="text-align:left; font-size:0.9rem; line-height:1.8;">
        <p>This document certifies that the real property specified below is officially registered under the Central Cadastral Registry with clear legal title ownership.</p>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin:1.2rem 0; background:rgba(255,255,255,0.03); padding:1rem; border-radius:var(--radius-sm);">
          <div>
            <span style="color:var(--text-muted); font-size:0.8rem;">UNIQUE PROPERTY PIN:</span><br>
            <strong style="font-family:monospace; color:var(--accent-primary); font-size:1.05rem;">${land.pin}</strong>
          </div>
          <div>
            <span style="color:var(--text-muted); font-size:0.8rem;">REGISTERED DEED REF:</span><br>
            <strong style="font-family:monospace;">${land.deedRef}</strong>
          </div>
          <div>
            <span style="color:var(--text-muted); font-size:0.8rem;">LEGAL PROPRIETOR:</span><br>
            <strong>${land.ownerName}</strong>
          </div>
          <div>
            <span style="color:var(--text-muted); font-size:0.8rem;">NATIONAL ID:</span><br>
            <strong style="font-family:monospace;">${land.ownerIdNumber || 'AD-9876-5432-1098'}</strong>
          </div>
          <div>
            <span style="color:var(--text-muted); font-size:0.8rem;">PARCEL TITLE:</span><br>
            <strong>${land.title}</strong>
          </div>
          <div>
            <span style="color:var(--text-muted); font-size:0.8rem;">SURVEY AREA:</span><br>
            <strong>${land.areaSqFt.toLocaleString()} Sq. Ft</strong>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:1.5rem;">
          <div style="font-size:0.8rem; color:var(--text-muted);">
            <div>Registration Date: <strong>${land.registrationDate}</strong></div>
            <div>Tax Status: <strong style="color:var(--accent-success);">PAID (Valid till ${land.taxValidTill})</strong></div>
          </div>
          <div style="text-align:center;">
            <div style="width:70px; height:70px; background:white; color:black; padding:4px; font-size:0.6rem; margin:0 auto; font-family:monospace; display:flex; align-items:center; justify-content:center; border-radius:4px;">
              [QR VERIFY]
            </div>
            <span style="font-size:0.7rem; color:var(--text-dark);">Cryptographic Hash Valid</span>
          </div>
        </div>
      </div>
    </div>
  `;

  openModal('deed-modal');
}

// Registration Form Wizard
function setWizardStep(step) {
  state.currentWizardStep = step;

  document.querySelectorAll('.wizard-step-panel').forEach(p => (p.style.display = 'none'));
  document.getElementById(`wizard-step-${step}`).style.display = 'block';

  for (let i = 1; i <= 4; i++) {
    const node = document.getElementById(`step-node-${i}`);
    if (!node) continue;
    if (i === step) {
      node.classList.add('active');
      node.classList.remove('done');
    } else if (i < step) {
      node.classList.remove('active');
      node.classList.add('done');
    } else {
      node.classList.remove('active', 'done');
    }
  }
}

function populateRegistrationReview() {
  const title = document.getElementById('reg-prop-title')?.value;
  const district = document.getElementById('reg-prop-district')?.value;
  const area = document.getElementById('reg-prop-area')?.value;
  const valuation = document.getElementById('reg-prop-valuation')?.value;

  const reviewBox = document.getElementById('registration-review-box');
  if (!reviewBox) return;

  reviewBox.innerHTML = `
    <div style="background:rgba(15,23,42,0.8); padding:1.2rem; border-radius:var(--radius-sm); font-size:0.9rem;">
      <p><strong>Property Title:</strong> ${title || 'N/A'}</p>
      <p><strong>District / Sector:</strong> ${district || 'N/A'}</p>
      <p><strong>Total Cadastral Area:</strong> ${area ? Number(area).toLocaleString() + ' sq.ft' : 'N/A'}</p>
      <p><strong>Proposed Valuation:</strong> ${valuation ? '$' + Number(valuation).toLocaleString() : 'N/A'}</p>
      <p><strong>Cadastral Coordinates:</strong> Defined (${state.registrationCoords.length} Boundary Points)</p>
    </div>
  `;
}

async function handlePropertyRegistration(e) {
  e.preventDefault();
  if (!state.token) {
    showToast('Please sign in to submit property registration', 'error');
    openModal('auth-modal');
    return;
  }

  const formData = new FormData();
  formData.append('propertyTitle', document.getElementById('reg-prop-title').value);
  formData.append('district', document.getElementById('reg-prop-district').value);
  formData.append('sector', document.getElementById('reg-prop-sector').value);
  formData.append('areaSqFt', document.getElementById('reg-prop-area').value);
  formData.append('zone', document.getElementById('reg-prop-zone').value);
  formData.append('proposedValuationUsd', document.getElementById('reg-prop-valuation').value);
  formData.append('sellerName', document.getElementById('reg-seller-name').value);
  formData.append('sellerIdNumber', document.getElementById('reg-seller-id').value);
  formData.append('coordinatesJson', JSON.stringify(state.registrationCoords));

  const idFile = document.getElementById('reg-doc-id')?.files[0];
  const deedFile = document.getElementById('reg-doc-deed')?.files[0];
  const surveyFile = document.getElementById('reg-doc-survey')?.files[0];

  if (idFile) formData.append('idProofDoc', idFile);
  if (deedFile) formData.append('saleDeedDoc', deedFile);
  if (surveyFile) formData.append('surveyMapDoc', surveyFile);

  try {
    const res = await fetch('/api/registrations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${state.token}` },
      body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Submission failed');

    showToast(`Application Submitted! ID: ${data.application.id}`, 'success');
    switchView('citizen-dash');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Public Ledger Search
async function loadPublicLedger() {
  try {
    const res = await fetch('/api/ledger/search');
    const lands = await res.json();
    renderPublicLedgerTable(lands);
    renderSpatialMap('public-map-canvas', lands, null);
  } catch (err) {
    console.error('Error fetching public ledger:', err);
  }
}

async function handleLedgerSearch(e) {
  const query = e.target.value;
  try {
    const res = await fetch(`/api/ledger/search?q=${encodeURIComponent(query)}`);
    const lands = await res.json();
    renderPublicLedgerTable(lands);
  } catch (err) {
    console.error('Error searching ledger:', err);
  }
}

function renderPublicLedgerTable(lands) {
  const container = document.getElementById('public-ledger-table-body');
  if (!container) return;

  if (lands.length === 0) {
    container.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">No matching land records found</td></tr>`;
    return;
  }

  container.innerHTML = lands
    .map(
      land => `
    <tr>
      <td><strong style="font-family:monospace; color:var(--accent-primary);">${land.pin}</strong></td>
      <td><strong>${land.title}</strong><br><span style="font-size:0.8rem; color:var(--text-muted);">${land.district}</span></td>
      <td>${land.ownerName}</td>
      <td>${land.areaSqFt.toLocaleString()} sq.ft</td>
      <td>$${land.valuationUsd.toLocaleString()}</td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="viewDeedCertificate('${land.id}')">📜 Public Deed</button>
      </td>
    </tr>
  `
    )
    .join('');
}

// HTML5 Canvas Spatial Map Engine
function renderSpatialMap(canvasId, lands, applications = []) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = (canvas.width = canvas.parentElement.clientWidth || 800);
  const height = (canvas.height = 380);

  // Clear background
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, width, height);

  // Grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Draw Registered Land Parcels
  (lands || []).forEach(land => {
    if (!land.coordinates || land.coordinates.length < 3) return;

    ctx.beginPath();
    ctx.moveTo(land.coordinates[0].x, land.coordinates[0].y);
    for (let i = 1; i < land.coordinates.length; i++) {
      ctx.lineTo(land.coordinates[i].x, land.coordinates[i].y);
    }
    ctx.closePath();

    ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Plot Label
    const centerX = land.coordinates.reduce((sum, p) => sum + p.x, 0) / land.coordinates.length;
    const centerY = land.coordinates.reduce((sum, p) => sum + p.y, 0) / land.coordinates.length;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(land.id, centerX, centerY);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter';
    ctx.fillText(land.ownerName, centerX, centerY + 14);
  });

  // Draw Pending / Fraud Flagged Applications in Admin Map
  (applications || []).forEach(app => {
    if (!app.coordinates || app.coordinates.length < 3) return;

    const isFraud = app.status === 'FLAGGED_FRAUD' || (app.fraudRisk && app.fraudRisk.level === 'CRITICAL');

    ctx.beginPath();
    ctx.moveTo(app.coordinates[0].x, app.coordinates[0].y);
    for (let i = 1; i < app.coordinates.length; i++) {
      ctx.lineTo(app.coordinates[i].x, app.coordinates[i].y);
    }
    ctx.closePath();

    ctx.fillStyle = isFraud ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.3)';
    ctx.fill();
    ctx.strokeStyle = isFraud ? '#ef4444' : '#f59e0b';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    const centerX = app.coordinates.reduce((sum, p) => sum + p.x, 0) / app.coordinates.length;
    const centerY = app.coordinates.reduce((sum, p) => sum + p.y, 0) / app.coordinates.length;

    ctx.fillStyle = isFraud ? '#f87171' : '#fbbf24';
    ctx.font = 'bold 11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText((isFraud ? '⚠️ FRAUD: ' : '⏳ PENDING: ') + app.id, centerX, centerY);
  });
}

// Landing Page Stats
async function loadLandingStats() {
  try {
    const res = await fetch('/api/lands');
    const lands = await res.json();

    document.getElementById('landing-stat-count').textContent = lands.length;
  } catch (e) {}
}

// Modal Helpers
function openModal(id) {
  document.getElementById(id)?.classList.add('active');
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove('active');
}

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
