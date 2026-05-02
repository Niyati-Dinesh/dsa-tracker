/* ================================================================
   DSA TRACKER — app.js
   All application logic: storage, nav, views, notes, heatmap,
   difficulty rating, smart review recommendations, code saving,
   insights, and all original features.
   ================================================================ */

/* ================================================================
   STORAGE
   ================================================================ */
const DB = {
  get: (k) => {
    try {
      return JSON.parse(localStorage.getItem("dsa_" + k));
    } catch (e) {
      return null;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem("dsa_" + k, JSON.stringify(v));
    } catch (e) {}
  },
};

const getCompleted = () => DB.get("completed") || {};
const setCompleted = (o) => {
  DB.set("completed", o);
  syncAfterChange();
};
const getNotes = () => DB.get("notes") || {};
const setNotes = (o) => {
  DB.set("notes", o);
  syncAfterChange();
};
const getGlobalNotes = () => DB.get("global_notes") || [];
const setGlobalNotes = (a) => {
  DB.set("global_notes", a);
  syncAfterChange();
};
const getPatternLogs = () => DB.get("pattern_logs") || {};
const setPatternLogs = (o) => {
  DB.set("pattern_logs", o);
  syncAfterChange();
};

// Difficulty ratings: { probId: "easy"|"medium"|"hard"|"brutal" }
const getDiffRatings = () => DB.get("diff_ratings") || {};
const setDiffRatings = (o) => {
  DB.set("diff_ratings", o);
  syncAfterChange();
};

// Saved code: { probId: { language: "cpp", code: "..." } }
const getSavedCode = () => DB.get("saved_code") || {};
const setSavedCode = (o) => {
  DB.set("saved_code", o);
  syncAfterChange();
};

/* ================================================================
   DATA HELPERS
   ================================================================ */
function getAllProblems() {
  const all = [];
  DSA_DATA.topics.forEach((t) =>
    t.subtopics.forEach((st) =>
      st.problems.forEach((p) =>
        all.push({
          ...p,
          topicId: t.id,
          topicTitle: t.title,
          subtopicTitle: st.title,
        }),
      ),
    ),
  );
  return all;
}
function getAllCFProblems() {
  const all = [];
  if (!DSA_DATA.codeforces) return all;
  DSA_DATA.codeforces.topics.forEach((t) =>
    t.subtopics.forEach((st) =>
      st.problems.forEach((p) =>
        all.push({
          ...p,
          cfTopicId: t.id,
          cfTopicTitle: t.title,
          subtopicTitle: st.title,
        }),
      ),
    ),
  );
  return all;
}
function getAllLCProblems() {
  const all = [];
  if (!DSA_DATA.leetcode) return all;
  DSA_DATA.leetcode.topics.forEach((t) =>
    t.subtopics.forEach((st) =>
      st.problems.forEach((p) =>
        all.push({
          ...p,
          lcTopicId: t.id,
          lcTopicTitle: t.title,
          subtopicTitle: st.title,
        }),
      ),
    ),
  );
  return all;
}
function getCFProblemById(id) {
  return getAllCFProblems().find((p) => p.id === id) || null;
}
function getLCProblemById(id) {
  return getAllLCProblems().find((p) => p.id === id) || null;
}
function getTotalProblems() {
  return (
    getAllProblems().length +
    getAllCFProblems().length +
    getAllLCProblems().length
  );
}
function getSolvedCount() {
  return Object.values(getCompleted()).filter(Boolean).length;
}

/* ================================================================
   STREAK HELPERS
   ================================================================ */
function getStreakCount() {
  const dates = DB.get("solve_dates") || {};
  let streak = 0;
  let d = new Date();
  while (dates[d.toDateString()]) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

/* ================================================================
   SYNC STATUS UI
   ================================================================ */
onSyncStatusChange((s) => {
  document.querySelectorAll(".sync-badge").forEach((badge) => {
    badge.className = "sync-badge " + s;
  });
  document.querySelectorAll(".sync-label-text").forEach((label) => {
    label.textContent = s === "offline" ? "local" : s;
  });
});

/* ================================================================
   SIDEBAR NAV
   ================================================================ */
function toggleNavGroup(id, el) {
  document.getElementById(id).classList.toggle("collapsed");
  el.classList.toggle("collapsed");
}

function buildNav() {
  const dsaNav = document.getElementById("topic-nav");
  dsaNav.innerHTML = "";

  dsaNav.innerHTML += `
    <div class="nav-topic nav-topic-lc" onclick="showView('leetcode')" id="nav-leetcode">
      <span class="nav-icon" style="color:#e8a838"></span><span style="color:#e8a838; font-weight:500;">Leetcode</span>
    </div>`;
  

  DSA_DATA.topics.forEach((t) => {
    const el = document.createElement("div");
    el.className = "nav-topic";
    el.id = "nav-topic-" + t.id;
    el.innerHTML = `<span class="nav-icon" style="color:#e8a838">${t.icon}</span><span>${t.title}</span>`;
    el.onclick = () => showTopic(t.id);
    dsaNav.appendChild(el);
    t.subtopics.forEach((st) => {
      const sub = document.createElement("div");
      sub.className = "nav-sub";
      sub.id = "nav-sub-" + st.id;
      sub.textContent = st.title;
      sub.onclick = (e) => {
        e.stopPropagation();
        showTopic(t.id, st.id);
      };
      dsaNav.appendChild(sub);
    });
  });

  const cpNav = document.getElementById("cf-topic-nav");
  cpNav.innerHTML = "";
  cpNav.innerHTML += `
    <div class="nav-topic nav-topic-cf" onclick="showView('codeforces')" id="nav-codeforces">
    <span class="nav-icon" style="color:#e8a838"></span>
      <span style="color:#6a7acc; font-weight:500;">Codeforces</span>
    </div>`;
  if (DSA_DATA.codeforces) {
    DSA_DATA.codeforces.topics.forEach((t) => {
      const el = document.createElement("div");
      el.className = "nav-topic nav-topic-cf";
      el.id = "nav-cftopic-" + t.id;
      el.innerHTML = `<span class="nav-icon" style="color:#6a7acc">${t.icon}</span><span>${t.title}</span>`;
      el.onclick = () => showCFTopic(t.id);
      cpNav.appendChild(el);
    });
  }
  buildMobDrawerContent();
}

function buildMobDrawerContent() {
  const c = document.getElementById("mob-drawer-content");
  if (!c) return;
  c.innerHTML = "";
  c.innerHTML += `<div class="mob-drawer-section" style="color:#e8a838;">DSA Topics</div>`;
  c.innerHTML += `<div class="mob-drawer-item" onclick="closeMobDrawer(); showView('leetcode')"><span class="mob-drawer-icon" style="color:#e8a838">❖</span>LeetCode Platform</div>`;
  if (DSA_DATA.leetcode) {
    DSA_DATA.leetcode.topics.forEach((t) => {
      const el = document.createElement("div");
      el.className = "mob-drawer-item";
      el.innerHTML = `<span class="mob-drawer-icon" style="color:#e8a838">↳</span>${t.title}`;
      el.onclick = () => {
        closeMobDrawer();
        showLCTopic(t.id);
      };
      c.appendChild(el);
    });
  }
  DSA_DATA.topics.forEach((t) => {
    const el = document.createElement("div");
    el.className = "mob-drawer-item";
    el.innerHTML = `<span class="mob-drawer-icon" style="color:#e8a838">${t.icon}</span>${t.title}`;
    el.onclick = () => {
      closeMobDrawer();
      showTopic(t.id);
    };
    c.appendChild(el);
  });
  c.innerHTML += `<div class="mob-drawer-section" style="color:#6a7acc; margin-top:16px;">Competitive Programming</div>`;
  c.innerHTML += `<div class="mob-drawer-item" onclick="closeMobDrawer(); showView('codeforces')"><span class="mob-drawer-icon" style="color:#6a7acc">⬡</span>Codeforces Platform</div>`;
  if (DSA_DATA.codeforces) {
    DSA_DATA.codeforces.topics.forEach((t) => {
      const el = document.createElement("div");
      el.className = "mob-drawer-item";
      el.innerHTML = `<span class="mob-drawer-icon" style="color:#6a7acc">${t.icon}</span>${t.title}`;
      el.onclick = () => {
        closeMobDrawer();
        showCFTopic(t.id);
      };
      c.appendChild(el);
    });
  }
}

/* ================================================================
   VIEW ROUTING
   ================================================================ */
function showView(name) {
  document
    .querySelectorAll(".view")
    .forEach((v) => v.classList.remove("active"));
  document
    .querySelectorAll(".nav-topic, .nav-sub")
    .forEach((n) => n.classList.remove("active"));
  document
    .querySelectorAll(".mob-tab")
    .forEach((b) => b.classList.remove("active"));

  const view = document.getElementById("view-" + name);
  if (view) view.classList.add("active");
  const navEl = document.getElementById("nav-" + name);
  if (navEl) navEl.classList.add("active");
  const mobEl = document.getElementById("mobtab-" + name);
  if (mobEl) mobEl.classList.add("active");

  document.getElementById("main").scrollTop = 0;

  if (name === "dashboard") buildDashboard();
  if (name === "dayplan") buildDayPlan();
  if (name === "notes") buildNotes();
  if (name === "patterns") buildPatterns();
  if (name === "codeforces") buildPlatformDashboard("codeforces");
  if (name === "leetcode") buildPlatformDashboard("leetcode");
}

function showTopic(topicId, scrollToSubtopic) {
  document
    .querySelectorAll(".view")
    .forEach((v) => v.classList.remove("active"));
  document
    .querySelectorAll(".nav-topic, .nav-sub")
    .forEach((n) => n.classList.remove("active"));
  document
    .querySelectorAll(".mob-tab")
    .forEach((b) => b.classList.remove("active"));
  document.getElementById("view-topic").classList.add("active");
  const navEl = document.getElementById("nav-topic-" + topicId);
  if (navEl) navEl.classList.add("active");
  buildTopicView(topicId);
  document.getElementById("main").scrollTop = 0;
  if (scrollToSubtopic) {
    setTimeout(() => {
      const el = document.getElementById("subtopic-" + scrollToSubtopic);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }
}

function showCFTopic(topicId) {
  document
    .querySelectorAll(".view")
    .forEach((v) => v.classList.remove("active"));
  document
    .querySelectorAll(".nav-topic, .nav-sub")
    .forEach((n) => n.classList.remove("active"));
  document.getElementById("view-codeforces").classList.add("active");
  const navEl = document.getElementById("nav-cftopic-" + topicId);
  if (navEl) navEl.classList.add("active");
  buildPlatformTopicView("codeforces", topicId);
  document.getElementById("main").scrollTop = 0;
}

function showLCTopic(topicId) {
  document
    .querySelectorAll(".view")
    .forEach((v) => v.classList.remove("active"));
  document
    .querySelectorAll(".nav-topic, .nav-sub")
    .forEach((n) => n.classList.remove("active"));
  document.getElementById("view-leetcode").classList.add("active");
  const navEl = document.getElementById("nav-lcsub-" + topicId);
  if (navEl) navEl.classList.add("active");
  buildPlatformTopicView("leetcode", topicId);
  document.getElementById("main").scrollTop = 0;
}

function mobTab(name) {
  showView(name);
}

function toggleMobTopicsMenu() {
  document.getElementById("mob-topics-drawer").classList.toggle("open");
  document.getElementById("mob-drawer-overlay").classList.toggle("open");
}
function closeMobDrawer() {
  document.getElementById("mob-topics-drawer").classList.remove("open");
  document.getElementById("mob-drawer-overlay").classList.remove("open");
}

/* ================================================================
   PROGRESS
   ================================================================ */
function updateProgress() {
  const solved = getSolvedCount(),
    total = getTotalProblems();
  const pct = total ? Math.round((solved / total) * 100) : 0;
  document.getElementById("progress-pct").textContent = pct + "%";
  document.getElementById("progress-fill").style.width = pct + "%";
  const mobPct = document.getElementById("mob-pct");
  const mobFill = document.getElementById("mob-bar-fill");
  if (mobPct) mobPct.textContent = pct + "%";
  if (mobFill) mobFill.style.width = pct + "%";
}

/* ================================================================
   HEATMAP  (365-day contribution style)
   ================================================================ */
function buildHeatmap(container) {
  const dates = DB.get("solve_dates") || {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build solve-count per day from solve_times
  const solveTimes = DB.get("solve_times") || {};
  const countMap = {};
  Object.values(solveTimes).forEach((ts) => {
    if (!ts) return;
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    const key = d.toDateString();
    countMap[key] = (countMap[key] || 0) + 1;
  });

  // Also count any date flagged in solve_dates
  Object.keys(dates).forEach((k) => {
    if (!countMap[k]) countMap[k] = 1;
  });

  const WEEKS = 18;
  const DAYS = 7;

  // Start from WEEKS*7 days ago, aligned to Sunday
  const start = new Date(today);
  start.setDate(start.getDate() - (WEEKS * DAYS - 1));
  // Align to the start of week (Sunday)
  start.setDate(start.getDate() - start.getDay());

  const cells = [];
  for (let w = 0; w < WEEKS; w++) {
    for (let d = 0; d < DAYS; d++) {
      const dt = new Date(start);
      dt.setDate(start.getDate() + w * 7 + d);
      cells.push(dt);
    }
  }

  const maxCount = Math.max(1, ...Object.values(countMap));

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  container.innerHTML = `
    <div class="heatmap-wrap">
      <div class="heatmap-title">activity heatmap</div>
      <div class="heatmap-outer">
        <div class="heatmap-day-labels">
          ${dayLabels.map((l) => `<div class="heatmap-day-label">${l}</div>`).join("")}
        </div>
        <div class="heatmap-grid" id="heatmap-grid-cells"></div>
      </div>
      <div class="heatmap-legend">
        <span class="heatmap-legend-label">less</span>
        <div class="heatmap-legend-cell" style="background:var(--heat-empty)"></div>
        <div class="heatmap-legend-cell" style="background:var(--heat-low)"></div>
        <div class="heatmap-legend-cell" style="background:var(--heat-mid)"></div>
        <div class="heatmap-legend-cell" style="background:var(--heat-high)"></div>
        <div class="heatmap-legend-cell" style="background:#7aba8a"></div>
        <span class="heatmap-legend-label">more</span>
      </div>
    </div>`;

  const grid = container.querySelector("#heatmap-grid-cells");
  // grid is columns (weeks) × rows (days)
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = `repeat(${WEEKS}, 1fr)`;
  grid.style.gridTemplateRows = `repeat(${DAYS}, 1fr)`;
  grid.style.gridAutoFlow = "column";

  cells.forEach((dt) => {
    const key = dt.toDateString();
    const count = countMap[key] || 0;
    const isFuture = dt > today;
    const cell = document.createElement("div");
    cell.className = "heatmap-cell";
    if (!isFuture) {
      if (count === 0) cell.style.background = "var(--heat-empty)";
      else {
        const ratio = count / maxCount;
        if (ratio < 0.25) cell.style.background = "var(--heat-low)";
        else if (ratio < 0.5) cell.style.background = "var(--heat-mid)";
        else if (ratio < 0.75) cell.style.background = "var(--heat-high)";
        else cell.style.background = "#7aba8a";
      }
      cell.title = `${dt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} — ${count} problem${count !== 1 ? "s" : ""}`;
    } else {
      cell.style.background = "transparent";
    }
    grid.appendChild(cell);
  });
}

/* ================================================================
   SMART REVIEW BLOCK (intelligent 7-day recommendations)
   ================================================================ */
function buildReviewBlock() {
  const container = document.getElementById("review-block-container");
  const c = getCompleted();
  const solveTimes = DB.get("solve_times") || {};
  const diffRatings = getDiffRatings();
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  // Score = urgency based on time elapsed + personal difficulty rating
  const diffWeight = { easy: 14, medium: 7, hard: 4, brutal: 2, undefined: 7 };

  const due = getAllProblems()
    .concat(getAllCFProblems())
    .concat(getAllLCProblems())
    .filter((p) => c[p.id] && solveTimes[p.id])
    .map((p) => {
      const elapsedDays = (now - solveTimes[p.id]) / DAY;
      const myRating = diffRatings[p.id]; // how hard I found it
      const reviewInterval = diffWeight[myRating]; // days before re-review
      const overdue = elapsedDays - reviewInterval;
      return { ...p, elapsedDays, overdue, myRating };
    })
    .filter((p) => p.overdue >= 0) // only truly due
    .sort((a, b) => {
      // Prioritize: harder personal rating + more overdue
      const hardnessScore = { brutal: 4, hard: 3, medium: 2, easy: 1 };
      const aScore = (hardnessScore[a.myRating] || 2) * (1 + a.overdue / 7);
      const bScore = (hardnessScore[b.myRating] || 2) * (1 + b.overdue / 7);
      return bScore - aScore;
    })
    .slice(0, 8);

  if (!due.length) {
    container.innerHTML = "";
    return;
  }

  const block = document.createElement("div");
  block.className = "review-block";
  block.innerHTML = `<div class="review-block-title">⟳ smart review — due for revisit</div>`;
  due.forEach((p) => {
    const daysAgo = Math.floor(p.elapsedDays);
    const ratingLabel = p.myRating
      ? `<span class="review-my-diff my-diff-${p.myRating}">${p.myRating}</span>`
      : "";
    const pill = document.createElement("span");
    pill.className = "review-pill";
    pill.innerHTML = `${p.title} ${ratingLabel} <span class="days-ago">${daysAgo}d ago</span>`;
    pill.onclick = () => openModal(p.id);
    block.appendChild(pill);
  });
  container.innerHTML = "";
  container.appendChild(block);
}

/* ================================================================
   DASHBOARD
   ================================================================ */
function buildDashboard() {
  const solved = getSolvedCount(),
    total = getTotalProblems();
  const allProbs = getAllProblems();
  const c = getCompleted();

  document.getElementById("stat-solved").textContent = solved;
  document.getElementById("stat-total-problems").textContent = "of " + total;

  const subtopicCount = DSA_DATA.topics.reduce(
    (a, t) => a + t.subtopics.length,
    0,
  );
  const completedSubs = DSA_DATA.topics.reduce(
    (a, t) =>
      a + t.subtopics.filter((st) => st.problems.every((p) => c[p.id])).length,
    0,
  );
  document.getElementById("stat-patterns").textContent = completedSubs;
  document.getElementById("stat-patterns-total").textContent =
    "of " + subtopicCount;

  let maxDay = 1;
  allProbs.forEach((p) => {
    if (c[p.id] && p.day > maxDay) maxDay = p.day;
  });
  document.getElementById("stat-day").textContent = maxDay;
  document.getElementById("stat-streak").textContent = getStreakCount();

  buildReviewBlock();

  // Heatmap
  const heatEl = document.getElementById("heatmap-container");
  if (heatEl) buildHeatmap(heatEl);

  const byDay = {};
  allProbs.forEach((p) => {
    (byDay[p.day] = byDay[p.day] || []).push(p);
  });
  const days = Object.keys(byDay)
    .map(Number)
    .sort((a, b) => a - b);
  const startIdx = Math.max(0, days.indexOf(maxDay));
  const showDays = days.slice(startIdx, startIdx + 6);

  const cont = document.getElementById("dash-days");
  cont.innerHTML = "";
  showDays.forEach((day) => {
    const probs = byDay[day];
    const row = document.createElement("div");
    row.className = "day-row";
    row.innerHTML = `
      <div class="day-label">
        <div class="day-num">${String(day).padStart(2, "0")}</div>
        <div class="day-word">day</div>
      </div>
      <div class="day-problems" id="dash-dayprobs-${day}"></div>`;
    cont.appendChild(row);
    renderDashDayProblems(day, probs);
  });
  updateProgress();
}

function renderDashDayProblems(day, probs) {
  const c = getCompleted();
  const container = document.getElementById("dash-dayprobs-" + day);
  if (!container) return;
  container.innerHTML = "";
  probs.forEach((p) => {
    const done = !!c[p.id];
    const row = document.createElement("div");
    row.className = "day-problem-row";
    row.innerHTML = `
      <div class="day-prob-check ${done ? "checked" : ""}" id="dashchk-${p.id}" onclick="toggleDashProblem('${p.id}', ${day})">
        <span class="day-prob-check-icon">✓</span>
      </div>
      <span class="day-prob-name ${done ? "done" : ""}" id="dashname-${p.id}" onclick="openModal('${p.id}')">${p.title}</span>
      <span class="day-prob-diff diff-${p.difficulty}">${p.difficulty}</span>
      <button class="day-prob-timer" onclick="openTimer('${p.id}')">▷</button>`;
    container.appendChild(row);
  });
}

function toggleDashProblem(probId, day) {
  const c = getCompleted();
  c[probId] = !c[probId];
  setCompleted(c);
  recordSolveTime(probId, c[probId]);
  const chk = document.getElementById("dashchk-" + probId);
  const name = document.getElementById("dashname-" + probId);
  if (chk) chk.classList.toggle("checked", !!c[probId]);
  if (name) name.classList.toggle("done", !!c[probId]);
  if (c[probId]) showSolveCapture(probId);
  updateProgress();
  buildDashboard();
}

function recordSolveTime(probId, solved) {
  if (!solved) return;
  const times = DB.get("solve_times") || {};
  times[probId] = Date.now();
  DB.set("solve_times", times);
  const dates = DB.get("solve_dates") || {};
  dates[new Date().toDateString()] = true;
  DB.set("solve_dates", dates);
  syncAfterChange();
}

/* ================================================================
   TOPIC VIEW
   ================================================================ */
function buildTopicView(topicId) {
  const topic = DSA_DATA.topics.find((t) => t.id === topicId);
  if (!topic) return;
  const c = getCompleted();
  const total = topic.subtopics.reduce((a, s) => a + s.problems.length, 0);
  const solved = topic.subtopics.reduce(
    (a, s) => a + s.problems.filter((p) => c[p.id]).length,
    0,
  );

  document.getElementById("topic-header").innerHTML = `
    <div class="breadcrumb">
      <span onclick="showView('dashboard')">home</span><span>›</span><span>${topic.title}</span>
    </div>
    <div class="topic-title">${topic.title}</div>
    <div class="topic-meta">${solved} / ${total} solved · ${topic.subtopics.length} patterns</div>`;

  const content = document.getElementById("topic-content");
  content.innerHTML = "";
  topic.subtopics.forEach((st) => {
    const stSolved = st.problems.filter((p) => c[p.id]).length;
    const block = document.createElement("div");
    block.className = "subtopic-block";
    block.id = "subtopic-" + st.id;
    block.innerHTML = `
      <div class="subtopic-title-row" onclick="toggleSubtopic('${st.id}')">
        <div class="subtopic-name">${st.title}</div>
        <div class="subtopic-count">${stSolved}/${st.problems.length}</div>
        <div class="subtopic-toggle" id="stoggle-${st.id}">collapse ↑</div>
      </div>
      <div class="subtopic-desc">${st.description}</div>
      <div class="subtopic-body" id="stbody-${st.id}">
        <div class="problem-table">${st.problems.map((p) => buildProblemRow(p)).join("")}</div>
      </div>`;
    content.appendChild(block);
  });
}

function toggleSubtopic(id) {
  const body = document.getElementById("stbody-" + id);
  const tog = document.getElementById("stoggle-" + id);
  if (!body) return;
  body.classList.toggle("collapsed");
  tog.textContent = body.classList.contains("collapsed")
    ? "expand ↓"
    : "collapse ↑";
}

function buildProblemRow(p) {
  const done = getCompleted()[p.id] ? "completed" : "";
  const diffRatings = getDiffRatings();
  const myR = diffRatings[p.id];
  const myRatingHtml = myR
    ? `<span class="my-diff-badge my-diff-${myR}" title="Your difficulty rating">${myR}</span>`
    : `<span class="my-diff-badge my-diff-unset" onclick="event.stopPropagation();openDiffRatingPicker('${p.id}')" title="Rate difficulty">rate</span>`;

  return `
    <div class="problem-row ${done}" id="prow-${p.id}">
      <div class="p-check" onclick="toggleProblem('${p.id}')"><span class="p-check-icon">✓</span></div>
      <div class="p-name" onclick="openModal('${p.id}')">${p.title}</div>
      ${myRatingHtml}
      <div class="p-diff diff-${p.difficulty}">${p.difficulty}</div>
      <div class="p-platform plat-${p.platform}" onclick="window.open('${p.link}','_blank')">${p.platform === "leetcode" ? "LC" : "CF"}</div>
      <button class="p-hint-btn" onclick="toggleHint('${p.id}')">?</button>
    </div>
    <div class="hint-row" id="hint-${p.id}">
      <div class="hint-trigger-toggle" id="htoggle-${p.id}" onclick="toggleHintInner('${p.id}')">
        <span class="arrow">▶</span> pattern trigger &amp; hint
      </div>
      <div class="hint-trigger-content" id="hcontent-${p.id}">
        <div class="hint-trigger-tag">${p.trigger}</div>
        <div class="hint-body-text">${p.hint}</div>
      </div>
    </div>`;
}

function toggleHint(id) {
  document.getElementById("hint-" + id)?.classList.toggle("open");
}
function toggleHintInner(id) {
  document.getElementById("htoggle-" + id)?.classList.toggle("open");
  document.getElementById("hcontent-" + id)?.classList.toggle("open");
}

function toggleProblem(probId) {
  const c = getCompleted();
  c[probId] = !c[probId];
  setCompleted(c);
  recordSolveTime(probId, c[probId]);
  const row = document.getElementById("prow-" + probId);
  if (row) row.classList.toggle("completed", !!c[probId]);
  if (c[probId]) showSolveCapture(probId);
  updateProgress();
}

/* ================================================================
   DIFFICULTY RATING PICKER
   ================================================================ */
function openDiffRatingPicker(probId) {
  const overlay = document.getElementById("diff-rating-overlay");
  const content = document.getElementById("diff-rating-content");
  content.innerHTML = `
    <div class="diff-picker-title">how hard did you find this?</div>
    <div class="diff-picker-row">
      <button class="diff-picker-btn diff-picker-easy" onclick="saveDiffRating('${probId}','easy')">easy</button>
      <button class="diff-picker-btn diff-picker-medium" onclick="saveDiffRating('${probId}','medium')">medium</button>
      <button class="diff-picker-btn diff-picker-hard" onclick="saveDiffRating('${probId}','hard')">hard</button>
      <button class="diff-picker-btn diff-picker-brutal" onclick="saveDiffRating('${probId}','brutal')">brutal</button>
    </div>
    <div style="margin-top:10px;font-size:11px;color:var(--muted);font-family:var(--mono)">
      this helps the smart review system prioritise problems you struggled with
    </div>`;
  overlay.classList.add("open");
}

function saveDiffRating(probId, rating) {
  const r = getDiffRatings();
  r[probId] = rating;
  setDiffRatings(r);
  closeDiffRatingPicker();
  // Refresh visible row if present
  const row = document.getElementById("prow-" + probId);
  if (row) {
    const badge = row.querySelector(".my-diff-badge");
    if (badge) {
      badge.className = `my-diff-badge my-diff-${rating}`;
      badge.textContent = rating;
      badge.title = "Your difficulty rating";
      badge.onclick = null;
    }
  }
  // Also refresh platform rows
  const platrow = document.getElementById("platrow-" + probId);
  if (platrow) {
    const badge = platrow.querySelector(".my-diff-badge");
    if (badge) {
      badge.className = `my-diff-badge my-diff-${rating}`;
      badge.textContent = rating;
    }
  }
}

function closeDiffRatingPicker() {
  document.getElementById("diff-rating-overlay")?.classList.remove("open");
}

/* ================================================================
   DAY PLAN & PATTERNS
   ================================================================ */
function buildDayPlan() {
  const allProbs = getAllProblems();
  const c = getCompleted();
  const byDay = {};
  allProbs.forEach((p) => {
    (byDay[p.day] = byDay[p.day] || []).push(p);
  });
  const days = Object.keys(byDay)
    .map(Number)
    .sort((a, b) => a - b);
  const container = document.getElementById("dayplan-content");
  container.innerHTML = "";
  days.forEach((day) => {
    const probs = byDay[day];
    const doneCnt = probs.filter((p) => c[p.id]).length;
    const dotClass =
      doneCnt === probs.length ? "all-done" : doneCnt > 0 ? "has-done" : "";
    const block = document.createElement("div");
    block.className = "dp-day-block";
    block.innerHTML = `
      <div class="dp-day-dot ${dotClass}" id="dot-day-${day}"></div>
      <div class="dp-day-content">
        <div class="dp-day-num">day ${String(day).padStart(2, "0")}</div>
        <div class="dp-day-topic">${probs[0].subtopicTitle}</div>
        ${probs
          .map(
            (p) => `
          <div class="dp-problem-item ${c[p.id] ? "done" : ""}" id="dpitem-${p.id}">
            <div class="dp-pcheck" onclick="toggleDpProblem('${p.id}',${day})"><span class="dp-pcheck-icon">✓</span></div>
            <span class="dp-pname" onclick="openModal('${p.id}')">${p.title}</span>
            <span class="dp-pdiff diff-${p.difficulty}">${p.difficulty}</span>
          </div>`,
          )
          .join("")}
      </div>`;
    container.appendChild(block);
  });
}

function toggleDpProblem(probId, day) {
  const c = getCompleted();
  c[probId] = !c[probId];
  setCompleted(c);
  recordSolveTime(probId, c[probId]);
  const item = document.getElementById("dpitem-" + probId);
  if (item) item.classList.toggle("done", !!c[probId]);
  if (c[probId]) showSolveCapture(probId);
  updateProgress();
  const probs = getAllProblems().filter((p) => p.day === day);
  const doneCnt = probs.filter((p) => c[p.id]).length;
  const dot = document.getElementById("dot-day-" + day);
  if (dot)
    dot.className =
      "dp-day-dot " +
      (doneCnt === probs.length ? "all-done" : doneCnt > 0 ? "has-done" : "");
}

function buildPatterns() {
  const grid = document.getElementById("pattern-grid");
  grid.innerHTML = "";
  const c = getCompleted();
  DSA_DATA.topics.forEach((t) => {
    t.subtopics.forEach((st) => {
      const solved = st.problems.filter((p) => c[p.id]).length;
      const total = st.problems.length;
      const pct = total ? Math.round((solved / total) * 100) : 0;
      const card = document.createElement("div");
      card.className = "pattern-card";
      card.innerHTML = `
        <div class="pattern-card-name">${st.title}</div>
        <div class="pattern-card-topic">${t.title}</div>
        <div class="pattern-bar-bg">
          <div class="pattern-bar-fill ${pct === 100 ? "full" : ""}" style="width:${pct}%"></div>
        </div>
        <div class="pattern-card-pct">${solved} / ${total} · ${pct}%</div>`;
      card.onclick = () => showTopic(t.id, st.id);
      grid.appendChild(card);
    });
  });
}

/* ================================================================
   NOTES  — inline expandable cards, no modal
   ================================================================ */
let _expandedNote = null; // index of currently expanded note
let _editingNote = null;  // index of note with editor open

function escHtml(str) {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildNotes() {
  const notes = getGlobalNotes();
  const container = document.getElementById("notes-content");
  container.innerHTML = "";

  if (!notes.length) {
    container.innerHTML = `<div class="notes-empty">No notes yet — hit "+ add note" to begin.</div>`;
    return;
  }

  notes.forEach((note, i) => {
    container.appendChild(buildNoteCard(note, i));
  });
}

function buildNoteCard(note, i) {
  const d = new Date(note.created || Date.now()).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
  const isExpanded = _expandedNote === i;
  const tagHtml = (note.tags || []).map(t => `<span class="note-tag">${escHtml(t)}</span>`).join("");

  const isEditing = _editingNote === i;

  const card = document.createElement("div");
  card.className = "note-card" + (isExpanded ? " expanded" : "") + (isEditing ? " editing" : "");
  card.id = "note-card-" + i;

  // ── Full content display (always visible) ──
  const contentHtml = (note.content || "").trim()
    ? `<div class="note-view-content">${renderNoteMarkdown(note.content)}</div>`
    : "";

  const codeHtml = note.code
    ? `<div class="note-view-section">
        <div class="note-view-section-label">${escHtml(note.codeLang || "code")}</div>
        <pre class="note-view-code"><code>${escHtml(note.code)}</code></pre>
       </div>`
    : "";

  const linksHtml = (note.links || []).length
    ? `<div class="note-view-section">
        <div class="note-view-section-label">links</div>
        <div class="note-view-links">${(note.links).map(l =>
          `<a href="${escHtml(l.url)}" target="_blank" class="note-view-link-item" onclick="event.stopPropagation()">&#128279; ${escHtml(l.label)}</a>`
        ).join("")}</div>
       </div>`
    : "";

  const imagesHtml = (note.images || []).length
    ? `<div class="note-view-section">
        <div class="note-view-section-label">images</div>
        <div class="note-view-images">${(note.images).map(img =>
          `<img src="${img.dataUrl}" alt="${escHtml(img.name)}" class="note-view-thumb" onclick="event.stopPropagation();expandNoteImage('${img.dataUrl}')" title="${escHtml(img.name)}">`
        ).join("")}</div>
       </div>`
    : "";

  const isEmpty = !note.content && !note.code && !note.links?.length && !note.images?.length;

  // Build compact metadata pills for collapsed state
  const metaPills = [];
  if (note.code) metaPills.push(`<span class="note-meta-pill note-meta-code">⌨ ${escHtml(note.codeLang || "code")}</span>`);
  if ((note.links||[]).length) metaPills.push(`<span class="note-meta-pill note-meta-links">🔗 ${note.links.length} link${note.links.length>1?'s':''}</span>`);
  if ((note.images||[]).length) metaPills.push(`<span class="note-meta-pill note-meta-images">🖼 ${note.images.length} image${note.images.length>1?'s':''}</span>`);

  // Content preview for collapsed state
  const previewText = (note.content || "").replace(/[#*`>-]/g, "").trim().slice(0, 160);

  card.innerHTML = `
    <div class="note-view" onclick="toggleNoteExpand(${i})">
      <div class="note-view-header">
        <div class="note-view-title-wrap">
          <div class="note-view-title">${escHtml(note.title) || '<span style="color:var(--muted);font-weight:400;font-style:italic">Untitled</span>'}</div>
          ${tagHtml ? `<div class="note-tags-row">${tagHtml}</div>` : ""}
        </div>
        <div class="note-view-header-right">
          <span class="note-card-date">${d}</span>
          <button class="note-edit-btn-pill" onclick="event.stopPropagation();toggleNoteEdit(${i})" title="${isEditing ? 'close editor' : 'edit note'}">${isEditing ? '✕ close' : '✏ edit'}</button>
        </div>
      </div>
      ${isEmpty
        ? `<div class="note-view-empty">empty note — click edit to add content</div>`
        : isExpanded
          ? `${contentHtml}${codeHtml}${linksHtml}${imagesHtml}`
          : `<div class="note-collapsed-preview">${escHtml(previewText)}${previewText.length===160?"…":""}</div>
             ${metaPills.length ? `<div class="note-meta-pills-row">${metaPills.join("")}</div>` : ""}`
      }
      ${!isEmpty && !isExpanded ? `<div class="note-expand-hint">click to expand</div>` : ""}
    </div>
    ${isEditing ? buildNoteEditorHTML(note, i) : ""}`;

  return card;
}

// Simple markdown-like renderer for note content
function renderNoteMarkdown(text) {
  return escHtml(text)
    .replace(/^### (.+)$/gm, '<div class="nv-h3">$1</div>')
    .replace(/^## (.+)$/gm, '<div class="nv-h2">$1</div>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="nv-code">$1</code>')
    .replace(/^&gt; (.+)$/gm, '<div class="nv-quote">$1</div>')
    .replace(/^- (.+)$/gm, '<div class="nv-li">&#8226; $1</div>')
    .replace(/\n/g, '<br>');
}

function buildNoteEditorHTML(note, i) {
  const langOpts = ["cpp","python","java","javascript","go","rust"]
    .map(l => `<option value="${l}"${(note.codeLang||"cpp")===l?" selected":""}>${l}</option>`).join("");

  const linksHtml = (note.links || []).map((l, li) =>
    `<div class="note-link-item">
      <a href="${escHtml(l.url)}" target="_blank" class="note-link-anchor">${escHtml(l.label)}</a>
      <button class="note-remove-btn" onclick="event.stopPropagation();removeInlineNoteLink(${i},${li})">✕</button>
    </div>`).join("");

  const imagesHtml = (note.images || []).map((img, ii) =>
    `<div class="note-image-item">
      <img src="${img.dataUrl}" alt="${escHtml(img.name)}" class="note-image-thumb" onclick="expandNoteImage('${img.dataUrl}')"/>
      <span class="note-image-name">${escHtml(img.name)}</span>
      <button class="note-remove-btn" onclick="event.stopPropagation();removeInlineNoteImage(${i},${ii})">✕</button>
    </div>`).join("");

  return `
    <div class="note-editor-body" onclick="event.stopPropagation()">

      <div class="note-editor-title-row">
        <input class="note-editor-title-input" id="nei-title-${i}"
          placeholder="Note title…"
          value="${escHtml(note.title || "")}"
          oninput="saveInlineNote(${i})" />
        <button class="note-delete-btn" onclick="deleteNote(${i})">delete</button>
      </div>

      <div class="note-editor-tabs" id="nei-tabs-${i}">
        <button class="note-tab active" onclick="switchInlineTab(${i},'write',this)">✏ write</button>
        <button class="note-tab" onclick="switchInlineTab(${i},'code',this)">⌨ code</button>
        <button class="note-tab" onclick="switchInlineTab(${i},'links',this)">🔗 links</button>
        <button class="note-tab" onclick="switchInlineTab(${i},'images',this)">🖼 images</button>
      </div>

      <!-- Write panel -->
      <div class="note-panel" id="nei-write-${i}">
        <div class="note-format-bar">
          <button class="note-fmt-btn" onclick="fmtNote(${i},'**','**')" title="Bold"><b>B</b></button>
          <button class="note-fmt-btn" onclick="fmtNote(${i},'*','*')" title="Italic"><i>I</i></button>
          <button class="note-fmt-btn" onclick="fmtNote(${i},'&#96;','&#96;')" title="Inline code">&#96;c&#96;</button>
          <button class="note-fmt-btn" onclick="fmtNotePrefix(${i},'- ')" title="List item">• list</button>
          <button class="note-fmt-btn" onclick="fmtNotePrefix(${i},'> ')" title="Quote">❝ quote</button>
          <button class="note-fmt-btn" onclick="fmtNotePrefix(${i},'### ')" title="Heading">H3</button>
        </div>
        <textarea class="note-textarea" id="nei-content-${i}"
          placeholder="Write your insights, patterns, aha moments…"
          oninput="saveInlineNote(${i})">${escHtml(note.content || "")}</textarea>
        <div class="note-tags-label-row">
          <span class="note-tags-label">tags</span>
          <input class="note-tags-input" id="nei-tags-${i}"
            placeholder="dp, graphs, greedy…"
            value="${escHtml((note.tags||[]).join(", "))}"
            oninput="saveInlineNote(${i})" />
        </div>
      </div>

      <!-- Code panel -->
      <div class="note-panel note-panel-hidden" id="nei-code-panel-${i}">
        <div class="note-code-header">
          <span class="note-tags-label">language</span>
          <select class="note-lang-select" id="nei-lang-${i}" onchange="saveInlineNote(${i})">${langOpts}</select>
        </div>
        <textarea class="note-textarea note-code-area" id="nei-code-${i}"
          placeholder="// paste your solution or snippet here…"
          spellcheck="false"
          oninput="saveInlineNote(${i})">${escHtml(note.code || "")}</textarea>
      </div>

      <!-- Links panel -->
      <div class="note-panel note-panel-hidden" id="nei-links-${i}">
        <div class="note-links-list" id="nei-links-list-${i}">${linksHtml || '<div class="note-panel-empty">No links yet.</div>'}</div>
        <button class="note-add-item-btn" onclick="addInlineNoteLink(${i})">+ add link</button>
      </div>

      <!-- Images panel -->
      <div class="note-panel note-panel-hidden" id="nei-images-${i}">
        <div class="note-images-grid" id="nei-images-grid-${i}">${imagesHtml || '<div class="note-panel-empty">No images yet.</div>'}</div>
        <button class="note-add-item-btn" onclick="addInlineNoteImage(${i})">+ upload image</button>
      </div>

      <div class="note-editor-footer">
        <span class="note-autosave-hint">auto-saved</span>
      </div>
    </div>`;
}

function toggleNoteExpand(i) {
  _expandedNote = (_expandedNote === i) ? null : i;
  // Close editor if collapsing
  if (_expandedNote !== i) _editingNote = null;
  buildNotes();
  if (_expandedNote === i) {
    setTimeout(() => {
      const card = document.getElementById("note-card-" + i);
      if (card) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  }
}

function toggleNoteEdit(i) {
  _editingNote = (_editingNote === i) ? null : i;
  // Ensure card is expanded when editing
  if (_editingNote === i) _expandedNote = i;
  buildNotes();
  if (_editingNote === i) {
    setTimeout(() => {
      const card = document.getElementById("note-card-" + i);
      if (card) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
      const ta = document.getElementById("nei-content-" + i);
      if (ta) ta.focus();
    }, 50);
  }
}

function switchInlineTab(i, tab, btn) {
  // Map tab name to panel element id (code panel has a different id to avoid collision with textarea)
  const panelIds = { write: `nei-write-${i}`, code: `nei-code-panel-${i}`, links: `nei-links-${i}`, images: `nei-images-${i}` };
  ["write","code","links","images"].forEach(t => {
    const p = document.getElementById(panelIds[t]);
    if (p) p.classList.toggle("note-panel-hidden", t !== tab);
  });
  document.querySelectorAll(`#nei-tabs-${i} .note-tab`).forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

function saveInlineNote(i) {
  const n = getGlobalNotes();
  const note = n[i] || {};
  const titleEl = document.getElementById(`nei-title-${i}`);
  const contentEl = document.getElementById(`nei-content-${i}`);
  const tagsEl = document.getElementById(`nei-tags-${i}`);
  const codeEl = document.getElementById(`nei-code-${i}`);
  const langEl = document.getElementById(`nei-lang-${i}`);
  if (titleEl) note.title = titleEl.value;
  if (contentEl) note.content = contentEl.value;
  if (tagsEl) note.tags = tagsEl.value.split(",").map(t => t.trim()).filter(Boolean);
  if (codeEl) note.code = codeEl.value;
  if (langEl) note.codeLang = langEl.value;
  n[i] = note;
  setGlobalNotes(n);
  // Live-refresh the view panel (title, content, code, links, images)
  const card = document.getElementById("note-card-" + i);
  if (!card) return;
  const titleDiv = card.querySelector(".note-view-title");
  if (titleDiv) titleDiv.innerHTML = escHtml(note.title) || '<span style="color:var(--muted);font-weight:400">Untitled</span>';
  const contentDiv = card.querySelector(".note-view-content");
  if (contentDiv) contentDiv.innerHTML = renderNoteMarkdown(note.content || "");
  const codeDiv = card.querySelector(".note-view-code code");
  if (codeDiv) codeDiv.textContent = note.code || "";
  const codeLabelDiv = card.querySelector(".note-view-section-label");
  if (codeLabelDiv && note.code !== undefined) codeLabelDiv.textContent = note.codeLang || "code";
}

// Formatting helpers
function fmtNote(i, before, after) {
  const ta = document.getElementById(`nei-content-${i}`);
  if (!ta) return;
  const s = ta.selectionStart, e = ta.selectionEnd;
  const sel = ta.value.slice(s, e) || "text";
  ta.value = ta.value.slice(0, s) + before + sel + after + ta.value.slice(e);
  ta.selectionStart = s + before.length;
  ta.selectionEnd = s + before.length + sel.length;
  ta.focus();
  saveInlineNote(i);
}
function fmtNotePrefix(i, prefix) {
  const ta = document.getElementById(`nei-content-${i}`);
  if (!ta) return;
  const s = ta.selectionStart;
  const lineStart = ta.value.lastIndexOf("\n", s - 1) + 1;
  ta.value = ta.value.slice(0, lineStart) + prefix + ta.value.slice(lineStart);
  ta.selectionStart = ta.selectionEnd = s + prefix.length;
  ta.focus();
  saveInlineNote(i);
}

function addNote() {
  const n = getGlobalNotes();
  const idx = n.length;
  n.push({ title: "", content: "", created: Date.now(), tags: [], links: [], images: [], code: "" });
  setGlobalNotes(n);
  _expandedNote = idx;
  _editingNote = idx;
  buildNotes();
  setTimeout(() => {
    const ta = document.getElementById(`nei-title-${idx}`);
    if (ta) ta.focus();
    const card = document.getElementById("note-card-" + idx);
    if (card) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 50);
}

function deleteNote(i) {
  if (confirm("Delete this note?")) {
    const n = getGlobalNotes();
    n.splice(i, 1);
    setGlobalNotes(n);
    if (_expandedNote === i) _expandedNote = null;
    else if (_expandedNote > i) _expandedNote--;
    if (_editingNote === i) _editingNote = null;
    else if (_editingNote !== null && _editingNote > i) _editingNote--;
    buildNotes();
  }
}

function addInlineNoteLink(i) {
  const url = prompt("Enter URL:");
  if (!url) return;
  const label = prompt("Label (optional):", url) || url;
  const n = getGlobalNotes();
  if (!n[i].links) n[i].links = [];
  n[i].links.push({ url, label });
  setGlobalNotes(n);
  const listEl = document.getElementById(`nei-links-list-${i}`);
  if (listEl) {
    listEl.innerHTML = n[i].links.map((l, li) =>
      `<div class="note-link-item">
        <a href="${escHtml(l.url)}" target="_blank" class="note-link-anchor">${escHtml(l.label)}</a>
        <button class="note-remove-btn" onclick="event.stopPropagation();removeInlineNoteLink(${i},${li})">✕</button>
      </div>`).join("");
  }
}

function removeInlineNoteLink(i, li) {
  const n = getGlobalNotes();
  n[i].links.splice(li, 1);
  setGlobalNotes(n);
  const listEl = document.getElementById(`nei-links-list-${i}`);
  if (listEl) {
    listEl.innerHTML = n[i].links.length
      ? n[i].links.map((l, idx) =>
          `<div class="note-link-item">
            <a href="${escHtml(l.url)}" target="_blank" class="note-link-anchor">${escHtml(l.label)}</a>
            <button class="note-remove-btn" onclick="event.stopPropagation();removeInlineNoteLink(${i},${idx})">✕</button>
          </div>`).join("")
      : '<div class="note-panel-empty">No links yet.</div>';
  }
}

function addInlineNoteImage(i) {
  const input = document.createElement("input");
  input.type = "file"; input.accept = "image/*";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const n = getGlobalNotes();
      if (!n[i].images) n[i].images = [];
      n[i].images.push({ dataUrl: ev.target.result, name: file.name });
      setGlobalNotes(n);
      const grid = document.getElementById(`nei-images-grid-${i}`);
      if (grid) {
        grid.innerHTML = n[i].images.map((img, ii) =>
          `<div class="note-image-item">
            <img src="${img.dataUrl}" alt="${escHtml(img.name)}" class="note-image-thumb" onclick="expandNoteImage('${img.dataUrl}')"/>
            <span class="note-image-name">${escHtml(img.name)}</span>
            <button class="note-remove-btn" onclick="event.stopPropagation();removeInlineNoteImage(${i},${ii})">✕</button>
          </div>`).join("");
      }
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function removeInlineNoteImage(i, ii) {
  const n = getGlobalNotes();
  n[i].images.splice(ii, 1);
  setGlobalNotes(n);
  const grid = document.getElementById(`nei-images-grid-${i}`);
  if (grid) {
    grid.innerHTML = n[i].images.length
      ? n[i].images.map((img, idx) =>
          `<div class="note-image-item">
            <img src="${img.dataUrl}" alt="${escHtml(img.name)}" class="note-image-thumb" onclick="expandNoteImage('${img.dataUrl}')"/>
            <span class="note-image-name">${escHtml(img.name)}</span>
            <button class="note-remove-btn" onclick="event.stopPropagation();removeInlineNoteImage(${i},${idx})">✕</button>
          </div>`).join("")
      : '<div class="note-panel-empty">No images yet.</div>';
  }
}

function expandNoteImage(src) {
  const d = document.createElement("div");
  d.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out";
  d.onclick = () => d.remove();
  d.innerHTML = `<img src="${src}" style="max-width:90vw;max-height:90vh;border-radius:8px;box-shadow:0 8px 40px #000">`;
  document.body.appendChild(d);
}

// Legacy stubs — kept so old modal HTML in index.html doesn't throw errors
function openNoteEditor(idx) { toggleNoteEdit(idx); }
function closeNoteEditor() { _editingNote = null; buildNotes(); }
function saveNoteEditorField() {}
function addNoteLink() {}
function renderNoteLinks() {}
function removeNoteLink() {}
function addNoteImage() {}
function renderNoteImages() {}
function removeNoteImage() {}
function closeNoteInsight() { document.getElementById("note-insight-overlay")?.classList.remove("open"); }
function openNoteInsight() {}

/* ================================================================
   PLATFORM DASHBOARDS (CODEFORCES & LEETCODE)
   ================================================================ */
/* ================================================================
   CF POINTS HELPER
   ================================================================ */
function getCFPoints(problems) {
  const c = getCompleted();
  return problems
    .filter((p) => c[p.id] && !isNaN(parseInt(p.difficulty)))
    .reduce((sum, p) => sum + parseInt(p.difficulty), 0);
}

function buildCFPointsBadge(points, topicPoints) {
  // Colour the badge based on highest rating bracket reached
  const colour =
    points >= 10000 ? "#ff6f6f" :
    points >= 6000  ? "#ffa05a" :
    points >= 3000  ? "#e8c060" :
    points >= 1500  ? "#8ab4f8" :
                      "#6a7acc";
  const topicHtml = topicPoints !== undefined
    ? `<span class="cf-pts-topic">+${topicPoints.toLocaleString()} this section</span>`
    : "";
  return `
    <div class="cf-points-badge">
     
      <span class="cf-pts-value" style="color:${colour}">${points.toLocaleString()}</span>
      ${topicHtml}
    </div>`;
}

function buildPlatformDashboard(platform) {
  const inner = document.getElementById(
    platform === "codeforces" ? "cf-view-inner" : "lc-view-inner",
  );
  inner.innerHTML = "";
  const data = DSA_DATA[platform];
  if (!data) return;

  const comp = data.competitions;
  const titleName =
    platform === "codeforces" ? "Codeforces Arena" : "LeetCode Arena";
  const themeColor = platform === "codeforces" ? "#6a7acc" : "#e8a838";
  const isLC = platform === "leetcode";

  inner.innerHTML = `
    <div class="cf-banner" style="${isLC ? "background: linear-gradient(135deg, #14110b 70%, #282014 50%); border-color: #4a3a2a;" : ""}">
      <div class="cf-banner-title" style="color:${isLC ? "#e8c888" : ""}">${titleName}</div>
      <div class="cf-banner-sub">Competitive programming — from brute force to graphs</div>
      <div class="cf-schedule-row">
        <div class="cf-schedule-badge" style="${isLC ? "background:rgba(232,168,56,0.12); border-color:rgba(232,168,56,0.25); color:#e8c888;" : ""}">
          <span class="dot" style="${isLC ? "background:#e8a838;" : ""}"></span>${comp.schedule}
        </div>
      </div>
      <div class="cf-tip">${comp.tip}</div>
      <div class="cf-links-row">
        <a href="${comp.links.upcoming}" target="_blank" class="cf-link-btn" style="${isLC ? "color:#e8c888; background:rgba(232,168,56,0.1); border-color:rgba(232,168,56,0.2);" : ""}">upcoming contests ↗</a>
        <a href="${comp.links.problemset}" target="_blank" class="cf-link-btn" style="${isLC ? "color:#e8c888; background:rgba(232,168,56,0.1); border-color:rgba(232,168,56,0.2);" : ""}">problemset ↗</a>
        <a href="${comp.links.edu}" target="_blank" class="cf-link-btn" style="${isLC ? "color:#e8c888; background:rgba(232,168,56,0.1); border-color:rgba(232,168,56,0.2);" : ""}">explore ↗</a>
      </div>
    </div>`;

  const allProbs =
    platform === "codeforces" ? getAllCFProblems() : getAllLCProblems();
  const solved = allProbs.filter((p) => getCompleted()[p.id]).length;
  const total = allProbs.length;

  const pointsBadgeHtml = platform === "codeforces"
    ? buildCFPointsBadge(getCFPoints(allProbs))
    : "";

  inner.innerHTML += `
    <div class="topic-title">Problem Sets</div>
    <div class="cf-dashboard-meta-row">
      <div class="topic-meta" style="margin-bottom:0">${solved} / ${total} problems solved</div>
      ${pointsBadgeHtml}
    </div>
    <div class="platform-grid" id="${platform}-grid"></div>`;

  const grid = document.getElementById(`${platform}-grid`);
  data.topics.forEach((t) => {
    const tTotal = t.subtopics.reduce((sum, st) => sum + st.problems.length, 0);
    const tSolved = t.subtopics.reduce(
      (sum, st) => sum + st.problems.filter((p) => getCompleted()[p.id]).length,
      0,
    );
    const card = document.createElement("div");
    card.className = "platform-card";
    card.innerHTML = `
      <div class="platform-card-header">
        <div class="platform-card-icon" style="color:${themeColor}">${t.icon}</div>
        <div class="platform-card-title">${t.title}</div>
      </div>
      <div class="platform-card-desc">${t.description}</div>
      <div class="platform-card-meta">${tSolved} / ${tTotal} Solved · ${t.subtopics.length} Sections</div>`;
    card.onclick = () =>
      platform === "codeforces" ? showCFTopic(t.id) : showLCTopic(t.id);
    grid.appendChild(card);
  });
}

function buildPlatformTopicView(platform, topicId) {
  const inner = document.getElementById(
    platform === "codeforces" ? "cf-view-inner" : "lc-view-inner",
  );
  const data = DSA_DATA[platform];
  const topic = data.topics.find((t) => t.id === topicId);
  if (!topic) return;

  inner.innerHTML = `
    <div class="breadcrumb">
      <span onclick="showView('dashboard')">home</span> ›
      <span onclick="showView('${platform}')" style="cursor:pointer">${platform}</span> ›
      <span>${topic.title}</span>
    </div>
    <div class="topic-title">${topic.title}</div>`;

  const solved = topic.subtopics.reduce(
    (a, st) => a + st.problems.filter((p) => getCompleted()[p.id]).length,
    0,
  );
  const total = topic.subtopics.reduce((a, st) => a + st.problems.length, 0);

  const allCFProbs = platform === "codeforces" ? getAllCFProblems() : [];
  const totalCFPoints = platform === "codeforces" ? getCFPoints(allCFProbs) : 0;
  const topicProbs = topic.subtopics.flatMap((st) => st.problems);
  const topicPoints = platform === "codeforces" ? getCFPoints(topicProbs) : 0;
  const pointsBadgeHtml = platform === "codeforces"
    ? buildCFPointsBadge(totalCFPoints, topicPoints)
    : "";

  inner.innerHTML += `
    <div class="cf-dashboard-meta-row" style="margin-bottom:24px">
      <div class="topic-meta" style="margin-bottom:0">${solved} / ${total} solved · ${topic.subtopics.length} subtopics</div>
      ${pointsBadgeHtml}
    </div>`;

  topic.subtopics.forEach((st) => {
    inner.appendChild(buildPlatformSubtopicBlock(platform, st));
  });
}

function buildPlatformSubtopicBlock(platform, st) {
  const c = getCompleted();
  const stSolved = st.problems.filter((p) => c[p.id]).length;
  const block = document.createElement("div");
  block.className = "subtopic-block";
  block.innerHTML = `
    <div class="subtopic-title-row" onclick="toggleSubtopic('${platform}-${st.id}')">
      <div class="subtopic-name">${st.title}</div>
      <div class="subtopic-count">${stSolved}/${st.problems.length}</div>
      <div class="subtopic-toggle" id="stoggle-${platform}-${st.id}">collapse ↑</div>
    </div>
    <div class="subtopic-desc">${st.description}</div>
    <div class="subtopic-body" id="stbody-${platform}-${st.id}">
      <div class="problem-table">${st.problems.map((p) => buildPlatformProblemRow(platform, p)).join("")}</div>
    </div>`;
  return block;
}

function buildPlatformProblemRow(platform, p) {
  const done = getCompleted()[p.id] ? "completed" : "";
  const tagsHtml = (p.tags || [])
    .map(
      (t) =>
        `<span class="cf-tag ${platform === "leetcode" ? "plat-leetcode-tag" : ""}">${t}</span>`,
    )
    .join("");
  const themeColor = platform === "codeforces" ? "#6a7acc" : "#e8a838";
  const diffRatings = getDiffRatings();
  const myR = diffRatings[p.id];
  const myRatingHtml = myR
    ? `<span class="my-diff-badge my-diff-${myR}">${myR}</span>`
    : `<span class="my-diff-badge my-diff-unset" onclick="event.stopPropagation();openDiffRatingPicker('${p.id}')">rate</span>`;

  return `
    <div class="problem-row-cf ${done}" id="platrow-${p.id}">
      <div class="p-check" onclick="togglePlatformProblem('${platform}','${p.id}')"><span class="p-check-icon">✓</span></div>
      <div class="p-name" onclick="openModal('${p.id}')">${p.title}</div>
      ${myRatingHtml}
      <div class="p-cf-rating" style="${platform === "leetcode" ? "background:var(--bg3); color:var(--text); border:1px solid var(--line2);" : ""}">${p.difficulty}</div>
      <div class="p-platform plat-${platform}" onclick="window.open('${p.link}','_blank')">${platform === "leetcode" ? "LC" : "CF"}</div>
      <button class="p-hint-btn" onclick="toggleCFHint('${p.id}')" style="border-color:${themeColor}40;color:${themeColor}">?</button>
    </div>
    <div class="cf-hint-row" id="cfhint-${p.id}">
      <div class="cf-tags-row">${tagsHtml}</div>
      <div class="hint-trigger-toggle" id="cfhtoggle-${p.id}" onclick="toggleCFHintInner('${p.id}')">
        <span class="arrow">▶</span> pattern trigger &amp; hint
      </div>
      <div class="hint-trigger-content" id="cfhcontent-${p.id}">
        <div class="hint-trigger-tag" style="background:${themeColor}1a;color:${themeColor}">${p.trigger}</div>
        <div class="hint-body-text">${p.hint}</div>
      </div>
    </div>`;
}

function togglePlatformProblem(platform, probId) {
  const c = getCompleted();
  c[probId] = !c[probId];
  setCompleted(c);
  recordSolveTime(probId, c[probId]);
  const row = document.getElementById("platrow-" + probId);
  if (row) row.classList.toggle("completed", !!c[probId]);
  if (c[probId]) showSolveCapture(probId);
  updateProgress();
}

function toggleCFHint(id) {
  document.getElementById("cfhint-" + id)?.classList.toggle("open");
}
function toggleCFHintInner(id) {
  document.getElementById("cfhtoggle-" + id)?.classList.toggle("open");
  document.getElementById("cfhcontent-" + id)?.classList.toggle("open");
}

/* ================================================================
   MODAL (problem detail)
   ================================================================ */
let currentModalId = null;

function openModal(probId) {
  let p = getAllProblems().find((x) => x.id === probId);
  let platformStyle = "leetcode",
    platName = "LeetCode";

  if (!p) {
    p = getCFProblemById(probId);
    if (p) {
      platformStyle = "codeforces";
      platName = "Codeforces";
    }
  }
  if (!p) {
    p = getLCProblemById(probId);
    if (p) {
      platformStyle = "leetcode";
      platName = "LeetCode";
    }
  }
  if (!p) return;

  currentModalId = probId;
  const c = getCompleted();
  const diffRatings = getDiffRatings();
  const savedCode = getSavedCode();
  const tagsHtml = p.tags
    ? p.tags
        .map(
          (t) =>
            `<span class="cf-tag ${platformStyle === "leetcode" ? "plat-leetcode-tag" : ""}">${t}</span>`,
        )
        .join("")
    : "";
  const themeColor = platformStyle === "codeforces" ? "#6a7acc" : "#e8a838";

  document.getElementById("modal-title").textContent = p.title;
  document.getElementById("modal-meta").innerHTML = `
    <span class="${p.tags ? "p-cf-rating" : "p-diff diff-" + p.difficulty}"
      style="${p.tags && platformStyle === "leetcode" ? "background:var(--bg3); color:var(--text); border:1px solid var(--line2);" : ""}">${p.difficulty}</span>
    <span class="p-platform plat-${platformStyle}" style="padding:2px 8px;border-radius:3px;font-family:var(--mono);font-size:11px">${platName}</span>
    ${p.day ? `<span style="font-family:var(--mono);font-size:11px;color:var(--muted)">Day ${p.day}</span>` : ""}
    ${tagsHtml ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">${tagsHtml}</div>` : ""}`;

  document.getElementById("modal-hint-section").innerHTML = `
    <div class="modal-hint-toggle" id="modal-hint-toggle" onclick="toggleModalHint()">
      <span class="arrow">▶</span>
      <span class="modal-section-label" style="margin:0;${p.tags ? "color:" + themeColor : ""}">pattern trigger &amp; hint</span>
    </div>
    <div class="modal-hint-content" id="modal-hint-content">
      <div class="modal-trigger" style="${p.tags ? `background:${themeColor}1a;color:${themeColor};` : ""}">${p.trigger}</div>
      <div class="modal-hint-text">${p.hint}</div>
    </div>`;

  document.getElementById("modal-link-container").innerHTML =
    `<a href="${p.link}" target="_blank" class="modal-link ${platformStyle === "leetcode" ? "lc" : "cf"}">Open on ${platName} ↗</a>`;

  const done = !!c[p.id];
  document.getElementById("modal-check-row").innerHTML = `
    <div class="p-check ${done ? "completed" : ""}" id="modal-chk" onclick="toggleFromModal('${p.id}')" style="width:18px;height:18px">
      <span class="p-check-icon">✓</span>
    </div>
    <span style="font-size:13px;color:var(--mid)" id="modal-check-label">${done ? "marked as solved" : "mark as solved"}</span>`;

  // Difficulty rating in modal
  const myR = diffRatings[p.id];
  document.getElementById("modal-diff-rating").innerHTML = `
    <div class="modal-section-label">personal difficulty</div>
    <div class="modal-diff-picker">
      ${["easy", "medium", "hard", "brutal"]
        .map(
          (r) =>
            `<button class="diff-picker-btn diff-picker-${r} ${myR === r ? "active" : ""}"
          onclick="saveModalDiffRating('${p.id}','${r}')">${r}</button>`,
        )
        .join("")}
    </div>`;

  const noteArea = document.getElementById("modal-note-area");
  noteArea.value = getNotes()[probId] || "";
  noteArea.oninput = () => {
    const n = getNotes();
    n[probId] = noteArea.value;
    setNotes(n);
  };

  // Code section
  const sc = savedCode[probId] || {};
  document.getElementById("modal-code-lang").value = sc.language || "cpp";
  document.getElementById("modal-code-area").value = sc.code || "";

  document.getElementById("modal-overlay").classList.add("open");
}

function saveModalDiffRating(probId, rating) {
  const r = getDiffRatings();
  r[probId] = rating;
  setDiffRatings(r);
  // Update buttons
  document
    .querySelectorAll(".modal-diff-picker .diff-picker-btn")
    .forEach((b) => b.classList.remove("active"));
  const active = document.querySelector(
    `.modal-diff-picker .diff-picker-${rating}`,
  );
  if (active) active.classList.add("active");
}

function saveModalCode() {
  const probId = currentModalId;
  if (!probId) return;
  const sc = getSavedCode();
  sc[probId] = {
    language: document.getElementById("modal-code-lang").value,
    code: document.getElementById("modal-code-area").value,
  };
  setSavedCode(sc);
  const btn = document.getElementById("modal-code-save-btn");
  if (btn) {
    btn.textContent = "saved ✓";
    setTimeout(() => (btn.textContent = "save code"), 1500);
  }
}

function toggleFromModal(probId) {
  const c = getCompleted();
  c[probId] = !c[probId];
  setCompleted(c);
  recordSolveTime(probId, c[probId]);
  const chk = document.getElementById("modal-chk");
  const lbl = document.getElementById("modal-check-label");
  if (chk) chk.classList.toggle("completed", !!c[probId]);
  if (lbl) lbl.textContent = c[probId] ? "marked as solved" : "mark as solved";
  const row = document.getElementById("prow-" + probId);
  if (row) row.classList.toggle("completed", !!c[probId]);
  const platrow = document.getElementById("platrow-" + probId);
  if (platrow) platrow.classList.toggle("completed", !!c[probId]);
  if (c[probId]) showSolveCapture(probId);
  updateProgress();
}

function toggleModalHint() {
  document.getElementById("modal-hint-toggle")?.classList.toggle("open");
  document.getElementById("modal-hint-content")?.classList.toggle("open");
}
function closeModal(e) {
  if (e.target === document.getElementById("modal-overlay")) closeModalDirect();
}
function closeModalDirect() {
  document.getElementById("modal-overlay").classList.remove("open");
  currentModalId = null;
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModalDirect();
    closeTimer();
    closeDiffRatingPicker();
    closeNoteInsight();
  }
});

/* ================================================================
   TIMER
   ================================================================ */
let timerInterval = null;
let timerSeconds = 25 * 60;
let timerRunning = false;
let timerProbId = null;

function openTimer(probId) {
  timerProbId = probId;
  resetTimer();
  const label = document.getElementById("timer-problem-label");
  if (probId) {
    const p =
      getAllProblems().find((x) => x.id === probId) ||
      getCFProblemById(probId) ||
      getLCProblemById(probId);
    label.textContent = p ? p.title : "focus session";
  } else {
    label.textContent = "focus session";
  }
  document.getElementById("timer-overlay").classList.add("open");
}
function openTimerForCurrent() {
  closeModalDirect();
  openTimer(currentModalId);
}
function closeTimer() {
  document.getElementById("timer-overlay").classList.remove("open");
  pauseTimer();
}
function closeTimerOnBg(e) {
  if (e.target === document.getElementById("timer-overlay")) closeTimer();
}
function setTimerPreset(mins, el) {
  document
    .querySelectorAll(".timer-preset")
    .forEach((p) => p.classList.remove("active"));
  el.classList.add("active");
  timerSeconds = mins * 60;
  timerRunning = false;
  clearInterval(timerInterval);
  document.getElementById("timer-start-btn").textContent = "start";
  updateTimerDisplay();
}
function toggleTimer() {
  if (timerRunning) pauseTimer();
  else startTimer();
}
function startTimer() {
  timerRunning = true;
  document.getElementById("timer-start-btn").textContent = "pause";
  timerInterval = setInterval(() => {
    timerSeconds--;
    updateTimerDisplay();
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      document.getElementById("timer-start-btn").textContent = "start";
      document.getElementById("timer-display").textContent = "00:00";
      if (Notification.permission === "granted") {
        new Notification("Time is up!", {
          body: "Your session ended. Did you solve it?",
        });
      } else {
        alert("Time is up! Your session has ended.");
      }
    }
  }, 1000);
}
function pauseTimer() {
  timerRunning = false;
  clearInterval(timerInterval);
  document.getElementById("timer-start-btn").textContent = "start";
}
function resetTimer() {
  pauseTimer();
  const activePreset = document.querySelector(".timer-preset.active");
  const mins = activePreset ? parseInt(activePreset.textContent) : 25;
  timerSeconds = mins * 60;
  updateTimerDisplay();
}
function updateTimerDisplay() {
  const m = Math.floor(timerSeconds / 60),
    s = timerSeconds % 60;
  const display = document.getElementById("timer-display");
  display.textContent =
    String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  display.className = "timer-display" + (timerSeconds < 300 ? " warning" : "");
}
if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission();
}

/* ================================================================
   POST-SOLVE CAPTURE
   ================================================================ */
let captureId = null;

function showSolveCapture(probId) {
  captureId = probId;
  const p =
    getAllProblems().find((x) => x.id === probId) ||
    getCFProblemById(probId) ||
    getLCProblemById(probId);
  const sub = document.getElementById("sc-problem-name");
  if (sub && p)
    sub.textContent = `"${p.title}" — what pattern trigger did you spot?`;
  document.getElementById("sc-input").value = "";
  document.getElementById("solve-capture").classList.add("open");
}

function closeSolveCapture(save) {
  if (save && captureId) {
    const val = document.getElementById("sc-input").value.trim();
    if (val) {
      const logs = getPatternLogs();
      if (!logs[captureId]) logs[captureId] = [];
      logs[captureId].push({ text: val, ts: Date.now() });
      setPatternLogs(logs);
      const notes = getNotes();
      const prefix = `[pattern log ${new Date().toLocaleDateString()}]: `;
      notes[captureId] =
        (notes[captureId] ? notes[captureId] + "\n" : "") + prefix + val;
      setNotes(notes);
    }
  }
  document.getElementById("solve-capture").classList.remove("open");
  captureId = null;
}

/* ================================================================
   EXPORT / IMPORT / SYNC
   ================================================================ */
function exportProgress() {
  const data = {
    completed: getCompleted(),
    notes: getNotes(),
    global_notes: getGlobalNotes(),
    solve_dates: DB.get("solve_dates") || {},
    solve_times: DB.get("solve_times") || {},
    pattern_logs: getPatternLogs(),
    diff_ratings: getDiffRatings(),
    saved_code: getSavedCode(),
    exported_at: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "dsa-progress.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importProgress(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.completed) DB.set("completed", data.completed);
      if (data.notes) DB.set("notes", data.notes);
      if (data.global_notes) DB.set("global_notes", data.global_notes);
      if (data.solve_dates) DB.set("solve_dates", data.solve_dates);
      if (data.solve_times) DB.set("solve_times", data.solve_times);
      if (data.pattern_logs) DB.set("pattern_logs", data.pattern_logs);
      if (data.diff_ratings) DB.set("diff_ratings", data.diff_ratings);
      if (data.saved_code) DB.set("saved_code", data.saved_code);
      alert("Progress imported successfully!");
      buildDashboard();
      updateProgress();
    } catch (e) {
      alert("Invalid file. Make sure you exported from this tracker.");
    }
  };
  reader.readAsText(file);
}

function openSyncCode() {
  const body = document.getElementById("synccode-body");
  const uid = typeof getSyncCode === "function" ? getSyncCode() : null;
  if (uid) {
    body.innerHTML = `
      <div class="modal-section-label">your sync code (click to copy)</div>
      <div class="synccode-display" onclick="copySyncCode('${uid}')" id="synccode-val">${uid}</div>
      <div class="synccode-or">── or link this device to another code ──</div>
      <input class="synccode-input" id="synccode-input" placeholder="paste sync code from another device…">
      <button class="sc-btn save" style="width:100%;padding:8px" onclick="applyLinkCode()">link devices</button>`;
  } else {
    body.innerHTML = `<div style="font-size:13px;color:var(--mid);line-height:1.6;margin-bottom:12px">Firebase not configured. Fill in sync.js config for cross-device sync.</div>`;
  }
  document.getElementById("synccode-overlay").classList.add("open");
}

function copySyncCode(code) {
  navigator.clipboard?.writeText(code).then(() => {
    const el = document.getElementById("synccode-val");
    if (el) {
      el.textContent = "copied!";
      setTimeout(() => (el.textContent = code), 1500);
    }
  });
}

async function applyLinkCode() {
  const input = document.getElementById("synccode-input");
  if (!input || !input.value.trim()) return;
  const ok = await linkSyncCode(input.value.trim());
  if (ok) {
    alert("Devices linked! Your progress will sync shortly.");
    closeSyncCode();
  }
}

function closeSyncCode() {
  document.getElementById("synccode-overlay").classList.remove("open");
}
function closeSyncCodeOnBg(e) {
  if (e.target === document.getElementById("synccode-overlay")) closeSyncCode();
}


/* ================================================================
   INITIALIZATION
   ================================================================ */
window.addEventListener("DOMContentLoaded", () => {
  buildNav();
  showView("dashboard");
  updateProgress();
  window._dsaAppReady = true;
  if (typeof initSync === "function") initSync();
});