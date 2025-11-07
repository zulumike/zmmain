import { readAllCustomers } from "../scripts/dbfunctions.js";
import { loaderOn, loaderOff } from "../../scripts/functions.js";

async function getDocumentList() {
    loaderOn();
    const documentList = await readAllCustomers();
    documentList.sort((a, b) => {
        const valueA = a.name.toUpperCase();
        const valueB = b.name.toUpperCase();
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
            const custNr = newRow.insertCell(0);
            const custName = newRow.insertCell(1);
            const custCity = newRow.insertCell(2);
            custNr.innerText = documentList[i].id;
            custName.innerText = documentList[i].name;
            custCity.innerText = documentList[i].city;
            newRow.addEventListener('click', () => {
                window.location.href = 'editcustomer.html?id=' + documentList[i].id;
            })
        }
    }
    loaderOff();
}

getDocumentList();