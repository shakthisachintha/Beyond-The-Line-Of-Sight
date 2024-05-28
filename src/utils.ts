import { Position, TagBearing } from "./types";

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

export function getPositionFromUwbBearing(readings: TagBearing[]): Position {
    // Check if there are exactly 3 readings
    if (readings.length !== 3)
        throw new Error("Invalid readings: Must have 3 readings");

    const anchor1 = readings[0];
    const anchor2 = readings[1];
    const anchor3 = readings[2];

    // Get coordinates and distances
    const x1 = anchor1.anchorPosition.x;
    const y1 = anchor1.anchorPosition.y;
    const r1 = anchor1.distance;

    const x2 = anchor2.anchorPosition.x;
    const y2 = anchor2.anchorPosition.y;
    const r2 = anchor2.distance;

    const x3 = anchor3.anchorPosition.x;
    const y3 = anchor3.anchorPosition.y;
    const r3 = anchor3.distance;

    // Calculate intermediate values
    const x1Square = x1 * x1;
    const y1Square = y1 * y1;
    const x2Square = x2 * x2;
    const y2Square = y2 * y2;
    const x3Square = x3 * x3;
    const y3Square = y3 * y3;
    const r1Square = r1 * r1;
    const r2Square = r2 * r2;
    const r3Square = r3 * r3;

    // Calculate trilateration
    const A = 2 * (x2 - x1);
    const B = 2 * (y2 - y1);
    const C = r1Square - r2Square - x1Square + x2Square - y1Square + y2Square;
    const D = 2 * (x3 - x2);
    const E = 2 * (y3 - y2);
    const F = r2Square - r3Square - x2Square + x3Square - y2Square + y3Square;

    // Calculate intersection point
    const x = (C * E - F * B) / (E * A - B * D);
    const y = (C * D - A * F) / (B * D - A * E);

    return { x, y };
}

export function convertPositionToInt(pos: Position): Position {
    return { x: Math.ceil(pos.x), y: Math.ceil(pos.y) };
}
