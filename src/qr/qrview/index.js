async function loadImages() {
    console.log("Laster bilder...");
    const res = await fetch("/api/qr", {
        method: "GET"
    });
    const files = await res.json();

    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    files.forEach(f => {
        const img = document.createElement("img");
        img.src = f.url;
        img.style.width = "200px";
        img.style.margin = "10px";
        gallery.appendChild(img);
    });
}

loadImages();
