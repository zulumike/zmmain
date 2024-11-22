import { updateOrder, getOrder, deleteOrder, readAllCustomers, readAllProducts, createInvoice } from "../scripts/dbfunctions.js";
import { loaderOn, loaderOff } from "../scripts/functions.js";

let orderData = {};
let productList = [];

const documentForm = document.getElementById("documentform");
documentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    loaderOn();
    const documentFormData = new FormData(documentForm);
    const documentData = Object.fromEntries(documentFormData);
    documentData.customer = parseInt(documentData.customer);
    documentData.orderLines = orderData.orderLines;
    documentData.sum = calculateOrder();
    await updateOrder(documentId, documentData);
    loaderOff();
    window.location.replace('/orders/orderlist.html');
})

function calculateOrder() {
    let orderSum = 0;
    if (orderData.orderLines.length > 0) {
        for (let i = 0; i < orderData.orderLines.length; i++) {
            orderSum = orderSum + orderData.orderLines[i].price * orderData.orderLines[i].amount;   
        }
    }
    return orderSum;
}

function presentOrderLines() {
    const existingTable = document.getElementById('orderlinetable');
    if (existingTable != null) {
        existingTable.remove();
    }
    const orderLineDiv = document.getElementById('orderlinediv');
    const olTable = document.createElement('table');
    olTable.classList = ['list-table'];
    olTable.id = 'orderlinetable';
    const tableHeading = document.createElement('thead');
    const tableBody = document.createElement('tbody');
    olTable.appendChild(tableHeading);    
    olTable.appendChild(tableBody);    
    orderLineDiv.appendChild(olTable);
    const headingRow = tableHeading.insertRow(0);
    const hCell1 = headingRow.insertCell(0);
    hCell1.innerText = 'Dato:';
    const hCell2 = headingRow.insertCell(1);
    hCell2.innerText = 'Produktnr:';
    const hCell3 = headingRow.insertCell(2);
    hCell3.innerText = 'Produkt-tekst:';
    const hCell4 = headingRow.insertCell(3);
    hCell4.innerText = 'Pris:';
    const hCell5 = headingRow.insertCell(4);
    hCell5.innerText = 'Antall:';
    const hCell6 = headingRow.insertCell(5);
    hCell6.innerText = 'Enhet:';
    const hCell7 = headingRow.insertCell(6);
    hCell7.innerText = 'Beløp:';
    const hCell8 = headingRow.insertCell(7);
    hCell8.innerText = 'Kommentar:';
    for (let i = 0; i < orderData.orderLines.length; i++) {
        const bodyRow = tableBody.insertRow(-1);
        const date = bodyRow.insertCell(0);
        const product = bodyRow.insertCell(1);
        const productName = bodyRow.insertCell(2);
        const price = bodyRow.insertCell(3);
        const amount = bodyRow.insertCell(4);
        const unit = bodyRow.insertCell(5);
        const sum = bodyRow.insertCell(6);
        const comment = bodyRow.insertCell(7);
        const olDate = new Date(orderData.orderLines[i].date);
        date.innerText = olDate.toLocaleDateString();
        product.innerText = orderData.orderLines[i].product;
        const selectedProduct = productList.find((element) => element.id == orderData.orderLines[i].product);
        productName.innerText = selectedProduct.name;
        price.innerText = orderData.orderLines[i].price.toLocaleString("nb-NO", {minimumFractionDigits: 2});
        amount.innerText = orderData.orderLines[i].amount.toLocaleString("nb-NO", {minimumFractionDigits: 2});
        unit.innerText = orderData.orderLines[i].unit;
        sum.innerText = (orderData.orderLines[i].price * orderData.orderLines[i].amount).toLocaleString("nb-NO", {minimumFractionDigits: 2});
        comment.innerText = orderData.orderLines[i].comment;
        bodyRow.addEventListener('click', () => {
            populateOrderLineForm(orderData.orderLines[i]);
            orderData.orderLines.splice(i, 1);
            presentOrderLines();
        });
    }
    const orderSumText = document.getElementById('ordersumtext');
    orderSumText.innerText = 'Ordresum: ' + calculateOrder().toLocaleString("nb-NO", {minimumFractionDigits: 2});
}
function addOrderLine(event, orderLineForm) {
    event.preventDefault();
    const orderLineFormData = new FormData(orderLineForm);
    const orderLineData = Object.fromEntries(orderLineFormData);
    orderLineData.price = parseFloat(orderLineData.price);
    orderLineData.amount = parseFloat(orderLineData.amount);
    orderData.orderLines.push(orderLineData);
    presentOrderLines(orderData.orderLines);
}

async function orderLineForm() {
    productList = await readAllProducts();
    const orderLineForm = document.getElementById('orderlineform');
    const dateDiv = document.createElement('div');
    const dateLabel = document.createElement('label');
    dateLabel.for = 'date';
    dateLabel.innerText = 'Dato';
    const emptyOLDate = document.createElement('input');
    emptyOLDate.type = 'date';
    emptyOLDate.id = 'oldate';
    emptyOLDate.name = 'date';
    const today = new Date();
    emptyOLDate.valueAsDate = today;
    dateDiv.appendChild(dateLabel);
    dateDiv.appendChild(emptyOLDate);

    const productDiv = document.createElement('div');
    const productIdLabel = document.createElement('label');
    productIdLabel.for = 'productid';
    productIdLabel.innerText = 'Produkt';
    const emptyOLProductId = document.createElement('select');
    emptyOLProductId.id = 'olproductid';
    emptyOLProductId.name = 'product';
    const blankProduct = document.createElement('option');
    blankProduct.textContent = 'Velg produkt';
    emptyOLProductId.appendChild(blankProduct);
    for (let i = 0; i < productList.length; i++) {
        if (productList[i].active) {
            const productOption = document.createElement('option');
            productOption.textContent = productList[i].id.toString() + '-' + productList[i].name;
            productOption.value = productList[i].id;
            productOption.id = productList[i].id;
            emptyOLProductId.appendChild(productOption);
        }
    }
    productDiv.appendChild(productIdLabel);
    productDiv.appendChild(emptyOLProductId);

    const amountDiv = document.createElement('div');
    const amountLabel = document.createElement('label');
    amountLabel.for = 'olamount';
    amountLabel.innerText = 'Antall';
    const emptyOLAmount = document.createElement('input');
    emptyOLAmount.type = 'number';
    emptyOLAmount.id = 'olamount';
    emptyOLAmount.name = 'amount';
    emptyOLAmount.step = '0.01';
    emptyOLAmount.value = 1;
    amountDiv.appendChild(amountLabel);
    amountDiv.appendChild(emptyOLAmount);

    const unitDiv = document.createElement('div');
    const unitLabel = document.createElement('label');
    unitLabel.for = 'olunit';
    unitLabel.innerText = 'Enhet';
    const emptyOLUnit = document.createElement('input');
    emptyOLUnit.type = 'text';
    emptyOLUnit.id = 'olunit';
    emptyOLUnit.name = 'unit';
    unitDiv.appendChild(unitLabel);
    unitDiv.appendChild(emptyOLUnit);

    const priceDiv = document.createElement('div');
    const priceLabel = document.createElement('label');
    priceLabel.for = 'olprice';
    priceLabel.innerText = 'Pris';
    const emptyOLPrice = document.createElement('input');
    emptyOLPrice.type = 'number';
    emptyOLPrice.id = 'olprice';
    emptyOLPrice.name = 'price';
    emptyOLPrice.step = '0.01'
    priceDiv.appendChild(priceLabel);
    priceDiv.appendChild(emptyOLPrice);

    const commentDiv = document.createElement('div');
    const divLabel = document.createElement('label');
    divLabel.for = 'olcomment';
    divLabel.innerText = 'Kommentar';
    const emptyOLComment = document.createElement('input');
    emptyOLComment.type = 'text';
    emptyOLComment.id = 'olcomment';
    emptyOLComment.name = 'comment';
    commentDiv.appendChild(divLabel);
    commentDiv.appendChild(emptyOLComment);

    // prefill inputs based on selected product
    let productAccount = 3000;
    emptyOLProductId.addEventListener('change', (event) => {
        const selectedProduct = productList.find((element) => element.id == event.target.value);
        emptyOLPrice.value = selectedProduct.price;
        emptyOLUnit.value = selectedProduct.unit;
        productAccount = selectedProduct.account;
    })

    const submitOrderLine = document.createElement('input');
    submitOrderLine.type = 'submit';
    submitOrderLine.value = 'Legg til';
    
    orderLineForm.addEventListener('submit', (event) => {
        orderLineForm.account = productAccount.toString();
        addOrderLine(event, orderLineForm);
        orderLineForm.reset();
        emptyOLDate.valueAsDate = today;
    })

    const resetOrderLineForm = document.createElement('input');
    resetOrderLineForm.type = 'reset';
    
    orderLineForm.appendChild(dateDiv);
    orderLineForm.appendChild(productDiv);
    orderLineForm.appendChild(priceDiv);
    orderLineForm.appendChild(amountDiv);
    orderLineForm.appendChild(unitDiv);
    orderLineForm.appendChild(commentDiv);
    orderLineForm.appendChild(submitOrderLine);
    orderLineForm.appendChild(resetOrderLineForm);
}

function populateOrderLineForm(orderLineData) {
    document.getElementById('oldate').value = orderLineData.date;
    document.getElementById(orderLineData.product).selected = true;
    document.getElementById('olprice').value = orderLineData.price;
    document.getElementById('olamount').value = orderLineData.amount;
    document.getElementById('olunit').value = orderLineData.unit;
    document.getElementById('olcomment').value = orderLineData.comment;
}

async function populatedocumentForm(documentId) {
    loaderOn();
    orderData = await getOrder(documentId)
    document.getElementById('formheading').textContent = 'Ordrenr: ' + orderData.id;
    document.getElementById('customer').value = orderData.customer;
    const customerList = await readAllCustomers();
    const customerSelect = document.getElementById('customer');
    for (let i = 0; i < customerList.length; i++) {
        if (!customerList[i].deleted) {
            const customerOption = document.createElement('option');
            customerOption.textContent = customerList[i].name;
            customerOption.value = customerList[i].id;
            if (orderData.customer === parseInt(customerList[i].id)) {
                customerOption.selected = true;
            }
            customerSelect.appendChild(customerOption);
        }
    }
    document.getElementById('name').value = orderData.name;
    document.getElementById('date').value = orderData.date;
    const createdText = document.getElementById('created-text');
    const updatedText = document.getElementById('updated-text');
    const createdTime = new Date(orderData.created);
    createdText.textContent = 'Opprettet: ' + createdTime.toLocaleString() +
        ' av ' + orderData.created_by;
    if (orderData.updated != null) {
        const updatedTime = new Date(orderData.updated);
        updatedText.textContent = 'Sist oppdatert: ' + updatedTime.toLocaleString() + 
            ' av ' + orderData.updated_by;
    }
    else {
        updatedText.remove();
    }
    await orderLineForm();
    if (orderData.orderLines.length > 0) {
        presentOrderLines();
    }
  
    loaderOff();
}

async function createInvoiceFromOrder() {
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + 14);
    const invoiceData = {
        name: orderData.name,
        customer: orderData.customer,
        date: today,
        duedate: dueDate,
        costed: false,
        sum: orderData.sum,
        invorder: parseInt(orderData.id),
        invcost: 0,
        invoiceLines: orderData.orderLines
    };
    const dbResponse = await createInvoice(invoiceData);
    alert('Faktura ' + dbResponse.id + ' opprettet!');
}

async function deleteDocumentById() {
    if (confirm('Er du sikker på at du vil slette ordren?')) {
        loaderOn();
        await deleteOrder(documentId);
        loaderOff();
        window.location.replace('/orders/orderlist.html');
    }
}

const urlParams = new URLSearchParams(window.location.search);
const documentId = urlParams.get('id');
populatedocumentForm(documentId);
document.getElementById('delBtn').addEventListener('click', deleteDocumentById);
document.getElementById('invoiceBtn').addEventListener('click', createInvoiceFromOrder);