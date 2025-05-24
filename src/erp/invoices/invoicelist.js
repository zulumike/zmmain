import { readAllInvoices, readAllCustomers } from "../scripts/dbfunctions.js";
import { loaderOn, loaderOff } from "../scripts/functions.js";

async function getDocumentList() {
    loaderOn();
    const documentList = await readAllInvoices();
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
            const invoiceDate = newRow.insertCell(0);
            const invoiceNr = newRow.insertCell(1);
            const customerName = newRow.insertCell(2);
            const invoiceName = newRow.insertCell(3);
            const invoiceSum = newRow.insertCell(4);
            const invoiceDueDate = newRow.insertCell(4);
            const invoiceTempDate = new Date(documentList[i].date)
            invoiceDate.innerText = invoiceTempDate.toLocaleDateString();
            invoiceNr.innerText = documentList[i].id;
            for (let y = 0; y < customerList.length; y++) {
                if (documentList[i].customer == customerList[y].id) {
                    customerName.innerText = customerList[y].name;
                }
            }
            invoiceName.innerText = documentList[i].name;
            invoiceSum.innerText = documentList[i].sum.toLocaleString("nb-NO", {minimumFractionDigits: 2});
            const invoiceTempDueDate = new Date(documentList[i].duedate);
            invoiceDueDate.innerText = invoiceTempDueDate.toLocaleDateString();
            newRow.addEventListener('click', () => {
                window.location.href = 'editinvoice.html?id=' + documentList[i].id;
            })
        }
    }
    loaderOff();
}

getDocumentList();