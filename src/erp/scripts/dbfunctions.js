import { getUserInfo } from "../../scripts/auth.js";

const companyEndpoint = '/api/erpdb?containerid=company';
const productsEndpoint = '/api/erpdb?containerid=products';
const customersEndpoint = '/api/erpdb?containerid=customers';
const ordersEndpoint = '/api/erpdb?containerid=orders';
const invoicesEndpoint = '/api/erpdb?containerid=invoices';
const costsEndpoint = '/api/erpdb?containerid=costs';
// #####################################################################################
// #                                                                        COMPANY    #
// #####################################################################################

export async function getCompany(id) {

    const endpoint = companyEndpoint + '&id=' + id;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    const result = await response.json();
    return result;
  }

  export async function updateCompany(id, data) {
    const endpoint = companyEndpoint + '&id=' + id;
    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  
    const result = await res.json();
    return result.data;
  }

// #####################################################################################
// #                                                                          PRODUCTS #
// #####################################################################################

export async function readAllProducts() {
    const endpoint = productsEndpoint;
    const response = await fetch(endpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });
    const result = await response.json();
    return result;
}

export async function getProduct(id) {
  const endpoint = productsEndpoint + '&id=' + id;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  const result = await response.json();
  return result;
}

export async function updateProduct(id, data) {
    const oldData = await getProduct(id);
    data.created = oldData.created;
    data.created_by = oldData.created_by;
    data.id = id;
    const timeNow = new Date();
    data.updated = timeNow;
    const currentUser = await getUserInfo();
    data.updated_by = currentUser.userDetails;

    const endpoint = productsEndpoint + '&id=' + id;
    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  
    const result = await res.json();
    return result;
  }

export async function createProduct(data) {

    const timeNow = new Date();
    data.created = timeNow;
    const currentUser = await getUserInfo();
    data.created_by = currentUser.userDetails;
    
    const endpoint = productsEndpoint;
    const result = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  
    const response = await result.json();
    
    return response;
  }

//   Hard delete:
  export async function deleteProduct(id) {
 
    const endpoint = productsEndpoint;
    const productToBeDeleted = await getProduct(id);

    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productToBeDeleted)
    });
  
  }

// #####################################################################################
// #                                                                         CUSTOMERS #
// #####################################################################################

export async function readAllCustomers() {

    const endpoint = customersEndpoint;
    const response = await fetch(endpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });
    const result = await response.json();
    return result;
}

export async function getCustomer(id) {

    const endpoint = customersEndpoint + '&id=' + id;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    const result = await response.json();
    return result;
  }

export async function updateCustomer(id, data) {
    const oldData = await getCustomer(id);
    data.created = oldData.created;
    data.created_by = oldData.created_by;
    data.id = id;
    const timeNow = new Date();
    data.updated = timeNow;
    const currentUser = await getUserInfo();
    data.updated_by = currentUser.userDetails;
  
    const endpoint = customersEndpoint + '&id=' + id;
    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  
    const result = await res.json();
    return result;
  }

export async function createCustomer(data) {

    const company = await getCompany('1');
    console.log(company);
    company.nrSeries.customer++
    data.id = company.nrSeries.customer.toString();
    const timeNow = new Date();
    data.created = timeNow;
    const currentUser = await getUserInfo();
    data.created_by = currentUser.userDetails;
    data.deleted = false;

    const endpoint = customersEndpoint;
    const result = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  
    const response = await result.json();
    
    await updateCompany('1', company)

    return response;
  }

//   Soft delete:
  export async function deleteCustomer(id) {
    const oldData = await getCustomer(id);
    const data = oldData;
    const timeNow = new Date();
    data.updated = timeNow;
    const currentUser = await getUserInfo();
    data.updated_by = currentUser.userDetails;
    data.deleted = true;

    const endpoint = customersEndpoint + '&id=' + id;
    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  
    const result = await res.json();
    return result;
  }

// #####################################################################################
// #                                                                            ORDERS #
// #####################################################################################

export async function readAllOrders() {
   
    const endpoint = ordersEndpoint;
    const response = await fetch(endpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });
    const result = await response.json();
    return result;
}

export async function getOrder(id) {
 
    const endpoint = ordersEndpoint + '&id=' + id;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    const result = await response.json();
    return result;
  }

export async function updateOrder(id, data) {
    const oldData = await getOrder(id);
    data.created = oldData.created;
    data.created_by = oldData.created_by;
    data.id = id;
    const timeNow = new Date();
    data.updated = timeNow;
    const currentUser = await getUserInfo();
    data.updated_by = currentUser.userDetails;
 
    const endpoint = ordersEndpoint + '&id=' + id;
    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  
    const result = await res.json();
    return result;
  }

export async function createOrder(data) {

    const company = await getCompany('1');
    company.nrSeries.order++
    data.id = company.nrSeries.order.toString();
    const timeNow = new Date();
    data.created = timeNow;
    const currentUser = await getUserInfo();
    data.created_by = currentUser.userDetails;
    data.deleted = false;
    data.orderLines = [];
    data.sum = 0;

    const endpoint = ordersEndpoint;
    const result = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  
    const response = await result.json();
    
    await updateCompany('1', company)

    return response;
  }

//   Soft delete:
  export async function deleteOrder(id) {
    const oldData = await getOrder(id);
    const data = oldData;
    const timeNow = new Date();
    data.updated = timeNow;
    const currentUser = await getUserInfo();
    data.updated_by = currentUser.userDetails;
    data.deleted = true;

    const endpoint = ordersEndpoint + '&id=' + id;
    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  
    const result = await res.json();
    return result;
  }

// #####################################################################################
// #                                                                          INVOICES #
// #####################################################################################

export async function readAllInvoices() {

  const endpoint = invoicesEndpoint;
  const response = await fetch(endpoint, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
  });
  const result = await response.json();
  return result;
}

export async function getInvoice(id) {

  const endpoint = invoicesEndpoint + '&id=' + id;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  const result = await response.json();
  return result;
}

export async function updateInvoice(id, data) {
  const oldData = await getInvoice(id);
  data.created = oldData.created;
  data.created_by = oldData.created_by;
  data.id = id;
  const timeNow = new Date();
  data.updated = timeNow;
  const currentUser = await getUserInfo();
  data.updated_by = currentUser.userDetails;

  const endpoint = invoicesEndpoint + '&id=' + id;
  const res = await fetch(endpoint, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  return result;
}

export async function createInvoice(data) {

  const company = await getCompany('1');
  company.nrSeries.invoice++
  data.id = company.nrSeries.invoice.toString();
  const timeNow = new Date();
  data.created = timeNow;
  const currentUser = await getUserInfo();
  data.created_by = currentUser.userDetails;
  data.deleted = false;

  const endpoint = invoicesEndpoint;
  const result = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const response = await result.json();
  
  await updateCompany('1', company)

  return response;
}

//   Soft delete:
export async function deleteInvoice(id) {
  const oldData = await getInvoice(id);
  const data = oldData;
  const timeNow = new Date();
  data.updated = timeNow;
  const currentUser = await getUserInfo();
  data.updated_by = currentUser.userDetails;
  data.deleted = true;

  const endpoint = invoicesEndpoint + '&id=' + id;
  const res = await fetch(endpoint, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  return result;
}

// #####################################################################################
// #                                                                             COSTS #
// #####################################################################################

export async function readAllCosts() {

    const endpoint = costsEndpoint;
    const response = await fetch(endpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });
    const result = await response.json();
    return result;
}

export async function getCost(id) {

    const endpoint = costsEndpoint + '&id=' + id;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    const result = await response.json();
    return result;
  }

export async function updateCost(id, data) {
    const oldData = await getCost(id);
    data.created = oldData.created;
    data.created_by = oldData.created_by;
    data.id = id;
    const timeNow = new Date();
    data.updated = timeNow;
    const currentUser = await getUserInfo();
    data.updated_by = currentUser.userDetails;
  
    const endpoint = costsEndpoint + '&id=' + id;
    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  
    const result = await res.json();
    console.log(result);
    return result;
  }

export async function createCost(data) {

    const company = await getCompany('1');
    company.nrSeries.cost++
    data.id = company.nrSeries.cost.toString();
    const timeNow = new Date();
    data.created = timeNow;
    const currentUser = await getUserInfo();
    data.created_by = currentUser.userDetails;
    data.deleted = false;

    const endpoint = costsEndpoint;
    const result = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  
    const response = await result.json();
    
    await updateCompany('1', company)

    return response;
  }

//   Soft delete:
  export async function deleteCost(id) {
    const oldData = await getCost(id);
    const data = oldData;
    const timeNow = new Date();
    data.updated = timeNow;
    const currentUser = await getUserInfo();
    data.updated_by = currentUser.userDetails;
    data.deleted = true;

    const endpoint = costsEndpoint + '&id=' + id;
    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  
    const result = await res.json();
    return result;
  }