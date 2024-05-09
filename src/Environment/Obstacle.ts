import { BaseObject } from "./BaseObject";

export class Obstacle extends BaseObject {

    public width: number;
    public height: number;
    public id: string;

    constructor(width: number, height: number, x: number, y: number) {
        super(x, y);
        this.width = width;
        this.height = height;
        this.id = Math.random().toString(36).substring(7);
    }

    draw() {
        this.canvas?.drawRectangle(this.id, this.x, this.y, this.width, this.height, this.fillColor, this.stroke, this.strokeWidth);
    }

    move(direction: "up" | "down" | "left" | "right", distance: number): void {
        switch (direction) {
            case "up":
                this.y -= distance;
                break;
            case "down":
                this.y += distance;
                break;
            case "left":
                this.x -= distance;
                break;
            case "right":
                this.x += distance;
                break;
        }
        this.canvas?.moveObejct(this.id, { x: this.x, y: this.y });
    }
}