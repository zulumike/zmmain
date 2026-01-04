import * as dbFunction from '../shoplist/scripts/dbfunctions.js';
import * as functions from '../scripts/functions.js';
import * as config from './scripts/config.js';

let foods = [];
let foodCategories = [];
const stores = {};
let selectedStoreIndex = 0;
const shopdefaultvalues = {
    defaultStoreId: 0
};


const selectedStoreInput = document.getElementById('selectedStore');
const storeList = document.getElementById('storeList');
selectedStoreInput.addEventListener('change', async () => {
    console.log('Selected store changed to: ' + selectedStoreInput.value);
    const storeIndex = selectedStoreInput.value.split('#')[1];
    if (storeIndex === undefined) {
        return;
    }
    selectedStoreIndex = storeIndex;
    const updateResponse = await dbFunction.updateItem(config.defaultValuesContainer, { id: 0, defaultStoreId: selectedStoreIndex });
    if (updateResponse.status === 404) {
        const addResponse = await dbFunction.addSingleItem(config.defaultValuesContainer, { id: 0, defaultStoreId: selectedStoreIndex });
        console.log(addResponse);
    }
});

const itemForm = document.getElementById('itemForm');
const itemNameInput = document.getElementById('itemName');
itemNameInput.addEventListener('change', () => {
    const foodIndex = itemNameInput.value.split('#')[1];
    if (foodIndex === undefined) {
        return;
    }
    setItemCategoryBasedOnName(foodIndex);
});
const itemSuggestionList = document.getElementById('itemSuggestions');
const itemCategoryInput = document.getElementById('itemCategory');
const itemCategorySuggestionList = document.getElementById('itemCategorySuggestions');
const shopListBody = document.getElementById('shopListBody');
const shopCartBody = document.getElementById('shopCartBody');
// const itemSubmitBtn = document.getElementById('itemSubmitBtn');

selectedStoreInput.addEventListener('dblclick', () => {
    selectedStoreInput.value = '';
});

itemNameInput.addEventListener('dblclick', () => {
    itemNameInput.value = '';
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
    await populateShopList();
    itemForm.reset();
});

function populateStoreSuggestions() {
    storeList.replaceChildren();
    for (let key in stores) {
        const option = document.createElement('option');
        option.value = stores[key].name + '#' + key;
        storeList.appendChild(option);
    }
}

function populateItemSuggestions() {
    itemSuggestionList.replaceChildren();
    for (let i = 0; i < foods.length; i++) {
        const option = document.createElement('option');
        option.value = foods[i].foodName + '#' + i;
        itemSuggestionList.appendChild(option);
    };
}

function setItemCategoryBasedOnName(foodIndex) {
    const selectedFoodCategory = foods[foodIndex].foodGroupId.split('.')[0];
    itemCategoryInput.value = foodCategories[selectedFoodCategory].name;
}

function populateCategorySuggestions() {
    itemCategorySuggestionList.replaceChildren();
    for (let key in foodCategories) {
        const option = document.createElement('option');
        option.value = foodCategories[key].name;
        itemCategorySuggestionList.appendChild(option);
    }
}

async function populateShopList() {
    shopListBody.replaceChildren();
    shopCartBody.replaceChildren();
    const currentStore = stores[selectedStoreIndex];
    if (currentStore.shopList === undefined || currentStore.shopList.length < 1) {
        return;
    }
    const sortedShopList = [];
    const uncategorizedItems = [];
    // for (let category in foodCategories) {
    for (let i = 0; i < currentStore.categories.length; i++) {
        // const category = currentStore.categories[i].id;
        const category = currentStore.categories[i];
        for (let j = 0; j < currentStore.shopList.length; j++) {
            const item = currentStore.shopList[j];
            // if (item.category === foodCategories[category].name) {
            if (item.category === category.name) {
                sortedShopList.push(item);
            }
        }
    }
    for (let i = 0; i < currentStore.shopList.length; i++) {
        const item = currentStore.shopList[i];
        if (item.category === '' || item.category === undefined) {
            uncategorizedItems.push(item);;
        }
    }
    Array.prototype.push.apply(sortedShopList, uncategorizedItems);
    for (let i = 0; i < sortedShopList.length; i++) {
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

async function initPage() {
    const shopDefaultvaluesResponse = await dbFunction.getSingleItem(config.defaultValuesContainer, 0);
    if (shopDefaultvaluesResponse.status === 200) {
        Object.assign(shopdefaultvalues, shopDefaultvaluesResponse.body);
        selectedStoreIndex = shopdefaultvalues.defaultStoreId;
    }
    const foodsResponse = await dbFunction.getFoods();
    if (foodsResponse.status !== 200) {
        functions.showMessage('Feil ved lesing av matvarer. Feil: ' + foodsResponse.body, true, 7000);
        console.log('Feil ved lesing av matvarer. Feil: ' + foodsResponse.body);
        return;
    }
    foods = foodsResponse.body;
    populateItemSuggestions(foods);
    const foodCategoriesResponse = await dbFunction.getFoodCategories();
    if (foodCategoriesResponse.status !== 200) {
        functions.showMessage('Feil ved lesing av matvarekategorier. Feil: ' + foodCategoriesResponse.body, true, 7000);
        console.log('Feil ved lesing av matvarekategorier. Feil: ' + foodCategoriesResponse.body);
        return;
    }
    foodCategories = foodCategoriesResponse.body;
    populateCategorySuggestions();
    const storesResponse = await dbFunction.getAllItems(config.storeContainer);
    if (storesResponse.status !== 200) {
        functions.showMessage('Feil ved lesing av butikker. Feil: ' + storesResponse.body, true, 7000);
        console.log('Feil ved lesing av butikker. Feil: ' + storesResponse.body);
        return;
    }
    for (let i = 0; i < storesResponse.body.length; i++) {
        const store = storesResponse.body[i];
        stores[i + 1] = store;
    }
    stores[0] = { name: 'Generell' };
    populateStoreSuggestions();
    selectedStoreInput.value = stores[shopdefaultvalues.defaultStoreId].name + '#' + shopdefaultvalues.defaultStoreId;
    await populateShopList();
}

initPage();