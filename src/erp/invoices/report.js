import { getCompany, getCustomer, getInvoice, getProduct, readAllProducts } from "../scripts/dbfunctions.js";
import { loaderOff, loaderOn } from "../scripts/functions.js";

const urlParams = new URLSearchParams(window.location.search);
const documentId = urlParams.get('id');

let invoiceData = {};
let customerData = {};
let companyData = {};
let productList = [];
let currentPage = 1;
let totalPages = 1;
let invoiceLinesAmount = 0;
const maxLinesOnePage = 25;
const maxLinesLastPage = 25;
// const MaxLinesOtherPages = 35;

const mainElement = document.getElementById('mainelement');
const element = document.getElementById('content');
const elementPage2 = document.createElement('div');
elementPage2.classList = ['grid-container'];
const headerDiv = document.getElementById('headerdiv');
const customerDiv = document.getElementById('customerdiv');
const infoDiv = document.getElementById('infodiv');
const invtextDiv = document.getElementById('invtextdiv');
const invoiceHeader = document.getElementById('invoiceheader');
const customerName = document.getElementById('customername');
const customerAddress = document.getElementById('customeraddress');
const customerAddress2 = document.getElementById('customeraddress2');
const customerPostAddress = document.getElementById('customerpostaddress');
const infoCompanyName = document.getElementById('infocompany');
const companyOrgNr = document.getElementById('orgnr');
const invoiceDate = document.getElementById('invoicedate');
const invoiceDueDate = document.getElementById('invoiceduedate');
const orderNr = document.getElementById('ordernr');
const invoiceText = document.getElementById('invoicetext');
const invoiceLinesTHead = document.getElementById('tablehead');
const invoiceLinesTBody = document.getElementById('invoicelines');
const summaryDiv = document.getElementById('summarydiv');
const sumExTax = document.getElementById('sumextax');
const sumTax = document.getElementById('sumtax');
const sumTotal = document.getElementById('sumtotal');
const paymentDiv = document.getElementById('paymentdiv');
const payBank = document.getElementById('paybank');
const payInvoiceNr = document.getElementById('payinvoicenr');
const payAmount = document.getElementById('payamount');
const payDueDate = document.getElementById('payduedate');
const footerCompanyInfo = document.getElementById('footercompany');
const pageNrInfo = document.getElementById('pagenr');

const toPdfButton = document.getElementById('topdfbtn');
const toMailButton = document.getElementById('tomailbtn');

const pdfOptions = {
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
}

window.jsPDF = window.jspdf.jsPDF;
// window.html2canvas = html2canvas;
const pdf = new jsPDF(pdfOptions);

function calculateInvoice() {
    let invoiceSum = 0;
    if (invoiceData.invoiceLines.length > 0) {
        for (let i = 0; i < invoiceData.invoiceLines.length; i++) {
            invoiceSum = invoiceSum + invoiceData.invoiceLines[i].price * invoiceData.invoiceLines[i].amount;   
        }
    }
    return invoiceSum;
}

async function generatePDF() {
    pdf.setProperties({
        title: 'Faktura ' + invoiceData.id,
    });
    await pdf.html(element, {
        html2canvas: {
            scale: 0.26,
            ingoreElements: function (el) {
                return el.tagName.toLowerCase() === 'h3';
            }
        },
        callback: function (pdf) {
            return pdf;
        }
    });
    if (invoiceLinesAmount > maxLinesOnePage) {
        await pdf.addPage();
        await pdf.html(elementPage2, {
            html2canvas: {
                scale: 0.26
            },
            y: 297,
            callback: function (pdf) {
                return pdf;
            }
        })
    }

    pdf.save('Faktura ' + invoiceData.id + '.pdf');
}

async function initiateLastPage(iStart, pageNr) {
    mainElement.appendChild(elementPage2);
    const header2Div = headerDiv.cloneNode(true);
    const customer2Div = customerDiv.cloneNode(true);
    const info2Div = infoDiv.cloneNode(true);
    const invtext2Div = invtextDiv.cloneNode(true);
    const table2Div = document.createElement('div');
    table2Div.classList = ['grid-table'];
    const table2 = document.createElement('table');
    table2Div.appendChild(table2);
    const table2Head = invoiceLinesTHead.cloneNode(true);
    table2.appendChild(table2Head);
    const table2Body = document.createElement('tbody');
    table2.appendChild(table2Body);
    const summary2Div = summaryDiv.cloneNode(true);
    const payment2Div = paymentDiv.cloneNode(true);
    const footer2Div = document.createElement('div');
    footer2Div.classList = ['grid-footer'];
    const footerCompanyInfo2 = footerCompanyInfo.cloneNode(true);
    footer2Div.appendChild(footerCompanyInfo2);
    const pageNrInfo2 = document.createElement('h5');
    pageNrInfo2.classList = ['rightalign'];
    pageNrInfo2.innerText = 'Side ' + pageNr + ' av ' + totalPages;
    footer2Div.appendChild(pageNrInfo2);
    elementPage2.appendChild(header2Div);
    elementPage2.appendChild(customer2Div);
    elementPage2.appendChild(info2Div);
    elementPage2.appendChild(invtext2Div);
    elementPage2.appendChild(table2Div);
    elementPage2.appendChild(summary2Div);
    elementPage2.appendChild(payment2Div);
    elementPage2.appendChild(footer2Div);
    summary2Div.style.display = 'grid';
    payment2Div.style.display = 'grid';
    for (let i = iStart; i < invoiceLinesAmount; i++) {
        const bodyRow = table2Body.insertRow(-1);
        const date = bodyRow.insertCell(0)
        date.innerText = new Date(invoiceData.invoiceLines[i].date).toLocaleDateString();
        const product = bodyRow.insertCell(1);
        product.classList = ['leftalign'];
        const selectedProduct = productList.find((element) => element.id == invoiceData.invoiceLines[i].product);
        product.innerText = selectedProduct.name;
        const productPrice = bodyRow.insertCell(2);
        productPrice.classList = ['rightalign'];
        productPrice.innerText = invoiceData.invoiceLines[i].price.toLocaleString("nb-NO", {minimumFractionDigits: 2});
        const productAmount = bodyRow.insertCell(3);
        productAmount.classList = ['rightalign'];
        productAmount.innerText = invoiceData.invoiceLines[i].amount.toLocaleString("nb-NO", {minimumFractionDigits: 2});
        const productUnit = bodyRow.insertCell(4);
        productUnit.classList = ['leftalign'];
        productUnit.innerText = invoiceData.invoiceLines[i].unit;
        const productSum = bodyRow.insertCell(5);
        productSum.classList = ['rightalign'];
        productSum.innerText = (invoiceData.invoiceLines[i].price * invoiceData.invoiceLines[i].amount).toLocaleString("nb-NO", {minimumFractionDigits: 2});
    }
}

async function initiatePage() {
    loaderOn();
    invoiceData = await getInvoice(documentId);
    customerData = await getCustomer(invoiceData.customer);
    companyData = await getCompany('1');
    productList = await readAllProducts();
    invoiceLinesAmount = invoiceData.invoiceLines.length;
    summaryDiv.style.display = 'none';
    paymentDiv.style.display = 'none';
    invoiceHeader.innerText = 'Fakturanr ' + invoiceData.id;
    
    customerName.innerText = customerData.name;
    customerAddress.innerText = customerData.address;
    customerAddress2.innerText = customerData.address2;
    customerPostAddress.innerText = customerData.zip + ' ' + customerData.city;
    
    infoCompanyName.innerText = companyData.name;
    companyOrgNr.innerText = companyData.orgnr;
    invoiceDate.innerText = new Date(invoiceData.date).toLocaleDateString();
    invoiceDueDate.innerText = new Date(invoiceData.duedate).toLocaleDateString();
    if (invoiceData.invorder) orderNr.innerText = invoiceData.invorder;
    
    invoiceText.innerText = invoiceData.name;

    const totalTax = 0;
    sumExTax.innerText = calculateInvoice().toLocaleString("nb-NO", {minimumFractionDigits: 2});
    sumTax.innerText = totalTax.toLocaleString("nb-NO", {minimumFractionDigits: 2});
    sumTotal.innerText = calculateInvoice().toLocaleString("nb-NO", {minimumFractionDigits: 2});
    payBank.innerText = companyData.bankaccount;
    payInvoiceNr.innerText = invoiceData.id;
    payAmount.innerText = calculateInvoice().toLocaleString("nb-NO", {minimumFractionDigits: 2});
    payDueDate.innerText = invoiceDueDate.innerText;

    footerCompanyInfo.innerText = companyData.name + ' | ' + 
        companyData.address + ' | ' + 
        companyData.zip + ' ' + companyData.city + ' | ' + 
        companyData.email;
    pageNrInfo.innerText = 'Side ' +  currentPage + ' av ' + totalPages;

    for (let i = 0; i < invoiceData.invoiceLines.length; i++) {
        const bodyRow = invoiceLinesTBody.insertRow(-1);
        const date = bodyRow.insertCell(0)
        date.innerText = new Date(invoiceData.invoiceLines[i].date).toLocaleDateString();
        const product = bodyRow.insertCell(1);
        product.classList = ['leftalign'];
        const selectedProduct = productList.find((element) => element.id == invoiceData.invoiceLines[i].product);
        product.innerText = selectedProduct.name;
        const productPrice = bodyRow.insertCell(2);
        productPrice.classList = ['rightalign'];
        productPrice.innerText = invoiceData.invoiceLines[i].price.toLocaleString("nb-NO", {minimumFractionDigits: 2});
        const productAmount = bodyRow.insertCell(3);
        productAmount.classList = ['rightalign'];
        productAmount.innerText = invoiceData.invoiceLines[i].amount.toLocaleString("nb-NO", {minimumFractionDigits: 2});
        const productUnit = bodyRow.insertCell(4);
        productUnit.classList = ['leftalign'];
        productUnit.innerText = invoiceData.invoiceLines[i].unit;
        const productSum = bodyRow.insertCell(5);
        productSum.classList = ['rightalign'];
        productSum.innerText = (invoiceData.invoiceLines[i].price * invoiceData.invoiceLines[i].amount).toLocaleString("nb-NO", {minimumFractionDigits: 2});
        if (i == maxLinesOnePage && (invoiceLinesAmount - i) < maxLinesLastPage) {
            totalPages = 2;
            const bodyRowLast = invoiceLinesTBody.insertRow(-1);
            const contText = bodyRowLast.insertCell(0);
            contText.innerText = 'Forts. neste side...'
            initiateLastPage(i, 2);
            break;
        }
    }

    if (invoiceLinesAmount <= maxLinesOnePage) {
        summaryDiv.style.display = 'grid';
        paymentDiv.style.display = 'grid';
    }
    
    toPdfButton.addEventListener('click', () => {
        generatePDF();
    });

    toMailButton.addEventListener('click', () => {
        alert('Husk å legge ved fakturaen som PDF!');
        window.open('mailto:' + customerData.email + '?subject=Faktura ' + invoiceData.id + '&body=Hei, vedlagt faktura ' + invoiceData.id + '.%0D%0A%0D%0A' + companyData.name + '%0D%0A' + companyData.address + '%0D%0A' + companyData.zip + ' ' + companyData.city);
    });

    loaderOff();
}

initiatePage();
// Promise-based usage:

