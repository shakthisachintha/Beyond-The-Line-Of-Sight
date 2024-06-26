import { Direction } from "../types";
import { webSocketClient } from "../ws";

export interface I3DDGraphicsAdapter {
    moveObject: (objectId: string, direction: Direction, distance: number) => void;
}

export class DDDGraphicsAdapter implements I3DDGraphicsAdapter{
    moveObject(objectId: string, direction: Direction, distance: number): void {
        webSocketClient.send({type: "publish", channel: "simulatorGraphics", payload: { objectId, direction, distance} });
    }
}