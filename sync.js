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
//   hr_answers    - {} object, keyed by HR question id -> {answer, status}
//   star_stories  - [] array of STAR story objects
//   research      - [] array of research tracker entries
//   cs_state      - {} object, keyed by CS topic id -> {level, notes, qStatus}
//   sysdesign_state - {} object, keyed by SD topic id -> {level, notes, qStatus}
//   notes_v2      - {} object, keyed by note id -> rich note (title, html, tags, pos...)
//   reminders     - [] array of reminder objects
//   applications  - [] array of job application entries
//   app_fields    - [] array of custom application field defs
const DSA_KEYS = [
  "completed", "notes", "global_notes", "solve_dates",
  "solve_times", "pattern_logs", "diff_ratings", "saved_code", "review_times"
];
const MODULE_KEYS = [
  "aptitude", "aptitude_qs", "aptitude_notes", "hr_answers", "star_stories",
  "research", "cs_state", "sysdesign_state", "notes_v2", "reminders",
  "applications", "applications_custom_fields", "app_fields", "puzzles_solved"
];
const SYNC_KEYS = DSA_KEYS.concat(MODULE_KEYS);
const ARRAY_KEYS = new Set([
  "global_notes",
  "aptitude_qs", "star_stories", "research", "reminders", "applications", "applications_custom_fields", "app_fields"
]);   // keys whose default is [] not {} — puzzles_solved is a {} boolean map, not listed here

function _getLocalData() {
  const out = {};
  SYNC_KEYS.forEach(k => {
    const raw = localStorage.getItem("dsa_" + k);
    try { out[k] = raw ? JSON.parse(raw) : (ARRAY_KEYS.has(k) ? [] : {}); }
    catch { out[k] = ARRAY_KEYS.has(k) ? [] : {}; }
  });
  return out;
}

function _saveLocalData(merged) {
  SYNC_KEYS.forEach(k => {
    if (merged[k] !== undefined)
      localStorage.setItem("dsa_" + k, JSON.stringify(merged[k]));
  });
}

// Merge: remote wins for object keys (union); for arrays keep the longer one.
function _mergeData(local, remote) {
  return {
    completed:    { ...local.completed,    ...(remote.completed    || {}) },
    notes:        { ...local.notes,        ...(remote.notes        || {}) },
    solve_dates:  { ...local.solve_dates,  ...(remote.solve_dates  || {}) },
    solve_times:  { ...local.solve_times,  ...(remote.solve_times  || {}) },
    pattern_logs: { ...local.pattern_logs, ...(remote.pattern_logs || {}) },
    diff_ratings: { ...local.diff_ratings, ...(remote.diff_ratings || {}) },
    saved_code:   { ...local.saved_code,   ...(remote.saved_code   || {}) },
    // For review_times, keep the LATER timestamp per problem (most recent review wins)
    review_times: Object.fromEntries(
      [...new Set([
        ...Object.keys(local.review_times  || {}),
        ...Object.keys(remote.review_times || {})
      ])].map(k => [k, Math.max(
        (local.review_times  || {})[k] || 0,
        (remote.review_times || {})[k] || 0
      )])
    ),
    global_notes:
      (remote.global_notes || []).length >= (local.global_notes || []).length
        ? remote.global_notes
        : local.global_notes,

    // orbit. placement modules: generic merge (object keys union, remote wins;
    // arrays keep whichever side is longer). Additive only — does not touch
    // any of the DSA keys handled explicitly above.
    ..._mergeModuleKeys(local, remote),
  };
}

function _mergeModuleKeys(local, remote) {
  const out = {};
  MODULE_KEYS.forEach((k) => {
    if (ARRAY_KEYS.has(k)) {
      const l = local[k] || [], r = remote[k] || [];
      out[k] = r.length >= l.length ? r : l;
    } else {
      out[k] = { ...(local[k] || {}), ...(remote[k] || {}) };
    }
  });
  return out;
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
      if (window._dsaAppReady) { buildDashboard(); updateProgress(); }
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