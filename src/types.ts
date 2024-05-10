export interface SurrondingDistances {
    up: number;
    down: number;
    left: number;
    right: number;
}

export interface Position {
    x: number;
    y: number;
}

export interface TagBearing {
    anchor: string,
    anchorPosition: Position,
    distance: number,
}

export type Direction = "up" | "down" | "left" | "right";

export enum DrawingColor {
    RED = 'red',
    GREEN = 'green',
    BLUE = 'blue',
    YELLOW = 'yellow',
    PURPLE = 'purple',
    ORANGE = 'orange',
    PINK = 'pink',
    BROWN = 'brown',
    CYAN = 'cyan',
    MAGENTA = 'magenta'
}