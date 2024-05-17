import { BaseObject } from "../Environment/BaseObject";
import { Position } from "../types";

export class UwbAnchor extends BaseObject {

    private size: number = 1;
    private color: string = 'blue';
    private name = 'uwb-anchor';

    constructor(x: number, y: number, name: string) {
        super(x, y);
        this.x = x;
        this.y = y;
        this.id = `uwb-anchor-${Math.random().toString(36).substring(2, 9)}`;
        this.name = name;
    }

    getName(): string {
        return this.name;
    }

    draw() {
        this.canvas?.drawRectangle(this.id, this.x, this.y, this.size, this.size, this.color, this.color, 1);
    }

    getPosition(): Position {
        return { x: this.x, y: this.y };
    }
}