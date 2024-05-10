import { globalConfigsProvider } from "../configs";
import { BaseObject } from "../Environment/BaseObject";
import { DrawingColor, TagBearing } from "../types";
import { UwbAnchor } from "./Anchor";

export class UwbTag extends BaseObject {

    private linkedAnchor: UwbAnchor[] = [];
    private errorPercentage: number = 0.01;

    constructor(x: number, y: number) {
        super(x, y);
        this.id = `uwb-tag-${Math.random().toString(36).substring(2, 9)}`;
    }

    attachAnchor(anchor: UwbAnchor): void {
        this.linkedAnchor.push(anchor);
    }

    detachAnchor(anchor: UwbAnchor): void {
        this.linkedAnchor = this.linkedAnchor.filter(a => a.getID() !== anchor.getID());
    }

    getBearing(): TagBearing[] {
        return this.linkedAnchor.map(anchor => {
            // error should be plus or minus 3%
            const distance = Math.sqrt(Math.pow(anchor.x - this.x, 2) + Math.pow(anchor.y - this.y, 2)) * (1 + (Math.random() * this.errorPercentage));
            return {
                anchor: anchor.getName(), distance, anchorPosition: { x: anchor.x, y: anchor.y }
            };
        });
    }

    setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
        this.canvas?.moveObejct(this.id, { x, y });

        if (globalConfigsProvider.getConfig("showUwbDistanceCircles") || globalConfigsProvider.getConfig("showUwbDistanceLines")) {
            this.clearDistanceLines();
        }

        if (globalConfigsProvider.getConfig("showUwbDistanceLines")) {
            this.drawDistanceLines();
        }

        if (globalConfigsProvider.getConfig("showUwbDistanceCircles")) {
            this.drawDistanceCircles();
        }
    }

    drawDistanceLines(): void {
        this.linkedAnchor.forEach((anchor, index) => {
            const color = Object.values(DrawingColor)[index];
            this.canvas?.drawLine(`${this.id}-${anchor.getID()}`, this.x, this.y, anchor.x, anchor.y, color, 1);
        });
    }

    drawDistanceCircles(): void {
        this.linkedAnchor.forEach((anchor, index) => {
            const color = Object.values(DrawingColor)[index];
            const distance = Math.sqrt(Math.pow(anchor.x - this.x, 2) + Math.pow(anchor.y - this.y, 2));
            this.canvas?.drawCircle(`${this.id}-${anchor.getID()}`, anchor.x, anchor.y, distance, 'transparent', color, 1);
        });
    }

    clearDistanceLines(): void {
        this.linkedAnchor.forEach(anchor => {
            this.canvas?.removeObject(`${this.id}-${anchor.getID()}`);
        });
    }

    getPosition(): { x: number, y: number } {
        return { x: this.x, y: this.y };
    }

    draw(): void {
        this.canvas?.drawCircle(this.id, this.x, this.y, 0.5, 'green', 'black', 1);
    }
}