import { Environment } from "../Environment/Environment";
import { MovableObject } from "../Environment/MovableObject";

export class Human extends MovableObject {

    draw(): void {
        this.canvas?.drawCircle(this.id, this.x, this.y, this.radius, this.fillColor, this.stroke, 1);
    }

    constructor(x: number, y: number, env: Environment) {
        super(x, y, env);
    }

    roam(): void {
    }
}