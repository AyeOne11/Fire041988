const API_URL = 'https://fire041988.onrender.com/api/manuscripts';
let currentChapterId = null;
let saveTimeout;

// DOM Elements
const editor = document.getElementById('manuscript-editor');
const titleInput = document.getElementById('chapter-title');
const wordCountSpan = document.getElementById('word-count');
const saveStatus = document.getElementById('save-status');
const chapterList = document.getElementById('chapter-list');
const newChapterBtn = document.getElementById('new-chapter');
const zenToggle = document.getElementById('zen-toggle');

// --- 1. INITIALIZATION ---
window.onload = loadAthenaeum;

// --- 2. THE FORGE ENGINE (Writing & Autosave) ---
editor.addEventListener('input', () => {
    // Live Word Count
    const text = editor.value.trim();
    const count = text ? text.split(/\s+/).length : 0;
    wordCountSpan.textContent = count;
    
    // Status Update
    saveStatus.textContent = "Drafting...";
    saveStatus.style.color = "#d4af37";

    // Debounce: Wait for 2 seconds of silence before saving
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(autosave, 2000); 
});

async function autosave() {
    if (!editor.value && !titleInput.value) return;

    saveStatus.textContent = "Syncing...";
    
    const data = {
        id: currentChapterId,
        title: titleInput.value || "Untitled Chapter",
        content: editor.value,
        wordCount: parseInt(wordCountSpan.textContent)
    };

    try {
        const response = await fetch(`${API_URL}/autosave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const saved = await response.json();
        
        if (!currentChapterId) {
            currentChapterId = saved.id;
        }

        saveStatus.textContent = "Forge Synchronized";
        saveStatus.style.color = "#66ff66";
        
        // Refresh sidebar to update word counts/titles
        loadAthenaeum(); 
    } catch (err) {
        console.error("Autosave failed:", err);
        saveStatus.textContent = "Sync Error";
        saveStatus.style.color = "#ff4444";
    }
}

// --- 3. THE ARCHIVE (Sidebar Logic) ---

newChapterBtn.onclick = () => {
    currentChapterId = null; 
    titleInput.value = '';
    editor.value = '';
    wordCountSpan.textContent = '0';
    saveStatus.textContent = 'New Manuscript Started';
    editor.focus();
};

async function loadAthenaeum() {
    try {
        const response = await fetch(API_URL);
        const chapters = await response.json();
        renderSidebar(chapters);
    } catch (err) {
        console.error("Failed to load archive:", err);
    }
}

function renderSidebar(chapters) {
    chapterList.innerHTML = ''; 
    
    chapters.forEach(ch => {
        const item = document.createElement('div');
        item.className = 'sidebar-item';
        if (ch.id === currentChapterId) item.classList.add('active-chapter');
        
        item.innerHTML = `
            <div class="chapter-info">
                <span class="chapter-link">${ch.chapter_title || 'Untitled'}</span>
                <small>${ch.word_count || 0} words</small>
            </div>
            <button class="delete-chapter-btn" onclick="dissolveChapter(${ch.id}, event)">×</button>
        `;
        
        item.onclick = () => loadChapterIntoEditor(ch);
        chapterList.appendChild(item);
    });
}

function loadChapterIntoEditor(ch) {
    currentChapterId = ch.id;
    titleInput.value = ch.chapter_title;
    editor.value = ch.content;
    wordCountSpan.textContent = ch.word_count || 0;
    saveStatus.textContent = "Manifested";
    saveStatus.style.color = "#d4af37";
}

// --- 4. DISSOLUTION (Delete) ---
async function dissolveChapter(id, event) {
    event.stopPropagation(); // Stop from loading the chapter being deleted
    if (confirm("Dissolve this chapter into the void?")) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (currentChapterId === id) newChapterBtn.click();
            loadAthenaeum();
        } catch (err) {
            console.error("Dissolution error:", err);
        }
    }
}

// --- 5. ZEN MODE TOGGLE ---
zenToggle.onclick = () => {
    document.body.classList.toggle('zen-active');
    
    if (document.body.classList.contains('zen-active')) {
        zenToggle.textContent = "EXIT THE VOID";
        saveStatus.textContent = "Focus Mode Active";
    } else {
        zenToggle.textContent = "ENTER THE VOID";
        saveStatus.textContent = "Forge Synchronized";
    }
};

// Exit Zen Mode with 'Escape'
document.addEventListener('keydown', (e) => {
    if (e.key === "Escape" && document.body.classList.contains('zen-active')) {
        zenToggle.click();
    }
});