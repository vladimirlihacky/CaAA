export type Matrix = number[][];
export type Path = number[];
export class Node {
    constructor(
        public path: Path, 
        public matrix: Matrix, 
        public cost: number, 
    ) {}
}

