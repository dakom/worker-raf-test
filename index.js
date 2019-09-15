const worker = new Worker("worker.js");

let canvas = document.getElementById("canvas");
let ctx = document.getElementById("canvas").getContext("2d");

let workerUpdate;

worker.onmessage = msg => {
    if (msg.data && msg.data.type) {
        switch (msg.data.type) {
            case "READY": {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight; 
                worker.postMessage({
                    type: "START",
                    windowSize: {width: window.innerWidth, height: window.innerHeight}
                });
                requestAnimationFrame(tick);
                worker.postMessage({type: "TICK", now: performance.now()});
            }
            break;
            case "UPDATE": {
                workerUpdate = msg.data.data;
            }
        }
    }
}

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight; 
    worker.postMessage({
        type: "WINDOW",
        windowSize: {width: window.innerWidth, height: window.innerHeight}
    });
});

function tick(now) {
    requestAnimationFrame(tick);

    if(workerUpdate) {
        render();
        workerUpdate = undefined;
    } else {
        document.getElementById("missedFrames").innerHTML += `<li>Missed frame!</li>`;
        console.log("MISSED FRAME");
    }
    worker.postMessage({type: "TICK", now});
}

function render() {
    ctx.clearRect(0,0,window.innerWidth, window.innerHeight);
    ctx.beginPath();
    ctx.arc(workerUpdate.x, workerUpdate.y, workerUpdate.radius, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();

}