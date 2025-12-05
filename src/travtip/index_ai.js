import { getRaceData } from './data.js';

let raceData = [];

function importData() {
    const input = document.getElementById('dataInput').value.trim();
    if (!input) {
        alert('Vennligst lim inn data først');
        return;
    }

    raceData = [];
    const lines = input.split('\n');

    for (const line of lines) {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 3) {
            const horseNumber = parseInt(parts[0]);
            const horseName = parts[1];
            const playPercentage = parseFloat(parts[2]);

            if (!isNaN(horseNumber) && horseName && !isNaN(playPercentage)) {
                raceData.push({
                    number: horseNumber,
                    name: horseName,
                    playPercentage: playPercentage,
                    myTip: false,
                    myRanking: 3,
                    recommended: false
                });
            }
        }
    }

    if (raceData.length === 0) {
        alert('Kunne ikke parse data. Sjekk formatet: "Hestenummer | Hestenavn | Spill %"');
        return;
    }

    // Sort by number
    raceData.sort((a, b) => a.number - b.number);

    document.getElementById('raceDataContainer').style.display = 'block';
    document.getElementById('noData').style.display = 'none';

    renderTable();
    updateRecommendation();
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    raceData.forEach((horse, index) => {
        const row = document.createElement('tr');
        const score = calculateScore(horse);

        row.innerHTML = `
            <td>${horse.number}</td>
            <td>${horse.name}</td>
            <td>${horse.playPercentage.toFixed(1)}%</td>
            <td>
                <input type="checkbox" ${horse.myTip ? 'checked' : ''} 
                    onchange="updateHorseTip(${index}, this.checked)">
            </td>
            <td>
                <select onchange="updateHorseRanking(${index}, this.value)">
                    <option value="1" ${horse.myRanking === 1 ? 'selected' : ''}>1 (Dårlig)</option>
                    <option value="2" ${horse.myRanking === 2 ? 'selected' : ''}>2</option>
                    <option value="3" ${horse.myRanking === 3 ? 'selected' : ''}>3 (OK)</option>
                    <option value="4" ${horse.myRanking === 4 ? 'selected' : ''}>4</option>
                    <option value="5" ${horse.myRanking === 5 ? 'selected' : ''}>5 (Best)</option>
                </select>
            </td>
            <td class="score">${score.toFixed(2)}</td>
            <td>
                <span class="badge ${horse.recommended ? 'recommended' : ''}">
                    ${horse.recommended ? '✓ JA' : '-'}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateHorseTip(index, checked) {
    raceData[index].myTip = checked;
    updateRecommendation();
}

function updateHorseRanking(index, ranking) {
    raceData[index].myRanking = parseInt(ranking);
    updateRecommendation();
}

function calculateScore(horse) {
    // Kombiner spill%, tips, og egen ranking
    const tipBonus = horse.myTip ? 20 : 0;
    const rankingScore = horse.myRanking * 10; // 10-50 poeng
    const playScore = horse.playPercentage; // 0-100 (approximately)

    // Vekting: 40% eigen ranking, 40% spill%, 20% tips
    const score = (rankingScore * 0.4) + (playScore * 0.4) + tipBonus;
    return score;
}

function updateRecommendation() {
    const horsesOnBet = parseInt(document.getElementById('horsesOnBet').value) || 3;

    // Beregn score for alle hester
    const scored = raceData.map(horse => ({
        ...horse,
        score: calculateScore(horse)
    }));

    // Sorter etter score (høyest først)
    scored.sort((a, b) => b.score - a.score);

    // Marker de beste som anbefalt
    raceData.forEach(horse => {
        horse.recommended = false;
    });

    for (let i = 0; i < Math.min(horsesOnBet, scored.length); i++) {
        const recommendedHorse = raceData.find(h => h.number === scored[i].number);
        if (recommendedHorse) {
            recommendedHorse.recommended = true;
        }
    }

    renderTable();
    updateRecommendationList();
    updateCost();
}

function updateRecommendationList() {
    const recommended = raceData.filter(h => h.recommended);
    const list = document.getElementById('recommendationList');

    if (recommended.length === 0) {
        list.innerHTML = '<p class="empty">Ingen hester valgt ennå</p>';
        return;
    }

    let html = '<div class="horse-list">';
    recommended.forEach(horse => {
        const score = calculateScore(horse);
        html += `
            <div class="horse-item">
                <span class="horse-num">${horse.number}</span>
                <span class="horse-name">${horse.name}</span>
                <span class="horse-score">${score.toFixed(2)} pts</span>
                <span class="horse-play">${horse.playPercentage.toFixed(1)}%</span>
            </div>
        `;
    });
    html += '</div>';
    list.innerHTML = html;
}

function updateCost() {
    const selected = raceData.filter(h => h.recommended).length;
    const pricePerRow = parseFloat(document.getElementById('pricePerRow').value) || 1;

    // Beregn kombinasjoner (n!)
    let combinations = 1;
    for (let i = 1; i <= selected; i++) {
        combinations *= i;
    }

    const totalCost = combinations * pricePerRow;

    document.getElementById('selectedCount').textContent = selected;
    document.getElementById('priceDisplay').textContent = pricePerRow.toFixed(2) + ' kr';
    document.getElementById('combinations').textContent = combinations;
    document.getElementById('totalCost').textContent = totalCost.toFixed(2) + ' kr';
}

// Initialiser siden
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('raceDataContainer').style.display = 'none';
    const fetchBtn = document.getElementById('fetchRacesBtn');
    if (fetchBtn) fetchBtn.addEventListener('click', fetchRaces);
});

/**
 * Bygger en URL med korrekt raceNumber-parameter.
 * Hvis baseUrl allerede har raceNumber settes verdien, ellers legges parametern til.
 */
function buildRaceUrl(baseUrl, raceNumber) {
    if (!baseUrl) return baseUrl;
    try {
        // Hvis baseUrl inneholder raceNumber= så erstatt verdien
        if (/[?&]raceNumber=/.test(baseUrl)) {
            return baseUrl.replace(/([?&]raceNumber=)([^&]*)/, `$1${raceNumber}`);
        }

        // Ellers append param
        return baseUrl + (baseUrl.includes('?') ? '&' : '?') + 'raceNumber=' + raceNumber;
    }
    catch (e) {
        return baseUrl + (baseUrl.includes('?') ? '&' : '?') + 'raceNumber=' + raceNumber;
    }
}

/**
 * Henter løp fra API én og én for hvert løpsnummer i intervallet.
 * Kaller getRaceData(fetchUrl) for hvert løp og lagrer resultatet i window.lastFetchedRaces.
 */
async function fetchRaces() {
    const baseUrl = document.getElementById('apiUrlInput').value.trim();
    const from = parseInt(document.getElementById('raceFromInput').value, 10);
    const to = parseInt(document.getElementById('raceToInput').value, 10);
    const progress = document.getElementById('fetchProgress');

    if (!baseUrl) {
        alert('Vennligst lim inn en base-URL for API-kallet');
        return;
    }
    if (isNaN(from) || isNaN(to) || from < 1 || to < 1 || to < from) {
        alert('Ugyldig løpsintervall. Sjekk "Fra løp" og "Til løp".');
        return;
    }

    progress.innerHTML = '';
    window.lastFetchedRaces = [];

    for (let r = from; r <= to; r++) {
        // const url = buildRaceUrl(baseUrl, r);  // Teste med å måtte skrive inn hele url med params
        const url = baseUrl;
        const entry = document.createElement('div');
        entry.style.padding = '8px 0';
        entry.textContent = `Henter løp ${r} ...`;
        progress.appendChild(entry);

        try {
            const data = await getRaceData(url);
            window.lastFetchedRaces.push({ raceNumber: r, url, data });
            entry.textContent = `Løp ${r} hentet: ` + (data && data.status === 500 ? ('FEIL: ' + (data.body || 'ukjent')) : 'OK');
        }
        catch (err) {
            entry.textContent = `Løp ${r} FEILET: ${err}`;
        }
    }

    const done = document.createElement('div');
    done.style.marginTop = '8px';
    done.innerHTML = `<strong>Hentet ${window.lastFetchedRaces.length} løp.</strong>`;
    progress.appendChild(done);
}

// Eksponer funksjoner for bruk i HTML onclick-attributter
window.importData = importData;
window.updateHorseTip = updateHorseTip;
window.updateHorseRanking = updateHorseRanking;
window.fetchRaces = fetchRaces;

// const myHeaders = new Headers();
// myHeaders.append("Cookie", "BIGipServer~rikstoto~nr-pr-webcache-webcache-xvarnish-webcache-xvarnish-http-80=!lqrM+QtCJeEOWYntpxGAnN/j9BCRm71nmEh8Jpqn2QZGllG3Wn2Bry1Fuu2Gm0M6zrlyu2Gg98s1a1PD7hMHhmcgDwcc1JxN404mOpU=");

// const requestOptions = {
//   method: "GET",
//   headers: myHeaders,
//   redirect: "follow"
// };

// fetch("https://www.rikstoto.no/api/game/BJ_NR_2025-12-06/betdistribution/investment/V75?raceNumber=3", requestOptions)
//   .then((response) => response.text())
//   .then((result) => console.log(result))
//   .catch((error) => console.error(error));