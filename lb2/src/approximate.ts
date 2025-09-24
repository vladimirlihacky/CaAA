import { type Path, type Matrix } from "./common";
type Edge = [number, number, number]; // [cost, u, v]

export class ApproximateTSP {
    private matrix: Matrix;
    private n: number;
    private start: number;

    constructor(matrix: Matrix, startCity: number) {
        this.matrix = matrix.map(row => [...row]);
        this.n = matrix.length;
        this.start = startCity;
    }

    private findMST(): [number, number][] {
        const mst: [number, number][] = [];
        const visited = new Set<number>();
        const heap: Edge[] = []; 

        visited.add(this.start);
        
        for (let nextCity = 0; nextCity < this.n; nextCity++) {
            if (nextCity !== this.start && this.matrix[this.start][nextCity] !== Infinity) {
                this.heapPush(heap, [this.matrix[this.start][nextCity], this.start, nextCity]);
            }
        }

        while (heap.length > 0 && visited.size < this.n) {
            const [cost, u, v] = this.heapPop(heap);
            
            if (!visited.has(v)) {
                visited.add(v);
                mst.push([u, v]);
                
                for (let nextCity = 0; nextCity < this.n; nextCity++) {
                    if (!visited.has(nextCity) && this.matrix[v][nextCity] !== Infinity) {
                        this.heapPush(heap, [this.matrix[v][nextCity], v, nextCity]);
                    }
                }
            }
        }
        
        return mst;
    }

    private dfsTraversal(mst: [number, number][]): number[] {
        const adjacencyList: number[][] = Array(this.n).fill(0).map(() => []);
        
        for (const [u, v] of mst) {
            adjacencyList[u].push(v);
            adjacencyList[v].push(u);
        }

        const path: number[] = [];
        const stack: number[] = [this.start];
        const visited = new Set<number>();

        while (stack.length > 0) {
            const node = stack.pop()!;
            
            if (!visited.has(node)) {
                visited.add(node);
                path.push(node);
                
                for (let i = adjacencyList[node].length - 1; i >= 0; i--) {
                    const neighbor = adjacencyList[node][i];
                    if (!visited.has(neighbor)) {
                        stack.push(neighbor);
                    }
                }
            }
        }
        
        return path;
    }

    solve(): [Path, number] {
        const mst = this.findMST();
        
        const path = this.dfsTraversal(mst);
        
        const fullPath = [...path, this.start];
        
        let cost = 0;
        for (let i = 0; i < fullPath.length - 1; i++) {
            cost += this.matrix[fullPath[i]][fullPath[i + 1]];
        }

        return [fullPath.map(x => x + 1), cost];
    }

    private heapPush(heap: Edge[], edge: Edge): void {
        heap.push(edge);
        heap.sort((a, b) => a[0] - b[0]);
    }

    private heapPop(heap: Edge[]): Edge {
        return heap.shift()!;
    }
}