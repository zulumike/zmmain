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