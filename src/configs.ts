interface GlobalConfigs {
    showDebugLabels: boolean;
    showUwbDistanceLines: boolean;
    showUwbDistanceCircles: boolean;
    showObstacleDetectionLines: boolean;
    mapScale: number;
    humanTravelMapName: string;
    robotTravelMapName: string;
    obstacleInflationFactor: number;
    showInflatedObstacles: boolean;
    showAstarPath: boolean;
    robotMoveSpeed: number;
    localizationMapScale: number;
    lidarMapScale: number;
    uwbTagErrorPercentage: number;
    emaAlpha: number;
}

type configKeys = 'showDebugLabels' |
    'showUwbDistanceLines' |
    'showUwbDistanceCircles' |
    'showObstacleDetectionLines' |
    'mapScale' |
    'humanTravelMapName' |
    'robotTravelMapName' |
    'obstacleInflationFactor' |
    'showInflatedObstacles' |
    'showAstarPath' |
    'robotMoveSpeed' |
    'localizationMapScale' |
    'lidarMapScale' |
    'uwbTagErrorPercentage' | 
    'emaAlpha';

class GlobalConfigsProvider {

    private static instance: GlobalConfigsProvider;

    private configs: GlobalConfigs = {
        showDebugLabels: false,
        showUwbDistanceLines: false,
        showUwbDistanceCircles: false,
        showObstacleDetectionLines: false,
        humanTravelMapName: 'human_travel_map',
        robotTravelMapName: 'robot_travel_map',
        obstacleInflationFactor: 2,
        showAstarPath: false,
        showInflatedObstacles: false,
        robotMoveSpeed: 8,
        mapScale: 7,
        localizationMapScale: 4,
        lidarMapScale: 3,
        uwbTagErrorPercentage: 0.1,
        emaAlpha: 0.1
    };
    private listeners: Map<configKeys, ((value: any) => void)[]> = new Map();

    public static getInstance(): GlobalConfigsProvider {
        if (!GlobalConfigsProvider.instance) {
            GlobalConfigsProvider.instance = new GlobalConfigsProvider();
        }
        return GlobalConfigsProvider.instance;
    }

    private constructor() { }

    public setConfig(config: configKeys, value: any): void {
        this.configs[config] = value as never;
        if (this.listeners.has(config)) {
            this.listeners.get(config)?.forEach(listener => listener(value));
        }
    }

    public getConfig(config: configKeys): any {
        return this.configs[config];
    }

    public addConfigChangeListener(config: configKeys | "any", callback: (value: any) => void): void {
        if (config === "any") {
            Object.keys(this.configs).forEach(key => {
                if (this.listeners.has(key as configKeys)) {
                    this.listeners.get(key as configKeys)?.push(callback);
                } else {
                    this.listeners.set(key as configKeys, [callback]);
                }
            });
            return
        } else {
            if (this.listeners.has(config)) {
                this.listeners.get(config)?.push(callback);
            } else {
                this.listeners.set(config, [callback]);
            }
        }
    }

    public getAllConfigs(): Map<string, string> {
        const configMap = new Map<string, string>();
        Object.keys(this.configs).forEach(key => {
            // @ts-ignore
            configMap.set(key, this.configs[key] as string);
        });
        return configMap;
    }
}

export const globalConfigsProvider = GlobalConfigsProvider.getInstance();