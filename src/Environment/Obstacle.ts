import { Position } from "../types";
import { BaseObject } from "./base_object";

export class Obstacle extends BaseObject {

    drawLegend(position: Position): void {
        this.canvas?.drawRectangle(`${this.id}-legend`, position.x, position.y, 10, 10, "white", "white", this.strokeWidth);
        this.canvas?.drawText(`${this.id}-legend`, position.x + 10, position.y + 5, "Obstacle", "white", 1);
    }

    public width: number;
    public height: number;
    public id: string;

    constructor(width: number, height: number, x: number, y: number) {
        super(x, y);
        this.width = width;
        this.height = height;
        this.id = Math.random().toString(36).substring(7);
    }

    draw() {
        this.canvas?.drawRectangle(this.id, this.x, this.y, this.width, this.height, this.fillColor, this.stroke, this.strokeWidth);
    }
}