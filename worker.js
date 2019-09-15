const physics = {
    radius: 50,
    position: {x: 0, y: 0},
    speed: .4,
    direction: {x: 1, y: 1},
    windowSize: {width: 0, height: 0}
}

self.onmessage = msg => {
    if(msg.data && msg.data.type) {
        switch(msg.data.type) {
            case "START":
                physics.windowSize = msg.data.windowSize;
                physics.position.x = physics.windowSize.width / 2;
                physics.position.y = physics.windowSize.height / 2;
            case "WINDOW":
                physics.windowSize = msg.data.windowSize;
                break;
            case "TICK":
                updatePhysics(msg.data.now);
                self.postMessage({type: "UPDATE", data: {
                    ...physics.position,
                    radius: physics.radius
                }});
                break;
        }
    }
}

let prev_time;
function updatePhysics(now) {
    if(prev_time) {
        const dt = now - prev_time;
        const {position, speed, direction, windowSize, radius} = physics;
        
        position.x += speed * dt * direction.x;
        position.y += speed * dt * direction.y;

        if(position.x <= radius && direction.x == -1) {
            direction.x = 1;
        }
        if(position.x >= (windowSize.width - radius) && direction.x === 1) {
            direction.x = -1;
        }
        if(position.y <= radius && direction.y == -1) {
            direction.y = 1;
        }
        if(position.y >= (windowSize.height- radius) && direction.y === 1) {
            direction.y = -1;
        }
    }

    prev_time = now;
}
//tell the main thread we're ready
self.postMessage({
    type: "READY"
});