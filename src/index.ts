import { Robot } from './Robot/Robot';
import { Environment } from './Environment/Environment';
import { Obstacle } from './Environment/Obstacle';
import { CanvasImpl } from './Graphics/Graphics';
import { UwbAnchor } from './UWB/Anchor';
import { UwbTag } from './UWB/Tag';
import '../main.css'
import { globalConfigsProvider } from './configs';
import { Human } from './Human/Human';
import { Position } from './types';

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

const humanTravelMap: Position[] = [];

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
