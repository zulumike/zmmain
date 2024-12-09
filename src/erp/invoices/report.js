import { getCompany, getCustomer, getInvoice } from "../scripts/dbfunctions.js";
import { loaderOff, loaderOn } from "../scripts/functions.js";

const urlParams = new URLSearchParams(window.location.search);
const documentId = urlParams.get('id');

let invoiceData = {};
let customerData = {};
let companyData = {};

const invoiceHeader = document.getElementById('invoiceheader');
const customerNr = document.getElementById('customernr');
const customerName = document.getElementById('customername');
const customerAddress = document.getElementById('customeraddress');
const customerAddress2 = document.getElementById('customeraddress2');
const invoiceText = document.getElementById('invoicetext');
const invoiceDate = document.getElementById('invoicedate');
const invoiceDueDate = document.getElementById('invoiceduedate');
const orderNr = document.getElementById('ordernr');
const payBank = document.getElementById('paybank');
const payInvoiceNr = document.getElementById('payinvoicenr');
const payAmount = document.getElementById('payamount');
const payDueDate = document.getElementById('payduedate');

const toPdfButton = document.getElementById('topdfbtn');
const element = document.getElementById('content');
const options = {
    margin: 1,
    filename: 'my-document.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'A4', orientation: 'portrait' }
};

function calculateInvoice() {
    let invoiceSum = 0;
    if (invoiceData.invoiceLines.length > 0) {
        for (let i = 0; i < invoiceData.invoiceLines.length; i++) {
            invoiceSum = invoiceSum + invoiceData.invoiceLines[i].price * invoiceData.invoiceLines[i].amount;   
        }
    }
    return invoiceSum;
}

async function initiatePage() {
    loaderOn();
    invoiceData = await getInvoice(documentId);
    customerData = await getCustomer(invoiceData.customer);
    companyData = await getCompany('1');
    invoiceHeader.innerText = 'Fakturanr ' + invoiceData.id;
    // customerNr.innerText = 'Kundenr ' + customerData.id;
    customerName.innerText = customerData.name;
    customerAddress.innerText = customerData.address;
    customerAddress2.innerText = customerData.zip + ' ' + customerData.city;
    invoiceText.innerText = invoiceData.name;
    invoiceDate.innerText = new Date(invoiceData.date).toLocaleDateString();
    invoiceDueDate.innerText = new Date(invoiceData.duedate).toLocaleDateString();
    orderNr.innerText = invoiceData.invorder;
    payBank.innerText = companyData.bankaccount;
    payInvoiceNr.innerText = invoiceData.id;
    payAmount.innerText = calculateInvoice().toLocaleString("nb-NO", {minimumFractionDigits: 2});
    payDueDate.innerText = invoiceDate.innerText;
    toPdfButton.addEventListener('click', () => {
        html2pdf().set(options).from(element).save();
    })
    loaderOff();
}

initiatePage();
// Promise-based usage:

