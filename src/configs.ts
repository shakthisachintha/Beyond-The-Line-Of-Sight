interface GlobalConfigs {
    showDebugLabels: boolean;
    showUwbDistanceLines: boolean;
    showUwbDistanceCircles: boolean;
    showObstacleDetectionLines: boolean;
}

type configKeys = 'showDebugLabels' |
    'showUwbDistanceLines' |
    'showUwbDistanceCircles' |
    'showObstacleDetectionLines'

class GlobalConfigsProvider {

    private static instance: GlobalConfigsProvider;

    private configs: GlobalConfigs = {
        showDebugLabels: false,
        showUwbDistanceLines: false,
        showUwbDistanceCircles: false,
        showObstacleDetectionLines: false
    };

    public static getInstance(): GlobalConfigsProvider {
        if (!GlobalConfigsProvider.instance) {
            GlobalConfigsProvider.instance = new GlobalConfigsProvider();
        }
        return GlobalConfigsProvider.instance;
    }

    private constructor() { }

    public setConfig(config: configKeys, value: boolean): void {
        this.configs[config] = value;
    }

    public getConfig(config: configKeys): boolean {
        return this.configs[config];
    }
}

export const globalConfigsProvider = GlobalConfigsProvider.getInstance();