import { DDDGraphicsAdapter, I3DDGraphicsAdapter } from "../graphics/3D_graphics_adapter";
import { Direction, Position, SurroundingDistances, TagBearing } from "../types";
import { getPositionFromUwbBearing } from "../utils";
import { UwbTag } from "../uwb/tag";
import { BaseObject } from "./base_object";
import { Environment } from "./environment";

export abstract class MovableObject extends BaseObject {
    protected radius: number = 1;
    protected travelDistance: number = 1;
    protected direction: number = 0;
    public env: Environment;
    protected uwbTag: UwbTag | null = null;
    protected scanRadius: number = 2.5;
    protected speed: number = 1;
    private dddGraphicsAdapter: I3DDGraphicsAdapter;
    
    constructor(x: number, y: number, env: Environment) {
        super(x, y);
        this.env = env;
        this.dddGraphicsAdapter = new DDDGraphicsAdapter();
    }

    attachUwbTag(tag: UwbTag): void {
        this.uwbTag = tag;
        this.uwbTag.setPosition(this.x, this.y);
    }

    getUwbBearing(): TagBearing[] {
        return this.uwbTag?.getBearing() || [];
    }

    canMove(direction: Direction, displacement?: number): boolean {
        const scanResult = this.scan(this.scanRadius);
        const distance = displacement || this.travelDistance;
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

        const obstacleAhead = this.checkObstacleAhead(scanResult, direction);
        return !obstacleAhead;
    }

    move(direction: Direction, displacement?: number): void {
        const scanResult = this.scan(this.scanRadius);  // Scan for obstacles ahead
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
            this.canvas?.moveObject(this.id, { x: this.x, y: this.y });
            
        } else {
            // Obstacle detected - handling logic here
            console.log('Obstacle detected! Movement blocked.');
        }
    }

    private checkObstacleAhead(scanResult: SurroundingDistances, direction: string): boolean {
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

    protected scan(radius: number): SurroundingDistances {
        const surrounding = this.env.getSurrounding(radius, { x: this.x, y: this.y });
        return surrounding;
    }

    getAveragedUwbBearing(): Position {
        const positions = []
        for (let i = 0; i < 10; i++) {
            const pos = getPositionFromUwbBearing(this.getUwbBearing());
            positions.push(pos);
        }

        // get the average position
        let robotPosition = { x: 0, y: 0 };
        positions.forEach(pos => {
            robotPosition.x += pos.x;
            robotPosition.y += pos.y;
        });
        robotPosition.x /= positions.length;
        robotPosition.y /= positions.length;

        robotPosition.x = Math.floor(robotPosition.x);
        robotPosition.y = Math.floor(robotPosition.y);
        
        return robotPosition;
    }
}