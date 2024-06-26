import { globalConfigsProvider } from "../configs";
import { CanvasImpl } from "../graphics/graphics";

export function unregisterEventListeners() {
    document.removeEventListener('keydown', () => { });
    document.getElementById("addObs")?.removeEventListener('click', () => { });
    document.getElementById("removeObs")?.removeEventListener('click', () => { });
    document.getElementById("resolveOcclusion")?.removeEventListener('click', () => { });
    document.getElementById("enableObstacleLines")?.removeEventListener('change', () => { });
    document.getElementById("showDebugLabels")?.removeEventListener('change', () => { });
    document.getElementById("showUwbDistanceCircles")?.removeEventListener('change', () => { });
    document.getElementById("showUwbDistanceLines")?.removeEventListener('change', () => { });

}

interface EventBindings {
    keyBindings: { [key: string]: () => void; }
    clicks: { [key: string]: () => void; }
}

export function registerEventListeners({ keyBindings, clicks }: EventBindings) {
    // move the robot around with the arrow keys
    document.addEventListener('keydown', (event) => {
        if (event.key in keyBindings) {
            keyBindings[event.key]();
        }
    });

    for (const key in clicks) {
        document.getElementById(key)?.addEventListener('click', () => {
            clicks[key]();
        });
    }



    const tempObsId = "temp-obstacle-1"
    document.getElementById("addObs")?.addEventListener('click', () => {
        // const x = 32;
        // const y = 80
        // const width = 5;
        // const height = 5;
        // const obstacle = new Obstacle(width, height, x, y);
        // obstacle.setID(tempObsId);
        // obstacle.setFillColor('brown');
        // obstacle.setStroke('brown');
        // env.addObject(obstacle);
    });

    document.getElementById("removeObs")?.addEventListener('click', () => {
        // env.removeObject(tempObsId);
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
            CanvasImpl.enableDebugMode({ mapScale: globalConfigsProvider.getConfig("mapScale"), showCoordinates: true, showDimensions: true });
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
}