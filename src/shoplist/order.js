import * as dbFunction from "./scripts/dbfunctions.js";
import * as functions from "../scripts/functions.js";
import * as config from "./scripts/config.js";

const categoryList = document.getElementById('categoryList');
const orderedList = document.getElementById('orderedList');

async function loadCategories() {
    categoryList.innerHTML = '';

    let availableCategories = allCategories.filter(cat => !store.categories.includes(cat.id));
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
        const categoryId = store.categories[i];
        const category = allCategories.find(cat => cat.id === categoryId);
        if (category) {
            const li = document.createElement('li');
            li.textContent = category.name;
            li.setAttribute('data-id', category.id);
            li.addEventListener('click', () => {
                moveToCategories(category);
            });
            orderedList.appendChild(li);
        };
    };
}

async function moveToOrdered(category) {
    store.categories.push(category.id);
    const updateResponse = await dbFunction.updateItem(config.storeContainer, store);
    console.log(updateResponse);
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



    // const storeResponse = await dbFunction.getSingleItem(config.storeContainer, storeId);
    // if (storeResponse.status !== 200) {
    //     functions.showMessage('Feil ved lesing av Butikk. Feil: ' + storeResponse.body, true, 7000);
    //     console.log('Feil ved lesing av Butikk. Feil: ' + storeResponse.body);
    //     return;
    // };
    // const store = storeResponse.body;
    const index = store.categories.indexOf(category.id);
    if (index > -1) {
        store.categories.splice(index, 1);
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
}

// const currentUrl = window.location.href;
const urlParams = new URLSearchParams(window.location.search);
const storeId = urlParams.get('storeId');
const storeResponse = await dbFunction.getSingleItem(config.storeContainer, storeId);
    if (storeResponse.status !== 200) {
        functions.showMessage('Feil ved lesing av Butikk. Feil: ' + storeResponse.body, true, 7000);
        console.log('Feil ved lesing av Butikk. Feil: ' + storeResponse.body);    
    };
const store = storeResponse.body;

const categoryResponse = await dbFunction.getAllItems(config.categoryContainer);
if (categoryResponse.status !== 200) {
    functions.showMessage('Feil ved lesing av Kategorier. Feil: ' + categoryResponse.body, true, 7000);
    console.log('Feil ved lesing av Kategorier. Feil: ' + categoryResponse.body);
};
const allCategories = categoryResponse.body;

loadCategories();
loadOrderedList();