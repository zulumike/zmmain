import { gameUrl, programUrl, raceListUrl } from "./scripts/config.js";

// let startList = [];
// let betDistData = [];
let raceData = [];
let localData = {};

const raceTable = document.getElementById('raceDataTable')

const raceKeyInput = document.getElementById('raceKey');
raceKeyInput.addEventListener('change', async (event) => {
    event.preventDefault();
    const selected = raceKeyInput.value;
    const raceKey = selected.split('#')[1];
    const startList = await getStartList(raceKey);
    const betDistData = await getBetDist(raceKey);
    const programData = await getRaceProgram(raceKey, 4);
    getLocalData(raceKey);
    combineRaceData(startList, betDistData, programData);
    populateRaceData();
});

const raceListOptions = document.getElementById('race-list');

function getLocalData(raceKey) {
    const jsonData = localStorage.getItem(raceKey) || {};
    localData = JSON.parse(jsonData);
}

function saveLocalData(raceKey) {
    localStorage.setItem(raceKey, JSON.stringify(localData));
}

async function getRaceList() {
    try {
        const response = await fetch('http://localhost:7071/api/rikstoto?apiurl=' + raceListUrl, {
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
        const response = await fetch('http://localhost:7071/api/rikstoto?apiurl=' + startsUrl, {
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
        const response = await fetch('http://localhost:7071/api/rikstoto?apiurl=' + betDistUrl, {
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
        const response = await fetch('http://localhost:7071/api/rikstoto?apiurl=' + raceProgramUrl, {
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
    console.log(raceData);
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
    console.log(horseRanks);
    console.log(rankScore);
    console.log(horseRanks.length);
    const rank = rankScore / horseRanks.length;
    return rank;
    // for (let i = 0; i < localData.length; i++) {
    //     for (let j = 0; j < localData[i].length; j++) {
    //         const horseRanks = localData[i][j].ranks.split(',');
    //         let rankScores = 0;
    //         horseRanks.forEach(rank => {
    //             rankScores += rank
    //         });
    //         localData.horseRank = rankScores / horseRanks.length;
    //     }
    // }
}

function showRaceDetails(race, tableBody) {
    const raceHeaderRow = tableBody.insertRow();
    const raceHeaderColumns = ['Startnr',
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
        'Rangering'
    ];
    raceHeaderColumns.forEach(columnText => {
        const th = document.createElement('th');
        th.textContent = columnText;
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
        if (localData[race.raceNumber][raceHorse.startNumber] !== undefined) {
            tipInput.value = localData[race.raceNumber][raceHorse.startNumber].ranks;
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
        if (localData[race.raceNumber][raceHorse.startNumber] !== undefined) {
            tdScore.textContent = localData[race.raceNumber][raceHorse.startNumber].rank;;
        }
        else tdScore.textContent = '';
        raceHorseRow.appendChild(tdScore);
    }
}

function hideRaceDetails(tableBody) {
    // Fjern alle rader unntatt den første (header-raden)
    while (tableBody.rows.length > 1) {
        tableBody.deleteRow(1);
    }
}

function populateRaceData() {
    raceTable.innerHtml = '';
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