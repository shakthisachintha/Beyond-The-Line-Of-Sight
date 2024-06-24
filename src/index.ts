import { CanvasImpl } from './graphics/graphics';
import { createSimulator } from './setup/simulator_setup';
import { registerEventListners } from './setup/event_listeners';
import '../main.css';

// Create the simulator environment
const { human, robotController, env, humanTravelMap } = createSimulator(CanvasImpl);

// Register event listners
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
        "resolveOcclusion": () => robotController.handleOcclusion(humanTravelMap.getCurrentPosition()!, env.getEnvMatrixRepresentation()),
        // "resolveOcclusion": () => console.log("resolve occlusion"),
    }
}
registerEventListners(events);