const constraints = { video: { facingMode: "user" } };

let stream;
let video;
let canvas;

async function initCamera() {
    stream = await navigator.mediaDevices.getUserMedia(constraints);

    // Vi lager video og canvas i minnet (ikke synlig)
    video = document.createElement("video");
    video.srcObject = stream;
    await video.play();

    canvas = document.createElement("canvas");
}

async function capture() {
    if (!stream) await initCamera();

    const w = video.videoWidth;
    const h = video.videoHeight;

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, w, h);

    canvas.toBlob(async blob => {
        const formData = new FormData();
        formData.append("file", blob, "bilde.png");

        await fetch("/api/qr", {
            method: "POST",
            body: formData
        });

    }, "image/jpeg", 0.9);
    closeCamera();
};

function closeCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
}

window.addEventListener("load", () => {
    setTimeout(() => {
        capture();
    }, 1000);
});