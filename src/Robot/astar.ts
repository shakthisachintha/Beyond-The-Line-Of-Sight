import { Position } from "../types";

class PathNode {
    constructor(
        public position: Position,
        public parent: PathNode | null,
        public g: number,
        public h: number,
        public f: number
    ) { }
}

const heuristic = (pos0: Position, pos1: Position): number => {
    return Math.abs(pos0.x - pos1.x) + Math.abs(pos0.y - pos1.y); // Manhattan distance
};

export class AstarPathPlanner {
    public static findPath(start: Position, end: Position, grid: number[][]): Position[] {
        const openList: PathNode[] = [];
        const closedList: Set<string> = new Set();
        const startNode = new PathNode(start, null, 0, 0, 0);
        const endNode = new PathNode(end, null, 0, 0, 0);

        startNode.h = heuristic(start, end);
        startNode.f = startNode.g + startNode.h;

        openList.push(startNode);

        const getNeighbors = (node: PathNode): PathNode[] => {
            const { x, y } = node.position;
            const neighbors: PathNode[] = [];
            const directions = [
                [0, -1], // left
                [0, 1],  // right
                [-1, 0], // up 
                [1, 0] // down
            ];

            for (const [dx, dy] of directions) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && ny >= 0 && ny < grid.length && nx < grid[0].length && grid[ny][nx] === 0) {
                    neighbors.push(new PathNode({ x: nx, y: ny }, node, 0, 0, 0));
                }
            }
            return neighbors;
        };



        const reconstructPath = (endNode: PathNode): Position[] => {
            const path: Position[] = [];
            let currentNode: PathNode | null = endNode;
            while (currentNode !== null) {
                path.push(currentNode.position);
                currentNode = currentNode.parent;
            }
            return path.reverse();
        };

        while (openList.length > 0) {
            let currentNode = openList.reduce((prev, curr) => (prev.f < curr.f ? prev : curr));

            if (currentNode.position.x === endNode.position.x && currentNode.position.y === endNode.position.y) {
                return reconstructPath(currentNode);
            }

            openList.splice(openList.indexOf(currentNode), 1);
            closedList.add(`${currentNode.position.x},${currentNode.position.y}`);

            const neighbors = getNeighbors(currentNode);
            for (const neighbor of neighbors) {
                if (closedList.has(`${neighbor.position.x},${neighbor.position.y}`)) {
                    continue;
                }

                neighbor.g = currentNode.g + 1;
                neighbor.h = heuristic(neighbor.position, endNode.position);
                neighbor.f = neighbor.g + neighbor.h;

                const existingNode = openList.find(node => node.position.x === neighbor.position.x && node.position.y === neighbor.position.y);
                if (!existingNode || neighbor.g < existingNode.g) {
                    openList.push(neighbor);
                }
            }
        }

        return []; // No path found
    }
}
