/* * ALTARE SARAE E.A. - SYSTEMA MAGICUM
 * Integrated Script: Agrippa Correspondence, Celestial Mechanics, & Sigil Tech
 */

// ==========================================
// 1. THE AGRIPPEAN ALPHABET (Book II, Ch XX)
// ==========================================
// The 23 Classical Letters mapped to the Scale of Nine
const agrippaTable = {
    'A': { val: 1,   sound: 'Ah', meaning: 'Principium (The Source)' },
    'B': { val: 2,   sound: 'Bay', meaning: 'Domus (Foundation)' },
    'C': { val: 3,   sound: 'Kay', meaning: 'Vinculum (Connection)' },
    'D': { val: 4,   sound: 'Day', meaning: 'Ianua (Door/Portal)' },
    'E': { val: 5,   sound: 'Eh', meaning: 'Fenestra (Window)' },
    'F': { val: 6,   sound: 'Ef',  meaning: 'Fons (Source/Spring)' },
    'G': { val: 7,   sound: 'Gay', meaning: 'Gladius (Discernment)' },
    'H': { val: 8,   sound: 'Hah', meaning: 'Scala (Ladder/Ascent)' },
    'I': { val: 9,   sound: 'Ee',  meaning: 'Baculus (Rod/Will)' }, // Also J
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
    'V': { val: 200, sound: 'Way', meaning: 'Via (The Way)' }, // Also U, W
    'X': { val: 300, sound: 'Eks', meaning: 'Rota (Wheel/Fate)' },
    'Y': { val: 400, sound: 'Ee-Grek', meaning: 'Furca (Crossroads)' },
    'Z': { val: 500, sound: 'Zeta', meaning: 'Signum (Final Seal)' }
};

// Helper: Convert modern input (J, U, W) to Classical Latin (I, V)
function normalizeToLatin(char) {
    char = char.toUpperCase();
    if (char === 'J') return 'I';
    if (char === 'U') return 'V';
    if (char === 'W') return 'V'; // Phonetically V/VV
    return char;
}

// Populate the reference table in the DOM
function populateAlphabet() {
    const tableBody = document.getElementById('alphabet-table');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    
    // Sort by Value for the table display
    const sortedKeys = Object.keys(agrippaTable).sort((a,b) => agrippaTable[a].val - agrippaTable[b].val);
    
    for (let char of sortedKeys) {
        const entry = agrippaTable[char];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.val}</td>
            <td><strong>${char}</strong></td>
            <td>${entry.meaning}</td>
            <td><em>${entry.sound}</em></td>
        `;
        tableBody.appendChild(row);
    }
}

// ==========================================
// 2. CELESTIAL MECHANICS (Geo-Located)
// ==========================================
// Chaldean Order: Saturn(0) -> Moon(6). Slowest to Fastest.
const planets = ['Saturn ♄', 'Jupiter ♃', 'Mars ♂', 'Sun ☉', 'Venus ♀', 'Mercury ☿', 'Moon ☽'];

function getZodiacSign(day, month) {
    // Note: JS months are 0-11. 
    const signs = [
        { char: '♑ Capricorn', end: 19 }, // Jan (0)
        { char: '♒ Aquarius', end: 18 },  // Feb (1)
        { char: '♓ Pisces', end: 20 },    // Mar (2)
        { char: '♈ Aries', end: 19 },     // Apr (3)
        { char: '♉ Taurus', end: 20 },    // May (4)
        { char: '♊ Gemini', end: 20 },    // Jun (5)
        { char: '♋ Cancer', end: 22 },    // Jul (6)
        { char: '♌ Leo', end: 22 },       // Aug (7)
        { char: '♍ Virgo', end: 22 },     // Sep (8)
        { char: '♎ Libra', end: 22 },     // Oct (9)
        { char: '♏ Scorpio', end: 21 },   // Nov (10)
        { char: '♐ Sagittarius', end: 21 }, // Dec (11)
        { char: '♑ Capricorn', end: 31 }  // Loop check
    ];
    return (day <= signs[month].end) ? signs[month].char : signs[(month + 1) % 12].char;
}

function updateCelestialData(lat, lng) {
    const now = new Date();
    
    // -- A. Sun & Moon Times --
    // Using SunCalc (must be loaded in HTML)
    const times = SunCalc.getTimes(now, lat, lng);
    const sunrise = times.sunrise;
    const sunset = times.sunset;
    
    // -- B. Moon Phase --
    const moonIllum = SunCalc.getMoonIllumination(now);
    const moonPercent = Math.round(moonIllum.fraction * 100);
    const phaseNames = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
    const phaseIndex = Math.round(moonIllum.phase * 8) % 8;
    const currentPhase = phaseNames[phaseIndex] || 'Waxing';

    // -- C. Planetary Hours (The Core Logic) --
    let magicalDate = new Date(now);
    let isDayTime = false;
    let hoursPassed = 0;

    // Determine if we are in the Magical "Yesterday" (Pre-Sunrise)
    if (now < sunrise) {
        magicalDate.setDate(now.getDate() - 1);
        const yesterdayTimes = SunCalc.getTimes(magicalDate, lat, lng);
        const diff = sunrise - yesterdayTimes.sunset; 
        const hourDuration = diff / 12;
        hoursPassed = Math.abs(now - yesterdayTimes.sunset) / hourDuration;
        isDayTime = false;
    } 
    // Determine if we are in Magical "Tonight" (Post-Sunset)
    else if (now > sunset) {
        // Night hours: Today Sunset to Tomorrow Sunrise
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const tomorrowTimes = SunCalc.getTimes(tomorrow, lat, lng);
        const diff = tomorrowTimes.sunrise - sunset;
        const hourDuration = diff / 12;
        hoursPassed = Math.abs(now - sunset) / hourDuration;
        isDayTime = false;
    } 
    // We are in Magical "Today" (Daylight)
    else {
        const diff = sunset - sunrise;
        const hourDuration = diff / 12;
        hoursPassed = Math.abs(now - sunrise) / hourDuration;
        isDayTime = true;
    }

    // Determine Rulers
    const weekDay = magicalDate.getDay(); // 0=Sun, 1=Mon...
    // Map Weekday to Planetary Index in 'planets' array:
    // Sun(0)->Sun(3), Mon(1)->Moon(6), Tue(2)->Mars(2), Wed(3)->Merc(5), Thu(4)->Jup(1), Fri(5)->Ven(4), Sat(6)->Sat(0)
    const dayRulerMap = [3, 6, 2, 5, 1, 4, 0];
    const dayRulerIndex = dayRulerMap[weekDay];
    
    // Calculate Hour Ruler (Chaldean Sequence loops 0-6)
    let sequenceOffset = Math.floor(hoursPassed);
    if (!isDayTime) sequenceOffset += 12; // Night hours continue the sequence
    const currentHourRulerIndex = (dayRulerIndex + sequenceOffset) % 7;

    // -- D. Zodiac --
    const zodiac = getZodiacSign(now.getDate(), now.getMonth());

    // -- E. Rendering --
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

    // Setup Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0e001f'; // Deep Void
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 100;

    // Draw the 23-Point Wheel
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // The Classical 23-Letter Order
    const classicalOrder = ['A','B','C','D','E','F','G','H','I','K','L','M','N','O','P','Q','R','S','T','V','X','Y','Z'];
    
    // Draw Letter Markers (Subtle)
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

    // Map Intent to Coordinates
    const coords = [];
    const validChars = [];
    
    for (let char of rawInput) {
        const latinChar = normalizeToLatin(char);
        if (agrippaTable[latinChar]) {
            const index = classicalOrder.indexOf(latinChar);
            if (index !== -1) {
                // Calculate position on the wheel
                const angle = (index / classicalOrder.length) * 2 * Math.PI - (Math.PI/2);
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                coords.push({x, y});
                validChars.push(latinChar);
            }
        }
    }

    if (coords.length === 0) {
        resultDiv.innerText = "No valid classical letters found in intent.";
        return;
    }

    // Draw the Sigil Lines
    ctx.strokeStyle = '#d4af37'; // Gold
    ctx.lineWidth = 3;
    ctx.shadowColor = '#d4af37';
    ctx.shadowBlur = 15;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    // Start Circle (The Seed)
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(coords[0].x, coords[0].y, 4, 0, 2 * Math.PI);
    ctx.fill();
    
    // The Path
    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    for (let i = 1; i < coords.length; i++) {
        ctx.lineTo(coords[i].x, coords[i].y);
    }
    ctx.stroke();

    // End Bar (The Manifestation)
    const last = coords[coords.length - 1];
    ctx.beginPath();
    ctx.moveTo(last.x - 6, last.y);
    ctx.lineTo(last.x + 6, last.y);
    ctx.stroke();

    // Calculate Gematria
    const totalValue = validChars.reduce((sum, char) => sum + agrippaTable[char].val, 0);
    
    resultDiv.innerHTML = `
        <strong>Sigil Forged:</strong> ${validChars.join('-')}<br>
        <strong>Agrippean Sum:</strong> ${totalValue}
    `;
});

// ==========================================
// 4. GRIMOIRE LOG (Persistent LocalStorage)
// ==========================================
function loadLogs() {
    const list = document.getElementById('log-list');
    if (!list) return;
    list.innerHTML = '';
    const logs = JSON.parse(localStorage.getItem('altar_logs') || '[]');
    
    logs.forEach(log => {
        const li = document.createElement('li');
        li.innerHTML = `<small>[${log.date}]</small><br>${log.text}`;
        list.prepend(li); // Newest first
    });
}

document.getElementById('seal-note').addEventListener('click', () => {
    const textarea = document.getElementById('note');
    const text = textarea.value.trim();
    if (!text) return;

    const logs = JSON.parse(localStorage.getItem('altar_logs') || '[]');
    const newEntry = {
        date: new Date().toLocaleString(),
        text: text
    };
    
    logs.push(newEntry);
    localStorage.setItem('altar_logs', JSON.stringify(logs));
    
    textarea.value = '';
    loadLogs();
});

// ==========================================
// 5. UTILITIES (Candle & Invocation)
// ==========================================
let candleLit = false;
document.getElementById('candle-toggle').addEventListener('click', () => {
    candleLit = !candleLit;
    const candle = document.querySelector('.candle');
    
    if (candleLit) {
        candle.classList.add('lit');
    } else {
        candle.classList.remove('lit');
    }
});

document.getElementById('vibrate').addEventListener('click', () => {
    const msg = document.getElementById('launch-message');
    msg.style.opacity = 1;
    msg.innerHTML = "Vox missa est. (The Voice is sent.)";
    setTimeout(() => { msg.style.opacity = 0; }, 3000);
});

// ==========================================
// 6. INITIALIZATION (Grounding)
// ==========================================
function initAltar() {
    console.log("Initializing Altar...");
    populateAlphabet();
    loadLogs();
    
    // Default to Hamilton, ON if geo fails
    const defaultLat = 43.25;
    const defaultLng = -79.87;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log("Altar grounded to coordinates.");
                updateCelestialData(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                console.warn("Geolocation denied. Using default Magical Center (Hamilton).");
                updateCelestialData(defaultLat, defaultLng);
            }
        );
    } else {
        updateCelestialData(defaultLat, defaultLng);
    }
}

// Begin
initAltar();