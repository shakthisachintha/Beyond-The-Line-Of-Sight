import { CanvasImpl } from './graphics/graphics';
import { createSimulator } from './setup/simulator_setup';
import { registerEventListeners as registerEventListeners } from './setup/event_listeners';
import '../main.css';
import { webSocketClient } from './ws';

// Create the simulator environment
const { human, robotController, env, humanTravelMap } = createSimulator(CanvasImpl);

// Register event listeners
const events = {
    keyBindings: {
        "ArrowUp": () => human.move("up"),
        "ArrowDown": () => human.move("down"),
        "ArrowLeft": () => human.move("left"),
        "ArrowRight": () => human.move("right"),
        "w": () => robotController.moveRobot("up"),
        "s": () => robotController.moveRobot("down"),
        "a": () => robotController.moveRobot("left"),
        "d": () => robotController.moveRobot("right"),
    },
    clicks: {
        "resolveOcclusion": () => robotController.handleOcclusionInKnownEnvironment(humanTravelMap.getCurrentPosition()!, env.getEnvMatrixRepresentation()),
        // "resolveOcclusion": () => robotController.handleOcclusionInUnknownEnvironment(humanTravelMap.getCurrentPosition()!),
        // "resolveOcclusion": () => console.log("resolve occlusion"),
    }
}
registerEventListeners(events);
// webSocketClient.subscribe("simulatorGraphics");

// scenario 1 
// Robot knows the whole entire map of the environment
// So it can plan the path to the target position
// Can use A* algorithm to find the path

// scenario 2
// Robot knows the whole entire map of the environment
// Robot knows the target position
// Cannot use A* algorithm to find the path

// scenario 3
// Robot does not know the whole entire map of the environment
// Robot knows the target position
// Cannot use A* algorithm to find the path
// Robot have to scan the environment to find the path
