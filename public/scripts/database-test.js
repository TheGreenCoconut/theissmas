import { saveGame, readGame } from './game-database.js';

const runId = document.getElementById('runId');
const result = document.getElementById('result');
const buttons = [...document.querySelectorAll('button')];
runId.value = `test-${crypto.randomUUID()}`;

async function perform(action) {
    const id = runId.value.trim();
    if (!/^[a-zA-Z0-9_-]{1,100}$/.test(id)) {
        result.textContent = 'Use a run ID with letters, numbers, underscores or hyphens.';
        return;
    }
    buttons.forEach(button => { button.disabled = true; });
    result.textContent = 'Connecting to Firestore…';
    try {
        if (action === 'write') await saveGame(id, 6);
        const record = await readGame(id);
        result.textContent = record
            ? JSON.stringify({ ...record, completedAt: record.completedAt?.toDate().toISOString() }, null, 2)
            : 'No document found for this run ID under your current player account.';
    } catch (error) {
        result.textContent = `${error.code || 'Error'}: ${error.message}`;
    } finally {
        buttons.forEach(button => { button.disabled = false; });
    }
}
document.getElementById('write').addEventListener('click', () => perform('write'));
document.getElementById('read').addEventListener('click', () => perform('read'));
