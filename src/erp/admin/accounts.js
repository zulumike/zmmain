import { getCompany, updateCompany } from "../scripts/dbfunctions.js";
import { loaderOn, loaderOff } from "../../scripts/functions.js";

const documentForm = document.getElementById("documentform");
documentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    loaderOn();
    const documentFormData = new FormData(documentForm);
    const documentData = Object.fromEntries(documentFormData);
    await updateCompany('1', documentData);
    loaderOff();
    window.location.reload();
})

async function getCompanyData() {
    loaderOn();
    const companyData = await getCompany('1');
    document.getElementById("name").value = companyData.name || '';
    document.getElementById("address").value = companyData.address || '';
    document.getElementById("zip").value = companyData.zip || '';
    document.getElementById("city").value = companyData.city || '';
    document.getElementById("phone").value = companyData.phone || '';
    document.getElementById("email").value = companyData.email || '';
    document.getElementById("orgnr").value = companyData.orgnr || '';
    document.getElementById("bankaccount").value = companyData.bankaccount || '';
    loaderOff();
}

getCompanyData();