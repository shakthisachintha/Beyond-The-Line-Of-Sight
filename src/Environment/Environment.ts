import { Canvas, Position } from "../Graphics/Graphics";
import { BaseObject } from "./BaseObject";
import { Obstacle } from "./Obstacle";
import { checkTwoLinesIntersects, getRectangleLines, getDistanceToLine } from "../utils";
import { globalConfigsProvider } from "../configs";

interface Size {
    width: number;
    height: number;
}

export interface SurrondingDistances {
    up: number;
    down: number;
    left: number;
    right: number;
}

export class Environment {
    private id: string = `env-${Math.random().toString(36).substring(2, 9)}`;
    private size: Size = { width: 100, height: 100 };
    private backgroundColor: string = "#FFFFF1";
    private objects: BaseObject[] = [];
    private canvas: Canvas;

    constructor(width: number, height: number, canvas: Canvas) {
        this.size = { width, height };
        this.canvas = canvas;
        canvas.drawBackdrop({ width, height, fillColor: this.backgroundColor, strokeColor: 'black' });
    }

    addObject(object: BaseObject) {
        this.objects.push(object);
        object.setCanvas(this.canvas);
        object.draw();
    }

    removeObject(objectId: string) {
        this.objects = this.objects.filter(obj => obj.getID() !== objectId);
        this.canvas.removeObject(objectId);
    }

    getSurrounding(range: number, start: Position): SurrondingDistances {
        const distances: SurrondingDistances = { up: 0, down: 0, left: 0, right: 0 };

        const obstacles = this.objects.filter(obj => obj instanceof Obstacle) as Obstacle[];
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
}