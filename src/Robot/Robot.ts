import { Environment } from "../environment/environment";
import { MovableObject } from "../environment/movable_object";
import { Position } from "../types";

export class Robot extends MovableObject {

    drawLegend(position: Position): void {
        this.canvas?.drawCircle(`${this.id}-legend`, position.x, position.y, 5, this.fillColor, this.stroke, 1);
        this.canvas?.drawText(`${this.id}-legend`, position.x + 10, position.y + 5, "Human Subject", "black", 1);
    }


    constructor(x: number, y: number, env: Environment) {
        super(x, y, env);
        this.fillColor = "#FF0000"; 
        this.id = `robot-${Math.random().toString(36).substring(2, 9)}`;
    }

    draw(): void {
        this.canvas?.drawCircle(this.id, this.x, this.y, this.radius, this.fillColor, this.stroke, 1);
    }
}