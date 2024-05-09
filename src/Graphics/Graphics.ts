import Konva from "konva";

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
    moveObejct(id: string, position: Position): void;
    enableDebugMode(options: DebugModeOptions): void;
    disableDebugMode(): void;
    drawCircle(id: string, x: number, y: number, radius: number, fillColor: string, strokeColor: string, strokeWidth: number): void;
    drawLine(id: string, x1: number, y1: number, x2: number, y2: number, strokeColor: string, strokeWidth: number): void;
    clearLines(): void;
    removeObject(id: string): void;
    setScale(scale: number): void;
}

interface ObjectData {
    id: string;
    shape: Konva.Shape;
}

export interface Position {
    x: number;
    y: number;
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

    drawLine(id: string, x1: number, y1: number, x2: number, y2: number, strokeColor: string, strokeWidth: number) {
        const line = new Konva.Line({
            points: [x1 * this.scale, y1 * this.scale, x2 * this.scale, y2 * this.scale],
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

export const CanvasImpl: Canvas = new GraphicsAdapter("container");