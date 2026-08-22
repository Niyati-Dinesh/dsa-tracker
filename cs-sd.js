/* ================================================================
   CS FUNDAMENTALS & SYSTEM DESIGN ENGINE
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

let currentCSSubjectId = "dbms";
let currentCSTopicId = "dbms-1";
let currentCSNoteTab = "explanation";

let currentSDTopicId = "sd-1";
let currentSDNoteTab = "explanation";

function getCSCustomTopics() {
  return DB.get("cs_custom_topics") || {};
}

function getCSCustomQuestions() {
  return DB.get("cs_custom_questions") || {};
}

function getCSUnderstanding() {
  return DB.get("cs_understanding") || {};
}

function getCSNotes() {
  return DB.get("cs_notes") || {};
}

function getCSQuestionAnswers() {
  return DB.get("cs_q_answers") || {};
}

function getCSCustomLevels() {
  return DB.get("cs_custom_levels") || [
    "Not started",
    "Need revision",
    "Conceptual understanding",
    "Can explain with example",
    "Confident",
    "Interview ready"
  ];
}

function buildCSView(subjectId = currentCSSubjectId, topicId = null) {
  currentCSSubjectId = subjectId;
  const container = document.getElementById("view-cs");
  if (!container) return;

  const subjects = (typeof CS_DATA !== "undefined" && CS_DATA.subjects) ? CS_DATA.subjects : [];
  const subject = subjects.find(s => s.id === currentCSSubjectId) || subjects[0];
  if (!subject) return;

  const customTopics = (getCSCustomTopics()[subject.id] || []);
  const allTopics = [...(subject.topics || []), ...customTopics];

  if (!topicId) {
    if (!allTopics.some(t => t.id === currentCSTopicId)) {
      currentCSTopicId = allTopics[0]?.id || "";
    }
  } else {
    currentCSTopicId = topicId;
  }

  const activeTopic = allTopics.find(t => t.id === currentCSTopicId) || allTopics[0];
  const understandingDB = getCSUnderstanding();

  let sidebarHtml = `
    <div class="cs-subject-header">Subjects</div>
    <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px">
      ${subjects.map(s => `
        <button class="hr-btn ${s.id === currentCSSubjectId ? 'hr-btn-primary' : ''}" style="padding:4px 10px;font-size:11.5px" onclick="buildCSView('${s.id}')">
          ${escHtml(s.subject)}
        </button>
      `).join("")}
    </div>

    <div class="cs-subject-header" style="border-top:1px solid var(--line);padding-top:12px;margin-top:6px">
      <span>${escHtml(subject.subject)} Topics</span>
      <button class="hr-btn" style="padding:1px 6px;font-size:10px" onclick="openAddCSTopicModal('${subject.id}')" title="Add Custom Topic">+</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px;margin-top:4px">
      ${allTopics.map(t => {
        const level = understandingDB[t.id]?.level || "Not started";
        const isAct = t.id === currentCSTopicId;
        return `
          <div class="cs-topic-item ${isAct ? 'active' : ''}" onclick="buildCSView('${subject.id}', '${t.id}')">
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(t.topic)}</span>
            <span style="font-family:var(--mono);font-size:9.5px;color:${level === 'Interview ready' || level === 'Confident' ? '#4ade80' : 'var(--muted)'};flex-shrink:0">
              ${level === 'Interview ready' ? 'Ready' : (level === 'Not started' ? '—' : level.slice(0, 10))}
            </span>
          </div>
        `;
      }).join("")}
    </div>
  `;

  container.innerHTML = `
    <div class="cs-container">
      <div class="cs-header">
        <div>
          <div class="cs-title">cs fundamentals tracker</div>
          <div class="cs-subtitle">Core computer science principles, interview questions, and deep architectural notes.</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="hr-btn hr-btn-primary" onclick="openAddCSTopicModal('${subject.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Add Topic</span>
          </button>
        </div>
      </div>

      <div class="cs-layout">
        <div class="cs-sidebar">
          ${sidebarHtml}
        </div>

        <div class="cs-main" id="cs-topic-detail-area">
          ${activeTopic ? renderCSTopicDetails(subject, activeTopic) : `<div style="padding:40px;text-align:center;color:var(--muted)">Select a topic to start studying.</div>`}
        </div>
      </div>
    </div>
  `;
}

function renderCSTopicDetails(subject, topic) {
  const understandingDB = getCSUnderstanding();
  const notesDB = getCSNotes();
  const qAnswers = getCSQuestionAnswers();
  const customQuestions = (getCSCustomQuestions()[topic.id] || []);
  const allQuestions = [...(topic.interview_questions || []), ...customQuestions];

  const levels = getCSCustomLevels();
  const currentLevel = understandingDB[topic.id]?.level || "Not started";

  const savedNotes = notesDB[topic.id] || topic.notes || {};
  const currentNoteVal = savedNotes[currentCSNoteTab] || "";

  const radioOptionsHtml = levels.map(lvl => `
    <div class="cs-radio-option ${lvl === currentLevel ? 'selected' : ''}" onclick="setCSUnderstandingLevel('${topic.id}', '${escHtml(lvl)}')">
      <div class="cs-radio-dot"></div>
      <span>${escHtml(lvl)}</span>
    </div>
  `).join("");

  const questionsHtml = allQuestions.map((q, idx) => {
    const qId = q.id || `cs-q-${topic.id}-${idx}`;
    const saved = qAnswers[qId] || {};
    const ansText = saved.answer !== undefined ? saved.answer : (q.your_answer || "");
    const status = saved.status || q.status || "unanswered";

    const compBadges = (q.companies || []).map(c => `<span class="hr-pill" style="color:var(--text)">${escHtml(c)}</span>`).join("");
    const freqClass = `cs-freq-${q.frequency || 'medium'}`;

    return `
      <div class="cs-q-card" id="cs-qcard-${qId}">
        <div class="cs-q-top">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <span class="cs-freq-badge ${freqClass}">${escHtml(q.frequency || 'medium')} freq</span>
            ${compBadges}
          </div>
          <div class="hr-status-pill ${status}" onclick="cycleCSQuestionStatus('${qId}')" title="Click to cycle status">
            <span>●</span> <span>${status}</span>
          </div>
        </div>

        <div class="cs-q-text">${escHtml(q.question)}</div>

        <div style="margin-top:10px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
            <label class="modal-section-label" style="margin:0;font-size:10.5px">My Prepared Answer</label>
            <span style="font-family:var(--mono);font-size:10px;color:var(--muted)" id="cs-q-save-${qId}">Auto-saved</span>
          </div>
          <textarea class="hr-answer-textarea" id="cs-ans-${qId}" placeholder="Draft your interview-ready technical answer with examples..." oninput="saveCSQuestionAnswer('${qId}')">${escHtml(ansText)}</textarea>
        </div>
      </div>
    `;
  }).join("");

  return `
    <div class="cs-topic-card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <div>
          <div style="font-family:var(--mono);font-size:11px;color:var(--cs-green);margin-bottom:2px">${escHtml(subject.subject)}</div>
          <div class="cs-topic-title">${escHtml(topic.topic)}</div>
        </div>
        <div style="display:flex;gap:6px">
          <button class="hr-btn" onclick="openAddCSQuestionModal('${topic.id}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Add Interview Question</span>
          </button>
        </div>
      </div>

      <div class="cs-understanding-box">
        <div class="cs-understanding-header">
          <span style="font-family:var(--mono);font-size:11px;text-transform:uppercase;color:var(--muted);font-weight:600">
            Current Understanding Level: <strong style="color:var(--cs-green)">${escHtml(currentLevel)}</strong>
          </span>
          <button class="hr-btn" style="padding:2px 8px;font-size:10.5px" onclick="promptAddCSCustomLevel()">+ Custom Level</button>
        </div>
        <div class="cs-radio-grid">
          ${radioOptionsHtml}
        </div>
      </div>

      <div style="margin-top:20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <div class="cs-notes-tabs">
            <button class="cs-note-tab-btn ${currentCSNoteTab === 'explanation' ? 'active' : ''}" onclick="switchCSNoteTab('${topic.id}', 'explanation')">Explanation</button>
            <button class="cs-note-tab-btn ${currentCSNoteTab === 'examples' ? 'active' : ''}" onclick="switchCSNoteTab('${topic.id}', 'examples')">Examples</button>
            <button class="cs-note-tab-btn ${currentCSNoteTab === 'confusion' ? 'active' : ''}" onclick="switchCSNoteTab('${topic.id}', 'confusion')">Confusion / Doubts</button>
            <button class="cs-note-tab-btn ${currentCSNoteTab === 'mistakes' ? 'active' : ''}" onclick="switchCSNoteTab('${topic.id}', 'mistakes')">Mistakes to Avoid</button>
            <button class="cs-note-tab-btn ${currentCSNoteTab === 'interview_notes' ? 'active' : ''}" onclick="switchCSNoteTab('${topic.id}', 'interview_notes')">Interview Notes</button>
          </div>
          <span style="font-family:var(--mono);font-size:10.5px;color:var(--muted)" id="cs-note-save-status">Auto-saved</span>
        </div>

        <textarea class="hr-answer-textarea" id="cs-note-input" style="min-height:110px" placeholder="Write comprehensive ${currentCSNoteTab.replace('_', ' ')} for ${escHtml(topic.topic)}..." oninput="saveCSTopicNote('${topic.id}')">${escHtml(currentNoteVal)}</textarea>
      </div>

      <div style="margin-top:28px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <span style="font-family:var(--mono);font-size:11.5px;text-transform:uppercase;color:var(--muted);font-weight:600">
            Frequently Asked Interview Questions (${allQuestions.length})
          </span>
          <button class="hr-btn" style="padding:3px 9px;font-size:11px" onclick="openAddCSQuestionModal('${topic.id}')">+ Add Question</button>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px">
          ${questionsHtml.length ? questionsHtml : `<div style="padding:20px;text-align:center;color:var(--muted)">No interview questions found. Add one above!</div>`}
        </div>
      </div>
    </div>
  `;
}

function setCSUnderstandingLevel(topicId, level) {
  const db = getCSUnderstanding();
  if (!db[topicId]) db[topicId] = {};
  db[topicId].level = level;
  db[topicId].updatedAt = Date.now();
  DB.set("cs_understanding", db);
  if (typeof syncAfterChange === "function") syncAfterChange();
  buildCSView(currentCSSubjectId, topicId);
}

function promptAddCSCustomLevel() {
  const custom = prompt("Enter new understanding level name (e.g. 'Production Mastered', 'Revising Soon'):");
  if (!custom || !custom.trim()) return;
  const levels = getCSCustomLevels();
  if (!levels.includes(custom.trim())) {
    levels.push(custom.trim());
    DB.set("cs_custom_levels", levels);
    buildCSView();
  }
}

function switchCSNoteTab(topicId, tabName) {
  currentCSNoteTab = tabName;
  const main = document.getElementById("cs-topic-detail-area");
  const subjects = (typeof CS_DATA !== "undefined" && CS_DATA.subjects) ? CS_DATA.subjects : [];
  const subject = subjects.find(s => s.id === currentCSSubjectId) || subjects[0];
  const customTopics = (getCSCustomTopics()[subject.id] || []);
  const allTopics = [...(subject.topics || []), ...customTopics];
  const activeTopic = allTopics.find(t => t.id === topicId);
  if (main && activeTopic) main.innerHTML = renderCSTopicDetails(subject, activeTopic);
}

let csNoteDebounce = null;
function saveCSTopicNote(topicId) {
  clearTimeout(csNoteDebounce);
  const status = document.getElementById("cs-note-save-status");
  if (status) status.textContent = "Saving...";

  csNoteDebounce = setTimeout(() => {
    const val = document.getElementById("cs-note-input")?.value || "";
    const notesDB = getCSNotes();
    if (!notesDB[topicId]) notesDB[topicId] = {};
    notesDB[topicId][currentCSNoteTab] = val;
    DB.set("cs_notes", notesDB);
    if (typeof syncAfterChange === "function") syncAfterChange();
    if (status) status.textContent = "Saved";
  }, 400);
}

let csQAnswerDebounce = {};
function saveCSQuestionAnswer(qId) {
  clearTimeout(csQAnswerDebounce[qId]);
  const status = document.getElementById(`cs-q-save-${qId}`);
  if (status) status.textContent = "Saving...";

  csQAnswerDebounce[qId] = setTimeout(() => {
    const text = document.getElementById(`cs-ans-${qId}`)?.value || "";
    const qAnswers = getCSQuestionAnswers();
    if (!qAnswers[qId]) qAnswers[qId] = { status: "practicing" };
    qAnswers[qId].answer = text;
    if (text.trim().length > 15 && (!qAnswers[qId].status || qAnswers[qId].status === "unanswered")) {
      qAnswers[qId].status = "practicing";
    }
    DB.set("cs_q_answers", qAnswers);
    if (typeof syncAfterChange === "function") syncAfterChange();
    if (status) status.textContent = "Saved";
  }, 400);
}

function cycleCSQuestionStatus(qId) {
  const qAnswers = getCSQuestionAnswers();
  const statuses = ["unanswered", "practicing", "answered", "strong"];
  const current = qAnswers[qId]?.status || "unanswered";
  const nextIdx = (statuses.indexOf(current) + 1) % statuses.length;
  const next = statuses[nextIdx];

  if (!qAnswers[qId]) qAnswers[qId] = {};
  qAnswers[qId].status = next;
  DB.set("cs_q_answers", qAnswers);
  if (typeof syncAfterChange === "function") syncAfterChange();

  const card = document.getElementById(`cs-qcard-${qId}`) || document.getElementById(`sd-qcard-${qId}`);
  if (card) {
    const pill = card.querySelector(".hr-status-pill");
    if (pill) {
      pill.className = `hr-status-pill ${next}`;
      pill.innerHTML = `<span>●</span> <span>${next}</span>`;
    }
  }
}

function buildSystemDesignView(topicId = null) {
  const container = document.getElementById("view-systemdesign");
  if (!container) return;

  const sdData = (typeof CS_DATA !== "undefined" && CS_DATA.system_design) ? CS_DATA.system_design : { topics: [] };
  const customTopics = (getCSCustomTopics()["system_design"] || []);
  const allTopics = [...(sdData.topics || []), ...customTopics];

  if (!topicId) {
    if (!allTopics.some(t => t.id === currentSDTopicId)) {
      currentSDTopicId = allTopics[0]?.id || "";
    }
  } else {
    currentSDTopicId = topicId;
  }

  const activeTopic = allTopics.find(t => t.id === currentSDTopicId) || allTopics[0];
  const understandingDB = getCSUnderstanding();

  const sidebarHtml = `
    <div class="cs-subject-header">
      <span>System Design Domains</span>
      <button class="hr-btn" style="padding:1px 6px;font-size:10px" onclick="openAddCSTopicModal('system_design')" title="Add System Design Topic">+</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px;margin-top:4px">
      ${allTopics.map(t => {
        const level = understandingDB[t.id]?.level || "Not started";
        const isAct = t.id === currentSDTopicId;
        return `
          <div class="cs-topic-item ${isAct ? 'sd-active' : ''}" onclick="buildSystemDesignView('${t.id}')">
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(t.topic)}</span>
            <span style="font-family:var(--mono);font-size:9.5px;color:${level === 'Interview ready' || level === 'Confident' ? '#818cf8' : 'var(--muted)'};flex-shrink:0">
              ${level === 'Interview ready' ? 'Ready' : (level === 'Not started' ? '—' : level.slice(0, 10))}
            </span>
          </div>
        `;
      }).join("")}
    </div>
  `;

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
        <div class="cs-sidebar">
          ${sidebarHtml}
        </div>

        <div class="cs-main" id="sd-topic-detail-area">
          ${activeTopic ? renderSDTopicDetails(activeTopic) : `<div style="padding:40px;text-align:center;color:var(--muted)">Select a system design domain.</div>`}
        </div>
      </div>
    </div>
  `;
}

function renderSDTopicDetails(topic) {
  const understandingDB = getCSUnderstanding();
  const notesDB = getCSNotes();
  const qAnswers = getCSQuestionAnswers();
  const customQuestions = (getCSCustomQuestions()[topic.id] || []);
  const allQuestions = [...(topic.interview_questions || []), ...customQuestions];

  const levels = getCSCustomLevels();
  const currentLevel = understandingDB[topic.id]?.level || "Not started";

  const savedNotes = notesDB[topic.id] || topic.notes || {};
  const currentNoteVal = savedNotes[currentSDNoteTab] || "";

  const radioOptionsHtml = levels.map(lvl => `
    <div class="cs-radio-option ${lvl === currentLevel ? 'sd-selected' : ''}" onclick="setSDUnderstandingLevel('${topic.id}', '${escHtml(lvl)}')">
      <div class="cs-radio-dot"></div>
      <span>${escHtml(lvl)}</span>
    </div>
  `).join("");

  const questionsHtml = allQuestions.map((q, idx) => {
    const qId = q.id || `sd-q-${topic.id}-${idx}`;
    const saved = qAnswers[qId] || {};
    const ansText = saved.answer !== undefined ? saved.answer : (q.your_answer || "");
    const status = saved.status || q.status || "unanswered";

    const compBadges = (q.companies || []).map(c => `<span class="hr-pill" style="color:var(--text)">${escHtml(c)}</span>`).join("");

    return `
      <div class="cs-q-card" id="sd-qcard-${qId}">
        <div class="cs-q-top">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <span class="cs-freq-badge cs-freq-${q.frequency || 'high'}">${escHtml(q.frequency || 'high')} freq</span>
            ${compBadges}
          </div>
          <div class="hr-status-pill ${status}" onclick="cycleCSQuestionStatus('${qId}')" title="Click to cycle status">
            <span>●</span> <span>${status}</span>
          </div>
        </div>

        <div class="cs-q-text">${escHtml(q.question)}</div>

        <div style="margin-top:10px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
            <label class="modal-section-label" style="margin:0;font-size:10.5px">Architectural Solution &amp; Trade-offs</label>
            <span style="font-family:var(--mono);font-size:10px;color:var(--muted)" id="cs-q-save-${qId}">Auto-saved</span>
          </div>
          <textarea class="hr-answer-textarea" id="cs-ans-${qId}" placeholder="Draft your step-by-step system design (Bottlenecks, data flow, capacity estimation, APIs)..." oninput="saveCSQuestionAnswer('${qId}')">${escHtml(ansText)}</textarea>
        </div>
      </div>
    `;
  }).join("");

  return `
    <div class="cs-topic-card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <div>
          <div style="font-family:var(--mono);font-size:11px;color:var(--sd-indigo);margin-bottom:2px">${escHtml(topic.category || "System Design")}</div>
          <div class="cs-topic-title">${escHtml(topic.topic)}</div>
        </div>
        <div style="display:flex;gap:6px">
          <button class="hr-btn" onclick="openAddCSQuestionModal('${topic.id}', true)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Add Design Problem</span>
          </button>
        </div>
      </div>

      <div class="cs-understanding-box">
        <div class="cs-understanding-header">
          <span style="font-family:var(--mono);font-size:11px;text-transform:uppercase;color:var(--muted);font-weight:600">
            System Design Depth: <strong style="color:var(--sd-indigo)">${escHtml(currentLevel)}</strong>
          </span>
          <button class="hr-btn" style="padding:2px 8px;font-size:10.5px" onclick="promptAddCSCustomLevel()">+ Custom Level</button>
        </div>
        <div class="cs-radio-grid">
          ${radioOptionsHtml}
        </div>
      </div>

      <div style="margin-top:20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <div class="cs-notes-tabs">
            <button class="cs-note-tab-btn ${currentSDNoteTab === 'explanation' ? 'active' : ''}" onclick="switchSDNoteTab('${topic.id}', 'explanation')">Core Architecture</button>
            <button class="cs-note-tab-btn ${currentSDNoteTab === 'examples' ? 'active' : ''}" onclick="switchSDNoteTab('${topic.id}', 'examples')">Real-World Examples</button>
            <button class="cs-note-tab-btn ${currentSDNoteTab === 'confusion' ? 'active' : ''}" onclick="switchSDNoteTab('${topic.id}', 'confusion')">Trade-offs &amp; Bottlenecks</button>
            <button class="cs-note-tab-btn ${currentSDNoteTab === 'interview_notes' ? 'active' : ''}" onclick="switchSDNoteTab('${topic.id}', 'interview_notes')">Interview Blueprint</button>
          </div>
          <span style="font-family:var(--mono);font-size:10.5px;color:var(--muted)" id="sd-note-save-status">Auto-saved</span>
        </div>

        <textarea class="hr-answer-textarea" id="sd-note-input" style="min-height:110px" placeholder="Document system design blueprint, diagram notes, and failure modes for ${escHtml(topic.topic)}..." oninput="saveSDTopicNote('${topic.id}')">${escHtml(currentNoteVal)}</textarea>
      </div>

      <div style="margin-top:28px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <span style="font-family:var(--mono);font-size:11.5px;text-transform:uppercase;color:var(--muted);font-weight:600">
            Real-World Design Interview Questions (${allQuestions.length})
          </span>
          <button class="hr-btn" style="padding:3px 9px;font-size:11px" onclick="openAddCSQuestionModal('${topic.id}', true)">+ Add Problem</button>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px">
          ${questionsHtml.length ? questionsHtml : `<div style="padding:20px;text-align:center;color:var(--muted)">No design problems added.</div>`}
        </div>
      </div>
    </div>
  `;
}

function setSDUnderstandingLevel(topicId, level) {
  const db = getCSUnderstanding();
  if (!db[topicId]) db[topicId] = {};
  db[topicId].level = level;
  db[topicId].updatedAt = Date.now();
  DB.set("cs_understanding", db);
  if (typeof syncAfterChange === "function") syncAfterChange();
  buildSystemDesignView(topicId);
}

function switchSDNoteTab(topicId, tabName) {
  currentSDNoteTab = tabName;
  const sdData = (typeof CS_DATA !== "undefined" && CS_DATA.system_design) ? CS_DATA.system_design : { topics: [] };
  const customTopics = (getCSCustomTopics()["system_design"] || []);
  const allTopics = [...(sdData.topics || []), ...customTopics];
  const activeTopic = allTopics.find(t => t.id === topicId);
  const main = document.getElementById("sd-topic-detail-area");
  if (main && activeTopic) main.innerHTML = renderSDTopicDetails(activeTopic);
}

let sdNoteDebounce = null;
function saveSDTopicNote(topicId) {
  clearTimeout(sdNoteDebounce);
  const status = document.getElementById("sd-note-save-status");
  if (status) status.textContent = "Saving...";

  sdNoteDebounce = setTimeout(() => {
    const val = document.getElementById("sd-note-input")?.value || "";
    const notesDB = getCSNotes();
    if (!notesDB[topicId]) notesDB[topicId] = {};
    notesDB[topicId][currentSDNoteTab] = val;
    DB.set("cs_notes", notesDB);
    if (typeof syncAfterChange === "function") syncAfterChange();
    if (status) status.textContent = "Saved";
  }, 400);
}

function openAddCSTopicModal(subjectId) {
  const isSD = (subjectId === "system_design");
  const modalHtml = `
    <div class="apt-modal-overlay" id="cs-topic-modal" onclick="closeHRModal(event, 'cs-topic-modal')">
      <div class="apt-modal-card" style="max-width:480px" onclick="event.stopPropagation()">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <div style="font-family:var(--serif);font-size:22px;font-weight:400;color:var(--text)">${isSD ? 'Add System Design Topic' : 'Add CS Topic'}</div>
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
          <button class="hr-btn hr-btn-primary" onclick="saveCSTopicModal('${subjectId}')">Save Topic</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("cs-topic-modal")?.remove();
  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

function saveCSTopicModal(subjectId) {
  const name = document.getElementById("cs-topic-input-name")?.value.trim();
  const cat = document.getElementById("cs-topic-input-cat")?.value.trim() || "General";

  if (!name) {
    alert("Please enter a topic name.");
    return;
  }

  const customDB = getCSCustomTopics();
  if (!customDB[subjectId]) customDB[subjectId] = [];

  const newId = `${subjectId}-custom-${Date.now().toString().slice(-4)}`;
  customDB[subjectId].push({
    id: newId,
    topic: name,
    category: cat,
    notes: {},
    interview_questions: []
  });

  DB.set("cs_custom_topics", customDB);
  if (typeof syncAfterChange === "function") syncAfterChange();
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
          <button class="hr-btn hr-btn-primary" onclick="saveCSQuestionModal('${topicId}', ${isSD})">Save Question</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("cs-q-modal")?.remove();
  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

function saveCSQuestionModal(topicId, isSD = false) {
  const text = document.getElementById("cs-modal-q-text")?.value.trim();
  const compStr = document.getElementById("cs-modal-q-comp")?.value.trim() || "";
  const freq = document.getElementById("cs-modal-q-freq")?.value || "medium";

  if (!text) {
    alert("Please enter question text.");
    return;
  }

  const customQDB = getCSCustomQuestions();
  if (!customQDB[topicId]) customQDB[topicId] = [];

  const companies = compStr ? compStr.split(",").map(c => c.trim()).filter(Boolean) : ["General"];
  const newQId = `cust-q-${topicId}-${Date.now().toString().slice(-4)}`;

  customQDB[topicId].push({
    id: newQId,
    question: text,
    companies: companies,
    frequency: freq,
    status: "unanswered",
    your_answer: ""
  });

  DB.set("cs_custom_questions", customQDB);
  if (typeof syncAfterChange === "function") syncAfterChange();
  closeHRModalDirect("cs-q-modal");

  if (isSD) buildSystemDesignView(topicId);
  else buildCSView(currentCSSubjectId, topicId);
}
