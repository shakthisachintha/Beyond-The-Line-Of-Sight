import { Environment } from "../Environment/Environment";
import { MovableObject } from "../Environment/MovableObject";

export class Robot extends MovableObject {

    constructor(x: number, y: number, env: Environment) {
        super(x, y, env);
        this.fillColor = "#FF0000"; 
        this.id = `robot-${Math.random().toString(36).substring(2, 9)}`;
    }

    draw(): void {
        this.canvas?.drawCircle(this.id, this.x, this.y, this.radius, this.fillColor, this.stroke, 1);
    }
}