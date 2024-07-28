import { CanvasImpl } from './graphics/graphics';
import { createSimulator } from './setup/simulator_setup';
import { registerEventListeners as registerEventListeners } from './setup/event_listeners';
import '../main.css';
import { webSocketClient } from './ws';
import { globalConfigsProvider } from './configs';
import { humanizeCamelCase, humanizeString } from './utils';

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
        "resolveOcclusionEnvKnown": () => robotController.handleOcclusionInKnownEnvironment(humanTravelMap.getCurrentPosition()!, env.getEnvMatrixRepresentation()),
        "resolveOcclusionEnvUnknown": () => robotController.handleOcclusionInUnknownEnvironment(humanTravelMap.getCurrentPosition()!)
    }
}

const renderProperties = () => {
    const propertiesContainer = document.getElementById("simulatorPropertiesContainer");
    // clear the container
    propertiesContainer!.innerHTML = "";
    globalConfigsProvider.getAllConfigs().forEach((value, key) => {
        const property = document.createElement("div");
        property.className = "config-property";
        property.innerHTML = `${humanizeCamelCase(key)}: ${value}`;
        propertiesContainer?.appendChild(property);
    })
}

globalConfigsProvider.addConfigChangeListener("any", (value) => {
    renderProperties();
});

globalConfigsProvider.addConfigChangeListener("robotMoveSpeed", (value) => {
    robotController.changeRobotSpeed(value);
});

registerEventListeners(events);
renderProperties();

// webSocketClient.subscribe("simulatorGraphics");

// scenario 1 
// Robot knows the whole entire map of the environment
// So it can plan the path to the target position
// Can use A* algorithm to find the path

// scenario 2
// Robot does not know the whole entire map of the environment
// Robot knows the target position
// Cannot use A* algorithm to find the path (since it does not know the whole map)
// Robot have to scan the environment to find the path
// Robot can use the D*-Lite algorithm to find the path
