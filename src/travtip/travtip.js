import { gameUrl, programUrl, raceListUrl, apiUrl } from "./scripts/config.js";

// let startList = [];
// let betDistData = [];
let raceData = [];
let localData = {};

const costInfoElement = document.getElementById('costInfo');

const raceInfoHTab = document.getElementById('raceInfo');
const raceTable = document.getElementById('raceDataTable')

const raceKeyInput = document.getElementById('raceKey');
raceKeyInput.addEventListener('change', async (event) => {
    event.preventDefault();
    raceData = [];
    const selected = raceKeyInput.value;
    raceKeyInput.value = '';
    raceInfoHTab.innerHTML = selected.split('#')[0];
    const raceKey = selected.split('#')[1];
    const startList = await getStartList(raceKey);
    const betDistData = await getBetDist(raceKey);
    const programData = await getRaceProgram(raceKey, 4);
    getLocalData(raceKey);
    combineRaceData(startList, betDistData, programData);
    populateRaceData();
    calculateBettingCost();
});

const raceListOptions = document.getElementById('race-list');

// const sortColumnInput = document.getElementById('sortColumn');
// sortColumnInput.addEventListener('change', () => {
//     const sortByColumn = sortColumnInput.value;
//     sortColumnInput.value = '';
// })

// const sortColumnList = document.getElementById('column-list');

function getLocalData(raceKey) {
    const jsonData = localStorage.getItem(raceKey) || {};
    if (jsonData.length > 0) {
        localData = JSON.parse(jsonData);
    }
}

function saveLocalData(raceKey) {
    localStorage.setItem(raceKey, JSON.stringify(localData));
}

async function getRaceList() {
    try {
        const response = await fetch(apiUrl + '?apiurl=' + raceListUrl, {
            method: 'get'
        })
        const result = await response.json();
        if (result.status > 300) {
            throw new Error(result.message);
        }
        return result;
    }
    catch (error) {
        console.error('Error fetching racelist! Error: ' + error);
        return {
            status: 500,
            body: 'Error fetching racelist! Error: ' + error
        }
    }
}

async function getStartList(raceKey) {
    const startsUrl = raceListUrl + '/' + raceKey + '/starts';
    try {
        const response = await fetch(apiUrl + '?apiurl=' + startsUrl, {
            method: 'get'
        })
        const result = await response.json();
        if (result.status > 300) {
            throw new Error(result.message);
        }
        return result;
    }
    catch (error) {
        console.error('Error fetching startlist! Error: ' + error);
        return {
            status: 500,
            body: 'Error fetching startlist! Error: ' + error
        }
    }
}

async function getBetDist(raceKey) {
    const betDistUrl = gameUrl + '/' + raceKey + '/betdistribution/investment/V75';
    try {
        const response = await fetch(apiUrl + '?apiurl=' + betDistUrl, {
            method: 'get'
        })
        const result = await response.json();
        if (result.status > 300) {
            throw new Error(result.message);
        }
        return result;
    }
    catch (error) {
        console.error('Error fetching betlist! Error: ' + error);
        return {
            status: 500,
            body: 'Error fetching betlist! Error: ' + error
        }
    }
}

async function getRaceProgram(raceKey, raceNumber) {
    const raceProgramUrl = programUrl + '/' + raceKey + '/V75/trot/' + raceNumber;
    try {
        const response = await fetch(apiUrl + '?apiurl=' + raceProgramUrl, {
            method: 'get'
        })
        const result = await response.json();
        if (result.status > 300) {
            throw new Error(result.message);
        }
        return result;
    }
    catch (error) {
        console.error('Error fetching betlist! Error: ' + error);
        return {
            status: 500,
            body: 'Error fetching betlist! Error: ' + error
        }
    }
}

function combineRaceData(startList, betDistData, programData) {
    for (let i = 0; i < programData.length; i++) {
        raceData.push(programData[i]);
        for (let j = 0; j < programData[i].starts.length; j++) {
            raceData[i].starts[j].isScratched = startList[raceData[i].raceNumber][j].isScratched;
        }
        for (let j = 0; j < betDistData[i].investmentDistribution.length; j++) {
            raceData[i].starts[j].investmentData = betDistData[i].investmentDistribution[j];
        }
    }
}

function populateRaceListInput(raceListData) {
    raceListData.sort((a, b) => a.startTime.localeCompare(b.startTime));
    for (let i = 0; i < raceListData.length; i++) {
        const opt = document.createElement('option');
        const startTime = new Date(raceListData[i].startTime)
        opt.value = raceListData[i].raceDayName + ' | ' + startTime.toLocaleString('nb-NO') + '#' + raceListData[i].raceDayKey;
        raceListOptions.appendChild(opt);
    }
}

function calculateScore(ranks) {
    const horseRanks = ranks.split(',');
    let rankScore = 0;
    horseRanks.forEach(score => {
        rankScore += Number(score);
    });
    const rank = rankScore / horseRanks.length;
    return rank;
}

function calculateBettingCost() {
    let totalBets = 0;
    for (const raceNr in localData) {
        let currentRaceBets = 0;
        for (const horseNr in localData[raceNr]) {
            if (localData[raceNr][horseNr].betted === true) {
                currentRaceBets++;
                if (totalBets === 0) totalBets++;
            }
        }
        if (currentRaceBets > 0) {
            totalBets = totalBets * currentRaceBets;
        }
    }
    costInfoElement.innerHTML = 'Antall rekker: ' + totalBets + ' | Kostnad (0,5 pr rekke): ' + totalBets * 0.5;
}

function sortData(race, column = 'Startnr', tableBody) {
    if (column === 'Startnr') {
        race.starts.sort((a, b) => a.startNumber - b.startNumber);
    }
    else if (column === 'Navn') {
        race.starts.sort((a, b) => a.horseName.localeCompare(b.horseName));
    }
    else if (column === 'Kusk') {
        race.starts.sort((a, b) => a.driver.localeCompare(b.driver));
    }
    else if (column === 'Innsats') {
        race.starts.sort((a, b) => b.investmentData.percentage - a.investmentData.percentage);
    }
    else if (column === 'Vinner') {
        race.starts.sort((a, b) => b.winPercentage - a.winPercentage);
    }
    else if (column === 'Auto') {
        race.starts.sort((a, b) => a.recordAuto.localeCompare(b.recordAuto));
    }
    else if (column === 'Volte') {
        race.starts.sort((a, b) => a.recordVolt.localeCompare(b.recordVolt));
    }
    else if (column === 'Stat i år') {
        race.starts.sort((a, b) => b.horseAnnualStatistics.currentYear.numberOfFirstPlaces - a.horseAnnualStatistics.currentYear.numberOfFirstPlaces);
    }
    else if (column === 'Stat i fjor') {
        race.starts.sort((a, b) => b.horseAnnualStatistics.previousYear.numberOfFirstPlaces - a.horseAnnualStatistics.previousYear.numberOfFirstPlaces);
    }
    showRaceDetails(race, tableBody)
}

function showRaceDetails(race, tableBody) {
    while (tableBody.rows.length > 1) {
        tableBody.deleteRow(1);
    }
    const raceHeaderRow = tableBody.insertRow();
    const raceHeaderColumns = [
        'Startnr',
        'Navn',
        'Kusk',
        'Innsats',
        'Vinner',
        'Auto',
        'Volte',
        'Tillegg',
        'Gallopp',
        'Stat i år',
        'Stat i fjor',
        'Sko',
        'Sulky',
        'Tips',
        'Rangering',
        'Markering'
    ];
    raceHeaderColumns.forEach(columnText => {
        const th = document.createElement('th');
        th.classList.add('clickable');
        th.textContent = columnText;
        th.addEventListener('click', () => {
            // populateRaceData(columnText);
            sortData(race, columnText, tableBody);
        });
        raceHeaderRow.appendChild(th);
    })
    for (let i = 0; i < race.starts.length; i++) {
        const raceHorse = race.starts[i];
        const raceHorseRow = tableBody.insertRow();
        const statsThisYear = raceHorse.horseAnnualStatistics.currentYear.numberOfFirstPlaces + ' | ' + raceHorse.horseAnnualStatistics.currentYear.numberOfSecondPlaces + ' | ' + 
            raceHorse.horseAnnualStatistics.currentYear.numberOfThirdPlaces + ' | ' + raceHorse.horseAnnualStatistics.currentYear.numberOfStarts;
        const statsLastYear = raceHorse.horseAnnualStatistics.previousYear.numberOfFirstPlaces + ' | ' + raceHorse.horseAnnualStatistics.previousYear.numberOfSecondPlaces + ' | ' + 
            raceHorse.horseAnnualStatistics.previousYear.numberOfThirdPlaces + ' | ' + raceHorse.horseAnnualStatistics.previousYear.numberOfStarts;
        const horseShoes = (raceHorse.shoes === raceHorse.previousStartShoes) ? raceHorse.shoes : '!' + raceHorse.shoes + '!';
        const sulky = (raceHorse.sulky === raceHorse.previousStartSulky) ? raceHorse.sulky : '!' + raceHorse.sulky + '!';
        const raceHorseColumns = [raceHorse.startNumber,
            raceHorse.horseName,
            raceHorse.driver,
            raceHorse.investmentData.percentage + '%',
            raceHorse.winPercentage + '%',
            raceHorse.recordAuto,
            raceHorse.recordVolt,
            raceHorse.extraDistance,
            raceHorse.gallopPercentage + '%',
            statsThisYear,
            statsLastYear,
            horseShoes,
            sulky
        ];
        raceHorseColumns.forEach(columnText => {
            const td = document.createElement('td');
            td.textContent = columnText;
            raceHorseRow.appendChild(td);
        });
        const tipInput = document.createElement('input');
        tipInput.setAttribute('type', 'text');
        if (localData[race.raceNumber] !== undefined) {
            if (localData[race.raceNumber][raceHorse.startNumber] !== undefined) {
                tipInput.value = localData[race.raceNumber][raceHorse.startNumber].ranks || '';
            }
        }
        tipInput.addEventListener('change', () => {
            localData[race.raceNumber] = localData[race.raceNumber] || {};
            localData[race.raceNumber][raceHorse.startNumber] = {
                ranks: tipInput.value,
                rank: calculateScore(tipInput.value)
            }
            saveLocalData(race.raceKey.split('#')[0]);
        })
        const tdTipInput = document.createElement('td');
        tdTipInput.appendChild(tipInput);
        raceHorseRow.appendChild(tdTipInput);
        const tdScore = document.createElement('td');
        if (localData[race.raceNumber] !== undefined) {
            if (localData[race.raceNumber][raceHorse.startNumber] !== undefined) {
                tdScore.textContent = localData[race.raceNumber][raceHorse.startNumber].rank || '';
            }
        }
        else tdScore.textContent = '';
        raceHorseRow.appendChild(tdScore);
        const horseBettedInput = document.createElement('input');
        horseBettedInput.setAttribute('type', 'checkbox');
        if (localData[race.raceNumber] !== undefined) {
            if (localData[race.raceNumber][raceHorse.startNumber] !== undefined) {
                horseBettedInput.checked = localData[race.raceNumber][raceHorse.startNumber].betted || false;
            }
        }
        horseBettedInput.addEventListener('change', () => {
            localData[race.raceNumber] = localData[race.raceNumber] || {};
            localData[race.raceNumber][raceHorse.startNumber] = localData[race.raceNumber][raceHorse.startNumber] || {};
            localData[race.raceNumber][raceHorse.startNumber].betted = horseBettedInput.checked
            saveLocalData(race.raceKey.split('#')[0]);
            calculateBettingCost();
        })
        const tdHorseBettedInput = document.createElement('td');
        tdHorseBettedInput.appendChild(horseBettedInput);
        raceHorseRow.appendChild(tdHorseBettedInput);
    }
}

function hideRaceDetails(tableBody) {
    // Fjern alle rader unntatt den første (header-raden)
    while (tableBody.rows.length > 1) {
        tableBody.deleteRow(1);
    }
}

function populateRaceData() {
    raceTable.replaceChildren();
    for (let i = 0; i < raceData.length; i++) {
        const race = raceData[i];
        const tableBody = document.createElement('tbody');
        raceTable.appendChild(tableBody);
        const raceRow = document.createElement('tr');
        raceRow.classList.add('table-header', 'clickable');
        const v75Number = race.raceNumber - 3;
        const raceNumber = 'V75-' + v75Number + ' (' + race.raceNumber + ')';
        const raceRowColumns = [raceNumber, race.distance, race.startMethod, (race.isMonte) ? 'Ja' :'Nei'];
        raceRowColumns.forEach(columnText => {
            const th = document.createElement('th');
            th.textContent = columnText;
            raceRow.appendChild(th);
        })
        tableBody.appendChild(raceRow);
        raceRow.addEventListener('click', () => {
            if (tableBody.rows.length > 1) {
                hideRaceDetails(tableBody);
            }
            else {
                showRaceDetails(race, tableBody);
            }
        })
    }

}

async function initiatePage() {
    const raceListData = await getRaceList();
    populateRaceListInput(raceListData);
}

initiatePage();