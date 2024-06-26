import { Environment } from "../environment/environment";
import { MovableObject } from "../environment/movable_object";
import { Position, SurroundingDistances } from "../types";

export class Robot extends MovableObject {

    drawLegend(position: Position): void {
        this.canvas?.drawCircle(`${this.id}-legend`, position.x, position.y, 5, this.fillColor, this.stroke, 1);
        this.canvas?.drawText(`${this.id}-legend`, position.x + 10, position.y + 5, "Robot", "black", 1);
    }

    constructor(x: number, y: number, env: Environment) {
        super(x, y, env);
        this.fillColor = "#F9f2F2";
        this.stroke = "FF0000"
        this.id = `robot-${Math.random().toString(36).substring(2, 9)}`;
        this.radius = 1.5;
        this.init();
    }

    getLidarReading(): SurroundingDistances {
        // Get lidar reading
        const env = this.env;
        const surrounding = env.getSurrounding(10, { x: this.x, y: this.y });
        return surrounding;
    }

    draw(): void {
        this.canvas?.drawTriangle(this.id, this.x, this.y, this.radius, this.fillColor, this.stroke, 2);
    }

    init = (): void => {
        setInterval(() => {
            // this.getLidarReading();
        }, 1000);
    }
}