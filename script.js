/* * ALTARE SARAE E.A. - SYSTEMA MAGICUM
 * Integrated Script: Agrippa Correspondence, Celestial Mechanics, Sigil Tech, & Audio Engine
 */

// ==========================================
// 1. THE AGRIPPEAN ALPHABET (Book II, Ch XX)
// ==========================================
const agrippaTable = {
    'A': { val: 1,   sound: 'Ah', meaning: 'Principium (The Source)' },
    'B': { val: 2,   sound: 'Bay', meaning: 'Domus (Foundation)' },
    'C': { val: 3,   sound: 'Kay', meaning: 'Vinculum (Connection)' },
    'D': { val: 4,   sound: 'Day', meaning: 'Ianua (Door/Portal)' },
    'E': { val: 5,   sound: 'Eh', meaning: 'Fenestra (Window)' },
    'F': { val: 6,   sound: 'Ef',  meaning: 'Fons (Source/Spring)' },
    'G': { val: 7,   sound: 'Gay', meaning: 'Gladius (Discernment)' },
    'H': { val: 8,   sound: 'Hah', meaning: 'Scala (Ladder/Ascent)' },
    'I': { val: 9,   sound: 'Ee',  meaning: 'Baculus (Rod/Will)' },
    'K': { val: 10,  sound: 'Kah', meaning: 'Thronus (Authority)' },
    'L': { val: 20,  sound: 'El',  meaning: 'Cornu (Horn/Power)' },
    'M': { val: 30,  sound: 'Em',  meaning: 'Maternitas (Womb/Form)' },
    'N': { val: 40,  sound: 'En',  meaning: 'Nomen (Identity)' },
    'O': { val: 50,  sound: 'Oh',  meaning: 'Circulus (Cycle)' },
    'P': { val: 60,  sound: 'Pay', meaning: 'Pilum (Spear/Focus)' },
    'Q': { val: 70,  sound: 'Koo', meaning: 'Tessera (Square/Solid)' },
    'R': { val: 80,  sound: 'Er',  meaning: 'Tempestas (Storm/Force)' },
    'S': { val: 90,  sound: 'Ess', meaning: 'Serpens (Wisdom/Flow)' },
    'T': { val: 100, sound: 'Tay', meaning: 'Crux (Cross/Manifestation)' },
    'V': { val: 200, sound: 'Way', meaning: 'Via (The Way)' },
    'X': { val: 300, sound: 'Eks', meaning: 'Rota (Wheel/Fate)' },
    'Y': { val: 400, sound: 'Ee-Grek', meaning: 'Furca (Crossroads)' },
    'Z': { val: 500, sound: 'Zeta', meaning: 'Signum (Final Seal)' }
};

// Helper: Convert modern input (J, U, W) to Classical Latin (I, V)
function normalizeToLatin(char) {
    char = char.toUpperCase();
    if (char === 'J') return 'I';
    if (char === 'U') return 'V';
    if (char === 'W') return 'V';
    return char;
}

// Populate the reference table
function populateAlphabet() {
    const tableBody = document.getElementById('alphabet-table');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    const sortedKeys = Object.keys(agrippaTable).sort((a,b) => agrippaTable[a].val - agrippaTable[b].val);
    for (let char of sortedKeys) {
        const entry = agrippaTable[char];
        const row = document.createElement('tr');
        row.innerHTML = `<td>${entry.val}</td><td><strong>${char}</strong></td><td>${entry.meaning}</td><td><em>${entry.sound}</em></td>`;
        tableBody.appendChild(row);
    }
}

// ==========================================
// 2. CELESTIAL MECHANICS (Geo-Located)
// ==========================================
const planets = ['Saturn ♄', 'Jupiter ♃', 'Mars ♂', 'Sun ☉', 'Venus ♀', 'Mercury ☿', 'Moon ☽'];

function getZodiacSign(day, month) {
    const signs = [
        { char: '♑ Capricorn', end: 19 }, { char: '♒ Aquarius', end: 18 },
        { char: '♓ Pisces', end: 20 },    { char: '♈ Aries', end: 19 },
        { char: '♉ Taurus', end: 20 },    { char: '♊ Gemini', end: 20 },
        { char: '♋ Cancer', end: 22 },    { char: '♌ Leo', end: 22 },
        { char: '♍ Virgo', end: 22 },     { char: '♎ Libra', end: 22 },
        { char: '♏ Scorpio', end: 21 },   { char: '♐ Sagittarius', end: 21 },
        { char: '♑ Capricorn', end: 31 }
    ];
    return (day <= signs[month].end) ? signs[month].char : signs[(month + 1) % 12].char;
}

function updateCelestialData(lat, lng) {
    const now = new Date();
    
    // A. Sun & Moon Times
    const times = SunCalc.getTimes(now, lat, lng);
    const sunrise = times.sunrise;
    const sunset = times.sunset;
    
    // B. Moon Phase
    const moonIllum = SunCalc.getMoonIllumination(now);
    const moonPercent = Math.round(moonIllum.fraction * 100);
    const phaseNames = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
    const phaseIndex = Math.round(moonIllum.phase * 8) % 8;
    const currentPhase = phaseNames[phaseIndex] || 'Waxing';

    // C. Planetary Hours (The Logic)
    let magicalDate = new Date(now);
    let isDayTime = false;
    let hoursPassed = 0;

    if (now < sunrise) {
        magicalDate.setDate(now.getDate() - 1);
        const yesterdayTimes = SunCalc.getTimes(magicalDate, lat, lng);
        const diff = sunrise - yesterdayTimes.sunset; 
        hoursPassed = Math.abs(now - yesterdayTimes.sunset) / (diff / 12);
        isDayTime = false;
    } else if (now > sunset) {
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const tomorrowTimes = SunCalc.getTimes(tomorrow, lat, lng);
        const diff = tomorrowTimes.sunrise - sunset;
        hoursPassed = Math.abs(now - sunset) / (diff / 12);
        isDayTime = false;
    } else {
        const diff = sunset - sunrise;
        hoursPassed = Math.abs(now - sunrise) / (diff / 12);
        isDayTime = true;
    }

    const weekDay = magicalDate.getDay(); 
    // Map Weekday to Planets Index [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
    const dayRulerMap = [3, 6, 2, 5, 1, 4, 0];
    const dayRulerIndex = dayRulerMap[weekDay];
    
    let sequenceOffset = Math.floor(hoursPassed);
    if (!isDayTime) sequenceOffset += 12;
    const currentHourRulerIndex = (dayRulerIndex + sequenceOffset) % 7;

    // D. Zodiac
    const zodiac = getZodiacSign(now.getDate(), now.getMonth());

    // E. Render
    document.getElementById('moon-phase').innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
            <span><strong>Moon:</strong> ${currentPhase} (${moonPercent}%)</span>
            <span><strong>Solar Sign:</strong> ${zodiac}</span>
        </div>
    `;

    document.getElementById('planetary-hours').innerHTML = `
        <table style="width:100%; border-top: 1px solid #d4af37; margin-top:10px; padding-top:10px;">
            <tr>
                <td><strong>Day Ruler:</strong></td>
                <td>${planets[dayRulerIndex]} <small>(Magical ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][weekDay]}day)</small></td>
            </tr>
            <tr>
                <td><strong>Hour Ruler:</strong></td>
                <td>${planets[currentHourRulerIndex]} <small>(Hour ${Math.floor(hoursPassed) + 1} of ${isDayTime ? 'Day' : 'Night'})</small></td>
            </tr>
            <tr>
                <td colspan="2" style="font-size: 0.8em; text-align: right; opacity: 0.7; padding-top:5px;">
                    <em>Sunrise: ${sunrise.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} | Sunset: ${sunset.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</em><br>
                    <em>Loc: ${lat.toFixed(2)}°, ${lng.toFixed(2)}°</em>
                </td>
            </tr>
        </table>
    `;
}

// ==========================================
// 3. SIGIL FORGE (The Wheel of 23)
// ==========================================
document.getElementById('forge-sigil').addEventListener('click', () => {
    const rawInput = document.getElementById('intent-input').value;
    const canvas = document.getElementById('sigil-canvas');
    const ctx = canvas.getContext('2d');
    const resultDiv = document.getElementById('sigil-result');

    if (!rawInput) { 
        resultDiv.innerHTML = "<em>Void Intent. Please inscribe your Will.</em>"; 
        return; 
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Transparent background for Sigil Canvas so it floats in the void
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 100;

    // Draw Wheel
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    const classicalOrder = ['A','B','C','D','E','F','G','H','I','K','L','M','N','O','P','Q','R','S','T','V','X','Y','Z'];
    
    ctx.fillStyle = '#555';
    ctx.font = '10px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    classicalOrder.forEach((char, i) => {
        const angle = (i / classicalOrder.length) * 2 * Math.PI - (Math.PI/2);
        const x = centerX + (radius + 15) * Math.cos(angle);
        const y = centerY + (radius + 15) * Math.sin(angle);
        ctx.fillText(char, x, y);
    });

    const coords = [];
    const validChars = [];
    
    for (let char of rawInput) {
        const latinChar = normalizeToLatin(char);
        if (agrippaTable[latinChar]) {
            const index = classicalOrder.indexOf(latinChar);
            if (index !== -1) {
                const angle = (index / classicalOrder.length) * 2 * Math.PI - (Math.PI/2);
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                coords.push({x, y});
                validChars.push(latinChar);
            }
        }
    }

    if (coords.length === 0) {
        resultDiv.innerText = "No valid classical letters found.";
        return;
    }

    // Draw Sigil
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#d4af37';
    ctx.shadowBlur = 15;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.fillStyle = '#d4af37';
    ctx.arc(coords[0].x, coords[0].y, 4, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    for (let i = 1; i < coords.length; i++) {
        ctx.lineTo(coords[i].x, coords[i].y);
    }
    ctx.stroke();

    const last = coords[coords.length - 1];
    ctx.beginPath();
    ctx.moveTo(last.x - 6, last.y);
    ctx.lineTo(last.x + 6, last.y);
    ctx.stroke();

    const totalValue = validChars.reduce((sum, char) => sum + agrippaTable[char].val, 0);
    resultDiv.innerHTML = `<strong>Sigil:</strong> ${validChars.join('-')} | <strong>Sum:</strong> ${totalValue}`;
});

// ==========================================
// 4. GRIMOIRE LOG (Persistent)
// ==========================================
function loadLogs() {
    const list = document.getElementById('log-list');
    if (!list) return;
    list.innerHTML = '';
    const logs = JSON.parse(localStorage.getItem('altar_logs') || '[]');
    
    logs.forEach(log => {
        const li = document.createElement('li');
        li.innerHTML = `<small>[${log.date}]</small><br>${log.text}`;
        list.prepend(li);
    });
}

document.getElementById('seal-note').addEventListener('click', () => {
    const textarea = document.getElementById('note');
    const text = textarea.value.trim();
    if (!text) return;

    const logs = JSON.parse(localStorage.getItem('altar_logs') || '[]');
    logs.push({ date: new Date().toLocaleString(), text: text });
    localStorage.setItem('altar_logs', JSON.stringify(logs));
    
    textarea.value = '';
    loadLogs();
});

// ==========================================
// 5. UTILITIES (Candle & Audio Invocation)
// ==========================================
let candleLit = false;
document.getElementById('candle-toggle').addEventListener('click', () => {
    candleLit = !candleLit;
    const candle = document.querySelector('.candle');
    if (candleLit) candle.classList.add('lit');
    else candle.classList.remove('lit');
});

// --- AUDIO ENGINE ---
let audioCtx;
function igniteAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = 'sine'; 
    osc.frequency.setValueAtTime(432, audioCtx.currentTime); 

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 1); 
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 6); 

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 6); 
}

document.getElementById('vibrate').addEventListener('click', () => {
    igniteAudio();
    const msg = document.getElementById('launch-message');
    msg.style.opacity = 1;
    msg.innerHTML = "<em>Vox missa est.</em> (The Frequency is Sent.)";
    setTimeout(() => { msg.style.opacity = 0; }, 6000);
});

// ==========================================
// 6. INITIALIZATION
// ==========================================
function initAltar() {
    populateAlphabet();
    loadLogs();
    
    const defaultLat = 43.25; // Hamilton
    const defaultLng = -79.87;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => updateCelestialData(position.coords.latitude, position.coords.longitude),
            (error) => updateCelestialData(defaultLat, defaultLng)
        );
    } else {
        updateCelestialData(defaultLat, defaultLng);
    }
}

initAltar();