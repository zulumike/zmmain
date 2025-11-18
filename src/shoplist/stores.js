import * as functions from '../scripts/functions.js';
import * as config from './scripts/config.js';
import * as dbFunction from "./scripts/dbfunctions.js";

const storeForm = document.getElementById('storeForm');
const itemSubmitBtn = document.getElementById('itemSubmitBtn');
const storesBody = document.getElementById('storesBody');

storeForm.addEventListener('submit', function(e) {
    e.preventDefault();
    saveStore();
})

async function saveStore() {
    const formData = new FormData(storeForm, itemSubmitBtn);
        const newStore = Object.fromEntries(formData.entries());
        console.log(newStore);
        newStore.categories = [];
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
    await showStores();
}

async function showStores(){
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