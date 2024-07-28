import { Canvas } from "../graphics/graphics";
import { BaseObject } from "./base_object";
import { Obstacle } from "./obstacle";
import { checkTwoLinesIntersects, getRectangleLines, getDistanceToLine } from "../utils";
import { globalConfigsProvider } from "../configs";
import { Position, SurroundingDistances as SurroundingDistances } from "../types";
import { MovableObject } from "./movable_object";

export class Environment {
    private id: string = `env-${Math.random().toString(36).substring(2, 9)}`;
    private backgroundColor: string = "#FFFFF1";
    private objects: BaseObject[] = [];
    private canvas: Canvas;
    private inflateFactor: number = globalConfigsProvider.getConfig("obstacleInflationFactor");

    constructor(width: number, height: number, canvas: Canvas) {
        this.canvas = canvas;
        canvas.drawBackdrop({ width, height, fillColor: this.backgroundColor, strokeColor: 'black' });
    }

    drawLegend() {
        const typeOfObjects = this.objects.map(obj => obj.constructor.name);
        const uniqueObjectTypes = Array.from(new Set(typeOfObjects));
        const uniqueObjects: BaseObject[] = [];
        uniqueObjectTypes.forEach(type => {
            const objectsOfType = this.objects.filter(obj => obj.constructor.name === type);
            uniqueObjects.push(objectsOfType[0]);
        });
        uniqueObjects.forEach((object, index) => {
            object.drawLegend({ x: 10, y: 1 + (index * 20) });
        });
    }

    addObject(object: BaseObject) {
        this.objects.push(object);
        object.setCanvas(this.canvas);
        object.draw();
        if (globalConfigsProvider.getConfig("showInflatedObstacles")) {
            if (object instanceof Obstacle) {
                const inflatedObstacle = new Obstacle(object.width + this.inflateFactor, object.height + this.inflateFactor, object.x - this.inflateFactor / 2, object.y - this.inflateFactor / 2);
                this.canvas.drawRectangle(inflatedObstacle.getID(), inflatedObstacle.x, inflatedObstacle.y, inflatedObstacle.width, inflatedObstacle.height, "transparent", "red", 1);
            }
        }
    }

    removeObject(objectId: string) {
        this.objects = this.objects.filter(obj => obj.getID() !== objectId);
        this.canvas.removeObject(objectId);
    }

    getSurrounding(range: number, start: Position): SurroundingDistances {
        const distances: SurroundingDistances = { up: 0, down: 0, left: 0, right: 0 };

        const x = this.objects.filter(obj => obj instanceof Obstacle) as Obstacle[];
        // inflate the obstacles to make sure the robot can't pass through them
        const obstacles = x.map(obstacle => {
            return new Obstacle(obstacle.width + this.inflateFactor, obstacle.height + this.inflateFactor, obstacle.x - this.inflateFactor / 2, obstacle.y - this.inflateFactor / 2);
        });

        const obstacleLines = obstacles.map(obstacle => getRectangleLines({ x: obstacle.x, y: obstacle.y }, obstacle.width, obstacle.height)).flat();

        const linesToConsider = obstacleLines.filter(line => {
            const rightIntersect = checkTwoLinesIntersects([start, { x: start.x + range, y: start.y }], line);
            const leftIntersect = checkTwoLinesIntersects([start, { x: start.x - range, y: start.y }], line);
            const topIntersect = checkTwoLinesIntersects([start, { x: start.x, y: start.y - range }], line);
            const bottomIntersect = checkTwoLinesIntersects([start, { x: start.x, y: start.y + range }], line);
            return rightIntersect || leftIntersect || topIntersect || bottomIntersect;
        });

        linesToConsider.forEach(line => {
            const distance = getDistanceToLine(line[0], line[1], start);
            const angle = Math.atan2(line[1].y - line[0].y, line[1].x - line[0].x) * 180 / Math.PI;
            if (angle >= -45 && angle <= 45) {
                distances.down = distance;
            } else if (angle > 45 && angle <= 135) {
                distances.left = distance;
            } else if (angle > 135 || angle <= -135) {
                distances.up = distance;
            } else {
                distances.right = distance;
            }
        })
        const envBoxLines = getRectangleLines({ x: 0, y: 0 }, 100, 100);

        const envBoxLineTop = envBoxLines[0];
        const envBoxLineRight = envBoxLines[1];
        const envBoxLineBottom = envBoxLines[2];
        const envBoxLineLeft = envBoxLines[3];

        const distanceToTop = getDistanceToLine(envBoxLineTop[0], envBoxLineTop[1], start);
        const distanceToRight = getDistanceToLine(envBoxLineRight[0], envBoxLineRight[1], start);
        const distanceToBottom = getDistanceToLine(envBoxLineBottom[0], envBoxLineBottom[1], start);
        const distanceToLeft = getDistanceToLine(envBoxLineLeft[0], envBoxLineLeft[1], start);

        const enableDraw = globalConfigsProvider.getConfig("showObstacleDetectionLines")

        if (distanceToTop < range) {
            distances.up = distanceToTop;
            enableDraw && this.canvas.drawLine(`line-top`, envBoxLineTop[0].x, envBoxLineTop[0].y, envBoxLineTop[1].x, envBoxLineTop[1].y, 'red', 5);
        }
        if (distanceToRight < range) {
            distances.right = distanceToRight;
            enableDraw && this.canvas.drawLine(`line-right`, envBoxLineRight[0].x, envBoxLineRight[0].y, envBoxLineRight[1].x, envBoxLineRight[1].y, 'red', 5);
        }
        if (distanceToBottom < range) {
            distances.down = distanceToBottom;
            enableDraw && this.canvas.drawLine(`line-bottom`, envBoxLineBottom[0].x, envBoxLineBottom[0].y, envBoxLineBottom[1].x, envBoxLineBottom[1].y, 'red', 5);
        }
        if (distanceToLeft < range) {
            distances.left = distanceToLeft;
            enableDraw && this.canvas.drawLine(`line-left`, envBoxLineLeft[0].x, envBoxLineLeft[0].y, envBoxLineLeft[1].x, envBoxLineLeft[1].y, 'red', 5);
        }

        if (enableDraw) {
            this.canvas.clearLines();
            linesToConsider.forEach((line, idx) => {
                this.canvas.drawLine(`line-${idx}`, line[0].x, line[0].y, line[1].x, line[1].y, 'red', 5);
            });
        }
        return distances;
    }

    getEnvMatrixRepresentation(): number[][] {
        const matrix = new Array(100).fill(0).map(() => new Array(100).fill(0));
        this.objects.forEach(obj => {
            if (obj instanceof Obstacle) {
                for (let i = obj.x; i < obj.x + obj.width; i++) {
                    for (let j = obj.y; j < obj.y + obj.height; j++) {
                        matrix[j][i] = 1;
                    }
                }
            }
        });
        // need to add boundary to the matrix
        for (let i = 0; i < 100; i++) {
            matrix[0][i] = 1;
            matrix[99][i] = 1;
            matrix[i][0] = 1;
            matrix[i][99] = 1;
        }

        // need to inflate the obstacles to make sure the robot can navigate around them
        const k = 2;
        const inflatedMatrix = matrix.map(row => row.map(cell => cell));
        for (let i = 0; i < 100; i++) {
            for (let j = 0; j < 100; j++) {
                if (matrix[j][i] === 1) {
                    for (let x = i - k; x <= i + k; x++) {
                        for (let y = j - k; y <= j + k; y++) {
                            if (x >= 0 && y >= 0 && x < 100 && y < 100) {
                                inflatedMatrix[y][x] = 1;
                            }
                        }
                    }
                }
            }
        }

        // need to clear the areas where robot and human subjects are
        // take a 3x3 square around the robot and human subjects
        const subjects = this.objects.filter(obj => obj instanceof MovableObject) as MovableObject[];
        const h = 3
        subjects.forEach(subject => {
            for (let i = subject.x - h; i <= subject.x + h; i++) {
                for (let j = subject.y - h; j <= subject.y + h; j++) {
                    if (i >= 0 && j >= 0 && i < 100 && j < 100) {
                        inflatedMatrix[j][i] = 0;
                    }
                }
            }
        });

        return inflatedMatrix;
    }
}