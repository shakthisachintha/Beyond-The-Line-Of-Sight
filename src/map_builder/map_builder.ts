import { globalConfigsProvider } from "../configs";
import { Canvas, UWBMapCanvasImpl } from "../graphics/graphics";
import { DrawingColor, Position } from "../types";
import { humanizeString } from "../utils";

export interface MapEntry {
    color: DrawingColor;
    positions: Position[];
}

class MapBuilder {
    private map: Map<string, MapEntry> = new Map<string, MapEntry>();
    private canvas: Canvas;
    private emaAlpha: number;
    private emaPositions: Map<string, Position>;

    constructor(emaAlpha: number) {
        this.canvas = UWBMapCanvasImpl;
        this.emaAlpha = emaAlpha;
        this.emaPositions = new Map<string, Position>();
    }

    registerMap(mapName: string, color: DrawingColor, startingPosition: Position) {
        this.map.set(mapName, { color, positions: [] });
        this.emaPositions.set(mapName, startingPosition);
        this.drawMapLegend();
    }

    addPosition(mapName: string, position: Position) {
        const mapEntry = this.map.get(mapName);
        if (mapEntry) {
            // Update EMA
            const lastEmaPosition = this.emaPositions.get(mapName) || { x: 0, y: 0 };
            const emaPosition = {
                x: this.emaAlpha * position.x + (1 - this.emaAlpha) * lastEmaPosition.x,
                y: this.emaAlpha * position.y + (1 - this.emaAlpha) * lastEmaPosition.y
            };
            this.emaPositions.set(mapName, emaPosition);

            // Add smoothed position
            mapEntry.positions.push(emaPosition);
            this.drawMapLinePolygon(mapName);
        }
    }

    getMap(mapName: string) {
        return this.map.get(mapName);
    }

    drawMapLegend() {
        let index = 0;
        this.map.forEach((map, mapName) => {
            this.canvas.drawCircle(`${mapName}-legend`, 3, 4 + index * 4, 1, map.color, map.color, 1);
            this.canvas.drawText(`${mapName}-legend-text`, 5, 2.8 + index * 4, humanizeString(mapName), map.color, 2.5);
            index++;
        });
    }

    drawMapLinePolygon(mapName: string) {
        const map = this.map.get(mapName);
        if (map) {
            // draw map line
            this.canvas.removeObject(mapName);
            this.canvas.drawContiguousLine(mapName, map.positions, map.color, 1);

            // draw start point
            this.canvas.removeObject(`${mapName}-start`);
            this.canvas.drawCircle(`${mapName}-start`, map.positions[0].x, map.positions[0].y, 0.5, map.color, map.color, 1);

            // draw current point
            this.canvas.removeObject(`${mapName}-current`);
            this.canvas.drawCircle(`${mapName}-current`, map.positions[map.positions.length - 1].x,
                map.positions[map.positions.length - 1].y, 0.5, map.color, map.color, 1);
        }
    }
}

const mapBuilder = new MapBuilder(globalConfigsProvider.getConfig("emaAlpha"));

export interface MapBuilderInstance {
    addPosition: (position: Position) => void;
    getMap: () => MapEntry | undefined;
    getCurrentPosition: () => Position;
}

export const getMapBuilder = (mapName: string, startingPosition: Position, color: DrawingColor = DrawingColor.BLUE): MapBuilderInstance => {
    if (!mapBuilder.getMap(mapName)) {
        mapBuilder.registerMap(mapName, color as DrawingColor, startingPosition);
    }
    return {
        addPosition: (position: Position) => mapBuilder.addPosition(mapName, position),
        getMap: () => mapBuilder.getMap(mapName),
        getCurrentPosition: () => {
            const map = mapBuilder.getMap(mapName);
            const lastPosition = map?.positions[map.positions.length - 1];
            return lastPosition || { x: 0, y: 0 };
        }
    };
};
