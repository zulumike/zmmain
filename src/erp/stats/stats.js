import { readAllCosts, getCompany } from "../scripts/dbfunctions.js";
import { loaderOn, loaderOff } from "../../scripts/functions.js";

const statYearInput = document.getElementById("statYear");
const statYearList = document.getElementById('statYears');
statYearInput.addEventListener('dblclick', () => {
    statYearInput.value = '';
});
statYearInput.addEventListener('change', async () => {
    await loadStats();
});

const salesDiv = document.getElementById("salesDiv");
const costsDiv = document.getElementById("costsDiv");
const profitDiv = document.getElementById("profitDiv");

async function makeAccountsObject() {
    const accountsData ={};
    const companyData = await getCompany('1');
    const accountList = companyData.accounts;
    for (let i = 0; i < accountList.length; i++) {
        const account = accountList[i];
        const data = {
            description: account.description,
            sum: 0
        }
        accountsData[account.nr] = data;
    }
    return accountsData;
}

async function loadStats() {
    loaderOn();
    const accountsData = await makeAccountsObject();
    const documentList = await readAllCosts();
    let salesSum = 0;
    let costSum = 0;
    let profitSum = 0;
    for (let i = 0; i < documentList.length; i++) {
        const doc = documentList[i];
        if (doc.deleted) continue;
        for (let j = 0; j < doc.costLines.length; j++) {
            const costLine = doc.costLines[j];
            const costYear = new Date(costLine.date).getFullYear();
            if (costYear === parseInt(statYearInput.value)) {
                // Process sales, costs, and profit here
                if (accountsData[costLine.account]) {
                    accountsData[costLine.account].sum += costLine.price;
                    if (costLine.account >= 3000 && costLine.account < 4000) {
                        salesSum += costLine.price;
                    } else if (costLine.account >= 4000 && costLine.account < 9000) {
                        costSum += costLine.price;
                    }
                }
            }
        }
    }
    profitSum = salesSum - costSum;
    accountsData.salesSum = salesSum;
    accountsData.costSum = costSum;
    accountsData.profitSum = profitSum;
    presentStats(accountsData);
    loaderOff();
}

function presentStats(accountsData) {
    // Clear previous stats
    salesDiv.innerHTML = '';
    costsDiv.innerHTML = '';
    profitDiv.innerHTML = '';
    // Present new stats
    const salesH2 = document.createElement('h2');
    salesH2.innerText = 'Omsetning: ' + accountsData.salesSum.toLocaleString('no-NO') + ' kr';
    salesDiv.appendChild(salesH2);
    const costsH2 = document.createElement('h2');
    costsH2.innerText = 'Kostnader: ' + accountsData.costSum.toLocaleString('no-NO') + ' kr';
    costsDiv.appendChild(costsH2);
    for (const [accountNr, accountData] of Object.entries(accountsData)) {
        if (accountNr >= 3000 && accountNr < 4000 && accountData.sum !==0) {
            // Sales account
            const p = document.createElement('p');
            p.innerText = `Konto ${accountNr} - ${accountData.description}: ${accountData.sum.toLocaleString('no-NO')} kr`;
            salesDiv.appendChild(p);
        } else if (accountNr >= 4000 && accountNr < 9000 && accountData.sum !==0) {
            // Cost account
            const p = document.createElement('p');
            p.innerText = `Konto ${accountNr} - ${accountData.description}: ${accountData.sum.toLocaleString('no-NO')} kr`;
            costsDiv.appendChild(p);
        }
    }
    const profitH2 = document.createElement('h2');
    profitH2.innerText = 'Resultat: ' + accountsData.profitSum.toLocaleString('no-NO');
    profitDiv.appendChild(profitH2);
}

const dateToday = new Date();
const currentYear = dateToday.getFullYear();
for (let i = 0; i < 5; i++) {
    const option = document.createElement('option');
    option.value = currentYear - i;
    statYearList.appendChild(option);
}
const currentMonth = dateToday.getMonth();
if (currentMonth > 1) {
    statYearInput.value = currentYear;
}
else {
    statYearInput.value = currentYear - 1;
}
loadStats();