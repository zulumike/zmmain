export function loaderOn() {
    const loadingDiv = document.createElement('div');
    const loader = document.createElement('div');
    
    loadingDiv.id = 'loadingdiv';
    loader.id = 'loader';

    document.body.appendChild(loadingDiv);
    loadingDiv.appendChild(loader);
}

export function loaderOff() {
    const loadingDiv = document.getElementById('loadingdiv');
    loadingDiv.remove();
}

export function showMessage(message = '', warn = false, ttl = 5000) {
    const msgElement = document.getElementById('showMessage');
    msgElement.textContent = message;
    let className = 'show-message'
    if (warn) className = 'show-message-warn';
    msgElement.classList.add(className);
    clearTimeout(showMessage._t);
    showMessage._t = setTimeout(() => msgElement.classList.remove(className), ttl);
}

//   function showToast(msg, type) {
//     toastEl.textContent = msg;
//     toastEl.style.borderColor = type === 'ok' ? 'rgba(41,197,133,.6)' : type === 'warn' ? 'rgba(240,178,75,.6)' : 'rgba(255,93,93,.6)';
//     toastEl.classList.add('show');
//     clearTimeout(showToast._t);
//     showToast._t = setTimeout(() => toastEl.classList.remove('show'), 5500);
//   }