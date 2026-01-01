import { getCompany, updateCompany } from "../scripts/dbfunctions.js";
import { loaderOn, loaderOff } from "../../scripts/functions.js";

let companyData = {};

const documentForm = document.getElementById("documentform");
documentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    loaderOn();
    const documentFormData = new FormData(documentForm);
    const documentData = Object.fromEntries(documentFormData);
    documentData.nrSeries = companyData.nrSeries || {};
    documentData.accounts = companyData.accounts || {};
    await updateCompany('1', documentData);
    loaderOff();
    window.location.reload();
});

const nrSeriesForm = document.getElementById("nrSeriesForm");
nrSeriesForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    loaderOn();
    const nrSeriesFormData = new FormData(nrSeriesForm);
    const nrSeriesData = Object.fromEntries(nrSeriesFormData);
    companyData.nrSeries = nrSeriesData;
    companyData.accounts = companyData.accounts || {};
    await updateCompany('1', companyData);
    loaderOff();
    window.location.reload();
});

const newAccountForm = document.getElementById("newAccountForm");
newAccountForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    loaderOn();
    const newAccountFormData = new FormData(newAccountForm);
    const newAccountData = Object.fromEntries(newAccountFormData);
    companyData.accounts = companyData.accounts || [];
    console.log(newAccountData);
    companyData.accounts.push({
        nr: parseInt(newAccountData.accountNr),
        description: newAccountData.accountName
    });
    await updateCompany('1', companyData);
    loaderOff();
    window.location.reload();
});

const newAccountNrInput = document.getElementById("accountNr");
const newAccountNameInput = document.getElementById("accountName");

const accountPlanDiv = document.getElementById("accountPlanDiv");

async function loadCompanyData() {
    loaderOn();
    companyData = await getCompany('1');
    document.getElementById("name").value = companyData.name || '';
    document.getElementById("address").value = companyData.address || '';
    document.getElementById("zip").value = companyData.zip || '';
    document.getElementById("city").value = companyData.city || '';
    document.getElementById("phone").value = companyData.phone || '';
    document.getElementById("email").value = companyData.email || '';
    document.getElementById("orgnr").value = companyData.orgnr || '';
    document.getElementById("bankaccount").value = companyData.bankaccount || '';
    document.getElementById("customer").value = companyData.nrSeries.customer || '';
    document.getElementById("order").value = companyData.nrSeries.order || '';
    document.getElementById("invoice").value = companyData.nrSeries.invoice || '';
    document.getElementById("cost").value = companyData.nrSeries.cost || '';
    companyData.accounts.sort((a, b) => a.nr - b.nr);
    for (let i = 0; i < companyData.accounts.length; i++) {
        const account = companyData.accounts[i];
        const listItem = document.createElement('li');
        listItem.innerText = account.nr.toString() + ' - ' + account.description;
        listItem.classList.add('clickable');
        listItem.addEventListener('click', () => {
            companyData.accounts.splice(i, 1);
            newAccountNrInput.value = account.nr;
            newAccountNameInput.value = account.description;
            accountPlanDiv.removeChild(listItem);
        });
        accountPlanDiv.appendChild(listItem);
    }
    loaderOff();
}

loadCompanyData();