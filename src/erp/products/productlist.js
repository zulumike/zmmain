import { readAllProducts } from "../scripts/dbfunctions.js";
import { loaderOn, loaderOff } from "../scripts/functions.js";

async function getDocumentList() {
    loaderOn();
    const documentList = await readAllProducts();
    documentList.sort((a, b) => {
        const valueA = a.id.toUpperCase();
        const valueB = b.id.toUpperCase();
        if (valueA < valueB) {
            return -1;
        }
        if (valueA > valueB) {
            return 1;
        }

        // names must be equal
        return 0;
    });
    const table = document.getElementById("table-body");
    for (let i = 0; i < documentList.length; i++) {
        if (!documentList[i].deleted) {
            const newRow = table.insertRow(-1);
            const productNr = newRow.insertCell(0);
            const productName = newRow.insertCell(1);
            const productPrice = newRow.insertCell(2);
            productNr.innerText = documentList[i].id;
            productName.innerText = documentList[i].name;
            productPrice.innerText = documentList[i].price;
            newRow.addEventListener('click', () => {
                window.location.href = 'editproduct.html?id=' + documentList[i].id;
            })
        }
    }
    loaderOff();
}

getDocumentList();