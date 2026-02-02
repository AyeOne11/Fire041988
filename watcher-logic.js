const API_URL = 'https://fire041988.onrender.com/api/entries';

const indexList = document.getElementById('index-list');
const displayTitle = document.getElementById('display-title');
const displayContent = document.getElementById('display-content');
const entryForm = document.getElementById('entry-form');
const toggleBtn = document.getElementById('toggle-input');
const sealBtn = document.getElementById('seal-entry');

let isEditing = false;
let currentEditId = null;

// --- INITIALIZATION ---
window.addEventListener('load', loadEntries);

async function loadEntries() {
    try {
        const response = await fetch(API_URL);
        const entries = await response.json();
        renderIndex(entries);
    } catch (err) {
        console.error("Archive fetch error:", err);
    }
}

function renderIndex(entries) {
    indexList.innerHTML = '';
    entries.forEach(entry => {
        const link = document.createElement('a');
        link.className = 'index-item';
        link.textContent = entry.title || "Untitled Vision";
        link.onclick = () => showEntry(entry);
        indexList.appendChild(link);
    });
}

// --- SHOW ENTRY ---
function showEntry(entry) {
    const entryDate = new Date(entry.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    displayTitle.textContent = entry.title;
    displayContent.innerHTML = `
        <div class="date-marker">LAST MANIFESTED: ${entryDate}</div>
        <div class="vision-text">${entry.content}</div>
        <div class="action-row">
            <button onclick='prepEdit(${JSON.stringify(entry)})' class="pentagram-btn small">REVISE</button>
            <button onclick="dissolveEntry(${entry.id})" class="pentagram-btn small dissolve">DISSOLVE</button>
        </div>
    `;
}

// --- REVISE (EDIT) ---
function prepEdit(entry) {
    isEditing = true;
    currentEditId = entry.id;
    
    document.getElementById('entry-title').value = entry.title;
    document.getElementById('watcher-input').value = entry.content;
    
    entryForm.classList.remove('hidden');
    sealBtn.innerHTML = '<span class="pentagram-icon">⛤</span> RE-SEAL IN LIGHT';
    entryForm.scrollIntoView({ behavior: 'smooth' });
}

// --- DISSOLVE (DELETE) ---
async function dissolveEntry(id) {
    if (confirm("Dissolve this record into the void?")) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            loadEntries();
            displayTitle.textContent = "Speculum";
            displayContent.innerHTML = '<p class="placeholder-text">Dissolved.</p>';
        } catch (err) {
            console.error("Dissolution error:", err);
        }
    }
}

// --- SEAL ACTION ---
sealBtn.onclick = async () => {
    const title = document.getElementById('entry-title').value;
    const content = document.getElementById('watcher-input').value;

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${API_URL}/${currentEditId}` : API_URL;

    try {
        await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
        });

        // Reset
        document.getElementById('entry-title').value = '';
        document.getElementById('watcher-input').value = '';
        isEditing = false;
        currentEditId = null;
        sealBtn.innerHTML = '<span class="pentagram-icon">⛤</span> SEAL IN LIGHT';
        entryForm.classList.add('hidden');
        
        loadEntries();
    } catch (err) {
        console.error("Seal failed:", err);
    }
};

// Toggle Form
toggleBtn.onclick = () => {
    entryForm.classList.toggle('hidden');
    if (entryForm.classList.contains('hidden')) {
        isEditing = false;
        sealBtn.innerHTML = '<span class="pentagram-icon">⛤</span> SEAL IN LIGHT';
    }
};
