import { readAllCosts } from "../scripts/dbfunctions.js";
import { loaderOn, loaderOff } from "../scripts/functions.js";

async function getDocumentList() {
    loaderOn();
    const documentList = await readAllCosts();
    const table = document.getElementById("table-body");
    for (let i = 0; i < documentList.length; i++) {
        if (!documentList[i].deleted) {
            const newRow = table.insertRow(-1);
            const costNr = newRow.insertCell(0);
            const costDate = newRow.insertCell(1);
            const costDescription = newRow.insertCell(2);
            const costSum = newRow.insertCell(3);
            costNr.innerText = documentList[i].id;
            costDate.innerText = documentList[i].date;
            costDescription.innerText = documentList[i].description;
            costSum.innerText = documentList[i].sum.toLocaleString("nb-NO", {minimumFractionDigits: 2});
            newRow.addEventListener('click', () => {
                window.location.href = 'editcost.html?id=' + documentList[i].id;
            })
        }
    }
    loaderOff();
}

getDocumentList();