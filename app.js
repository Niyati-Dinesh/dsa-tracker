// DSA Tracker — app.js
(function () {
  'use strict';

  // ─── localStorage keys ────────────────────────────────────────────────────
  const KEYS = {
    completed: 'dsa_completed',
    notes: 'dsa_notes',
    cfCompleted: 'dsa_cf_completed',
    cfNotes: 'dsa_cf_notes',
  };

  function loadState() {
    return {
      completed:   JSON.parse(localStorage.getItem(KEYS.completed)   || '{}'),
      notes:       JSON.parse(localStorage.getItem(KEYS.notes)        || '{}'),
      cfCompleted: JSON.parse(localStorage.getItem(KEYS.cfCompleted)  || '{}'),
      cfNotes:     JSON.parse(localStorage.getItem(KEYS.cfNotes)      || '{}'),
    };
  }
  const save = {
    completed:   c  => localStorage.setItem(KEYS.completed,   JSON.stringify(c)),
    notes:       n  => localStorage.setItem(KEYS.notes,        JSON.stringify(n)),
    cfCompleted: c  => localStorage.setItem(KEYS.cfCompleted,  JSON.stringify(c)),
    cfNotes:     n  => localStorage.setItem(KEYS.cfNotes,      JSON.stringify(n)),
  };

  // ─── Data helpers ─────────────────────────────────────────────────────────
  function getAllProblems() {
    const all = [];
    for (const topic of window.DSA_DATA.topics) {
      for (const sub of topic.subtopics) {
        for (const p of sub.problems) {
          all.push({ ...p, topicId: topic.id, topicName: topic.name, subtopicId: sub.id, subtopicName: sub.name });
        }
      }
    }
    return all;
  }

  function generateDayPlan() {
    const all = getAllProblems();
    const days = [];
    for (let i = 0; i < all.length; i += 3) days.push(all.slice(i, i + 3));
    return days;
  }

  function esc(s) {
    return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function badge(diff) {
    return `<span class="badge badge-${diff.toLowerCase()}">${diff}</span>`;
  }
  function tags(arr) {
    return (arr||[]).map(t=>`<span class="tag">${t}</span>`).join('');
  }

  // ─── Navigation ───────────────────────────────────────────────────────────
  const viewEls = {
    dashboard:  document.getElementById('viewDashboard'),
    dayplan:    document.getElementById('viewDayplan'),
    problems:   document.getElementById('viewProblems'),
    notes:      document.getElementById('viewNotes'),
    codeforces: document.getElementById('viewCodeforces'),
  };
  let currentView = 'dashboard';

  function switchView(name) {
    if (!viewEls[name]) return;
    currentView = name;
    Object.entries(viewEls).forEach(([k,el]) => el.classList.toggle('active', k === name));
    document.querySelectorAll('.nav-link').forEach(a => a.classList.toggle('active', a.dataset.view === name));
    closeSidebar();
    renderView(name);
  }
  function renderView(name) {
    const st = loadState();
    switch(name) {
      case 'dashboard':  renderDashboard(st);  break;
      case 'dayplan':    renderDayPlan(st);     break;
      case 'problems':   renderProblems(st);    break;
      case 'notes':      renderNotes(st);       break;
      case 'codeforces': renderCodeforces(st);  break;
    }
  }

  // ─── Sidebar ──────────────────────────────────────────────────────────────
  const sidebar  = document.getElementById('sidebar');
  const overlayEl = document.getElementById('sidebarOverlay');
  function openSidebar()  { sidebar.classList.add('open'); overlayEl.classList.add('active'); }
  function closeSidebar() { sidebar.classList.remove('open'); overlayEl.classList.remove('active'); }

  // ─── Dashboard ────────────────────────────────────────────────────────────
  function renderDashboard(st) {
    const all   = getAllProblems();
    const total = all.length;
    const done  = Object.values(st.completed).filter(Boolean).length;
    const cfAll = window.DSA_DATA.codeforces.problems;
    const cfDone = Object.values(st.cfCompleted).filter(Boolean).length;
    const pct    = total ? Math.round(done/total*100) : 0;
    const streak = done > 0 ? Math.ceil(done/3) : 0;

    // Topic bars
    let topicBars = '';
    for (const topic of window.DSA_DATA.topics) {
      let tt=0, td=0;
      for (const sub of topic.subtopics) for (const p of sub.problems) { tt++; if(st.completed[p.id]) td++; }
      const tp = tt ? Math.round(td/tt*100) : 0;
      topicBars += `<div class="topic-progress-item">
        <div class="topic-progress-header"><span>${topic.name}</span><span>${td}/${tt}</span></div>
        <div class="progress-bar-container"><div class="progress-bar" style="width:${tp}%"></div></div>
      </div>`;
    }

    // Recent activity
    const doneIds = Object.keys(st.completed).filter(id=>st.completed[id]).slice(-5).reverse();
    let recentHtml = doneIds.length ? '<ul class="activity-list">' : '<p class="text-muted">No completed problems yet. Start solving!</p>';
    for (const id of doneIds) {
      const p = all.find(x=>x.id===id); if(!p) continue;
      recentHtml += `<li class="activity-item">${badge(p.difficulty)} <a href="${p.url}" target="_blank" rel="noopener">${esc(p.name)}</a> <span class="text-muted small">${p.topicName}</span></li>`;
    }
    if (doneIds.length) recentHtml += '</ul>';

    // Today's problems
    const days = generateDayPlan();
    const todayIdx = Math.max(0, days.findIndex(day=>!day.every(p=>st.completed[p.id])));
    const todayProblems = days[todayIdx] || [];
    let todayHtml = `<p class="text-muted small">Day ${todayIdx+1} of ${days.length}</p><ul class="today-list">`;
    for (const p of todayProblems) {
      todayHtml += `<li class="today-item">
        <input type="checkbox" class="problem-check" data-id="${p.id}" ${st.completed[p.id]?'checked':''}>
        <span class="${st.completed[p.id]?'completed':''}">${esc(p.name)}</span>
        ${badge(p.difficulty)}
      </li>`;
    }
    todayHtml += '</ul>';

    viewEls.dashboard.innerHTML = `
      <div class="view-header"><h1>Dashboard</h1></div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-value">${total}</div><div class="stat-label">Total Problems</div></div>
        <div class="stat-card"><div class="stat-value">${done}</div><div class="stat-label">Completed</div></div>
        <div class="stat-card"><div class="stat-value">${streak}</div><div class="stat-label">Days Progress</div></div>
        <div class="stat-card"><div class="stat-value">${cfDone}/${cfAll.length}</div><div class="stat-label">Codeforces</div></div>
      </div>
      <div class="progress-card">
        <div class="progress-card-header"><span>Overall Progress</span><span>${pct}%</span></div>
        <div class="progress-bar-container"><div class="progress-bar" style="width:${pct}%"></div></div>
        <div class="text-muted small">${done} of ${total} problems completed</div>
      </div>
      <div class="dashboard-grid">
        <div class="card">
          <h3 class="card-title">Today's Problems</h3>
          ${todayHtml}
        </div>
        <div class="card">
          <h3 class="card-title">Recent Activity</h3>
          ${recentHtml}
        </div>
      </div>
      <div class="card">
        <h3 class="card-title">Progress by Topic</h3>
        <div class="topic-progress-list">${topicBars}</div>
      </div>`;
  }

  // ─── Day Plan ─────────────────────────────────────────────────────────────
  function renderDayPlan(st) {
    const days = generateDayPlan();
    const completedDays = days.filter(day=>day.every(p=>st.completed[p.id])).length;
    const currentIdx   = days.findIndex(day=>!day.every(p=>st.completed[p.id]));

    let html = `<div class="view-header"><h1>Day Plan</h1></div>
      <div class="dayplan-stats">
        <span>Total Days: <strong>${days.length}</strong></span>
        <span>Completed: <strong>${completedDays}</strong></span>
        <span>Current Day: <strong>${currentIdx >= 0 ? currentIdx+1 : days.length}</strong></span>
      </div>`;

    for (let i=0; i<days.length; i++) {
      const day = days[i];
      const isToday = i===currentIdx;
      const allDone = day.every(p=>st.completed[p.id]);
      const isPast  = currentIdx >= 0 && i < currentIdx;
      const cls = allDone ? 'day-done' : isToday ? 'day-today' : isPast ? 'day-past' : 'day-future';
      html += `<div class="day-card ${cls}">
        <div class="day-card-header">
          <span class="day-number">Day ${i+1}${isToday?' <span class="today-badge">TODAY</span>':''}</span>
          <span class="day-status">${allDone?'✓ Complete':isToday?'In Progress':''}</span>
        </div>
        <ul class="day-problems">`;
      for (const p of day) {
        html += `<li>
          <input type="checkbox" class="problem-check" data-id="${p.id}" ${st.completed[p.id]?'checked':''}>
          <span class="${st.completed[p.id]?'completed':''}">${esc(p.name)}</span>
          ${badge(p.difficulty)}
          <button class="btn-icon open-modal" data-id="${p.id}" title="Details">ℹ</button>
        </li>`;
      }
      html += '</ul></div>';
    }
    viewEls.dayplan.innerHTML = html;
  }

  // ─── Problems View ────────────────────────────────────────────────────────
  let pFilter = { topic:'all', difficulty:'all', search:'' };

  function renderProblems(st) {
    let topicOptions = '<option value="all">All Topics</option>';
    for (const t of window.DSA_DATA.topics) topicOptions += `<option value="${t.id}">${t.name}</option>`;

    let tableHtml = buildProblemsTable(st);

    viewEls.problems.innerHTML = `
      <div class="view-header"><h1>Problems</h1></div>
      <div class="problems-layout">
        <aside class="filters-panel">
          <div class="filter-group">
            <label>Topic</label>
            <select id="filterTopic">${topicOptions}</select>
          </div>
          <div class="filter-group">
            <label>Difficulty</label>
            <select id="filterDifficulty">
              <option value="all">All</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Search</label>
            <input type="text" id="filterSearch" placeholder="Search problems...">
          </div>
        </aside>
        <div class="problems-main" id="problemsTableContainer">${tableHtml}</div>
      </div>`;

    document.getElementById('filterTopic').value = pFilter.topic;
    document.getElementById('filterDifficulty').value = pFilter.difficulty;
    document.getElementById('filterSearch').value = pFilter.search;
    document.getElementById('filterTopic').addEventListener('change', e => { pFilter.topic=e.target.value; refreshProblemsTable(); });
    document.getElementById('filterDifficulty').addEventListener('change', e => { pFilter.difficulty=e.target.value; refreshProblemsTable(); });
    document.getElementById('filterSearch').addEventListener('input', e => { pFilter.search=e.target.value.toLowerCase(); refreshProblemsTable(); });
  }

  function refreshProblemsTable() {
    const c = document.getElementById('problemsTableContainer');
    if (c) c.innerHTML = buildProblemsTable(loadState());
  }

  function buildProblemsTable(st) {
    let html = '';
    for (const topic of window.DSA_DATA.topics) {
      if (pFilter.topic !== 'all' && topic.id !== pFilter.topic) continue;
      for (const sub of topic.subtopics) {
        const filtered = sub.problems.filter(p => {
          if (pFilter.difficulty !== 'all' && p.difficulty !== pFilter.difficulty) return false;
          if (pFilter.search && !p.name.toLowerCase().includes(pFilter.search)) return false;
          return true;
        });
        if (!filtered.length) continue;
        const sd = filtered.filter(p=>st.completed[p.id]).length;
        html += `<div class="subtopic-section">
          <div class="subtopic-header"><span class="subtopic-name">${sub.name}</span><span class="subtopic-progress">${sd}/${filtered.length}</span></div>
          <table class="problems-table">
            <thead><tr><th>✓</th><th>Problem</th><th>Diff</th><th>Hint</th><th>Pattern</th><th>Note</th></tr></thead>
            <tbody>`;
        for (const p of filtered) {
          const note = st.notes[p.id] || '';
          html += `<tr class="${st.completed[p.id]?'row-done':''}" data-id="${p.id}">
            <td><input type="checkbox" class="problem-check" data-id="${p.id}" ${st.completed[p.id]?'checked':''}></td>
            <td><a href="${p.url}" target="_blank" rel="noopener">${esc(p.name)}</a><div class="tags-row">${tags(p.tags)}</div></td>
            <td>${badge(p.difficulty)}</td>
            <td><button class="btn-hint" data-id="${p.id}">Show Hint</button><div class="hint-box hidden" id="hint-${p.id}">${esc(p.hint)}</div></td>
            <td><button class="btn-pattern" data-id="${p.id}">Show Pattern</button><div class="pattern-box hidden" id="pattern-${p.id}">${esc(p.trigger)}</div></td>
            <td><div class="inline-note"><input type="text" class="note-input" data-id="${p.id}" placeholder="Add note…" value="${esc(note)}"><button class="btn-save-note" data-id="${p.id}">💾</button></div></td>
          </tr>`;
        }
        html += '</tbody></table></div>';
      }
    }
    return html || '<p class="text-muted">No problems match your filters.</p>';
  }

  // ─── Notes View ───────────────────────────────────────────────────────────
  let notesSearch = '';

  function renderNotes(st) {
    const all = getAllProblems();
    const noteIds = Object.keys(st.notes).filter(id=>st.notes[id]&&st.notes[id].trim());

    const filtered = noteIds.filter(id => {
      if (!notesSearch) return true;
      const p = all.find(x=>x.id===id); if(!p) return false;
      return p.name.toLowerCase().includes(notesSearch) || st.notes[id].toLowerCase().includes(notesSearch);
    });

    let cardsHtml = '';
    if (!noteIds.length) {
      cardsHtml = '<p class="text-muted">No notes yet. Add notes from the Problems view.</p>';
    } else if (!filtered.length) {
      cardsHtml = '<p class="text-muted">No notes match your search.</p>';
    } else {
      cardsHtml = '<div class="notes-grid">';
      for (const id of filtered) {
        const p = all.find(x=>x.id===id); if(!p) continue;
        cardsHtml += `<div class="note-card">
          <div class="note-card-header">
            <a href="${p.url}" target="_blank" rel="noopener">${esc(p.name)}</a>
            ${badge(p.difficulty)}
          </div>
          <div class="note-card-topic">${p.topicName} › ${p.subtopicName}</div>
          <textarea class="note-edit-area" data-id="${id}" rows="3">${esc(st.notes[id])}</textarea>
          <div class="note-actions">
            <button class="btn-save-note btn btn-sm btn-primary" data-id="${id}">Save</button>
            <button class="btn-delete-note btn btn-sm btn-danger" data-id="${id}">Delete</button>
          </div>
        </div>`;
      }
      cardsHtml += '</div>';
    }

    viewEls.notes.innerHTML = `
      <div class="view-header"><h1>Notes</h1><span class="text-muted">${noteIds.length} note${noteIds.length!==1?'s':''}</span></div>
      <div class="notes-search-row">
        <input type="text" id="notesSearch" placeholder="Search notes…" value="${esc(notesSearch)}">
      </div>
      ${cardsHtml}`;

    document.getElementById('notesSearch').addEventListener('input', e => { notesSearch=e.target.value.toLowerCase(); renderNotes(loadState()); });
  }

  // ─── Codeforces View ──────────────────────────────────────────────────────
  let countdownInterval = null;

  function getNextSaturdays(n) {
    const result = [];
    const d = new Date();
    const daysUntil = (6 - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + daysUntil);
    d.setHours(17, 35, 0, 0);
    for (let i=0; i<n; i++) { result.push(new Date(d)); d.setDate(d.getDate()+7); }
    return result;
  }

  function fmtCountdown(ms) {
    if (ms <= 0) return 'Starting now!';
    const s = Math.floor(ms/1000), m = Math.floor(s/60), h = Math.floor(m/60), days = Math.floor(h/24);
    if (days > 0) return `${days}d ${h%24}h ${m%60}m`;
    if (h > 0)   return `${h}h ${m%60}m ${s%60}s`;
    return `${m}m ${s%60}s`;
  }

  function renderCodeforces(st) {
    const probs = window.DSA_DATA.codeforces.problems;
    const cfDone = probs.filter(p=>st.cfCompleted[p.id]).length;

    let probsHtml = `<div class="cf-stats"><span>Progress: <strong>${cfDone}/${probs.length}</strong></span></div>
      <table class="problems-table">
        <thead><tr><th>✓</th><th>Problem</th><th>Rating</th><th>Hint</th><th>Pattern</th><th>Note</th></tr></thead>
        <tbody>`;
    for (const p of probs) {
      const note = st.cfNotes[p.id]||'';
      probsHtml += `<tr class="${st.cfCompleted[p.id]?'row-done':''}" data-cf-id="${p.id}">
        <td><input type="checkbox" class="cf-check" data-id="${p.id}" ${st.cfCompleted[p.id]?'checked':''}></td>
        <td><a href="${p.url}" target="_blank" rel="noopener">${esc(p.name)}</a><div class="tags-row">${tags(p.tags)}</div></td>
        <td><span class="cf-rating" data-rating="${p.rating}">${p.rating}</span></td>
        <td><button class="btn-hint cf-hint-btn" data-id="${p.id}">Show Hint</button><div class="hint-box hidden" id="cf-hint-${p.id}">${esc(p.hint)}</div></td>
        <td><button class="btn-pattern cf-pattern-btn" data-id="${p.id}">Show Pattern</button><div class="pattern-box hidden" id="cf-pattern-${p.id}">${esc(p.trigger)}</div></td>
        <td><div class="inline-note"><input type="text" class="cf-note-input" data-id="${p.id}" placeholder="Add note…" value="${esc(note)}"><button class="btn-save-cf-note" data-id="${p.id}">💾</button></div></td>
      </tr>`;
    }
    probsHtml += '</tbody></table>';

    viewEls.codeforces.innerHTML = `
      <div class="view-header"><h1>Codeforces</h1></div>
      <div id="saturdayCountdowns"></div>
      <div class="card mt-2">
        <h3 class="card-title">Practice Problems</h3>
        ${probsHtml}
      </div>`;

    startCountdowns();
  }

  function startCountdowns() {
    if (countdownInterval) clearInterval(countdownInterval);
    const saturdays = getNextSaturdays(3);
    function update() {
      const c = document.getElementById('saturdayCountdowns'); if(!c) { clearInterval(countdownInterval); return; }
      const now = Date.now();
      let html = '<div class="countdown-cards">';
      saturdays.forEach((sat,i) => {
        const diff = sat.getTime()-now;
        const label = i===0?'Next Contest':`Contest +${i}`;
        const dateStr = sat.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'});
        html += `<div class="countdown-card">
          <div class="countdown-label">${label}</div>
          <div class="countdown-date">${dateStr}</div>
          <div class="countdown-timer">${fmtCountdown(diff)}</div>
        </div>`;
      });
      html += '</div>';
      c.innerHTML = html;
    }
    update();
    countdownInterval = setInterval(update, 1000);
  }

  // ─── Modal ────────────────────────────────────────────────────────────────
  const modalEl   = document.getElementById('problemModal');
  const modalOvEl = document.getElementById('modalOverlay');

  function openModal(id) {
    const all   = getAllProblems();
    const cfAll = window.DSA_DATA.codeforces.problems;
    let p = all.find(x=>x.id===id);
    const isCF = !p;
    if (isCF) p = cfAll.find(x=>x.id===id);
    if (!p) return;

    const st    = loadState();
    const note  = isCF ? (st.cfNotes[id]||'') : (st.notes[id]||'');
    const done  = isCF ? st.cfCompleted[id]    : st.completed[id];
    const diff  = isCF ? `<span class="cf-rating" data-rating="${p.rating}">${p.rating}</span>` : badge(p.difficulty);
    const plat  = isCF ? '<span class="badge badge-cf">Codeforces</span>' : '<span class="badge badge-lc">LeetCode</span>';
    const loc   = p.topicName ? `<span class="text-muted">${p.topicName} › ${p.subtopicName}</span>` : '';

    document.getElementById('modalTitle').textContent = p.name;
    document.getElementById('modalBody').innerHTML = `
      <div class="modal-meta">${plat} ${diff} ${loc}</div>
      <div class="tags-row">${tags(p.tags)}</div>
      <div class="modal-section"><a href="${p.url}" target="_blank" rel="noopener" class="btn btn-primary">Open Problem ↗</a></div>
      <div class="modal-section">
        <button class="btn btn-secondary modal-hint-btn" data-id="${id}">💡 Show Hint</button>
        <div class="hint-box hidden" id="modal-hint-${id}">${esc(p.hint)}</div>
      </div>
      <div class="modal-section">
        <button class="btn btn-secondary modal-pattern-btn" data-id="${id}">🎯 Show Pattern</button>
        <div class="pattern-box hidden" id="modal-pattern-${id}">${esc(p.trigger)}</div>
      </div>
      <div class="modal-section">
        <label class="modal-check-label">
          <input type="checkbox" class="${isCF?'cf-check':'problem-check'}" data-id="${id}" ${done?'checked':''}>
          Mark as completed
        </label>
      </div>
      <div class="modal-section">
        <label>Notes</label>
        <textarea class="${isCF?'cf-note-textarea':'note-textarea'}" data-id="${id}" rows="4" placeholder="Add your notes here…">${esc(note)}</textarea>
        <button class="${isCF?'btn-save-cf-note':'btn-save-note'} btn btn-sm btn-primary" data-id="${id}" style="margin-top:.5rem">Save Note</button>
      </div>`;

    modalEl.classList.add('active');
    modalOvEl.classList.add('active');
  }

  function closeModal() {
    modalEl.classList.remove('active');
    modalOvEl.classList.remove('active');
  }

  // ─── Event delegation ─────────────────────────────────────────────────────
  document.addEventListener('change', function(e) {
    if (e.target.matches('.problem-check')) {
      const id = e.target.dataset.id;
      const st = loadState();
      st.completed[id] = e.target.checked;
      save.completed(st.completed);
      const row = e.target.closest('tr, li');
      if (row) {
        row.classList.toggle('row-done', e.target.checked);
        row.querySelectorAll('span:not(.badge):not(.tag)').forEach(s => {
          if (!s.children.length) s.classList.toggle('completed', e.target.checked);
        });
      }
      if (currentView==='dashboard') renderDashboard(loadState());
    }
    if (e.target.matches('.cf-check')) {
      const id = e.target.dataset.id;
      const st = loadState();
      st.cfCompleted[id] = e.target.checked;
      save.cfCompleted(st.cfCompleted);
      const row = e.target.closest('tr');
      if (row) row.classList.toggle('row-done', e.target.checked);
    }
  });

  document.addEventListener('click', function(e) {
    const t = e.target;

    // Nav
    const navLink = t.closest('.nav-link');
    if (navLink) { e.preventDefault(); switchView(navLink.dataset.view); return; }

    // Hamburger
    if (t.closest('#hamburgerBtn')) { openSidebar(); return; }

    // Sidebar close
    if (t.matches('#sidebarClose') || t.closest('#sidebarClose')) { closeSidebar(); return; }

    // Sidebar overlay
    if (t.matches('#sidebarOverlay')) { closeSidebar(); return; }

    // Modal close
    if (t.matches('#modalClose') || t.matches('#modalOverlay')) { closeModal(); return; }

    // Open modal (dayplan info button)
    if (t.matches('.open-modal')) { openModal(t.dataset.id); return; }

    // Show/hide hint (LeetCode)
    if (t.matches('.btn-hint:not(.cf-hint-btn)')) {
      const box = document.getElementById('hint-'+t.dataset.id);
      if (box) { box.classList.toggle('hidden'); t.textContent = box.classList.contains('hidden')?'Show Hint':'Hide Hint'; }
      return;
    }

    // Show/hide pattern (LeetCode)
    if (t.matches('.btn-pattern:not(.cf-pattern-btn)')) {
      const box = document.getElementById('pattern-'+t.dataset.id);
      if (box) { box.classList.toggle('hidden'); t.textContent = box.classList.contains('hidden')?'Show Pattern':'Hide Pattern'; }
      return;
    }

    // CF hint/pattern
    if (t.matches('.cf-hint-btn')) {
      const box = document.getElementById('cf-hint-'+t.dataset.id);
      if (box) { box.classList.toggle('hidden'); t.textContent = box.classList.contains('hidden')?'Show Hint':'Hide Hint'; }
      return;
    }
    if (t.matches('.cf-pattern-btn')) {
      const box = document.getElementById('cf-pattern-'+t.dataset.id);
      if (box) { box.classList.toggle('hidden'); t.textContent = box.classList.contains('hidden')?'Show Pattern':'Hide Pattern'; }
      return;
    }

    // Modal hint/pattern
    if (t.matches('.modal-hint-btn')) {
      const box = document.getElementById('modal-hint-'+t.dataset.id);
      if (box) { box.classList.toggle('hidden'); t.textContent = box.classList.contains('hidden')?'💡 Show Hint':'💡 Hide Hint'; }
      return;
    }
    if (t.matches('.modal-pattern-btn')) {
      const box = document.getElementById('modal-pattern-'+t.dataset.id);
      if (box) { box.classList.toggle('hidden'); t.textContent = box.classList.contains('hidden')?'🎯 Show Pattern':'🎯 Hide Pattern'; }
      return;
    }

    // Save note
    if (t.matches('.btn-save-note')) {
      const id = t.dataset.id;
      const el = document.querySelector(`.note-textarea[data-id="${id}"], .note-edit-area[data-id="${id}"], .note-input[data-id="${id}"]`);
      const st = loadState(); st.notes[id] = el ? el.value : '';
      save.notes(st.notes); flashSaved(t);
      return;
    }

    // Save CF note
    if (t.matches('.btn-save-cf-note')) {
      const id = t.dataset.id;
      const el = document.querySelector(`.cf-note-textarea[data-id="${id}"], .cf-note-input[data-id="${id}"]`);
      const st = loadState(); st.cfNotes[id] = el ? el.value : '';
      save.cfNotes(st.cfNotes); flashSaved(t);
      return;
    }

    // Delete note
    if (t.matches('.btn-delete-note')) {
      const id = t.dataset.id;
      const st = loadState(); delete st.notes[id];
      save.notes(st.notes); renderNotes(loadState());
      return;
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key==='Escape') closeModal();
    if (e.key==='Enter' && e.target.matches('.note-input')) {
      const id = e.target.dataset.id;
      const st = loadState(); st.notes[id] = e.target.value;
      save.notes(st.notes); flashSaved(e.target);
    }
    if (e.key==='Enter' && e.target.matches('.cf-note-input')) {
      const id = e.target.dataset.id;
      const st = loadState(); st.cfNotes[id] = e.target.value;
      save.cfNotes(st.cfNotes); flashSaved(e.target);
    }
  });

  function flashSaved(el) {
    const orig = el.textContent;
    el.textContent = '✓ Saved';
    el.classList.add('saved');
    setTimeout(()=>{ el.textContent=orig; el.classList.remove('saved'); }, 1500);
  }

  // ─── Boot ─────────────────────────────────────────────────────────────────
  function init() { switchView('dashboard'); }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();

})();
