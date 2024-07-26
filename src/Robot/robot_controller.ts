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
        this.discoveredMap = Array.from({ length: 100 }, () => Array.from({ length: 100 }, () => 1));
        this.init();
    }

    init() {
        ExploredMapCanvasImpl.setScale(5);
        // ExploredMapCanvasImpl.drawBackdrop({ width: 100, height: 100, fillColor: "#FFFFFF", strokeColor: 'black' });
    }

    handleOcclusionInKnownEnvironment(targetPosition: Position, map: number[][]) {
        const startPosition = convertPositionToInt(this.robot.getAveragedUwbBearing());
        const endPosition = convertPositionToInt(targetPosition);
        const path = AstarPathPlanner.findPath(startPosition, endPosition, map);

        if (this.canvas) {
            this.canvas.removeSimilarObjects("a*path");
            path.slice(0, path.length - 5).forEach((pos, idx) => {
                this.canvas!.drawRectangle("a*path" + idx, pos.x, pos.y, 0.5, 0.5, "red", "red", 0.5);
            });
        }

        for (let i = 1; i < path.length - 5; i += 1) {
            setTimeout(() => {
                this.moveToPosition(path[i]);
            }, 70 * i);
        }
    }

    async handleOcclusionInUnknownEnvironment(targetPosition: Position) {
        const endPosition = convertPositionToInt(targetPosition);
        const frontierDistanceThreshold = 3; // Set a distance threshold for filtering out similar frontiers

        let path = [];
        path = AstarPathPlanner.findPath(convertPositionToInt(this.robot.getAveragedUwbBearing()), endPosition, this.discoveredMap);
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
            return;
        }



        // Perform initial scan and update the map
        for (let i = 0; i < 4; i++) {
            const lidarReading = this.robot.getLidarReading(this.lidarRange);
            this.updateDiscoveredMap(this.robot.getAveragedUwbBearing(), lidarReading);
        }

        while (true) {
            const frontiers = this.identifyFrontiers();
            // draw frontiers
            frontiers.forEach(({ x, y }) => {
                ExploredMapCanvasImpl!.drawRectangle(`frontier-${x}-${y}`, x, y, 1, 1, "green", "green", 1);
            });

            // Filter out frontiers that are close to each other
            const reachableFrontiers = frontiers.filter((frontier) => {
                return this.canMoveToPosition(frontier);
            });

            // draw filtered frontiers
            reachableFrontiers.forEach(({ x, y }) => {
                ExploredMapCanvasImpl!.drawRectangle(`filtered-frontier-${x}-${y}`, x, y, 1, 1, "blue", "blue", 1);
            });

            if (reachableFrontiers.length === 0) {
                console.log("No reachable frontiers found");
                break;
            }

            // Sort the frontiers based on distance
            const frontiersWithDistance = reachableFrontiers.map((frontier) => {
                return { ...frontier, distance: Math.hypot(frontier.x - endPosition.x, frontier.y - endPosition.y) };
            });

            frontiersWithDistance.sort((a, b) => a.distance - b.distance);

            // Move to the closest frontier
            const closestFrontier = frontiersWithDistance[0];
            this.moveToPosition(closestFrontier);
            
            // Perform scan and update the map
            for (let i = 0; i < 4; i++) {
                const lidarReading = this.robot.getLidarReading(this.lidarRange);
                this.updateDiscoveredMap(this.robot.getAveragedUwbBearing(), lidarReading);
            }

            // Check if the robot has reached the target position
            if (this.isPositionsNear(closestFrontier, endPosition, frontierDistanceThreshold)) {
                break;
            }

            await new Promise(resolve => setTimeout(resolve, 90));
        }

        // Perform A* path planning
        path = AstarPathPlanner.findPath(convertPositionToInt(this.robot.getAveragedUwbBearing()), endPosition, this.discoveredMap);
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

    private updateDiscoverdMap() {
        const lidarReading = this.robot.getLidarReading(this.lidarRange);
        this.updateDiscoveredMap(this.robot.getAveragedUwbBearing(), lidarReading);
    }

    private async exploreDirection(direction: Direction, distance: number) {
        while (this.canMoveToDirectionWithLidar(direction, distance)) {
            this.moveRobot(direction, distance);
            this.updateDiscoverdMap();
            await new Promise(resolve => setTimeout(resolve, 90));
        }
    }

    private identifyFrontiers(): Position[] {
        const frontiers: Position[] = [];
        for (let y = 0; y < this.discoveredMap.length; y++) {
            for (let x = 0; x < this.discoveredMap[y].length; x++) {
                if (this.discoveredMap[y][x] === 1) { // If cell is unknown
                    const neighbors = this.getNeighbors(x, y);
                    if (neighbors.some(([nx, ny]) => this.discoveredMap[ny][nx] === 0)) {
                        frontiers.push({ x, y });
                    }
                }
            }
        }
        return frontiers;
    }

    private getNeighbors(x: number, y: number): [number, number][] {
        const neighbors: [number, number][] = [];
        if (x > 0) neighbors.push([x - 1, y]);
        if (x < this.discoveredMap[0].length - 1) neighbors.push([x + 1, y]);
        if (y > 0) neighbors.push([x, y - 1]);
        if (y < this.discoveredMap.length - 1) neighbors.push([x, y + 1]);
        return neighbors;
    }


    moveToPosition(position: Position) {
        const { direction, distance } = this.getDirectionCommandToTravel(position);
        this.moveRobot(direction, distance);
    }

    async moveAlongPath(path: Position[]) {
        for (let i = 1; i < path.length; i++) {
            const position = path[i];
            const { direction, distance } = this.getDirectionCommandToTravel(position);
            this.moveRobot(direction, distance);
            await new Promise(resolve => setTimeout(resolve, 90));
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
            newPositions.forEach(({ x, y }) => {
                ExploredMapCanvasImpl!.drawRectangle(`discovered-map-${x}-${y}`, x, y, 1, 1, "gray", "gray", 1); // Transposed
            });
        }
    }

    moveRobot(direction: Direction, distance?: number) {
        this.robot.move(direction, distance || 1);
        const lidarReading = this.robot.getLidarReading(this.lidarRange);
        this.updateDiscoveredMap(this.robot.getAveragedUwbBearing(), lidarReading);
    }
}