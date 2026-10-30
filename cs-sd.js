/* ================================================================
   CS FUNDAMENTALS & SYSTEM DESIGN ENGINE  (v2)

   Fixes vs v1
   - Topic/subject selection: every subject/topic/question in CS_DATA now has a
     stable `id`; the engine also derives a fallback id when one is missing so
     selection can never silently break again.
   - Legacy progress saved under the broken "undefined" keys is migrated once
     to the ACID topic (the only topic that was reachable before).
   - Debounced saves captured the DOM *after* a re-render, which could overwrite
     a saved answer with "" if you switched topic within 400 ms. Values are now
     captured at input time and pending saves are flushed before any re-render.
   - Notes saved under the wrong tab if you switched tabs within 400 ms.
   - Custom level names containing quotes broke the inline onclick handler.
   - First keystroke no longer forces the status to "practicing".

   Additions (all optional; legacy data keeps working)
   - Sidebar grouping, topic search, progress counters.
   - Question filters (company, difficulty, frequency, relevance, type, status, text).
   - Difficulty/type badges, problem links, follow-ups, per-topic study guide.
   ================================================================ */

/* ---------- helpers ---------- */
function csEsc(str) {
  return (str === undefined || str === null ? "" : String(str))
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
// Escape a value for use inside a single-quoted JS string in an inline handler attribute.
function csArg(str) {
  const js = String(str === undefined || str === null ? "" : str)
    .replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\r?\n/g, " ");
  return csEsc(js);
}
function csSafeUrl(u) { return /^https:\/\/[^\s"'<>]+$/i.test(u || "") ? u : ""; }
function csCatLabel(c) { return String(c || "General").replace(/^\d+\s+/, ""); }

let currentCSSubjectId = "dbms";
let currentCSTopicId = "dbms-1";
let currentCSNoteTab = "explanation";

let currentSDTopicId = "sd-1";
let currentSDNoteTab = "explanation";

let csFilters = { company: "", difficulty: "", frequency: "", relevance: "", type: "", status: "", text: "" };
let csTopicSearch = "";
let csStateRestored = false;

/* ---------- storage accessors ---------- */
function getCSCustomTopics() { return DB.get("cs_custom_topics") || {}; }
function getCSCustomQuestions() { return DB.get("cs_custom_questions") || {}; }
function getCSUnderstanding() { return DB.get("cs_understanding") || {}; }
function getCSNotes() { return DB.get("cs_notes") || {}; }
function getCSQuestionAnswers() { return DB.get("cs_q_answers") || {}; }
function getCSCustomLevels() {
  return DB.get("cs_custom_levels") || [
    "Not started", "Need revision", "Conceptual understanding",
    "Can explain with example", "Confident", "Interview ready"
  ];
}
function csAfterChange() { if (typeof syncAfterChange === "function") syncAfterChange(); }

/* ---------- pending (debounced) saves: capture values early, flush before re-render ---------- */
const csPending = {};
function csQueueSave(key, fn, delay) {
  if (csPending[key]) clearTimeout(csPending[key].timer);
  csPending[key] = {
    fn,
    timer: setTimeout(() => {
      const p = csPending[key];
      delete csPending[key];
      if (p) p.fn();
    }, delay === undefined ? 400 : delay)
  };
}
function csFlushSaves() {
  Object.keys(csPending).forEach(k => {
    const p = csPending[k];
    clearTimeout(p.timer);
    delete csPending[k];
    try { p.fn(); } catch (e) { /* ignore */ }
  });
}
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", csFlushSaves);
  document.addEventListener("visibilitychange", () => { if (document.hidden) csFlushSaves(); });
}

/* ---------- data access with id safety ---------- */
function csSubjects() {
  const subs = (typeof CS_DATA !== "undefined" && CS_DATA.subjects) ? CS_DATA.subjects : [];
  // Defensive: if a data file ever ships without ids again, derive stable ones instead of breaking selection.
  subs.forEach((s, si) => {
    if (!s.id) s.id = "s" + (si + 1);
    (s.topics || []).forEach((t, ti) => {
      if (!t.id) t.id = `${s.id}-${ti + 1}`;
      (t.interview_questions || []).forEach((q, qi) => { if (!q.id) q.id = `${t.id}-q${qi + 1}`; });
    });
  });
  return subs;
}
function csSDTopics() {
  const sd = (typeof CS_DATA !== "undefined" && CS_DATA.system_design) ? CS_DATA.system_design : { topics: [] };
  (sd.topics || []).forEach((t, ti) => {
    if (!t.id) t.id = `sd-${ti + 1}`;
    (t.interview_questions || []).forEach((q, qi) => { if (!q.id) q.id = `${t.id}-q${qi + 1}`; });
  });
  return sd;
}
let csTopicNameIndex = null;
function csTopicName(id) {
  if (!csTopicNameIndex) {
    csTopicNameIndex = {};
    csSubjects().forEach(s => (s.topics || []).forEach(t => { csTopicNameIndex[t.id] = t.topic; }));
    (csSDTopics().topics || []).forEach(t => { csTopicNameIndex[t.id] = t.topic; });
  }
  return csTopicNameIndex[id] || id;
}

/* ---------- one-time migration of progress saved under the broken "undefined" ids ---------- */
function csMigrateLegacyKeys() {
  if (DB.get("cs_ids_migrated_v2")) return;
  try {
    const LEG = "undefined", TOPIC = "dbms-1", SUBJ = "dbms";
    const subs = csSubjects();
    const dbms = subs.find(s => s.id === SUBJ);
    const acid = dbms && (dbms.topics || []).find(t => t.id === TOPIC);

    const u = getCSUnderstanding();
    if (u[LEG]) { if (!u[TOPIC]) u[TOPIC] = u[LEG]; delete u[LEG]; DB.set("cs_understanding", u); }

    const n = getCSNotes();
    if (n[LEG]) { n[TOPIC] = Object.assign({}, n[LEG], n[TOPIC] || {}); delete n[LEG]; DB.set("cs_notes", n); }

    const a = getCSQuestionAnswers();
    let changed = false;
    Object.keys(a).forEach(k => {
      const m = k.match(/^cs-q-undefined-(\d+)$/);
      if (!m) return;
      const q = acid && acid.interview_questions[parseInt(m[1], 10)];
      if (q && !a[q.id]) a[q.id] = a[k];
      delete a[k]; changed = true;
    });
    if (changed) DB.set("cs_q_answers", a);

    const cq = getCSCustomQuestions();
    if (cq[LEG]) { cq[TOPIC] = [...(cq[TOPIC] || []), ...cq[LEG]]; delete cq[LEG]; DB.set("cs_custom_questions", cq); }

    const ct = getCSCustomTopics();
    if (ct[LEG]) { ct[SUBJ] = [...(ct[SUBJ] || []), ...ct[LEG]]; delete ct[LEG]; DB.set("cs_custom_topics", ct); }
  } catch (e) { /* never block the UI on migration */ }
  DB.set("cs_ids_migrated_v2", true);
  csAfterChange();
}

function csRestoreState() {
  if (csStateRestored) return;
  csStateRestored = true;
  csMigrateLegacyKeys();
  const last = DB.get("cs_last_view");
  if (last) {
    if (last.subject) currentCSSubjectId = last.subject;
    if (last.topic) currentCSTopicId = last.topic;
    if (last.sd) currentSDTopicId = last.sd;
  }
}
function csRememberView() {
  DB.set("cs_last_view", { subject: currentCSSubjectId, topic: currentCSTopicId, sd: currentSDTopicId });
}

/* ---------- progress ---------- */
function csTopicProgress(topic, qAnswers, customQs) {
  const qs = [...(topic.interview_questions || []), ...(customQs[topic.id] || [])];
  let done = 0;
  qs.forEach(q => {
    const st = (qAnswers[q.id] && qAnswers[q.id].status) || q.status || "unanswered";
    if (st === "answered" || st === "strong") done++;
  });
  return { done, total: qs.length };
}

/* ---------- sidebar list (shared by CS and SD) ---------- */
function csRenderTopicList(topics, activeId, opts) {
  const understandingDB = getCSUnderstanding();
  const qAnswers = getCSQuestionAnswers();
  const customQs = getCSCustomQuestions();
  const groups = [];
  const byKey = {};
  topics.forEach(t => {
    const g = opts.groupOf(t);
    if (!byKey[g.key]) { byKey[g.key] = { label: g.label, order: g.order, items: [] }; groups.push(byKey[g.key]); }
    byKey[g.key].items.push(t);
  });
  groups.sort((a, b) => a.order - b.order);
  return groups.map(g => `
    <div class="cs-group" data-group>
      <div class="cs-group-label" style="font-family:var(--mono);font-size:9.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:10px 0 2px 2px">${csEsc(g.label)}</div>
      ${g.items.map(t => {
        const level = (understandingDB[t.id] && understandingDB[t.id].level) || "Not started";
        const isAct = t.id === activeId;
        const p = csTopicProgress(t, qAnswers, customQs);
        const good = level === "Interview ready" || level === "Confident";
        const hay = (t.topic + " " + (t.category || "") + " " + (t.level || "")).toLowerCase();
        return `
        <div class="cs-topic-item ${isAct ? opts.activeClass : ""}" data-search="${csEsc(hay)}" title="${csEsc(csCatLabel(t.category) + (t.level ? " · " + t.level : ""))}" onclick="${opts.onclick}('${csArg(t.id)}')">
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${csEsc(t.topic)}</span>
          <span style="font-family:var(--mono);font-size:9.5px;color:${good ? opts.goodColor : "var(--muted)"};flex-shrink:0">
            ${level === "Interview ready" ? "Ready" : (level === "Not started" ? "" : csEsc(level.slice(0, 10)))} ${p.total ? `${p.done}/${p.total}` : ""}
          </span>
        </div>`;
      }).join("")}
    </div>`).join("");
}

function csTopicSearchBox(value) {
  return `<input type="text" class="hr-search-input" style="width:100%;margin:6px 0 2px" placeholder="Search topics…" value="${csEsc(value)}" oninput="filterCSTopicList(this.value)">`;
}
function filterCSTopicList(q) {
  csTopicSearch = (q || "").toLowerCase().trim();
  document.querySelectorAll(".cs-sidebar .cs-topic-item[data-search]").forEach(el => {
    el.style.display = !csTopicSearch || el.getAttribute("data-search").indexOf(csTopicSearch) !== -1 ? "" : "none";
  });
  document.querySelectorAll(".cs-sidebar [data-group]").forEach(g => {
    const any = Array.from(g.querySelectorAll(".cs-topic-item")).some(el => el.style.display !== "none");
    g.style.display = any ? "" : "none";
  });
}

/* ---------- study guide + question card rendering ---------- */
function csList(items) {
  return `<ul style="margin:2px 0 0 16px;padding:0;font-size:12.5px;line-height:1.55">${items.map(i => `<li>${csEsc(i)}</li>`).join("")}</ul>`;
}
function csRenderGuide(topic) {
  const parts = [];
  const sec = (title, body) => parts.push(`<div style="margin-top:10px"><div style="font-family:var(--mono);font-size:10.5px;text-transform:uppercase;color:var(--muted);font-weight:600">${title}</div>${body}</div>`);
  if (topic.learning_objectives) sec("Learning objectives", csList(topic.learning_objectives));
  if (topic.prerequisites && topic.prerequisites.length) sec("Prerequisites", `<div style="font-size:12.5px;margin-top:2px">${topic.prerequisites.map(id => csEsc(csTopicName(id))).join(" · ")}</div>`);
  if (topic.key_subtopics) sec("Key subtopics", `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:3px">${topic.key_subtopics.map(s => `<span class="hr-pill" style="color:var(--text)">${csEsc(s)}</span>`).join("")}</div>`);
  if (topic.common_mistakes) sec("Common mistakes", csList(topic.common_mistakes));
  if (topic.important_edge_cases) sec("Edge cases to test", csList(topic.important_edge_cases));
  if (topic.interview_explanation_checklist) sec("Interview explanation checklist", csList(topic.interview_explanation_checklist));
  if (topic.practical_exercises) sec("Practical exercises", csList(topic.practical_exercises));
  if (topic.revision_notes) sec("Revision notes", csList(topic.revision_notes));
  if (topic.resources) {
    const links = topic.resources.map(r => {
      const u = csSafeUrl(r.url);
      return `<li>${u ? `<a href="${csEsc(u)}" target="_blank" rel="noopener noreferrer" style="color:var(--cs-green)">${csEsc(r.title)} ↗</a>` : csEsc(r.title)}</li>`;
    }).join("");
    sec("Trusted resources", `<ul style="margin:2px 0 0 16px;padding:0;font-size:12.5px;line-height:1.55">${links}</ul>`);
  }
  if (!parts.length) return "";
  return `<details style="margin-top:14px;border:1px solid var(--line);border-radius:8px;padding:8px 12px">
    <summary style="cursor:pointer;font-family:var(--mono);font-size:11px;text-transform:uppercase;color:var(--muted);font-weight:600">Study guide${topic.level ? " · " + csEsc(topic.level) : ""}</summary>
    ${parts.join("")}
  </details>`;
}

const CS_DIFF_COLOR = { easy: "#4ade80", medium: "#fbbf24", hard: "#f87171" };
function csQuestionCard(q, qId, saved, opts) {
  const ansText = saved.answer !== undefined ? saved.answer : (q.your_answer || "");
  const status = saved.status || q.status || "unanswered";
  const companies = q.companies || [];
  const compBadges = companies.map(c => `<span class="hr-pill" style="color:var(--text)">${csEsc(c)}</span>`).join("");
  const freq = q.frequency || opts.defaultFreq;
  const diffBadge = q.difficulty ? `<span class="hr-pill" style="color:${CS_DIFF_COLOR[q.difficulty] || "var(--muted)"}">${csEsc(q.difficulty)}</span>` : "";
  const typeBadge = q.type ? `<span class="hr-pill" style="color:var(--muted)">${csEsc(q.type)}</span>` : "";
  const extraBadge = q.relevance === "low" ? `<span class="hr-pill" style="color:var(--muted)" title="Lower foundational importance">extra</span>` : "";
  const link = csSafeUrl(q.url) ? `<a class="hr-pill" href="${csEsc(q.url)}" target="_blank" rel="noopener noreferrer" style="color:var(--cs-green);text-decoration:none" title="Open problem">${q.type === "sql" ? "SQL" : "Problem"} ↗${q.premium ? " (premium)" : ""}</a>` : "";
  const meta = [q.pattern ? `Pattern: ${csEsc(q.pattern)}` : "", q.lists && q.lists.length ? csEsc(q.lists.join(", ")) : ""].filter(Boolean).join(" · ");
  const followups = q.followups && q.followups.length ? `
    <details style="margin-top:8px"><summary style="cursor:pointer;font-size:11.5px;color:var(--muted)">Follow-up probes (${q.followups.length})</summary>${csList(q.followups)}</details>` : "";
  return `
      <div class="cs-q-card" id="${opts.cardPrefix}${csEsc(qId)}"
           data-company="${csEsc(companies.join("|").toLowerCase())}" data-diff="${csEsc(q.difficulty || "")}" data-freq="${csEsc(freq)}"
           data-rel="${csEsc(q.relevance || "")}" data-type="${csEsc(q.type || "")}" data-status="${csEsc(status)}"
           data-text="${csEsc((q.question + " " + (q.pattern || "")).toLowerCase())}">
        <div class="cs-q-top">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <span class="cs-freq-badge cs-freq-${csEsc(freq)}">${csEsc(freq)} freq</span>
            ${diffBadge}${typeBadge}${extraBadge}${compBadges}${link}
          </div>
          <div class="hr-status-pill ${csEsc(status)}" onclick="cycleCSQuestionStatus('${csArg(qId)}')" title="Click to cycle status">
            <span>●</span> <span>${csEsc(status)}</span>
          </div>
        </div>

        <div class="cs-q-text">${csEsc(q.question)}</div>
        ${meta ? `<div style="font-size:11px;color:var(--muted);margin-top:4px">${meta}</div>` : ""}
        ${followups}

        <div style="margin-top:10px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
            <label class="modal-section-label" style="margin:0;font-size:10.5px">${opts.answerLabel}</label>
            <span style="font-family:var(--mono);font-size:10px;color:var(--muted)" id="cs-q-save-${csEsc(qId)}">Auto-saved</span>
          </div>
          <textarea class="hr-answer-textarea" id="cs-ans-${csEsc(qId)}" placeholder="${csEsc(opts.placeholder)}" oninput="saveCSQuestionAnswer('${csArg(qId)}', this.value)">${csEsc(ansText)}</textarea>
        </div>
      </div>`;
}

function csFilterBar(allQuestions) {
  const uniq = (arr) => Array.from(new Set(arr.filter(Boolean))).sort();
  const companies = uniq([...allQuestions.flatMap(q => q.companies || []), csFilters.company]);
  const types = uniq([...allQuestions.map(q => q.type), csFilters.type]);
  const sel = (key, label, options) => `
    <select class="hr-select" style="font-size:11px;padding:3px 6px" onchange="setCSFilter('${key}', this.value)" title="${label}">
      <option value="">${label}</option>
      ${options.map(o => `<option value="${csEsc(o)}" ${csFilters[key] === o ? "selected" : ""}>${csEsc(o)}</option>`).join("")}
    </select>`;
  return `
    <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:12px">
      <input type="text" class="hr-search-input" style="min-width:140px;flex:1" placeholder="Filter questions…" value="${csEsc(csFilters.text)}" oninput="setCSFilter('text', this.value)">
      ${sel("company", "Company", companies)}
      ${sel("difficulty", "Difficulty", ["easy", "medium", "hard"])}
      ${sel("frequency", "Frequency", ["high", "medium", "low"])}
      ${sel("relevance", "Relevance", ["high", "medium", "low"])}
      ${sel("type", "Type", types)}
      ${sel("status", "Status", ["unanswered", "practicing", "answered", "strong"])}
      <button class="hr-btn" style="padding:2px 8px;font-size:10.5px" onclick="clearCSFilters()">Clear</button>
    </div>`;
}
function setCSFilter(key, value) { csFilters[key] = (value || "").toString(); applyCSFilters(); }
function clearCSFilters() {
  csFilters = { company: "", difficulty: "", frequency: "", relevance: "", type: "", status: "", text: "" };
  if (currentCSView === "sd") buildSystemDesignView(currentSDTopicId); else buildCSView(currentCSSubjectId, currentCSTopicId);
}
let currentCSView = "cs";
function applyCSFilters() {
  const root = document.getElementById(currentCSView === "sd" ? "sd-topic-detail-area" : "cs-topic-detail-area");
  if (!root) return;
  const f = csFilters, txt = f.text.toLowerCase().trim();
  let shown = 0, total = 0;
  root.querySelectorAll(".cs-q-card").forEach(card => {
    total++;
    const d = card.dataset;
    const ok = (!f.company || d.company.split("|").indexOf(f.company.toLowerCase()) !== -1) &&
      (!f.difficulty || d.diff === f.difficulty) && (!f.frequency || d.freq === f.frequency) &&
      (!f.relevance || d.rel === f.relevance) && (!f.type || d.type === f.type) &&
      (!f.status || d.status === f.status) && (!txt || d.text.indexOf(txt) !== -1);
    card.style.display = ok ? "" : "none";
    if (ok) shown++;
  });
  const counter = root.querySelector("[data-q-count]");
  if (counter) counter.textContent = shown === total ? `(${total})` : `(${shown} of ${total})`;
}

/* ================================================================
   CS FUNDAMENTALS VIEW
   ================================================================ */
function buildCSView(subjectId = currentCSSubjectId, topicId = null) {
  csFlushSaves();
  csRestoreState();
  currentCSView = "cs";
  const container = document.getElementById("view-cs");
  if (!container) return;

  const subjects = csSubjects();
  const subject = subjects.find(s => s.id === subjectId) || subjects.find(s => s.id === currentCSSubjectId) || subjects[0];
  if (!subject) return;
  currentCSSubjectId = subject.id;

  const customTopics = (getCSCustomTopics()[subject.id] || []);
  const allTopics = [...(subject.topics || []), ...customTopics];

  if (!topicId) {
    if (!allTopics.some(t => t.id === currentCSTopicId)) currentCSTopicId = (allTopics[0] && allTopics[0].id) || "";
  } else {
    currentCSTopicId = topicId;
  }
  const activeTopic = allTopics.find(t => t.id === currentCSTopicId) || allTopics[0];
  if (activeTopic) currentCSTopicId = activeTopic.id;
  csRememberView();

  const qAnswers = getCSQuestionAnswers();
  const customQs = getCSCustomQuestions();
  const understandingDB = getCSUnderstanding();
  let qDone = 0, qTotal = 0, tGood = 0;
  allTopics.forEach(t => {
    const p = csTopicProgress(t, qAnswers, customQs); qDone += p.done; qTotal += p.total;
    const lv = (understandingDB[t.id] && understandingDB[t.id].level) || "";
    if (lv === "Confident" || lv === "Interview ready") tGood++;
  });

  const subjectButtons = subjects.map(s => `
        <button class="hr-btn ${s.id === subject.id ? "hr-btn-primary" : ""}" style="padding:4px 10px;font-size:11.5px;${s.tier === "optional" && s.id !== subject.id ? "opacity:.75" : ""}"
                title="${csEsc((s.tier === "optional" ? "Optional / role-dependent. " : "") + (s.description || ""))}" onclick="buildCSView('${csArg(s.id)}')">
          ${csEsc(s.subject)}
        </button>`).join("");

  const sidebarHtml = `
    <div class="cs-subject-header">Subjects</div>
    <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px">${subjectButtons}</div>

    <div class="cs-subject-header" style="border-top:1px solid var(--line);padding-top:12px;margin-top:6px">
      <span>${csEsc(subject.subject)}</span>
      <button class="hr-btn" style="padding:1px 6px;font-size:10px" onclick="openAddCSTopicModal('${csArg(subject.id)}')" title="Add Custom Topic">+</button>
    </div>
    ${subject.tier === "optional" ? `<div style="font-size:10.5px;color:var(--muted);margin-top:4px">Optional / role-dependent track</div>` : ""}
    <div style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-top:4px">${qDone}/${qTotal} questions answered · ${tGood}/${allTopics.length} topics confident</div>
    ${csTopicSearchBox(csTopicSearch)}
    <div style="display:flex;flex-direction:column;gap:4px;margin-top:2px">
      ${csRenderTopicList(allTopics, currentCSTopicId, {
        groupOf: t => {
          if (!t.category) return { key: "custom", label: "Your custom topics", order: 999 };
          const m = String(t.category).match(/^(\d+)\s/);
          return { key: t.category, label: csCatLabel(t.category), order: m ? parseInt(m[1], 10) : 500 };
        },
        activeClass: "active", goodColor: "#4ade80", onclick: "csOpenTopic"
      })}
    </div>`;

  container.innerHTML = `
    <div class="cs-container">
      <div class="cs-header">
        <div>
          <div class="cs-title">cs fundamentals tracker</div>
          <div class="cs-subtitle">Core computer science principles, interview questions, and deep architectural notes.</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="hr-btn hr-btn-primary" onclick="openAddCSTopicModal('${csArg(subject.id)}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Add Topic</span>
          </button>
        </div>
      </div>

      <div class="cs-layout">
        <div class="cs-sidebar">${sidebarHtml}</div>
        <div class="cs-main" id="cs-topic-detail-area">
          ${activeTopic ? renderCSTopicDetails(subject, activeTopic) : `<div style="padding:40px;text-align:center;color:var(--muted)">Select a topic to start studying.</div>`}
        </div>
      </div>
    </div>`;
  if (csTopicSearch) filterCSTopicList(csTopicSearch);
  applyCSFilters();
}

// Topic click handler used by the sidebar (keeps the current subject).
function csOpenTopic(topicId) { buildCSView(currentCSSubjectId, topicId); }

function renderCSTopicDetails(subject, topic) {
  const understandingDB = getCSUnderstanding();
  const notesDB = getCSNotes();
  const qAnswers = getCSQuestionAnswers();
  const customQuestions = (getCSCustomQuestions()[topic.id] || []);
  const allQuestions = [...(topic.interview_questions || []), ...customQuestions];

  const levels = getCSCustomLevels();
  const currentLevel = (understandingDB[topic.id] && understandingDB[topic.id].level) || "Not started";
  const savedNotes = notesDB[topic.id] || topic.notes || {};
  const currentNoteVal = typeof savedNotes[currentCSNoteTab] === "string" ? savedNotes[currentCSNoteTab] : "";

  const radioOptionsHtml = levels.map(lvl => `
    <div class="cs-radio-option ${lvl === currentLevel ? "selected" : ""}" onclick="setCSUnderstandingLevel('${csArg(topic.id)}', '${csArg(lvl)}')">
      <div class="cs-radio-dot"></div>
      <span>${csEsc(lvl)}</span>
    </div>`).join("");

  const cardOpts = { cardPrefix: "cs-qcard-", defaultFreq: "medium", answerLabel: "My Prepared Answer", placeholder: "Draft your interview-ready technical answer with examples..." };
  const questionsHtml = allQuestions.map((q, idx) => {
    const qId = q.id || `cs-q-${topic.id}-${idx}`;
    return csQuestionCard(q, qId, qAnswers[qId] || {}, cardOpts);
  }).join("");

  const tab = (key, label) => `<button class="cs-note-tab-btn ${currentCSNoteTab === key ? "active" : ""}" onclick="switchCSNoteTab('${csArg(topic.id)}', '${key}')">${label}</button>`;

  return `
    <div class="cs-topic-card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <div>
          <div style="font-family:var(--mono);font-size:11px;color:var(--cs-green);margin-bottom:2px">${csEsc(subject.subject)}${topic.category ? " · " + csEsc(csCatLabel(topic.category)) : ""}</div>
          <div class="cs-topic-title">${csEsc(topic.topic)}</div>
        </div>
        <div style="display:flex;gap:6px">
          <button class="hr-btn" onclick="openAddCSQuestionModal('${csArg(topic.id)}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Add Interview Question</span>
          </button>
        </div>
      </div>

      ${csRenderGuide(topic)}

      <div class="cs-understanding-box">
        <div class="cs-understanding-header">
          <span style="font-family:var(--mono);font-size:11px;text-transform:uppercase;color:var(--muted);font-weight:600">
            Current Understanding Level: <strong style="color:var(--cs-green)">${csEsc(currentLevel)}</strong>
          </span>
          <button class="hr-btn" style="padding:2px 8px;font-size:10.5px" onclick="promptAddCSCustomLevel()">+ Custom Level</button>
        </div>
        <div class="cs-radio-grid">${radioOptionsHtml}</div>
      </div>

      <div style="margin-top:20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <div class="cs-notes-tabs">
            ${tab("explanation", "Explanation")}${tab("examples", "Examples")}${tab("confusion", "Confusion / Doubts")}${tab("mistakes", "Mistakes to Avoid")}${tab("interview_notes", "Interview Notes")}
          </div>
          <span style="font-family:var(--mono);font-size:10.5px;color:var(--muted)" id="cs-note-save-status">Auto-saved</span>
        </div>
        <textarea class="hr-answer-textarea" id="cs-note-input" style="min-height:110px" placeholder="Write comprehensive ${csEsc(currentCSNoteTab.replace("_", " "))} for ${csEsc(topic.topic)}..." oninput="saveCSTopicNote('${csArg(topic.id)}', this.value)">${csEsc(currentNoteVal)}</textarea>
      </div>

      <div style="margin-top:28px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <span style="font-family:var(--mono);font-size:11.5px;text-transform:uppercase;color:var(--muted);font-weight:600">
            Frequently Asked Interview Questions <span data-q-count>(${allQuestions.length})</span>
          </span>
          <button class="hr-btn" style="padding:3px 9px;font-size:11px" onclick="openAddCSQuestionModal('${csArg(topic.id)}')">+ Add Question</button>
        </div>
        ${allQuestions.length > 3 ? csFilterBar(allQuestions) : ""}
        <div style="display:flex;flex-direction:column;gap:10px">
          ${questionsHtml.length ? questionsHtml : `<div style="padding:20px;text-align:center;color:var(--muted)">No interview questions found. Add one above!</div>`}
        </div>
      </div>
    </div>`;
}

function setCSUnderstandingLevel(topicId, level) {
  csFlushSaves();
  const db = getCSUnderstanding();
  if (!db[topicId]) db[topicId] = {};
  db[topicId].level = level;
  db[topicId].updatedAt = Date.now();
  DB.set("cs_understanding", db);
  csAfterChange();
  buildCSView(currentCSSubjectId, topicId);
}

function promptAddCSCustomLevel() {
  const apply = (custom) => {
    if (!custom || !custom.trim()) return;
    const levels = getCSCustomLevels();
    if (!levels.includes(custom.trim())) {
      levels.push(custom.trim());
      DB.set("cs_custom_levels", levels);
      csAfterChange();
      if (currentCSView === "sd") buildSystemDesignView(currentSDTopicId); else buildCSView();
    }
  };
  const msg = "Enter new understanding level name (e.g. 'Production Mastered', 'Revising Soon'):";
  if (typeof showPrompt === "function") showPrompt(msg, "Level name", "", apply);
  else apply(prompt(msg));
}

function switchCSNoteTab(topicId, tabName) {
  csFlushSaves();
  currentCSNoteTab = tabName;
  const main = document.getElementById("cs-topic-detail-area");
  const subject = csSubjects().find(s => s.id === currentCSSubjectId) || csSubjects()[0];
  const allTopics = [...(subject.topics || []), ...(getCSCustomTopics()[subject.id] || [])];
  const activeTopic = allTopics.find(t => t.id === topicId);
  if (main && activeTopic) { main.innerHTML = renderCSTopicDetails(subject, activeTopic); applyCSFilters(); }
}

function saveCSTopicNote(topicId, value) {
  const tab = currentCSNoteTab; // capture now: the user may switch tabs before the debounce fires
  const status = document.getElementById("cs-note-save-status");
  if (status) status.textContent = "Saving...";
  const val = value === undefined ? ((document.getElementById("cs-note-input") || {}).value || "") : value;
  csQueueSave("cs-note:" + topicId + ":" + tab, () => {
    const notesDB = getCSNotes();
    if (!notesDB[topicId]) notesDB[topicId] = {};
    notesDB[topicId][tab] = val;
    DB.set("cs_notes", notesDB);
    csAfterChange();
    const s = document.getElementById("cs-note-save-status");
    if (s) s.textContent = "Saved";
  });
}

function saveCSQuestionAnswer(qId, value) {
  const status = document.getElementById(`cs-q-save-${qId}`);
  if (status) status.textContent = "Saving...";
  const text = value === undefined ? ((document.getElementById(`cs-ans-${qId}`) || {}).value || "") : value;
  csQueueSave("cs-ans:" + qId, () => {
    const qAnswers = getCSQuestionAnswers();
    if (!qAnswers[qId]) qAnswers[qId] = {};
    qAnswers[qId].answer = text;
    if (text.trim().length > 15 && (!qAnswers[qId].status || qAnswers[qId].status === "unanswered")) {
      qAnswers[qId].status = "practicing";
      const card = document.getElementById(`cs-qcard-${qId}`) || document.getElementById(`sd-qcard-${qId}`);
      if (card) {
        card.dataset.status = "practicing";
        const pill = card.querySelector(".hr-status-pill");
        if (pill) { pill.className = "hr-status-pill practicing"; pill.innerHTML = "<span>●</span> <span>practicing</span>"; }
      }
    }
    DB.set("cs_q_answers", qAnswers);
    csAfterChange();
    const s = document.getElementById(`cs-q-save-${qId}`);
    if (s) s.textContent = "Saved";
  });
}

function cycleCSQuestionStatus(qId) {
  csFlushSaves();
  const qAnswers = getCSQuestionAnswers();
  const statuses = ["unanswered", "practicing", "answered", "strong"];
  let current = (qAnswers[qId] && qAnswers[qId].status) || "";
  if (!current) {
    const card0 = document.getElementById(`cs-qcard-${qId}`) || document.getElementById(`sd-qcard-${qId}`);
    current = (card0 && card0.dataset.status) || "unanswered";
  }
  const next = statuses[(statuses.indexOf(current) + 1) % statuses.length];

  if (!qAnswers[qId]) qAnswers[qId] = {};
  qAnswers[qId].status = next;
  DB.set("cs_q_answers", qAnswers);
  csAfterChange();

  const card = document.getElementById(`cs-qcard-${qId}`) || document.getElementById(`sd-qcard-${qId}`);
  if (card) {
    card.dataset.status = next;
    const pill = card.querySelector(".hr-status-pill");
    if (pill) { pill.className = `hr-status-pill ${next}`; pill.innerHTML = `<span>●</span> <span>${next}</span>`; }
  }
  applyCSFilters();
}

/* ================================================================
   SYSTEM DESIGN VIEW
   ================================================================ */
function buildSystemDesignView(topicId = null) {
  csFlushSaves();
  csRestoreState();
  currentCSView = "sd";
  const container = document.getElementById("view-systemdesign");
  if (!container) return;

  const sdData = csSDTopics();
  const customTopics = (getCSCustomTopics()["system_design"] || []);
  const allTopics = [...(sdData.topics || []), ...customTopics];

  if (!topicId) {
    if (!allTopics.some(t => t.id === currentSDTopicId)) currentSDTopicId = (allTopics[0] && allTopics[0].id) || "";
  } else {
    currentSDTopicId = topicId;
  }
  const activeTopic = allTopics.find(t => t.id === currentSDTopicId) || allTopics[0];
  if (activeTopic) currentSDTopicId = activeTopic.id;
  csRememberView();

  const tracks = (sdData.meta && sdData.meta.tracks) || [];
  const trackOrder = {};
  tracks.forEach((tr, i) => { trackOrder[tr.id] = i; });
  const trackLabel = {};
  tracks.forEach(tr => { trackLabel[tr.id] = tr.label; });

  const qAnswers = getCSQuestionAnswers();
  const customQs = getCSCustomQuestions();
  let qDone = 0, qTotal = 0;
  allTopics.forEach(t => { const p = csTopicProgress(t, qAnswers, customQs); qDone += p.done; qTotal += p.total; });

  const sidebarHtml = `
    <div class="cs-subject-header">
      <span>System Design Domains</span>
      <button class="hr-btn" style="padding:1px 6px;font-size:10px" onclick="openAddCSTopicModal('system_design')" title="Add System Design Topic">+</button>
    </div>
    <div style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-top:4px">${qDone}/${qTotal} problems answered</div>
    ${csTopicSearchBox(csTopicSearch)}
    <div style="display:flex;flex-direction:column;gap:4px;margin-top:2px">
      ${csRenderTopicList(allTopics, currentSDTopicId, {
        groupOf: t => t.track
          ? { key: t.track, label: trackLabel[t.track] || t.track, order: trackOrder[t.track] !== undefined ? trackOrder[t.track] : 50 }
          : { key: "custom", label: "Your custom topics", order: 999 },
        activeClass: "sd-active", goodColor: "#818cf8", onclick: "buildSystemDesignView"
      })}
    </div>`;

  container.innerHTML = `
    <div class="cs-container">
      <div class="cs-header">
        <div>
          <div class="cs-title">system design tracker</div>
          <div class="cs-subtitle">High-level architecture, scalability trade-offs, distributed protocols, and classic case studies.</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="hr-btn hr-btn-primary" style="background:var(--sd-indigo-bg);border-color:var(--sd-indigo-border);color:var(--sd-indigo)" onclick="openAddCSTopicModal('system_design')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Add System Design Topic</span>
          </button>
        </div>
      </div>

      <div class="cs-layout">
        <div class="cs-sidebar">${sidebarHtml}</div>
        <div class="cs-main" id="sd-topic-detail-area">
          ${activeTopic ? renderSDTopicDetails(activeTopic) : `<div style="padding:40px;text-align:center;color:var(--muted)">Select a system design domain.</div>`}
        </div>
      </div>
    </div>`;
  if (csTopicSearch) filterCSTopicList(csTopicSearch);
  applyCSFilters();
}

function renderSDTopicDetails(topic) {
  const understandingDB = getCSUnderstanding();
  const notesDB = getCSNotes();
  const qAnswers = getCSQuestionAnswers();
  const customQuestions = (getCSCustomQuestions()[topic.id] || []);
  const allQuestions = [...(topic.interview_questions || []), ...customQuestions];

  const levels = getCSCustomLevels();
  const currentLevel = (understandingDB[topic.id] && understandingDB[topic.id].level) || "Not started";
  const savedNotes = notesDB[topic.id] || topic.notes || {};
  const currentNoteVal = typeof savedNotes[currentSDNoteTab] === "string" ? savedNotes[currentSDNoteTab] : "";

  const radioOptionsHtml = levels.map(lvl => `
    <div class="cs-radio-option ${lvl === currentLevel ? "sd-selected" : ""}" onclick="setSDUnderstandingLevel('${csArg(topic.id)}', '${csArg(lvl)}')">
      <div class="cs-radio-dot"></div>
      <span>${csEsc(lvl)}</span>
    </div>`).join("");

  const cardOpts = { cardPrefix: "sd-qcard-", defaultFreq: "high", answerLabel: "Architectural Solution &amp; Trade-offs", placeholder: "Draft your step-by-step system design (Bottlenecks, data flow, capacity estimation, APIs)..." };
  const questionsHtml = allQuestions.map((q, idx) => {
    const qId = q.id || `sd-q-${topic.id}-${idx}`;
    return csQuestionCard(q, qId, qAnswers[qId] || {}, cardOpts);
  }).join("");

  const tab = (key, label) => `<button class="cs-note-tab-btn ${currentSDNoteTab === key ? "active" : ""}" onclick="switchSDNoteTab('${csArg(topic.id)}', '${key}')">${label}</button>`;

  return `
    <div class="cs-topic-card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <div>
          <div style="font-family:var(--mono);font-size:11px;color:var(--sd-indigo);margin-bottom:2px">${csEsc(topic.category || "System Design")}${topic.level ? " · " + csEsc(topic.level) : ""}</div>
          <div class="cs-topic-title">${csEsc(topic.topic)}</div>
        </div>
        <div style="display:flex;gap:6px">
          <button class="hr-btn" onclick="openAddCSQuestionModal('${csArg(topic.id)}', true)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Add Design Problem</span>
          </button>
        </div>
      </div>

      ${csRenderGuide(topic)}

      <div class="cs-understanding-box">
        <div class="cs-understanding-header">
          <span style="font-family:var(--mono);font-size:11px;text-transform:uppercase;color:var(--muted);font-weight:600">
            System Design Depth: <strong style="color:var(--sd-indigo)">${csEsc(currentLevel)}</strong>
          </span>
          <button class="hr-btn" style="padding:2px 8px;font-size:10.5px" onclick="promptAddCSCustomLevel()">+ Custom Level</button>
        </div>
        <div class="cs-radio-grid">${radioOptionsHtml}</div>
      </div>

      <div style="margin-top:20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <div class="cs-notes-tabs">
            ${tab("explanation", "Core Architecture")}${tab("examples", "Real-World Examples")}${tab("confusion", "Trade-offs &amp; Bottlenecks")}${tab("interview_notes", "Interview Blueprint")}
          </div>
          <span style="font-family:var(--mono);font-size:10.5px;color:var(--muted)" id="sd-note-save-status">Auto-saved</span>
        </div>
        <textarea class="hr-answer-textarea" id="sd-note-input" style="min-height:110px" placeholder="Document system design blueprint, diagram notes, and failure modes for ${csEsc(topic.topic)}..." oninput="saveSDTopicNote('${csArg(topic.id)}', this.value)">${csEsc(currentNoteVal)}</textarea>
      </div>

      <div style="margin-top:28px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <span style="font-family:var(--mono);font-size:11.5px;text-transform:uppercase;color:var(--muted);font-weight:600">
            Real-World Design Interview Questions <span data-q-count>(${allQuestions.length})</span>
          </span>
          <button class="hr-btn" style="padding:3px 9px;font-size:11px" onclick="openAddCSQuestionModal('${csArg(topic.id)}', true)">+ Add Problem</button>
        </div>
        ${allQuestions.length > 3 ? csFilterBar(allQuestions) : ""}
        <div style="display:flex;flex-direction:column;gap:10px">
          ${questionsHtml.length ? questionsHtml : `<div style="padding:20px;text-align:center;color:var(--muted)">No design problems added.</div>`}
        </div>
      </div>
    </div>`;
}

function setSDUnderstandingLevel(topicId, level) {
  csFlushSaves();
  const db = getCSUnderstanding();
  if (!db[topicId]) db[topicId] = {};
  db[topicId].level = level;
  db[topicId].updatedAt = Date.now();
  DB.set("cs_understanding", db);
  csAfterChange();
  buildSystemDesignView(topicId);
}

function switchSDNoteTab(topicId, tabName) {
  csFlushSaves();
  currentSDNoteTab = tabName;
  const allTopics = [...(csSDTopics().topics || []), ...(getCSCustomTopics()["system_design"] || [])];
  const activeTopic = allTopics.find(t => t.id === topicId);
  const main = document.getElementById("sd-topic-detail-area");
  if (main && activeTopic) { main.innerHTML = renderSDTopicDetails(activeTopic); applyCSFilters(); }
}

function saveSDTopicNote(topicId, value) {
  const tab = currentSDNoteTab;
  const status = document.getElementById("sd-note-save-status");
  if (status) status.textContent = "Saving...";
  const val = value === undefined ? ((document.getElementById("sd-note-input") || {}).value || "") : value;
  csQueueSave("sd-note:" + topicId + ":" + tab, () => {
    const notesDB = getCSNotes();
    if (!notesDB[topicId]) notesDB[topicId] = {};
    notesDB[topicId][tab] = val;
    DB.set("cs_notes", notesDB);
    csAfterChange();
    const s = document.getElementById("sd-note-save-status");
    if (s) s.textContent = "Saved";
  });
}

/* ================================================================
   CUSTOM TOPICS / QUESTIONS
   ================================================================ */
function openAddCSTopicModal(subjectId) {
  const isSD = (subjectId === "system_design");
  const modalHtml = `
    <div class="apt-modal-overlay" id="cs-topic-modal" onclick="closeHRModal(event, 'cs-topic-modal')">
      <div class="apt-modal-card" style="max-width:480px" onclick="event.stopPropagation()">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <div style="font-family:var(--serif);font-size:22px;font-weight:400;color:var(--text)">${isSD ? "Add System Design Topic" : "Add CS Topic"}</div>
          <button class="modal-close" onclick="closeHRModalDirect('cs-topic-modal')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div style="display:flex;flex-direction:column;gap:12px">
          <div>
            <label class="modal-section-label">Topic Title</label>
            <input type="text" class="hr-search-input" id="cs-topic-input-name" style="width:100%" placeholder="e.g. Distributed Consensus (Paxos/Raft), Garbage Collection">
          </div>
          <div>
            <label class="modal-section-label">Category / Domain</label>
            <input type="text" class="hr-search-input" id="cs-topic-input-cat" style="width:100%" placeholder="e.g. Architecture, Protocols, Memory">
          </div>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:18px">
          <button class="hr-btn" onclick="closeHRModalDirect('cs-topic-modal')">Cancel</button>
          <button class="hr-btn hr-btn-primary" onclick="saveCSTopicModal('${csArg(subjectId)}')">Save Topic</button>
        </div>
      </div>
    </div>`;

  const old = document.getElementById("cs-topic-modal");
  if (old) old.remove();
  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

function saveCSTopicModal(subjectId) {
  const nameEl = document.getElementById("cs-topic-input-name");
  const catEl = document.getElementById("cs-topic-input-cat");
  const name = nameEl && nameEl.value.trim();
  const cat = (catEl && catEl.value.trim()) || "General";

  if (!name) { showAlert("Please enter a topic name."); return; }

  const customDB = getCSCustomTopics();
  if (!customDB[subjectId]) customDB[subjectId] = [];

  const newId = `${subjectId}-custom-${Date.now().toString(36)}${Math.floor(Math.random() * 36).toString(36)}`;
  customDB[subjectId].push({ id: newId, topic: name, category: cat, notes: {}, interview_questions: [] });

  DB.set("cs_custom_topics", customDB);
  csAfterChange();
  closeHRModalDirect("cs-topic-modal");

  if (subjectId === "system_design") buildSystemDesignView(newId);
  else buildCSView(subjectId, newId);
}

function openAddCSQuestionModal(topicId, isSD = false) {
  const modalHtml = `
    <div class="apt-modal-overlay" id="cs-q-modal" onclick="closeHRModal(event, 'cs-q-modal')">
      <div class="apt-modal-card" style="max-width:520px" onclick="event.stopPropagation()">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <div style="font-family:var(--serif);font-size:22px;font-weight:400;color:var(--text)">Add Interview Question</div>
          <button class="modal-close" onclick="closeHRModalDirect('cs-q-modal')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div style="display:flex;flex-direction:column;gap:12px">
          <div>
            <label class="modal-section-label">Question Text / Design Scenario</label>
            <textarea class="hr-answer-textarea" id="cs-modal-q-text" style="min-height:70px" placeholder="e.g. Design a distributed key-value store with tunable consistency..."></textarea>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div>
              <label class="modal-section-label">Companies (comma-separated)</label>
              <input type="text" class="hr-search-input" id="cs-modal-q-comp" style="width:100%" placeholder="Google, Amazon, Meta">
            </div>
            <div>
              <label class="modal-section-label">Frequency</label>
              <select class="hr-select" id="cs-modal-q-freq" style="width:100%">
                <option value="high">High Frequency</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:18px">
          <button class="hr-btn" onclick="closeHRModalDirect('cs-q-modal')">Cancel</button>
          <button class="hr-btn hr-btn-primary" onclick="saveCSQuestionModal('${csArg(topicId)}', ${isSD ? "true" : "false"})">Save Question</button>
        </div>
      </div>
    </div>`;

  const old = document.getElementById("cs-q-modal");
  if (old) old.remove();
  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

function saveCSQuestionModal(topicId, isSD = false) {
  const textEl = document.getElementById("cs-modal-q-text");
  const compEl = document.getElementById("cs-modal-q-comp");
  const freqEl = document.getElementById("cs-modal-q-freq");
  const text = textEl && textEl.value.trim();
  const compStr = (compEl && compEl.value.trim()) || "";
  const freq = (freqEl && freqEl.value) || "medium";

  if (!text) { showAlert("Please enter question text."); return; }

  const customQDB = getCSCustomQuestions();
  if (!customQDB[topicId]) customQDB[topicId] = [];

  const companies = compStr ? compStr.split(",").map(c => c.trim()).filter(Boolean) : ["General"];
  const newQId = `cust-q-${topicId}-${Date.now().toString(36)}${Math.floor(Math.random() * 36).toString(36)}`;

  customQDB[topicId].push({ id: newQId, question: text, companies, frequency: freq, status: "unanswered", your_answer: "" });

  DB.set("cs_custom_questions", customQDB);
  csAfterChange();
  closeHRModalDirect("cs-q-modal");

  if (isSD) buildSystemDesignView(topicId);
  else buildCSView(currentCSSubjectId, topicId);
}
