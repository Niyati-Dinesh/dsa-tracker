/* ================================================================
   LIGHTWEIGHT RESEARCH TRACKER ENGINE (Spreadsheet Interface)
   ================================================================ */

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

let resSortCol = "dateAdded";
let resSortDir = "desc";
let expandedResId = null;

function getResearchPapers() {
  const stored = DB.get("research_papers");
  if (stored && Array.isArray(stored)) return stored;
  const seed = (typeof RESEARCH_DATA !== "undefined" && Array.isArray(RESEARCH_DATA)) ? RESEARCH_DATA : [];
  return seed;
}

function buildResearchView() {
  const container = document.getElementById("view-research");
  if (!container) return;

  const papers = getResearchPapers();
  const areas = ["all", ...new Set(papers.map(p => p.area).filter(Boolean))];
  const areaOptions = areas.map(a => `<option value="${escHtml(a)}">${escHtml(a === 'all' ? 'All Research Areas' : a)}</option>`).join("");

  const activePapers = papers.filter(p => !p.archived);
  const readCount = papers.filter(p => p.status === "Read" || p.status === "Summarized" || p.status === "Implemented").length;

  container.innerHTML = `
    <div class="res-container">
      <!-- Header -->
      <div class="res-header">
        <div>
          <div class="res-title">research tracker</div>
          <div class="res-subtitle">A lightweight, spreadsheet-like database for literature review, methodology analysis, and research gaps.</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="hr-btn" onclick="exportResearchJSON()" title="Export Research JSON">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span>Export</span>
          </button>
          <button class="hr-btn hr-btn-primary" onclick="openAddResearchModal()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Add Research Paper</span>
          </button>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="hr-stats-grid">
        <div class="hr-stat-card">
          <div class="hr-stat-num">${papers.length}</div>
          <div class="hr-stat-label">Total Tracked</div>
        </div>
        <div class="hr-stat-card">
          <div class="hr-stat-num" style="color:#4ade80">${readCount}</div>
          <div class="hr-stat-label">Read / Synthesized</div>
        </div>
        <div class="hr-stat-card">
          <div class="hr-stat-num" style="color:#38bdf8">${activePapers.filter(p => p.status === 'Reading').length}</div>
          <div class="hr-stat-label">Currently Reading</div>
        </div>
        <div class="hr-stat-card">
          <div class="hr-stat-num" style="color:#f87171">${activePapers.filter(p => p.priority === 'High').length}</div>
          <div class="hr-stat-label">High Priority</div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="res-toolbar">
        <div class="res-toolbar-left">
          <input type="text" class="hr-search-input" id="res-search" placeholder="Search title, authors, findings, methodology, tags..." oninput="filterResearchTable()">
          <select class="hr-select" id="res-area-filter" onchange="filterResearchTable()">
            ${areaOptions}
          </select>
          <select class="hr-select" id="res-status-filter" onchange="filterResearchTable()">
            <option value="all">All Statuses</option>
            <option value="To Read">To Read</option>
            <option value="Reading">Reading</option>
            <option value="Read">Read</option>
            <option value="Summarized">Summarized</option>
            <option value="Implemented">Implemented</option>
          </select>
          <select class="hr-select" id="res-prio-filter" onchange="filterResearchTable()">
            <option value="all">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <label style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--mid);cursor:pointer;user-select:none">
            <input type="checkbox" id="res-show-archived" onchange="filterResearchTable()"> Show Archived
          </label>
        </div>
      </div>

      <!-- Table Container -->
      <div class="res-table-wrapper">
        <table class="res-table">
          <thead>
            <tr>
              <th style="width:30px"></th>
              <th onclick="sortResearch('title')">Title &amp; Authors</th>
              <th onclick="sortResearch('area')">Area</th>
              <th onclick="sortResearch('type')">Type</th>
              <th onclick="sortResearch('status')">Status</th>
              <th onclick="sortResearch('priority')">Priority</th>
              <th>Source / Link</th>
              <th style="text-align:right">Actions</th>
            </tr>
          </thead>
          <tbody id="res-table-body"></tbody>
        </table>
      </div>
    </div>
  `;

  renderResearchTableRows();
}

function renderResearchTableRows() {
  const tbody = document.getElementById("res-table-body");
  if (!tbody) return;

  const query = (document.getElementById("res-search")?.value || "").toLowerCase().trim();
  const areaFilter = document.getElementById("res-area-filter")?.value || "all";
  const statusFilter = document.getElementById("res-status-filter")?.value || "all";
  const prioFilter = document.getElementById("res-prio-filter")?.value || "all";
  const showArchived = document.getElementById("res-show-archived")?.checked || false;

  let papers = getResearchPapers();

  papers = papers.filter(p => {
    if (!showArchived && p.archived) return false;
    const text = (
      (p.title || "") + " " +
      (p.authors || "") + " " +
      (p.area || "") + " " +
      (p.methodology || "") + " " +
      (p.model || "") + " " +
      (p.key_findings || "") + " " +
      (p.research_gap || "") + " " +
      (p.tags || []).join(" ")
    ).toLowerCase();

    const matchesQuery = !query || text.includes(query);
    const matchesArea = (areaFilter === "all") || (p.area === areaFilter);
    const matchesStatus = (statusFilter === "all") || (p.status === statusFilter);
    const matchesPrio = (prioFilter === "all") || (p.priority === prioFilter);

    return matchesQuery && matchesArea && matchesStatus && matchesPrio;
  });

  papers.sort((a, b) => {
    let valA = a[resSortCol] || "";
    let valB = b[resSortCol] || "";
    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();

    if (valA < valB) return resSortDir === "asc" ? -1 : 1;
    if (valA > valB) return resSortDir === "asc" ? 1 : -1;
    return 0;
  });

  if (!papers.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="padding:36px;text-align:center;color:var(--muted)">No research entries found matching criteria.</td></tr>`;
    return;
  }

  let html = "";
  papers.forEach(p => {
    const isExpanded = expandedResId === p.id;
    const statusClass = `res-status-${(p.status || 'To Read').replace(/\s+/g, '-')}`;
    const prioClass = `res-prio-${p.priority || 'Medium'}`;

    html += `
      <tr class="${p.archived ? 'archived' : ''}">
        <td>
          <button class="hr-btn" style="padding:2px 5px;font-size:10px" onclick="toggleResDrawer('${p.id}')" title="Expand Details">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform:${isExpanded ? 'rotate(90deg)' : 'none'};transition:transform 0.15s"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </td>
        <td>
          <div style="font-weight:500;color:var(--text);cursor:pointer" onclick="toggleResDrawer('${p.id}')">${escHtml(p.title)}</div>
          <div style="font-size:11.5px;color:var(--muted);margin-top:2px">${escHtml(p.authors || "Unknown Authors")}</div>
        </td>
        <td><span class="hr-pill">${escHtml(p.area || "General")}</span></td>
        <td><span style="font-family:var(--mono);font-size:11px;color:var(--mid)">${escHtml(p.type || "Paper")}</span></td>
        <td>
          <span class="res-badge ${statusClass}">${escHtml(p.status || "To Read")}</span>
        </td>
        <td>
          <span class="${prioClass}">${escHtml(p.priority || "Medium")}</span>
        </td>
        <td>
          ${p.url ? `
            <a href="${escHtml(p.url)}" target="_blank" rel="noopener noreferrer" style="color:var(--res-cyan);text-decoration:none;font-size:11.5px;display:inline-flex;align-items:center;gap:4px">
              <span>${escHtml(p.source || "Link")}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
          ` : `<span style="color:var(--muted);font-size:11px">${escHtml(p.source || "—")}</span>`}
        </td>
        <td style="text-align:right">
          <div style="display:inline-flex;align-items:center;gap:5px">
            <button class="hr-btn" style="padding:3px 7px;font-size:11px" onclick="editResearchEntry('${p.id}')" title="Edit">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </button>
            <button class="hr-btn" style="padding:3px 7px;font-size:11px;color:${p.archived ? 'var(--res-cyan)' : 'var(--muted)'}" onclick="toggleArchiveResearch('${p.id}')" title="${p.archived ? 'Unarchive' : 'Archive'}">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>
            </button>
            <button class="hr-btn" style="padding:3px 7px;font-size:11px;color:#f87171" onclick="deleteResearchEntry('${p.id}')" title="Delete">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </td>
      </tr>
    `;

    if (isExpanded) {
      const customPairs = Object.entries(p.custom_fields || {}).map(([k, v]) => `
        <div class="res-drawer-block">
          <div class="res-drawer-label">${escHtml(k)}</div>
          <div class="res-drawer-text">${escHtml(v)}</div>
        </div>
      `).join("");

      html += `
        <tr>
          <td colspan="8" style="padding:0">
            <div class="res-drawer">
              <div class="res-drawer-grid">
                <div class="res-drawer-block">
                  <div class="res-drawer-label">Methodology &amp; Architecture</div>
                  <div class="res-drawer-text">${escHtml(p.methodology || "—")}</div>
                  ${p.model ? `<div style="margin-top:6px;font-size:11.5px;color:var(--mid)"><strong>Model:</strong> ${escHtml(p.model)}</div>` : ''}
                  ${p.dataset ? `<div style="margin-top:2px;font-size:11.5px;color:var(--mid)"><strong>Dataset:</strong> ${escHtml(p.dataset)}</div>` : ''}
                </div>

                <div class="res-drawer-block">
                  <div class="res-drawer-label">Key Findings &amp; Contributions</div>
                  <div class="res-drawer-text">${escHtml(p.key_findings || "—")}</div>
                </div>

                <div class="res-drawer-block">
                  <div class="res-drawer-label">Limitations &amp; Research Gap</div>
                  <div class="res-drawer-text">${escHtml(p.limitations || "—")}</div>
                  ${p.research_gap ? `<div style="margin-top:8px;padding-top:8px;border-top:1px dashed var(--line);font-size:12px;color:var(--star-gold)"><strong>Gap:</strong> ${escHtml(p.research_gap)}</div>` : ''}
                </div>

                <div class="res-drawer-block">
                  <div class="res-drawer-label">Ideas &amp; Notes</div>
                  <div class="res-drawer-text">${escHtml(p.useful_notes || p.ideas || "—")}</div>
                  ${p.recommendations ? `<div style="margin-top:6px;font-size:11.5px;color:var(--mid)"><strong>Rec:</strong> ${escHtml(p.recommendations)}</div>` : ''}
                </div>

                ${customPairs}
              </div>

              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:12px">
                ${(p.tags || []).map(t => `<span class="hr-pill" style="color:var(--res-cyan);border-color:var(--res-cyan-border)">#${escHtml(t)}</span>`).join("")}
              </div>
            </div>
          </td>
        </tr>
      `;
    }
  });

  tbody.innerHTML = html;
}

function filterResearchTable() {
  renderResearchTableRows();
}

function sortResearch(col) {
  if (resSortCol === col) {
    resSortDir = (resSortDir === "asc") ? "desc" : "asc";
  } else {
    resSortCol = col;
    resSortDir = "asc";
  }
  renderResearchTableRows();
}

function toggleResDrawer(id) {
  expandedResId = (expandedResId === id) ? null : id;
  renderResearchTableRows();
}

function toggleArchiveResearch(id) {
  const papers = getResearchPapers();
  const p = papers.find(item => item.id === id);
  if (!p) return;
  p.archived = !p.archived;
  DB.set("research_papers", papers);
  if (typeof syncAfterChange === "function") syncAfterChange();
  renderResearchTableRows();
}

function deleteResearchEntry(id) {
  showConfirm("Are you sure you want to delete this research paper entry?", () => {
    let papers = getResearchPapers();
    papers = papers.filter(p => p.id !== id);
    DB.set("research_papers", papers);
    if (typeof syncAfterChange === "function") syncAfterChange();
    renderResearchTableRows();
  });
}

function openAddResearchModal(editingPaper = null) {
  const modalHtml = `
    <div class="apt-modal-overlay" id="res-modal" onclick="closeHRModal(event, 'res-modal')">
      <div class="apt-modal-card" style="max-width:700px" onclick="event.stopPropagation()">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <div style="font-family:var(--serif);font-size:22px;font-weight:400;color:var(--text)">${editingPaper ? 'Edit Research Paper' : 'Add Research Paper'}</div>
          <button class="modal-close" onclick="closeHRModalDirect('res-modal')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <input type="hidden" id="res-input-id" value="${editingPaper ? editingPaper.id : ''}">

        <div style="display:flex;flex-direction:column;gap:12px;max-height:70vh;overflow-y:auto;padding-right:4px">
          <div>
            <label class="modal-section-label">Paper Title</label>
            <input type="text" class="hr-search-input" id="res-input-title" style="width:100%" placeholder="e.g. Attention Is All You Need" value="${editingPaper ? escHtml(editingPaper.title || '') : ''}">
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div>
              <label class="modal-section-label">Research Area</label>
              <input type="text" class="hr-search-input" id="res-input-area" style="width:100%" placeholder="e.g. Distributed Systems, NLP, Vision" value="${editingPaper ? escHtml(editingPaper.area || '') : ''}">
            </div>
            <div>
              <label class="modal-section-label">Entry Type</label>
              <select class="hr-select" id="res-input-type" style="width:100%">
                <option value="Paper" ${!editingPaper || editingPaper.type === 'Paper' ? 'selected' : ''}>Conference / Journal Paper</option>
                <option value="Survey" ${editingPaper && editingPaper.type === 'Survey' ? 'selected' : ''}>Survey / Literature Review</option>
                <option value="Tech Report" ${editingPaper && editingPaper.type === 'Tech Report' ? 'selected' : ''}>Technical Report / Whitepaper</option>
                <option value="Benchmark" ${editingPaper && editingPaper.type === 'Benchmark' ? 'selected' : ''}>Benchmark / Dataset Paper</option>
                <option value="Thesis" ${editingPaper && editingPaper.type === 'Thesis' ? 'selected' : ''}>Thesis / Book</option>
              </select>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div>
              <label class="modal-section-label">Authors</label>
              <input type="text" class="hr-search-input" id="res-input-authors" style="width:100%" placeholder="e.g. Vaswani et al." value="${editingPaper ? escHtml(editingPaper.authors || '') : ''}">
            </div>
            <div>
              <label class="modal-section-label">Publication Source / Venue</label>
              <input type="text" class="hr-search-input" id="res-input-source" style="width:100%" placeholder="e.g. NeurIPS 2017, OSDI, arXiv" value="${editingPaper ? escHtml(editingPaper.source || '') : ''}">
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div>
              <label class="modal-section-label">Reading Status</label>
              <select class="hr-select" id="res-input-status" style="width:100%">
                <option value="To Read" ${!editingPaper || editingPaper.status === 'To Read' ? 'selected' : ''}>To Read</option>
                <option value="Reading" ${editingPaper && editingPaper.status === 'Reading' ? 'selected' : ''}>Reading</option>
                <option value="Read" ${editingPaper && editingPaper.status === 'Read' ? 'selected' : ''}>Read</option>
                <option value="Summarized" ${editingPaper && editingPaper.status === 'Summarized' ? 'selected' : ''}>Summarized</option>
                <option value="Implemented" ${editingPaper && editingPaper.status === 'Implemented' ? 'selected' : ''}>Implemented</option>
              </select>
            </div>
            <div>
              <label class="modal-section-label">Priority</label>
              <select class="hr-select" id="res-input-prio" style="width:100%">
                <option value="High" ${editingPaper && editingPaper.priority === 'High' ? 'selected' : ''}>High</option>
                <option value="Medium" ${!editingPaper || editingPaper.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                <option value="Low" ${editingPaper && editingPaper.priority === 'Low' ? 'selected' : ''}>Low</option>
              </select>
            </div>
          </div>

          <div>
            <label class="modal-section-label">Paper URL / PDF Link</label>
            <input type="text" class="hr-search-input" id="res-input-url" style="width:100%" placeholder="https://arxiv.org/abs/..." value="${editingPaper ? escHtml(editingPaper.url || '') : ''}">
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div>
              <label class="modal-section-label">Dataset Used</label>
              <input type="text" class="hr-search-input" id="res-input-dataset" style="width:100%" placeholder="e.g. ImageNet, WMT 2014" value="${editingPaper ? escHtml(editingPaper.dataset || '') : ''}">
            </div>
            <div>
              <label class="modal-section-label">Model / System Architecture</label>
              <input type="text" class="hr-search-input" id="res-input-model" style="width:100%" placeholder="e.g. Transformer, Paxos Engine" value="${editingPaper ? escHtml(editingPaper.model || '') : ''}">
            </div>
          </div>

          <div>
            <label class="modal-section-label">Methodology Summary</label>
            <textarea class="hr-answer-textarea" id="res-input-method" style="min-height:65px" placeholder="How does their proposed approach work?">${editingPaper ? escHtml(editingPaper.methodology || '') : ''}</textarea>
          </div>

          <div>
            <label class="modal-section-label">Key Findings &amp; Quantitative Results</label>
            <textarea class="hr-answer-textarea" id="res-input-findings" style="min-height:65px" placeholder="What did they prove or benchmark?">${editingPaper ? escHtml(editingPaper.key_findings || '') : ''}</textarea>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div>
              <label class="modal-section-label">Limitations</label>
              <textarea class="hr-answer-textarea" id="res-input-limits" style="min-height:65px" placeholder="Flaws, assumptions, computational bottlenecks...">${editingPaper ? escHtml(editingPaper.limitations || '') : ''}</textarea>
            </div>
            <div>
              <label class="modal-section-label">Research Gap</label>
              <textarea class="hr-answer-textarea" id="res-input-gap" style="min-height:65px" placeholder="What question remains open for future work?">${editingPaper ? escHtml(editingPaper.research_gap || '') : ''}</textarea>
            </div>
          </div>

          <div>
            <label class="modal-section-label">Personal Notes, Ideas &amp; Recommendations</label>
            <textarea class="hr-answer-textarea" id="res-input-notes" style="min-height:65px" placeholder="Synthesis, potential side projects, or interview insights...">${editingPaper ? escHtml(editingPaper.useful_notes || '') : ''}</textarea>
          </div>

          <div>
            <label class="modal-section-label">Tags (comma-separated)</label>
            <input type="text" class="hr-search-input" id="res-input-tags" style="width:100%" placeholder="llm, attention, distributed-systems" value="${editingPaper && editingPaper.tags ? escHtml(editingPaper.tags.join(', ')) : ''}">
          </div>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:18px;border-top:1px solid var(--line);padding-top:14px">
          <button class="hr-btn" onclick="closeHRModalDirect('res-modal')">Cancel</button>
          <button class="hr-btn hr-btn-primary" onclick="saveResearchModal()">Save Paper</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("res-modal")?.remove();
  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

function saveResearchModal() {
  const id = document.getElementById("res-input-id")?.value;
  const title = document.getElementById("res-input-title")?.value.trim();
  const area = document.getElementById("res-input-area")?.value.trim() || "General";
  const type = document.getElementById("res-input-type")?.value || "Paper";
  const authors = document.getElementById("res-input-authors")?.value.trim();
  const source = document.getElementById("res-input-source")?.value.trim();
  const status = document.getElementById("res-input-status")?.value || "To Read";
  const priority = document.getElementById("res-input-prio")?.value || "Medium";
  const url = document.getElementById("res-input-url")?.value.trim();
  const dataset = document.getElementById("res-input-dataset")?.value.trim();
  const model = document.getElementById("res-input-model")?.value.trim();
  const methodology = document.getElementById("res-input-method")?.value.trim();
  const findings = document.getElementById("res-input-findings")?.value.trim();
  const limits = document.getElementById("res-input-limits")?.value.trim();
  const gap = document.getElementById("res-input-gap")?.value.trim();
  const notes = document.getElementById("res-input-notes")?.value.trim();
  const tagsStr = document.getElementById("res-input-tags")?.value.trim() || "";

  if (!title) {
    showAlert("Please provide a paper title.");
    return;
  }

  const papers = getResearchPapers();
  const tags = tagsStr ? tagsStr.split(",").map(t => t.trim().toLowerCase()).filter(Boolean) : [];

  if (id) {
    const existing = papers.find(p => p.id === id);
    if (existing) {
      existing.title = title;
      existing.area = area;
      existing.type = type;
      existing.authors = authors;
      existing.source = source;
      existing.status = status;
      existing.priority = priority;
      existing.url = url;
      existing.dataset = dataset;
      existing.model = model;
      existing.methodology = methodology;
      existing.key_findings = findings;
      existing.limitations = limits;
      existing.research_gap = gap;
      existing.useful_notes = notes;
      existing.tags = tags;
    }
  } else {
    papers.unshift({
      id: `RES-${Date.now().toString().slice(-4)}`,
      title,
      area,
      type,
      authors,
      source,
      status,
      priority,
      url,
      dataset,
      model,
      methodology,
      key_findings: findings,
      limitations: limits,
      research_gap: gap,
      useful_notes: notes,
      tags,
      archived: false,
      dateAdded: Date.now()
    });
  }

  DB.set("research_papers", papers);
  if (typeof syncAfterChange === "function") syncAfterChange();
  closeHRModalDirect("res-modal");
  renderResearchTableRows();
}

function editResearchEntry(id) {
  const papers = getResearchPapers();
  const p = papers.find(item => item.id === id);
  if (p) openAddResearchModal(p);
}

function exportResearchJSON() {
  const papers = getResearchPapers();
  const blob = new Blob([JSON.stringify(papers, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `research_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
}
