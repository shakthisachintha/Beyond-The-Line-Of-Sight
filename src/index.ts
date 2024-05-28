import { CanvasImpl } from './graphics/graphics';
import { createSimulator } from './setup/simulator_setup';
import { DrawingColor } from './types';
import { getMapBuilder } from './map_builder/map_builder';
import { getPositionFromUwbBearing } from './utils';
import { registerEventListners } from './setup/event_listeners';
import '../main.css';

// Create the simulator environment
const { uwbTagHuman, uwbTagRobot, human, robot } = createSimulator(CanvasImpl);

// Register event listners
registerEventListners(human, robot);

// Create a map builder for the human
const humanTravelMap = getMapBuilder("human-travel-map", DrawingColor.BLUE);
setInterval(() => {
    const position = getPositionFromUwbBearing(uwbTagHuman.getBearing());
    humanTravelMap.addPosition(position);
}, 100);

// Create a map builder for the robot
const robotTravelMap = getMapBuilder("robot-travel-map", DrawingColor.RED);
setInterval(() => {
    const position = getPositionFromUwbBearing(uwbTagRobot.getBearing());
    robotTravelMap.addPosition(position);
}, 100);

