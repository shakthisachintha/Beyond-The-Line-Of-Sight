import { globalConfigsProvider } from "../configs";
import { Canvas, ExploredMapCanvasImpl } from "../graphics/graphics";
import { MapBuilderInstance } from "../map_builder/map_builder";
import { Direction, Position } from "../types";
import { convertPositionToInt } from "../utils";
import { AstarPathPlanner } from "./astar";
import { Robot } from "./robot";

interface PositionWithDistance extends Position {
    distance: number;
}

class FrontiersPriorityQueue {
    // this should be a priority queue
    // the frontiers should be sorted based on distance
    // minimum distance should be popped first
    private frontiers: PositionWithDistance[] = [];

    addFrontier(frontier: PositionWithDistance, endPosition: Position) {
        frontier.distance = Math.hypot(frontier.x - endPosition.x, frontier.y - endPosition.y);
        this.frontiers.push(frontier);
        this.frontiers.sort((a, b) => a.distance - b.distance);
    }

    popFrontier() {
        return this.frontiers.shift();
    }

    isEmpty() {
        return this.frontiers.length === 0;
    }
}

export class RobotController {

    private robot: Robot;
    private canvas?: Canvas;
    private discoveredMap: number[][] = [];
    private lidarRange = 5;
    private robotTravelMap: MapBuilderInstance;

    constructor(robot: Robot, robotTravelMap: MapBuilderInstance,canvas?: Canvas) {
        this.robot = robot;
        this.canvas = canvas;
        this.robotTravelMap = robotTravelMap;
        this.discoveredMap = Array.from({ length: 100 }, () => Array.from({ length: 100 }, () => 1));
    }

    private async moveAlongPath(path: Position[]) {
        for (let i = 1; i < path.length; i += 1) {
            const position = path[i];
            const { direction, distance } = this.getDirectionCommandToTravel(position);
            await this.moveRobot(direction, distance);
        }
    }

    public changeRobotSpeed(speed: number) {
        this.robot.setSpeed(speed);
    }

    private getLatestRobotPosition(): Position {
        const position = this.robotTravelMap.getCurrentPosition()
        return convertPositionToInt(position);
    }

    async handleOcclusionInKnownEnvironment(targetPosition: Position, map: number[][]) {
        const startPosition = convertPositionToInt(this.getLatestRobotPosition());
        const endPosition = convertPositionToInt(targetPosition);

        const path = AstarPathPlanner.findPath(startPosition, endPosition, map).slice(0, -5);
        this.drawAStarPath(path);
        await this.moveAlongPath(path);
    }

    private drawAStarPath(path: Position[]) {
        if (globalConfigsProvider.getConfig("showAstarPath") && this.canvas) {
            this.canvas.removeSimilarObjects("a*path");
            path.slice(0, path.length - 5).forEach((pos, idx) => {
                this.canvas!.drawRectangle("a*path" + idx, pos.x, pos.y, 0.5, 0.5, "red", "red", 0.5);
            });
        }
    }

    async handleOcclusionInUnknownEnvironment(targetPosition: Position) {
        const endPosition = convertPositionToInt(targetPosition);
        const frontierDistanceThreshold = 3; // Set a distance threshold for filtering out similar frontiers

        let path: Position[] = [];
        path = AstarPathPlanner.findPath(convertPositionToInt(this.getLatestRobotPosition()), endPosition, this.discoveredMap);
        if (path.length === 0) {
            console.log("No path found");
        } else {
            // draw path
            if (this.canvas) {
                this.canvas.removeSimilarObjects("a*path");
                path.slice(0, path.length - 5).forEach((pos, idx) => {
                    this.canvas!.drawRectangle("a*path" + idx, pos.x, pos.y, 0.5, 0.5, "red", "red", 0.5);
                });
                // move robot along the path
                for (let i = 1; i < path.length; i += 1) {
                    const position = path[i];
                    const { direction, distance } = this.getDirectionCommandToTravel(position);
                    await this.moveRobot(direction, distance);
                }
            }
            return;
        }

        // Perform initial scan and update the map
        await this.updateDiscoveredMap();

        const frontierPriorityQueue = new FrontiersPriorityQueue();

        const frontiers = this.identifyFrontiers();

        // Sort the frontiers based on distance
        frontiers.forEach(frontier => {
            frontierPriorityQueue.addFrontier({ ...frontier, distance: 0 }, endPosition);
        });

        do {
            const frontier = frontierPriorityQueue.popFrontier();

            if (!frontier) {
                break;
            }

            if (this.canMoveToPosition(frontier)) {
                await this.moveToFrontierInDiscoveredMap(frontier);

                this.updateDiscoveredMap();

                const frontiers = this.identifyFrontiers();

                // draw filtered frontiers
                frontiers.forEach(({ x, y }) => {
                    ExploredMapCanvasImpl!.drawRectangle(`filtered-frontier-${x}-${y}`, x, y, 1, 1, "blue", "blue", 1);
                });

                // Sort the frontiers based on distance
                frontiers.forEach(frontier => {
                    frontierPriorityQueue.addFrontier({ ...frontier, distance: 0 }, endPosition);
                });
            }

            if (this.isPositionsNear(frontier, endPosition, frontierDistanceThreshold)) {
                break;
            }
        } while (!frontierPriorityQueue.isEmpty());

        // Perform A* path planning
        path = AstarPathPlanner.findPath(convertPositionToInt(this.getLatestRobotPosition()), endPosition, this.discoveredMap);
        if (path.length === 0) {
            console.log("No path found");
        } else {
            // draw path
            if (this.canvas) {
                this.canvas.removeSimilarObjects("a*path");
                path.slice(0, path.length - 5).forEach((pos, idx) => {
                    this.canvas!.drawRectangle("a*path" + idx, pos.x, pos.y, 0.5, 0.5, "red", "red", 0.5);
                });
            }
        }
    }

    private isPositionsNear(position1: Position, position2: Position, comparingDistanceRange: number): boolean {
        const distance = Math.hypot(position1.x - position2.x, position1.y - position2.y);
        return distance <= comparingDistanceRange;
    }

    private identifyFrontiers(): Position[] {
        const frontiers: Position[] = [];
        for (let y = 0; y < this.discoveredMap.length; y++) {
            for (let x = 0; x < this.discoveredMap[y].length; x++) {
                if (this.discoveredMap[y][x] === 1) { // If cell is unknown
                    const neighbors = this.getNeighbors(x, y);
                    if (neighbors.some(([nx, ny]) => this.discoveredMap[ny][nx] === 0)) {
                        frontiers.push({ x: x, y: y });
                    }
                }
            }
        }
        const reachableFrontiers = frontiers.filter(frontier => this.canMoveToPosition(frontier));
        return reachableFrontiers;
    }

    private getNeighbors(x: number, y: number): [number, number][] {
        const neighbors: [number, number][] = [];
        if (x > 0) neighbors.push([x - 1, y]);
        if (x < this.discoveredMap[0].length - 1) neighbors.push([x + 1, y]);
        if (y > 0) neighbors.push([x, y - 1]);
        if (y < this.discoveredMap.length - 1) neighbors.push([x, y + 1]);
        return neighbors;
    }

    async moveToFrontierInDiscoveredMap(destination: Position) {
        const map = this.discoveredMap;
        this.discoveredMap[destination.y][destination.x] = 0; // Transposed

        const path = AstarPathPlanner.findPath(this.getLatestRobotPosition(), destination, map);
        for (let i = 1; i < path.length; i++) {
            const position = path[i];
            const { direction, distance } = this.getDirectionCommandToTravel(position);
            await this.moveRobot(direction, distance);
        }
    }

    canMoveToPosition(position: Position): boolean {
        const { direction, distance } = this.getDirectionCommandToTravel(position);
        return this.robot.canMove(direction, distance);
    }

    canMoveToDirectionWithLidar(direction: Direction, distance: number): boolean {
        const lidarReading = this.robot.getLidarReading(this.lidarRange);
        if (direction === "up") {
            return lidarReading.up >= distance;
        } else if (direction === "down") {
            return lidarReading.down >= distance;
        } else if (direction === "left") {
            return lidarReading.left >= distance;
        } else if (direction === "right") {
            return lidarReading.right >= distance;
        }
        return false;
    }

    private getDirectionCommandToTravel(position: Position): { direction: Direction, distance: number } {
        // get the average position
        let robotPosition = {x: this.robot.x, y: this.robot.y};

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

    private async updateDiscoveredMap() {
        const lidarReading = this.robot.getLidarReading(this.lidarRange);
        const position = this.getLatestRobotPosition();

        const x = Math.floor(position.x);
        const y = Math.floor(position.y);
        this.discoveredMap[y][x] = 0; // Note the transposition here

        const newPositions: Position[] = [{ x, y }];

        // lidar output as this { up: 1, down: 4, left: 3, right: 0 }
        // right 0 means no obstacle detected
        // up 1 means 1 unit distance to obstacle
        // left 3 means 3 unit distance to obstacle

        if (lidarReading.up > 0) {
            for (let i = 1; i <= lidarReading.up; i++) {
                if (y - i >= 0) {
                    this.discoveredMap[y - i][x] = 0; // Transposed
                    newPositions.push({ x, y: y - i });
                }
            }
        }

        if (lidarReading.down > 0) {
            for (let i = 1; i <= lidarReading.down; i++) {
                if (y + i < 100) {
                    this.discoveredMap[y + i][x] = 0; // Transposed
                    newPositions.push({ x, y: y + i });
                }
            }
        }

        if (lidarReading.left > 0) {
            for (let i = 1; i <= lidarReading.left; i++) {
                if (x - i >= 0) {
                    this.discoveredMap[y][x - i] = 0; // Transposed
                    newPositions.push({ x: x - i, y });
                }
            }
        }

        if (lidarReading.right > 0) {
            for (let i = 1; i <= lidarReading.right; i++) {
                if (x + i < 100) {
                    this.discoveredMap[y][x + i] = 0; // Transposed
                    newPositions.push({ x: x + i, y });
                }
            }
        }

        if (ExploredMapCanvasImpl) {
            for (let i = 0; i < newPositions.length; i++) {
                const { x, y } = newPositions[i];
                ExploredMapCanvasImpl!.drawRectangle(`discovered-map-${x}-${y}`, x, y, 1, 1, "gray", "gray", 1); // Transposed
            }
        }
    }

    moveRobot(direction: Direction, distance?: number) {
        return this.robot.move(direction, distance || 1);
    }
}