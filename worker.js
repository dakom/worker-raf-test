const physics = {
    radius: 50,
    position: {x: 0, y: 0},
    speed: .4,
    direction: {x: 1, y: 1},
    windowSize: {width: 0, height: 0},
    last_position: {x: 0, y: 0},
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
            case "UPDATE":
                updatePhysics(msg.data.delta);
                break;
            case "DRAW":
                self.postMessage({type: "UPDATE", data: getRenderData(msg.data.interpolation)});
                break;
        }
    }
}

function updatePhysics(dt) {
    const {last_position, position, speed, direction, windowSize, radius} = physics;
    
    last_position.x = position.x;
    last_position.y = position.y;

    position.x += speed * dt * direction.x;
    position.y += speed * dt * direction.y;

    //not perfect but good enough
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

function getRenderData(interpolation) {
    const {last_position, position, radius} = physics;
    return {
        x: lerp(last_position.x, position.x, interpolation),
        y: lerp(last_position.y, position.y, interpolation),
        radius
    }
}

function lerp(v0, v1, t) {
    return v0*(1-t)+v1*t
}
//tell the main thread we're ready
self.postMessage({
    type: "READY"
});