import { Canvas, MapCanvasImpl } from "../graphics/graphics";
import { DrawingColor, Position } from "../types";
import { humanizeString } from "../utils";

interface MapEntry {
    color: DrawingColor
    positions: Position[];
}

class MapBuider {
    private map: Map<string, MapEntry> = new Map<string, MapEntry>();
    private canvas: Canvas;

    constructor() {
        this.canvas = MapCanvasImpl;
        this.init();
    }

    registerMap(mapName: string, color: DrawingColor) {
        this.map.set(mapName, { color, positions: [] });
        this.drawMapLegend();
    }

    addPosition(mapName: string, position: Position) {
        const mapEntry = this.map.get(mapName);
        if (mapEntry) {
            // if last position is the same as the new one, do not add it
            const lastPosition = mapEntry.positions[mapEntry.positions.length - 1];
            if (lastPosition && lastPosition?.x !== position.x || lastPosition?.y !== position.y) {
                // if current position is within the 1 radius circle of the last position, do not add it
                if (mapEntry.positions.length > 0) {
                    const distance = Math.sqrt(Math.pow(position.x - lastPosition?.x, 2) + Math.pow(position.y - lastPosition?.y, 2));
                    if (distance > 2) {
                        mapEntry.positions.push(position);
                        this.drawMapLinePolygon(mapName);
                    }
                } else {
                    mapEntry.positions.push(position);
                    this.drawMapLinePolygon(mapName);
                }
            }
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
            index++
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

    init() {
        this.canvas.setScale(5);
        this.canvas.drawBackdrop({ width: 100, height: 100, fillColor: "#FFFFF1", strokeColor: 'black' });
    }

}

const mapBuilder = new MapBuider();

export const getMapBuilder = (mapName: string, color: string) => {
    mapBuilder.registerMap(mapName, color as DrawingColor);
    return {
        addPosition: (position: Position) => mapBuilder.addPosition(mapName, position),
        getMap: () => mapBuilder.getMap(mapName),
        // @ts-ignore
        getCurrentPosition: () => mapBuilder.getMap(mapName)?.positions[mapBuilder.getMap(mapName)?.positions.length - 1]
    }
}
