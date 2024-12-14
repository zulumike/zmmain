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

const invoiceHeader = document.getElementById('invoiceheader');
const customerName = document.getElementById('customername');
const customerAddress = document.getElementById('customeraddress');
const customerAddress2 = document.getElementById('customeraddress2');
const infoCompanyName = document.getElementById('infocompany');
const companyOrgNr = document.getElementById('orgnr');
const invoiceDate = document.getElementById('invoicedate');
const invoiceDueDate = document.getElementById('invoiceduedate');
const orderNr = document.getElementById('ordernr');
const invoiceText = document.getElementById('invoicetext');
const invoiceLinesTBody = document.getElementById('invoicelines');
const payBank = document.getElementById('paybank');
const payInvoiceNr = document.getElementById('payinvoicenr');
const payAmount = document.getElementById('payamount');
const payDueDate = document.getElementById('payduedate');
const footerCompanyInfo = document.getElementById('footercompany');
const pageNrInfo = document.getElementById('pagenr');

const toPdfButton = document.getElementById('topdfbtn');
const element = document.getElementById('content');

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

async function initiatePage() {
    loaderOn();
    invoiceData = await getInvoice(documentId);
    customerData = await getCustomer(invoiceData.customer);
    companyData = await getCompany('1');
    productList = await readAllProducts();
    invoiceHeader.innerText = 'Fakturanr ' + invoiceData.id;
    
    customerName.innerText = customerData.name;
    customerAddress.innerText = customerData.address;
    customerAddress2.innerText = customerData.zip + ' ' + customerData.city;
    
    infoCompanyName.innerText = companyData.name;
    companyOrgNr.innerText = companyData.orgnr;
    invoiceDate.innerText = new Date(invoiceData.date).toLocaleDateString();
    invoiceDueDate.innerText = new Date(invoiceData.duedate).toLocaleDateString();
    orderNr.innerText = invoiceData.invorder;
    
    invoiceText.innerText = invoiceData.name;

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
    }

    payBank.innerText = companyData.bankaccount;
    payInvoiceNr.innerText = invoiceData.id;
    payAmount.innerText = calculateInvoice().toLocaleString("nb-NO", {minimumFractionDigits: 2});
    payDueDate.innerText = invoiceDate.innerText;

    footerCompanyInfo.innerText = companyData.name + ' | ' + 
        companyData.address + ' | ' + 
        companyData.zip + ' ' + companyData.city + ' | ' + 
        companyData.email;
    pageNrInfo.innerText = 'Side ' +  currentPage + ' av ' + totalPages;
    
    toPdfButton.addEventListener('click', () => {
        pdf.html(element, {
            html2canvas: {
                scale: 0.25
            },
            callback: function (pdf) {
                pdf.save("./faktura.pdf");
                console.log('pdf saved');
            }
        })
    })
    loaderOff();
}

initiatePage();
// Promise-based usage:

