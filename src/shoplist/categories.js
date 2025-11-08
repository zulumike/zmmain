
import * as functions from '../scripts/functions.js';
import * as config from './scripts/config.js';
import * as dbFunction from "./scripts/dbfunctions.js";
// import { addSingleItem } from './scripts/dbfunctions.js';


const itemSubmitBtn = document.getElementById('itemSubmitBtn');
const categoryForm = document.getElementById('categoryForm');
const categoriesBody = document.getElementById('categoriesBody');

categoryForm.addEventListener('submit', function(e) {
    e.preventDefault();
    saveCategory();
});

async function saveCategory() {
    const formData = new FormData(categoryForm, itemSubmitBtn);
    const newCategory = Object.fromEntries(formData.entries());
    const allItemResponse = await dbFunction.getAllItems(config.shopContainer);
    let existingItems = [];
    if (allItemResponse.status === 200 || allItemResponse.status === 204) {
        existingItems = allItemResponse.body;
        let itemExist = false;
        if (allItemResponse.status !== 204) {
            for (let i = 0; i < existingItems.length; i++) {
                const existingItem = existingItems[i];
                if (existingItem.name.toLowerCase() === newCategory.name.toLowerCase()) {
                    itemExist = true;
                    console.log(itemExist);
                    break;
                } 
            }
        }
        if (!itemExist) {
            const response = await dbFunction.addSingleItem(config.shopContainer, newCategory);
            if (response.status === 200) {
                functions.showMessage('Kategori ' + newCategory.name + ' lagt til', false);
            }
            else {
                functions.showMessage('Feil ved lagring. Feil: ' + response.body, true, 7000);
                console.log(response);
            }
        }
        else {
            functions.showMessage('Kategori eksisterer fra før');
        }
    }
    else {
        functions.showMessage('Feil ved lesing av kategorier. Feil: ' + allItemResponse.body, true, 7000);
        console.log(allItemResponse);
    }
    categoryForm.reset();
    await showCategories();
}

async function deleteCategory(categoryId) {
    const response = await dbFunction.deleteItem(config.shopContainer, categoryId);
    if (response.status === 200) {
        functions.showMessage('Kategori slettet');
    }
    else {
        functions.showMessage('Feil ved sletting av kategori! ' + response.body, true, 7000);
        console.log(response);
    }
    await showCategories();
}

async function showCategories(){
    categoriesBody.innerHTML = '';
    const allItemsResponse = await dbFunction.getAllItems(config.shopContainer);
    let allItems = [];
    if (allItemsResponse.status === 200) {
        allItems = allItemsResponse.body;
        for (let i = 0; i < allItems.length; i++) {
            const tBodyRow = categoriesBody.insertRow();
            const cellName = tBodyRow.insertCell();
            const cellDelete = document.createElement('img');
            cellName.textContent = allItems[i].name;
            cellDelete.classList.add('delsymbol');
            cellDelete.setAttribute('src', '../assets/img/trash.svg');
            cellDelete.setAttribute('type', 'image/svg+xml');
            cellDelete.addEventListener('click', event => {
                deleteCategory(allItems[i].id);
            });
            tBodyRow.appendChild(cellDelete);
        }
    }
    else if (allItemsResponse.status = 204) {
        functions.showMessage('Det finnes ingen kategorier enda');
    }
    else {
        console.log(allItemsResponse);
        functions.showMessage('Feil ved lesing av kategorier. Feil: ' + allItemsResponse.body);
    }
}

showCategories();