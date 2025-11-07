const navTemplate = document.createElement('template');
navTemplate.innerHTML = `
    <ul class="nav-links">
        <li id="navhome"><a href="/shoplist">Handleliste</a></li>
        <li id="navcategories"><a href="/shoplist/categories/categorylist.html">Kategorier</a></li>
        <li id="navstores"><a href="/shoplist/stores/shoplist.html">Butikker</a></li>
        <li id="navlogout"><a href="/.auth/logout">Logg ut</a></li>
    </ul>
    <div id="burger-menu" class="burger">
        <div class="line1"></div>
        <div class="line2"></div>
        <div class="line3"></div>
    </div>
`
const navBar = document.getElementById('navbar');
navBar.appendChild(navTemplate.content);


const currentUrl = window.location.href;
if (currentUrl.search("categories") > 0) document.getElementById('navcategories').classList = ['nav-link-active']
else if (currentUrl.search("stores") > 0) document.getElementById('navstores').classList = ['nav-link-active']
else document.getElementById('navhome').classList = ['nav-link-active'];

// const burger = document.querySelector('.burger');
const burger = document.getElementById('burger-menu');
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