import { BaseObject } from "../Environment/BaseObject";
import { Position } from "../types";
import { UwbTag } from "./Tag";

export class UwbAnchor extends BaseObject {

    private size: number = 1;
    private color: string = 'blue';
    private tags: UwbTag[] = [];
    private name = 'uwb-anchor';

    constructor(x: number, y: number, name: string) {
        super(x, y);
        this.x = x;
        this.y = y;
        this.id = `uwb-anchor-${Math.random().toString(36).substring(2, 9)}`;
        this.name = name;
    }

    registerUwbTag(tag: UwbTag): void {
        this.tags.push(tag);
    }

    getName(): string {
        return this.name;
    }

    unRegisterUwbTag(tag: UwbTag): void {
        this.tags = this.tags.filter(t => t.getID() !== tag.getID());
    }

    draw() {
        this.canvas?.drawRectangle(this.id, this.x, this.y, this.size, this.size, this.color, this.color, 1);
    }

    getPosition(): Position {
        return { x: this.x, y: this.y };
    }
}