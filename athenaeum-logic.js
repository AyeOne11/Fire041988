const API_URL = 'https://fire041988.onrender.com/api/manuscripts';
let currentChapterId = null;
let currentProjectName = "Awaiting Title..."; // Obvious placeholder
let saveTimeout;

const editor = document.getElementById('manuscript-editor');
const titleInput = document.getElementById('chapter-title');
const wordCountSpan = document.getElementById('word-count');
const saveStatus = document.getElementById('save-status');
const chapterList = document.getElementById('chapter-list');
const newManuscriptBtn = document.getElementById('new-manuscript');
const zenToggle = document.getElementById('zen-toggle');

document.addEventListener('DOMContentLoaded', () => { loadAthenaeum(); });

editor.addEventListener('input', () => {
    const text = editor.value.trim();
    wordCountSpan.textContent = text ? text.split(/\s+/).length : 0;
    saveStatus.textContent = "Drafting...";
    saveStatus.style.color = "#d4af37";
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(autosave, 2000); 
});

async function autosave() {
    // If we are still in "Awaiting Title" mode, block the save to prevent "Untitled" clumping
    if (currentProjectName === "Awaiting Title..." || (!titleInput.value && !editor.value && !currentChapterId)) return;

    saveStatus.textContent = "Syncing...";
    const data = {
        id: currentChapterId,
        project_name: currentProjectName, 
        title: titleInput.value || "Chapter 1",
        content: editor.value || "",
        wordCount: parseInt(wordCountSpan.textContent) || 0
    };

    try {
        const response = await fetch(`${API_URL}/autosave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const saved = await response.json();
        if (!currentChapterId) currentChapterId = saved.id;
        
        // Lock in the name confirmed by the server
        currentProjectName = saved.project_name; 

        saveStatus.textContent = "Forge Synchronized";
        saveStatus.style.color = "#66ff66";
        loadAthenaeum(); 
    } catch (err) {
        saveStatus.textContent = "Sync Error";
        saveStatus.style.color = "#ff4444";
    }
}

newManuscriptBtn.onclick = async () => {
    const name = prompt("Enter the name of your new Manuscript:");
    if (name && name.trim() !== "") {
        // RESET AND LOCK IMMEDIATELY
        currentChapterId = null; 
        currentProjectName = name.trim(); 
        
        titleInput.value = 'Chapter 1';
        editor.value = '';
        wordCountSpan.textContent = '0';
        saveStatus.textContent = `Forging: ${currentProjectName}`;
        
        // FORCE the first save so the folder manifests in the sidebar correctly
        await autosave(); 
        editor.focus();
    }
};

async function addNewChapter(projectName) {
    currentChapterId = null; 
    currentProjectName = projectName; 
    titleInput.value = 'New Chapter';
    editor.value = '';
    wordCountSpan.textContent = '0';
    saveStatus.textContent = `Adding to ${projectName}`;
    editor.focus();
}

async function renameProject(oldName) {
    const newName = prompt(`Rename manuscript "${oldName}" to:`, oldName);
    if (newName && newName.trim() !== "" && newName !== oldName) {
        try {
            const res = await fetch(`${API_URL}/rename-project`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ oldName, newName: newName.trim() })
            });
            if (res.ok) {
                if (currentProjectName === oldName) currentProjectName = newName.trim();
                loadAthenaeum();
            }
        } catch (err) { console.error(err); }
    }
}

async function loadAthenaeum() {
    try {
        const response = await fetch(API_URL);
        const chapters = await response.json();
        renderSidebar(chapters);
    } catch (err) { console.error(err); }
}

function renderSidebar(chapters) {
    chapterList.innerHTML = '';
    const manuscripts = {};
    chapters.forEach(ch => {
        const pName = ch.project_name || "Untitled Work";
        if (!manuscripts[pName]) manuscripts[pName] = [];
        manuscripts[pName].push(ch);
    });

    for (const [mName, mChapters] of Object.entries(manuscripts)) {
        const folder = document.createElement('div');
        folder.className = 'manuscript-folder';
        folder.innerHTML = `
            <div class="manuscript-header">
                <div class="folder-title-group" style="cursor: pointer; flex-grow: 1;">
                    <span class="folder-arrow">▼</span>
                    <span class="m-title">${mName}</span>
                </div>
                <div class="folder-actions">
                    <button class="add-btn" title="Add Chapter">+</button>
                    <button class="edit-btn" title="Rename Manuscript">✎</button>
                </div>
            </div>
            <div class="chapter-tier"></div>
        `;

        const tier = folder.querySelector('.chapter-tier');
        const arrow = folder.querySelector('.folder-arrow');
        
        folder.querySelector('.folder-title-group').onclick = () => {
            const isCollapsed = tier.classList.toggle('collapsed');
            arrow.textContent = isCollapsed ? '▶' : '▼';
        };

        folder.querySelector('.add-btn').onclick = (e) => { e.stopPropagation(); addNewChapter(mName); };
        folder.querySelector('.edit-btn').onclick = (e) => { e.stopPropagation(); renameProject(mName); };

        mChapters.forEach(ch => {
            const item = document.createElement('div');
            item.className = `sidebar-item ${ch.id === currentChapterId ? 'active-chapter' : ''}`;
            item.innerHTML = `
                <div class="chapter-info">
                    <span class="chapter-link">${ch.chapter_title}</span>
                    <small>${ch.word_count || 0} words</small>
                </div>
                <button class="delete-btn" onclick="dissolveChapter(${ch.id}, event)">×</button>
            `;
            item.onclick = () => loadChapterIntoEditor(ch);
            tier.appendChild(item);
        });
        chapterList.appendChild(folder);
    }
}

function loadChapterIntoEditor(ch) {
    currentChapterId = ch.id;
    currentProjectName = ch.project_name; 
    titleInput.value = ch.chapter_title;
    editor.value = ch.content;
    wordCountSpan.textContent = ch.word_count || 0;
    saveStatus.textContent = "Manifested";
    saveStatus.style.color = "#d4af37";
}

async function dissolveChapter(id, event) {
    event.stopPropagation();
    if (confirm("Dissolve this chapter?")) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (currentChapterId === id) {
                currentChapterId = null;
                titleInput.value = '';
                editor.value = '';
            }
            loadAthenaeum();
        } catch (err) { console.error(err); }
    }
}

zenToggle.onclick = () => {
    document.body.classList.toggle('zen-active');
    zenToggle.textContent = document.body.classList.contains('zen-active') ? "EXIT THE VOID" : "ENTER THE VOID";
};