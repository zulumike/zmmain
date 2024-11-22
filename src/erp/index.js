import { getUserInfo } from "./scripts/auth.js";
import { sendEmail } from "./scripts/email.js";

async function getUser() {
    const userInfo = await getUserInfo();
    console.log(userInfo);
}

function sendMail() {
    sendEmail('ole@mifo.no', 'Emnetekst', 'Hovedmelding');
}
const sendMailBtn = document.getElementById('sendmail');
sendMailBtn.addEventListener('click', sendMail)

getUser();