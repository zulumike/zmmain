import * as dbFunction from '../shoplist/scripts/dbfunctions.js';
import * as functions from '../scripts/functions.js';
import * as config from './scripts/config.js';


const itemForm = document.getElementById('itemForm');
const itemName = document.getElementById('itemName');
const itemCategory = document.getElementById('itemCatebory');
const shopCartBody = document.getElementById('shopCartBody');
const itemSubmitBtn = document.getElementById('itemSubmitBtn');


async function initPage() {
    const foodsResponse = await dbFunction.getFoods();
    if (foodsResponse.status !== 200) {
        functions.showMessage('Feil ved lesing av matvarer. Feil: ' + foodsResponse.body, true, 7000);
        console.log('Feil ved lesing av matvarer. Feil: ' + foodsResponse.body);
        return;
    }
    const foods = foodsResponse.body;
    const foodCategoriesRespnse = await dbFunction.getFoodCategories();
    if (foodCategoriesRespnse.status !== 200) {
        functions.showMessage('Feil ved lesing av matvarekategorier. Feil: ' + foodCategoriesRespnse.body, true, 7000);
        console.log('Feil ved lesing av matvarekategorier. Feil: ' + foodCategoriesRespnse.body);
        return;
    }
    const foodCategories = foodCategoriesRespnse.body;
    console.log(foods);
    console.log(foodCategories);
}

initPage();