import { Environment } from "../environment/environment";
import { MovableObject } from "../environment/movable_object";
import { Position } from "../types";

export class Human extends MovableObject {

    drawLegend(position: Position): void {
        this.canvas?.drawCircle(`${this.id}-legend`, position.x, position.y, this.radius, this.fillColor, this.stroke, 1);
        this.canvas?.drawText(`${this.id}-legend`, position.x + 10, position.y + 5, "Human Subject", "white", 1);
    }


    draw(): void {
        this.canvas?.drawCircle(this.id, this.x, this.y, this.radius, this.fillColor, this.stroke, 1);
    }

    constructor(x: number, y: number, env: Environment) {
        super(x, y, env);
        this.fillColor = "#FFA0FF";
    }

    roam(): void {
    }
}