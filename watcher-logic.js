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
        console.error("Failed to fetch from the Archive:", err);
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

// --- SHOW ENTRY (With Revise/Dissolve Buttons) ---
function showEntry(entry) {
    displayTitle.textContent = entry.title;
    displayContent.innerHTML = `
        <div class="vision-text">${entry.content}</div>
        <div class="action-row">
            <button onclick='prepEdit(${JSON.stringify(entry)})' class="pentagram-btn small">REVISE</button>
            <button onclick="dissolveEntry(${entry.id})" class="pentagram-btn small dissolve">DISSOLVE</button>
        </div>
    `;
}

// --- DISSOLVE (DELETE) ---
async function dissolveEntry(id) {
    if (confirm("Are you sure you wish to dissolve this record into the void?")) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            loadEntries();
            displayTitle.textContent = "Speculum";
            displayContent.innerHTML = '<p class="placeholder-text">The record has been dissolved.</p>';
        } catch (err) {
            alert("The void resisted. Error: " + err.message);
        }
    }
}

// --- REVISE (EDIT) ---
function prepEdit(entry) {
    isEditing = true;
    currentEditId = entry.id;
    
    document.getElementById('entry-title').value = entry.title;
    document.getElementById('watcher-input').value = entry.content;
    
    entryForm.classList.remove('hidden');
    sealBtn.innerHTML = '<span class="pentagram-icon">⛤</span> RE-SEAL IN LIGHT';
    
    // Smooth scroll back to input
    entryForm.scrollIntoView({ behavior: 'smooth' });
}

// --- SEALING (CREATE/UPDATE) ---
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

        // Reset Form
        document.getElementById('entry-title').value = '';
        document.getElementById('watcher-input').value = '';
        isEditing = false;
        currentEditId = null;
        sealBtn.innerHTML = '<span class="pentagram-icon">⛤</span> SEAL IN LIGHT';
        
        loadEntries();
        alert("The record has been manifested.");
    } catch (err) {
        console.error("Seal failed:", err);
    }
};

// Toggle form visibility
toggleBtn.onclick = () => {
    entryForm.classList.toggle('hidden');
    isEditing = false;
    sealBtn.innerHTML = '<span class="pentagram-icon">⛤</span> SEAL IN LIGHT';
};
