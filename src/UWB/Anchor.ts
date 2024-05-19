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

    drawLegend(position: Position): void {
        this.canvas?.drawRectangle(`${this.id}-legend`, position.x, position.y, 10, 10, this.color, this.color, 1);
        this.canvas?.drawText(`${this.id}-legend`, position.x + 10, position.y + 5, "UWB Anchor", "black", 1);
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