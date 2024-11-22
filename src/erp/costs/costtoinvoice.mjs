import { readAllCustomers, readAllProducts, createInvoice } from "../scripts/dbfunctions.js";
import { loaderOn, loaderOff } from "../scripts/functions.js";

let customers = [];
let productList = [];
let pricePerCust = 0;

function calculatePrice() {
    let invoiceData = [];
    let totalAmount = 0;
    let invoiceAmount = 0;
    const formData = new FormData(costForm);
    const formObjects = Object.fromEntries(formData);
    const objectArray = Object.keys(formObjects);
    for (let i = 0; i < (objectArray.length - 3); i++) {
        const custInvoice = {
            customer: parseInt(objectArray[i]),
            amount: parseFloat(formObjects[objectArray[i]])
        };
        if (custInvoice.amount > 0) {
            invoiceAmount++;
        }
        totalAmount = totalAmount + custInvoice.amount;
        invoiceData.push(custInvoice);
    }
    const returnData = {
        invoiceData: invoiceData,
        totalAmount: totalAmount,
        invoiceAmount: invoiceAmount,
        description: formObjects.description,
        product: formObjects.product,
        unitPrice: parseFloat(formObjects.price)
    }
    return returnData;
}

function calculateInvoices(givenPrice = pricePerCust) {
    const returnedData = calculatePrice();
    const invoicesSum = givenPrice * returnedData.totalAmount;
    invoiceInfoText.innerText = 'Antall faktura: ' + returnedData.invoiceAmount + ' Totalsum fakturaer: ' + invoicesSum;
}

async function createInvoices() {
    const returnedData = calculatePrice();
    const invoiceData = returnedData.invoiceData;
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + 14);
    for (let i = 0; i < invoiceData.length; i++) {
        let documentData = {};
        documentData.date = today.toJSON().slice(0, 10);
        documentData.duedate = dueDate.toJSON().slice(0, 10);
        documentData.customer = parseInt(invoiceData[i].customer);
        documentData.name = returnedData.description;
        documentData.invcost = costId;
        const invoiceLines = [
            {
                date: today.toJSON().slice(0, 10),
                product: returnedData.product,
                price: returnedData.unitPrice,
                amount: invoiceData[i].amount,
                unit: 'stk',
                account: 3000
            }
        ]
        documentData.invoiceLines = invoiceLines;
        documentData.sum = returnedData.unitPrice * invoiceData[i].amount;
        console.log(documentData);
        const dbResult = await createInvoice(documentData);
        console.log(dbResult);
    }
}

async function alterForm() {
    customers = await readAllCustomers();
    productList = await readAllProducts();
    const productSelect = document.getElementById('product');
    const blankProduct = document.createElement('option');
    blankProduct.textContent = 'Velg produkt';
    productSelect.appendChild(blankProduct);
    for (let i = 0; i < productList.length; i++) {
        if (productList[i].active) {
            const productOption = document.createElement('option');
            productOption.textContent = productList[i].id.toString() + '-' + productList[i].name;
            productOption.value = productList[i].id;
            productOption.id = productList[i].id;
            productSelect.appendChild(productOption);
        }
    }
    for (let i = 0; i < customers.length; i++) {
        if (!customers[i].deleted) {
            const nrLabel = document.createElement('label');
            nrLabel.innerText = customers[i].name;
            nrLabel.for = customers[i].id.toString(); 
            const nrInput = document.createElement('input');
            nrInput.type = 'number';
            nrInput.step = '0.01';
            nrInput.value = 0;
            nrInput.id = customers[i].id.toString();
            nrInput.name = customers[i].id.toString();
            costForm.appendChild(nrLabel);
            costForm.appendChild(nrInput);
            nrInput.addEventListener('change', () => {
                const returnedData = calculatePrice();
                pricePerCustomerInput.value = costSum / returnedData.totalAmount;
                calculateInvoices(costSum / returnedData.totalAmount);
            })
        }
    }

    const submitBtn = document.createElement('input');
    submitBtn.type = 'submit';
    submitBtn.value = 'Lag fakturaer';
    costForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        loaderOn();
        await createInvoices();
        loaderOff();
        window.location.replace('/invoices/invoicelist.html');
    });
    const cancelBtn = document.createElement('input');
    cancelBtn.type = 'button';
    cancelBtn.value = 'Avbryt';
    cancelBtn.id = 'cancelbtn';
    cancelBtn.addEventListener('click', () => {
        window.location.href = 'editcost.html?id=' + costId;
    })
    costForm.appendChild(submitBtn);
    costForm.appendChild(cancelBtn);
}

const urlParams = new URLSearchParams(window.location.search);
const costId = parseInt(urlParams.get('id'));
const costSum = parseFloat(urlParams.get('sum'));

const costInfo = document.getElementById('costinfo');
costInfo.innerText = 'Bilagsnr: ' + costId + ' Sum: ' + costSum.toLocaleString("nb-NO", {minimumFractionDigits: 2});

const costForm = document.getElementById('costform');

const invoiceInfoText = document.getElementById('invoiceinfo');
const pricePerCustomerInput = document.getElementById('price');
pricePerCustomerInput.addEventListener('change', (event) => {
    pricePerCust = event.target.value;
    calculateInvoices();
})

alterForm();