import { Canvas } from "../graphics/graphics";
import { Position } from "../types";

export abstract class BaseObject {
    protected id: string = `base-object-${Math.random().toString(36).substring(2, 9)}`;
    protected fillColor: string = 'black';
    protected stroke: string = 'black';
    protected strokeWidth: number = 1;
    protected canvas?: Canvas;
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    getFillColor(): string {
        return this.fillColor;
    }

    abstract drawLegend(position: Position): void 

    setFillColor(color: string) {
        this.fillColor = color;
    }

    setStroke(stroke: string) {
        this.stroke = stroke;
    }

    setCanvas(canvas: Canvas) {
        this.canvas = canvas;
    }

    setID(id: string) {
        if (id) {
            this.id = id;
        }
    }

    getID(): string {
        return this.id;
    }

    abstract draw(): void;
}