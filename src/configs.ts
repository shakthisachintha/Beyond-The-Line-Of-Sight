interface GlobalConfigs {
    showDebugLabels: boolean;
    showUwbDistanceLines: boolean;
    showUwbDistanceCircles: boolean;
    showObstacleDetectionLines: boolean;
    mapScale: number;
    humanTravelMapName: string;
    robotTravelMapName: string;
}

type configKeys = 'showDebugLabels' |
    'showUwbDistanceLines' |
    'showUwbDistanceCircles' |
    'showObstacleDetectionLines' | 
    'mapScale' |
    'humanTravelMapName' |
    'robotTravelMapName';

class GlobalConfigsProvider {

    private static instance: GlobalConfigsProvider;

    private configs: GlobalConfigs = {
        showDebugLabels: false,
        showUwbDistanceLines: false,
        showUwbDistanceCircles: false,
        showObstacleDetectionLines: false,
        humanTravelMapName: 'human_travel_map',
        robotTravelMapName: 'robot_travel_map',
        mapScale: 1
    };

    public static getInstance(): GlobalConfigsProvider {
        if (!GlobalConfigsProvider.instance) {
            GlobalConfigsProvider.instance = new GlobalConfigsProvider();
        }
        return GlobalConfigsProvider.instance;
    }

    private constructor() { }

    public setConfig(config: configKeys, value: any): void {
        this.configs[config] = value as never;
    }

    public getConfig(config: configKeys): any {
        return this.configs[config];
    }
}

export const globalConfigsProvider = GlobalConfigsProvider.getInstance();