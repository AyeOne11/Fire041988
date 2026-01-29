/* --- WATCHER LOGIC: The Bridge to the Cloud --- */

const indexList = document.getElementById('index-list');
const entryForm = document.getElementById('entry-form');
const toggleBtn = document.getElementById('toggle-input');
const displayTitle = document.getElementById('display-title');
const displayContent = document.getElementById('display-content');

// LIVE URL: Use this when uploading to GitHub
const API_URL = 'https://fire041988.onrender.com/api/entries';
// LOCAL URL: Use this only for local testing
// const API_URL = 'http://localhost:3000/api/entries';

// 1. TOGGLE: Switch between Index and Form
toggleBtn.addEventListener('click', () => {
    if (entryForm.classList.contains('hidden')) {
        entryForm.classList.remove('hidden');
        indexList.classList.add('hidden');
        toggleBtn.innerText = "Back to Index";
    } else {
        entryForm.classList.add('hidden');
        indexList.classList.remove('hidden');
        toggleBtn.innerText = "New Inscription";
    }
});

// 2. RENDER: Fetch from the Aether
async function renderIndex() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("The Gateway failed to respond.");
        
        const logs = await response.json();
        indexList.innerHTML = '';
        
        logs.forEach((log) => {
            const item = document.createElement('div');
            item.className = 'index-item';
            const logDate = new Date(log.created_at).toLocaleDateString();
            item.innerHTML = `<small>${logDate}</small><br><strong>${log.title}</strong>`;
            item.onclick = () => showVision(log);
            indexList.appendChild(item);
        });
    } catch (err) {
        console.error("Summoning Index failed:", err);
        indexList.innerHTML = "<p style='color:red;'>Failed to connect to the Archive. Is the Server awake?</p>";
    }
}

// 3. SUMMON: Display on the Right Page
function showVision(log) {
    displayTitle.innerText = log.title;
    displayContent.innerHTML = `
        <div class="vision-text">${log.content}</div>
        <p style="font-size: 0.8em; opacity: 0.5; margin-top: 30px;">
            Inscribed on: ${new Date(log.created_at).toLocaleString()}
        </p>
    `;
    const eye = document.getElementById('watcher-eye');
    eye.style.boxShadow = "0 0 50px #ffd700";
    setTimeout(() => { 
        eye.style.boxShadow = "0 0 25px rgba(212, 175, 55, 0.4)"; 
    }, 600);
}

// 4. SEAL: Transfer record to Database
document.getElementById('seal-entry').onclick = async () => {
    const titleInput = document.getElementById('entry-title');
    const textInput = document.getElementById('watcher-input');
    
    if(!titleInput.value || !textInput.value) {
        alert("A vision requires both a Name and a Substance.");
        return;
    }

    const payload = { title: titleInput.value, content: textInput.value };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            titleInput.value = '';
            textInput.value = '';
            await renderIndex();
            entryForm.classList.add('hidden');
            indexList.classList.remove('hidden');
            toggleBtn.innerText = "New Inscription";
        } else {
            throw new Error("The Seal was rejected.");
        }
    } catch (err) {
        console.error("Sealing failed:", err);
        alert("The Archive could not be reached.");
    }
};

renderIndex();
