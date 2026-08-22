/* ================================================================
   ORBIT GENERAL NOTES & STICKY BOARD ENGINE
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

let currentNotesViewMode = DB.get("notes_view_mode") || "board"; // "board" or "list"
let currentNotesFilterTag = "all";
let currentNotesFilterPrio = "all";
let currentNotesFilterReminder = "all";
let currentNotesGrouping = "none";
let currentNotesSearch = "";

let activeQuillInstance = null;

/* ── Clean Plaintext & Metadata Extractor for Cards ── */
function extractNoteSummary(content) {
  if (!content || !content.trim()) return { text: "", hasCode: false, hasLinks: false };

  const hasCode = content.includes("<pre") || content.includes("class='ql-syntax'") || content.includes("class=\"ql-syntax\"");
  const hasLinks = content.includes("<a ") || content.includes("http://") || content.includes("https://");

  // Strip all HTML tags, HTML entities, and markdown formatting for a clean textual preview
  let text = content
    .replace(/<pre[\s\S]*?<\/pre>/gi, " [code] ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/#/g, " ")
    .replace(/\*/g, " ")
    .replace(/>/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    text: text.slice(0, 140),
    hasCode: hasCode,
    hasLinks: hasLinks
  };
}

/* ── 1. Data Normalization ── */
function getNormalizedGlobalNotes() {
  const raw = DB.get("global_notes") || [];
  let updated = false;

  const notes = raw.map((note, idx) => {
    const id = note.id || ("note-" + (note.created || Date.now()) + "-" + idx);
    let content = note.content || "";

    if (!note._migrated && (note.code || note.links?.length || note.images?.length)) {
      let extraHtml = "";
      if (note.code) {
        extraHtml += "<pre class='ql-syntax' spellcheck='false'>" + escHtml(note.code) + "</pre>";
      }
      if (note.links?.length) {
        extraHtml += "<p><strong>Links:</strong></p><ul>" + note.links.map(l => "<li><a href='" + escHtml(l.url) + "' target='_blank'>" + escHtml(l.label || l.url) + "</a></li>").join("") + "</ul>";
      }
      if (note.images?.length) {
        extraHtml += "<p>" + note.images.map(img => "<img src='" + img.dataUrl + "' alt='" + escHtml(img.name) + "' style='max-width:100%;border-radius:4px;margin:4px 0;' />").join("") + "</p>";
      }
      content = (content ? "<p>" + escHtml(content).replace(/\n/g, "<br>") + "</p>" : "") + extraHtml;
      note._migrated = true;
      updated = true;
    }

    return {
      id: id,
      title: note.title || "",
      content: content,
      tags: Array.isArray(note.tags) ? note.tags : [],
      priority: note.priority || "none",
      pinned: !!note.pinned,
      color: note.color || "default",
      order: note.order !== undefined ? note.order : idx,
      reminder: note.reminder || null,
      created: note.created || Date.now(),
      updated: note.updated || note.created || Date.now(),
      _migrated: true
    };
  });

  if (updated) {
    DB.set("global_notes", notes);
  }

  return notes;
}

function saveNormalizedGlobalNotes(notes) {
  DB.set("global_notes", notes);
  if (typeof syncAfterChange === "function") syncAfterChange();
}

/* ── 2. Build Notes View ── */
function buildNotes() {
  const container = document.getElementById("view-notes");
  if (!container) return;

  const allNotes = getNormalizedGlobalNotes();
  const allTags = ["all", ...new Set(allNotes.flatMap(n => n.tags || []).filter(Boolean))];
  const tagOptions = allTags.map(t => "<option value='" + escHtml(t) + "'" + (currentNotesFilterTag === t ? " selected" : "") + ">" + escHtml(t === 'all' ? 'All Tags' : ('#' + t)) + "</option>").join("");

  container.innerHTML = `
    <div class="notes-container">
      <!-- Top Bar -->
      <div class="notes-top-bar">
        <div class="notes-header-left">
          <div class="notes-heading">notes</div>
          <span class="notes-count-pill">${allNotes.length} ${allNotes.length === 1 ? 'note' : 'notes'}</span>
        </div>

        <div class="notes-actions-right">
          <!-- View Switcher -->
          <div class="notes-view-toggle">
            <button type="button" class="notes-toggle-btn ${currentNotesViewMode === 'board' ? 'active' : ''}" onclick="setNotesViewMode('board')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              <span>board</span>
            </button>
            <button type="button" class="notes-toggle-btn ${currentNotesViewMode === 'list' ? 'active' : ''}" onclick="setNotesViewMode('list')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              <span>list</span>
            </button>
          </div>

          <button type="button" class="notes-btn-create" onclick="openNoteEditorModal(null)">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>new note</span>
          </button>
        </div>
      </div>

      <!-- Filters Bar -->
      <div class="notes-toolbar">
        <div class="notes-search-wrap">
          <svg class="notes-search-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" class="notes-search-input" id="notes-search-input" placeholder="search notes, tags, blueprints..." value="${escHtml(currentNotesSearch)}" oninput="onNotesSearchChange(this.value)">
        </div>

        <div class="notes-filters-group">
          <select class="hr-select" id="notes-tag-filter" onchange="onNotesTagFilterChange(this.value)">
            ${tagOptions}
          </select>
          <select class="hr-select" id="notes-prio-filter" onchange="onNotesPrioFilterChange(this.value)">
            <option value="all" ${currentNotesFilterPrio === 'all' ? 'selected' : ''}>All Priorities</option>
            <option value="high" ${currentNotesFilterPrio === 'high' ? 'selected' : ''}>High</option>
            <option value="medium" ${currentNotesFilterPrio === 'medium' ? 'selected' : ''}>Medium</option>
            <option value="low" ${currentNotesFilterPrio === 'low' ? 'selected' : ''}>Low</option>
          </select>
          <select class="hr-select" id="notes-reminder-filter" onchange="onNotesReminderFilterChange(this.value)">
            <option value="all" ${currentNotesFilterReminder === 'all' ? 'selected' : ''}>All Notes</option>
            <option value="has_reminder" ${currentNotesFilterReminder === 'has_reminder' ? 'selected' : ''}>Reminders Only</option>
            <option value="pinned" ${currentNotesFilterReminder === 'pinned' ? 'selected' : ''}>Pinned Only</option>
          </select>
          <select class="hr-select" id="notes-group-filter" onchange="onNotesGroupChange(this.value)">
            <option value="none" ${currentNotesGrouping === 'none' ? 'selected' : ''}>No Grouping</option>
            <option value="priority" ${currentNotesGrouping === 'priority' ? 'selected' : ''}>Group by Priority</option>
            <option value="pinned" ${currentNotesGrouping === 'pinned' ? 'selected' : ''}>Group by Pin</option>
          </select>
        </div>
      </div>

      <!-- Notes Grid Render Area -->
      <div id="notes-render-area"></div>
    </div>
  `;

  renderNotesContent();
}

function setNotesViewMode(mode) {
  currentNotesViewMode = mode;
  DB.set("notes_view_mode", mode);
  buildNotes();
}

function onNotesSearchChange(val) {
  currentNotesSearch = val.toLowerCase().trim();
  renderNotesContent();
}

function onNotesTagFilterChange(val) {
  currentNotesFilterTag = val;
  renderNotesContent();
}

function onNotesPrioFilterChange(val) {
  currentNotesFilterPrio = val;
  renderNotesContent();
}

function onNotesReminderFilterChange(val) {
  currentNotesFilterReminder = val;
  renderNotesContent();
}

function onNotesGroupChange(val) {
  currentNotesGrouping = val;
  renderNotesContent();
}

/* ── 3. Filters Controller ── */
function getFilteredNotes() {
  let notes = getNormalizedGlobalNotes();

  if (currentNotesSearch) {
    notes = notes.filter(n => {
      const text = (n.title + " " + n.content.replace(/<[^>]*>/g, " ") + " " + (n.tags || []).join(" ")).toLowerCase();
      return text.includes(currentNotesSearch);
    });
  }

  if (currentNotesFilterTag !== "all") {
    notes = notes.filter(n => (n.tags || []).includes(currentNotesFilterTag));
  }

  if (currentNotesFilterPrio !== "all") {
    notes = notes.filter(n => n.priority === currentNotesFilterPrio);
  }

  if (currentNotesFilterReminder === "has_reminder") {
    notes = notes.filter(n => !!n.reminder);
  } else if (currentNotesFilterReminder === "pinned") {
    notes = notes.filter(n => n.pinned);
  }

  notes.sort((a, b) => (a.order !== undefined ? a.order : 0) - (b.order !== undefined ? b.order : 0));
  return notes;
}

function renderNotesContent() {
  const container = document.getElementById("notes-render-area");
  if (!container) return;

  const notes = getFilteredNotes();

  if (!notes.length) {
    container.innerHTML = `
      <div style="padding:48px 20px;text-align:center;color:var(--muted);background:var(--bg2);border:1px dashed var(--line);border-radius:var(--radius)">
        <div style="font-size:13px;color:var(--text);margin-bottom:4px">no notes found</div>
        <div style="font-size:11.5px;color:var(--muted);margin-bottom:14px">create a note to track patterns, code, and insights.</div>
        <button type="button" class="notes-btn-create" onclick="openNoteEditorModal(null)">+ new note</button>
      </div>
    `;
    return;
  }

  if (currentNotesViewMode === "board") {
    renderStickyBoardView(container, notes);
  } else {
    renderListView(container, notes);
  }
}

/* ── 4. STICKY NOTE BOARD VIEW ── */
function renderStickyBoardView(container, notes) {
  if (currentNotesGrouping === "pinned") {
    const pinned = notes.filter(n => n.pinned);
    const unpinned = notes.filter(n => !n.pinned);
    container.innerHTML = `
      ${pinned.length ? `<div class="sticky-group-title">Pinned (${pinned.length})</div><div class="sticky-board">${pinned.map(n => buildStickyCardHtml(n)).join("")}</div>` : ''}
      ${unpinned.length ? `<div class="sticky-group-title">Notes (${unpinned.length})</div><div class="sticky-board">${unpinned.map(n => buildStickyCardHtml(n)).join("")}</div>` : ''}
    `;
  } else if (currentNotesGrouping === "priority") {
    const high = notes.filter(n => n.priority === "high");
    const med = notes.filter(n => n.priority === "medium");
    const low = notes.filter(n => n.priority === "low" || n.priority === "none");
    container.innerHTML = `
      ${high.length ? `<div class="sticky-group-title" style="color:var(--hard-text)">High Priority (${high.length})</div><div class="sticky-board">${high.map(n => buildStickyCardHtml(n)).join("")}</div>` : ''}
      ${med.length ? `<div class="sticky-group-title" style="color:var(--medium-text)">Medium Priority (${med.length})</div><div class="sticky-board">${med.map(n => buildStickyCardHtml(n)).join("")}</div>` : ''}
      ${low.length ? `<div class="sticky-group-title">Standard (${low.length})</div><div class="sticky-board">${low.map(n => buildStickyCardHtml(n)).join("")}</div>` : ''}
    `;
  } else {
    container.innerHTML = `<div class="sticky-board">${notes.map(n => buildStickyCardHtml(n)).join("")}</div>`;
  }

  setupDragAndDrop();
}

function buildStickyCardHtml(note) {
  const d = new Date(note.updated || note.created || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const prioClass = note.priority && note.priority !== "none" ? "sticky-prio-" + note.priority : "";
  const summary = extractNoteSummary(note.content);

  let reminderHtml = "";
  if (note.reminder) {
    const rem = note.reminder;
    const isOverdue = !rem.completed && rem.date && (new Date(rem.date + "T" + (rem.time || "23:59")) < new Date());
    const isToday = !rem.completed && rem.date === new Date().toISOString().slice(0, 10);
    const remClass = rem.completed ? "completed" : (isOverdue ? "overdue" : (isToday ? "today" : ""));

    reminderHtml = `
      <div class="sticky-reminder-pill ${remClass}" onclick="event.stopPropagation();toggleNoteReminderStatus('${note.id}')" title="Toggle reminder">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        <span>${rem.date ? rem.date.slice(5) : 'Reminder'} ${rem.time || ''}</span>
      </div>
    `;
  }

  const tagsHtml = (note.tags || []).slice(0, 2).map(t => `<span class="sticky-tag-pill">#${escHtml(t)}</span>`).join("");

  const metaPills = [];
  if (summary.hasCode) metaPills.push('<span class="sticky-meta-pill sticky-meta-code">&lt;/&gt; code</span>');
  if (summary.hasLinks) metaPills.push('<span class="sticky-meta-pill sticky-meta-links">links</span>');

  return `
    <div class="sticky-card" id="sticky-${note.id}" data-id="${note.id}" draggable="true" onclick="openNoteEditorModal('${note.id}')">
      <div>
        <div class="sticky-card-header">
          <div class="sticky-card-title">${escHtml(note.title) || '<span style="color:var(--muted);font-style:italic">untitled note</span>'}</div>
          <span class="sticky-card-pin ${note.pinned ? 'pinned' : ''}" onclick="event.stopPropagation();toggleNotePin('${note.id}')" title="${note.pinned ? 'Unpin' : 'Pin'}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>
          </span>
        </div>

        <div class="sticky-card-body ${!summary.text ? 'empty' : ''}">
          ${summary.text ? escHtml(summary.text) : 'empty note...'}
        </div>

        ${metaPills.length ? `<div class="sticky-meta-pills-row">${metaPills.join("")}</div>` : ''}
      </div>

      <div class="sticky-card-footer">
        <div class="sticky-tags-row">
          ${note.priority && note.priority !== 'none' ? `<span class="sticky-prio-badge ${prioClass}">${note.priority}</span>` : ''}
          ${tagsHtml}
          ${reminderHtml}
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font-family:var(--mono);font-size:10px;color:var(--muted)">${d}</span>
          <div class="sticky-card-actions">
            <button type="button" class="sticky-action-icon" onclick="event.stopPropagation();openNoteEditorModal('${note.id}')" title="Edit">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </button>
            <button type="button" class="sticky-action-icon delete" onclick="event.stopPropagation();deleteNoteById('${note.id}')" title="Delete">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function setupDragAndDrop() {
  const cards = document.querySelectorAll(".sticky-card");
  cards.forEach(card => {
    card.addEventListener("dragstart", handleDragStart);
    card.addEventListener("dragover", handleDragOver);
    card.addEventListener("dragleave", handleDragLeave);
    card.addEventListener("drop", handleDrop);
    card.addEventListener("dragend", handleDragEnd);
  });
}

let draggedCardId = null;

function handleDragStart(e) {
  draggedCardId = this.getAttribute("data-id");
  this.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", draggedCardId);
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  this.classList.add("drag-over");
}

function handleDragLeave(e) {
  this.classList.remove("drag-over");
}

function handleDrop(e) {
  e.preventDefault();
  this.classList.remove("drag-over");
  const targetId = this.getAttribute("data-id");
  if (!draggedCardId || draggedCardId === targetId) return;

  const notes = getNormalizedGlobalNotes();
  const fromIdx = notes.findIndex(n => n.id === draggedCardId);
  const toIdx = notes.findIndex(n => n.id === targetId);

  if (fromIdx !== -1 && toIdx !== -1) {
    const [moved] = notes.splice(fromIdx, 1);
    notes.splice(toIdx, 0, moved);
    notes.forEach((n, idx) => n.order = idx);
    saveNormalizedGlobalNotes(notes);
    buildNotes();
  }
}

function handleDragEnd(e) {
  this.classList.remove("dragging");
  document.querySelectorAll(".sticky-card").forEach(c => c.classList.remove("drag-over"));
  draggedCardId = null;
}

/* ── 5. LIST VIEW ── */
function renderListView(container, notes) {
  const html = notes.map((note) => {
    const d = new Date(note.updated || note.created || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const prioBadge = note.priority && note.priority !== 'none' ? `<span class="sticky-prio-badge sticky-prio-${note.priority}">${note.priority}</span>` : '';
    const tagsHtml = (note.tags || []).map(t => `<span class="sticky-tag-pill">#${escHtml(t)}</span>`).join("");
    const summary = extractNoteSummary(note.content);

    let reminderHtml = "";
    if (note.reminder) {
      const rem = note.reminder;
      const isOverdue = !rem.completed && rem.date && (new Date(rem.date + "T" + (rem.time || "23:59")) < new Date());
      const remClass = rem.completed ? "completed" : (isOverdue ? "overdue" : "");
      reminderHtml = `
        <div class="sticky-reminder-pill ${remClass}" onclick="event.stopPropagation();toggleNoteReminderStatus('${note.id}')">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>${rem.date} ${rem.time || ''}</span>
        </div>
      `;
    }

    return `
      <div class="sticky-card" style="cursor:pointer;min-height:auto" onclick="openNoteEditorModal('${note.id}')">
        <div class="sticky-card-header">
          <div class="sticky-card-title" style="font-size:14.5px">${escHtml(note.title) || '<span style="color:var(--muted);font-style:italic">untitled note</span>'}</div>
          <div style="display:flex;align-items:center;gap:6px">
            ${note.pinned ? '<span style="color:var(--accent);display:inline-flex;align-items:center"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg></span>' : ''}
            <span style="font-family:var(--mono);font-size:10.5px;color:var(--muted)">${d}</span>
          </div>
        </div>

        <div class="sticky-card-body" style="margin-bottom:8px">
          ${summary.text ? escHtml(summary.text) : '<span style="color:var(--muted);font-style:italic">empty note...</span>'}
        </div>

        <div class="sticky-card-footer">
          <div class="sticky-tags-row">
            ${prioBadge}
            ${tagsHtml}
            ${reminderHtml}
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <button type="button" class="hr-btn" style="padding:2px 6px;font-size:11px" onclick="event.stopPropagation();openNoteEditorModal('${note.id}')">edit</button>
            <button type="button" class="hr-btn" style="padding:2px 6px;font-size:11px;color:var(--hard-text)" onclick="event.stopPropagation();deleteNoteById('${note.id}')">delete</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = `<div style="display:flex;flex-direction:column;gap:10px">${html}</div>`;
}

/* ── 6. MINIMALIST MODAL EDITOR ── */
function openNoteEditorModal(noteId = null) {
  const notes = getNormalizedGlobalNotes();
  const note = noteId ? notes.find(n => n.id === noteId) : null;

  const rem = note?.reminder || { date: "", time: "", priority: "medium", completed: false };

  const modalHtml = `
    <div class="clean-modal-overlay" id="note-editor-modal" onclick="closeNoteModalOnBackdrop(event)">
      <div class="clean-modal-card" onclick="event.stopPropagation()">
        <!-- Header -->
        <div class="clean-modal-header">
          <div style="font-family:var(--serif);font-size:18px;font-weight:400;color:var(--text)">
            ${note ? 'edit note.' : 'new note.'}
          </div>
          <button type="button" class="modal-close" onclick="closeNoteModalDirect()" title="Close">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <input type="hidden" id="modal-note-id" value="${note ? note.id : ''}">

        <!-- Body -->
        <div class="clean-modal-body">
          <!-- Title Input -->
          <input type="text" class="modal-title-input" id="modal-note-title" placeholder="note title..." value="${note ? escHtml(note.title) : ''}">

          <!-- Metadata Strip -->
          <div class="modal-meta-strip">
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
              <div style="display:flex;align-items:center;gap:6px">
                <span style="font-size:10.5px;color:var(--muted);font-family:var(--mono);text-transform:uppercase">Priority</span>
                <select class="hr-select" id="modal-note-prio" style="padding:3px 24px 3px 6px;font-size:11px">
                  <option value="none" ${!note || note.priority === 'none' ? 'selected' : ''}>None</option>
                  <option value="high" ${note && note.priority === 'high' ? 'selected' : ''}>High</option>
                  <option value="medium" ${note && note.priority === 'medium' ? 'selected' : ''}>Medium</option>
                  <option value="low" ${note && note.priority === 'low' ? 'selected' : ''}>Low</option>
                </select>
              </div>

              <label style="display:flex;align-items:center;gap:5px;font-size:11.5px;color:var(--text);cursor:pointer;user-select:none">
                <input type="checkbox" id="modal-note-pin" ${note && note.pinned ? 'checked' : ''} style="cursor:pointer;accent-color:var(--accent)">
                <span>Pin to top</span>
              </label>
            </div>

            <div style="display:flex;align-items:center;gap:6px;flex:1;min-width:160px">
              <span style="font-size:10.5px;color:var(--muted);font-family:var(--mono);text-transform:uppercase">Tags</span>
              <input type="text" class="notes-search-input" id="modal-note-tags" style="padding:3px 8px;font-size:11px" placeholder="dp, graphs, system-design" value="${note && note.tags ? escHtml(note.tags.join(', ')) : ''}">
            </div>
          </div>

          <!-- Quill 2.0 Container -->
          <div>
            <div id="modal-quill-wrapper"></div>
          </div>

          <!-- Reminders Panel -->
          <div class="modal-reminders-panel">
            <div class="modal-reminders-header">
              <div style="display:flex;align-items:center;gap:6px">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span style="font-size:11.5px;font-weight:500;color:var(--text)">Scheduled Reminder</span>
              </div>
              <label style="font-size:11px;color:var(--muted);display:flex;align-items:center;gap:4px;cursor:pointer">
                <input type="checkbox" id="modal-rem-enable" ${note && note.reminder ? 'checked' : ''} onchange="document.getElementById('modal-rem-fields').style.display = this.checked ? 'grid' : 'none'" style="accent-color:var(--accent)">
                <span>Enable</span>
              </label>
            </div>

            <div id="modal-rem-fields" class="modal-reminders-inputs" style="display:${note && note.reminder ? 'grid' : 'none'}">
              <div>
                <label style="font-size:10px;color:var(--muted);display:block;margin-bottom:2px">Date</label>
                <input type="date" class="notes-search-input" id="modal-rem-date" style="padding:4px 6px;font-size:11px" value="${rem.date || ''}">
              </div>
              <div>
                <label style="font-size:10px;color:var(--muted);display:block;margin-bottom:2px">Time</label>
                <input type="time" class="notes-search-input" id="modal-rem-time" style="padding:4px 6px;font-size:11px" value="${rem.time || '09:00'}">
              </div>
              <div>
                <label style="font-size:10px;color:var(--muted);display:block;margin-bottom:2px">Status</label>
                <select class="hr-select" id="modal-rem-completed" style="width:100%;padding:4px 22px 4px 6px;font-size:11px">
                  <option value="false" ${!rem.completed ? 'selected' : ''}>Pending</option>
                  <option value="true" ${rem.completed ? 'selected' : ''}>Completed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="clean-modal-footer">
          <div>
            ${note ? `<button type="button" class="hr-btn" style="color:var(--hard-text);border-color:rgba(200,104,104,0.3)" onclick="deleteNoteById('${note.id}');closeNoteModalDirect()">delete note</button>` : '<div></div>'}
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <button type="button" class="hr-btn" onclick="closeNoteModalDirect()">cancel</button>
            <button type="button" class="notes-btn-create" onclick="saveNoteModal()">save note</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("note-editor-modal")?.remove();
  document.body.insertAdjacentHTML("beforeend", modalHtml);

  // Initialize Quill
  initModalQuill(note ? note.content : "");
}

function initModalQuill(initialHtml) {
  const container = document.getElementById("modal-quill-wrapper");
  if (!container) return;

  if (typeof Quill === "undefined") {
    container.innerHTML = `<textarea class="hr-answer-textarea" id="fallback-note-editor" style="min-height:220px">${initialHtml}</textarea>`;
    return;
  }

  container.innerHTML = "";
  const quillDiv = document.createElement("div");
  container.appendChild(quillDiv);

  activeQuillInstance = new Quill(quillDiv, {
    theme: "snow",
    placeholder: "Capture pattern insights, code, and notes...",
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
        ["blockquote", "code-block"],
        ["link", "image"],
        ["clean"]
      ]
    }
  });

  if (initialHtml) {
    activeQuillInstance.root.innerHTML = initialHtml;
  }
}

function saveNoteModal() {
  const id = document.getElementById("modal-note-id")?.value;
  const title = document.getElementById("modal-note-title")?.value.trim();
  const pinned = document.getElementById("modal-note-pin")?.checked || false;
  const priority = document.getElementById("modal-note-prio")?.value || "none";
  const tagsStr = document.getElementById("modal-note-tags")?.value.trim() || "";

  let contentHtml = "";
  if (activeQuillInstance) {
    contentHtml = activeQuillInstance.root.innerHTML;
    if (contentHtml === "<p><br></p>") contentHtml = "";
  } else {
    contentHtml = document.getElementById("fallback-note-editor")?.value || "";
  }

  let reminder = null;
  const remEnabled = document.getElementById("modal-rem-enable")?.checked;
  if (remEnabled) {
    const remDate = document.getElementById("modal-rem-date")?.value;
    const remTime = document.getElementById("modal-rem-time")?.value;
    const remComp = document.getElementById("modal-rem-completed")?.value === "true";
    reminder = {
      date: remDate,
      time: remTime,
      priority: priority !== "none" ? priority : "medium",
      completed: remComp,
      text: title || "Note Reminder"
    };
  }

  const tags = tagsStr ? tagsStr.split(",").map(t => t.trim().toLowerCase()).filter(Boolean) : [];
  const notes = getNormalizedGlobalNotes();

  if (id) {
    const existing = notes.find(n => n.id === id);
    if (existing) {
      existing.title = title;
      existing.content = contentHtml;
      existing.pinned = pinned;
      existing.priority = priority;
      existing.tags = tags;
      existing.reminder = reminder;
      existing.updated = Date.now();
    }
  } else {
    notes.unshift({
      id: "note-" + Date.now().toString().slice(-6),
      title: title,
      content: contentHtml,
      pinned: pinned,
      color: "default",
      priority: priority,
      tags: tags,
      reminder: reminder,
      order: 0,
      created: Date.now(),
      updated: Date.now(),
      _migrated: true
    });
    notes.forEach((n, idx) => n.order = idx);
  }

  saveNormalizedGlobalNotes(notes);
  closeNoteModalDirect();
  buildNotes();
}

function toggleNotePin(noteId) {
  const notes = getNormalizedGlobalNotes();
  const n = notes.find(item => item.id === noteId);
  if (!n) return;
  n.pinned = !n.pinned;
  n.updated = Date.now();
  saveNormalizedGlobalNotes(notes);
  buildNotes();
}

function toggleNoteReminderStatus(noteId) {
  const notes = getNormalizedGlobalNotes();
  const n = notes.find(item => item.id === noteId);
  if (!n || !n.reminder) return;
  n.reminder.completed = !n.reminder.completed;
  n.updated = Date.now();
  saveNormalizedGlobalNotes(notes);
  buildNotes();
  if (typeof buildMainDashboard === "function") {
    const dashInner = document.getElementById("main-dashboard-inner");
    if (dashInner && document.getElementById("view-dashboard")?.classList.contains("active")) {
      buildMainDashboard();
    }
  }
}

function deleteNoteById(noteId) {
  if (!confirm("Delete this note?")) return;
  let notes = getNormalizedGlobalNotes();
  notes = notes.filter(n => n.id !== noteId);
  saveNormalizedGlobalNotes(notes);
  buildNotes();
}

function closeNoteModalOnBackdrop(e) {
  if (e.target.id === "note-editor-modal") closeNoteModalDirect();
}

function closeNoteModalDirect() {
  document.getElementById("note-editor-modal")?.remove();
  activeQuillInstance = null;
}

/* ── 7. Dashboard Reminders Widget ── */
function renderDashboardRemindersWidget() {
  const notes = getNormalizedGlobalNotes();
  const reminders = [];

  notes.forEach(n => {
    if (n.reminder) {
      reminders.push({
        noteId: n.id,
        title: n.title || "Note Reminder",
        date: n.reminder.date,
        time: n.reminder.time,
        priority: n.reminder.priority || n.priority || "medium",
        completed: !!n.reminder.completed
      });
    }
  });

  reminders.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const dateA = (a.date || "9999-99-99") + (a.time || "00:00");
    const dateB = (b.date || "9999-99-99") + (b.time || "00:00");
    return dateA.localeCompare(dateB);
  });

  if (!reminders.length) return "";

  const html = reminders.slice(0, 5).map(r => {
    const isOverdue = !r.completed && r.date && (new Date(r.date + "T" + (rem.time || "23:59")) < new Date());
    const isToday = !r.completed && r.date === new Date().toISOString().slice(0, 10);
    const prioColor = r.priority === 'high' ? 'var(--hard-text)' : (r.priority === 'medium' ? 'var(--medium-text)' : 'var(--mid)');

    return `
      <div class="dash-reminder-item">
        <div class="dash-reminder-left">
          <input type="checkbox" class="dash-reminder-checkbox" ${r.completed ? 'checked' : ''} onchange="toggleNoteReminderStatus('${r.noteId}')">
          <div>
            <div class="dash-reminder-text ${r.completed ? 'done' : ''}" style="cursor:pointer" onclick="showView('notes');setTimeout(()=>openNoteEditorModal('${r.noteId}'), 100)">
              ${escHtml(r.title)}
            </div>
            <div style="font-family:var(--mono);font-size:10.5px;color:var(--muted);margin-top:2px">
              ${isOverdue ? '<span style="color:var(--hard-text);font-weight:600">OVERDUE · </span>' : (isToday ? '<span style="color:var(--medium-text);font-weight:600">TODAY · </span>' : '')}
              ${r.date || 'No Date'} ${r.time || ''}
            </div>
          </div>
        </div>
        <span class="sticky-prio-badge sticky-prio-${r.priority}" style="color:${prioColor}">${r.priority}</span>
      </div>
    `;
  }).join("");

  return `
    <div class="dash-reminders-card">
      <div class="dash-reminders-header">
        <div class="dash-reminders-title">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>Upcoming Reminders (${reminders.filter(r => !r.completed).length} active)</span>
        </div>
        <button type="button" class="hr-btn" style="padding:2px 8px;font-size:11px" onclick="showView('notes')">View All Notes</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${html}
      </div>
    </div>
  `;
}
