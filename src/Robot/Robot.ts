import { globalConfigsProvider } from "../configs";
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
        this.speed = globalConfigsProvider.getConfig("robotMoveSpeed");
    }

    setSpeed(speed: number): void {
        this.speed = speed;
    }

    getLidarReading(range: number): SurroundingDistances {
        // Get lidar reading
        const env = this.env;
        let surrounding = env.getSurrounding(range, { x: this.x, y: this.y });
        // if any of the surrounding is zero it means a free space available longer than the range
        // so set the value to the range
        surrounding = {
            down: surrounding.down === 0 ? range : surrounding.down,
            up: surrounding.up === 0 ? range : surrounding.up,
            left: surrounding.left === 0 ? range : surrounding.left,
            right: surrounding.right === 0 ? range : surrounding.right
        }
        surrounding.down = surrounding.down - this.radius;
        surrounding.up = surrounding.up - this.radius;
        surrounding.left = surrounding.left - this.radius;
        surrounding.right = surrounding.right - this.radius;
        // if any of the surrounding is less than 0, set it to 0
        surrounding = {
            down: surrounding.down < 0 ? 0 : Math.floor(surrounding.down),
            up: surrounding.up < 0 ? 0 : Math.floor(surrounding.up),
            left: surrounding.left < 0 ? 0 : Math.floor(surrounding.left),
            right: surrounding.right < 0 ? 0 : Math.floor(surrounding.right)
        }
        return surrounding;
    }

    draw(): void {
        this.canvas?.drawTriangle(this.id, this.x, this.y, this.radius, this.fillColor, this.stroke, 2);
        this.canvas?.drawText(this.id, this.x, this.y + 2, "   Robot", "red", 2);
    }
}