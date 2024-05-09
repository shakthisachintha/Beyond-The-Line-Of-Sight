import { globalConfigsProvider } from "../configs";
import { BaseObject } from "../Environment/BaseObject";
import { UwbAnchor } from "./Anchor";

interface TagBearing {
    anchor: string,
    distance: number,
}

const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange', 'pink', 'brown', 'cyan', 'magenta']

export class UwbTag extends BaseObject {

    private linkedAnchor: UwbAnchor[] = [];

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
            const distance = Math.sqrt(Math.pow(anchor.x - this.x, 2) + Math.pow(anchor.y - this.y, 2));
            return { anchor: anchor.getName(), distance };
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
            this.canvas?.drawLine(`${this.id}-${anchor.getID()}`, this.x, this.y, anchor.x, anchor.y, colors[index], 1);
        });
    }

    drawDistanceCircles(): void {
        this.linkedAnchor.forEach((anchor, index) => {
            const distance = Math.sqrt(Math.pow(anchor.x - this.x, 2) + Math.pow(anchor.y - this.y, 2));
            this.canvas?.drawCircle(`${this.id}-${anchor.getID()}`, anchor.x, anchor.y, distance, 'transparent', colors[index], 1);
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