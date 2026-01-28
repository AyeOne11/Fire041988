/* --- WATCHER LOGIC: The Bridge to the Cloud --- */

const indexList = document.getElementById('index-list');
const entryForm = document.getElementById('entry-form');
const toggleBtn = document.getElementById('toggle-input');
const displayTitle = document.getElementById('display-title');
const displayContent = document.getElementById('display-content');

// REPLACE THIS with your actual Render Web Service URL
const API_URL = 'https://fire041988.onrender.com/api/entries';

// 1. TOGGLE: Switch between the Index and the Inscription form
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

// 2. RENDER: Fetch and manifest the Index from the PostgreSQL Aether
async function renderIndex() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("The Gateway failed to respond.");
        
        const logs = await response.json();
        indexList.innerHTML = '';
        
        logs.forEach((log) => {
            const item = document.createElement('div');
            item.className = 'index-item';
            // Displaying the date from the database timestamp
            const logDate = new Date(log.created_at).toLocaleDateString();
            item.innerHTML = `<small>${logDate}</small><br><strong>${log.title}</strong>`;
            
            // Pass the entire log object to the show function
            item.onclick = () => showVision(log);
            indexList.appendChild(item);
        });
    } catch (err) {
        console.error("Summoning Index failed:", err);
        indexList.innerHTML = "<p style='color:red;'>Failed to connect to the Archive. Is the Server awake?</p>";
    }
}

// 3. SUMMON: Reflect the selected vision on the Right Page (The Speculum)
function showVision(log) {
    displayTitle.innerText = log.title;
    displayContent.innerHTML = `
        <div class="vision-text">${log.content}</div>
        <p style="font-size: 0.8em; opacity: 0.5; margin-top: 30px;">
            Inscribed on: ${new Date(log.created_at).toLocaleString()}
        </p>
    `;
    
    // Ritual Flicker: The Eye acknowledges the summon
    const eye = document.getElementById('watcher-eye');
    eye.style.boxShadow = "0 0 50px #ffd700";
    setTimeout(() => { 
        eye.style.boxShadow = "0 0 25px rgba(212, 175, 55, 0.4)"; 
    }, 600);
}

// 4. SEAL: Transfer the mental record to the Cloud Database
document.getElementById('seal-entry').onclick = async () => {
    const titleInput = document.getElementById('entry-title');
    const textInput = document.getElementById('watcher-input');
    
    if(!titleInput.value || !textInput.value) {
        alert("A vision requires both a Name and a Substance.");
        return;
    }

    const payload = {
        title: titleInput.value,
        content: textInput.value
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            // Reset and return to Index
            titleInput.value = '';
            textInput.value = '';
            await renderIndex(); // Refresh from DB
            
            entryForm.classList.add('hidden');
            indexList.classList.remove('hidden');
            toggleBtn.innerText = "New Inscription";
        } else {
            throw new Error("The Seal was rejected by the Database.");
        }
    } catch (err) {
        console.error("Sealing failed:", err);
        alert("The Archive could not be reached. Check your connection.");
    }
};

// Initial Render on page load
renderIndex();
