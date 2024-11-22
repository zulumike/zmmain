const navTemplate = document.createElement('template');
navTemplate.innerHTML = `
    <ul class="nav-links">
        <li id="navhome"><a href="/">Hjem</a></li>
        <li id="navcustomers"><a href="/customers/customerlist.html">Kunder</a></li>
        <li id="navproducts"><a href="/products/productlist.html">Produkter</a></li>
        <li id="navorders"><a href="/orders/orderlist.html">Ordrer</a></li>
        <li id="navinvoices"><a href="/invoices/invoicelist.html">Faktura</a></li>
        <li id="navcosts"><a href="/costs/costlist.html">Bilag</a></li>
        <li id="navadmin"><a href="/admin/admin.html">Admin</a></li>
    </ul>
    <div class="burger">
        <div class="line1"></div>
        <div class="line2"></div>
        <div class="line3"></div>
    </div>
`
const navBar = document.getElementById('navbar');
navBar.appendChild(navTemplate.content);

const currentUrl = window.location.href;
if (currentUrl.search("customers") > 0) document.getElementById('navcustomers').classList = ['nav-link-active']
else if (currentUrl.search("products") > 0) document.getElementById('navproducts').classList = ['nav-link-active']
else if (currentUrl.search("orders") > 0) document.getElementById('navorders').classList = ['nav-link-active']
else if (currentUrl.search("invoices") > 0) document.getElementById('navinvoices').classList = ['nav-link-active']
else if (currentUrl.search("costs") > 0) document.getElementById('navcosts').classList = ['nav-link-active']
else if (currentUrl.search("admin") > 0) document.getElementById('navcosts').classList = ['nav-link-active']
else document.getElementById('navhome').classList = ['nav-link-active'];

const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');
const body = document.querySelector('body');
const backdrop = document.createElement('div');
backdrop.classList.add('menu-backdrop');

body.appendChild(backdrop);

burger.addEventListener('click', () => {
    navLinks.classList.toggle('nav-active');
    backdrop.classList.toggle('backdrop-active'); // Show or hide the backdrop

    // Toggle body scrolling
    body.classList.toggle('fixed-position');
    
    // Burger Animation
    burger.classList.toggle('toggle');
});

backdrop.addEventListener('click', function() {
    navLinks.classList.remove('nav-active');
    this.classList.remove('backdrop-active'); // Hide the backdrop when clicked
    body.classList.remove('fixed-position');
    burger.classList.remove('toggle');
});