const worker = new Worker("worker.js");

let canvas = document.getElementById("canvas");
let ctx = document.getElementById("canvas").getContext("2d");

let workerUpdate;
let firstRender = true;

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

                startMainLoop();

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

function startMainLoop() {
    MainLoop
        .setBegin((timestamp, delta) => {
            worker.postMessage({
                type: "BEGIN",
                timestamp,
                delta
            });
        })
        .setUpdate(delta => {
            worker.postMessage({
                type: "UPDATE",
                delta
            });
        })
        .setDraw(interpolation => {
            worker.postMessage({
                type: "DRAW",
                interpolation
            });
            if(workerUpdate) {
                render();
                workerUpdate = undefined;
            } else {
                if(!firstRender) {
                    document.getElementById("missedFrames").innerHTML += `<li>Missed frame!</li>`;
                }
            }
            firstRender = false;
        })
        .setEnd((fps, panic) => {
            worker.postMessage({
                type: "END",
                fps,
                panic 
            });
        })
        .start();
}

function render() {
    ctx.clearRect(0,0,window.innerWidth, window.innerHeight);
    ctx.beginPath();
    ctx.arc(workerUpdate.x, workerUpdate.y, workerUpdate.radius, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();

}