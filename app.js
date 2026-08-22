/* ================================================================
   DSA TRACKER — app.js
   All application logic: storage, nav, views, notes, heatmap,
   difficulty rating, smart review recommendations, code saving,
   insights, and all original features.
   ================================================================ */

/* ================================================================
   CUSTOM DIALOGS — replaces all alert / confirm / prompt
   ================================================================ */
function _dialog(html, onMount) {
  const overlay = document.createElement("div");
  overlay.style.cssText =
    "position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:9000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px);padding:16px";
  overlay.innerHTML = `<div style="background:var(--bg2);border:1px solid var(--line2);border-radius:10px;padding:24px 24px 20px;max-width:360px;width:100%;box-shadow:0 16px 60px rgba(0,0,0,.6);font-family:var(--sans)">${html}</div>`;
  document.body.appendChild(overlay);
  const remove = () => overlay.remove();
  if (onMount) onMount(overlay.querySelector("div"), remove);
  return remove;
}

function showToast(msg, type = "info") {
  const t = document.createElement("div");
  const color =
    type === "error"
      ? "#c86868"
      : type === "success"
        ? "#5a8a6a"
        : "var(--accent2)";
  t.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--bg2);border:1px solid ${color};color:var(--text);font-family:var(--mono);font-size:12px;padding:10px 18px;border-radius:8px;z-index:9100;white-space:nowrap;box-shadow:0 4px 20px rgba(0,0,0,.4);transition:opacity .3s`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.opacity = "0";
    setTimeout(() => t.remove(), 320);
  }, 2400);
}

function showAlert(msg, type = "info") {
  _dialog(
    `<div style="font-size:13px;color:var(--text);line-height:1.6;margin-bottom:18px">${msg}</div>
     <div style="display:flex;justify-content:flex-end">
       <button id="dlg-ok" style="background:var(--bg4);border:1px solid var(--line2);color:var(--text);font-family:var(--mono);font-size:12px;padding:7px 20px;border-radius:6px;cursor:pointer">ok</button>
     </div>`,
    (box, remove) => {
      box.querySelector("#dlg-ok").onclick = remove;
    },
  );
}

function showConfirm(msg, onYes) {
  _dialog(
    `<div style="font-size:13px;color:var(--text);line-height:1.6;margin-bottom:18px">${msg}</div>
     <div style="display:flex;gap:8px;justify-content:flex-end">
       <button id="dlg-no"  style="background:none;border:1px solid var(--line2);color:var(--muted);font-family:var(--mono);font-size:12px;padding:7px 16px;border-radius:6px;cursor:pointer">cancel</button>
       <button id="dlg-yes" style="background:#2a1414;border:1px solid #7a3a3a;color:#c86868;font-family:var(--mono);font-size:12px;padding:7px 16px;border-radius:6px;cursor:pointer">delete</button>
     </div>`,
    (box, remove) => {
      box.querySelector("#dlg-no").onclick = remove;
      box.querySelector("#dlg-yes").onclick = () => {
        remove();
        onYes();
      };
    },
  );
}

function showPrompt(msg, placeholder, defaultVal, onSubmit) {
  _dialog(
    `<div style="font-size:13px;color:var(--text);margin-bottom:12px">${msg}</div>
     <input id="dlg-input" style="width:100%;background:var(--bg3);border:1px solid var(--line2);border-radius:6px;color:var(--text);font-family:var(--mono);font-size:13px;padding:8px 10px;outline:none;box-sizing:border-box" placeholder="${placeholder}" value="${defaultVal || ""}" />
     <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">
       <button id="dlg-cancel" style="background:none;border:1px solid var(--line2);color:var(--muted);font-family:var(--mono);font-size:12px;padding:7px 16px;border-radius:6px;cursor:pointer">cancel</button>
       <button id="dlg-ok" style="background:var(--bg4);border:1px solid var(--accent2);color:var(--accent);font-family:var(--mono);font-size:12px;padding:7px 16px;border-radius:6px;cursor:pointer">ok</button>
     </div>`,
    (box, remove) => {
      const inp = box.querySelector("#dlg-input");
      setTimeout(() => inp.focus(), 50);
      const submit = () => {
        remove();
        onSubmit(inp.value);
      };
      box.querySelector("#dlg-cancel").onclick = remove;
      box.querySelector("#dlg-ok").onclick = submit;
      inp.onkeydown = (e) => {
        if (e.key === "Enter") submit();
        if (e.key === "Escape") remove();
      };
    },
  );
}

var DB = window.DB || {
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
window.DB = DB;

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

// Review times: { probId: timestamp } — updated each time you mark a review done.
// Separate from solve_times so the review clock resets independently of solving.
const getReviewTimes = () => DB.get("review_times") || {};
const setReviewTimes = (o) => {
  DB.set("review_times", o);
  syncAfterChange();
};

function markReviewed(probId) {
  const rt = getReviewTimes();
  rt[probId] = Date.now();
  setReviewTimes(rt);
  // Also record today as an active day (reviewing counts)
  const dates = DB.get("solve_dates") || {};
  dates[new Date().toDateString()] = true;
  DB.set("solve_dates", dates);
  syncAfterChange();
  // Animate removal then rebuild
  const card = document.getElementById("rc-" + probId);
  if (card) {
    card.style.transition =
      "opacity .25s, max-height .3s, margin .3s, padding .3s";
    card.style.opacity = "0";
    card.style.maxHeight = "0";
    card.style.margin = "0";
    card.style.padding = "0";
    card.style.overflow = "hidden";
    setTimeout(() => buildReviewBlock(), 320);
  } else {
    buildReviewBlock();
  }
}

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
  // FIX: if today hasn't been solved yet, start the check from yesterday
  // so the streak doesn't reset to 0 first thing every morning.
  if (!dates[d.toDateString()]) d.setDate(d.getDate() - 1);
  while (dates[d.toDateString()]) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function getLongestStreak() {
  const dates = DB.get("solve_dates") || {};
  const keys = Object.keys(dates).sort((a, b) => new Date(a) - new Date(b));
  let best = 0,
    current = 0;
  let prev = null;
  keys.forEach((k) => {
    const d = new Date(k);
    if (prev) {
      const gap = Math.round((d - prev) / 86400000);
      current = gap === 1 ? current + 1 : 1;
    } else {
      current = 1;
    }
    if (current > best) best = current;
    prev = d;
  });
  return best;
}

function getTodaySolveCount() {
  const times = DB.get("solve_times") || {};
  const today = new Date().toDateString();
  return Object.values(times).filter(
    (ts) => ts && new Date(ts).toDateString() === today,
  ).length;
}

function getThisWeekSolveCount() {
  const times = DB.get("solve_times") || {};
  const now = Date.now();
  const WEEK = 7 * 24 * 60 * 60 * 1000;
  return Object.values(times).filter((ts) => ts && now - ts < WEEK).length;
}

function getWeeklyGoal() {
  return DB.get("weekly_goal") || 10;
}
function setWeeklyGoal(n) {
  DB.set("weekly_goal", n);
  syncAfterChange();
}

/* ================================================================
   SHARED SVG ICONS (no emoji — line icons matching the sidebar)
   ================================================================ */
const ICON_SVG = {
  brain: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4.5A2.5 2.5 0 0 0 6.5 7v.3A2.7 2.7 0 0 0 4.8 9.6v1.1c0 .9.5 1.7 1.2 2.1a2.6 2.6 0 0 0-.3 1.2 2.6 2.6 0 0 0 2.6 2.6h.2a2.5 2.5 0 0 0 2.5 2.2V6.8A2.3 2.3 0 0 0 9 4.5z"/><path d="M15 4.5A2.5 2.5 0 0 1 17.5 7v.3a2.7 2.7 0 0 1 1.7 2.3v1.1c0 .9-.5 1.7-1.2 2.1.2.4.3.8.3 1.2a2.6 2.6 0 0 1-2.6 2.6h-.2a2.5 2.5 0 0 1-2.5 2.2V6.8A2.3 2.3 0 0 1 15 4.5z"/></svg>`,
  puzzle: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8a2 2 0 0 1 2-2h2.2a1.6 1.6 0 1 1 3.1 0H13a2 2 0 0 1 2 2v1.7a1.6 1.6 0 1 1 0 3.1V15a2 2 0 0 1-2 2h-1.7a1.6 1.6 0 1 1-3.1 0H6a2 2 0 0 1-2-2v-2.2a1.6 1.6 0 1 1 0-3.1z"/></svg>`,
  book: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5a2 2 0 0 1 2-2h6v16H5a2 2 0 0 1-2-2z"/><path d="M21 5a2 2 0 0 0-2-2h-6v16h6a2 2 0 0 0 2-2z"/></svg>`,
  users: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M15.5 20v-1.5a3.5 3.5 0 0 0-3.5-3.5H6a3.5 3.5 0 0 0-3.5 3.5V20"/><circle cx="9" cy="7.5" r="3.3"/><path d="M21.5 20v-1.5a3.3 3.3 0 0 0-2.4-3.2"/><path d="M15 4.3a3.3 3.3 0 0 1 0 6.4"/></svg>`,
  file: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 2.5H7a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M13.5 2.5V8H19"/></svg>`,
  flask: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2.5v6.2L4.9 17a2 2 0 0 0 1.8 2.9h10.6a2 2 0 0 0 1.8-2.9l-4.6-8.3V2.5"/><path d="M8.3 2.5h7.4"/><path d="M7.3 14.5h9.4"/></svg>`,
  briefcase: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="7" width="19" height="12.5" rx="2"/><path d="M8 7V5.3a1.8 1.8 0 0 1 1.8-1.8h4.4A1.8 1.8 0 0 1 16 5.3V7"/><path d="M2.5 12.5h19"/></svg>`,
  target: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg>`,
  link: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 14.5 14.5 9.5"/><path d="M11 7l1.3-1.3a3 3 0 0 1 4.3 4.3L15.3 11.3"/><path d="M13 17l-1.3 1.3a3 3 0 0 1-4.3-4.3L8.7 12.7"/></svg>`,
  image: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="15" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 15.5 16.5 11 6 19"/></svg>`,
};

/* ================================================================
   SYNC STATUS UI
   ================================================================ */
if (typeof onSyncStatusChange === "function") {
  onSyncStatusChange((s) => {
    document.querySelectorAll(".sync-badge").forEach((badge) => {
      badge.className = "sync-badge " + s;
    });
    document.querySelectorAll(".sync-label-text").forEach((label) => {
      label.textContent = s === "offline" ? "local" : s;
    });
  });
}

/* ================================================================
   SIDEBAR NAV
   ================================================================ */
function toggleNavGroup(id, el) {
  const grp = document.getElementById(id);
  if (grp) grp.classList.toggle("collapsed");
  if (el) el.classList.toggle("collapsed");
}

function onDsaTrackerClick(el) {
  const group = document.getElementById("dsa-group");
  if (group && group.classList.contains("collapsed")) {
    group.classList.remove("collapsed");
    if (el) el.classList.remove("collapsed");
  }
  showView("dsa-dashboard");
}

function toggleDesktopSidebar() {
  const sb = document.getElementById("sidebar");
  if (!sb) return;
  const isCollapsed = sb.classList.toggle("collapsed");
  document.body.classList.toggle("sidebar-collapsed", isCollapsed);
  try {
    localStorage.setItem("dsa_sidebar_collapsed", isCollapsed ? "1" : "0");
  } catch (e) {}
}

function toggleMobSidebar() {
  const sb = document.getElementById("sidebar");
  const bd = document.getElementById("sidebar-backdrop");
  if (!sb) return;
  const isOpen = sb.classList.toggle("mob-open");
  if (bd) bd.classList.toggle("open", isOpen);
}

function closeMobSidebar() {
  const sb = document.getElementById("sidebar");
  const bd = document.getElementById("sidebar-backdrop");
  if (sb) sb.classList.remove("mob-open");
  if (bd) bd.classList.remove("open");
}

function buildNav() {
  const dsaNav = document.getElementById("topic-nav");
  dsaNav.innerHTML = "";

  DSA_DATA.topics.forEach((t) => {
    const el = document.createElement("div");
    el.className = "nav-topic";
    el.id = "nav-topic-" + t.id;
    el.innerHTML = `<span class="nav-icon" style="color:#e8a838">${t.icon}</span><span>${t.title}</span>`;
    el.onclick = () => {
      closeMobSidebar();
      showTopic(t.id);
    };
    dsaNav.appendChild(el);
    t.subtopics.forEach((st) => {
      const sub = document.createElement("div");
      sub.className = "nav-sub";
      sub.id = "nav-sub-" + st.id;
      sub.textContent = st.title;
      sub.onclick = (e) => {
        e.stopPropagation();
        closeMobSidebar();
        showTopic(t.id, st.id);
      };
      dsaNav.appendChild(sub);
    });
  });
}

/* ================================================================
   VIEW ROUTING & SCROLL MANAGEMENT
   ================================================================ */
function _scrollToTop() {
  const main = document.getElementById("main");
  if (main) main.scrollTop = 0;
  window.scrollTo(0, 0);
  if (document.documentElement) document.documentElement.scrollTop = 0;
  if (document.body) document.body.scrollTop = 0;
}

function showView(name) {
  closeMobSidebar();
  _scrollToTop();
  document
    .querySelectorAll(".view")
    .forEach((v) => v.classList.remove("active"));
  document
    .querySelectorAll(".nav-topic, .nav-sub, .nav-collapsible-topic")
    .forEach((n) => n.classList.remove("active"));

  const view = document.getElementById("view-" + name);
  if (view) view.classList.add("active");
  const navEl = document.getElementById("nav-" + name);
  if (navEl) navEl.classList.add("active");

  try {
    localStorage.setItem("dsa_current_view", JSON.stringify({ type: "view", name: name }));
  } catch (e) {}

  if (name === "dashboard") buildMainDashboard();
  if (name === "dsa-dashboard") buildDashboard();
  if (name === "dsa-dayplan") buildDayPlan();
  if (name === "dsa-patterns") buildPatterns();
  if (name === "dsa-revision") buildReviewBlock("review-block-container-full");
  if (name === "notes") buildNotes();
  if (name === "puzzles") buildPuzzlesView();
  if (name === "leetcode") buildPlatformDashboard("leetcode");
  if (name === "aptitude" && typeof buildAptitudeView === "function")
    buildAptitudeView();
  if (name === "hr" && typeof buildHRView === "function") buildHRView();
  if (name === "research" && typeof buildResearchView === "function")
    buildResearchView();
  if (name === "cs" && typeof buildCSView === "function") buildCSView();
  if (name === "systemdesign" && typeof buildSystemDesignView === "function")
    buildSystemDesignView();
  if (name === "applications" && typeof buildApplicationsView === "function")
    buildApplicationsView();
}

function showTopic(topicId, scrollToSubtopic) {
  closeMobSidebar();
  document
    .querySelectorAll(".view")
    .forEach((v) => v.classList.remove("active"));
  document
    .querySelectorAll(".nav-topic, .nav-sub, .nav-collapsible-topic")
    .forEach((n) => n.classList.remove("active"));
  document.getElementById("view-topic").classList.add("active");
  const navEl = document.getElementById("nav-topic-" + topicId);
  if (navEl) navEl.classList.add("active");
  buildTopicView(topicId);

  if (scrollToSubtopic) {
    setTimeout(() => {
      const el = document.getElementById("subtopic-" + scrollToSubtopic);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  } else {
    _scrollToTop();
  }

  try {
    localStorage.setItem("dsa_current_view", JSON.stringify({ type: "topic", topicId: topicId, subtopic: scrollToSubtopic || null }));
  } catch (e) {}
}

function showCFTopic(topicId) {
  closeMobSidebar();
  _scrollToTop();
  document
    .querySelectorAll(".view")
    .forEach((v) => v.classList.remove("active"));
  document
    .querySelectorAll(".nav-topic, .nav-sub, .nav-collapsible-topic")
    .forEach((n) => n.classList.remove("active"));
  document.getElementById("view-codeforces")?.classList.add("active");
  const navEl = document.getElementById("nav-cftopic-" + topicId);
  if (navEl) navEl.classList.add("active");
  buildPlatformTopicView("codeforces", topicId);

  try {
    localStorage.setItem("dsa_current_view", JSON.stringify({ type: "cf_topic", topicId: topicId }));
  } catch (e) {}
}

function showLCTopic(topicId) {
  closeMobSidebar();
  _scrollToTop();
  document
    .querySelectorAll(".view")
    .forEach((v) => v.classList.remove("active"));
  document
    .querySelectorAll(".nav-topic, .nav-sub, .nav-collapsible-topic")
    .forEach((n) => n.classList.remove("active"));
  document.getElementById("view-leetcode").classList.add("active");
  const navEl = document.getElementById("nav-lcsub-" + topicId);
  if (navEl) navEl.classList.add("active");
  buildPlatformTopicView("leetcode", topicId);

  try {
    localStorage.setItem("dsa_current_view", JSON.stringify({ type: "lc_topic", topicId: topicId }));
  } catch (e) {}
}

function restoreLastView() {
  let saved = null;
  try {
    const raw = localStorage.getItem("dsa_current_view");
    if (raw) saved = JSON.parse(raw);
  } catch (e) {}

  if (saved && saved.type === "topic" && saved.topicId) {
    const dsaGroup = document.getElementById("dsa-group");
    const dsaNav = document.getElementById("nav-dsa-dashboard");
    if (dsaGroup) dsaGroup.classList.remove("collapsed");
    if (dsaNav) dsaNav.classList.remove("collapsed");
    const topicsGroup = document.getElementById("topics-group");
    const topicsToggle = document.getElementById("nav-topics-group-toggle");
    if (topicsGroup) topicsGroup.classList.remove("collapsed");
    if (topicsToggle) topicsToggle.classList.remove("collapsed");

    showTopic(saved.topicId, saved.subtopic);
  } else if (saved && saved.type === "cf_topic" && saved.topicId) {
    showCFTopic(saved.topicId);
  } else if (saved && saved.type === "lc_topic" && saved.topicId) {
    showLCTopic(saved.topicId);
  } else if (saved && saved.type === "view" && saved.name) {
    if (saved.name.startsWith("dsa-")) {
      const dsaGroup = document.getElementById("dsa-group");
      const dsaNav = document.getElementById("nav-dsa-dashboard");
      if (dsaGroup) dsaGroup.classList.remove("collapsed");
      if (dsaNav) dsaNav.classList.remove("collapsed");
    }
    showView(saved.name);
  } else {
    showView("dashboard");
  }
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
   SMART REVIEW BLOCK
   Uses review_times (last reviewed) falling back to solve_times (first solved).
   This way "mark reviewed" properly resets the countdown — previously the
   block had no way to track that you'd done a review session at all.
   ================================================================ */
function buildReviewBlock(containerId) {
  const container = document.getElementById(
    containerId || "review-block-container",
  );
  if (!container) return;
  const c = getCompleted();
  const solveTimes = DB.get("solve_times") || {};
  const reviewTimes = getReviewTimes();
  const diffRatings = getDiffRatings();
  const notes = getNotes();
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  // Spaced-repetition intervals by personal difficulty
  const diffWeight = { easy: 14, medium: 7, hard: 3, brutal: 2 };
  const DEFAULT_INTERVAL = 7;

  const due = getAllProblems()
    .concat(getAllCFProblems())
    .concat(getAllLCProblems())
    .filter((p) => c[p.id] && solveTimes[p.id])
    .map((p) => {
      // Use the most recent of solve_time or review_time as the "last seen" anchor
      const lastSeen = Math.max(solveTimes[p.id] || 0, reviewTimes[p.id] || 0);
      const elapsedDays = (now - lastSeen) / DAY;
      const myRating = diffRatings[p.id];
      const interval = diffWeight[myRating] || DEFAULT_INTERVAL;
      const overdue = elapsedDays - interval;
      const nextDue = lastSeen + interval * DAY;
      return {
        ...p,
        elapsedDays,
        overdue,
        myRating,
        interval,
        nextDue,
        lastSeen,
      };
    })
    .filter((p) => p.overdue >= 0)
    .sort((a, b) => {
      const w = { brutal: 4, hard: 3, medium: 2, easy: 1 };
      return (
        (w[b.myRating] || 2) * (1 + b.overdue / 7) -
        (w[a.myRating] || 2) * (1 + a.overdue / 7)
      );
    })
    .slice(0, 8);

  if (!due.length) {
    // Show upcoming reviews instead of leaving the section blank
    const upcoming = getAllProblems()
      .concat(getAllCFProblems())
      .concat(getAllLCProblems())
      .filter((p) => c[p.id] && solveTimes[p.id])
      .map((p) => {
        const lastSeen = Math.max(
          solveTimes[p.id] || 0,
          reviewTimes[p.id] || 0,
        );
        const myRating = diffRatings[p.id];
        const interval = diffWeight[myRating] || DEFAULT_INTERVAL;
        const nextDue = lastSeen + interval * DAY;
        return { ...p, nextDue };
      })
      .filter((p) => p.nextDue > now)
      .sort((a, b) => a.nextDue - b.nextDue)
      .slice(0, 3);

    if (!upcoming.length) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = `
      <div class="review-block">
        <div class="review-block-title">✓ all caught up — next reviews</div>
        <div class="review-upcoming-list">
          ${upcoming
            .map((p) => {
              const daysUntil = Math.ceil((p.nextDue - now) / DAY);
              const myR = p.myRating
                ? `<span class="review-my-diff my-diff-${p.myRating}">${p.myRating}</span>`
                : "";
              return `<div class="review-upcoming-item">
              <span class="review-upcoming-name" onclick="openModal('${p.id}')">${p.title}</span>
              ${myR}
              <span class="review-upcoming-when">in ${daysUntil}d</span>
            </div>`;
            })
            .join("")}
        </div>
      </div>`;
    return;
  }

  const block = document.createElement("div");
  block.className = "review-block";
  block.innerHTML = `
    <div class="review-block-header">
      <div class="review-block-title">⟳ smart review — ${due.length} due</div>
      <div class="review-block-subtitle">ranked by urgency + your difficulty rating</div>
    </div>`;

  due.forEach((p) => {
    const daysAgo = Math.floor(p.elapsedDays);
    const overdueBy = Math.floor(p.overdue);
    const ratingHtml = p.myRating
      ? `<span class="review-my-diff my-diff-${p.myRating}">${p.myRating}</span>`
      : "";
    const notePreview = (notes[p.id] || "")
      .replace(/\[pattern log.*?\]:/g, "")
      .trim()
      .slice(0, 90);
    const urgencyClass =
      overdueBy > 7
        ? "review-card-urgent"
        : overdueBy > 2
          ? "review-card-late"
          : "";

    const card = document.createElement("div");
    card.className = `review-card ${urgencyClass}`;
    card.id = "rc-" + p.id;
    card.innerHTML = `
      <div class="review-card-top">
        <div class="review-card-name" onclick="openModal('${p.id}')">${p.title}</div>
        <div class="review-card-badges">
          ${ratingHtml}
          <span class="review-overdue-badge">${daysAgo}d ago</span>
        </div>
      </div>
      ${
        notePreview
          ? `<div class="review-card-note">"${notePreview}${notePreview.length === 90 ? "…" : ""}"</div>`
          : `<div class="review-card-hint">${(p.trigger || "").slice(0, 100)}</div>`
      }
      <div class="review-card-actions">
        <button class="review-open-btn" onclick="openModal('${p.id}')">open problem ↗</button>
        <button class="review-done-btn" onclick="markReviewed('${p.id}')">✓ mark reviewed</button>
      </div>`;
    block.appendChild(card);
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

  // Extra stats
  const todayEl = document.getElementById("stat-today");
  if (todayEl) todayEl.textContent = getTodaySolveCount();
  const bestStreakEl = document.getElementById("stat-best-streak");
  if (bestStreakEl) bestStreakEl.textContent = getLongestStreak();
  const weekEl = document.getElementById("stat-week");
  if (weekEl) weekEl.textContent = getThisWeekSolveCount();

  // Weekly goal widget
  buildWeeklyGoalWidget();

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

function buildWeeklyGoalWidget() {
  const el = document.getElementById("weekly-goal-widget");
  if (!el) return;
  const goal = getWeeklyGoal();
  const done = getThisWeekSolveCount();
  const pct = Math.min(100, Math.round((done / goal) * 100));
  const met = done >= goal;
  el.innerHTML = `
    <div class="wg-row">
      <span class="wg-label">weekly goal</span>
      <span class="wg-count ${met ? "wg-met" : ""}">${done} / ${goal}</span>
      <button class="wg-edit-btn" onclick="promptWeeklyGoal()" title="change goal">✎</button>
    </div>
    <div class="wg-bar-bg"><div class="wg-bar-fill ${met ? "wg-bar-met" : ""}" style="width:${pct}%"></div></div>
    ${met ? `<div class="wg-congrats">${ICON_SVG.target} weekly goal reached!</div>` : `<div class="wg-left">${goal - done} more to hit your goal</div>`}`;
}

function promptWeeklyGoal() {
  const current = getWeeklyGoal();
  showPrompt("Set weekly problem goal:", current, current, (val) => {
    const n = parseInt(val);
    if (n > 0) {
      setWeeklyGoal(n);
      buildWeeklyGoalWidget();
    }
  });
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
      <span onclick="showView('dsa-dashboard')">home</span><span>›</span><span>${topic.title}</span>
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
let _editingNote = null; // index of note with editor open

function escHtml(str) {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* ================================================================
   NOTES SYSTEM (Delegated to notes.js rich engine & sticky board)
   ================================================================ */
function addNote() {
  if (typeof openNoteEditorModal === "function") {
    openNoteEditorModal(null);
  }
}
function expandNoteImage(src) {
  const d = document.createElement("div");
  d.style.cssText =
    "position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out";
  d.onclick = () => d.remove();
  d.innerHTML = `<img src="${src}" style="max-width:90vw;max-height:90vh;border-radius:8px;box-shadow:0 8px 40px #000">`;
  document.body.appendChild(d);
}

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
    points >= 10000
      ? "#ff6f6f"
      : points >= 6000
        ? "#ffa05a"
        : points >= 3000
          ? "#e8c060"
          : points >= 1500
            ? "#8ab4f8"
            : "#6a7acc";
  const topicHtml =
    topicPoints !== undefined
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

  const pointsBadgeHtml =
    platform === "codeforces" ? buildCFPointsBadge(getCFPoints(allProbs)) : "";

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
    const handler = () =>
      platform === "codeforces" ? showCFTopic(t.id) : showLCTopic(t.id);
    card.onclick = handler;
    card.style.cursor = "pointer";
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
      <span onclick="showView('dsa-dashboard')">home</span> ›
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
  const pointsBadgeHtml =
    platform === "codeforces"
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

/* (keyboard shortcuts consolidated in DOMContentLoaded init block) */

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
      }
      showToast("⏱ time's up! session ended.", "info");
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
      showToast("progress imported successfully.", "success");
      buildDashboard();
      updateProgress();
    } catch (e) {
      showToast(
        "invalid file — make sure you exported from this tracker.",
        "error",
      );
    }
  };
  reader.readAsText(file);
}

function openSyncCode() {
  const body = document.getElementById("synccode-body");
  const uid = typeof getSyncCode === "function" ? getSyncCode() : null;

  // FIX: was showing "Firebase not configured" while sync was still initialising.
  // Now distinguish between "still connecting" and "truly unconfigured".
  if (uid) {
    body.innerHTML = `
      <div class="modal-section-label">your sync code (click to copy)</div>
      <div class="synccode-display" onclick="copySyncCode('${uid}')" id="synccode-val">${uid}</div>
      <div class="synccode-or">── or link this device to another code ──</div>
      <input class="synccode-input" id="synccode-input" placeholder="paste sync code from another device…">
      <button class="sc-btn save" style="width:100%;padding:8px" onclick="applyLinkCode()">link devices</button>`;
  } else if (typeof syncStatus !== "undefined" && syncStatus !== "offline") {
    // Sync is enabled and initialising — userId not assigned yet
    body.innerHTML = `
      <div style="font-size:13px;color:var(--mid);line-height:1.6;margin-bottom:12px;font-family:var(--mono)">
        ↻ connecting to sync… open this again in a moment once the status badge turns green.
      </div>`;
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
    closeSyncCode();
    showToast("devices linked — syncing shortly.", "success");
  }
}

function closeSyncCode() {
  document.getElementById("synccode-overlay").classList.remove("open");
}
function closeSyncCodeOnBg(e) {
  if (e.target === document.getElementById("synccode-overlay")) closeSyncCode();
}

/* ================================================================
   GLOBAL SEARCH
   ================================================================ */
function openSearch() {
  document.getElementById("search-overlay").classList.add("open");
  setTimeout(() => document.getElementById("search-input")?.focus(), 60);
}
function closeSearch() {
  document.getElementById("search-overlay").classList.remove("open");
  const inp = document.getElementById("search-input");
  if (inp) inp.value = "";
  const res = document.getElementById("search-results");
  if (res) res.innerHTML = "";
}
function onSearchInput() {
  const q = (document.getElementById("search-input")?.value || "")
    .trim()
    .toLowerCase();
  const res = document.getElementById("search-results");
  if (!res) return;
  if (!q || q.length < 2) {
    res.innerHTML = `<div class="search-hint">type to search across all problems…</div>`;
    return;
  }

  const all = getAllProblems().concat(getAllLCProblems());
  const c = getCompleted();
  const hits = all
    .filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.trigger || "").toLowerCase().includes(q) ||
        (p.hint || "").toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q)) ||
        (
          p.subtopicTitle ||
          p.topicTitle ||
          p.cfTopicTitle ||
          p.lcTopicTitle ||
          ""
        )
          .toLowerCase()
          .includes(q),
    )
    .slice(0, 30);

  if (!hits.length) {
    res.innerHTML = `<div class="search-hint">no results for "<b>${escHtml(q)}</b>"</div>`;
    return;
  }

  const diffRatings = getDiffRatings();
  res.innerHTML = hits
    .map((p) => {
      const done = !!c[p.id];
      const topic =
        p.subtopicTitle ||
        p.topicTitle ||
        p.cfTopicTitle ||
        p.lcTopicTitle ||
        "";
      const plat = p.cfTopicId ? "CF" : "LC";
      const platClass = p.cfTopicId ? "codeforces" : "leetcode";
      const myR = diffRatings[p.id];
      const myRHtml = myR
        ? `<span class="my-diff-badge my-diff-${myR}">${myR}</span>`
        : "";
      return `
      <div class="search-result-row ${done ? "search-done" : ""}" onclick="closeSearch();openModal('${p.id}')">
        <div class="search-check-dot ${done ? "done" : ""}"></div>
        <div class="search-result-info">
          <div class="search-result-name">${escHtml(p.title)}</div>
          <div class="search-result-meta">${escHtml(topic)}${p.day ? ` · Day ${p.day}` : ""}</div>
        </div>
        ${myRHtml}
        <span class="p-diff diff-${p.difficulty}" style="font-size:10px">${p.difficulty}</span>
        <span class="p-platform plat-${platClass}" style="font-size:10px;padding:2px 5px">${plat}</span>
      </div>`;
    })
    .join("");
}

/* ================================================================
   INITIALIZATION
   ================================================================ */
/* ================================================================
   MAIN APP DASHBOARD (overview across all modules)
   ================================================================ */
function buildMainDashboard() {
  const el = document.getElementById("main-dashboard-inner");
  if (!el) return;

  const solved = getSolvedCount(),
    total = getTotalProblems();
  const dsaPct = total ? Math.round((solved / total) * 100) : 0;

  const puzzlesSolved = DB.get("puzzles_solved") || {};
  const puzzleTotal =
    typeof PUZZLES_DATA !== "undefined" ? PUZZLES_DATA.puzzles.length : 12;
  const puzzleDone = Object.values(puzzlesSolved).filter(Boolean).length;
  const puzzlePct = puzzleTotal
    ? Math.round((puzzleDone / puzzleTotal) * 100)
    : 0;

  const aptResults = DB.get("aptitude") || {};
  let aptTotal = 1125;
  if (typeof getAllAptitudeQuestions === "function") {
    aptTotal = getAllAptitudeQuestions().length;
  }
  const aptAttempted = Object.keys(aptResults).length;
  const aptPct = aptTotal ? Math.round((aptAttempted / aptTotal) * 100) : 0;

  const notesList = getGlobalNotes();
  const streak = getStreakCount();
  const bestStreak = getLongestStreak();
  const todaySolved = getTodaySolveCount();
  const apps = (typeof getApplications === "function") ? getApplications() : (DB.get("applications") || []);
  const activeApps = apps.filter(
    (a) => a && !a.archived && a.status !== "Rejected",
  ).length;

  const resPapers = (typeof getResearchPapers === "function") ? getResearchPapers() : (DB.get("research_papers") || []);

  el.innerHTML = `
    <div class="dash-greeting">
      <h1>Hello.</h1>
      <p>placement preparation workspace — dsa, core cs, aptitude &amp; applications</p>
    </div>

    <!-- Primary stats grid matching DSA dashboard -->
    <div class="stats-grid">
      <div class="stat-card" onclick="showView('dsa-dashboard')" style="cursor:pointer">
        <div class="stat-label">dsa solved</div>
        <div class="stat-num" style="color:var(--accent)">${solved}</div>
        <div class="stat-total">of ${total} problems (${dsaPct}%)</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">current streak</div>
        <div class="stat-num" style="color:var(--text)">${streak}</div>
        <div class="stat-total">days active</div>
      </div>
      <div class="stat-card" onclick="showView('puzzles')" style="cursor:pointer">
        <div class="stat-label">puzzles cracked</div>
        <div class="stat-num" style="color:#ff6b6b">${puzzleDone}</div>
        <div class="stat-total">of ${puzzleTotal} brain-teasers</div>
      </div>
      <div class="stat-card" onclick="showView('notes')" style="cursor:pointer">
        <div class="stat-label">notes captured</div>
        <div class="stat-num" style="color:#c4b5fd">${notesList.length}</div>
        <div class="stat-total">learnings &amp; insights</div>
      </div>
    </div>

    <!-- Secondary stats row -->
    <div class="stats-grid stats-grid-sm" style="margin-top:-24px;margin-bottom:28px">
      <div class="stat-card stat-card-sm">
        <div class="stat-label">today's solves</div>
        <div class="stat-num stat-num-sm" style="color:#51cf66">${todaySolved}</div>
        <div class="stat-total">completed</div>
      </div>
      <div class="stat-card stat-card-sm">
        <div class="stat-label">best streak</div>
        <div class="stat-num stat-num-sm" style="color:var(--text)">${bestStreak}</div>
        <div class="stat-total">days</div>
      </div>
      <div class="stat-card stat-card-sm" onclick="showView('applications')" style="cursor:pointer">
        <div class="stat-label">active applications</div>
        <div class="stat-num stat-num-sm" style="color:#ffa94d">${activeApps}</div>
        <div class="stat-total">in pipeline</div>
      </div>
    </div>

    <!-- Quick action buttons -->
    <div class="dash-actions" style="margin-bottom:36px">
      <button class="timer-btn" onclick="openTimer(null)" style="font-size:11px;padding:6px 14px">
        ⏱ start focus timer
      </button>
      <button class="export-btn" onclick="showView('dsa-dayplan')">▦ day roadmap</button>
      <button class="export-btn" onclick="showView('dsa-revision')">⟳ revision queue</button>
      <button class="export-btn" onclick="showView('notes')">quick note</button>
      <button class="export-btn" onclick="openSearch()">⌕ search (ctrl+k)</button>
    </div>

    <!-- Section 1: Practice -->
    <div class="dash-section-title">practice &amp; problem solving</div>
    <div class="module-grid">
      <div class="module-card" onclick="showView('dsa-dashboard')">
        <div class="module-card-top">
          <div class="module-card-title"><span style="color:#e8a838;margin-right:8px">&lt;/&gt;</span>DSA Tracker</div>
          <div class="module-card-stat" style="color:#e8a838">${dsaPct}%</div>
        </div>
        <div class="module-card-stat-label">${solved} of ${total} problems completed</div>
        <div class="module-card-bar-bg"><div class="module-card-bar-fill" style="width:${dsaPct}%;background:#e8a838"></div></div>
      </div>

      <div class="module-card" onclick="showView('puzzles')">
        <div class="module-card-top">
          <div class="module-card-title"><span style="color:#ff6b6b;margin-right:8px">${ICON_SVG.puzzle}</span>Logic &amp; Puzzles</div>
          <div class="module-card-stat" style="color:#ff6b6b">${puzzlePct}%</div>
        </div>
        <div class="module-card-stat-label">${puzzleDone} of ${puzzleTotal} brain-teasers cracked</div>
        <div class="module-card-bar-bg"><div class="module-card-bar-fill" style="width:${puzzlePct}%;background:#ff6b6b"></div></div>
      </div>

      <div class="module-card" onclick="showView('aptitude')">
        <div class="module-card-top">
          <div class="module-card-title"><span style="color:#7dd3fc;margin-right:8px">${ICON_SVG.brain}</span>Aptitude Bank</div>
          <div class="module-card-stat" style="color:#7dd3fc">${aptPct}%</div>
        </div>
        <div class="module-card-stat-label">${aptAttempted} of ${aptTotal} questions attempted</div>
        <div class="module-card-bar-bg"><div class="module-card-bar-fill" style="width:${aptPct}%;background:#7dd3fc"></div></div>
      </div>
    </div>

    <!-- Section 2: Knowledge -->
    <div class="dash-section-title" style="margin-top:12px">engineering knowledge</div>
    <div class="module-grid">
      <div class="module-card" onclick="showView('cs')">
        <div class="module-card-top">
          <div class="module-card-title"><span style="color:#51cf66;margin-right:8px">${ICON_SVG.book}</span>CS Fundamentals</div>
          <div class="module-card-stat" style="color:#51cf66">5 subjects</div>
        </div>
        <div class="module-card-stat-label">OS, DBMS, Computer Networks, OOP &amp; DSA Core</div>
      </div>

      <div class="module-card" onclick="showView('systemdesign')">
        <div class="module-card-top">
          <div class="module-card-title"><span style="color:#818cf8;margin-right:8px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg></span>System Design</div>
          <div class="module-card-stat" style="color:#818cf8">12 domains</div>
        </div>
        <div class="module-card-stat-label">HLD, scalability, distributed patterns &amp; problems</div>
      </div>

      <div class="module-card" onclick="showView('hr')">
        <div class="module-card-top">
          <div class="module-card-title"><span style="color:#a78bfa;margin-right:8px">${ICON_SVG.users}</span>HR &amp; STAR Behavioral</div>
          <div class="module-card-stat" style="color:#a78bfa">50 prompts</div>
        </div>
        <div class="module-card-stat-label">HR questions &amp; reusable STAR story bank</div>
      </div>
    </div>

    <!-- Section 3: Workspace -->
    <div class="dash-section-title" style="margin-top:12px">workspace &amp; tracker</div>
    <div class="module-grid">
      <div class="module-card" onclick="showView('notes')">
        <div class="module-card-top">
          <div class="module-card-title"><span style="color:#fbbf24;margin-right:8px">${ICON_SVG.file}</span>Notes &amp; Sticky Board</div>
          <div class="module-card-stat" style="color:#fbbf24">${notesList.length} notes</div>
        </div>
        <div class="module-card-stat-label">Rich text, visual sticky board &amp; reminders</div>
      </div>

      <div class="module-card" onclick="showView('research')">
        <div class="module-card-top">
          <div class="module-card-title"><span style="color:#2dd4bf;margin-right:8px">${ICON_SVG.flask}</span>Research Tracker</div>
          <div class="module-card-stat" style="color:#2dd4bf">${resPapers.length} papers</div>
        </div>
        <div class="module-card-stat-label">Methodologies, key findings &amp; research gaps</div>
      </div>

      <div class="module-card" onclick="showView('applications')">
        <div class="module-card-top">
          <div class="module-card-title"><span style="color:#ffa94d;margin-right:8px">${ICON_SVG.briefcase}</span>Application Pipeline</div>
          <div class="module-card-stat" style="color:#ffa94d">${activeApps} active</div>
        </div>
        <div class="module-card-stat-label">Job applications, referrals &amp; status tracking</div>
      </div>
    </div>

    ${typeof renderDashboardRemindersWidget === "function" ? renderDashboardRemindersWidget() : ""}
  `;
}

/* ================================================================
   PUZZLES  (logic & story puzzles)
   ================================================================ */
function buildPuzzlesView() {
  const container = document.getElementById("puzzles-list");
  if (!container) return;
  if (typeof PUZZLES_DATA === "undefined") {
    container.innerHTML = `<div class="module-placeholder">Puzzle data failed to load — make sure puzzles.js is included before app.js.</div>`;
    return;
  }
  const solved = DB.get("puzzles_solved") || {};
  container.innerHTML = PUZZLES_DATA.puzzles
    .map((p) => {
      const isSolved = !!solved[p.id];
      return `
      <div class="puzzle-card">
        <div class="puzzle-card-category">${escHtml(p.category || "")}</div>
        <div class="puzzle-card-title">${escHtml(p.title)}</div>
        <div class="puzzle-card-question">${escHtml(p.question)}</div>
        <button class="puzzle-reveal-btn" onclick="togglePuzzleAnswer('${p.id}')">reveal answer</button>
        <div class="puzzle-solved-toggle ${isSolved ? "solved" : ""}" id="puzzle-solved-${p.id}" onclick="togglePuzzleSolved('${p.id}')">
          <span>${isSolved ? "✓ solved" : "mark as solved"}</span>
        </div>
        <div class="puzzle-answer-block" id="puzzle-answer-${p.id}">
          <div class="puzzle-answer-label">answer</div>
          <div class="puzzle-answer-text">${escHtml(p.answer)}</div>
          <div class="puzzle-explanation-text">${escHtml(p.explanation || "")}</div>
        </div>
      </div>`;
    })
    .join("");
}

function togglePuzzleAnswer(id) {
  const block = document.getElementById("puzzle-answer-" + id);
  if (block) block.classList.toggle("open");
}

function togglePuzzleSolved(id) {
  const solved = DB.get("puzzles_solved") || {};
  solved[id] = !solved[id];
  DB.set("puzzles_solved", solved);
  if (typeof syncAfterChange === "function") syncAfterChange();
  const el = document.getElementById("puzzle-solved-" + id);
  if (el) {
    el.classList.toggle("solved", !!solved[id]);
    el.innerHTML = `<span>${solved[id] ? "✓ solved" : "mark as solved"}</span>`;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  // Restore sidebar state only on desktop
  if (window.innerWidth >= 769 && localStorage.getItem("dsa_sidebar_collapsed") === "1") {
    document.getElementById("sidebar")?.classList.add("collapsed");
    document.body.classList.add("sidebar-collapsed");
  }

  buildNav();
  restoreLastView();
  updateProgress();
  window._dsaAppReady = true;
  if (typeof initSync === "function") initSync();

  // Keyboard shortcuts: Ctrl/Cmd + K opens search; Escape closes all modals
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      openSearch();
    }
    if (e.key === "Escape") {
      closeSearch();
      closeModalDirect();
      closeTimer();
      closeDiffRatingPicker();
      closeNoteInsight();
      closeMobSidebar();
    }
  });
});
