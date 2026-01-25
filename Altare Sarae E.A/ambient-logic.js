const planets = [
    { name: 'Saturn', color: 'rgba(75, 0, 130, 0.4)', intel: 'Authority & Boundary' },
    { name: 'Jupiter', color: 'rgba(0, 0, 255, 0.3)', intel: 'Expansion & Power' },
    { name: 'Mars', color: 'rgba(255, 0, 0, 0.3)', intel: 'Force & Discernment' },
    { name: 'Sun', color: 'rgba(255, 215, 0, 0.4)', intel: 'Source & Vitality' },
    { name: 'Venus', color: 'rgba(0, 255, 127, 0.3)', intel: 'Wisdom & Flow' },
    { name: 'Mercury', color: 'rgba(255, 165, 0, 0.3)', intel: 'Connection & Identity' },
    { name: 'Moon', color: 'rgba(255, 255, 255, 0.3)', intel: 'Foundation & Form' }
];

function updateCelestialAmbient() {
    const now = new Date();
    const lat = 43.25; 
    const lng = -79.87;
    
    const times = SunCalc.getTimes(now, lat, lng);
    const moonIllum = SunCalc.getMoonIllumination(now);
    const moonPhaseNames = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
    const currentMoon = moonPhaseNames[Math.round(moonIllum.phase * 8) % 8];

    const dayRulerMap = [3, 6, 2, 5, 1, 4, 0];
    const weekDay = now.getDay();
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][weekDay];
    
    let isDayTime = (now > times.sunrise && now < times.sunset);
    let start = isDayTime ? times.sunrise : times.sunset;
    let diff = isDayTime ? (times.sunset - times.sunrise) : (24 * 3600000 - (times.sunset - times.sunrise));
    let hoursPassed = Math.abs(now - start) / (diff / 12);
    
    const currentPlanetIndex = (dayRulerMap[weekDay] + Math.floor(hoursPassed)) % 7;
    const currentPlanet = planets[currentPlanetIndex];

    // Update UI
    document.getElementById('hour-display').innerText = `Hour of ${currentPlanet.name.toUpperCase()}`;
    document.getElementById('planetary-intel').innerText = `${dayName.toUpperCase()} | ${currentMoon.toUpperCase()} | ${currentPlanet.intel}`;
    
    // Smooth color shift via background glow
    const glowLayer = document.getElementById('glow-layer');
    glowLayer.style.boxShadow = `inset 0 0 150px ${currentPlanet.color}`;
}

const btn = document.getElementById('ignite-altar');
const audio = document.getElementById('gamma-audio');

btn.addEventListener('click', () => {
    document.body.classList.toggle('active');
    if (document.body.classList.contains('active')) {
        btn.innerText = "EXTINGUERE";
        audio.play().catch(console.error);
        updateCelestialAmbient();
        this.celestialInterval = setInterval(updateCelestialAmbient, 30000);
    } else {
        btn.innerText = "INCENDE";
        audio.pause();
        clearInterval(this.celestialInterval);
    }
});