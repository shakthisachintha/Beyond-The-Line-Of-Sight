import { Canvas } from "../graphics/graphics";
import { Direction, Position } from "../types";
import { convertPositionToInt, getPositionFromUwbBearing } from "../utils";
import { AstarPathPlanner } from "./astar";
import { Robot } from "./robot";

export class RobotController {

    private robot: Robot;
    private canvas?: Canvas;

    constructor(robot: Robot, canvas?: Canvas) {
        this.robot = robot;
        this.canvas = canvas;
    }

    handleOcclusion(targetPosition: Position, map: number[][]) {
        const startPositon = convertPositionToInt(this.robot.getAveragedUwbBearing());
        const endPosition = convertPositionToInt(targetPosition);
        const path = AstarPathPlanner.findPath(startPositon, endPosition, map);

        if (this.canvas) {
            this.canvas.removeObject("path");
            path.forEach((pos) => {
                this.canvas!.drawRectangle("path", pos.x, pos.y, 1, 1, "red", "red", 1);
            });
        }

        for (let i = 1; i < path.length - 5; i += 2) {
            setTimeout(() => {
                this.moveToPosition(path[i]);
            }, 100 * i);
        }
    }

    moveToPosition(position: Position) {
        const { direction, distance } = this.getDirectionCommandToTravel(position);
        this.moveRobot(direction, distance);
    }

    private getDirectionCommandToTravel(position: Position): { direction: Direction, distance: number } {
        // get the average position
        let robotPosition = this.robot.getAveragedUwbBearing();

        const dx = position.x - robotPosition.x;
        const dy = position.y - robotPosition.y;

        let direction: Direction = "up";
        let distance = 1;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) {
                direction = "right";
                distance = Math.floor(dx);
            } else {
                direction = "left";
                distance = Math.floor(-dx);
            }
        } else {
            if (dy > 0) {
                direction = "down";
                distance = Math.floor(dy);
            } else {
                direction = "up";
                distance = Math.floor(-dy);
            }
        }


        return { direction, distance };
    }

    moveRobot(direction: Direction, distance?: number) {
        this.robot.move(direction, distance || 1);
    }
}