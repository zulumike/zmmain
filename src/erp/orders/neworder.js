import { createOrder, readAllCustomers } from "../scripts/dbfunctions.js";
import { loaderOn, loaderOff } from "../../scripts/functions.js";

async function createCustomerDropdown() {
    loaderOn();
    const customerList = await readAllCustomers();
    const customerSelect = document.getElementById('customer');
    for (let i = 0; i < customerList.length; i++) {
        if (!customerList[i].deleted) {
            const customerOption = document.createElement('option');
            customerOption.textContent = customerList[i].name;
            customerOption.value = customerList[i].id;
            customerSelect.appendChild(customerOption);
        }
    }
    loaderOff();
}




const documentForm = document.getElementById("documentform");
documentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    loaderOn();
    const documentFormData = new FormData(documentForm);
    const documentData = Object.fromEntries(documentFormData);
    documentData.active = true;
    documentData.customer = parseInt(documentData.customer);
    const dbResponse = await createOrder(documentData);
    loaderOff();
    window.location.replace('/erp/orders/editorder.html?id=' + dbResponse.itemId);
});


createCustomerDropdown();
const dateInput = document.getElementById('date');
const today = new Date();
dateInput.valueAsDate = today;

