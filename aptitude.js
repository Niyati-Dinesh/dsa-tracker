/**
 * Aptitude Module Engine — Orbit Studio & Tracker
 * Features:
 *  - 45 Topic Dashboard with status management (not started, learning, covered, mastered)
 *  - Comprehensive MCQ Practice Engine with filters, timer modes & KaTeX formula rendering
 *  - Full Question CRUD Manager (+ Add Question, edit, duplicate, delete) persisting to Firebase
 *  - Interactive Formula & Tricks Handbook with per-topic editable notes
 */

let currentAptitudeTab = "dashboard";
let currentAptitudeSession = null;
let currentHandbookTopicId = 1;

/* ── KaTeX Math Formatter Helper ── */
function preprocessAptMath(math) {
  if (!math) return "";
  return math
    .replace(/(^|[^\w\d\}])\^([a-zA-Z0-9]+)\s*([CP])/g, (m, p1, p2, p3) => `${p1}{}^{${p2}}${p3}`)
    .replace(/(^|[^\w\d\}])\^\{([^}]+)\}\s*([CP])/g, (m, p1, p2, p3) => `${p1}{}^{${p2}}${p3}`);
}

function fallbackAptMath(math) {
  return escHtml(math)
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '<span style="display:inline-block;vertical-align:middle;text-align:center;font-size:0.9em;margin:0 2px;"><span style="display:block;border-bottom:1px solid currentColor;padding:0 2px;">$1</span><span style="display:block;padding:0 2px;">$2</span></span>')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\\pm/g, '±')
    .replace(/\\ge/g, '≥')
    .replace(/\\le/g, '≤')
    .replace(/\\neq/g, '≠')
    .replace(/\\approx/g, '≈')
    .replace(/\\quad/g, ' ')
    .replace(/\^([0-9a-zA-Z]+)/g, '<sup>$1</sup>')
    .replace(/_([0-9a-zA-Z]+)/g, '<sub>$1</sub>');
}

function tryRenderKatex(mathStr, displayMode = false) {
  if (typeof katex !== "undefined" && typeof katex.renderToString === "function") {
    try {
      const clean = preprocessAptMath(mathStr.trim());
      return katex.renderToString(clean, { displayMode, throwOnError: false });
    } catch (e) {
      console.warn("KaTeX render error:", e);
    }
  }
  return fallbackAptMath(mathStr);
}

function formatAptMath(text) {
  if (!text) return "";
  const str = String(text).trim();

  // 1. Explicit display math $$ ... $$
  if (str.includes("$$")) {
    return str.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => tryRenderKatex(math, true));
  }

  // 2. Explicit inline math $ ... $
  if (str.includes("$")) {
    return str.replace(/\$([^\$\n]+?)\$/g, (_, math) => tryRenderKatex(math, false));
  }

  // 3. Pure math formulas (starts with backslash or standard math operators)
  const isPureFormula = (
    str.startsWith("\\") ||
    str.startsWith("P(") ||
    str.startsWith("AM ") ||
    str.startsWith("SP =") ||
    str.startsWith("CP =") ||
    str.startsWith("0.\\overline") ||
    str.startsWith("0.ab") ||
    str.startsWith("a^") ||
    str.startsWith("a_") ||
    str.startsWith("x^") ||
    str.startsWith("ax^") ||
    str.startsWith("S_n") ||
    str.startsWith("HM") ||
    str.startsWith("GM") ||
    str.startsWith("n(A") ||
    str.startsWith("N =") ||
    str.startsWith("T =") ||
    str.startsWith("x\\%") ||
    str.startsWith("\\%") ||
    str.includes("\\frac") ||
    str.includes("\\sum") ||
    str.includes("\\prod") ||
    str.includes("\\sqrt") ||
    str.includes("\\log") ||
    str.includes("\\tan") ||
    str.includes("\\sin") ||
    str.includes("\\cos") ||
    str.includes("\\text{") ||
    str.includes("\\times") ||
    str.includes("\\cdot") ||
    str.includes("\\pmod") ||
    str.includes("\\equiv")
  );

  if (isPureFormula) {
    return tryRenderKatex(str, false);
  }

  // 4. Strings with embedded LaTeX tokens like \sqrt{N}, \frac{a}{b}, \log_{10} 2, etc.
  if (str.includes("\\")) {
    return str.replace(/(\\[a-zA-Z]+(?:\{[^}]*\}|\[[^\]]*\])*(?:_\w+|\^\w+)*)/g, (match) => {
      return tryRenderKatex(match, false);
    });
  }

  return escHtml(str);
}

/* ── Data Access Helpers ── */
function getAllAptitudeQuestions() {
  const custom = DB.get("aptitude_qs") || [];
  let all = [];
  if (typeof APTITUDE_DATA !== "undefined" && APTITUDE_DATA.topics) {
    Object.entries(APTITUDE_DATA.topics).forEach(([topicTitle, qList]) => {
      if (Array.isArray(qList)) {
        qList.forEach(q => all.push({ ...q, topic: topicTitle }));
      }
    });
  }
  // Append custom user questions
  custom.forEach(q => {
    if (q && q.id) all.push({ ...q, isCustom: true });
  });
  return all;
}

function getAptitudeResults() {
  return DB.get("aptitude") || {};
}

function getAptitudeTopicStatuses() {
  return DB.get("aptitude_topic_status") || {};
}

function setAptitudeTopicStatus(topicTitle, status) {
  const statuses = getAptitudeTopicStatuses();
  statuses[topicTitle] = status;
  DB.set("aptitude_topic_status", statuses);
  if (typeof syncAfterChange === "function") syncAfterChange();
  if (currentAptitudeTab === "dashboard") renderAptitudeDashboard();
}

function cycleTopicStatus(topicTitle, event) {
  if (event) event.stopPropagation();
  const statuses = ["not started", "learning", "covered", "mastered"];
  const current = getAptitudeTopicStatuses()[topicTitle] || "not started";
  const next = statuses[(statuses.indexOf(current) + 1) % statuses.length];
  setAptitudeTopicStatus(topicTitle, next);
}

let currentPracticeTopicId = 1;
let shuffledBankSeed = null;

/* ── Main View Entry Point ── */
function buildAptitudeView(tab = "dashboard", param = null) {
  const container = document.getElementById("aptitude-view-inner");
  if (!container) return;

  currentAptitudeTab = tab;

  container.innerHTML = `
    <div class="apt-container">
      <!-- Header -->
      <div class="apt-header">
        <div class="apt-title-group">
          <div class="dayplan-title">aptitude mastery</div>
          <div class="dayplan-sub">quantitative aptitude question bank, formula handbook &amp; timed mcq engine</div>
        </div>
        <div class="apt-header-actions">
          <button class="apt-btn apt-btn-primary" onclick="openPracticeSetupModal()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            <span>Start Timed Mock</span>
          </button>
          <button class="apt-btn" onclick="buildAptitudeView('handbook')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            <span>Formulas &amp; Tricks</span>
          </button>
          <button class="apt-btn" onclick="openAddQuestionModal()">
            <span>+ Add Question</span>
          </button>
        </div>
      </div>

      <!-- Navigation Toolbar -->
      <div class="apt-toolbar">
        <div class="apt-tabs">
          <button class="apt-tab-btn ${tab === 'dashboard' ? 'active' : ''}" onclick="buildAptitudeView('dashboard')">Topics</button>
          <button class="apt-tab-btn ${tab === 'practice' ? 'active' : ''}" onclick="buildAptitudeView('practice')">Practice</button>
          <button class="apt-tab-btn ${tab === 'handbook' ? 'active' : ''}" onclick="buildAptitudeView('handbook')">Handbook</button>
          <button class="apt-tab-btn ${tab === 'questions' ? 'active' : ''}" onclick="buildAptitudeView('questions')">MCQ Question Bank</button>
        </div>
        <div class="apt-filter-group" id="apt-toolbar-filters"></div>
      </div>

      <!-- Dynamic Content Area -->
      <div id="apt-content-area"></div>
    </div>
  `;

  if (tab === "dashboard") {
    renderAptitudeDashboard();
  } else if (tab === "practice") {
    renderAptitudePractice(param || currentPracticeTopicId || 1);
  } else if (tab === "handbook") {
    renderAptitudeHandbook(param || currentHandbookTopicId || 1);
  } else if (tab === "questions") {
    renderAptitudeQuestionManager();
  } else if (tab === "session" && currentAptitudeSession) {
    renderActivePracticeSession();
  }
}

/* ================================================================
   1. DASHBOARD VIEW (Pattern-Strength Style Topic Grid)
   ================================================================ */
function renderAptitudeDashboard() {
  const content = document.getElementById("apt-content-area");
  const filtersEl = document.getElementById("apt-toolbar-filters");
  if (!content) return;

  const allQuestions = getAllAptitudeQuestions();
  const results = getAptitudeResults();
  const topicStatuses = getAptitudeTopicStatuses();

  // Calculate high-level stats
  const totalQuestions = allQuestions.length;
  const attemptedCount = Object.keys(results).length;
  const correctCount = Object.values(results).filter(r => r && r.status === "correct").length;
  const overallAccuracy = attemptedCount ? Math.round((correctCount / attemptedCount) * 100) : 0;
  const masteredCount = Object.values(topicStatuses).filter(s => s === "mastered").length;

  // Render Stats Grid
  const statsHtml = `
    <div class="apt-stats-grid">
      <div class="apt-stat-card">
        <div class="apt-stat-label">Total Questions</div>
        <div class="apt-stat-num" style="color:var(--apt-pastel)">${totalQuestions}</div>
        <div class="apt-stat-sub">Across 45 core topics</div>
      </div>
      <div class="apt-stat-card">
        <div class="apt-stat-label">Attempted</div>
        <div class="apt-stat-num" style="color:var(--text)">${attemptedCount}</div>
        <div class="apt-stat-sub">${Math.round((attemptedCount / (totalQuestions || 1)) * 100)}% coverage</div>
      </div>
      <div class="apt-stat-card">
        <div class="apt-stat-label">Accuracy</div>
        <div class="apt-stat-num" style="color:#4ade80">${overallAccuracy}%</div>
        <div class="apt-stat-sub">${correctCount} correct answers</div>
      </div>
      <div class="apt-stat-card">
        <div class="apt-stat-label">Mastered Topics</div>
        <div class="apt-stat-num" style="color:#fbbf24">${masteredCount}</div>
        <div class="apt-stat-sub">of 45 domains</div>
      </div>
    </div>
  `;

  // Render Filters Toolbar
  if (filtersEl) {
    filtersEl.innerHTML = `
      <input type="text" class="apt-search-input" id="apt-topic-search" placeholder="Filter topics (e.g. Percentage, Profit)..." oninput="filterTopicCards()">
      <select class="apt-select" id="apt-status-filter" onchange="filterTopicCards()">
        <option value="all">All Statuses</option>
        <option value="not started">Not Started</option>
        <option value="learning">Learning</option>
        <option value="covered">Covered</option>
        <option value="mastered">Mastered</option>
      </select>
    `;
  }

  // Generate Pattern-Grid Cards matching DSA tracker pattern cards
  const topicsList = (typeof APTITUDE_HANDBOOK !== "undefined") ? APTITUDE_HANDBOOK : [];
  const cardsHtml = topicsList.map(t => {
    const topicTitle = t.title;
    const topicQs = allQuestions.filter(q => q.topic === topicTitle || q.topic === t.title.replace(/^[0-9]+\.\s*/, ""));
    const qCount = topicQs.length;

    let topicAttempted = 0, topicCorrect = 0;
    topicQs.forEach(q => {
      if (results[q.id]) {
        topicAttempted++;
        if (results[q.id].status === "correct") topicCorrect++;
      }
    });

    const accuracy = topicAttempted ? Math.round((topicCorrect / topicAttempted) * 100) : 0;
    const progress = qCount ? Math.round((topicAttempted / qCount) * 100) : 0;
    const status = topicStatuses[topicTitle] || "not started";
    const statusClass = status.replace(/\s+/g, "-");

    return `
      <div class="apt-pattern-card" onclick="buildAptitudeView('practice', ${t.id})" data-title="${escHtml(topicTitle.toLowerCase())}" data-status="${escHtml(status)}">
        <div>
          <div class="apt-pattern-card-top">
            <div class="apt-pattern-card-name">${escHtml(topicTitle)}</div>
            <div class="apt-status-pill ${statusClass}" onclick="cycleTopicStatus('${escHtml(topicTitle)}', event)" title="Click to cycle status">
              <span>●</span> <span>${status}</span>
            </div>
          </div>
          <div class="apt-pattern-card-topic">${escHtml(t.category || "Quantitative")}</div>
        </div>

        <div>
          <div class="apt-pattern-bar-bg">
            <div class="apt-pattern-bar-fill ${progress === 100 ? 'full' : ''}" style="width:${progress}%"></div>
          </div>
          <div class="apt-pattern-card-pct">
            <span>${topicAttempted} / ${qCount}</span>
            <span>${progress}%${topicAttempted ? ` · ${accuracy}% acc` : ''}</span>
          </div>
        </div>
      </div>
    `;
  }).join("");

  content.innerHTML = `
    ${statsHtml}
    <div class="apt-pattern-grid" id="apt-topic-grid-container">
      ${cardsHtml}
    </div>
  `;
}

/* ================================================================
   2. TOPIC PRACTICE (2-Column Layout with Topic Sidebar & MCQ Cards)
   ================================================================ */
function renderAptitudePractice(topicId = 1) {
  const content = document.getElementById("apt-content-area");
  const filtersEl = document.getElementById("apt-toolbar-filters");
  if (!content) return;

  currentPracticeTopicId = topicId;
  const topicsList = (typeof APTITUDE_HANDBOOK !== "undefined") ? APTITUDE_HANDBOOK : [];
  const topic = topicsList.find(t => t.id === topicId) || topicsList[0];
  if (!topic) return;

  const allQs = getAllAptitudeQuestions();
  const results = getAptitudeResults();
  const topicStatuses = getAptitudeTopicStatuses();
  const currentStatus = topicStatuses[topic.title] || "not started";

  // Filter questions for this topic
  const topicQs = allQs.filter(q => q.topic === topic.title || q.topic === topic.title.replace(/^[0-9]+\.\s*/, ""));
  let attempted = 0, correct = 0;
  topicQs.forEach(q => {
    if (results[q.id]) {
      attempted++;
      if (results[q.id].status === "correct") correct++;
    }
  });
  const acc = attempted ? Math.round((correct / attempted) * 100) : 0;
  const prog = topicQs.length ? Math.round((attempted / topicQs.length) * 100) : 0;

  // Filter toolbar
  if (filtersEl) {
    filtersEl.innerHTML = `
      <input type="text" class="apt-search-input" id="apt-practice-search" placeholder="Search this topic's questions..." oninput="filterPracticeTopicQuestions()">
      <select class="apt-select" id="apt-practice-diff-filter" onchange="filterPracticeTopicQuestions()">
        <option value="all">All Difficulties</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
      <select class="apt-select" id="apt-practice-status-filter" onchange="filterPracticeTopicQuestions()">
        <option value="all">All Statuses</option>
        <option value="unattempted">Unattempted</option>
        <option value="correct">Solved</option>
        <option value="wrong">Wrong</option>
      </select>
    `;
  }

  // Left Sidebar Nav Items (all 45 topics)
  const navItems = topicsList.map(t => {
    const tQs = allQs.filter(q => q.topic === t.title || q.topic === t.title.replace(/^[0-9]+\.\s*/, ""));
    const tAtt = tQs.filter(q => results[q.id]).length;
    const isAct = t.id === topic.id;

    return `
      <div class="apt-practice-nav-item ${isAct ? 'active' : ''}" onclick="renderAptitudePractice(${t.id})">
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(t.title)}</span>
        <span style="font-family:var(--mono);font-size:10px;color:${isAct ? 'var(--apt-pastel)' : 'var(--muted)'};flex-shrink:0">${tAtt}/${tQs.length}</span>
      </div>
    `;
  }).join("");

  // Right Side MCQ Question Cards
  const questionsHtml = topicQs.map((q, idx) => {
    const res = results[q.id];
    const isSolved = res && res.status === "correct";
    const isWrong = res && res.status === "wrong";
    const statusText = res ? (isSolved ? "Solved" : "Wrong") : "Unattempted";
    const statusColor = res ? (isSolved ? "#4ade80" : "#f87171") : "var(--muted)";
    const statusVal = res ? (isSolved ? "correct" : "wrong") : "unattempted";

    const optionsHtml = (q.options || []).map((opt, optIdx) => {
      const letter = String.fromCharCode(65 + optIdx);
      return `
        <div class="apt-inline-option-item" id="apt-inline-opt-${q.id}-${optIdx}" onclick="selectInlineOption('${q.id}', ${optIdx})">
          <span class="apt-option-letter">${letter}</span>
          <span class="apt-option-text">${formatAptMath(opt)}</span>
        </div>
      `;
    }).join("");

    return `
      <div class="apt-mcq-card" id="apt-mcq-card-${q.id}" data-qtext="${escHtml((q.question + ' ' + (q.pattern || '')).toLowerCase())}" data-diff="${escHtml(q.difficulty || 'medium')}" data-status="${statusVal}">
        <div class="apt-mcq-top">
          <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap">
            <span style="font-family:var(--mono);font-size:11px;color:var(--apt-pastel);font-weight:500">Q${idx + 1}</span>
            <span class="apt-tag diff-${q.difficulty || 'medium'}">${escHtml(q.difficulty || 'medium')}</span>
            ${q.pattern ? `<span class="apt-tag" style="color:var(--muted)">${escHtml(q.pattern)}</span>` : ''}
            ${(q.companies_commonly_asking || []).map(c => `<span class="apt-tag" style="color:var(--text)">${escHtml(c)}</span>`).join("")}
          </div>

          <div style="display:flex;align-items:center;gap:8px">
            <span class="apt-inline-status" id="apt-inline-status-${q.id}" style="color:${statusColor}">${statusText}</span>
            <button class="apt-btn apt-btn-outline" style="padding:3px 7px;font-size:11px" onclick="duplicateAptitudeQuestion('${q.id}')" title="Duplicate">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
            ${q.isCustom ? `
              <button class="apt-btn apt-btn-outline" style="padding:3px 7px;font-size:11px" onclick="editAptitudeQuestion('${q.id}')" title="Edit">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </button>
              <button class="apt-btn apt-btn-outline" style="padding:3px 7px;font-size:11px;color:#f87171" onclick="deleteAptitudeQuestion('${q.id}')" title="Delete">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            ` : ''}
          </div>
        </div>

        <div class="apt-mcq-question">${formatAptMath(q.question)}</div>

        <!-- 4 Options -->
        <div class="apt-inline-options-grid" id="apt-inline-grid-${q.id}">
          ${optionsHtml}
        </div>

        <!-- Explanation Drawer -->
        <div class="apt-inline-exp" id="apt-inline-exp-${q.id}" style="display:none">
          <div class="apt-explanation-header">
            <span style="color:var(--apt-pastel)">Explanation &amp; Solution (Correct: ${escHtml(q.correct_answer)}):</span>
          </div>
          <div class="apt-explanation-body">
            ${formatAptMath(q.explanation || "No derivation provided.")}
          </div>
        </div>

        <!-- Footer -->
        <div class="apt-mcq-footer">
          <button class="apt-link-btn" id="apt-exp-toggle-${q.id}" onclick="toggleInlineExplanation('${q.id}')">
            Show Explanation
          </button>
          <button class="apt-link-btn" style="color:var(--muted)" onclick="resetInlineQuestion('${q.id}')">
            Reset
          </button>
        </div>
      </div>
    `;
  }).join("");

  content.innerHTML = `
    <div class="apt-practice-layout">
      <!-- Left sidebar with all 45 topics -->
      <div class="apt-practice-nav">
        <div style="padding:4px 14px 8px;font-family:var(--mono);font-size:10px;text-transform:uppercase;color:var(--muted)">45 Practice Domains</div>
        ${navItems}
      </div>

      <!-- Right main area with topic questions -->
      <div class="apt-practice-content">
        <!-- Topic Header Card -->
        <div class="apt-handbook-block" style="padding:16px 20px">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:12px">
            <div>
              <div style="font-family:var(--serif);font-size:22px;font-weight:400;color:var(--text)">${escHtml(topic.title)}</div>
              <div style="font-size:12px;color:var(--mid);margin-top:2px">${escHtml(topic.category || "Quantitative Aptitude")} · ${topicQs.length} total questions · ${attempted} attempted · ${acc}% accuracy</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              <button class="apt-btn apt-btn-primary" onclick="startSingleTopicPractice('${escHtml(topic.title)}')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>Start Timed Mock</span>
              </button>
              <button class="apt-btn" onclick="buildAptitudeView('handbook', ${topic.id})">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                <span>Formulas</span>
              </button>
              <div class="apt-status-pill ${currentStatus.replace(/\s+/g, '-')}" onclick="cycleTopicStatus('${escHtml(topic.title)}', event)" title="Click to cycle status">
                <span>●</span> <span>${currentStatus}</span>
              </div>
            </div>
          </div>

          <div class="apt-pattern-bar-bg" style="height:4px;margin-top:8px">
            <div class="apt-pattern-bar-fill ${prog === 100 ? 'full' : ''}" style="width:${prog}%"></div>
          </div>
        </div>

        <!-- Questions List Container -->
        <div id="apt-practice-q-container" style="display:flex;flex-direction:column;gap:12px">
          ${questionsHtml.length ? questionsHtml : `<div style="padding:32px;text-align:center;color:var(--muted)">No questions found for this topic.</div>`}
        </div>
      </div>
    </div>
  `;
}

function filterPracticeTopicQuestions() {
  const query = (document.getElementById("apt-practice-search")?.value || "").toLowerCase().trim();
  const diffFilter = document.getElementById("apt-practice-diff-filter")?.value || "all";
  const statusFilter = document.getElementById("apt-practice-status-filter")?.value || "all";

  const rows = document.querySelectorAll("#apt-practice-q-container .apt-mcq-card");
  rows.forEach(r => {
    const text = r.getAttribute("data-qtext") || "";
    const diff = r.getAttribute("data-diff") || "";
    const status = r.getAttribute("data-status") || "";

    const matchesQuery = !query || text.includes(query);
    const matchesDiff = (diffFilter === "all") || (diff === diffFilter);
    const matchesStatus = (statusFilter === "all") || (status === statusFilter);

    r.style.display = (matchesQuery && matchesDiff && matchesStatus) ? "block" : "none";
  });
}

function openTopicActionModal(topicId, topicTitle) {
  const topicsList = (typeof APTITUDE_HANDBOOK !== "undefined") ? APTITUDE_HANDBOOK : [];
  const topic = topicsList.find(t => t.id === topicId) || { title: topicTitle, category: "Quantitative" };
  const allQs = getAllAptitudeQuestions().filter(q => q.topic === topicTitle || q.topic === topicTitle.replace(/^[0-9]+\.\s*/, ""));
  const results = getAptitudeResults();
  let attempted = 0, correct = 0;
  allQs.forEach(q => {
    if (results[q.id]) {
      attempted++;
      if (results[q.id].status === "correct") correct++;
    }
  });
  const acc = attempted ? Math.round((correct / attempted) * 100) : 0;
  const status = getAptitudeTopicStatuses()[topicTitle] || "not started";
  
  const qListHtml = allQs.slice(0, 10).map((q, idx) => {
    const isDone = results[q.id];
    const isCorr = isDone && results[q.id].status === "correct";
    return `
      <div style="padding:8px 10px;border-radius:6px;background:var(--bg3);border:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;margin-bottom:6px">
        <div style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text)">
          <span style="font-family:var(--mono);color:var(--muted);margin-right:6px">Q${idx+1}</span>
          ${escHtml(q.question)}
        </div>
        <span style="font-family:var(--mono);font-size:10px;color:${isDone ? (isCorr ? '#4ade80' : '#f87171') : 'var(--muted)'}">
          ${isDone ? (isCorr ? 'Solved' : 'Wrong') : 'Unseen'}
        </span>
      </div>
    `;
  }).join("");

  const modalHtml = `
    <div class="apt-modal-overlay" id="apt-topic-action-modal" onclick="closeAptModal(event, 'apt-topic-action-modal')">
      <div class="apt-modal-card" style="max-width:480px" onclick="event.stopPropagation()">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <div style="font-family:var(--serif);font-size:22px;font-weight:400;color:var(--text)">${escHtml(topicTitle)}</div>
          <button class="modal-close" onclick="closeAptModalDirect('apt-topic-action-modal')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div style="font-size:12.5px;color:var(--mid);margin-bottom:18px">
          ${allQs.length} practice questions · ${attempted} attempted · ${acc}% accuracy
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:18px">
          <button class="apt-btn apt-btn-primary" style="justify-content:center;padding:10px;font-size:12.5px" onclick="closeAptModalDirect('apt-topic-action-modal'); startSingleTopicPractice('${escHtml(topicTitle)}')">
            <span>Start Practice (${allQs.length} Qs)</span>
          </button>
          <button class="apt-btn" style="justify-content:center;padding:10px;font-size:12.5px;gap:6px" onclick="closeAptModalDirect('apt-topic-action-modal'); renderAptitudeHandbook(${topicId})">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            <span>Formulas Handbook</span>
          </button>
        </div>

        <div style="margin-bottom:18px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span style="font-family:var(--mono);font-size:10px;text-transform:uppercase;color:var(--muted)">Question Bank Preview (${allQs.length} total)</span>
            <span style="font-family:var(--mono);font-size:10px;color:var(--apt-pastel);cursor:pointer" onclick="closeAptModalDirect('apt-topic-action-modal'); startSingleTopicPractice('${escHtml(topicTitle)}')">Practice All</span>
          </div>
          <div style="max-height:180px;overflow-y:auto;padding-right:2px">
            ${qListHtml}
          </div>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;padding-top:14px;border-top:1px solid var(--line)">
          <span style="font-size:11.5px;color:var(--muted)">Topic Status:</span>
          <div style="display:flex;gap:5px;flex-wrap:wrap">
            ${["not started", "learning", "covered", "mastered"].map(st => `
              <span class="apt-status-pill ${st.replace(/\s+/g, '-')}" style="cursor:pointer;${status === st ? 'box-shadow:0 0 0 1px var(--apt-pastel)' : ''}" onclick="setAptitudeTopicStatus('${escHtml(topicTitle)}', '${st}'); closeAptModalDirect('apt-topic-action-modal');">
                ${st}
              </span>
            `).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
  document.getElementById("apt-topic-action-modal")?.remove();
  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

function filterTopicCards() {
  const query = (document.getElementById("apt-topic-search")?.value || "").toLowerCase().trim();
  const status = document.getElementById("apt-status-filter")?.value || "all";
  const cards = document.querySelectorAll(".apt-pattern-card, .apt-topic-card");

  cards.forEach(c => {
    const title = c.getAttribute("data-title") || "";
    const cardStatus = c.getAttribute("data-status") || "";
    const matchesQuery = !query || title.includes(query);
    const matchesStatus = (status === "all") || (cardStatus === status);
    c.style.display = (matchesQuery && matchesStatus) ? "flex" : "none";
  });
}

/* ================================================================
   2. MCQ PRACTICE ENGINE (Setup, Session, Scoring)
   ================================================================ */
function openPracticeSetupModal(preselectedTopic = null) {
  const allQs = getAllAptitudeQuestions();
  const topicsList = (typeof APTITUDE_HANDBOOK !== "undefined") ? APTITUDE_HANDBOOK : [];

  const topicOptions = [`<option value="all">All Topics (Comprehensive Mock)</option>`]
    .concat(topicsList.map(t => `<option value="${escHtml(t.title)}" ${preselectedTopic === t.title ? 'selected' : ''}>${escHtml(t.title)}</option>`))
    .join("");

  const modalHtml = `
    <div class="apt-modal-overlay" id="apt-practice-modal" onclick="closeAptModal(event, 'apt-practice-modal')">
      <div class="apt-modal-card" style="max-width:540px" onclick="event.stopPropagation()">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
          <div style="font-family:var(--serif);font-size:22px;font-weight:400;color:var(--text)">Configure Practice Session</div>
          <button class="modal-close" onclick="closeAptModalDirect('apt-practice-modal')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div style="display:flex;flex-direction:column;gap:14px">
          <div>
            <label class="modal-section-label">Select Topic</label>
            <select class="apt-select" id="apt-setup-topic" style="width:100%">${topicOptions}</select>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div>
              <label class="modal-section-label">Question Scope</label>
              <select class="apt-select" id="apt-setup-scope" style="width:100%">
                <option value="all">All Questions</option>
                <option value="unseen">Unseen Questions Only</option>
                <option value="wrong">Previously Wrong</option>
                <option value="revision">Revision Queue</option>
              </select>
            </div>
            <div>
              <label class="modal-section-label">Difficulty</label>
              <select class="apt-select" id="apt-setup-diff" style="width:100%">
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div>
              <label class="modal-section-label">Number of Questions</label>
              <select class="apt-select" id="apt-setup-count" style="width:100%">
                <option value="5">5 Questions</option>
                <option value="10" selected>10 Questions</option>
                <option value="15">15 Questions</option>
                <option value="20">20 Questions</option>
                <option value="25">25 Questions</option>
                <option value="all">All Available</option>
              </select>
            </div>
            <div>
              <label class="modal-section-label">Timer Mode</label>
              <select class="apt-select" id="apt-setup-timer" style="width:100%">
                <option value="untimed" selected>Untimed (Practice)</option>
                <option value="45">45s per question (Speed)</option>
                <option value="60">60s per question (Standard)</option>
                <option value="90">90s per question (OA Pace)</option>
              </select>
            </div>
          </div>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:24px">
          <button class="apt-btn apt-btn-outline" onclick="closeAptModalDirect('apt-practice-modal')">Cancel</button>
          <button class="apt-btn apt-btn-primary" onclick="launchAptitudeSession()">Start Session ▶</button>
        </div>
      </div>
    </div>
  `;

  // Remove existing modal if any
  document.getElementById("apt-practice-modal")?.remove();
  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

function startSingleTopicPractice(topicTitle) {
  openPracticeSetupModal(topicTitle);
}

function launchAptitudeSession() {
  const topic = document.getElementById("apt-setup-topic")?.value || "all";
  const scope = document.getElementById("apt-setup-scope")?.value || "all";
  const diff = document.getElementById("apt-setup-diff")?.value || "all";
  const countVal = document.getElementById("apt-setup-count")?.value || "10";
  const timerVal = document.getElementById("apt-setup-timer")?.value || "untimed";

  closeAptModalDirect("apt-practice-modal");

  const allQs = getAllAptitudeQuestions();
  const results = getAptitudeResults();

  // Apply filters
  let filtered = allQs.filter(q => {
    if (topic !== "all" && q.topic !== topic && q.topic !== topic.replace(/^[0-9]+\.\s*/, "")) return false;
    if (diff !== "all" && q.difficulty !== diff) return false;
    if (scope === "unseen" && results[q.id]) return false;
    if (scope === "wrong" && (!results[q.id] || results[q.id].status !== "wrong")) return false;
    return true;
  });

  if (!filtered.length) {
    showAlert("No questions matched your selected filter criteria. Try expanding difficulty or scope.");
    return;
  }

  // Shuffle questions
  filtered = filtered.sort(() => Math.random() - 0.5);

  // Slice count
  const count = (countVal === "all") ? filtered.length : Math.min(parseInt(countVal, 10), filtered.length);
  const sessionQuestions = filtered.slice(0, count);

  currentAptitudeSession = {
    questions: sessionQuestions,
    currentIndex: 0,
    answers: {},
    timerMode: timerVal,
    timePerQuestion: (timerVal === "untimed") ? 0 : parseInt(timerVal, 10),
    startTime: Date.now(),
    questionStartTime: Date.now(),
    isSubmitted: false,
    intervalId: null
  };

  buildAptitudeView("practice");
}

function renderActivePracticeSession() {
  const content = document.getElementById("apt-content-area");
  if (!content || !currentAptitudeSession) return;

  const s = currentAptitudeSession;
  const q = s.questions[s.currentIndex];
  if (!q) {
    finishAptitudeSession();
    return;
  }

  s.questionStartTime = Date.now();
  s.isSubmitted = false;

  const progressPct = Math.round(((s.currentIndex) / s.questions.length) * 100);
  const diffClass = `diff-${q.difficulty || 'medium'}`;

  const optionsHtml = (q.options || []).map((opt, idx) => {
    const letter = String.fromCharCode(65 + idx);
    return `
      <div class="apt-option-row" id="apt-opt-${idx}" onclick="selectAptOption(${idx})">
        <span class="apt-option-letter">${letter}</span>
        <span class="apt-option-text">${formatAptMath(opt)}</span>
      </div>
    `;
  }).join("");

  content.innerHTML = `
    <div class="apt-practice-box">
      <!-- Session Bar -->
      <div class="apt-practice-header">
        <div class="apt-practice-badge-group">
          <span class="apt-tag ${diffClass}">${escHtml(q.difficulty || "medium")}</span>
          <span class="apt-tag">${escHtml(q.pattern || q.topic || "Quantitative")}</span>
          ${(q.companies_commonly_asking || []).map(c => `<span class="apt-tag" style="color:var(--text)">${escHtml(c)}</span>`).join("")}
        </div>

        <div style="display:flex;align-items:center;gap:12px">
          <div class="apt-timer-display" id="apt-session-timer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span>${s.timerMode === 'untimed' ? '00:00' : `${s.timePerQuestion}s`}</span>
          </div>
          <button class="apt-btn apt-btn-outline" style="font-size:11px;padding:4px 8px" onclick="endAptitudeSessionEarly()">Quit</button>
        </div>
      </div>

      <!-- Question Counter & Progress -->
      <div style="display:flex;align-items:center;justify-content:space-between;font-family:var(--mono);font-size:11.5px;color:var(--muted);margin-bottom:8px">
        <span>Question ${s.currentIndex + 1} of ${s.questions.length}</span>
        <span>${progressPct}% complete</span>
      </div>
      <div class="apt-progress-bar-bg" style="margin-bottom:20px">
        <div class="apt-progress-bar-fill" style="width:${progressPct}%"></div>
      </div>

      <!-- Question Title -->
      <div class="apt-question-title">${formatAptMath(q.question)}</div>

      <!-- Options -->
      <div class="apt-options-list">
        ${optionsHtml}
      </div>

      <!-- Explanation Area (Initially Hidden) -->
      <div id="apt-explanation-container" style="display:none"></div>

      <!-- Bottom Action Toolbar -->
      <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--line);padding-top:18px;margin-top:10px">
        <div id="apt-feedback-msg" style="font-family:var(--mono);font-size:12px;color:var(--muted)">
          Select an option to submit your answer
        </div>
        <button class="apt-btn apt-btn-primary" id="apt-action-btn" onclick="submitAptOption()">
          <span>Submit Answer</span>
        </button>
      </div>
    </div>
  `;

  // Start timer ticking
  if (s.intervalId) clearInterval(s.intervalId);
  if (s.timerMode !== "untimed") {
    let timeLeft = s.timePerQuestion;
    const timerEl = document.querySelector("#apt-session-timer span");
    s.intervalId = setInterval(() => {
      timeLeft--;
      if (timerEl) timerEl.textContent = `${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(s.intervalId);
        if (!s.isSubmitted) submitAptOption(true); // timeout submission
      }
    }, 1000);
  }
}

let selectedOptionIndex = null;

function selectAptOption(index) {
  if (currentAptitudeSession && currentAptitudeSession.isSubmitted) return;
  selectedOptionIndex = index;
  document.querySelectorAll(".apt-option-row").forEach((el, idx) => {
    el.classList.toggle("selected", idx === index);
  });
}

function submitAptOption(isTimeout = false) {
  const s = currentAptitudeSession;
  if (!s) return;

  if (s.isSubmitted) {
    // Next question
    s.currentIndex++;
    if (s.currentIndex >= s.questions.length) {
      finishAptitudeSession();
    } else {
      renderActivePracticeSession();
    }
    return;
  }

  const q = s.questions[s.currentIndex];
  if (selectedOptionIndex === null && !isTimeout) {
    showAlert("Please select an answer choice before submitting.");
    return;
  }

  if (s.intervalId) clearInterval(s.intervalId);
  s.isSubmitted = true;

  const timeSpent = Math.max(1, Math.round((Date.now() - s.questionStartTime) / 1000));
  const selectedText = (selectedOptionIndex !== null && q.options) ? q.options[selectedOptionIndex] : "";
  const isCorrect = (selectedText.toString().trim() === q.correct_answer.toString().trim());

  // Record answer in session
  s.answers[q.id] = {
    selected: selectedText,
    isCorrect: isCorrect,
    timeSpent: timeSpent
  };

  // Record in global DB
  const results = getAptitudeResults();
  if (!results[q.id]) {
    results[q.id] = { status: isCorrect ? "correct" : "wrong", attempts: [] };
  }
  results[q.id].status = isCorrect ? "correct" : "wrong";
  results[q.id].attempts.push({
    isCorrect,
    timeSpent,
    timestamp: Date.now()
  });
  results[q.id].lastAttempt = Date.now();
  DB.set("aptitude", results);
  if (typeof syncAfterChange === "function") syncAfterChange();

  // Visual Reveal on options
  q.options.forEach((opt, idx) => {
    const row = document.getElementById(`apt-opt-${idx}`);
    if (row) {
      row.classList.add("disabled");
      if (opt.toString().trim() === q.correct_answer.toString().trim()) {
        row.classList.add("correct");
      } else if (idx === selectedOptionIndex && !isCorrect) {
        row.classList.add("wrong");
      }
    }
  });

  // Reveal Explanation
  const expContainer = document.getElementById("apt-explanation-container");
  if (expContainer) {
    expContainer.style.display = "block";
    expContainer.innerHTML = `
      <div class="apt-explanation-card">
        <div class="apt-explanation-header">
          ${isCorrect ? '<span style="color:#4ade80">Correct Answer</span>' : '<span style="color:#f87171">Incorrect Answer</span>'}
          — Correct: ${escHtml(q.correct_answer)} (${timeSpent}s taken)
        </div>
        <div class="apt-explanation-body">
          ${formatAptMath(q.explanation || "No detailed derivation provided.")}
        </div>
      </div>
    `;
  }

  // Update button for next
  const btn = document.getElementById("apt-action-btn");
  const msg = document.getElementById("apt-feedback-msg");
  if (btn) {
    btn.innerHTML = (s.currentIndex + 1 >= s.questions.length) ? "Finish Session ▶" : "Next Question ▶";
  }
  if (msg) {
    msg.innerHTML = isCorrect ? `<span style="color:#4ade80">Correct (+1)</span>` : `<span style="color:#f87171">Incorrect</span>`;
  }
  selectedOptionIndex = null;
}

function finishAptitudeSession() {
  const content = document.getElementById("apt-content-area");
  if (!content || !currentAptitudeSession) return;

  const s = currentAptitudeSession;
  if (s.intervalId) clearInterval(s.intervalId);

  const total = s.questions.length;
  let correct = 0;
  let totalTime = 0;

  s.questions.forEach(q => {
    const ans = s.answers[q.id];
    if (ans && ans.isCorrect) correct++;
    if (ans) totalTime += ans.timeSpent;
  });

  const accuracy = total ? Math.round((correct / total) * 100) : 0;
  const avgTime = total ? Math.round(totalTime / total) : 0;

  content.innerHTML = `
    <div class="apt-practice-box" style="text-align:center;padding:40px 32px">
      <div style="font-family:var(--serif);font-size:30px;color:var(--text);margin-bottom:8px">Session Complete!</div>
      <p style="color:var(--mid);font-size:14px;margin-bottom:28px">Great practice session. Here is your performance breakdown:</p>

      <div class="apt-stats-grid" style="margin-bottom:30px">
        <div class="apt-stat-card">
          <div class="apt-stat-label">Score</div>
          <div class="apt-stat-num" style="color:#38bdf8">${correct} / ${total}</div>
          <div class="apt-stat-sub">solved correctly</div>
        </div>
        <div class="apt-stat-card">
          <div class="apt-stat-label">Accuracy</div>
          <div class="apt-stat-num" style="color:#4ade80">${accuracy}%</div>
          <div class="apt-stat-sub">session accuracy</div>
        </div>
        <div class="apt-stat-card">
          <div class="apt-stat-label">Total Time</div>
          <div class="apt-stat-num" style="color:var(--text)">${totalTime}s</div>
          <div class="apt-stat-sub">active solving time</div>
        </div>
        <div class="apt-stat-card">
          <div class="apt-stat-label">Avg Speed</div>
          <div class="apt-stat-num" style="color:#fbbf24">${avgTime}s</div>
          <div class="apt-stat-sub">per question</div>
        </div>
      </div>

      <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap">
        <button class="apt-btn apt-btn-primary" onclick="openPracticeSetupModal()">Start New Session ▶</button>
        <button class="apt-btn" onclick="buildAptitudeView('dashboard')">Back to Topics Dashboard</button>
      </div>
    </div>
  `;

  currentAptitudeSession = null;
}

function endAptitudeSessionEarly() {
  showConfirm("Are you sure you want to end this practice session early? Your progress so far will be saved.", () => {
    finishAptitudeSession();
  });
}

/* ================================================================
   3. FORMULAS & TRICKS HANDBOOK (KaTeX Rendering & Per-Topic Notes)
   ================================================================ */
function renderAptitudeHandbook(topicId = 1) {
  const content = document.getElementById("apt-content-area");
  const filtersEl = document.getElementById("apt-toolbar-filters");
  if (!content) return;

  currentHandbookTopicId = topicId;
  const topicsList = (typeof APTITUDE_HANDBOOK !== "undefined") ? APTITUDE_HANDBOOK : [];
  const topic = topicsList.find(t => t.id === topicId) || topicsList[0];
  if (!topic) return;

  if (filtersEl) filtersEl.innerHTML = "";

  const notesDB = DB.get("aptitude_notes") || {};
  const topicNote = notesDB[topic.id] || "";

  // Left sidebar nav items
  const navItems = topicsList.map(t => `
    <div class="apt-handbook-nav-item ${t.id === topic.id ? 'active' : ''}" onclick="renderAptitudeHandbook(${t.id})">
      ${escHtml(t.title)}
    </div>
  `).join("");

  // Formulas list
  const formulasHtml = (topic.coreFormulas || []).map(f => {
    let clean = String(f).trim();
    if (clean.startsWith("$$") && clean.endsWith("$$")) clean = clean.slice(2, -2).trim();
    else if (clean.startsWith("$") && clean.endsWith("$")) clean = clean.slice(1, -1).trim();

    return `
      <div class="apt-handbook-formula-item">
        ${tryRenderKatex(clean, true)}
      </div>
    `;
  }).join("");

  // Methods list
  const methodsHtml = (topic.methods || []).map(m => `
    <li style="margin-bottom:8px;line-height:1.6;color:var(--text)">${formatAptMath(m)}</li>
  `).join("");

  // Tips & Tricks
  const tipsHtml = (topic.tipsAndTricks || []).map(t => `
    <li style="margin-bottom:8px;line-height:1.6;color:var(--text)">${formatAptMath(t)}</li>
  `).join("");

  // Common Traps
  const trapsHtml = (topic.commonTraps || []).map(t => `
    <li style="margin-bottom:8px;line-height:1.6;color:#f87171">${formatAptMath(t)}</li>
  `).join("");

  content.innerHTML = `
    <div class="apt-handbook-layout">
      <!-- Topic list sidebar -->
      <div class="apt-handbook-nav">
        <div style="padding:4px 16px 8px;font-family:var(--mono);font-size:10px;text-transform:uppercase;color:var(--muted)">45 Core Topics</div>
        ${navItems}
      </div>

      <!-- Main Topic Content -->
      <div class="apt-handbook-content">
        <!-- Title card -->
        <div class="apt-handbook-block" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
          <div>
            <div style="font-family:var(--serif);font-size:24px;color:var(--text)">${escHtml(topic.title)}</div>
            <div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-top:4px">${escHtml(topic.category || "Quantitative Aptitude")}</div>
          </div>
          <button class="apt-btn apt-btn-primary" onclick="startSingleTopicPractice('${escHtml(topic.title)}')">
            ▶ Practice Questions
          </button>
        </div>

        <!-- Core Formulas -->
        <div class="apt-handbook-block">
          <div class="apt-handbook-block-title">Core Formulas &amp; Identities</div>
          ${formulasHtml}
        </div>

        <!-- Methods & Approaches -->
        ${(topic.methods && topic.methods.length) ? `
          <div class="apt-handbook-block">
            <div class="apt-handbook-block-title">Methods &amp; Step-by-Step Approaches</div>
            <ul style="padding-left:20px;margin:0">${methodsHtml}</ul>
          </div>
        ` : ''}

        <!-- Tips & Shortcuts -->
        ${(topic.tipsAndTricks && topic.tipsAndTricks.length) ? `
          <div class="apt-handbook-block">
            <div class="apt-handbook-block-title">Tips, Tricks &amp; Speed Shortcuts</div>
            <ul style="padding-left:20px;margin:0">${tipsHtml}</ul>
          </div>
        ` : ''}

        <!-- Common Traps -->
        ${(topic.commonTraps && topic.commonTraps.length) ? `
          <div class="apt-handbook-block">
            <div class="apt-handbook-block-title" style="color:#f87171">Common Traps &amp; OA Pitfalls</div>
            <ul style="padding-left:20px;margin:0">${trapsHtml}</ul>
          </div>
        ` : ''}

        <!-- Editable User Notes -->
        <div class="apt-handbook-block">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <div class="apt-handbook-block-title" style="margin-bottom:0">My Topic Notes &amp; Insights</div>
            <span id="apt-note-save-status" style="font-family:var(--mono);font-size:11px;color:var(--muted)">Auto-saved</span>
          </div>
          <textarea class="apt-notes-textarea" id="apt-topic-note-input" placeholder="Write personal derivations, company-specific shortcuts, or reminders for this topic..." oninput="saveAptitudeTopicNote(${topic.id})">${escHtml(topicNote)}</textarea>
        </div>
      </div>
    </div>
  `;
}

let noteSaveTimeout = null;
function saveAptitudeTopicNote(topicId) {
  clearTimeout(noteSaveTimeout);
  const statusEl = document.getElementById("apt-note-save-status");
  if (statusEl) statusEl.textContent = "Saving...";

  noteSaveTimeout = setTimeout(() => {
    const val = document.getElementById("apt-topic-note-input")?.value || "";
    const notesDB = DB.get("aptitude_notes") || {};
    notesDB[topicId] = val;
    DB.set("aptitude_notes", notesDB);
    if (typeof syncAfterChange === "function") syncAfterChange();
    if (statusEl) statusEl.textContent = "Saved";
  }, 500);
}

/* ================================================================
   4. QUESTION MANAGER & INTERACTIVE MCQ BANK
   ================================================================ */
let bankFilteredQuestions = [];
let bankRenderedCount = 0;
const BANK_PAGE_SIZE = 25;

function renderAptitudeQuestionManager(forceReshuffle = false) {
  const content = document.getElementById("apt-content-area");
  const filtersEl = document.getElementById("apt-toolbar-filters");
  if (!content) return;

  const allQs = getAllAptitudeQuestions();
  const topicsList = (typeof APTITUDE_HANDBOOK !== "undefined") ? APTITUDE_HANDBOOK : [];

  // Shuffle questions randomly by default
  if (forceReshuffle || !shuffledBankSeed || shuffledBankSeed.length !== allQs.length) {
    shuffledBankSeed = [...allQs].sort(() => Math.random() - 0.5);
  }

  // Filter toolbar
  if (filtersEl) {
    const topicOpts = [`<option value="all">All Topics</option>`]
      .concat(topicsList.map(t => `<option value="${escHtml(t.title)}">${escHtml(t.title)}</option>`))
      .join("");

    filtersEl.innerHTML = `
      <button class="apt-btn" style="padding:5px 10px;font-size:11.5px;gap:5px" onclick="renderAptitudeQuestionManager(true)" title="Reshuffle question bank">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
        <span>Reshuffle All</span>
      </button>
      <input type="text" class="apt-search-input" id="apt-q-search" placeholder="Search questions or keywords..." oninput="applyQuestionManagerFilters()">
      <select class="apt-select" id="apt-q-topic-filter" onchange="applyQuestionManagerFilters()">${topicOpts}</select>
      <select class="apt-select" id="apt-q-diff-filter" onchange="applyQuestionManagerFilters()">
        <option value="all">All Difficulties</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
      <select class="apt-select" id="apt-q-status-filter" onchange="applyQuestionManagerFilters()">
        <option value="all">All Statuses</option>
        <option value="unattempted">Unattempted</option>
        <option value="correct">Solved</option>
        <option value="wrong">Wrong</option>
      </select>
    `;
  }

  content.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <div id="apt-bank-count-info" style="font-family:var(--mono);font-size:11.5px;color:var(--muted)">Showing ${shuffledBankSeed.length} questions (randomized across all 45 topics)</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px" id="apt-q-rows-container"></div>
    <div id="apt-bank-loader" style="padding:18px;text-align:center">
      <button class="apt-btn" id="apt-load-more-btn" onclick="loadNextBankChunk()" style="margin:0 auto">Load More Questions</button>
    </div>
  `;

  applyQuestionManagerFilters();
  setupBankInfiniteScroll();
}

function applyQuestionManagerFilters() {
  const query = (document.getElementById("apt-q-search")?.value || "").toLowerCase().trim();
  const topicFilter = document.getElementById("apt-q-topic-filter")?.value || "all";
  const diffFilter = document.getElementById("apt-q-diff-filter")?.value || "all";
  const statusFilter = document.getElementById("apt-q-status-filter")?.value || "all";
  const results = getAptitudeResults();

  bankFilteredQuestions = (shuffledBankSeed || []).filter(q => {
    const text = (q.question + ' ' + (q.topic || '') + ' ' + (q.pattern || '')).toLowerCase();
    const topic = q.topic || "";
    const diff = q.difficulty || "medium";
    const res = results[q.id];
    const statusVal = res ? (res.status === "correct" ? "correct" : "wrong") : "unattempted";

    const matchesQuery = !query || text.includes(query);
    const matchesTopic = (topicFilter === "all") || (topic === topicFilter);
    const matchesDiff = (diffFilter === "all") || (diff === diffFilter);
    const matchesStatus = (statusFilter === "all") || (statusVal === statusFilter);

    return matchesQuery && matchesTopic && matchesDiff && matchesStatus;
  });

  const container = document.getElementById("apt-q-rows-container");
  const countInfo = document.getElementById("apt-bank-count-info");
  if (container) container.innerHTML = "";
  if (countInfo) countInfo.textContent = `Showing ${bankFilteredQuestions.length} matching questions (shuffled)`;

  bankRenderedCount = 0;
  loadNextBankChunk();
}

function loadNextBankChunk() {
  const container = document.getElementById("apt-q-rows-container");
  const loader = document.getElementById("apt-bank-loader");
  if (!container) return;

  const nextBatch = bankFilteredQuestions.slice(bankRenderedCount, bankRenderedCount + BANK_PAGE_SIZE);
  if (!nextBatch.length) {
    if (loader) loader.style.display = "none";
    if (bankRenderedCount === 0) {
      container.innerHTML = `<div style="padding:40px;text-align:center;color:var(--muted)">No questions matched your search or filter.</div>`;
    }
    return;
  }

  const results = getAptitudeResults();
  const html = nextBatch.map((q, idx) => {
    const absoluteIdx = bankRenderedCount + idx + 1;
    const res = results[q.id];
    const isSolved = res && res.status === "correct";
    const isWrong = res && res.status === "wrong";
    const statusText = res ? (isSolved ? "Solved" : "Wrong") : "Unattempted";
    const statusColor = res ? (isSolved ? "#4ade80" : "#f87171") : "var(--muted)";
    const statusVal = res ? (isSolved ? "correct" : "wrong") : "unattempted";

    const optionsHtml = (q.options || []).map((opt, optIdx) => {
      const letter = String.fromCharCode(65 + optIdx);
      return `
        <div class="apt-inline-option-item" id="apt-inline-opt-${q.id}-${optIdx}" onclick="selectInlineOption('${q.id}', ${optIdx})">
          <span class="apt-option-letter">${letter}</span>
          <span class="apt-option-text">${formatAptMath(opt)}</span>
        </div>
      `;
    }).join("");

    return `
      <div class="apt-mcq-card" id="apt-mcq-card-${q.id}" data-status="${statusVal}">
        <div class="apt-mcq-top">
          <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap">
            <span style="font-family:var(--mono);font-size:11px;color:var(--apt-pastel);font-weight:500">Q${absoluteIdx}</span>
            <span class="apt-tag diff-${q.difficulty || 'medium'}">${escHtml(q.difficulty || 'medium')}</span>
            <span class="apt-tag">${escHtml(q.topic || 'Quantitative')}</span>
            ${q.pattern ? `<span class="apt-tag" style="color:var(--muted)">${escHtml(q.pattern)}</span>` : ''}
            ${(q.companies_commonly_asking || []).map(c => `<span class="apt-tag" style="color:var(--text)">${escHtml(c)}</span>`).join("")}
            ${q.isCustom ? '<span class="apt-tag" style="color:var(--apt-pastel)">Custom</span>' : ''}
          </div>

          <div style="display:flex;align-items:center;gap:8px">
            <span class="apt-inline-status" id="apt-inline-status-${q.id}" style="color:${statusColor}">${statusText}</span>
            <button class="apt-btn apt-btn-outline" style="padding:3px 7px;font-size:11px" onclick="duplicateAptitudeQuestion('${q.id}')" title="Duplicate">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
            ${q.isCustom ? `
              <button class="apt-btn apt-btn-outline" style="padding:3px 7px;font-size:11px" onclick="editAptitudeQuestion('${q.id}')" title="Edit">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </button>
              <button class="apt-btn apt-btn-outline" style="padding:3px 7px;font-size:11px;color:#f87171" onclick="deleteAptitudeQuestion('${q.id}')" title="Delete">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            ` : ''}
          </div>
        </div>

        <div class="apt-mcq-question">${formatAptMath(q.question)}</div>

        <!-- 4 MCQ Options -->
        <div class="apt-inline-options-grid" id="apt-inline-grid-${q.id}">
          ${optionsHtml}
        </div>

        <!-- Explanation Drawer -->
        <div class="apt-inline-exp" id="apt-inline-exp-${q.id}" style="display:none">
          <div class="apt-explanation-header">
            <span style="color:var(--apt-pastel)">Explanation &amp; Shortcut (Answer: ${escHtml(q.correct_answer)}):</span>
          </div>
          <div class="apt-explanation-body">
            ${formatAptMath(q.explanation || "No step-by-step derivation provided.")}
          </div>
        </div>

        <!-- Footer -->
        <div class="apt-mcq-footer">
          <button class="apt-link-btn" id="apt-exp-toggle-${q.id}" onclick="toggleInlineExplanation('${q.id}')">
            Show Explanation
          </button>
          <button class="apt-link-btn" style="color:var(--muted)" onclick="resetInlineQuestion('${q.id}')">
            Reset
          </button>
        </div>
      </div>
    `;
  }).join("");

  container.insertAdjacentHTML("beforeend", html);
  bankRenderedCount += nextBatch.length;

  if (loader) {
    if (bankRenderedCount >= bankFilteredQuestions.length) {
      loader.style.display = "none";
    } else {
      loader.style.display = "block";
    }
  }
}

function setupBankInfiniteScroll() {
  const loader = document.getElementById("apt-bank-loader");
  if (!loader || !window.IntersectionObserver) return;
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      loadNextBankChunk();
    }
  }, { rootMargin: "300px" });
  observer.observe(loader);
}

function selectInlineOption(questionId, selectedIdx) {
  const allQs = getAllAptitudeQuestions();
  const q = allQs.find(item => item.id === questionId);
  if (!q || !q.options) return;

  const selectedText = q.options[selectedIdx];
  const isCorrect = (selectedText.toString().trim() === q.correct_answer.toString().trim());

  // Highlight options
  q.options.forEach((opt, idx) => {
    const el = document.getElementById(`apt-inline-opt-${q.id}-${idx}`);
    if (el) {
      el.classList.remove("selected", "correct", "wrong");
      if (opt.toString().trim() === q.correct_answer.toString().trim()) {
        el.classList.add("correct");
      } else if (idx === selectedIdx && !isCorrect) {
        el.classList.add("wrong");
      }
    }
  });

  // Reveal explanation
  const expEl = document.getElementById(`apt-inline-exp-${q.id}`);
  const toggleBtn = document.getElementById(`apt-exp-toggle-${q.id}`);
  if (expEl) expEl.style.display = "block";
  if (toggleBtn) toggleBtn.textContent = "Hide Explanation";

  // Update status badge
  const statusEl = document.getElementById(`apt-inline-status-${q.id}`);
  if (statusEl) {
    statusEl.innerHTML = isCorrect ? '<span style="color:#4ade80">Solved</span>' : '<span style="color:#f87171">Wrong</span>';
  }

  // Update card data attribute
  const card = document.getElementById(`apt-mcq-card-${q.id}`);
  if (card) card.setAttribute("data-status", isCorrect ? "correct" : "wrong");

  // Save to DB
  const results = getAptitudeResults();
  if (!results[q.id]) results[q.id] = { status: isCorrect ? "correct" : "wrong", attempts: [] };
  results[q.id].status = isCorrect ? "correct" : "wrong";
  results[q.id].attempts.push({
    isCorrect,
    timeSpent: 5,
    timestamp: Date.now()
  });
  results[q.id].lastAttempt = Date.now();
  DB.set("aptitude", results);
  if (typeof syncAfterChange === "function") syncAfterChange();
}

function toggleInlineExplanation(questionId) {
  const expEl = document.getElementById(`apt-inline-exp-${questionId}`);
  const toggleBtn = document.getElementById(`apt-exp-toggle-${questionId}`);
  if (!expEl) return;
  const isHidden = (expEl.style.display === "none");
  expEl.style.display = isHidden ? "block" : "none";
  if (toggleBtn) toggleBtn.textContent = isHidden ? "Hide Explanation" : "Show Explanation";
}

function resetInlineQuestion(questionId) {
  const allQs = getAllAptitudeQuestions();
  const q = allQs.find(item => item.id === questionId);
  if (!q) return;

  (q.options || []).forEach((_, idx) => {
    const el = document.getElementById(`apt-inline-opt-${q.id}-${idx}`);
    if (el) el.classList.remove("selected", "correct", "wrong");
  });

  const expEl = document.getElementById(`apt-inline-exp-${q.id}`);
  const toggleBtn = document.getElementById(`apt-exp-toggle-${q.id}`);
  if (expEl) expEl.style.display = "none";
  if (toggleBtn) toggleBtn.textContent = "Show Explanation";
}

function filterQuestionManagerRows() {
  const query = (document.getElementById("apt-q-search")?.value || "").toLowerCase().trim();
  const topicFilter = document.getElementById("apt-q-topic-filter")?.value || "all";
  const diffFilter = document.getElementById("apt-q-diff-filter")?.value || "all";
  const statusFilter = document.getElementById("apt-q-status-filter")?.value || "all";

  const rows = document.querySelectorAll("#apt-q-rows-container .apt-mcq-card");
  rows.forEach(r => {
    const text = r.getAttribute("data-qtext") || "";
    const topic = r.getAttribute("data-topic") || "";
    const diff = r.getAttribute("data-diff") || "";
    const status = r.getAttribute("data-status") || "";

    const matchesQuery = !query || text.includes(query);
    const matchesTopic = (topicFilter === "all") || (topic === topicFilter);
    const matchesDiff = (diffFilter === "all") || (diff === diffFilter);
    const matchesStatus = (statusFilter === "all") || (status === statusFilter);

    r.style.display = (matchesQuery && matchesTopic && matchesDiff && matchesStatus) ? "block" : "none";
  });
}

function openAddQuestionModal(editingQuestion = null) {
  const topicsList = (typeof APTITUDE_HANDBOOK !== "undefined") ? APTITUDE_HANDBOOK : [];
  const topicOptions = topicsList.map(t => `<option value="${escHtml(t.title)}" ${editingQuestion && editingQuestion.topic === t.title ? 'selected' : ''}>${escHtml(t.title)}</option>`).join("");

  const modalHtml = `
    <div class="apt-modal-overlay" id="apt-add-q-modal" onclick="closeAptModal(event, 'apt-add-q-modal')">
      <div class="apt-modal-card" style="max-width:580px" onclick="event.stopPropagation()">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
          <div style="font-family:var(--serif);font-size:22px;font-weight:400;color:var(--text)">${editingQuestion ? 'Edit Question' : 'Add Aptitude Question'}</div>
          <button class="modal-close" onclick="closeAptModalDirect('apt-add-q-modal')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <input type="hidden" id="apt-edit-id" value="${editingQuestion ? editingQuestion.id : ''}">

        <div style="display:flex;flex-direction:column;gap:12px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div>
              <label class="modal-section-label">Topic</label>
              <select class="apt-select" id="apt-input-topic" style="width:100%">${topicOptions}</select>
            </div>
            <div>
              <label class="modal-section-label">Difficulty</label>
              <select class="apt-select" id="apt-input-diff" style="width:100%">
                <option value="easy" ${editingQuestion && editingQuestion.difficulty === 'easy' ? 'selected' : ''}>Easy</option>
                <option value="medium" ${!editingQuestion || editingQuestion.difficulty === 'medium' ? 'selected' : ''}>Medium</option>
                <option value="hard" ${editingQuestion && editingQuestion.difficulty === 'hard' ? 'selected' : ''}>Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label class="modal-section-label">Pattern / Subtopic</label>
            <input type="text" class="apt-search-input" id="apt-input-pattern" style="width:100%" placeholder="e.g. Circular track meeting, successive discount" value="${editingQuestion ? escHtml(editingQuestion.pattern || '') : ''}">
          </div>

          <div>
            <label class="modal-section-label">Question Text</label>
            <textarea class="apt-notes-textarea" id="apt-input-question" style="min-height:75px" placeholder="Enter problem statement (LaTeX $...$ supported)...">${editingQuestion ? escHtml(editingQuestion.question || '') : ''}</textarea>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div>
              <label class="modal-section-label">Option A</label>
              <input type="text" class="apt-search-input" id="apt-input-opt0" style="width:100%" value="${editingQuestion && editingQuestion.options ? escHtml(editingQuestion.options[0] || '') : ''}">
            </div>
            <div>
              <label class="modal-section-label">Option B</label>
              <input type="text" class="apt-search-input" id="apt-input-opt1" style="width:100%" value="${editingQuestion && editingQuestion.options ? escHtml(editingQuestion.options[1] || '') : ''}">
            </div>
            <div>
              <label class="modal-section-label">Option C</label>
              <input type="text" class="apt-search-input" id="apt-input-opt2" style="width:100%" value="${editingQuestion && editingQuestion.options ? escHtml(editingQuestion.options[2] || '') : ''}">
            </div>
            <div>
              <label class="modal-section-label">Option D</label>
              <input type="text" class="apt-search-input" id="apt-input-opt3" style="width:100%" value="${editingQuestion && editingQuestion.options ? escHtml(editingQuestion.options[3] || '') : ''}">
            </div>
          </div>

          <div>
            <label class="modal-section-label">Correct Answer (Exact text matching one option)</label>
            <input type="text" class="apt-search-input" id="apt-input-correct" style="width:100%" placeholder="e.g. 48 or Option A content" value="${editingQuestion ? escHtml(editingQuestion.correct_answer || '') : ''}">
          </div>

          <div>
            <label class="modal-section-label">Detailed Explanation / Derivation</label>
            <textarea class="apt-notes-textarea" id="apt-input-explanation" style="min-height:75px" placeholder="Step-by-step mathematical derivation...">${editingQuestion ? escHtml(editingQuestion.explanation || '') : ''}</textarea>
          </div>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px">
          <button class="apt-btn apt-btn-outline" onclick="closeAptModalDirect('apt-add-q-modal')">Cancel</button>
          <button class="apt-btn apt-btn-primary" onclick="saveAptitudeQuestion()">Save Question</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("apt-add-q-modal")?.remove();
  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

function saveAptitudeQuestion() {
  const editId = document.getElementById("apt-edit-id")?.value;
  const topic = document.getElementById("apt-input-topic")?.value;
  const diff = document.getElementById("apt-input-diff")?.value || "medium";
  const pattern = document.getElementById("apt-input-pattern")?.value || "General";
  const question = document.getElementById("apt-input-question")?.value?.trim();
  const opt0 = document.getElementById("apt-input-opt0")?.value?.trim();
  const opt1 = document.getElementById("apt-input-opt1")?.value?.trim();
  const opt2 = document.getElementById("apt-input-opt2")?.value?.trim();
  const opt3 = document.getElementById("apt-input-opt3")?.value?.trim();
  const correct = document.getElementById("apt-input-correct")?.value?.trim();
  const explanation = document.getElementById("apt-input-explanation")?.value?.trim();

  if (!question || !opt0 || !opt1 || !correct) {
    showAlert("Please fill in the question text, options, and correct answer.");
    return;
  }

  const customQs = DB.get("aptitude_qs") || [];
  const qObj = {
    id: editId || ("custom-apt-" + Date.now()),
    topic,
    difficulty: diff,
    pattern,
    question,
    options: [opt0, opt1, opt2 || "", opt3 || ""].filter(Boolean),
    correct_answer: correct,
    explanation,
    isCustom: true,
    created_at: Date.now()
  };

  if (editId) {
    const idx = customQs.findIndex(q => q.id === editId);
    if (idx !== -1) customQs[idx] = qObj;
    else customQs.push(qObj);
  } else {
    customQs.push(qObj);
  }

  DB.set("aptitude_qs", customQs);
  if (typeof syncAfterChange === "function") syncAfterChange();

  closeAptModalDirect("apt-add-q-modal");
  if (currentAptitudeTab === "questions") renderAptitudeQuestionManager();
  else if (currentAptitudeTab === "dashboard") renderAptitudeDashboard();
}

function editAptitudeQuestion(id) {
  const customQs = DB.get("aptitude_qs") || [];
  const q = customQs.find(item => item.id === id);
  if (q) openAddQuestionModal(q);
}

function duplicateAptitudeQuestion(id) {
  const allQs = getAllAptitudeQuestions();
  const target = allQs.find(q => q.id === id);
  if (!target) return;

  const duplicated = {
    ...target,
    id: "",
    question: target.question + " (Copy)"
  };
  openAddQuestionModal(duplicated);
}

function deleteAptitudeQuestion(id) {
  showConfirm("Are you sure you want to delete this custom question?", () => {
    let customQs = DB.get("aptitude_qs") || [];
    customQs = customQs.filter(q => q.id !== id);
    DB.set("aptitude_qs", customQs);
    if (typeof syncAfterChange === "function") syncAfterChange();
    renderAptitudeQuestionManager();
  });
}

/* ── Modal Utility Helpers ── */
function closeAptModal(event, modalId) {
  if (event.target && event.target.id === modalId) {
    closeAptModalDirect(modalId);
  }
}

function closeAptModalDirect(modalId) {
  document.getElementById(modalId)?.remove();
}

