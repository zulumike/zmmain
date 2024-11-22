import { createProduct } from "../scripts/dbfunctions.js";
import { loaderOn, loaderOff } from "../scripts/functions.js";

const documentForm = document.getElementById("documentform");
documentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    loaderOn();
    const documentFormData = new FormData(documentForm);
    const documentData = Object.fromEntries(documentFormData);
    documentData.price = parseFloat(documentData.price);
    documentData.storage = parseFloat(documentData.storage);
    documentData.account = parseInt(documentData.account);
    if (documentData.active === 'on') {
        documentData.active = true
    } 
    else {
        documentData.active = false;
    };
    if (documentData.webshop === 'on') {
        documentData.active = true
    }
    else {
        documentData.webshop = false;
    };
    console.log(documentData.webshop);
    await createProduct(documentData);
    loaderOff();
    window.location.replace('/products/productlist.html');
})