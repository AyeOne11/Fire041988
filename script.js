// Latin alphabet (unchanged)
const latinAlphabet = {
    1:  { letter: 'A', meaning: 'Principium (Beginning, Primal Force)', sound: 'Ah' },
    2:  { letter: 'B', meaning: 'Domus (House, Foundation)', sound: 'Beh' },
    3:  { letter: 'C', meaning: 'Vinculum (Bond, Endurance)', sound: 'Keh' },
    4:  { letter: 'D', meaning: 'Ianua (Door, Portal)', sound: 'Deh' },
    5:  { letter: 'E', meaning: 'Fenestra (Window, Opening to Light)', sound: 'Eh' },
    6:  { letter: 'F', meaning: 'Clavus (Nail, Hook, Fixation)', sound: 'Ef' },
    7:  { letter: 'G', meaning: 'Gladius (Sword, Discernment)', sound: 'Geh' },
    8:  { letter: 'H', meaning: 'Saepes (Fence, Enclosure, Boundary)', sound: 'Hah' },
    9:  { letter: 'I', meaning: 'Manus (Hand, Action, Creation)', sound: 'Ee' },
    10: { letter: 'L', meaning: 'Stimulus (Ox-goad, Drive, Guidance)', sound: 'El' },
    11: { letter: 'M', meaning: 'Aqua (Water, Flow, Dissolution)', sound: 'Em' },
    12: { letter: 'N', meaning: 'Piscis (Fish, Depth, Intuition)', sound: 'En' },
    13: { letter: 'O', meaning: 'Oculus (Eye, Vision, Insight)', sound: 'Oh' },
    14: { letter: 'P', meaning: 'Os (Mouth, Speech, Invocation)', sound: 'Peh' },
    15: { letter: 'Q', meaning: 'Fulcrum (Support, Prop, Stability)', sound: 'Koo' },
    16: { letter: 'R', meaning: 'Caput (Head, Authority, Thought)', sound: 'Er' },
    17: { letter: 'S', meaning: 'Dens (Tooth, Strength, Consumption)', sound: 'Es' },
    18: { letter: 'T', meaning: 'Crux (Cross, Mark, Intersection)', sound: 'Teh' },
    19: { letter: 'V', meaning: 'Uncus (Hook, Grasping, Attraction)', sound: 'Veh' },
    20: { letter: 'X', meaning: 'Occiput (Back of Head, Mystery, Hidden)', sound: 'Eks' },
    21: { letter: 'Y', meaning: 'Ypsilon (Branching Paths, Duality)', sound: 'Ee-grek' },
    22: { letter: 'Z', meaning: 'Signum (Mark, Seal, Completion)', sound: 'Zed' }
};

const keys = Object.keys(latinAlphabet);

// Populate alphabet (run early)
function populateAlphabet() {
    const tableBody = document.getElementById('alphabet-table');
    tableBody.innerHTML = ''; // Clear if rerun
    for (let [value, entry] of Object.entries(latinAlphabet)) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${value}</td>
            <td><strong>${entry.letter}</strong></td>
            <td>${entry.meaning}</td>
            <td><em>${entry.sound}</em></td>
        `;
        tableBody.appendChild(row);
    }
}

// Moon Phase with SunCalc (more exact illumination & phase)
function displayMoonPhase() {
    const now = new Date();
    const illumination = SunCalc.getMoonIllumination(now);
    const fraction = illumination.fraction; // 0-1
    const percent = Math.round(fraction * 100);
    let phaseName = 'New Moon';
    let emoji = '🌑';
    if (percent > 0 && percent < 50) phaseName = 'Waxing', emoji = fraction < 0.25 ? '🌒' : '🌔';
    else if (percent === 50) phaseName = 'Quarter', emoji = fraction > 0.5 ? '🌔' : '🌓';
    else if (percent > 50 && percent < 100) phaseName = 'Waning', emoji = fraction > 0.75 ? '🌖' : '🌗';
    else if (percent === 100) phaseName = 'Full Moon', emoji = '🌕';

    document.getElementById('moon-phase').innerHTML = 
        `<strong>Moon Phase:</strong> ${emoji} ${phaseName} Moon (${percent}% illuminated)`;
}

// Planetary Hours with SunCalc
const planets = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
const planetEmojis = ['♄', '♃', '♂', '☉', '♀', '☿', '☽'];

function displayPlanetaryHours() {
    const now = new Date();
    const lat = 43.25;
    const lng = -79.87;

    // Use noon today to avoid DST/midnight edge cases
    const noon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
    const times = SunCalc.getTimes(noon, lat, lng);

    let sunrise = times.sunrise;
    let sunset = times.sunset;

    // Fallbacks if undefined (rare, but safe)
    if (!sunrise || isNaN(sunrise)) sunrise = new Date(noon); sunrise.setHours(7, 0, 0);
    if (!sunset || isNaN(sunset)) sunset = new Date(noon); sunset.setHours(17, 0, 0);

    const sunriseStr = sunrise.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const sunsetStr = sunset.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    // Simple day ruler (Chaldean order adjusted by weekday)
    const weekday = now.getDay();
    const dayRulerIndex = [3, 6, 0, 1, 2, 5, 4][weekday]; // Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn
    const dayRuler = planets[dayRulerIndex];

    // Current hour ruler approximation (full calc needs hour division, but this is close)
    const elapsedMs = now - sunrise;
    const dayMs = sunset - sunrise;
    const hourIndex = Math.floor((elapsedMs / dayMs) * 12); // Day has 12 hours
    const rulerIndex = (dayRulerIndex + hourIndex) % 7;
    const currentRuler = planets[rulerIndex];

    document.getElementById('planetary-hours').innerHTML = 
        `<strong>Day Ruler:</strong> ${dayRuler} ${planetEmojis[dayRulerIndex]}<br>` +
        `<strong>Current Hour Ruler:</strong> ${currentRuler} ${planetEmojis[rulerIndex]}<br>` +
        `<em>Sunrise: ${sunriseStr} | Sunset: ${sunsetStr} (Hamilton, ON approx.)</em>`;
}

// ... Keep all other functions: random oracle, sigil forge, vibrate, candle toggle, grimoire log/loadLogs ...

// Initialize
populateAlphabet();
displayMoonPhase();
displayPlanetaryHours();
loadLogs(); // grimoire
// Add your event listeners below as before (draw-oracle, forge-sigil, etc.)
document.getElementById('draw-oracle').addEventListener('click', () => {
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const entry = latinAlphabet[randomKey];
    document.getElementById('oracle-result').innerHTML = 
        `<strong>${entry.letter}</strong>: ${entry.meaning}<br><em>Vibrate: ${entry.sound}!</em>`;
});

// (Add the rest of your event listeners here from previous version)