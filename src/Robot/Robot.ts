
import { UwbTag } from "../UWB/Tag";
import { Environment } from "../Environment/Environment";
import { Canvas } from "../Graphics/Graphics";
import { MovableObject } from "../Environment/MovableObject";

export class Robot extends MovableObject {

    constructor(x: number, y: number, canvas: Canvas, env: Environment) {
        super(x, y, env);
        this.canvas = canvas;
        this.id = `robot-${Math.random().toString(36).substring(2, 9)}`;
    }

    attachUwbTag(tag: UwbTag): void {
        this.uwbTag = tag;
        this.uwbTag.setPosition(this.x, this.y);
    }

    draw(): void {
        this.canvas?.drawCircle(this.id, this.x, this.y, this.radius, this.fillColor, this.stroke, 1);
    }
}