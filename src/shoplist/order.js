import * as dbFunction from "./scripts/dbfunctions.js";
import * as functions from "../scripts/functions.js";
import * as config from "./scripts/config.js";

const categoryList = document.getElementById('categoryList');
const orderedList = document.getElementById('orderedList');
let store = {};
let allCategories = [];

let defaultValues = {};
const defaultValuesResponse = await dbFunction.getSingleItem(config.defaultValuesContainer, 0);
if (defaultValuesResponse.status === 200) {
    defaultValues = defaultValuesResponse.body;
}
else {
    defaultValues = { useCatFromMat: false };
}

const foodFromMatvareTblCheckbox = document.getElementById('foodFromMatvareTbl');
foodFromMatvareTblCheckbox.addEventListener('change', async () => {
    defaultValues.useCatFromMat = foodFromMatvareTblCheckbox.checked;
    await dbFunction.updateItem(config.defaultValuesContainer, defaultValues);
    await getLocalCategories();
    if (defaultValues.useCatFromMat) await getExternalCategories();
    await loadCategories();
    await loadOrderedList();
});

async function loadCategories() {
    categoryList.innerHTML = '';
    let availableCategories = [];
    for (let i = 0; i < allCategories.length; i++) {
        let foundInStore = false;
        for (let j = 0; j < store.categories.length; j++) {
            if (allCategories[i].id === store.categories[j].id) {
                foundInStore = true;
                break;
            }
        }
        if (!foundInStore) {
            availableCategories.push(allCategories[i]);
        }
    }
    for (let i = 0; i < availableCategories.length; i++) {
        const category = availableCategories[i];
        const li = document.createElement('li');
        li.textContent = category.name;
        li.setAttribute('data-id', category.id);
        li.addEventListener('click', () => {
            moveToOrdered(category);
        });
        categoryList.appendChild(li);
    }
}

async function loadOrderedList() {
    orderedList.innerHTML = '';
    for (let i = 0; i < store.categories.length; i++) {
        const category = store.categories[i];
        const li = document.createElement('li');
        li.textContent = category.name;
        li.setAttribute('data-id', category.id);
        li.addEventListener('click', () => {
            moveToCategories(category);
        });
        orderedList.appendChild(li);
    };
}

async function moveToOrdered(category) {
    store.categories.push(category);
    const updateResponse = await dbFunction.updateItem(config.storeContainer, store);
    if (updateResponse.status === 200) {
        await loadCategories();
        await loadOrderedList();
    }
    else {
        functions.showMessage('Feil ved oppdatering av Butikk. Feil: ' + updateResponse.body, true, 7000);
        console.log('Feil ved oppdatering av Butikk. Feil: ' + updateResponse.body);
    }
}

async function moveToCategories(category) {
    store.categories = store.categories.filter(catId => catId.id !== category.id);
    const updateResponse = await dbFunction.updateItem(config.storeContainer, store);
    if (updateResponse.status === 200) {
        await loadCategories();
        await loadOrderedList();
    }
    else {
        functions.showMessage('Feil ved oppdatering av Butikk. Feil: ' + updateResponse.body, true, 7000);
        console.log('Feil ved oppdatering av Butikk. Feil: ' + updateResponse.body);
    }
}

async function getLocalCategories() {
    allCategories = [];
    const categoryResponse = await dbFunction.getAllItems(config.categoryContainer);
    if (categoryResponse.status > 204) {
        functions.showMessage('Feil ved lesing av Kategorier. Feil: ' + categoryResponse.body, true, 7000);
        console.log('Feil ved lesing av Kategorier. Feil: ' + categoryResponse.body);
    }
    else if (categoryResponse.status === 200) { 
        allCategories = categoryResponse.body;
    }
}

async function getExternalCategories() {
    const catFromMatResponse = await dbFunction.getFoodCategories();
    if (catFromMatResponse.status !== 200) {
        functions.showMessage('Feil ved lesing av matvarekategorier. Feil: ' + catFromMatResponse.body, true, 7000);
        console.log('Feil ved lesing av matvarekategorier. Feil: ' + catFromMatResponse.body);
    }
    const catFromMat = catFromMatResponse.body || {};
    let newCatId = 0;
    for (let cat in catFromMat) {
        const newCat = {
            id: newCatId.toString(),
            name: catFromMat[cat].name
        }
        allCategories.push(newCat);
        newCatId++;
    }
}

async function initPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const storeId = urlParams.get('storeId');
    const storeResponse = await dbFunction.getSingleItem(config.storeContainer, storeId);
        if (storeResponse.status !== 200) {
            functions.showMessage('Feil ved lesing av Butikk. Feil: ' + storeResponse.body, true, 7000);
            console.log('Feil ved lesing av Butikk. Feil: ' + storeResponse.body);    
        };
    store = storeResponse.body;
    await getLocalCategories();
    if (defaultValues.useCatFromMat) {
        foodFromMatvareTblCheckbox.checked = true;
        await getExternalCategories();
    }
    await loadCategories();
    await loadOrderedList();
}

initPage();