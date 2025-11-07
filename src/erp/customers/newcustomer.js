import { createCustomer } from "../scripts/dbfunctions.js";
import { loaderOn, loaderOff } from "../../scripts/functions.js";

const documentForm = document.getElementById("documentform");
documentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    loaderOn();
    const documentFormData = new FormData(documentForm);
    const documentData = Object.fromEntries(documentFormData);
    const dbResponse = await createCustomer(documentData);
    loaderOff();
    window.location.replace('/erp/customers/editcustomer.html?id=' + dbResponse.itemId);
})