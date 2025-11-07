import { readAllOrders, readAllCustomers } from "../scripts/dbfunctions.js";
import { loaderOn, loaderOff } from "../../scripts/functions.js";

async function getDocumentList() {
    loaderOn();
    const documentList = await readAllOrders();
    documentList.sort((a, b) => {
        const valueA = parseInt(a.id);
        const valueB = parseInt(b.id);
        if (valueA > valueB) {
            return -1;
        }
        if (valueA < valueB) {
            return 1;
        }

        // names must be equal
        return 0;
    });
    const customerList = await readAllCustomers();
    const table = document.getElementById("table-body");
    for (let i = 0; i < documentList.length; i++) {
        if (!documentList[i].deleted) {
            const newRow = table.insertRow(-1);
            const orderNr = newRow.insertCell(0);
            const customerName = newRow.insertCell(1);
            const orderName = newRow.insertCell(2);
            const orderSum = newRow.insertCell(3);
            orderNr.innerText = documentList[i].id;
            for (let y = 0; y < customerList.length; y++) {
                if (documentList[i].customer == customerList[y].id) {
                    customerName.innerText = customerList[y].name;
                }
            }
            orderName.innerText = documentList[i].name;
            orderSum.innerText = documentList[i].sum.toLocaleString("nb-NO", {minimumFractionDigits: 2});
            newRow.addEventListener('click', () => {
                window.location.href = 'editorder.html?id=' + documentList[i].id;
            })
        }
    }
    loaderOff();
}

getDocumentList();