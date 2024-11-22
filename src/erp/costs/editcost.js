import { updateCost, getCost, deleteCost, getCompany } from "../scripts/dbfunctions.js";
import { loaderOn, loaderOff } from "../scripts/functions.js";

let costData = {};
let accountList = [];

const documentForm = document.getElementById("documentform");
documentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    loaderOn();
    const documentFormData = new FormData(documentForm);
    const documentData = Object.fromEntries(documentFormData);
    documentData.costLines = costData.costLines;
    documentData.sum = calculateCost();
    await updateCost(documentId, documentData);
    loaderOff();
    window.location.replace('/costs/costlist.html');
})

function calculateCost() {
    let costSum = 0;
    if (costData.costLines.length > 0) {
        for (let i = 0; i < costData.costLines.length; i++) {
            costSum = costSum + costData.costLines[i].price;   
        }
    }
    return costSum;
}

function presentcostLines() {
    const existingTable = document.getElementById('costlinetable');
    if (existingTable != null) {
        existingTable.remove();
    }
    const costLineDiv = document.getElementById('costlinediv');
    const clTable = document.createElement('table');
    clTable.classList = ['list-table'];
    clTable.id = 'costlinetable';
    const tableHeading = document.createElement('thead');
    const tableBody = document.createElement('tbody');
    clTable.appendChild(tableHeading);    
    clTable.appendChild(tableBody);    
    costLineDiv.appendChild(clTable);
    const headingRow = tableHeading.insertRow(0);
    const hCell1 = headingRow.insertCell(0);
    hCell1.innerText = 'Dato:';
    const hCell2 = headingRow.insertCell(1);
    hCell2.innerText = 'Konto:';
    const hCell3 = headingRow.insertCell(2);
    hCell3.innerText = 'Pris:';
    const hCell4 = headingRow.insertCell(3);
    hCell4.innerText = 'Beskrivelse:';
    for (let i = 0; i < costData.costLines.length; i++) {
        const bodyRow = tableBody.insertRow(-1);
        const date = bodyRow.insertCell(0);
        const account = bodyRow.insertCell(1);
        const price = bodyRow.insertCell(2);
        const description = bodyRow.insertCell(3);
        const clDate = new Date(costData.costLines[i].date);
        date.innerText = clDate.toLocaleDateString();
        account.innerText = costData.costLines[i].account;
        price.innerText = costData.costLines[i].price.toLocaleString("nb-NO", {minimumFractionDigits: 2});
        description.innerText = costData.costLines[i].description;
        bodyRow.addEventListener('click', () => {
            populatecostLineForm(costData.costLines[i]);
            costData.costLines.splice(i, 1);
            presentcostLines();
        });
    }
    const costSumText = document.getElementById('costsumtext');
    costSumText.innerText = 'Bilagsum: ' + calculateCost().toLocaleString("nb-NO", {minimumFractionDigits: 2});
    const costToInvoiceBtnDiv = document.getElementById('costtoinvoicebtn');
    const costToInvoiceBtn = document.createElement('input');
    costToInvoiceBtn.type = 'button';
    costToInvoiceBtn.value = 'Fordel til faktura';
    costToInvoiceBtn.addEventListener('click', () => {
        window.location.href = 'costtoinvoice.html?id=' + costData.id + '&sum=' + costData.sum;
    });
    costToInvoiceBtnDiv.appendChild(costToInvoiceBtn);
}
function addCostLine(event, costLineForm) {
    event.preventDefault();
    const costLineFormData = new FormData(costLineForm);
    const costLineData = Object.fromEntries(costLineFormData);
    costLineData.account = parseInt(costLineData.account);
    costLineData.price = Number(costLineData.price);
    costData.costLines.push(costLineData);
    presentcostLines();
}

async function costLineForm() {
    const companyData = await getCompany('1');
    accountList = companyData.accounts;
    const costLineForm = document.getElementById('costlineform');
    const dateDiv = document.createElement('div');
    const dateLabel = document.createElement('label');
    dateLabel.for = 'date';
    dateLabel.innerText = 'Dato';
    const emptyCLDate = document.createElement('input');
    emptyCLDate.type = 'date';
    emptyCLDate.id = 'cldate';
    emptyCLDate.name = 'date';
    const today = new Date();
    emptyCLDate.valueAsDate = today;
    dateDiv.appendChild(dateLabel);
    dateDiv.appendChild(emptyCLDate);

    const accountDiv = document.createElement('div');
    const accountIdLabel = document.createElement('label');
    accountIdLabel.for = 'accountid';
    accountIdLabel.innerText = 'Konto';
    const emptyCLAccountId = document.createElement('select');
    emptyCLAccountId.id = 'claccountid';
    emptyCLAccountId.name = 'account';
    const blankAccount = document.createElement('option');
    blankAccount.textContent = 'Velg konto';
    emptyCLAccountId.appendChild(blankAccount);
    for (let i = 0; i < accountList.length; i++) {
        const accountOption = document.createElement('option');
        accountOption.textContent = accountList[i].nr.toString() + '-' + accountList[i].description;
        accountOption.value = accountList[i].nr;
        accountOption.id = accountList[i].nr;
        emptyCLAccountId.appendChild(accountOption);
    }
    accountDiv.appendChild(accountIdLabel);
    accountDiv.appendChild(emptyCLAccountId);

    const priceDiv = document.createElement('div');
    const priceLabel = document.createElement('label');
    priceLabel.for = 'clprice';
    priceLabel.innerText = 'Pris';
    const emptyCLPrice = document.createElement('input');
    emptyCLPrice.type = 'number';
    emptyCLPrice.id = 'clprice';
    emptyCLPrice.name = 'price';
    emptyCLPrice.step = '0.01';
    priceDiv.appendChild(priceLabel);
    priceDiv.appendChild(emptyCLPrice);

    const descriptionDiv = document.createElement('div');
    const descriptionLabel = document.createElement('label');
    descriptionLabel.for = 'cldescription';
    descriptionLabel.innerText = 'Beskrivelse';
    const emptyCLDescription = document.createElement('input');
    emptyCLDescription.type = 'text';
    emptyCLDescription.id = 'cldescription';
    emptyCLDescription.name = 'description';
    descriptionDiv.appendChild(descriptionLabel);
    descriptionDiv.appendChild(emptyCLDescription);

    const submitCostLine = document.createElement('input');
    submitCostLine.type = 'submit';
    submitCostLine.value = 'Legg til';
    
    costLineForm.addEventListener('submit', (event) => {
        addCostLine(event, costLineForm);
        costLineForm.reset();
        emptyCLDate.valueAsDate = today;
    })

    const resetcostLineForm = document.createElement('input');
    resetcostLineForm.type = 'reset';
    
    costLineForm.appendChild(dateDiv);
    costLineForm.appendChild(accountDiv);
    costLineForm.appendChild(priceDiv);
    costLineForm.appendChild(descriptionDiv);
    costLineForm.appendChild(submitCostLine);
    costLineForm.appendChild(resetcostLineForm);
}

function populatecostLineForm(costLineData) {
    document.getElementById('cldate').value = costLineData.date;
    document.getElementById(costLineData.account).selected = true;
    document.getElementById('clprice').value = costLineData.price;
    document.getElementById('cldescription').value = costLineData.description;
}

async function populatedocumentForm(documentId) {
    loaderOn();
    costData = await getCost(documentId)
    document.getElementById('formheading').textContent = 'Bilagsnr: ' + costData.id;
    document.getElementById('date').value = costData.date;
    document.getElementById('description').value = costData.description;
    const createdText = document.getElementById('created-text');
    const updatedText = document.getElementById('updated-text');
    const createdTime = new Date(costData.created);
    createdText.textContent = 'Opprettet: ' + createdTime.toLocaleString() +
        ' av ' + costData.created_by;
    if (costData.updated != null) {
        const updatedTime = new Date(costData.updated);
        updatedText.textContent = 'Sist oppdatert: ' + updatedTime.toLocaleString() + 
            ' av ' + costData.updated_by;
    }
    else {
        updatedText.remove();
    }
    await costLineForm();
    if (costData.costLines.length > 0) {
        presentcostLines();
    }
  
    loaderOff();
}

async function deleteDocumentById() {
    if (confirm('Er du sikker på at du vil slette bilaget?')) {
        loaderOn();
        await deleteCost(documentId);
        loaderOff();
        window.location.replace('/costs/costlist.html');
    }
}

const urlParams = new URLSearchParams(window.location.search);
const documentId = urlParams.get('id');
populatedocumentForm(documentId);
document.getElementById('delBtn').addEventListener('click', deleteDocumentById);