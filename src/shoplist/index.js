import * as dbFunction from '../shoplist/scripts/dbfunctions.js';
import * as functions from '../scripts/functions.js';
import * as config from './scripts/config.js';
import { getUserInfo } from '../scripts/auth.js';

const liveModeInput = document.getElementById('liveMode');
const inCartHeader = document.getElementById('inCartHeader');
const delShopListBtn = document.getElementById('delShopListBtn');
delShopListBtn.addEventListener('click', async () => {
    if (!confirm('Er du sikker på at du vil slette hele handlelisten?')) {
        return;
    }
    stores[selectedStoreIndex].shopList = [];
    const updateResponse = await dbFunction.updateItem(config.storeContainer, stores[selectedStoreIndex]);
    if (updateResponse.status !== 200) {
        functions.showMessage('Feil ved sletting av handleliste. Feil: ' + updateResponse.body, true, 7000);
        console.log('Feil ved sletting av handleliste. Feil: ' + updateResponse.body);
        return;
    }
    if (localSettings.liveMode) {
        await updateStoreInDB(stores[selectedStoreIndex]);
    }
    await populateShopList();
});
inCartHeader.style.display = 'none';

let stores = [];
let categories = [];
let itemSuggestionArray = [];

const activeUser = await getUserInfo();

const localSettings = await dbFunction.getLocalSettings();
if (localSettings.liveMode !== undefined) {
    liveModeInput.checked = localSettings.liveMode;
}
else { 
    liveModeInput.checked = false;
    localSettings.liveMode = false;
    await dbFunction.writeLocalSettings(localSettings);
}

let activeAccount = undefined;

// if (localSettings.liveMode) {
//     updateAccountFromDB();
// }

let foods = [];
// let foodCategories = [];
// const stores = {};
let selectedStoreIndex = 0;
const shopSettings = {
    defaultStoreId: 0
};

liveModeInput.addEventListener('change', async () => {
    localSettings.liveMode = liveModeInput.checked;
    dbFunction.writeLocalSettings(localSettings);
});

const selectedStoreInput = document.getElementById('selectedStore');
const storeList = document.getElementById('storeList');

selectedStoreInput.addEventListener('change', async () => {
    console.log('Selected store changed to: ' + selectedStoreInput.value);
    const storeIndex = selectedStoreInput.value.split('#')[1];
    if (storeIndex === undefined) {
        return;
    }
    selectedStoreIndex = storeIndex;
    selectedStoreInput.style.backgroundColor = 'white';
    localSettings.defaultStoreId = selectedStoreIndex;
    await dbFunction.writeLocalSettings(localSettings);
    await populateShopList();
});

selectedStoreInput.addEventListener('dblclick', () => {
    selectedStoreInput.value = '';
});

selectedStoreInput.addEventListener('focus', () => {
    selectedStoreInput.value = '';
    selectedStoreInput.style.backgroundColor = 'grey';
});

selectedStoreInput.addEventListener('blur', () => {
    if (selectedStoreInput.value === '') {
        selectedStoreInput.value = stores[selectedStoreIndex].name + '#' + selectedStoreIndex;
    }
    selectedStoreInput.style.backgroundColor = 'white';
});

const itemForm = document.getElementById('itemForm');
const itemNameInput = document.getElementById('itemName');
const itemSuggestionList = document.getElementById('itemSuggestions');
const itemCategoryInput = document.getElementById('itemCategory');
const itemCategorySuggestionList = document.getElementById('itemCategorySuggestions');
const shopListBody = document.getElementById('shopListBody');
const shopCartBody = document.getElementById('shopCartBody');

itemNameInput.addEventListener('dblclick', () => {
    itemNameInput.value = '';
});

itemNameInput.addEventListener('change', () => {
    for (let i = 0; i < itemSuggestionArray.length; i++) {
        if (itemSuggestionArray[i].name.toLowerCase() === itemNameInput.value.split('#')[0].toLowerCase()) {
            itemCategoryInput.value = itemSuggestionArray[i].category;
            break;
        }
    }
});

itemCategoryInput.addEventListener('dblclick', () => {
    itemCategoryInput.value = '';
});

itemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const itemName = itemNameInput.value.split('#')[0];
    const itemAmount = document.getElementById('itemAmount').value;
    const itemCategory = itemCategoryInput.value;
    const newItem = {
        name: itemName,
        amount: itemAmount,
        category: itemCategory,
        inCart: false
    };
    stores[selectedStoreIndex].shopList = stores[selectedStoreIndex].shopList || [];
    stores[selectedStoreIndex].shopList.push(newItem);
    const updateResponse = await dbFunction.updateItem(config.storeContainer, stores[selectedStoreIndex]);
    if (updateResponse.status !== 200) {
        functions.showMessage('Feil ved lagring av vare. Feil: ' + updateResponse.body, true, 7000);
        console.log('Feil ved lagring av vare. Feil: ' + updateResponse.body);
        return;
    }
    await updateSuggestions(newItem);
    if (localSettings.liveMode) {
        await updateStoreInDB(stores[selectedStoreIndex]);
    }
    await populateShopList();
    itemForm.reset();
});

async function updateSuggestions(item) {
    for (let i = 0; i < itemSuggestionArray.length; i++) {
        if (itemSuggestionArray[i].name.toLowerCase() === item.name.toLowerCase() && itemSuggestionArray[i].category.toLowerCase() === item.category.toLowerCase()) {
            return;
        }
    }
    itemSuggestionArray.push(item);
    const deleteResponse = await dbFunction.deleteAllItems(config.shopItemSuggestionsContainer);
    if (deleteResponse.status !== 200) {
        functions.showMessage('Feil ved oppdatering av vareforslag. Feil: ' + deleteResponse.body, true, 7000);
        console.log('Feil ved oppdatering av vareforslag. Feil: ' + deleteResponse.body);
        return;
    }
    const updateResponse = await dbFunction.addItems(config.shopItemSuggestionsContainer, itemSuggestionArray);
    if (updateResponse.status !== 200) {
        functions.showMessage('Feil ved oppdatering av vareforslag. Feil: ' + updateResponse.body, true, 7000);
        console.log('Feil ved oppdatering av vareforslag. Feil: ' + updateResponse.body);
        return;
    }
    if (localSettings.liveMode) {
        const syncToCloudResponse = await dbFunction.syncToCloud(config.shopItemSuggestionsContainer, config.shopItemSuggestionsContainer);
        if (syncToCloudResponse.status !== 200) {
            functions.showMessage('Feil ved synkronisering til sky. Feil: ' + syncToCloudResponse.body, true, 7000);
            console.log('Feil ved synkronisering til sky. Feil: ' + syncToCloudResponse.body);
            return;
        }
    }
    return;
}

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

function populateStoreSuggestions() {
    storeList.replaceChildren();
    for (let key in stores) {
        const option = document.createElement('option');
        option.value = stores[key].name + '#' + key;
        storeList.appendChild(option);
    }
    if (localSettings.defaultStoreId) {
        selectedStoreIndex = parseInt(localSettings.defaultStoreId);
        selectedStoreInput.value = stores[selectedStoreIndex].name + '#' + selectedStoreIndex;
    }
}


// Denne må fikses til å hente fra container shopitemsuggestionlist
function populateItemSuggestions() {
    itemSuggestionList.replaceChildren();
    for (let i = 0; i < itemSuggestionArray.length; i++) {
        const option = document.createElement('option');
        option.value = itemSuggestionArray[i].name + '#' + i;
        itemSuggestionList.appendChild(option);
    };
}

function setItemCategoryBasedOnName(foodIndex) {
    const selectedFoodCategory = foods[foodIndex].foodGroupId.split('.')[0];
    itemCategoryInput.value = categories[selectedFoodCategory].name;
}

function populateCategorySuggestions() {
    itemCategorySuggestionList.replaceChildren();
    for (let key in categories) {
        const option = document.createElement('option');
        option.value = categories[key].name;
        itemCategorySuggestionList.appendChild(option);
    }
}

async function populateShopList() {
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
    shopListBody.replaceChildren();
    shopCartBody.replaceChildren();
    const currentStore = stores[selectedStoreIndex];
    if (currentStore.shopList === undefined || currentStore.shopList.length < 1) {
        return;
    }
    const sortedShopList = [];
    const uncategorizedItems = [];
    // Add categorized items in order by category
    for (let i = 0; i < currentStore.categories.length; i++) {
        const category = currentStore.categories[i];
        for (let j = 0; j < currentStore.shopList.length; j++) {
            const item = currentStore.shopList[j];
            if (item.category === category.name) {
                sortedShopList.push(item);
            }
        }
    }
    // Add all items that do not match a category to the end of list

    for (let i = 0; i < currentStore.shopList.length; i++) {
        let itemCategoryHit = false;
        const item = currentStore.shopList[i];
        for (let j = 0; j < currentStore.categories.length; j++) {
            const category = currentStore.categories[j];
            if (item.category === category.name) {
                itemCategoryHit = true;
                break;
            }
        }
        if (!itemCategoryHit) {
            uncategorizedItems.push(item);
        }
    }
    Array.prototype.push.apply(sortedShopList, uncategorizedItems);
    for (let i = 0; i < sortedShopList.length; i++) {
        if (sortedShopList[i].inCart) {
            inCartHeader.style.display = 'block';
        }
        const item = sortedShopList[i];
        const row = shopListBody.insertRow(-1);
        const cartCell = row.insertCell();
        const toggleCartBtn = document.createElement('img');
        toggleCartBtn.type ='image/svg+xml';
        toggleCartBtn.width = 20;
        toggleCartBtn.height = 20;
        toggleCartBtn.style.cursor = 'pointer';
        if (item.inCart) {
            toggleCartBtn.src = '../assets/img/cart-x.svg';
            toggleCartBtn.alt = 'Fjern fra handlevogn';
        }
        else {
            toggleCartBtn.src = '../assets/img/cart-check.svg';
            toggleCartBtn.alt = 'Legg til i handlevogn';
        }
        cartCell.appendChild(toggleCartBtn);
        toggleCartBtn.addEventListener('click', async () => {
            item.inCart = !item.inCart;
            sortedShopList[i] = item;
            stores[selectedStoreIndex].shopList = sortedShopList;
            const updateResponse = await dbFunction.updateItem(config.storeContainer, stores[selectedStoreIndex]);
            if (updateResponse.status !== 200) {
                functions.showMessage('Feil ved oppdatering av vare. Feil: ' + updateResponse.body, true, 7000);
                console.log('Feil ved oppdatering av vare. Feil: ' + updateResponse.body);
                return;
            }
            if (localSettings.liveMode) {
                await updateStoreInDB(stores[selectedStoreIndex]);
            }
            await populateShopList();
        });
        const amountCell = row.insertCell();
        amountCell.textContent = item.amount;
        const nameCell = row.insertCell();
        nameCell.textContent = item.name;
        const deleteItemCell = row.insertCell();
        const deleteItemBtn = document.createElement('img');
        deleteItemBtn.type ='image/svg+xml';
        deleteItemBtn.width = 20;
        deleteItemBtn.height = 20;
        deleteItemBtn.style.cursor = 'pointer';
        deleteItemBtn.src = '../assets/img/trash.svg';
        deleteItemBtn.alt = 'Slett vare';
        deleteItemCell.appendChild(deleteItemBtn);
        deleteItemBtn.addEventListener('click', async () => {
            sortedShopList.splice(i, 1);
            stores[selectedStoreIndex].shopList = sortedShopList;
            const updateResponse = await dbFunction.updateItem(config.storeContainer, stores[selectedStoreIndex]);
            if (updateResponse.status !== 200) {
                functions.showMessage('Feil ved sletting av vare. Feil: ' + updateResponse.body, true, 7000);
                console.log('Feil ved sletting av vare. Feil: ' + updateResponse.body);
                return;
            }
            if (localSettings.liveMode) {
                await updateStoreInDB(stores[selectedStoreIndex]);
            }
            await populateShopList();
        });
        if (item.inCart) {
            shopCartBody.appendChild(row);
        }
        else {
            shopListBody.appendChild(row);
        }
    }
}

async function createStoreInDB(store) {
    try {
        store.accountId = activeAccount.id;
        store.accountName = activeAccount.name;
        const response = await dbFunction.createItemDB('stores', store)
        if (response.status > 201) {
           throw new Error(response.body)
        }
        const result = response.body;
        functions.showMessage('Butikk opprettet i database: ' + result);
    }
    catch (error) {
        functions.showMessage('Feil ved oppretting av butikk i database. Feil: ' + error, true, 7000);
        console.log('Feil ved oppretting av butikk i database. Feil: ' + error);
    }
}

async function updateStoreInDB(store) {
    try {
        if (!activeAccount) {
            throw new Error('Ingen aktiv konto funnet. Kan ikke oppdatere butikk i database');
        }
        store.accountId = activeAccount.id;
        store.accountName = activeAccount.name;
        const response = await dbFunction.updateItemDB(config.storeContainer, store)
        if (response.status === 204) {
            const createResponse = await createStoreInDB(store);
            return createResponse;
        }
        if (response.status > 204) {
           throw new Error(response.body)
        }
        functions.showMessage('Butikk oppdatert i database');
    }
    catch (error) {
        functions.showMessage('Feil ved oppdatering av data til database. Feil: ' + error, true, 7000);
        console.log('Feil ved oppdatering av data til database. Feil: ' + error);
    }
}

async function initPage() {

    if (localSettings.liveMode) {
        const syncToLocalsResponse = await dbFunction.syncToLocal(config.categoryContainer, config.categoryContainer);
        if (syncToLocalsResponse.status === 204) {
            functions.showMessage('Skydata eksisterer ikke', false, 5000);
        }
        else if (syncToLocalsResponse.status !== 200) {
            functions.showMessage('Feil ved synkronisering fra sky. Feil: ' + syncToLocalsResponse.body, true, 7000);
            console.log(syncToLocalsResponse);
        }
        const syncToLocalsResponse2 = await dbFunction.syncToLocal(config.shopItemSuggestionsContainer, config.shopItemSuggestionsContainer);
        if (syncToLocalsResponse2.status === 204) {
            functions.showMessage('Skydata eksisterer ikke', false, 5000);
        }
        else if (syncToLocalsResponse2.status !== 200) {
            functions.showMessage('Feil ved synkronisering fra sky. Feil: ' + syncToLocalsResponse2.body, true, 7000);
        }
    }

    const categoriesResponse = await dbFunction.getAllItems(config.categoryContainer);
    if (categoriesResponse.status !== 200) {
        functions.showMessage('Feil ved lesing av kategorier. Feil: ' + categoriesResponse.body, true, 7000);
        console.log('Feil ved lesing av kategorier. Feil: ' + categoriesResponse.body);
        return;
    }
    categories = categoriesResponse.body;

    const itemSuggestionResponse = await dbFunction.getAllItems(config.shopItemSuggestionsContainer);
    if (itemSuggestionResponse.status !== 200 && itemSuggestionResponse.status !== 204) {
        functions.showMessage('Feil ved lesing av vareforslag. Feil: ' + itemSuggestionResponse.body, true, 7000);
        console.log('Feil ved lesing av vareforslag. Feil: ' + itemSuggestionResponse.body);
        return;
    }
    if (itemSuggestionResponse.status === 204) {
        itemSuggestionArray = [];
    }
    else {
        itemSuggestionArray = itemSuggestionResponse.body;
    }

    // Henter butikker fra database eller lokalt og putter inn i stores array. I tillegg legges en generell.
    stores[0] = { name: 'Generell' };
    if (localSettings.liveMode && activeUser.userDetails !== undefined) {
        const accountResponse = await dbFunction.getAccountByUserDB(config.accountContainer, activeUser.userDetails);
        if (accountResponse.status !== 200) {
            functions.showMessage('Feil ved lesing av konto fra database. Feil: ' + accountResponse.body, true, 7000);
            console.log('Feil ved lesing av konto fra database. Feil: ' + accountResponse.body);
            return;
        }
        const accountFromDB = accountResponse.body;
        activeAccount = accountFromDB;
        const storeResponse = await dbFunction.getAccountStoresDB(config.storeContainer, activeAccount.id);
        if (storeResponse.status !== 200) {
            functions.showMessage('Feil ved lesing av butikker fra database. Feil: ' + storeResponse.body, true, 7000);
            console.log('Feil ved lesing av butikker fra database. Feil: ' + storeResponse.body);
            return;
        }
        const storesFromDB = storeResponse.body;
        for (let i = 0; i < storesFromDB.length; i++) {
            const store = storesFromDB[i];
            stores.push(store);
        }
    }
    else {
        const storesResponse = await dbFunction.getAllItems(config.storeContainer);
        if (storesResponse.status !== 200) {
            functions.showMessage('Feil ved lesing av butikker. Feil: ' + storesResponse.body, true, 7000);
            console.log('Feil ved lesing av butikker. Feil: ' + storesResponse.body);
            return;
        }
        for (let i = 0; i < storesResponse.body.length; i++) {
            const store = storesResponse.body[i];
            stores.push(store);
        }
    }
    populateStoreSuggestions();
    populateItemSuggestions();
    populateCategorySuggestions();
    await populateShopList();
}

initPage();