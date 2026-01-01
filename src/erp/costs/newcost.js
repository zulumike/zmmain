import { createCost } from "../scripts/dbfunctions.js";
import { loaderOn, loaderOff } from "../../scripts/functions.js";

const documentForm = document.getElementById("documentform");
documentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    loaderOn();
    const documentFormData = new FormData(documentForm);
    const documentData = Object.fromEntries(documentFormData);
    documentData.costLines = [];
    documentData.sum = 0;
    const dbResponse = await createCost(documentData);
    loaderOff();
    window.location.replace('/erp/costs/editcost.html?id=' + dbResponse.itemId);
})

const dateInput = document.getElementById('date');
const today = new Date();
dateInput.valueAsDate = today;