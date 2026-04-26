import * as functions from '../scripts/functions.js';
import * as config from './scripts/config.js';
import * as dbFunction from "./scripts/dbfunctions.js";
import { getUserInfo } from '../scripts/auth.js';

const storeForm = document.getElementById('storeForm');
const itemSubmitBtn = document.getElementById('itemSubmitBtn');
const storesBody = document.getElementById('storesBody');
const liveModeInput = document.getElementById('liveMode');

storeForm.addEventListener('submit', function(e) {
    e.preventDefault();
    saveStore();
})

const activeUser = await getUserInfo();
let activeAccount = undefined;

const localSettings = await dbFunction.getLocalSettings();
if (localSettings.liveMode !== undefined) {
    liveModeInput.checked = localSettings.liveMode;
}
else { 
    liveModeInput.checked = false;
    localSettings.liveMode = false;
    await dbFunction.writeLocalSettings(localSettings);
}

liveModeInput.addEventListener('change', async function() {
    const localSettings = await dbFunction.getLocalSettings();
    localSettings.liveMode = liveModeInput.checked;
    await dbFunction.writeLocalSettings(localSettings);
});

async function updateAccountFromDB() {
    try {
        if (!activeUser) {
            throw new Error('Ingen aktiv bruker funnet. Kan ikke oppdatere konto fra database');
        }
        const accountResponse = await dbFunction.getAccountByUserDB('accounts', activeUser.userDetails);
        if (accountResponse.status !== 200) {
            throw new Error(accountResponse.body);
        }
        const accountFromDB = accountResponse.body;
        activeAccount = accountFromDB;
    }
    catch (error) {
        functions.showMessage('Feil ved oppdatering av konto fra database. Feil: ' + error, true, 7000);
        console.log('Feil ved oppdatering av konto fra database. Feil: ' + error);
    }
}

async function saveStore() {
    const formData = new FormData(storeForm, itemSubmitBtn);
        const newStore = Object.fromEntries(formData.entries());
        newStore.categories = [];
        if (activeUser) {
            const accountResponse = await dbFunction.getAccountByUserDB('accounts', activeUser.userDetails);
            if (accountResponse.status === 200) {
                const accountFromDB = accountResponse.body;
                activeAccount = accountFromDB;
                newStore.accountId = accountFromDB.id;
            }
            else {
                functions.showMessage('Feil ved henting av konto fra database. Feil: ' + accountResponse.body, true, 7000);
                console.log('Feil ved henting av konto fra database. Feil: ' + accountResponse.body);
                return;
            }
        }
        const allItemResponse = await dbFunction.getAllItems(config.storeContainer);
        let existingItems = [];
        if (allItemResponse.status === 200 || allItemResponse.status === 204) {
            existingItems = allItemResponse.body;
            let itemExist = false;
            if (allItemResponse.status !== 204) {
                for (let i = 0; i < existingItems.length; i++) {
                    const existingItem = existingItems[i];
                    if (existingItem.name.toLowerCase() === newStore.name.toLowerCase()) {
                        itemExist = true;
                        break;
                    } 
                }
            }
            if (!itemExist) {
                const response = await dbFunction.addSingleItem(config.storeContainer, newStore);
                if (response.status === 200) {
                    functions.showMessage('Butikk ' + newStore.name + ' lagt til', false);
                }
                else {
                    functions.showMessage('Feil ved lagring. Feil: ' + response.body, true, 7000);
                    console.log(response);
                }
            }
            else {
                functions.showMessage('Butikk eksisterer fra før');
            }
        }
        else {
            functions.showMessage('Feil ved lesing av Butikker. Feil: ' + allItemResponse.body, true, 7000);
            console.log(allItemResponse);
        }
        storeForm.reset();
        if (localSettings.liveMode) {
            const syncToCloudResponse = await dbFunction.syncToCloud(config.storeContainer, config.storeContainer);
            if (syncToCloudResponse.status !== 200) {
                functions.showMessage('Feil ved synkronisering til sky. Feil: ' + syncToCloudResponse.body, true, 7000);
                console.log(syncToCloudResponse);
            }
        }
        await showStores();
}

async function deleteStore(storeId) {
    const response = await dbFunction.deleteItem(config.storeContainer, storeId);
    if (response.status === 200) {
        functions.showMessage('Butikk slettet');
    }
    else {
        functions.showMessage('Feil ved sletting av Butikk! ' + response.body, true, 7000);
        console.log(response);
    }
    if (localSettings.liveMode) {
        const syncToCloudResponse = await dbFunction.syncToCloud(config.storeContainer, config.storeContainer);
        if (syncToCloudResponse.status !== 200) {
            functions.showMessage('Feil ved synkronisering til sky. Feil: ' + syncToCloudResponse.body, true, 7000);
            console.log(syncToCloudResponse);
        }
    }
    await showStores();
}

async function showStores(){
    if (localSettings.liveMode) {
        const syncToLocalsResponse = await dbFunction.syncToLocal(config.storeContainer, config.storeContainer);
        if (syncToLocalsResponse.status === 204) {
            functions.showMessage('Skydata eksisterer ikke', false, 5000);
        }
        else if (syncToLocalsResponse.status !== 200) {
            functions.showMessage('Feil ved synkronisering fra sky. Feil: ' + syncToLocalsResponse.body, true, 7000);
            console.log(syncToLocalsResponse);
        }
    }
    storesBody.innerHTML = '';
    const allItemsResponse = await dbFunction.getAllItems(config.storeContainer);
    let allItems = [];
    if (allItemsResponse.status === 200) {
        allItems = allItemsResponse.body;
        for (let i = 0; i < allItems.length; i++) {
            const tBodyRow = storesBody.insertRow();
            const cellName = tBodyRow.insertCell();
            const cellDelete = document.createElement('img');
            cellName.textContent = allItems[i].name;
            cellName.classList.add('clickable');
            cellName.addEventListener('click', event => {
                window.location.href = './order.html?storeId=' + allItems[i].id;
            });
            cellDelete.classList.add('delsymbol');
            cellDelete.setAttribute('src', '../assets/img/trash.svg');
            cellDelete.setAttribute('type', 'image/svg+xml');
            cellDelete.addEventListener('click', event => {
                deleteStore(allItems[i].id);
            });
            tBodyRow.appendChild(cellDelete);
        }
    }
    else if (allItemsResponse.status = 204) {
        functions.showMessage('Det finnes ingen Butikker enda');
    }
    else {
        console.log(allItemsResponse);
        functions.showMessage('Feil ved lesing av Butikker. Feil: ' + allItemsResponse.body);
    }
}

showStores();