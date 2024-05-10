import { Position } from "./types";

// this should return 4 items in the array each should have 2 positions in it starting and ending of a line
export function getRectangleLines(origin: Position, width: number, height: number): [Position[], Position[], Position[], Position[]] {
    const topLeft = origin;
    const topRight = { x: origin.x + width, y: origin.y };
    const bottomLeft = { x: origin.x, y: origin.y + height };
    const bottomRight = { x: origin.x + width, y: origin.y + height };

    const topLine: Position[] = [{ ...topLeft }, { ...topRight }];
    const rightLine: Position[] = [{ ...topRight }, { ...bottomRight }];
    const bottomLine: Position[] = [{ ...bottomRight }, { ...bottomLeft }];
    const leftLine: Position[] = [{ ...bottomLeft }, { ...topLeft }];

    return [topLine, rightLine, bottomLine, leftLine];
}

export function checkTwoLinesIntersects(lineOnePoints: Position[], lineTwoPoints: Position[]): boolean {
    const [x1, y1] = [lineOnePoints[0].x, lineOnePoints[0].y];
    const [x2, y2] = [lineOnePoints[1].x, lineOnePoints[1].y];
    const [x3, y3] = [lineTwoPoints[0].x, lineTwoPoints[0].y];
    const [x4, y4] = [lineTwoPoints[1].x, lineTwoPoints[1].y];

    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    if (denominator === 0) {
        return false; // Lines are parallel
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

// get the minimum distance from a point to a line (orthogonal distance)
export function getDistanceToLine(lineStart: Position, lineEnd: Position, point: Position): number {
    const x0 = point.x;
    const y0 = point.y;
    const x1 = lineStart.x;
    const y1 = lineStart.y;
    const x2 = lineEnd.x;
    const y2 = lineEnd.y;

    const numerator = Math.abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1);
    const denominator = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));

    const distance = numerator / denominator;
    return distance;
}

export function humanizeString(str: string): string {
    // remove dashes and underscores
    str = str.replace(/-|_/g, ' ');
    // capitalize first letter
    return str.charAt(0).toUpperCase() + str.slice(1);
}