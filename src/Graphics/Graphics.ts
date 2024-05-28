import Konva from "konva";
import { Position } from "../types";

interface BacdropConfig {
    width: number;
    height: number;
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
}

interface DebugModeOptions {
    showCoordinates: boolean;
    showDimensions: boolean;
    mapScale: number;
}

export interface Canvas {
    drawBackdrop(config: BacdropConfig): void;
    drawRectangle(id: string, x: number, y: number, width: number, height: number, fillColor: string, strokeColor: string, strokeWidth: number): void;
    drawText(id: string, x: number, y: number, text: string, color: string, size: number): void;
    moveObejct(id: string, position: Position): void;
    enableDebugMode(options: DebugModeOptions): void;
    disableDebugMode(): void;
    drawCircle(id: string, x: number, y: number, radius: number, fillColor: string, strokeColor: string, strokeWidth: number): void;
    drawLine(id: string, x1: number, y1: number, x2: number, y2: number, strokeColor: string, strokeWidth: number): void;
    drawContiguousLine(id: string, points: Position[], strokeColor: string, strokeWidth: number): void;
    drawEnvGrid(width: number, height: number, cellSize?: number): void;
    removeEnvGrid(): void;
    clearLines(): void;
    removeObject(id: string): void;
    setScale(scale: number): void;
}

interface ObjectData {
    id: string;
    shape: Konva.Shape;
}

class GraphicsAdapter implements Canvas {

    private stage: Konva.Stage;
    private scale = 1;
    private debugMode: boolean = false;
    private debugOptions: DebugModeOptions = {
        showCoordinates: true,
        showDimensions: true,
        mapScale: 10
    }
    private layer: Konva.Layer = new Konva.Layer();
    private objects: ObjectData[] = [];

    constructor(containerId: string) {
        this.stage = new Konva.Stage({
            container: containerId,
        });
    }

    private convertToCanvasPosition(position: Position): Position {
        // position are given like (0,0) to (100,100) where 100 is the max width and height
        // we assume 0,0 is at the bottom left corner but the canvas has 0,0 at the top left corner
        // so we need to convert the position to the canvas position
        return { x: position.x, y: 100 - position.y };
    }

    private convertToEnvPosition(position: Position): Position {
        return { x: position.x, y: 100 - position.y };
    }

    enableDebugMode(): void {
        this.debugMode = true;
        const mapScale = this.debugOptions.mapScale;
        const fontSize = mapScale * 1.5
        this.objects.forEach(obj => {
            const shape = obj.shape;
            const x = shape.getAttr("x") / this.scale;
            const y = shape.getAttr("y") / this.scale;
            const width = shape.getAttr("width") / this.scale;
            const height = shape.getAttr("height") / this.scale;

            const textAtOrigin = new Konva.Text({
                id: `debug-label-${obj.id}`,
                x: x + 5,
                y: y + 5,
                text: `(${x / mapScale},${y / mapScale})`,
                fontSize,
                fill: 'white'
            });
            const textAtEnd = new Konva.Text({
                id: `debug-label-${obj.id}`,
                x: (x + width) * this.scale - 60,
                y: (y + height) * this.scale - 20,
                text: `(${(x + width) / mapScale},${(y + height) / mapScale})`,
                fontSize,
                fill: 'white'
            });

            // at the center it should print height and width
            const textAtCenter = new Konva.Text({
                id: `debug-label-${obj.id}`,
                x: (x + width / 2) * this.scale - 20,
                y: (y + height / 2) * this.scale - 20,
                text: `${width / mapScale}x${height / mapScale}`,
                fontSize,
                fill: 'white'
            });
            this.objects.push({ id: `debug-label-${obj.id}`, shape: textAtOrigin });
            this.objects.push({ id: `debug-label-${obj.id}`, shape: textAtEnd });
            this.objects.push({ id: `debug-label-${obj.id}`, shape: textAtCenter });
            this.layer.add(textAtEnd);
            this.layer.add(textAtOrigin);
            this.layer.add(textAtCenter);
        })
        this.layer.draw();
    }

    disableDebugMode(): void {
        this.debugMode = false;
        const labels = this.objects.filter(obj => obj.id.includes("debug-label"));
        labels.forEach(label => {
            label.shape.destroy();
        });
        this.objects = this.objects.filter(obj => !obj.id.includes("debug-label"));
    }

    setScale(scale: number): void {
        this.scale = scale;
    }

    removeObject(id: string): void {
        const object = this.objects.filter(obj => obj.id === id);
        if (object) {
            object.forEach(obj => {
                obj.shape.destroy();
            });
            this.layer.draw();
        }
        this.objects = this.objects.filter(obj => obj.id !== id);
    }

    drawBackdrop({ width, height, fillColor = 'white', strokeColor = 'black', strokeWidth = 4 }: BacdropConfig) {
        const background = new Konva.Rect({
            x: 0,
            y: 0,
            width: width * this.scale,
            height: height * this.scale,
            fill: fillColor,
            stroke: strokeColor,
            strokeWidth
        });
        this.stage.setAttr("width", width * this.scale);
        this.stage.setAttr("height", height * this.scale);
        this.layer.add(background);
        this.stage.add(this.layer);
    }

    drawEnvGrid(width: number, height: number, cellSize: number = 1) {

        for (let i = 0; i < width; i += cellSize) {
            this.drawLine(`grid-line-x-${i}`, i, 0, i, height, 'black', 1);
        }

        for (let i = 0; i < height; i += cellSize) {
            this.drawLine(`grid-line-y-${i}`, 0, i, width, i, 'black', 1);
        }
    }

    removeEnvGrid() {
        this.objects.filter(obj => obj.id.includes("grid-line")).forEach(obj => {
            obj.shape.destroy();
        });
    }

    drawRectangle(id: string, x: number, y: number, width: number, height: number, fillColor: string, strokeColor: string, strokeWidth: number) {
        const rect = new Konva.Rect({
            x: x * this.scale,
            y: y * this.scale,
            width: width * this.scale,
            height: height * this.scale,
            fill: fillColor,
            stroke: strokeColor,
            strokeWidth
        });
        this.layer.add(rect);

        if (this.debugMode) {
            // need to draw the cordiantes of the object on the canvas at diaganol ends of the object
            const mapScale = this.debugOptions.mapScale;
            const fontSize = mapScale * 1.5
            const textAtOrigin = new Konva.Text({
                x: x * this.scale + 5,
                y: y * this.scale + 5,
                text: `(${x / mapScale},${y / mapScale})`,
                fontSize,
                fill: 'white'
            });
            const textAtEnd = new Konva.Text({
                x: (x + width) * this.scale - 60,
                y: (y + height) * this.scale - 20,
                text: `(${(x + width) / mapScale},${(y + height) / mapScale})`,
                fontSize,
                fill: 'white'
            });

            // at the center it should print height and width
            const textAtCenter = new Konva.Text({
                x: (x + width / 2) * this.scale - 20,
                y: (y + height / 2) * this.scale - 20,
                text: `${width / mapScale}x${height / mapScale}`,
                fontSize,
                fill: 'white'
            });
            this.layer.add(textAtEnd);
            this.layer.add(textAtOrigin);
            this.layer.add(textAtCenter);
        }

        this.objects.push({ id, shape: rect });
    }

    moveObejct(id: string, position: Position) {
        const object = this.objects.find(obj => obj.id === id);
        if (object) {
            // move all text and the object
            object.shape.setAttr("x", position.x * this.scale);
            object.shape.setAttr("y", position.y * this.scale);
            this.layer.draw();
        }
    }

    drawCircle(id: string, x: number, y: number, radius: number, fillColor: string, strokeColor: string, strokeWidth: number) {
        const circle = new Konva.Circle({
            x: x * this.scale,
            y: y * this.scale,
            radius: radius * this.scale,
            fill: fillColor,
            stroke: strokeColor,
            strokeWidth
        });
        this.layer.add(circle);
        this.objects.push({ id, shape: circle });
    }

    drawText(id: string, x: number, y: number, text: string, color: string, size: number) {
        const textObj = new Konva.Text({
            x: x * this.scale,
            y: y * this.scale,
            text,
            fontSize: size * this.scale,
            fill: color
        });
        this.layer.add(textObj);
        this.objects.push({ id, shape: textObj });
    }

    drawLine(id: string, x1: number, y1: number, x2: number, y2: number, strokeColor: string, strokeWidth: number) {
        const line = new Konva.Line({
            points: [x1 * this.scale, y1 * this.scale, x2 * this.scale, y2 * this.scale],
            stroke: strokeColor,
            strokeWidth
        });
        this.layer.add(line);
        this.objects.push({ id, shape: line });

    }

    drawContiguousLine(id: string, points: Position[], strokeColor: string, strokeWidth: number) {
        const line = new Konva.Line({
            points: points.map(point => [point.x * this.scale, point.y * this.scale]).flat(),
            stroke: strokeColor,
            strokeWidth
        });
        this.layer.add(line);
        this.objects.push({ id, shape: line });
    }

    clearLines() {
        const lines = this.objects.filter(obj => obj.id.includes("line"));
        lines.forEach(line => {
            line.shape.destroy();
        });
        this.objects = this.objects.filter(obj => !obj.id.includes("line"));
        // remove all lines
        this.layer.draw();
    }
}

export const CanvasImpl: Canvas = new GraphicsAdapter("simulation-container");
export const MapCanvasImpl: Canvas = new GraphicsAdapter("map-container");