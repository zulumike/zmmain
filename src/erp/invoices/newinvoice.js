import { createInvoice, readAllCustomers } from "../scripts/dbfunctions.js";
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
    documentData.costed = false;
    documentData.invorder = 0;
    documentData.invcost = 0;
    documentData.invoiceLines = [];
    documentData.sum = 0;
    documentData.customer = parseInt(documentData.customer);
    await createInvoice(documentData);
    loaderOff();
    window.location.replace('/invoices/invoicelist.html');
});


createCustomerDropdown();
const dateInput = document.getElementById('date');
const dueDateInput = document.getElementById('duedate');
const today = new Date();
const dueDate = new Date(today);
dueDate.setDate(today.getDate() + 14);
dateInput.valueAsDate = today;
dueDateInput.valueAsDate = dueDate;

