// 🔥 Firebase config
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyC9ZPBY2XrHd8q8-ruAIFkkqC96fXU8kLs",
  authDomain: "dsa-tracker-d7dab.firebaseapp.com",
  projectId: "dsa-tracker-d7dab",
  storageBucket: "dsa-tracker-d7dab.firebasestorage.app",
  messagingSenderId: "593958154029",
  appId: "1:593958154029:web:797542dbc66a3a4e08ada4",
};

const SYNC_ENABLED = true;

let db = null;
let userId = null;
let syncStatus = "offline";
let _unsubSnapshot = null;   // FIX: track listener so we can unsubscribe before re-subscribing
let _pushTimer    = null;    // FIX: debounce timer handle

const syncListeners = [];

function onSyncStatusChange(fn) { syncListeners.push(fn); }
function emitStatus(s) {
  syncStatus = s;
  syncListeners.forEach(fn => fn(s));
}

// ─── All keys that must be in sync ───────────────────────────────────────────
// FIX: was only syncing 4 of 8 keys; pattern_logs / diff_ratings / saved_code /
//      solve_times were silently left out and never reached Firebase.
//
// orbit. placement modules (added additively — original DSA_KEYS list and
// merge behavior below is untouched so existing DSA sync never regresses):
//   aptitude      - {} object, keyed by question id -> {status, attempts...}
//   aptitude_qs   - [] array, user-added aptitude questions
//   aptitude_notes- {} object, keyed by topic id -> formula/tricks notes text
//   aptitude_topic_status - {} object, keyed by topic id -> status
//   hr_answers    - {} object, keyed by HR question id -> {answer, status}
//   hr_custom_qs  - [] array of user-added HR questions
//   star_stories  - [] array of STAR story objects
//   star_prompt_answers - {} object, keyed by prompt id -> notes/answers
//   research_papers - [] array of research tracker entries
//   cs_custom_topics - {} object, custom topics added by user
//   cs_custom_questions - {} object, custom questions added by user
//   cs_understanding - {} object, topic understanding ratings
//   cs_notes      - {} object, custom user notes per topic
//   cs_q_answers  - {} object, answers/notes per question
//   cs_custom_levels - [] array of understanding level labels
//   reminders     - [] array of reminder objects
//   applications  - [] array of job application entries
//   applications_custom_fields - [] array of custom application field defs
//   puzzles_solved - {} object, boolean map of cracked puzzles
const DSA_KEYS = [
  "completed", "notes", "global_notes", "solve_dates",
  "solve_times", "pattern_logs", "diff_ratings", "saved_code", "review_times", "weekly_goal"
];
const MODULE_KEYS = [
  "aptitude", "aptitude_qs", "aptitude_notes", "aptitude_topic_status",
  "hr_answers", "hr_custom_qs", "star_stories", "star_prompt_answers",
  "research_papers", "research",
  "cs_custom_topics", "cs_custom_questions", "cs_understanding", "cs_notes", "cs_q_answers", "cs_custom_levels",
  "cs_state", "sysdesign_state", "notes_v2", "reminders",
  "applications", "applications_custom_fields", "app_fields", "puzzles_solved"
];
const SYNC_KEYS = DSA_KEYS.concat(MODULE_KEYS);
const ARRAY_KEYS = new Set([
  "global_notes",
  "aptitude_qs",
  "hr_custom_qs",
  "star_stories",
  "research_papers",
  "research",
  "reminders",
  "applications",
  "applications_custom_fields",
  "app_fields",
  "cs_custom_levels"
]);   // keys whose default is [] not {} — puzzles_solved is a {} boolean map, not listed here

function _getLocalData() {
  const out = {};
  SYNC_KEYS.forEach(k => {
    let raw = localStorage.getItem("dsa_" + k);
    // Legacy fallback: if research_papers is empty, check dsa_research
    if (k === "research_papers" && !raw) {
      const oldRaw = localStorage.getItem("dsa_research");
      if (oldRaw) raw = oldRaw;
    }
    try { out[k] = raw ? JSON.parse(raw) : (ARRAY_KEYS.has(k) ? [] : {}); }
    catch { out[k] = ARRAY_KEYS.has(k) ? [] : {}; }
  });
  // Mirror research_papers into research for backward compatibility
  if (out.research_papers && Array.isArray(out.research_papers) && out.research_papers.length > 0) {
    out.research = out.research_papers;
  }
  return out;
}

function _saveLocalData(merged) {
  SYNC_KEYS.forEach(k => {
    if (merged[k] !== undefined)
      localStorage.setItem("dsa_" + k, JSON.stringify(merged[k]));
  });
  // Keep dsa_research_papers and dsa_research in sync
  if (merged.research_papers !== undefined) {
    localStorage.setItem("dsa_research_papers", JSON.stringify(merged.research_papers));
    localStorage.setItem("dsa_research", JSON.stringify(merged.research_papers));
  } else if (merged.research !== undefined) {
    localStorage.setItem("dsa_research_papers", JSON.stringify(merged.research));
    localStorage.setItem("dsa_research", JSON.stringify(merged.research));
  }
}

// Smart ID-based array merge for collections of objects with .id
function _mergeArrayWithIds(localArr, remoteArr) {
  const l = Array.isArray(localArr) ? localArr : [];
  const r = Array.isArray(remoteArr) ? remoteArr : [];
  if (!l.length) return r;
  if (!r.length) return l;

  const hasIds = l.some(x => x && typeof x === "object" && x.id) ||
                 r.some(x => x && typeof x === "object" && x.id);

  if (!hasIds) {
    return r.length >= l.length ? r : l;
  }

  const map = new Map();
  l.forEach(item => {
    if (item && typeof item === "object" && item.id) {
      map.set(item.id, item);
    }
  });

  r.forEach(rItem => {
    if (rItem && typeof rItem === "object" && rItem.id) {
      const lItem = map.get(rItem.id);
      if (!lItem) {
        map.set(rItem.id, rItem);
      } else {
        const rTime = rItem.updatedAt || rItem.dateAdded || rItem.lastModified || rItem.updated || rItem.created || rItem.date || 0;
        const lTime = lItem.updatedAt || lItem.dateAdded || lItem.lastModified || lItem.updated || lItem.created || lItem.date || 0;
        if (typeof rTime === "number" && typeof lTime === "number" && lTime > rTime) {
          map.set(rItem.id, { ...rItem, ...lItem });
        } else {
          map.set(rItem.id, { ...lItem, ...rItem });
        }
      }
    }
  });

  const result = [];
  const addedIds = new Set();
  r.forEach(rItem => {
    if (rItem && rItem.id && map.has(rItem.id)) {
      result.push(map.get(rItem.id));
      addedIds.add(rItem.id);
    }
  });
  l.forEach(lItem => {
    if (lItem && lItem.id && !addedIds.has(lItem.id) && map.has(lItem.id)) {
      result.push(map.get(lItem.id));
      addedIds.add(lItem.id);
    }
  });

  return result;
}

// Merge: remote wins for object keys (union); for ID arrays smart union.
function _mergeData(local, remote) {
  const normLocal = { ...local };
  const normRemote = { ...remote };
  if ((!normLocal.research_papers || !normLocal.research_papers.length) && normLocal.research?.length) {
    normLocal.research_papers = normLocal.research;
  }
  if ((!normRemote.research_papers || !normRemote.research_papers.length) && normRemote.research?.length) {
    normRemote.research_papers = normRemote.research;
  }

  return {
    completed:    { ...normLocal.completed,    ...(normRemote.completed    || {}) },
    notes:        { ...normLocal.notes,        ...(normRemote.notes        || {}) },
    solve_dates:  { ...normLocal.solve_dates,  ...(normRemote.solve_dates  || {}) },
    solve_times:  { ...normLocal.solve_times,  ...(normRemote.solve_times  || {}) },
    pattern_logs: { ...normLocal.pattern_logs, ...(normRemote.pattern_logs || {}) },
    diff_ratings: { ...normLocal.diff_ratings, ...(normRemote.diff_ratings || {}) },
    saved_code:   { ...normLocal.saved_code,   ...(normRemote.saved_code   || {}) },
    weekly_goal:  normRemote.weekly_goal || normLocal.weekly_goal || 10,
    // For review_times, keep the LATER timestamp per problem (most recent review wins)
    review_times: Object.fromEntries(
      [...new Set([
        ...Object.keys(normLocal.review_times  || {}),
        ...Object.keys(normRemote.review_times || {})
      ])].map(k => [k, Math.max(
        (normLocal.review_times  || {})[k] || 0,
        (normRemote.review_times || {})[k] || 0
      )])
    ),
    global_notes: _mergeArrayWithIds(normLocal.global_notes || [], normRemote.global_notes || []),

    // orbit. placement modules: smart merge
    ..._mergeModuleKeys(normLocal, normRemote),
  };
}

function _mergeModuleKeys(local, remote) {
  const out = {};
  MODULE_KEYS.forEach((k) => {
    if (ARRAY_KEYS.has(k)) {
      const l = local[k] || [], r = remote[k] || [];
      out[k] = _mergeArrayWithIds(l, r);
    } else {
      out[k] = { ...(local[k] || {}), ...(remote[k] || {}) };
    }
  });
  return out;
}

// ─── Real-time UI refresh across active views ─────────────────────────────────
function _refreshCurrentViews() {
  if (!window._dsaAppReady) return;
  if (typeof buildDashboard === "function") buildDashboard();
  if (typeof updateProgress === "function") updateProgress();

  const activeView = document.querySelector(".view.active");
  if (!activeView) return;
  const id = activeView.id;

  if (id === "view-research" && typeof renderResearchTableRows === "function") {
    renderResearchTableRows();
  } else if (id === "view-applications" && typeof renderApplicationsContent === "function") {
    renderApplicationsContent();
  } else if (id === "view-notes" && typeof buildNotes === "function") {
    buildNotes();
  } else if (id === "view-hr" && typeof buildHRView === "function") {
    buildHRView();
  } else if (id === "view-aptitude" && typeof buildAptitudeView === "function") {
    buildAptitudeView();
  } else if (id === "view-cs" && typeof buildCSView === "function") {
    buildCSView();
  } else if (id === "view-systemdesign" && typeof buildSystemDesignView === "function") {
    buildSystemDesignView();
  } else if (id === "view-dashboard" && typeof buildMainDashboard === "function") {
    buildMainDashboard();
  } else if (id === "view-puzzles" && typeof buildPuzzlesView === "function") {
    buildPuzzlesView();
  }
}

// ─── Snapshot subscription (with cleanup) ────────────────────────────────────
// onFirstSync: optional callback fired after the first snapshot is processed
function _subscribe(docFn, onSnapshotFn, onFirstSync) {
  if (_unsubSnapshot) { _unsubSnapshot(); _unsubSnapshot = null; }

  let firstSnap = true;
  const ref = docFn(db, "users", userId);
  _unsubSnapshot = onSnapshotFn(ref, snap => {
    if (snap.exists()) {
      const merged = _mergeData(_getLocalData(), snap.data());
      _saveLocalData(merged);
      emitStatus("synced");
      _refreshCurrentViews();
    }
    if (firstSnap) { firstSnap = false; onFirstSync?.(); }
  });
}

// ─── Push local → Firestore (shared low-level) ───────────────────────────────
async function _doPush(docFn, setDocFn) {
  emitStatus("syncing");
  const payload = _getLocalData();
  payload.lastUpdated = Date.now();
  await setDocFn(docFn(db, "users", userId), payload);
  emitStatus("synced");
}

// ─── Public push (used by debounced syncAfterChange) ─────────────────────────
async function pushToCloud() {
  if (!db || !userId) return;
  try {
    // FIX: no redundant double-import; one import, reused by both snapshot + push
    const { doc, setDoc } =
      await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
    await _doPush(doc, setDoc);
  } catch (e) {
    console.error("Push failed:", e);
    emitStatus("error");
  }
}

// ─── Debounced change hook (called after every user action) ──────────────────
// FIX: was firing an immediate Firestore write on every keystroke.
//      Now waits 800 ms after the last change before pushing.
function syncAfterChange() {
  if (!SYNC_ENABLED || !db || !userId) return;
  clearTimeout(_pushTimer);
  _pushTimer = setTimeout(pushToCloud, 800);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
async function initSync() {
  if (!SYNC_ENABLED) { emitStatus("offline"); return; }
  try {
    const { initializeApp, getApps } =
      await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
    const { getFirestore, doc, setDoc, onSnapshot } =
      await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
    const { getAuth, signInAnonymously, onAuthStateChanged } =
      await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");

    // Avoid "app already exists" error on hot reloads
    const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
    db = getFirestore(app);
    const auth = getAuth(app);

    emitStatus("syncing");
    await signInAnonymously(auth);

    onAuthStateChanged(auth, async user => {
      if (!user) return;
      const uid = localStorage.getItem("dsa_sync_uid") || user.uid;
      localStorage.setItem("dsa_sync_uid", uid);
      userId = uid;

      _subscribe(doc, onSnapshot, () => _doPush(doc, setDoc));
    });
  } catch (e) {
    console.error("Sync init failed:", e);
    emitStatus("error");
  }
}

// ─── Sync code (cross-device linking) ─────────────────────────────────────────
function getSyncCode() { return userId || null; }

async function linkSyncCode(code) {
  if (!code || !db) return false;
  userId = code;
  localStorage.setItem("dsa_sync_uid", code);

  try {
    const { doc, onSnapshot, setDoc } =
      await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

    // Subscribe and only push AFTER the first snapshot has been pulled and
    // merged locally — no race condition, no arbitrary timeout.
    _subscribe(doc, onSnapshot, () => pushToCloud());
  } catch (e) {
    console.error("linkSyncCode failed:", e);
    return false;
  }
  return true;
}