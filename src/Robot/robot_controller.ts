import { Canvas, ExploredMapCanvasImpl } from "../graphics/graphics";
import { Direction, Position, SurroundingDistances } from "../types";
import { convertPositionToInt } from "../utils";
import { AstarPathPlanner } from "./astar";
import { Robot } from "./robot";

interface PositionWithDistance extends Position {
    distance: number;
}

export class RobotController {

    private robot: Robot;
    private canvas?: Canvas;
    private discoveredMap: number[][] = [];
    private lidarRange = 5;

    constructor(robot: Robot, canvas?: Canvas) {
        this.robot = robot;
        this.canvas = canvas;
        this.discoveredMap = Array.from({ length: 100 }, () => Array.from({ length: 100 }, () => 0));
        // this.init();
    }

    init() {
        ExploredMapCanvasImpl.setScale(5);
        ExploredMapCanvasImpl.drawBackdrop({ width: 100, height: 100, fillColor: "#FFFFFF", strokeColor: 'black' });
    }

    handleOcclusionInKnownEnvironment(targetPosition: Position, map: number[][]) {
        const startPosition = convertPositionToInt(this.robot.getAveragedUwbBearing());
        const endPosition = convertPositionToInt(targetPosition);
        const path = AstarPathPlanner.findPath(startPosition, endPosition, map);

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

    handleOcclusionInUnknownEnvironment(targetPosition: Position) {
        const startPosition = this.robot.getAveragedUwbBearing();
        const endPosition = targetPosition;

        // Perform initial scan and update map
        for (let i = 0; i < 4; i++) {
            const lidarReading = this.robot.getLidarReading(this.lidarRange);
            this.updateDiscoveredMap(this.robot.getAveragedUwbBearing(), lidarReading);
        }

        // Frontier-based exploration
        let path: Position[] = [];
        while (true) {
            // Identify frontiers
            const frontiers = this.identifyFrontiers();

            if (frontiers.length === 0) {
                console.log("No more frontiers to explore.");
                break;
            }

            // Select the nearest frontier
            const nearestFrontier = frontiers.reduce((nearest: PositionWithDistance, frontier) => {
                const distance = Math.hypot(frontier.x - startPosition.x, frontier.y - startPosition.y);
                return distance < nearest.distance ? { ...frontier, distance } : nearest;
            }, { x: 0, y: 0, distance: Infinity });

            // Plan path to the selected frontier
            path = AstarPathPlanner.findPath(startPosition, nearestFrontier, this.discoveredMap);

            // Move to the frontier and update the map
            for (const pos of path) {
                this.moveToPosition(pos);
                const lidarReading = this.robot.getLidarReading(this.lidarRange);
                this.updateDiscoveredMap(pos, lidarReading);
            }

            // Check if the goal is reachable
            path = AstarPathPlanner.findPath(this.robot.getAveragedUwbBearing(), endPosition, this.discoveredMap);
            if (path.length > 0) {
                break;
            }
        }

        // Move to the goal
        for (const pos of path) {
            this.moveToPosition(pos);
        }
    }

    private identifyFrontiers(): Position[] {
        const frontiers: Position[] = [];
        for (let x = 0; x < this.discoveredMap.length; x++) {
            for (let y = 0; y < this.discoveredMap[x].length; y++) {
                if (this.discoveredMap[x][y] === 0) { // If cell is unknown
                    const neighbors = this.getNeighbors(x, y);
                    if (neighbors.some(([nx, ny]) => this.discoveredMap[nx][ny] === 1)) {
                        frontiers.push({ x, y });
                    }
                }
            }
        }
        return frontiers;
    }

    private getNeighbors(x: number, y: number): number[][] {
        const neighbors = [];
        x = Math.round(x);
        y = Math.round(y);
        if (x > 0) neighbors.push([x - 1, y]);
        if (x < this.discoveredMap.length - 1) neighbors.push([x + 1, y]);
        if (y > 0) neighbors.push([x, y - 1]);
        if (y < this.discoveredMap[0].length - 1) neighbors.push([x, y + 1]);
        return neighbors;
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

    private updateDiscoveredMap(position: Position, lidarReading: SurroundingDistances) {
        const x = Math.floor(position.x);
        const y = Math.floor(position.y);
        this.discoveredMap[x][y] = 1;

        const newPositions: Position[] = [{ x, y }];

        // lidar output as this { up: 1, down: 4, left: 3, right: 0 }
        // right 0 means no obstacle detected
        // up 1 means 1 unit distance to obstacle
        // left 3 means 3 unit distance to obstacle

        if (lidarReading.up > 0) {
            for (let i = 1; i <= lidarReading.up; i++) {
                if (y - i >= 0) {
                    this.discoveredMap[x][y - i] = 1;
                    newPositions.push({ x, y: y - i });
                }
            }
        }

        if (lidarReading.down > 0) {
            for (let i = 1; i <= lidarReading.down; i++) {
                if (y + i < 100) {
                    this.discoveredMap[x][y + i] = 1;
                    newPositions.push({ x, y: y + i });
                }
            }
        }

        if (lidarReading.left > 0) {
            for (let i = 1; i <= lidarReading.left; i++) {
                if (x - i >= 0) {
                    this.discoveredMap[x - i][y] = 1;
                    newPositions.push({ x: x - i, y });
                }
            }
        }

        if (lidarReading.right > 0) {
            for (let i = 1; i <= lidarReading.right; i++) {
                if (x + i < 100) {
                    this.discoveredMap[x + i][y] = 1;
                    newPositions.push({ x: x + i, y });
                }
            }
        }

        if (ExploredMapCanvasImpl) {
            newPositions.forEach(({ x, y }) => {
                ExploredMapCanvasImpl!.drawRectangle(`discovered-map-${x}-${y}`, x, y, 1, 1, "gray", "gray", 1);
            });
        }
    }


    moveRobot(direction: Direction, distance?: number) {
        this.robot.move(direction, distance || 1);
        const lidarReading = this.robot.getLidarReading(this.lidarRange);
        this.updateDiscoveredMap(this.robot.getAveragedUwbBearing(), lidarReading);

    }
}