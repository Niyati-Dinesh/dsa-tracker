/* ================================================================
   HR QUESTIONS & STAR STORY BANK ENGINE
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

let currentHRTab = "questions"; // "questions", "star-stories", "star-prompts"

function getHRAnswers() {
  return DB.get("hr_answers") || {};
}

function getHRCustomQuestions() {
  return DB.get("hr_custom_qs") || [];
}

function getAllHRQuestions() {
  const seed = (typeof HR_DATA !== "undefined" && HR_DATA.general_questions) ? HR_DATA.general_questions : [];
  const custom = getHRCustomQuestions();
  return [...seed, ...custom];
}

function getStarStories() {
  const stored = DB.get("star_stories");
  if (stored && Array.isArray(stored)) return stored;
  const seed = (typeof HR_DATA !== "undefined" && HR_DATA.star_stories) ? HR_DATA.star_stories : [];
  return seed;
}

function getStarPromptAnswers() {
  return DB.get("star_prompt_answers") || {};
}

function buildHRView(tab = currentHRTab) {
  currentHRTab = tab;
  const container = document.getElementById("view-hr");
  if (!container) return;

  const allQs = getAllHRQuestions();
  const answers = getHRAnswers();
  const stories = getStarStories();

  let answeredCount = 0;
  let strongCount = 0;
  let practicedCount = 0;

  allQs.forEach(q => {
    const a = answers[q.id];
    const status = a?.status || q.status || "unanswered";
    if (status === "strong") { strongCount++; answeredCount++; }
    else if (status === "practiced") { practicedCount++; answeredCount++; }
    else if (status === "draft") { answeredCount++; }
  });

  const completionPct = allQs.length ? Math.round((answeredCount / allQs.length) * 100) : 0;

  container.innerHTML = `
    <div class="hr-container">
      <!-- Header -->
      <div class="hr-header">
        <div>
          <div class="hr-title">behavioral &amp; hr interview prep</div>
          <div class="hr-subtitle">Master classic HR questions, behavioral scenarios, and your reusable STAR story bank.</div>
        </div>
        <div style="display:flex;gap:8px">
          ${currentHRTab === "questions" ? `
            <button class="hr-btn hr-btn-primary" onclick="openAddHRQuestionModal()">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span>Add Custom HR Question</span>
            </button>
          ` : `
            <button class="hr-btn hr-btn-gold" onclick="openAddStarStoryModal()">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span>Create New STAR Story</span>
            </button>
          `}
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="hr-tabs">
        <button class="hr-tab-btn ${currentHRTab === 'questions' ? 'active' : ''}" onclick="buildHRView('questions')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <span>HR Questions (${allQs.length})</span>
        </button>
        <button class="hr-tab-btn ${currentHRTab === 'star-stories' ? 'active' : ''}" onclick="buildHRView('star-stories')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          <span>STAR Story Bank (${stories.length})</span>
        </button>
        <button class="hr-tab-btn ${currentHRTab === 'star-prompts' ? 'active' : ''}" onclick="buildHRView('star-prompts')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span>20 Behavioral Prompts</span>
        </button>
      </div>

      <!-- Stats Grid -->
      <div class="hr-stats-grid">
        <div class="hr-stat-card">
          <div class="hr-stat-num">${allQs.length}</div>
          <div class="hr-stat-label">Total Questions</div>
        </div>
        <div class="hr-stat-card">
          <div class="hr-stat-num" style="color:#4ade80">${strongCount}</div>
          <div class="hr-stat-label">Strong Answers</div>
        </div>
        <div class="hr-stat-card">
          <div class="hr-stat-num" style="color:#38bdf8">${practicedCount}</div>
          <div class="hr-stat-label">Practiced</div>
        </div>
        <div class="hr-stat-card">
          <div class="hr-stat-num" style="color:var(--star-gold)">${stories.length}</div>
          <div class="hr-stat-label">STAR Stories</div>
        </div>
        <div class="hr-stat-card">
          <div class="hr-stat-num" style="color:var(--hr-purple)">${completionPct}%</div>
          <div class="hr-stat-label">Progress</div>
        </div>
      </div>

      <!-- Tab Content Area -->
      <div id="hr-tab-content"></div>
    </div>
  `;

  if (currentHRTab === "questions") renderHRQuestions();
  else if (currentHRTab === "star-stories") renderStarStories();
  else if (currentHRTab === "star-prompts") renderStarPrompts();
}

function renderHRQuestions() {
  const content = document.getElementById("hr-tab-content");
  if (!content) return;

  const allQs = getAllHRQuestions();
  const categories = ["all", ...new Set(allQs.map(q => q.category).filter(Boolean))];

  const catOptions = categories.map(c => `<option value="${escHtml(c)}">${escHtml(c === 'all' ? 'All Categories' : c)}</option>`).join("");

  content.innerHTML = `
    <div class="hr-toolbar">
      <div class="hr-toolbar-left">
        <input type="text" class="hr-search-input" id="hr-q-search" placeholder="Search questions, answers, notes..." oninput="filterHRQuestions()">
        <select class="hr-select" id="hr-q-cat-filter" onchange="filterHRQuestions()">
          ${catOptions}
        </select>
        <select class="hr-select" id="hr-q-status-filter" onchange="filterHRQuestions()">
          <option value="all">All Statuses</option>
          <option value="unanswered">Unanswered</option>
          <option value="draft">Draft</option>
          <option value="practiced">Practiced</option>
          <option value="strong">Strong</option>
        </select>
      </div>
    </div>

    <div id="hr-questions-list" style="display:flex;flex-direction:column;gap:12px"></div>
  `;

  renderHRQuestionRows(allQs);
}

function renderHRQuestionRows(questions) {
  const container = document.getElementById("hr-questions-list");
  if (!container) return;

  const answers = getHRAnswers();
  const stories = getStarStories();

  if (!questions.length) {
    container.innerHTML = `<div style="padding:40px;text-align:center;color:var(--muted)">No HR questions matched your search or filters.</div>`;
    return;
  }

  const html = questions.map((q) => {
    const saved = answers[q.id] || {};
    const ansText = saved.answer !== undefined ? saved.answer : (q.your_answer || "");
    const noteText = saved.notes !== undefined ? saved.notes : (q.notes || "");
    const status = saved.status || q.status || "unanswered";
    const linkedStoryId = saved.linkedStoryId || "";

    const storyOpts = [`<option value="">-- No Linked STAR Story --</option>`]
      .concat(stories.map(s => `<option value="${escHtml(s.id)}" ${linkedStoryId === s.id ? 'selected' : ''}>${escHtml(s.title)}</option>`))
      .join("");

    return `
      <div class="hr-q-card" id="hr-card-${q.id}" data-text="${escHtml((q.question + ' ' + (q.category || '') + ' ' + ansText + ' ' + noteText).toLowerCase())}" data-cat="${escHtml(q.category || '')}" data-status="${status}">
        <div class="hr-q-header">
          <div class="hr-q-meta">
            <span class="hr-q-id">${escHtml(q.id)}</span>
            <span class="hr-pill">${escHtml(q.category || "General")}</span>
            <div class="hr-status-pill ${status}" onclick="cycleHRQuestionStatus('${q.id}')" title="Click to cycle status">
              <span>●</span> <span>${status}</span>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <button class="hr-btn" style="padding:3px 8px;font-size:11px" onclick="editHRQuestion('${q.id}')" title="Edit Question">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </button>
            ${q.isCustom ? `
              <button class="hr-btn" style="padding:3px 8px;font-size:11px;color:#f87171" onclick="deleteHRQuestion('${q.id}')" title="Delete Question">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            ` : ''}
          </div>
        </div>

        <div class="hr-q-text">${escHtml(q.question)}</div>

        ${noteText ? `
          <div class="hr-notes-box" style="margin-bottom:10px">
            <strong style="color:var(--text)">Framework / Tip:</strong> ${escHtml(noteText)}
          </div>
        ` : ''}

        <div class="hr-q-body">
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
              <label class="modal-section-label" style="margin:0">My Formulated Answer</label>
              <span style="font-family:var(--mono);font-size:10.5px;color:var(--muted)" id="hr-save-indicator-${q.id}">Auto-saved</span>
            </div>
            <textarea class="hr-answer-textarea" id="hr-ans-${q.id}" placeholder="Draft your concrete answer here with specific anecdotes and metrics..." oninput="saveHRAnswer('${q.id}')">${escHtml(ansText)}</textarea>
          </div>

          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
            <div style="display:flex;align-items:center;gap:8px;flex:1">
              <span style="font-family:var(--mono);font-size:11px;color:var(--muted)">Link Reusable STAR Story:</span>
              <select class="hr-select" style="max-width:320px" onchange="linkStarStoryToHR('${q.id}', this.value)">
                ${storyOpts}
              </select>
            </div>

            <div style="display:flex;align-items:center;gap:6px">
              <button class="hr-btn" onclick="cycleHRQuestionStatus('${q.id}')">
                <span>Mark Status</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = html;
}

function filterHRQuestions() {
  const query = (document.getElementById("hr-q-search")?.value || "").toLowerCase().trim();
  const cat = document.getElementById("hr-q-cat-filter")?.value || "all";
  const status = document.getElementById("hr-q-status-filter")?.value || "all";

  const cards = document.querySelectorAll("#hr-questions-list .hr-q-card");
  cards.forEach(c => {
    const text = c.getAttribute("data-text") || "";
    const cCat = c.getAttribute("data-cat") || "";
    const cStatus = c.getAttribute("data-status") || "";

    const matchesQuery = !query || text.includes(query);
    const matchesCat = (cat === "all") || (cCat === cat);
    const matchesStatus = (status === "all") || (cStatus === status);

    c.style.display = (matchesQuery && matchesCat && matchesStatus) ? "block" : "none";
  });
}

let hrSaveDebounce = {};
function saveHRAnswer(qId) {
  clearTimeout(hrSaveDebounce[qId]);
  const indicator = document.getElementById(`hr-save-indicator-${qId}`);
  if (indicator) indicator.textContent = "Saving...";

  hrSaveDebounce[qId] = setTimeout(() => {
    const text = document.getElementById(`hr-ans-${qId}`)?.value || "";
    const answers = getHRAnswers();
    if (!answers[qId]) answers[qId] = { status: "draft" };
    answers[qId].answer = text;
    if (text.trim().length > 20 && (!answers[qId].status || answers[qId].status === "unanswered")) {
      answers[qId].status = "draft";
    }
    DB.set("hr_answers", answers);
    if (typeof syncAfterChange === "function") syncAfterChange();

    if (indicator) indicator.textContent = "Saved";
  }, 400);
}

function cycleHRQuestionStatus(qId) {
  const answers = getHRAnswers();
  const statuses = ["unanswered", "draft", "practiced", "strong"];
  const current = answers[qId]?.status || "unanswered";
  const nextIdx = (statuses.indexOf(current) + 1) % statuses.length;
  const next = statuses[nextIdx];

  if (!answers[qId]) answers[qId] = {};
  answers[qId].status = next;
  DB.set("hr_answers", answers);
  if (typeof syncAfterChange === "function") syncAfterChange();

  const card = document.getElementById(`hr-card-${qId}`);
  if (card) {
    card.setAttribute("data-status", next);
    const pill = card.querySelector(".hr-status-pill");
    if (pill) {
      pill.className = `hr-status-pill ${next}`;
      pill.innerHTML = `<span>●</span> <span>${next}</span>`;
    }
  }
}

function linkStarStoryToHR(qId, storyId) {
  const answers = getHRAnswers();
  if (!answers[qId]) answers[qId] = {};
  answers[qId].linkedStoryId = storyId;
  DB.set("hr_answers", answers);
  if (typeof syncAfterChange === "function") syncAfterChange();
}

function renderStarStories() {
  const content = document.getElementById("hr-tab-content");
  if (!content) return;

  const stories = getStarStories();
  const allCompetencies = ["all", ...new Set(stories.flatMap(s => s.competencies || []).filter(Boolean))];

  const compOpts = allCompetencies.map(c => `<option value="${escHtml(c)}">${escHtml(c === 'all' ? 'All Competencies' : c)}</option>`).join("");

  content.innerHTML = `
    <div class="hr-toolbar">
      <div class="hr-toolbar-left">
        <input type="text" class="hr-search-input" id="star-search" placeholder="Search situation, action, result, tags..." oninput="filterStarStories()">
        <select class="hr-select" id="star-comp-filter" onchange="filterStarStories()">
          ${compOpts}
        </select>
        <select class="hr-select" id="star-conf-filter" onchange="filterStarStories()">
          <option value="all">All Confidence Levels</option>
          <option value="High">High Confidence</option>
          <option value="Medium">Medium</option>
          <option value="Low">Needs Practice</option>
        </select>
      </div>
      <button class="hr-btn hr-btn-gold" onclick="openAddStarStoryModal()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        <span>New STAR Story</span>
      </button>
    </div>

    <div id="star-stories-list"></div>
  `;

  renderStarStoryCards(stories);
}

function renderStarStoryCards(stories) {
  const container = document.getElementById("star-stories-list");
  if (!container) return;

  if (!stories.length) {
    container.innerHTML = `
      <div style="padding:40px;text-align:center;color:var(--muted);background:var(--bg2);border:1px dashed var(--line);border-radius:var(--radius-lg)">
        <div style="font-size:15px;margin-bottom:8px;color:var(--text)">No STAR stories created yet.</div>
        <div style="font-size:12.5px;margin-bottom:16px">Build concrete Situation-Task-Action-Result stories to ace Amazon Leadership Principles and Google interviews.</div>
        <button class="hr-btn hr-btn-gold" onclick="openAddStarStoryModal()">Create Your First STAR Story</button>
      </div>
    `;
    return;
  }

  const html = stories.map(s => {
    const comps = (s.competencies || []).map(c => `<span class="hr-pill" style="color:var(--star-gold);border-color:rgba(251,191,36,0.3)">${escHtml(c)}</span>`).join("");
    const companies = (s.companies || []).map(c => `<span class="hr-pill" style="color:var(--text)">${escHtml(c)}</span>`).join("");
    const tags = (s.tags || []).map(t => `<span class="hr-pill" style="color:var(--muted)">#${escHtml(t)}</span>`).join("");
    const lastPracticedStr = s.lastPracticed ? new Date(s.lastPracticed).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Never";

    return `
      <div class="star-card" id="star-card-${s.id}" data-text="${escHtml((s.title + ' ' + (s.situation || '') + ' ' + (s.task || '') + ' ' + (s.action || '') + ' ' + (s.result || '') + ' ' + (s.notes || '') + ' ' + (s.competencies || []).join(' ')).toLowerCase())}" data-comp="${escHtml((s.competencies || []).join(','))}" data-conf="${escHtml(s.confidence || 'Medium')}">
        <div class="star-card-header">
          <div>
            <div class="star-card-title">${escHtml(s.title)}</div>
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:6px">
              ${comps}
              ${companies}
              ${tags}
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="star-confidence ${escHtml(s.confidence || 'Medium')}">${escHtml(s.confidence || 'Medium')}</span>
            <button class="hr-btn" style="padding:4px 8px;font-size:11.5px" onclick="copyStarStory('${s.id}')" title="Copy formatted story">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span>Copy</span>
            </button>
            <button class="hr-btn" style="padding:4px 8px;font-size:11.5px" onclick="editStarStory('${s.id}')" title="Edit story">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </button>
            <button class="hr-btn" style="padding:4px 8px;font-size:11.5px;color:#f87171" onclick="deleteStarStory('${s.id}')" title="Delete story">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        <div class="star-grid">
          <div class="star-section">
            <div class="star-section-label star-label-s">
              <span>●</span> Situation (Context &amp; Challenge)
            </div>
            <div class="star-section-text">${escHtml(s.situation || "No situation documented.")}</div>
          </div>

          <div class="star-section">
            <div class="star-section-label star-label-t">
              <span>●</span> Task (My Responsibility &amp; Goal)
            </div>
            <div class="star-section-text">${escHtml(s.task || "No task documented.")}</div>
          </div>

          <div class="star-section">
            <div class="star-section-label star-label-a">
              <span>●</span> Action (Specific Steps Taken)
            </div>
            <div class="star-section-text">${escHtml(s.action || "No action documented.")}</div>
          </div>

          <div class="star-section">
            <div class="star-section-label star-label-r">
              <span>●</span> Result (Measurable Metrics &amp; Impact)
            </div>
            <div class="star-section-text">${escHtml(s.result || "No result documented.")}</div>
          </div>
        </div>

        ${s.notes ? `
          <div class="hr-notes-box" style="margin-top:8px">
            <strong style="color:var(--text)">Interview Delivery Notes:</strong> ${escHtml(s.notes)}
          </div>
        ` : ''}

        <div class="star-footer">
          <div style="font-family:var(--mono);font-size:11px;color:var(--muted)">
            Last Practiced: <span style="color:var(--text)">${lastPracticedStr}</span>
          </div>
          <button class="hr-btn" style="padding:3px 10px;font-size:11px" onclick="markStoryPracticed('${s.id}')">
            Mark Practiced Today
          </button>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = html;
}

function filterStarStories() {
  const query = (document.getElementById("star-search")?.value || "").toLowerCase().trim();
  const comp = document.getElementById("star-comp-filter")?.value || "all";
  const conf = document.getElementById("star-conf-filter")?.value || "all";

  const cards = document.querySelectorAll("#star-stories-list .star-card");
  cards.forEach(c => {
    const text = c.getAttribute("data-text") || "";
    const cComp = c.getAttribute("data-comp") || "";
    const cConf = c.getAttribute("data-conf") || "";

    const matchesQuery = !query || text.includes(query);
    const matchesComp = (comp === "all") || cComp.includes(comp);
    const matchesConf = (conf === "all") || (cConf === conf);

    c.style.display = (matchesQuery && matchesComp && matchesConf) ? "block" : "none";
  });
}

function copyStarStory(storyId) {
  const stories = getStarStories();
  const s = stories.find(item => item.id === storyId);
  if (!s) return;

  const formatted = `=== ${s.title} ===\n\n[SITUATION]\n${s.situation}\n\n[TASK]\n${s.task}\n\n[ACTION]\n${s.action}\n\n[RESULT]\n${s.result}\n\n[COMPETENCIES]: ${(s.competencies || []).join(", ")}\n[COMPANIES]: ${(s.companies || []).join(", ")}`;

  navigator.clipboard.writeText(formatted).then(() => {
    alert("STAR story formatted summary copied to clipboard!");
  }).catch(() => {
    alert("Copied!");
  });
}

function markStoryPracticed(storyId) {
  const stories = getStarStories();
  const s = stories.find(item => item.id === storyId);
  if (!s) return;

  s.lastPracticed = Date.now();
  DB.set("star_stories", stories);
  if (typeof syncAfterChange === "function") syncAfterChange();
  renderStarStories();
}

function renderStarPrompts() {
  const content = document.getElementById("hr-tab-content");
  if (!content) return;

  const prompts = (typeof HR_DATA !== "undefined" && HR_DATA.star_questions) ? HR_DATA.star_questions : [];
  const pAnswers = getStarPromptAnswers();

  const html = prompts.map((p) => {
    const saved = pAnswers[p.id] || p.star_answer || {};
    const sit = saved.situation || "";
    const tsk = saved.task || "";
    const act = saved.action || "";
    const res = saved.result || "";

    return `
      <div class="hr-q-card" style="margin-bottom:18px">
        <div class="hr-q-header">
          <div class="hr-q-meta">
            <span class="hr-q-id">${escHtml(p.id)}</span>
            <span class="hr-pill" style="color:var(--star-gold)">${escHtml(p.company || "General")}</span>
            ${(p.tags || []).map(t => `<span class="hr-pill" style="color:var(--muted)">${escHtml(t)}</span>`).join("")}
          </div>
        </div>

        <div class="hr-q-text">${escHtml(p.question)}</div>

        <div class="star-grid" style="margin-top:10px">
          <div>
            <div class="star-section-label star-label-s">Situation</div>
            <textarea class="hr-answer-textarea" id="star-prompt-s-${p.id}" placeholder="What was the background context?" oninput="saveStarPromptAnswer('${p.id}')">${escHtml(sit)}</textarea>
          </div>
          <div>
            <div class="star-section-label star-label-t">Task</div>
            <textarea class="hr-answer-textarea" id="star-prompt-t-${p.id}" placeholder="What was required of you?" oninput="saveStarPromptAnswer('${p.id}')">${escHtml(tsk)}</textarea>
          </div>
          <div>
            <div class="star-section-label star-label-a">Action</div>
            <textarea class="hr-answer-textarea" id="star-prompt-a-${p.id}" placeholder="What specific steps did you take?" oninput="saveStarPromptAnswer('${p.id}')">${escHtml(act)}</textarea>
          </div>
          <div>
            <div class="star-section-label star-label-r">Result</div>
            <textarea class="hr-answer-textarea" id="star-prompt-r-${p.id}" placeholder="What was the measurable outcome?" oninput="saveStarPromptAnswer('${p.id}')">${escHtml(res)}</textarea>
          </div>
        </div>
      </div>
    `;
  }).join("");

  content.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <div style="font-size:13px;color:var(--mid)">20 Curated Behavioral Prompts from Top Tech Companies (Amazon LPs, Google, Microsoft, Meta)</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px">${html}</div>
  `;
}

let promptSaveDebounce = {};
function saveStarPromptAnswer(pId) {
  clearTimeout(promptSaveDebounce[pId]);
  promptSaveDebounce[pId] = setTimeout(() => {
    const s = document.getElementById(`star-prompt-s-${pId}`)?.value || "";
    const t = document.getElementById(`star-prompt-t-${pId}`)?.value || "";
    const a = document.getElementById(`star-prompt-a-${pId}`)?.value || "";
    const r = document.getElementById(`star-prompt-r-${pId}`)?.value || "";

    const pAnswers = getStarPromptAnswers();
    pAnswers[pId] = { situation: s, task: t, action: a, result: r };
    DB.set("star_prompt_answers", pAnswers);
    if (typeof syncAfterChange === "function") syncAfterChange();
  }, 400);
}

function openAddHRQuestionModal(editingQuestion = null) {
  const modalHtml = `
    <div class="apt-modal-overlay" id="hr-q-modal" onclick="closeHRModal(event, 'hr-q-modal')">
      <div class="apt-modal-card" style="max-width:540px" onclick="event.stopPropagation()">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <div style="font-family:var(--serif);font-size:22px;font-weight:400;color:var(--text)">${editingQuestion ? 'Edit HR Question' : 'Add Custom HR Question'}</div>
          <button class="modal-close" onclick="closeHRModalDirect('hr-q-modal')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <input type="hidden" id="hr-modal-id" value="${editingQuestion ? editingQuestion.id : ''}">

        <div style="display:flex;flex-direction:column;gap:12px">
          <div>
            <label class="modal-section-label">Category</label>
            <input type="text" class="hr-search-input" id="hr-modal-cat" style="width:100%" placeholder="e.g. Leadership, Culture fit, Technical Delivery" value="${editingQuestion ? escHtml(editingQuestion.category || '') : ''}">
          </div>

          <div>
            <label class="modal-section-label">Question Text</label>
            <textarea class="hr-answer-textarea" id="hr-modal-qtext" style="min-height:70px" placeholder="Enter HR / Behavioral question...">${editingQuestion ? escHtml(editingQuestion.question || '') : ''}</textarea>
          </div>

          <div>
            <label class="modal-section-label">Framework / Strategy Notes (Optional)</label>
            <input type="text" class="hr-search-input" id="hr-modal-notes" style="width:100%" placeholder="e.g. Focus on metrics, stay humble, highlight ownership" value="${editingQuestion ? escHtml(editingQuestion.notes || '') : ''}">
          </div>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px">
          <button class="hr-btn" onclick="closeHRModalDirect('hr-q-modal')">Cancel</button>
          <button class="hr-btn hr-btn-primary" onclick="saveHRQuestionModal()">Save Question</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("hr-q-modal")?.remove();
  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

function saveHRQuestionModal() {
  const id = document.getElementById("hr-modal-id")?.value;
  const cat = document.getElementById("hr-modal-cat")?.value.trim() || "General";
  const qtext = document.getElementById("hr-modal-qtext")?.value.trim();
  const notes = document.getElementById("hr-modal-notes")?.value.trim();

  if (!qtext) {
    alert("Please enter question text.");
    return;
  }

  const custom = getHRCustomQuestions();

  if (id) {
    const existing = custom.find(q => q.id === id);
    if (existing) {
      existing.category = cat;
      existing.question = qtext;
      existing.notes = notes;
    }
  } else {
    const newId = `HR-CUST-${Date.now().toString().slice(-4)}`;
    custom.push({
      id: newId,
      question: qtext,
      category: cat,
      notes: notes,
      status: "unanswered",
      isCustom: true
    });
  }

  DB.set("hr_custom_qs", custom);
  if (typeof syncAfterChange === "function") syncAfterChange();
  closeHRModalDirect("hr-q-modal");
  renderHRQuestions();
}

function editHRQuestion(qId) {
  const allQs = getAllHRQuestions();
  const q = allQs.find(item => item.id === qId);
  if (q) openAddHRQuestionModal(q);
}

function deleteHRQuestion(qId) {
  if (!confirm("Are you sure you want to delete this custom HR question?")) return;
  let custom = getHRCustomQuestions();
  custom = custom.filter(q => q.id !== qId);
  DB.set("hr_custom_qs", custom);
  if (typeof syncAfterChange === "function") syncAfterChange();
  renderHRQuestions();
}

function openAddStarStoryModal(editingStory = null) {
  const modalHtml = `
    <div class="apt-modal-overlay" id="star-modal" onclick="closeHRModal(event, 'star-modal')">
      <div class="apt-modal-card" style="max-width:640px" onclick="event.stopPropagation()">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <div style="font-family:var(--serif);font-size:22px;font-weight:400;color:var(--text)">${editingStory ? 'Edit STAR Story' : 'Create New STAR Story'}</div>
          <button class="modal-close" onclick="closeHRModalDirect('star-modal')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <input type="hidden" id="star-modal-id" value="${editingStory ? editingStory.id : ''}">

        <div style="display:flex;flex-direction:column;gap:12px;max-height:68vh;overflow-y:auto;padding-right:4px">
          <div>
            <label class="modal-section-label">Story Headline / Title</label>
            <input type="text" class="hr-search-input" id="star-modal-title" style="width:100%" placeholder="e.g. Scaling Database Read Replicas under 100k QPS" value="${editingStory ? escHtml(editingStory.title || '') : ''}">
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div>
              <label class="modal-section-label">Target Companies (comma-separated)</label>
              <input type="text" class="hr-search-input" id="star-modal-companies" style="width:100%" placeholder="Amazon, Google, Meta" value="${editingStory && editingStory.companies ? escHtml(editingStory.companies.join(', ')) : ''}">
            </div>
            <div>
              <label class="modal-section-label">Confidence Level</label>
              <select class="hr-select" id="star-modal-conf" style="width:100%">
                <option value="High" ${editingStory && editingStory.confidence === 'High' ? 'selected' : ''}>High Confidence</option>
                <option value="Medium" ${!editingStory || editingStory.confidence === 'Medium' ? 'selected' : ''}>Medium</option>
                <option value="Low" ${editingStory && editingStory.confidence === 'Low' ? 'selected' : ''}>Needs Practice</option>
              </select>
            </div>
          </div>

          <div>
            <label class="modal-section-label">Competencies / Leadership Principles (comma-separated)</label>
            <input type="text" class="hr-search-input" id="star-modal-comps" style="width:100%" placeholder="Ownership, Dive Deep, Customer Obsession, Conflict Resolution" value="${editingStory && editingStory.competencies ? escHtml(editingStory.competencies.join(', ')) : ''}">
          </div>

          <div>
            <label class="modal-section-label star-label-s">1. Situation (The Context &amp; High-Stakes Challenge)</label>
            <textarea class="hr-answer-textarea" id="star-modal-s" style="min-height:70px" placeholder="Describe the background, team context, and specific bottleneck...">${editingStory ? escHtml(editingStory.situation || '') : ''}</textarea>
          </div>

          <div>
            <label class="modal-section-label star-label-t">2. Task (My Direct Responsibility &amp; Target Goal)</label>
            <textarea class="hr-answer-textarea" id="star-modal-t" style="min-height:70px" placeholder="What was expected of you specifically?">${editingStory ? escHtml(editingStory.task || '') : ''}</textarea>
          </div>

          <div>
            <label class="modal-section-label star-label-a">3. Action (Concrete Technical Steps &amp; Initiatives I Took)</label>
            <textarea class="hr-answer-textarea" id="star-modal-a" style="min-height:85px" placeholder="Use 'I' instead of 'We'. Highlight architectural choices, micro-benchmarks, trade-off evaluations...">${editingStory ? escHtml(editingStory.action || '') : ''}</textarea>
          </div>

          <div>
            <label class="modal-section-label star-label-r">4. Result (Quantified Metrics &amp; Key Takeaways)</label>
            <textarea class="hr-answer-textarea" id="star-modal-r" style="min-height:75px" placeholder="Quantify outcome (e.g. latency dropped by 65%, zero downtime)...">${editingStory ? escHtml(editingStory.result || '') : ''}</textarea>
          </div>

          <div>
            <label class="modal-section-label">Delivery Notes / Counter-Question Preparation</label>
            <input type="text" class="hr-search-input" id="star-modal-notes" style="width:100%" placeholder="e.g. Be ready to explain Cassandra tombstone behavior if asked" value="${editingStory ? escHtml(editingStory.notes || '') : ''}">
          </div>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:18px;border-top:1px solid var(--line);padding-top:14px">
          <button class="hr-btn" onclick="closeHRModalDirect('star-modal')">Cancel</button>
          <button class="hr-btn hr-btn-gold" onclick="saveStarStoryModal()">Save STAR Story</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("star-modal")?.remove();
  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

function saveStarStoryModal() {
  const id = document.getElementById("star-modal-id")?.value;
  const title = document.getElementById("star-modal-title")?.value.trim();
  const companiesStr = document.getElementById("star-modal-companies")?.value.trim() || "";
  const conf = document.getElementById("star-modal-conf")?.value || "Medium";
  const compsStr = document.getElementById("star-modal-comps")?.value.trim() || "";
  const s = document.getElementById("star-modal-s")?.value.trim();
  const t = document.getElementById("star-modal-t")?.value.trim();
  const a = document.getElementById("star-modal-a")?.value.trim();
  const r = document.getElementById("star-modal-r")?.value.trim();
  const notes = document.getElementById("star-modal-notes")?.value.trim();

  if (!title) {
    alert("Please provide a story title.");
    return;
  }

  const stories = getStarStories();
  const comps = compsStr ? compsStr.split(",").map(c => c.trim()).filter(Boolean) : [];
  const companies = companiesStr ? companiesStr.split(",").map(c => c.trim()).filter(Boolean) : [];

  if (id) {
    const existing = stories.find(item => item.id === id);
    if (existing) {
      existing.title = title;
      existing.companies = companies;
      existing.confidence = conf;
      existing.competencies = comps;
      existing.situation = s;
      existing.task = t;
      existing.action = a;
      existing.result = r;
      existing.notes = notes;
    }
  } else {
    stories.unshift({
      id: `STORY-${Date.now().toString().slice(-4)}`,
      title,
      companies,
      confidence: conf,
      competencies: comps,
      situation: s,
      task: t,
      action: a,
      result: r,
      notes,
      tags: comps.map(c => c.toLowerCase().replace(/\s+/g, "-")),
      lastPracticed: Date.now()
    });
  }

  DB.set("star_stories", stories);
  if (typeof syncAfterChange === "function") syncAfterChange();
  closeHRModalDirect("star-modal");
  renderStarStories();
}

function editStarStory(storyId) {
  const stories = getStarStories();
  const s = stories.find(item => item.id === storyId);
  if (s) openAddStarStoryModal(s);
}

function deleteStarStory(storyId) {
  if (!confirm("Are you sure you want to delete this STAR story?")) return;
  let stories = getStarStories();
  stories = stories.filter(s => s.id !== storyId);
  DB.set("star_stories", stories);
  if (typeof syncAfterChange === "function") syncAfterChange();
  renderStarStories();
}

function closeHRModal(e, id) {
  if (e.target.id === id) closeHRModalDirect(id);
}

function closeHRModalDirect(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}
