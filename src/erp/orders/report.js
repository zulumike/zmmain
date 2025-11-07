import { getCompany, getCustomer, getOrder, readAllProducts } from "../scripts/dbfunctions.js";
import { loaderOff, loaderOn } from "../../scripts/functions.js";

const urlParams = new URLSearchParams(window.location.search);
const documentId = urlParams.get('id');

let orderData = {};
let customerData = {};
let companyData = {};
let productList = [];
let currentPage = 1;
let totalPages = 1;
let orderLinesAmount = 0;
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
const orderHeader = document.getElementById('orderheader');
const customerName = document.getElementById('customername');
const customerAddress = document.getElementById('customeraddress');
const customerAddress2 = document.getElementById('customeraddress2');
const infoCompanyName = document.getElementById('infocompany');
const companyOrgNr = document.getElementById('orgnr');
const orderDate = document.getElementById('orderdate');
const orderNr = document.getElementById('ordernr');
const invoiceText = document.getElementById('invoicetext');
const orderLinesTHead = document.getElementById('tablehead');
const orderLinesTBody = document.getElementById('orderlines');
const summaryDiv = document.getElementById('summarydiv');
const sumExTax = document.getElementById('sumextax');
const sumTax = document.getElementById('sumtax');
const sumTotal = document.getElementById('sumtotal');
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
    let orderSum = 0;
    if (orderData.orderLines.length > 0) {
        for (let i = 0; i < orderData.orderLines.length; i++) {
            orderSum = orderSum + orderData.orderLines[i].price * orderData.orderLines[i].amount;   
        }
    }
    return orderSum;
}

async function generatePDF() {
    pdf.setProperties({
        title: 'Ordre ' + orderData.id
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
    if (orderLinesAmount > maxLinesOnePage) {
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

    // window.open(pdf.output('bloburl'));
    pdf.save('Ordre ' + orderData.id + '.pdf');
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
    const table2Head = orderLinesTHead.cloneNode(true);
    table2.appendChild(table2Head);
    const table2Body = document.createElement('tbody');
    table2.appendChild(table2Body);
    const summary2Div = summaryDiv.cloneNode(true);
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
    elementPage2.appendChild(footer2Div);
    summary2Div.style.display = 'grid';
    for (let i = iStart; i < orderLinesAmount; i++) {
        const bodyRow = table2Body.insertRow(-1);
        const date = bodyRow.insertCell(0)
        date.innerText = new Date(orderData.orderLines[i].date).toLocaleDateString();
        const product = bodyRow.insertCell(1);
        product.classList = ['leftalign'];
        const selectedProduct = productList.find((element) => element.id == orderData.orderLines[i].product);
        product.innerText = selectedProduct.name;
        const productPrice = bodyRow.insertCell(2);
        productPrice.classList = ['rightalign'];
        productPrice.innerText = orderData.orderLines[i].price.toLocaleString("nb-NO", {minimumFractionDigits: 2});
        const productAmount = bodyRow.insertCell(3);
        productAmount.classList = ['rightalign'];
        productAmount.innerText = orderData.orderLines[i].amount.toLocaleString("nb-NO", {minimumFractionDigits: 2});
        const productUnit = bodyRow.insertCell(4);
        productUnit.classList = ['leftalign'];
        productUnit.innerText = orderData.orderLines[i].unit;
        const productSum = bodyRow.insertCell(5);
        productSum.classList = ['rightalign'];
        productSum.innerText = (orderData.orderLines[i].price * orderData.orderLines[i].amount).toLocaleString("nb-NO", {minimumFractionDigits: 2});
        const lineComment = bodyRow.insertCell(6);
        lineComment.innerText = orderData.orderLines[i].comment;
    }
}

async function initiatePage() {
    loaderOn();
    orderData = await getOrder(documentId);
    customerData = await getCustomer(orderData.customer);
    companyData = await getCompany('1');
    productList = await readAllProducts();
    orderLinesAmount = orderData.orderLines.length;
    summaryDiv.style.display = 'none';
    orderHeader.innerText = 'Ordrenr ' + orderData.id;
    
    customerName.innerText = customerData.name;
    customerAddress.innerText = customerData.address;
    customerAddress2.innerText = customerData.zip + ' ' + customerData.city;
    
    infoCompanyName.innerText = companyData.name;
    companyOrgNr.innerText = companyData.orgnr;
    orderDate.innerText = new Date(orderData.date).toLocaleDateString();
    if (orderData.invorder) orderNr.innerText = orderData.invorder;
    
    invoiceText.innerText = orderData.name;

    const totalTax = 0;
    sumExTax.innerText = calculateInvoice().toLocaleString("nb-NO", {minimumFractionDigits: 2});
    sumTax.innerText = totalTax.toLocaleString("nb-NO", {minimumFractionDigits: 2});
    sumTotal.innerText = calculateInvoice().toLocaleString("nb-NO", {minimumFractionDigits: 2});
    
    footerCompanyInfo.innerText = companyData.name + ' | ' + 
        companyData.address + ' | ' + 
        companyData.zip + ' ' + companyData.city + ' | ' + 
        companyData.email;
    pageNrInfo.innerText = 'Side ' +  currentPage + ' av ' + totalPages;

    for (let i = 0; i < orderData.orderLines.length; i++) {
        const bodyRow = orderLinesTBody.insertRow(-1);
        const date = bodyRow.insertCell(0)
        date.innerText = new Date(orderData.orderLines[i].date).toLocaleDateString();
        const product = bodyRow.insertCell(1);
        product.classList = ['leftalign'];
        const selectedProduct = productList.find((element) => element.id == orderData.orderLines[i].product);
        product.innerText = selectedProduct.name;
        const productPrice = bodyRow.insertCell(2);
        productPrice.classList = ['rightalign'];
        productPrice.innerText = orderData.orderLines[i].price.toLocaleString("nb-NO", {minimumFractionDigits: 2});
        const productAmount = bodyRow.insertCell(3);
        productAmount.classList = ['rightalign'];
        productAmount.innerText = orderData.orderLines[i].amount.toLocaleString("nb-NO", {minimumFractionDigits: 2});
        const productUnit = bodyRow.insertCell(4);
        productUnit.classList = ['leftalign'];
        productUnit.innerText = orderData.orderLines[i].unit;
        const productSum = bodyRow.insertCell(5);
        productSum.classList = ['rightalign'];
        productSum.innerText = (orderData.orderLines[i].price * orderData.orderLines[i].amount).toLocaleString("nb-NO", {minimumFractionDigits: 2});
        const lineComment = bodyRow.insertCell(6);
        lineComment.innerText = orderData.orderLines[i].comment;
        if (i == maxLinesOnePage && (orderLinesAmount - i) < maxLinesLastPage) {
            totalPages = 2;
            const bodyRowLast = orderLinesTBody.insertRow(-1);
            const contText = bodyRowLast.insertCell(0);
            contText.innerText = 'Forts. neste side...'
            initiateLastPage(i, 2);
            break;
        }
    }

    if (orderLinesAmount <= maxLinesOnePage) {
        summaryDiv.style.display = 'grid';
    }
    
    toPdfButton.addEventListener('click', () => {
        generatePDF();
    })
    toMailButton.addEventListener('click', () => {
        alert('Husk å legge ved PDF-filen i e-posten!');
        window.open('mailto:' + customerData.email + '?subject=Ordre ' + orderData.id + '&body=Hei ' + customerData.name + ',%0D%0A%0D%0AHer er din ordre.%0D%0A%0D%0A' + companyData.name + '%0D%0A' + companyData.address + '%0D%0A' + companyData.zip + ' ' + companyData.city);
    })
    loaderOff();
}

initiatePage();
// Promise-based usage:

