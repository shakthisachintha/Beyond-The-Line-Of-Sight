import { Direction, Position, SurrondingDistances } from "../types";
import { UwbTag } from "../UWB/Tag";
import { BaseObject } from "./BaseObject";
import { Environment } from "./Environment";

export abstract class MovableObject extends BaseObject {
    protected radius: number = 1;
    protected travelDistance: number = 1;
    protected direction: number = 0;
    protected env: Environment;
    protected uwbTag: UwbTag | null = null;

    constructor(x: number, y: number, env: Environment) {
        super(x, y);
        this.env = env;
    }

    attachUwbTag(tag: UwbTag): void {
        this.uwbTag = tag;
        this.uwbTag.setPosition(this.x, this.y);
    }

    positionMove(target: Position): void {
        this.x = target.x;
        this.y = target.y;
        this.uwbTag?.setPosition(this.x, this.y);
        this.canvas?.moveObejct(this.id, { x: this.x, y: this.y });
    }

    move(direction: Direction, displacement?: number): void {
        const scanResult = this.scan(this.radius * 2.5);  // Scan for obstacles ahead
        const distance = displacement || this.travelDistance;
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

    protected scan(radius: number): SurrondingDistances {
        return this.env.getSurrounding(radius, { x: this.x, y: this.y });
    }
}