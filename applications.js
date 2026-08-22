/* ================================================================
   JOB APPLICATION TRACKER - SPREADSHEET & KANBAN ENGINE
   ================================================================ */

window.DB = window.DB || {
  get: (k) => {
    try { return JSON.parse(localStorage.getItem("dsa_" + k)); } catch (e) { return null; }
  },
  set: (k, v) => {
    try { localStorage.setItem("dsa_" + k, JSON.stringify(v)); } catch (e) {}
  },
};
var DB = window.DB;

if (typeof escHtml !== 'function') {
  window.escHtml = function(str) {
    return (str || '')
      .toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };
}

let currentAppViewMode = DB.get("applications_view_mode") || "table"; // "table" or "kanban"
let appSearchQuery = "";
let appFilterStatus = "all";
let appFilterWorkMode = "all";
let appFilterPriority = "all";
let appShowArchived = false;
let appSortCol = "dateApplied";
let appSortDir = "desc";
let expandedAppId = null;

let stagedResumeFile = null;
let stagedCoverLetterFile = null;

/* ── 1. Data Access ── */
function getApplications() {
  const stored = DB.get("applications");
  if (stored && Array.isArray(stored)) return stored;
  const seed = (typeof INITIAL_APPLICATIONS_DATA !== "undefined" && Array.isArray(INITIAL_APPLICATIONS_DATA)) ? INITIAL_APPLICATIONS_DATA : [];
  return seed;
}

function saveApplications(apps) {
  DB.set("applications", apps);
  if (typeof syncAfterChange === "function") syncAfterChange();
}

function getApplicationCustomFields() {
  const stored = DB.get("applications_custom_fields");
  if (stored && Array.isArray(stored)) return stored;
  const seed = (typeof DEFAULT_APPLICATION_CUSTOM_FIELDS !== "undefined" && Array.isArray(DEFAULT_APPLICATION_CUSTOM_FIELDS)) ? DEFAULT_APPLICATION_CUSTOM_FIELDS : [];
  return seed;
}

function saveApplicationCustomFields(fields) {
  DB.set("applications_custom_fields", fields);
  if (typeof syncAfterChange === "function") syncAfterChange();
}

/* ── 2. Main View Builder ── */
function buildApplicationsView() {
  const container = document.getElementById("view-applications");
  if (!container) return;

  const allApps = getApplications();
  const activeApps = allApps.filter(a => !a.archived);
  const interviewCount = activeApps.filter(a => a.status === "Interview").length;
  const offerCount = activeApps.filter(a => a.status === "Offer").length;
  const appliedCount = activeApps.filter(a => a.status === "Applied" || a.status === "Screening").length;

  container.innerHTML = `
    <div class="app-tracker-container">
      <!-- Header -->
      <div class="app-header">
        <div>
          <div class="app-heading">applications.</div>
          <div class="app-subheading">Spreadsheet-like pipeline tracker for job applications, referrals, interviews &amp; offers.</div>
        </div>
        <div class="app-header-actions">
          <button type="button" class="hr-btn" onclick="openCustomFieldsManagerModal()" title="Customize columns &amp; fields">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            <span>Custom Fields</span>
          </button>

          <button type="button" class="hr-btn" onclick="exportApplicationsCSV()" title="Export applications to CSV">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span>Export CSV</span>
          </button>

          <button type="button" class="notes-btn-create" onclick="openAddApplicationModal()">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>+ Add Application</span>
          </button>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="app-stats-grid">
        <div class="app-stat-card">
          <div class="app-stat-num">${activeApps.length}</div>
          <div class="app-stat-label">Active Applications</div>
        </div>
        <div class="app-stat-card">
          <div class="app-stat-num" style="color:#7dd3fc">${appliedCount}</div>
          <div class="app-stat-label">In Review / OA</div>
        </div>
        <div class="app-stat-card">
          <div class="app-stat-num" style="color:#fdba74">${interviewCount}</div>
          <div class="app-stat-label">Interviewing</div>
        </div>
        <div class="app-stat-card">
          <div class="app-stat-num" style="color:#86efac">${offerCount}</div>
          <div class="app-stat-label">Offers Received</div>
        </div>
        <div class="app-stat-card">
          <div class="app-stat-num" style="color:var(--hard-text)">${activeApps.filter(a => a.priority === 'High').length}</div>
          <div class="app-stat-label">High Priority</div>
        </div>
      </div>

      <!-- Toolbar & Filters -->
      <div class="app-toolbar">
        <div class="app-toolbar-left">
          <div class="app-search-wrap">
            <svg class="app-search-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" class="app-search-input" id="app-search-input" placeholder="search company, role, recruiter, notes..." value="${escHtml(appSearchQuery)}" oninput="onAppSearchChange(this.value)">
          </div>

          <select class="hr-select" id="app-filter-status" onchange="onAppFilterStatusChange(this.value)">
            <option value="all" ${appFilterStatus === 'all' ? 'selected' : ''}>All Statuses</option>
            <option value="Wishlist" ${appFilterStatus === 'Wishlist' ? 'selected' : ''}>Wishlist</option>
            <option value="Applied" ${appFilterStatus === 'Applied' ? 'selected' : ''}>Applied</option>
            <option value="Screening" ${appFilterStatus === 'Screening' ? 'selected' : ''}>Screening / OA</option>
            <option value="Interview" ${appFilterStatus === 'Interview' ? 'selected' : ''}>Interview</option>
            <option value="Offer" ${appFilterStatus === 'Offer' ? 'selected' : ''}>Offer</option>
            <option value="Rejected" ${appFilterStatus === 'Rejected' ? 'selected' : ''}>Rejected</option>
          </select>

          <select class="hr-select" id="app-filter-workmode" onchange="onAppFilterWorkModeChange(this.value)">
            <option value="all" ${appFilterWorkMode === 'all' ? 'selected' : ''}>All Work Modes</option>
            <option value="Remote" ${appFilterWorkMode === 'Remote' ? 'selected' : ''}>Remote</option>
            <option value="Hybrid" ${appFilterWorkMode === 'Hybrid' ? 'selected' : ''}>Hybrid</option>
            <option value="Onsite" ${appFilterWorkMode === 'Onsite' ? 'selected' : ''}>Onsite</option>
          </select>

          <select class="hr-select" id="app-filter-priority" onchange="onAppFilterPriorityChange(this.value)">
            <option value="all" ${appFilterPriority === 'all' ? 'selected' : ''}>All Priorities</option>
            <option value="High" ${appFilterPriority === 'High' ? 'selected' : ''}>High</option>
            <option value="Medium" ${appFilterPriority === 'Medium' ? 'selected' : ''}>Medium</option>
            <option value="Low" ${appFilterPriority === 'Low' ? 'selected' : ''}>Low</option>
          </select>

          <label style="display:flex;align-items:center;gap:5px;font-size:11.5px;color:var(--mid);cursor:pointer;user-select:none">
            <input type="checkbox" id="app-filter-archived" ${appShowArchived ? 'checked' : ''} onchange="onAppShowArchivedChange(this.checked)" style="accent-color:var(--accent)">
            <span>Show Archived</span>
          </label>
        </div>

        <div class="app-toolbar-right">
          <!-- View Switcher -->
          <div class="app-view-toggle">
            <button type="button" class="app-toggle-btn ${currentAppViewMode === 'table' ? 'active' : ''}" onclick="setAppViewMode('table')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              <span>Spreadsheet</span>
            </button>
            <button type="button" class="app-toggle-btn ${currentAppViewMode === 'kanban' ? 'active' : ''}" onclick="setAppViewMode('kanban')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              <span>Kanban Board</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Render Area -->
      <div id="app-render-area"></div>
    </div>
  `;

  renderApplicationsContent();
}

function setAppViewMode(mode) {
  currentAppViewMode = mode;
  DB.set("applications_view_mode", mode);
  buildApplicationsView();
}

function onAppSearchChange(val) {
  appSearchQuery = val.toLowerCase().trim();
  renderApplicationsContent();
}

function onAppFilterStatusChange(val) {
  appFilterStatus = val;
  renderApplicationsContent();
}

function onAppFilterWorkModeChange(val) {
  appFilterWorkMode = val;
  renderApplicationsContent();
}

function onAppFilterPriorityChange(val) {
  appFilterPriority = val;
  renderApplicationsContent();
}

function onAppShowArchivedChange(val) {
  appShowArchived = val;
  renderApplicationsContent();
}

/* ── 3. Filters & Sorting Controller ── */
function getFilteredApplications() {
  let apps = getApplications();

  if (!appShowArchived) {
    apps = apps.filter(a => !a.archived);
  }

  if (appSearchQuery) {
    apps = apps.filter(a => {
      const customStr = Object.values(a.customFields || {}).join(" ");
      const fullText = (a.company + " " + a.role + " " + a.location + " " + a.recruiter + " " + a.notes + " " + a.currentStage + " " + (a.referral || "") + " " + customStr).toLowerCase();
      return fullText.includes(appSearchQuery);
    });
  }

  if (appFilterStatus !== "all") {
    apps = apps.filter(a => a.status === appFilterStatus);
  }

  if (appFilterWorkMode !== "all") {
    apps = apps.filter(a => a.workMode === appFilterWorkMode);
  }

  if (appFilterPriority !== "all") {
    apps = apps.filter(a => a.priority === appFilterPriority);
  }

  apps.sort((a, b) => {
    let valA = a[appSortCol] || "";
    let valB = b[appSortCol] || "";

    if (appSortCol.startsWith("cf_")) {
      valA = a.customFields?.[appSortCol] || "";
      valB = b.customFields?.[appSortCol] || "";
    }

    if (appSortCol === "priority") {
      const weights = { High: 3, Medium: 2, Low: 1 };
      valA = weights[valA] || 0;
      valB = weights[valB] || 0;
      return appSortDir === "asc" ? valA - valB : valB - valA;
    }

    const comp = String(valA).localeCompare(String(valB));
    return appSortDir === "asc" ? comp : -comp;
  });

  return apps;
}

function sortAppTable(col) {
  if (appSortCol === col) {
    appSortDir = appSortDir === "asc" ? "desc" : "asc";
  } else {
    appSortCol = col;
    appSortDir = "desc";
  }
  renderApplicationsContent();
}

function renderApplicationsContent() {
  const container = document.getElementById("app-render-area");
  if (!container) return;

  const apps = getFilteredApplications();

  if (!apps.length) {
    container.innerHTML = `
      <div style="padding:48px 20px;text-align:center;color:var(--muted);background:var(--bg2);border:1px dashed var(--line);border-radius:var(--radius)">
        <div style="font-size:13px;color:var(--text);margin-bottom:4px">No applications match your filter</div>
        <div style="font-size:11.5px;color:var(--muted);margin-bottom:14px">Track a new job opportunity or clear filters.</div>
        <button type="button" class="notes-btn-create" onclick="openAddApplicationModal()">+ Add Application</button>
      </div>
    `;
    return;
  }

  if (currentAppViewMode === "table") {
    renderAppSpreadsheetView(container, apps);
  } else {
    renderAppKanbanView(container, apps);
  }
}

/* ════════════════════════════════════════════════
   4. SPREADSHEET TABLE RENDERER
   ════════════════════════════════════════════════ */
function renderAppSpreadsheetView(container, apps) {
  const customFields = getApplicationCustomFields();
  const getSortIcon = (col) => {
    if (appSortCol !== col) return "";
    return appSortDir === "asc" ? "▲" : "▼";
  };

  const customThs = customFields.map(cf => `
    <th class="app-th" onclick="sortAppTable('${cf.id}')">
      ${escHtml(cf.name)} <span class="app-th-sort-icon">${getSortIcon(cf.id)}</span>
    </th>
  `).join("");

  const rowsHtml = apps.map(app => {
    const isExpanded = expandedAppId === app.id;
    const statusClass = "status-" + (app.status || "wishlist").toLowerCase();
    const prioColor = app.priority === 'High' ? 'var(--hard-text)' : (app.priority === 'Medium' ? 'var(--medium-text)' : 'var(--mid)');

    // Deadline indicator
    let deadlineHtml = "-";
    if (app.applicationDeadline) {
      const isPast = new Date(app.applicationDeadline) < new Date();
      const isNear = !isPast && (new Date(app.applicationDeadline) - new Date()) < (3 * 24 * 60 * 60 * 1000);
      const cls = isPast ? "app-deadline-warn" : (isNear ? "app-deadline-soon" : "");
      deadlineHtml = `<span class="${cls}">${app.applicationDeadline}</span>`;
    }

    const customTds = customFields.map(cf => {
      const val = app.customFields?.[cf.id] || "";
      if (cf.type === "url" && val) {
        return `<td class="app-td"><a href="${escHtml(val)}" target="_blank" onclick="event.stopPropagation()" style="color:var(--accent)">Link</a></td>`;
      }
      if (cf.type === "checkbox") {
        return `<td class="app-td">${val ? 'Yes' : '—'}</td>`;
      }
      return `<td class="app-td">${escHtml(String(val)) || '—'}</td>`;
    }).join("");

    let detailRowHtml = "";
    if (isExpanded) {
      detailRowHtml = `
        <tr class="app-detail-row">
          <td colspan="${9 + customFields.length}" style="padding:0">
            <div class="app-detail-panel">
              <!-- Col 1: Role & Contacts -->
              <div>
                <div class="app-detail-block-title">Recruiter &amp; Referral</div>
                <div class="app-detail-text" style="margin-bottom:8px">
                  ${app.recruiter ? `<strong>${escHtml(app.recruiter)}</strong>` : '<span style="color:var(--muted)">No recruiter assigned</span>'}
                  ${app.recruiterEmail ? `<div style="font-family:var(--mono);font-size:11px;color:var(--mid)"><a href="mailto:${escHtml(app.recruiterEmail)}" style="color:var(--accent)">${escHtml(app.recruiterEmail)}</a></div>` : ''}
                </div>
                <div class="app-detail-text">
                  <span style="font-family:var(--mono);color:var(--muted)">Referral: </span>
                  ${escHtml(app.referral) || 'None'}
                </div>
                ${app.jobUrl ? `<div style="margin-top:8px"><a href="${escHtml(app.jobUrl)}" target="_blank" style="color:var(--accent);font-size:11.5px;display:inline-flex;align-items:center;gap:4px">Job Posting <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a></div>` : ''}
              </div>

              <!-- Col 2: Next Action & Follow-ups -->
              <div>
                <div class="app-detail-block-title">Next Action &amp; Upcoming Dates</div>
                <div class="app-detail-text" style="margin-bottom:6px">
                  ${app.nextAction ? `<span style="color:var(--text)">${escHtml(app.nextAction)}</span>` : '<span style="color:var(--muted)">No next action set</span>'}
                </div>
                <div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-bottom:4px">
                  Target Date: ${app.nextActionDate || '—'}
                </div>
                <div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-bottom:4px">
                  Next Interview: ${app.interviewDate || '—'}
                </div>
                <div style="font-family:var(--mono);font-size:11px;color:var(--muted)">
                  Follow-up: ${app.followUpDate || '—'}
                </div>
              </div>

              <!-- Col 3: Attachments & Notes -->
              <div>
                <div class="app-detail-block-title">Attachments &amp; Files</div>
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:10px">
                  ${app.resume ? `
                    <a class="app-attachment-pill" href="${app.resume.dataUrl || '#'}" download="${escHtml(app.resume.name)}" title="Download Resume">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      <span>${escHtml(app.resume.name)}</span>
                    </a>
                  ` : '<span style="font-size:11px;color:var(--muted)">No resume attached</span>'}

                  ${app.coverLetter ? `
                    <a class="app-attachment-pill" href="${app.coverLetter.dataUrl || '#'}" download="${escHtml(app.coverLetter.name)}" title="Download Cover Letter">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                      <span>${escHtml(app.coverLetter.name)}</span>
                    </a>
                  ` : ''}
                </div>

                <div class="app-detail-block-title" style="margin-top:12px">Notes &amp; Strategy</div>
                <div class="app-detail-text" style="font-size:11.5px;color:var(--mid)">
                  ${app.notes ? escHtml(app.notes).replace(/\n/g, '<br>') : '<span style="color:var(--muted);font-style:italic">No notes recorded...</span>'}
                </div>
              </div>
            </div>

            <!-- Actions Bar -->
            <div class="app-actions-strip" style="margin:0 22px 14px">
              <button type="button" class="hr-btn" onclick="openEditApplicationModal('${app.id}')">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                <span>Edit Details</span>
              </button>
              <button type="button" class="hr-btn" onclick="toggleArchiveApplication('${app.id}')">
                <span>${app.archived ? 'Unarchive' : 'Archive'}</span>
              </button>
              <button type="button" class="hr-btn" style="color:var(--hard-text)" onclick="deleteApplicationById('${app.id}')">
                <span>Delete</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }

    return `
      <tr class="app-tr ${isExpanded ? 'expanded' : ''}" onclick="toggleAppRowExpansion('${app.id}')">
        <td class="app-td sticky-col">
          <div class="app-company-cell">
            <span>${escHtml(app.company)}</span>
          </div>
          <div class="app-role-text">${escHtml(app.role)}</div>
        </td>
        <td class="app-td">
          <span class="app-status-badge ${statusClass}">${escHtml(app.status)}</span>
        </td>
        <td class="app-td" style="color:var(--text);font-weight:500">${escHtml(app.currentStage || '—')}</td>
        <td class="app-td">
          <span class="app-workmode-pill">${escHtml(app.workMode || 'Remote')}</span>
          <span style="font-size:11px;color:var(--muted);margin-left:4px">${escHtml(app.location || '')}</span>
        </td>
        <td class="app-td" style="color:${prioColor};font-family:var(--mono);font-size:11px">${escHtml(app.priority)}</td>
        <td class="app-td" style="font-family:var(--mono);font-size:11px">${app.dateApplied || '<span style="color:var(--muted)">—</span>'}</td>
        <td class="app-td" style="font-family:var(--mono);font-size:11px">${deadlineHtml}</td>
        <td class="app-td" style="max-width:200px;overflow:hidden;text-overflow:ellipsis">
          ${app.nextAction ? escHtml(app.nextAction) : '<span style="color:var(--muted)">—</span>'}
        </td>
        ${customTds}
        <td class="app-td" style="text-align:right" onclick="event.stopPropagation()">
          <button type="button" class="sticky-action-icon" onclick="openEditApplicationModal('${app.id}')" title="Edit">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          </button>
        </td>
      </tr>
      ${detailRowHtml}
    `;
  }).join("");

  container.innerHTML = `
    <div class="app-table-wrapper">
      <table class="app-table">
        <thead>
          <tr>
            <th class="app-th sticky-col" onclick="sortAppTable('company')">
              Company &amp; Role <span class="app-th-sort-icon">${getSortIcon('company')}</span>
            </th>
            <th class="app-th" onclick="sortAppTable('status')">
              Status <span class="app-th-sort-icon">${getSortIcon('status')}</span>
            </th>
            <th class="app-th" onclick="sortAppTable('currentStage')">
              Current Stage <span class="app-th-sort-icon">${getSortIcon('currentStage')}</span>
            </th>
            <th class="app-th" onclick="sortAppTable('workMode')">
              Mode / Location <span class="app-th-sort-icon">${getSortIcon('workMode')}</span>
            </th>
            <th class="app-th" onclick="sortAppTable('priority')">
              Priority <span class="app-th-sort-icon">${getSortIcon('priority')}</span>
            </th>
            <th class="app-th" onclick="sortAppTable('dateApplied')">
              Date Applied <span class="app-th-sort-icon">${getSortIcon('dateApplied')}</span>
            </th>
            <th class="app-th" onclick="sortAppTable('applicationDeadline')">
              Deadline <span class="app-th-sort-icon">${getSortIcon('applicationDeadline')}</span>
            </th>
            <th class="app-th" onclick="sortAppTable('nextAction')">
              Next Action <span class="app-th-sort-icon">${getSortIcon('nextAction')}</span>
            </th>
            ${customThs}
            <th class="app-th" style="text-align:right">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;
}

function toggleAppRowExpansion(appId) {
  expandedAppId = expandedAppId === appId ? null : appId;
  renderApplicationsContent();
}

/* ════════════════════════════════════════════════
   5. KANBAN STAGE BOARD RENDERER
   ════════════════════════════════════════════════ */
const KANBAN_STAGES = [
  { id: "Wishlist", label: "Wishlist" },
  { id: "Applied", label: "Applied" },
  { id: "Screening", label: "Screening / OA" },
  { id: "Interview", label: "Interview Loop" },
  { id: "Offer", label: "Offers Received" },
  { id: "Rejected", label: "Closed / Archived" }
];

function renderAppKanbanView(container, apps) {
  const columnsHtml = KANBAN_STAGES.map(stage => {
    let stageApps = [];
    if (stage.id === "Rejected") {
      stageApps = apps.filter(a => a.status === "Rejected" || a.archived);
    } else {
      stageApps = apps.filter(a => a.status === stage.id && !a.archived);
    }

    const cardsHtml = stageApps.map(app => {
      const prioBadge = app.priority === 'High' ? '<span class="sticky-prio-badge sticky-prio-high">HIGH</span>' : '';

      return `
        <div class="kanban-card" id="kcard-${app.id}" data-id="${app.id}" draggable="true" onclick="openEditApplicationModal('${app.id}')">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:6px">
            <div class="kanban-card-company">${escHtml(app.company)}</div>
            ${prioBadge}
          </div>
          <div class="kanban-card-role">${escHtml(app.role)}</div>

          ${app.currentStage ? `<div class="kanban-card-stage-pill">${escHtml(app.currentStage)}</div>` : ''}

          ${app.nextAction ? `
            <div style="font-size:11px;color:var(--mid);margin-bottom:8px;line-height:1.4">
              <span style="color:var(--muted)">Next:</span> ${escHtml(app.nextAction)}
            </div>
          ` : ''}

          <div class="kanban-card-footer">
            <span class="app-workmode-pill">${escHtml(app.workMode || 'Remote')}</span>
            <span style="font-family:var(--mono);color:var(--muted);display:inline-flex;align-items:center;gap:3px">\${app.interviewDate ? '<svg width=\"9\" height=\"9\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><line x1=\"16\" y1=\"2\" x2=\"16\" y2=\"6\"></line><line x1=\"8\" y1=\"2\" x2=\"8\" y2=\"6\"></line><line x1=\"3\" y1=\"10\" x2=\"21\" y2=\"10\"></line></svg> ' + app.interviewDate.slice(5, 10) : (app.dateApplied ? app.dateApplied.slice(5) : '')}</span>
          </div>
        </div>
      `;
    }).join("");

    return `
      <div class="kanban-column" data-stage="${stage.id}">
        <div class="kanban-column-header">
          <div class="kanban-column-title">
            <span>${stage.label}</span>
            <span class="kanban-col-count">${stageApps.length}</span>
          </div>
          <button type="button" class="sticky-action-icon" onclick="openAddApplicationModalWithStatus('${stage.id}')" title="Add Application to ${stage.label}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        </div>

        <div class="kanban-column-body" data-stage="${stage.id}">
          ${cardsHtml || '<div style="font-size:11.5px;color:var(--muted);text-align:center;padding:24px 0;font-style:italic">No applications</div>'}
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = `<div class="kanban-board">${columnsHtml}</div>`;

  setupKanbanDragAndDrop();
}

function setupKanbanDragAndDrop() {
  const cards = document.querySelectorAll(".kanban-card");
  const bodies = document.querySelectorAll(".kanban-column-body");

  cards.forEach(card => {
    card.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", card.getAttribute("data-id"));
      card.classList.add("dragging");
    });
    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
    });
  });

  bodies.forEach(body => {
    body.addEventListener("dragover", (e) => {
      e.preventDefault();
      body.classList.add("drag-over");
    });
    body.addEventListener("dragleave", () => {
      body.classList.remove("drag-over");
    });
    body.addEventListener("drop", (e) => {
      e.preventDefault();
      body.classList.remove("drag-over");
      const appId = e.dataTransfer.getData("text/plain");
      const targetStage = body.getAttribute("data-stage");
      if (!appId || !targetStage) return;

      const apps = getApplications();
      const app = apps.find(a => a.id === appId);
      if (app) {
        app.status = targetStage;
        if (targetStage === "Rejected") {
          // If moved to closed column
        } else {
          app.archived = false;
        }
        app.updated = Date.now();
        saveApplications(apps);
        buildApplicationsView();
      }
    });
  });
}

/* ════════════════════════════════════════════════
   6. APPLICATION MODAL EDITOR (Add & Edit)
   ════════════════════════════════════════════════ */
function openAddApplicationModalWithStatus(status) {
  openApplicationModal(null, status);
}

function openAddApplicationModal() {
  openApplicationModal(null, "Applied");
}

function openEditApplicationModal(appId) {
  openApplicationModal(appId, null);
}

function openApplicationModal(appId, defaultStatus) {
  const apps = getApplications();
  const app = appId ? apps.find(a => a.id === appId) : null;
  const customFields = getApplicationCustomFields();

  stagedResumeFile = app?.resume || null;
  stagedCoverLetterFile = app?.coverLetter || null;

  const statusVal = app?.status || defaultStatus || "Applied";

  const customFieldsInputsHtml = customFields.map(cf => {
    const val = app?.customFields?.[cf.id] || "";
    if (cf.type === "long text") {
      return `
        <div style="grid-column:1 / -1">
          <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:3px">${escHtml(cf.name)}</label>
          <textarea class="notes-search-input cf-input" data-id="${cf.id}" style="min-height:50px">${escHtml(val)}</textarea>
        </div>
      `;
    }
    if (cf.type === "select") {
      const opts = (cf.options || "").split(",").map(o => o.trim()).filter(Boolean);
      const optHtml = opts.map(o => `<option value="${escHtml(o)}" ${val === o ? 'selected' : ''}>${escHtml(o)}</option>`).join("");
      return `
        <div>
          <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:3px">${escHtml(cf.name)}</label>
          <select class="hr-select cf-input" data-id="${cf.id}" style="width:100%">
            <option value="">Select ${escHtml(cf.name)}</option>
            ${optHtml}
          </select>
        </div>
      `;
    }
    if (cf.type === "checkbox") {
      return `
        <div style="display:flex;align-items:center;gap:6px;padding-top:16px">
          <input type="checkbox" class="cf-input" data-id="${cf.id}" ${val ? 'checked' : ''} style="accent-color:var(--accent)">
          <label style="font-size:12px;color:var(--text);cursor:pointer">${escHtml(cf.name)}</label>
        </div>
      `;
    }
    const inputType = cf.type === "date" ? "date" : (cf.type === "number" ? "number" : "text");
    return `
      <div>
        <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:3px">${escHtml(cf.name)}</label>
        <input type="${inputType}" class="notes-search-input cf-input" data-id="${cf.id}" value="${escHtml(val)}">
      </div>
    `;
  }).join("");

  const modalHtml = `
    <div class="clean-modal-overlay" id="app-editor-modal" onclick="closeAppModalOnBackdrop(event)">
      <div class="clean-modal-card" style="max-width:840px" onclick="event.stopPropagation()">
        <!-- Header -->
        <div class="clean-modal-header">
          <div style="font-family:var(--serif);font-size:18px;font-weight:400;color:var(--text)">
            ${app ? 'edit application.' : 'new application.'}
          </div>
          <button type="button" class="modal-close" onclick="closeAppModalDirect()" title="Close">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <input type="hidden" id="modal-app-id" value="${app ? app.id : ''}">

        <!-- Body -->
        <div class="clean-modal-body" style="gap:14px">
          <!-- Primary Info Grid -->
          <div style="display:grid;grid-template-columns:1.2fr 1.2fr 1fr;gap:10px">
            <div>
              <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:3px">Company *</label>
              <input type="text" class="notes-search-input" id="modal-app-company" placeholder="e.g. Stripe, Google" value="${app ? escHtml(app.company) : ''}">
            </div>
            <div>
              <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:3px">Role *</label>
              <input type="text" class="notes-search-input" id="modal-app-role" placeholder="e.g. Software Engineer II" value="${app ? escHtml(app.role) : ''}">
            </div>
            <div>
              <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:3px">Status</label>
              <select class="hr-select" id="modal-app-status" style="width:100%">
                <option value="Wishlist" ${statusVal === 'Wishlist' ? 'selected' : ''}>Wishlist</option>
                <option value="Applied" ${statusVal === 'Applied' ? 'selected' : ''}>Applied</option>
                <option value="Screening" ${statusVal === 'Screening' ? 'selected' : ''}>Screening / OA</option>
                <option value="Interview" ${statusVal === 'Interview' ? 'selected' : ''}>Interview</option>
                <option value="Offer" ${statusVal === 'Offer' ? 'selected' : ''}>Offer</option>
                <option value="Rejected" ${statusVal === 'Rejected' ? 'selected' : ''}>Rejected</option>
              </select>
            </div>
          </div>

          <!-- Secondary Grid -->
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px">
            <div>
              <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:3px">Current Stage</label>
              <input type="text" class="notes-search-input" id="modal-app-stage" placeholder="e.g. System Design Round" value="${app ? escHtml(app.currentStage) : ''}">
            </div>
            <div>
              <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:3px">Priority</label>
              <select class="hr-select" id="modal-app-prio" style="width:100%">
                <option value="High" ${app?.priority === 'High' ? 'selected' : ''}>High</option>
                <option value="Medium" ${!app || app?.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                <option value="Low" ${app?.priority === 'Low' ? 'selected' : ''}>Low</option>
              </select>
            </div>
            <div>
              <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:3px">Work Mode</label>
              <select class="hr-select" id="modal-app-workmode" style="width:100%">
                <option value="Remote" ${!app || app?.workMode === 'Remote' ? 'selected' : ''}>Remote</option>
                <option value="Hybrid" ${app?.workMode === 'Hybrid' ? 'selected' : ''}>Hybrid</option>
                <option value="Onsite" ${app?.workMode === 'Onsite' ? 'selected' : ''}>Onsite</option>
              </select>
            </div>
            <div>
              <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:3px">Location</label>
              <input type="text" class="notes-search-input" id="modal-app-location" placeholder="e.g. Seattle / Remote" value="${app ? escHtml(app.location) : ''}">
            </div>
          </div>

          <!-- Dates Grid -->
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px">
            <div>
              <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:3px">Date Applied</label>
              <input type="date" class="notes-search-input" id="modal-app-date-applied" value="${app?.dateApplied || ''}">
            </div>
            <div>
              <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:3px">Deadline</label>
              <input type="date" class="notes-search-input" id="modal-app-deadline" value="${app?.applicationDeadline || ''}">
            </div>
            <div>
              <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:3px">Interview Date/Time</label>
              <input type="text" class="notes-search-input" id="modal-app-interview-date" placeholder="YYYY-MM-DD HH:MM" value="${app?.interviewDate || ''}">
            </div>
            <div>
              <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:3px">Follow-up Date</label>
              <input type="date" class="notes-search-input" id="modal-app-followup" value="${app?.followUpDate || ''}">
            </div>
          </div>

          <!-- Contacts & Referral -->
          <div style="display:grid;grid-template-columns:1.2fr 1.2fr 1fr;gap:10px">
            <div>
              <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:3px">Job Posting URL</label>
              <input type="url" class="notes-search-input" id="modal-app-url" placeholder="https://..." value="${app ? escHtml(app.jobUrl) : ''}">
            </div>
            <div>
              <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:3px">Recruiter Name &amp; Email</label>
              <div style="display:flex;gap:6px">
                <input type="text" class="notes-search-input" id="modal-app-recruiter" placeholder="Name" value="${app ? escHtml(app.recruiter) : ''}">
                <input type="email" class="notes-search-input" id="modal-app-recruiter-email" placeholder="Email" value="${app ? escHtml(app.recruiterEmail) : ''}">
              </div>
            </div>
            <div>
              <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:3px">Referral Contact</label>
              <input type="text" class="notes-search-input" id="modal-app-referral" placeholder="Referred by..." value="${app ? escHtml(app.referral) : ''}">
            </div>
          </div>

          <!-- Next Action & Compensation/Offer Details -->
          <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:10px">
            <div>
              <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:3px">Next Action</label>
              <div style="display:flex;gap:6px">
                <input type="text" class="notes-search-input" id="modal-app-next-action" placeholder="e.g. Review STAR stories" value="${app ? escHtml(app.nextAction) : ''}">
                <input type="date" class="notes-search-input" id="modal-app-next-action-date" style="max-width:140px" value="${app?.nextActionDate || ''}">
              </div>
            </div>
            <div>
              <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:3px">Offer / Rejection Notes</label>
              <input type="text" class="notes-search-input" id="modal-app-offer-status" placeholder="e.g. $185k Base + Equity" value="${app ? escHtml(app.offerRejectionStatus) : ''}">
            </div>
          </div>

          <!-- Dynamic Custom Fields Section -->
          ${customFields.length ? `
            <div style="border-top:1px solid var(--line);padding-top:10px">
              <div style="font-family:var(--mono);font-size:10.5px;color:var(--muted);text-transform:uppercase;margin-bottom:8px">Custom Fields</div>
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:10px">
                ${customFieldsInputsHtml}
              </div>
            </div>
          ` : ''}

          <!-- Attachments Dropzones -->
          <div style="border-top:1px solid var(--line);padding-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div>
              <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:4px">Resume Attachment</label>
              <div id="resume-dropzone-view">
                ${renderAttachmentDropzone('resume', stagedResumeFile)}
              </div>
            </div>
            <div>
              <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:4px">Cover Letter Attachment</label>
              <div id="coverletter-dropzone-view">
                ${renderAttachmentDropzone('coverletter', stagedCoverLetterFile)}
              </div>
            </div>
          </div>

          <!-- Notes Textarea -->
          <div>
            <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:3px">Interview Notes &amp; Preparation</label>
            <textarea class="notes-search-input" id="modal-app-notes" style="min-height:75px;font-family:var(--sans);font-size:12px;line-height:1.5" placeholder="Key insights, interview rounds, interviewer names, feedback...">${app ? escHtml(app.notes) : ''}</textarea>
          </div>
        </div>

        <!-- Footer -->
        <div class="clean-modal-footer">
          <div>
            ${app ? `
              <button type="button" class="hr-btn" style="color:var(--hard-text)" onclick="deleteApplicationById('${app.id}');closeAppModalDirect()">Delete</button>
            ` : '<div></div>'}
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <button type="button" class="hr-btn" onclick="closeAppModalDirect()">Cancel</button>
            <button type="button" class="notes-btn-create" onclick="saveApplicationModal()">Save Application</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("app-editor-modal")?.remove();
  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

function renderAttachmentDropzone(type, fileObj) {
  if (fileObj) {
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg3);border:1px solid var(--line);border-radius:var(--radius);padding:6px 10px">
        <div style="display:flex;align-items:center;gap:6px;overflow:hidden">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          <span style="font-size:11px;color:var(--text);font-family:var(--mono);text-overflow:ellipsis;white-space:nowrap;overflow:hidden">${escHtml(fileObj.name)}</span>
        </div>
        <button type="button" class="sticky-action-icon delete" onclick="removeStagedFile('${type}')" title="Remove file">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    `;
  }

  return `
    <div class="app-dropzone" onclick="document.getElementById('file-upload-${type}').click()">
      <input type="file" id="file-upload-${type}" style="display:none" onchange="handleFileUpload('${type}', this)">
      <div class="app-dropzone-label">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
        Click to attach ${type === 'resume' ? 'Resume' : 'Cover Letter'}
      </div>
    </div>
  `;
}

function handleFileUpload(type, input) {
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const fileObj = {
      name: file.name,
      size: file.size,
      dataUrl: e.target.result,
      uploadedAt: Date.now()
    };
    if (type === "resume") {
      stagedResumeFile = fileObj;
      document.getElementById("resume-dropzone-view").innerHTML = renderAttachmentDropzone("resume", stagedResumeFile);
    } else {
      stagedCoverLetterFile = fileObj;
      document.getElementById("coverletter-dropzone-view").innerHTML = renderAttachmentDropzone("coverletter", stagedCoverLetterFile);
    }
  };
  reader.readAsDataURL(file);
}

function removeStagedFile(type) {
  if (type === "resume") {
    stagedResumeFile = null;
    document.getElementById("resume-dropzone-view").innerHTML = renderAttachmentDropzone("resume", null);
  } else {
    stagedCoverLetterFile = null;
    document.getElementById("coverletter-dropzone-view").innerHTML = renderAttachmentDropzone("coverletter", null);
  }
}

function saveApplicationModal() {
  const id = document.getElementById("modal-app-id")?.value;
  const company = document.getElementById("modal-app-company")?.value.trim();
  const role = document.getElementById("modal-app-role")?.value.trim();

  if (!company || !role) {
    showAlert("Please specify both company and role.");
    return;
  }

  const status = document.getElementById("modal-app-status")?.value || "Applied";
  const currentStage = document.getElementById("modal-app-stage")?.value.trim();
  const priority = document.getElementById("modal-app-prio")?.value || "Medium";
  const workMode = document.getElementById("modal-app-workmode")?.value || "Remote";
  const location = document.getElementById("modal-app-location")?.value.trim();
  const dateApplied = document.getElementById("modal-app-date-applied")?.value;
  const applicationDeadline = document.getElementById("modal-app-deadline")?.value;
  const interviewDate = document.getElementById("modal-app-interview-date")?.value.trim();
  const followUpDate = document.getElementById("modal-app-followup")?.value;
  const jobUrl = document.getElementById("modal-app-url")?.value.trim();
  const recruiter = document.getElementById("modal-app-recruiter")?.value.trim();
  const recruiterEmail = document.getElementById("modal-app-recruiter-email")?.value.trim();
  const referral = document.getElementById("modal-app-referral")?.value.trim();
  const nextAction = document.getElementById("modal-app-next-action")?.value.trim();
  const nextActionDate = document.getElementById("modal-app-next-action-date")?.value;
  const offerRejectionStatus = document.getElementById("modal-app-offer-status")?.value.trim();
  const notes = document.getElementById("modal-app-notes")?.value.trim();

  // Harvest custom fields
  const customFieldsMap = {};
  document.querySelectorAll(".cf-input").forEach(el => {
    const cfId = el.getAttribute("data-id");
    if (!cfId) return;
    if (el.type === "checkbox") {
      customFieldsMap[cfId] = el.checked;
    } else {
      customFieldsMap[cfId] = el.value;
    }
  });

  const apps = getApplications();

  if (id) {
    const existing = apps.find(a => a.id === id);
    if (existing) {
      existing.company = company;
      existing.role = role;
      existing.status = status;
      existing.currentStage = currentStage;
      existing.priority = priority;
      existing.workMode = workMode;
      existing.location = location;
      existing.dateApplied = dateApplied;
      existing.applicationDeadline = applicationDeadline;
      existing.interviewDate = interviewDate;
      existing.followUpDate = followUpDate;
      existing.jobUrl = jobUrl;
      existing.recruiter = recruiter;
      existing.recruiterEmail = recruiterEmail;
      existing.referral = referral;
      existing.nextAction = nextAction;
      existing.nextActionDate = nextActionDate;
      existing.offerRejectionStatus = offerRejectionStatus;
      existing.notes = notes;
      existing.resume = stagedResumeFile;
      existing.coverLetter = stagedCoverLetterFile;
      existing.customFields = customFieldsMap;
      existing.updated = Date.now();
    }
  } else {
    apps.unshift({
      id: "app-" + Date.now().toString().slice(-6),
      company: company,
      role: role,
      status: status,
      currentStage: currentStage,
      priority: priority,
      workMode: workMode,
      location: location,
      dateFound: new Date().toISOString().slice(0, 10),
      dateApplied: dateApplied,
      applicationDeadline: applicationDeadline,
      interviewDate: interviewDate,
      followUpDate: followUpDate,
      jobUrl: jobUrl,
      recruiter: recruiter,
      recruiterEmail: recruiterEmail,
      referral: referral,
      nextAction: nextAction,
      nextActionDate: nextActionDate,
      offerRejectionStatus: offerRejectionStatus,
      notes: notes,
      resume: stagedResumeFile,
      coverLetter: stagedCoverLetterFile,
      customFields: customFieldsMap,
      archived: false,
      created: Date.now(),
      updated: Date.now()
    });
  }

  saveApplications(apps);
  closeAppModalDirect();
  buildApplicationsView();
}

function toggleArchiveApplication(appId) {
  const apps = getApplications();
  const a = apps.find(item => item.id === appId);
  if (!a) return;
  a.archived = !a.archived;
  a.updated = Date.now();
  saveApplications(apps);
  buildApplicationsView();
}

function deleteApplicationById(appId) {
  showConfirm("Delete this application permanently?", () => {
    let apps = getApplications();
    apps = apps.filter(a => a.id !== appId);
    saveApplications(apps);
    buildApplicationsView();
  });
}

function closeAppModalOnBackdrop(e) {
  if (e.target.id === "app-editor-modal") closeAppModalDirect();
}

function closeAppModalDirect() {
  document.getElementById("app-editor-modal")?.remove();
  stagedResumeFile = null;
  stagedCoverLetterFile = null;
}

/* ════════════════════════════════════════════════
   7. CUSTOM FIELDS MANAGER MODAL
   ════════════════════════════════════════════════ */
function openCustomFieldsManagerModal() {
  const fields = getApplicationCustomFields();

  const fieldsListHtml = fields.map((f, idx) => `
    <div class="cf-manager-row">
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:12px;font-weight:500;color:var(--text)">${escHtml(f.name)}</span>
        <span class="cf-type-pill">${escHtml(f.type)}</span>
        ${f.options ? `<span style="font-size:10px;color:var(--muted);font-family:var(--mono)">(${escHtml(f.options)})</span>` : ''}
      </div>
      <div style="display:flex;align-items:center;gap:4px">
        <button type="button" class="cf-reorder-btn" onclick="moveCustomField('${f.id}', -1)" title="Move Up" ${idx === 0 ? 'disabled style="opacity:0.3"' : ''}>▲</button>
        <button type="button" class="cf-reorder-btn" onclick="moveCustomField('${f.id}', 1)" title="Move Down" ${idx === fields.length - 1 ? 'disabled style="opacity:0.3"' : ''}>▼</button>
        <button type="button" class="sticky-action-icon delete" onclick="deleteCustomFieldById('${f.id}')" title="Delete Field">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    </div>
  `).join("");

  const modalHtml = `
    <div class="clean-modal-overlay" id="cf-manager-modal" onclick="closeCfModalOnBackdrop(event)">
      <div class="clean-modal-card" style="max-width:580px" onclick="event.stopPropagation()">
        <div class="clean-modal-header">
          <div style="font-family:var(--serif);font-size:18px;font-weight:400;color:var(--text)">
            custom application fields.
          </div>
          <button type="button" class="modal-close" onclick="closeCfModalDirect()" title="Close">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="clean-modal-body" style="gap:16px">
          <!-- Active Fields List -->
          <div>
            <div style="font-family:var(--mono);font-size:10.5px;color:var(--muted);text-transform:uppercase;margin-bottom:8px">Active Custom Columns (${fields.length})</div>
            <div style="display:flex;flex-direction:column;gap:6px">
              ${fieldsListHtml || '<div style="font-size:12px;color:var(--muted);font-style:italic">No custom fields configured yet</div>'}
            </div>
          </div>

          <!-- Add New Field Form -->
          <div style="border-top:1px solid var(--line);padding-top:12px">
            <div style="font-family:var(--mono);font-size:10.5px;color:var(--muted);text-transform:uppercase;margin-bottom:8px">Add New Field</div>
            <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:8px;margin-bottom:8px">
              <div>
                <label style="font-size:10.5px;color:var(--muted);display:block;margin-bottom:2px">Field Label</label>
                <input type="text" class="notes-search-input" id="new-cf-name" placeholder="e.g. Visa Sponsorship Required">
              </div>
              <div>
                <label style="font-size:10.5px;color:var(--muted);display:block;margin-bottom:2px">Field Type</label>
                <select class="hr-select" id="new-cf-type" style="width:100%" onchange="document.getElementById('new-cf-options-wrap').style.display = this.value === 'select' ? 'block' : 'none'">
                  <option value="text">Text</option>
                  <option value="long text">Long Text</option>
                  <option value="date">Date</option>
                  <option value="number">Number</option>
                  <option value="select">Select (Dropdown)</option>
                  <option value="checkbox">Checkbox (Yes/No)</option>
                  <option value="url">URL</option>
                </select>
              </div>
            </div>

            <div id="new-cf-options-wrap" style="display:none;margin-bottom:8px">
              <label style="font-size:10.5px;color:var(--muted);display:block;margin-bottom:2px">Dropdown Options (Comma separated)</label>
              <input type="text" class="notes-search-input" id="new-cf-options" placeholder="Option 1, Option 2, Option 3">
            </div>

            <button type="button" class="notes-btn-create" style="margin-top:4px" onclick="addNewCustomField()">+ Add Column</button>
          </div>
        </div>

        <div class="clean-modal-footer">
          <div></div>
          <button type="button" class="hr-btn" onclick="closeCfModalDirect()">Done</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("cf-manager-modal")?.remove();
  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

function addNewCustomField() {
  const name = document.getElementById("new-cf-name")?.value.trim();
  const type = document.getElementById("new-cf-type")?.value || "text";
  const options = document.getElementById("new-cf-options")?.value.trim() || "";

  if (!name) {
    showAlert("Please enter a field label.");
    return;
  }

  const fields = getApplicationCustomFields();
  const id = "cf_" + name.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Date.now().toString().slice(-4);

  fields.push({
    id: id,
    name: name,
    type: type,
    options: options,
    order: fields.length
  });

  saveApplicationCustomFields(fields);
  openCustomFieldsManagerModal();
  buildApplicationsView();
}

function moveCustomField(fieldId, direction) {
  const fields = getApplicationCustomFields();
  const idx = fields.findIndex(f => f.id === fieldId);
  if (idx === -1) return;

  const targetIdx = idx + direction;
  if (targetIdx < 0 || targetIdx >= fields.length) return;

  const [moved] = fields.splice(idx, 1);
  fields.splice(targetIdx, 0, moved);
  fields.forEach((f, i) => f.order = i);

  saveApplicationCustomFields(fields);
  openCustomFieldsManagerModal();
  buildApplicationsView();
}

function deleteCustomFieldById(fieldId) {
  showConfirm("Remove this custom field? Existing data in this column will be hidden.", () => {
    let fields = getApplicationCustomFields();
    fields = fields.filter(f => f.id !== fieldId);
    saveApplicationCustomFields(fields);
    openCustomFieldsManagerModal();
    buildApplicationsView();
  });
}

function closeCfModalOnBackdrop(e) {
  if (e.target.id === "cf-manager-modal") closeCfModalDirect();
}

function closeCfModalDirect() {
  document.getElementById("cf-manager-modal")?.remove();
}

/* ════════════════════════════════════════════════
   8. CSV EXPORT
   ════════════════════════════════════════════════ */
function exportApplicationsCSV() {
  const apps = getApplications();
  const customFields = getApplicationCustomFields();

  const headers = [
    "Company",
    "Role",
    "Status",
    "Current Stage",
    "Work Mode",
    "Location",
    "Priority",
    "Date Applied",
    "Deadline",
    "Interview Date",
    "Next Action",
    "Recruiter",
    "Recruiter Email",
    "Referral",
    "Job URL",
    "Offer / Rejection",
    ...customFields.map(cf => cf.name)
  ];

  const rows = apps.map(a => {
    const customVals = customFields.map(cf => a.customFields?.[cf.id] || "");
    return [
      a.company || "",
      a.role || "",
      a.status || "",
      a.currentStage || "",
      a.workMode || "",
      a.location || "",
      a.priority || "",
      a.dateApplied || "",
      a.applicationDeadline || "",
      a.interviewDate || "",
      a.nextAction || "",
      a.recruiter || "",
      a.recruiterEmail || "",
      a.referral || "",
      a.jobUrl || "",
      a.offerRejectionStatus || "",
      ...customVals
    ].map(v => '"' + String(v).replace(/"/g, '""') + '"').join(",");
  });

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "job_applications_orbit_" + new Date().toISOString().slice(0, 10) + ".csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
}
