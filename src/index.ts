import { Robot } from './Robot/Robot';
import { Environment } from './Environment/Environment';
import { Obstacle } from './Environment/Obstacle';
import { CanvasImpl } from './Graphics/Graphics';
import { UwbAnchor } from './UWB/Anchor';
import { UwbTag } from './UWB/Tag';
import '../main.css'
import { globalConfigsProvider } from './configs';
import { Human } from './Human/Human';
import { Direction, DrawingColor, Position, TagBearing } from './types';
import { getMapBuilder } from './MapBuilder/MapBuilder';

// create a randpom environment with obstacles
// the paths should have a width of 20
const configs = {
    env: {
        width: 100,
        height: 100
    },
    // cords: [x, y], dims: [width, height]
    obstacles: [
        { cords: [0, 0], dims: [25, 10] },
        { cords: [10, 20], dims: [15, 15] },
        { cords: [10, 45], dims: [20, 15] },
        { cords: [0, 70], dims: [30, 20] },
        { cords: [40, 85], dims: [25, 15] },
        { cords: [40, 70], dims: [10, 15] },
        { cords: [75, 85], dims: [25, 15] },
        { cords: [60, 40], dims: [30, 35] },
        { cords: [40, 40], dims: [20, 20] },
        { cords: [70, 10], dims: [20, 20] },
        { cords: [35, 10], dims: [25, 20] },
    ]
}

// should normalize the configs
// obstacles are created in a scale where 100,100 env.
// should normalize the obstacles to the environment scale
function createEnvironment(configs: any) {
    const scale = 8
    CanvasImpl.setScale(scale);
    const env = new Environment(configs.env.width, configs.env.height, CanvasImpl);
    configs.obstacles.forEach((config: any) => {
        const obstacle = new Obstacle(config.dims[0], config.dims[1], config.cords[0], config.cords[1]);
        env.addObject(obstacle);
    });

    return env;
}

const env = createEnvironment(configs);
const robot = new Robot(5, 95, env);
env.addObject(robot);

const anchor1 = new UwbAnchor(0, 0, "anchor_a");
const anchor2 = new UwbAnchor(99, 0, "anchor_b");
const anchor3 = new UwbAnchor(99, 99, "anchor_c");
env.addObject(anchor1);
env.addObject(anchor2);
env.addObject(anchor3);

const uwbTagRobot = new UwbTag(20, 30);
uwbTagRobot.attachAnchor(anchor1);
uwbTagRobot.attachAnchor(anchor2);
uwbTagRobot.attachAnchor(anchor3);
env.addObject(uwbTagRobot);
robot.attachUwbTag(uwbTagRobot);

const human = new Human(20, 95, env);
env.addObject(human);
const uwbTagHuman = new UwbTag(20, 95);
uwbTagHuman.attachAnchor(anchor1);
uwbTagHuman.attachAnchor(anchor2);
uwbTagHuman.attachAnchor(anchor3);
env.addObject(uwbTagHuman);
human.attachUwbTag(uwbTagHuman);
human.roam();

function getPositionFromUwbBearing(readings: TagBearing[]): Position {
    // Check if there are exactly 3 readings
    if (readings.length !== 3)
        throw new Error("Invalid readings: Must have 3 readings");

    const anchor1 = readings[0];
    const anchor2 = readings[1];
    const anchor3 = readings[2];

    // Get coordinates and distances
    const x1 = anchor1.anchorPosition.x;
    const y1 = anchor1.anchorPosition.y;
    const r1 = anchor1.distance;

    const x2 = anchor2.anchorPosition.x;
    const y2 = anchor2.anchorPosition.y;
    const r2 = anchor2.distance;

    const x3 = anchor3.anchorPosition.x;
    const y3 = anchor3.anchorPosition.y;
    const r3 = anchor3.distance;

    // Calculate intermediate values
    const x1Square = x1 * x1;
    const y1Square = y1 * y1;
    const x2Square = x2 * x2;
    const y2Square = y2 * y2;
    const x3Square = x3 * x3;
    const y3Square = y3 * y3;
    const r1Square = r1 * r1;
    const r2Square = r2 * r2;
    const r3Square = r3 * r3;

    // Calculate trilateration
    const A = 2 * (x2 - x1);
    const B = 2 * (y2 - y1);
    const C = r1Square - r2Square - x1Square + x2Square - y1Square + y2Square;
    const D = 2 * (x3 - x2);
    const E = 2 * (y3 - y2);
    const F = r2Square - r3Square - x2Square + x3Square - y2Square + y3Square;

    // Calculate intersection point
    const x = (C * E - F * B) / (E * A - B * D);
    const y = (C * D - A * F) / (B * D - A * E);

    return { x, y };
}

const humanTravelMap = getMapBuilder("human-travel-map", DrawingColor.BLUE);
setInterval(() => {
    const position = getPositionFromUwbBearing(uwbTagHuman.getBearing());
    // if still at the same position, don't add to the map
    humanTravelMap.addPosition(position);
}, 100)

const robotTravelMap = getMapBuilder("robot-travel-map", DrawingColor.RED);
setInterval(() => {
    const position = getPositionFromUwbBearing(uwbTagRobot.getBearing());
    // if still at the same position, don't add to the map
    robotTravelMap.addPosition(position);
}, 100)

let lastMovedPositionIndex = 0;

function followHuman(humanMap: Position[], robot: Robot) {
    // calcuate a moving average of the last 5 positions
    const movingAverage = 5;
    humanMap = humanMap.slice(0, humanMap.length - 2);
    const lastPositions = humanMap.slice(-movingAverage);
    const averageX = lastPositions.reduce((acc, pos) => acc + pos.x, 0) / movingAverage;
    const averageY = lastPositions.reduce((acc, pos) => acc + pos.y, 0) / movingAverage;
    const robotPosition = getPositionFromUwbBearing(uwbTagRobot.getBearing());
    const dx = averageX - robotPosition.x;
    const dy = averageY - robotPosition.y;
    robot.positionMove({ x: robotPosition.x + dx, y: robotPosition.y + dy });
}

setTimeout(() => {
    setInterval(() => {
        followHuman(humanTravelMap.getMap()?.positions || [], robot);
    }, 100);
}, 1000)


// move the robot around with the arrow keys
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case "ArrowUp":
            human.move("up");
            break;
        case "ArrowDown":
            human.move("down");
            break;
        case "ArrowLeft":
            human.move("left");
            break;
        case "ArrowRight":
            human.move("right");
            break;
    }
});

// move robot with wasd
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case "w":
            robot.move("up");
            break;
        case "s":
            robot.move("down");
            break;
        case "a":
            robot.move("left");
            break;
        case "d":
            robot.move("right");
            break;
    }
});

const tempObsId = "temp-obstacle-1"
document.getElementById("addObs")?.addEventListener('click', () => {
    const x = 32;
    const y = 80
    const width = 5;
    const height = 5;
    const obstacle = new Obstacle(width, height, x, y);
    obstacle.setID(tempObsId);
    obstacle.setFillColor('brown');
    obstacle.setStroke('brown');
    env.addObject(obstacle);
});

document.getElementById("removeObs")?.addEventListener('click', () => {
    env.removeObject(tempObsId);
});

document.getElementById("enableObstacleLines")?.addEventListener('change', (event) => {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
        globalConfigsProvider.setConfig('showObstacleDetectionLines', true);
    } else {
        globalConfigsProvider.setConfig('showObstacleDetectionLines', false);
    }
});

document.getElementById("showDebugLabels")?.addEventListener('change', (event) => {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
        CanvasImpl.enableDebugMode({ mapScale: configs.env.width / 100, showCoordinates: true, showDimensions: true });
    } else {
        CanvasImpl.disableDebugMode();
    }
});

document.getElementById("showUwbDistanceCircles")?.addEventListener('change', (event) => {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
        globalConfigsProvider.setConfig('showUwbDistanceCircles', true);
    } else {
        globalConfigsProvider.setConfig('showUwbDistanceCircles', false);
    }
});

document.getElementById("showUwbDistanceLines")?.addEventListener('change', (event) => {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
        globalConfigsProvider.setConfig('showUwbDistanceLines', true);
    } else {
        globalConfigsProvider.setConfig('showUwbDistanceLines', false);
    }
});
