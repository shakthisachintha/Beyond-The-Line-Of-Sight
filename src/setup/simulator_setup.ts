import { Robot } from '../robot/robot';
import { Environment } from '../environment/environment';
import { Obstacle } from '../environment/obstacle';
import { Canvas, CanvasImpl, ExploredMapCanvasImpl, UWBMapCanvasImpl } from '../graphics/graphics';
import { UwbAnchor } from '../uwb/anchor';
import { UwbTag } from '../uwb/tag';
import { globalConfigsProvider } from '../configs';
import { Human } from '../human/human';
import { DrawingColor } from '../types';
import { getMapBuilder } from '../map_builder/map_builder';
import { getPositionFromUwbBearing } from '../utils';
import { RobotController } from '../robot/robot_controller';

// create a random environment with obstacles
// the paths should have a width of 20
const configs = {
    scale: globalConfigsProvider.getConfig("mapScale"),
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


function createEnvironment(configs: any, canvas: Canvas) {
    // should normalize the configs
    // obstacles are created in a scale where 100,100 env.
    // should normalize the obstacles to the environment scale
    const env = new Environment(configs.env.width, configs.env.height, canvas);
    configs.obstacles.forEach((config: any) => {
        const obstacle = new Obstacle(config.dims[0], config.dims[1], config.cords[0], config.cords[1]);
        env.addObject(obstacle);
    });
    return env;
}

function initGraphicCanvases() {
    UWBMapCanvasImpl.setScale(globalConfigsProvider.getConfig("localizationMapScale"));
    UWBMapCanvasImpl.drawBackdrop({ width: 100, height: 100, fillColor: "#FFFFF1", strokeColor: 'black' });

    ExploredMapCanvasImpl.setScale(globalConfigsProvider.getConfig("lidarMapScale"));
    ExploredMapCanvasImpl.drawBackdrop({ width: 100, height: 100, fillColor: "#FFFFFF", strokeColor: 'black' });

    CanvasImpl.setScale(globalConfigsProvider.getConfig("mapScale"));
}

export function createSimulator(canvas: Canvas) {

    initGraphicCanvases();

    const env = createEnvironment(configs, canvas);

    // Add robot object to environment
    const robot = new Robot(5, 95, env);
    robot.setID("robot-A");
    env.addObject(robot);


    // Add human subject to environment
    const human = new Human(20, 95, env);
    human.setID("human-A");
    env.addObject(human);


    // Add UWB anchors to environment
    const anchor1 = new UwbAnchor(0, 0, "anchor_a");
    const anchor2 = new UwbAnchor(99, 0, "anchor_b");
    const anchor3 = new UwbAnchor(99, 99, "anchor_c");
    env.addObject(anchor1);
    env.addObject(anchor2);
    env.addObject(anchor3);


    // Attach UWB tag to robot and add to environment
    const uwbTagRobot = new UwbTag(20, 30);
    uwbTagRobot.attachAnchor(anchor1);
    uwbTagRobot.attachAnchor(anchor2);
    uwbTagRobot.attachAnchor(anchor3);
    env.addObject(uwbTagRobot);
    robot.attachUwbTag(uwbTagRobot);


    // Attach UWB tag to human and add to environment
    const uwbTagHuman = new UwbTag(20, 95);
    uwbTagHuman.attachAnchor(anchor1);
    uwbTagHuman.attachAnchor(anchor2);
    uwbTagHuman.attachAnchor(anchor3);
    env.addObject(uwbTagHuman);
    human.attachUwbTag(uwbTagHuman);


    // Create a map builder for the human
    const humanTravelMap = getMapBuilder(globalConfigsProvider.getConfig("humanTravelMapName"), human.getAveragedUwbBearing(), DrawingColor.BLUE);
    setInterval(() => {
        const position = getPositionFromUwbBearing(uwbTagHuman.getBearing());
        humanTravelMap.addPosition(position);
    }, 80);

    // Create a map builder for the robot
    const robotTravelMap = getMapBuilder(globalConfigsProvider.getConfig("robotTravelMapName"), robot.getAveragedUwbBearing(), DrawingColor.RED);
    setInterval(() => {
        const position = getPositionFromUwbBearing(uwbTagRobot.getBearing());
        robotTravelMap.addPosition(position);
    }, 80);

    const robotController = new RobotController(robot, robotTravelMap, canvas);

    return { env, robotController, human, uwbTagRobot, humanTravelMap };
}