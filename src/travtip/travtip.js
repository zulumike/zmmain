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
        const response = await fetch(raceListUrl, {
            method: 'get'
        })
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message);
        }
        return result.result
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
        const response = await fetch(startsUrl, {
            method: 'get'
        });
        const result = await response.json();
         if (!result.success) {
            throw new Error(result.message);
        }
        return result.result
    }
    catch (error) {
        console.error('Error fetching starts! Error: ' + error);
        return {
            status: 500,
            body: 'Error fetching starts! Error: ' + error
        }
    }
}

async function getBetDist(raceKey) {
    const betDistUrl = gameurl + '/' + raceKey + '/betdistribution/investment/V75';
    try {
        const response = await fetch(betDistUrl, {
            method: 'get'
        });
        const result = await response.json();
         if (!result.success) {
            throw new Error(result.message);
        }
        return result.result
    }
    catch (error) {
        console.error('Error fetching betting distribution! Error: ' + error);
        return {
            status: 500,
            body: 'Error fetching betting distribution! Error: ' + error
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