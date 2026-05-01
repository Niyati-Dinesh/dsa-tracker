// 🔥 Your Firebase config (keep YOUR keys here)
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyC9ZPBY2XrHd8q8-ruAIFkkqC96fXU8kLs",
  authDomain: "dsa-tracker-d7dab.firebaseapp.com",
  projectId: "dsa-tracker-d7dab",
  storageBucket: "dsa-tracker-d7dab.firebasestorage.app",
  messagingSenderId: "593958154029",
  appId: "1:593958154029:web:797542dbc66a3a4e08ada4",
};

// ✅ Enable sync directly
const SYNC_ENABLED = true;

let db = null;
let userId = null;
let syncStatus = "offline"; // "offline" | "syncing" | "synced" | "error"

const syncListeners = [];

function onSyncStatusChange(fn) {
  syncListeners.push(fn);
}

function emitStatus(s) {
  syncStatus = s;
  syncListeners.forEach((fn) => fn(s));
}

// 🚀 MAIN INIT FUNCTION
async function initSync() {
  if (!SYNC_ENABLED) {
    emitStatus("offline");
    return;
  }

  try {
    // ✅ Import Firebase (CDN way — correct for your project)
    const { initializeApp } =
      await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
    const { getFirestore, doc, setDoc, onSnapshot } =
      await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
    const { getAuth, signInAnonymously, onAuthStateChanged } =
      await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");

    // 🔥 Initialize app
    const app = initializeApp(FIREBASE_CONFIG);
    db = getFirestore(app);
    const auth = getAuth(app);

    // 🔐 Anonymous login
    await signInAnonymously(auth);

    onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      // 🧠 Restore same user across devices
      let uid = localStorage.getItem("dsa_sync_uid");
      if (!uid) {
        uid = user.uid;
        localStorage.setItem("dsa_sync_uid", uid);
      }

      userId = uid;

      const docRef = doc(db, "users", userId);

      // 🔄 Listen for realtime updates
      onSnapshot(docRef, (snap) => {
        if (!snap.exists()) return;

        const remote = snap.data();

        const local = {
          completed: JSON.parse(localStorage.getItem("dsa_completed") || "{}"),
          notes: JSON.parse(localStorage.getItem("dsa_notes") || "{}"),
          global_notes: JSON.parse(
            localStorage.getItem("dsa_global_notes") || "[]",
          ),
          solve_dates: JSON.parse(
            localStorage.getItem("dsa_solve_dates") || "{}",
          ),
        };

        // 🔀 Merge logic
        const merged = {
          completed: { ...local.completed, ...(remote.completed || {}) },
          notes: { ...local.notes, ...(remote.notes || {}) },
          global_notes:
            (remote.global_notes || []).length >=
            (local.global_notes || []).length
              ? remote.global_notes
              : local.global_notes,
          solve_dates: { ...local.solve_dates, ...(remote.solve_dates || {}) },
        };

        // 💾 Save locally
        localStorage.setItem("dsa_completed", JSON.stringify(merged.completed));
        localStorage.setItem("dsa_notes", JSON.stringify(merged.notes));
        localStorage.setItem(
          "dsa_global_notes",
          JSON.stringify(merged.global_notes),
        );
        localStorage.setItem(
          "dsa_solve_dates",
          JSON.stringify(merged.solve_dates),
        );

        emitStatus("synced");

        // 🔁 Re-render UI if loaded
        if (window._dsaAppReady) {
          buildDashboard();
          updateProgress();
        }
      });

      // ⬆️ Push initial data
      await pushToCloud();
      emitStatus("synced");
    });
  } catch (e) {
    console.error("Sync init failed:", e);
    emitStatus("error");
  }
}

// ☁️ Push local → Firebase
async function pushToCloud() {
  if (!db || !userId) return;

  try {
    const { doc, setDoc } =
      await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

    emitStatus("syncing");

    await setDoc(doc(db, "users", userId), {
      completed: JSON.parse(localStorage.getItem("dsa_completed") || "{}"),
      notes: JSON.parse(localStorage.getItem("dsa_notes") || "{}"),
      global_notes: JSON.parse(
        localStorage.getItem("dsa_global_notes") || "[]",
      ),
      solve_dates: JSON.parse(localStorage.getItem("dsa_solve_dates") || "{}"),
      lastUpdated: Date.now(),
    });

    emitStatus("synced");
  } catch (e) {
    console.error("Push failed:", e);
    emitStatus("error");
  }
}

// 🔄 Call after any change
function syncAfterChange() {
  if (SYNC_ENABLED) pushToCloud();
}

// 🔑 Get sync code (for linking devices)
function getSyncCode() {
  return userId || null;
}

// 🔗 Link another device
async function linkSyncCode(code) {
  if (!code || !db) return false;

  userId = code;
  localStorage.setItem("dsa_sync_uid", code);

  await pushToCloud();
  return true;
}