import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDocFromServer, serverTimestamp } from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js';

let connection;
function connect() {
    if (!connection) {
        connection = (async () => {
            const response = await fetch('/__/firebase/init.json');
            if (!response.ok) throw new Error('Open the game through Firebase Hosting.');
            const app = initializeApp(await response.json());
            const { user } = await signInAnonymously(getAuth(app));
            return { db: getFirestore(app), uid: user.uid };
        })().catch(error => { connection = undefined; throw error; });
    }
    return connection;
}

export async function saveGame(runId, score) {
    const { db, uid } = await connect();
    // Reusing the run ID prevents duplicate records when retrying a save.
    await setDoc(doc(db, 'gamePlayers', uid, 'runs', runId), {
        score, completedAt: serverTimestamp()
    });
}

export async function readGame(runId) {
    const { db, uid } = await connect();
    const snapshot = await getDocFromServer(doc(db, 'gamePlayers', uid, 'runs', runId));
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}
