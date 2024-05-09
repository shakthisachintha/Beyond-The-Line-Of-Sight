import { BaseObject } from "../Environment/BaseObject";
import { Canvas, Position } from "../Graphics/Graphics";
import { UwbTag } from "./Tag";

export class UwbAnchor extends BaseObject {

    private radius: number = 1;
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
        this.canvas?.drawCircle(this.id, this.x, this.y, this.radius, this.color, 'black', 1);
    }

    move(direction: "up" | "down" | "left" | "right", distance: number): void {
        throw new Error("Method not supported.");
    }

    getPosition(): Position {
        return { x: this.x, y: this.y };
    }
}