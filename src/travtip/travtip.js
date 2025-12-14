import { gameurl, raceListUrl } from "./scripts/config.js";

let startList = [];
let betDistData = [];

const raceListForm = document.getElementById('raceListForm');

const raceKeyInput = document.getElementById('raceKey');
raceKeyInput.addEventListener('change', async (event) => {
    event.preventDefault();
    const selected = raceKeyInput.value;
    const raceKey = selected.split('#')[1];
    startList = await getStartList(raceKey);
    betDistData = await getBetDist(raceKey);
    console.log(startList);
    console.log(betDistData);
});
const raceListOptions = document.getElementById('race-list');

const raceDataDiv = document.getElementById('raceDataDiv');

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
    const betDistUrl = raceListUrl + '/' + raceKey + '/starts';
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

function populateRaceListInput(raceListData) {
    raceListData.sort((a, b) => a.startTime.localeCompare(b.startTime));
    for (let i = 0; i < raceListData.length; i++) {
        const opt = document.createElement('option');
        const startTime = new Date(raceListData[i].startTime)
        opt.value = raceListData[i].raceDayName + ' | ' + startTime.toLocaleString('nb-NO') + '#' + raceListData[i].raceDayKey;
        raceListOptions.appendChild(opt);
    }
}

function populateRaceData(raceData) {
    console.log(raceData);
}

async function initiatePage() {
    const raceListData = await getRaceList();
    populateRaceListInput(raceListData);
}

initiatePage();