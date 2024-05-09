import { Environment, SurrondingDistances } from "../Environment/Environment";
import { BaseObject } from "../Environment/BaseObject";
import { UwbTag } from "../UWB/Tag";

export class Human extends BaseObject {

    private env: Environment;
    private uwbTag: UwbTag | null = null;
    private color: string = 'purple';
    private radius: number = 1;

    draw(): void {
        this.canvas?.drawCircle(this.id, this.x, this.y, this.radius, this.color, this.color, 1);
    }

    constructor(x: number, y: number, env: Environment) {
        super(x, y);
        this.env = env;
    }

    attachUwbTag(tag: UwbTag): void {
        this.uwbTag = tag;
        this.uwbTag.setPosition(this.x, this.y);
    }

    move(direction: "up" | "down" | "left" | "right", distance: number): void {
        const radius = 2; // Radius of the object
        const scanResult = this.env.getSurrounding(radius, { x: this.x, y: this.y }) // Scan for obstacles ahead

        // Calculate target position based on direction and distance
        let targetX = this.x;
        let targetY = this.y;
        switch (direction) {
            case "up":
                targetY -= distance;
                break;
            case "down":
                targetY += distance;
                break;
            case "left":
                targetX -= distance;
                break;
            case "right":
                targetX += distance;
                break;
        }

        // Check for obstacles in the path
        const obstacleAhead = this.checkObstacleAhead(scanResult, direction);

        if (!obstacleAhead) {
            // If path is clear, proceed
            this.x = targetX;
            this.y = targetY;
            this.uwbTag?.setPosition(this.x, this.y);
            this.canvas?.moveObejct(this.id, { x: this.x, y: this.y });

        } else {
            // Obstacle detected - handling logic here
            console.log('Obstacle detected! Movement blocked.');
        }
    }

    private checkObstacleAhead(scanResult: SurrondingDistances, direction: string): boolean {
        switch (direction) {
            case "up":
                return scanResult.up > 0;
            case "down":
                return scanResult.down > 0;
            case "left":
                return scanResult.left > 0;
            case "right":
                return scanResult.right > 0;
            default:
                return false;
        }
    }

    roam(): void {
    }

}