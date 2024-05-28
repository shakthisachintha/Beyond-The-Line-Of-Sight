import { Canvas } from "../graphics/graphics";
import { Position } from "../types";
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
        const startPositon = convertPositionToInt((getPositionFromUwbBearing(this.robot.getUwbBearing())));
        const endPosition = convertPositionToInt(targetPosition);
        const path = AstarPathPlanner.findPath(startPositon, endPosition, map);

        if (this.canvas) {
            this.canvas.removeObject("path");
            path.forEach((pos) => {
                this.canvas!.drawRectangle("path", pos.x, pos.y, 1, 1, "red", "red", 1);
            });
        }

        return path;
    }
}