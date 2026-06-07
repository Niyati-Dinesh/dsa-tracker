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
const SYNC_KEYS = [
  "completed", "notes", "global_notes", "solve_dates",
  "solve_times", "pattern_logs", "diff_ratings", "saved_code", "review_times"
];
const ARRAY_KEYS = new Set(["global_notes"]);   // keys whose default is [] not {}

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
  };
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
    const { initializeApp } =
      await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
    const { getFirestore, doc, setDoc, onSnapshot } =
      await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
    const { getAuth, signInAnonymously, onAuthStateChanged } =
      await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");

    const app = initializeApp(FIREBASE_CONFIG);
    db = getFirestore(app);
    const auth = getAuth(app);

    await signInAnonymously(auth);

    onAuthStateChanged(auth, async user => {
      if (!user) return;
      const uid = localStorage.getItem("dsa_sync_uid") || user.uid;
      localStorage.setItem("dsa_sync_uid", uid);
      userId = uid;

      // Wait for the first snapshot to merge remote→local, THEN push the
      // unified result up. This prevents the startup push from overwriting
      // data that was saved on another device.
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