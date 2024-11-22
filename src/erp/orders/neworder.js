import { createOrder, readAllCustomers } from "../scripts/dbfunctions.js";
import { loaderOn, loaderOff } from "../scripts/functions.js";

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
    await createOrder(documentData);
    loaderOff();
    window.location.replace('/orders/orderlist.html');
});


createCustomerDropdown();
const dateInput = document.getElementById('date');
const today = new Date();
dateInput.valueAsDate = today;

