import { Node, type Matrix, type Path} from "./common"

export class LittleTSP {
    private originalMatrix: Matrix;
    private n: number;
    private start: number;
    private bestCost: number;
    private bestPath: Path;

    constructor(matrix: Matrix, startCity: number) {
        this.originalMatrix = matrix.map(row => [...row]);
        this.n = matrix.length;
        this.start = startCity;
        this.bestCost = Infinity;
        this.bestPath = [];
    }

    private reduceMatrix(matrix: Matrix): [Matrix, number] {
        const newMatrix = matrix.map(row => [...row]);
        let reductionCost = 0;

        for (let i = 0; i < newMatrix.length; i++) {
            const minVal = Math.min(...newMatrix[i].filter(x => x !== Infinity));
            if (minVal !== Infinity && minVal > 0) {
                reductionCost += minVal;
                newMatrix[i] = newMatrix[i].map(x => x === Infinity ? Infinity : x - minVal);
            }
        }

        for (let j = 0; j < newMatrix[0].length; j++) {
            const col = newMatrix.map(row => row[j]);
            const minVal = Math.min(...col.filter(x => x !== Infinity));
            if (minVal !== Infinity && minVal > 0) {
                reductionCost += minVal;
                for (let i = 0; i < newMatrix.length; i++) {
                    if (newMatrix[i][j] !== Infinity) {
                        newMatrix[i][j] -= minVal;
                    }
                }
            }
        }

        return [newMatrix, reductionCost];
    }

    private deepCopyMatrix(matrix: Matrix): Matrix {
        return matrix.map(row => [...row]);
    }

    solve(): [Path, number] {
        const [reducedMatrix, reductionCost] = this.reduceMatrix(this.deepCopyMatrix(this.originalMatrix));
        
        const root = new Node(
            [this.start],
            reducedMatrix,
            reductionCost
        );
        
        const heap: Node[] = [root];
        this.heapify(heap);

        while (heap.length > 0) {
            const currentNode = this.heapPop(heap);

            if (currentNode.path.length === this.n) {
                const finalCost = currentNode.cost + 
                    currentNode.matrix[currentNode.path[currentNode.path.length - 1]][this.start];
                
                if (finalCost < this.bestCost) {
                    this.bestCost = finalCost;
                    this.bestPath = [...currentNode.path, this.start];
                }
                continue;
            }

            if (currentNode.cost >= this.bestCost) {
                continue;
            }

            const lastCity = currentNode.path[currentNode.path.length - 1];
            
            for (let nextCity = 0; nextCity < this.n; nextCity++) {
                if (currentNode.matrix[lastCity][nextCity] !== Infinity) {
                    const newMatrix = this.deepCopyMatrix(currentNode.matrix);
                    
                    for (let i = 0; i < this.n; i++) {
                        newMatrix[i][nextCity] = Infinity;
                    }
                    newMatrix[lastCity] = new Array(this.n).fill(Infinity);
                    
                    const [reducedNewMatrix, reduction] = this.reduceMatrix(newMatrix);
                    const newCost = currentNode.cost + currentNode.matrix[lastCity][nextCity] + reduction;
                    
                    const newPath = [...currentNode.path, nextCity];
                    
                    const child = new Node(newPath, reducedNewMatrix, newCost);
                    
                    this.heapPush(heap, child);
                }
            }
        }

        const resultPath = this.bestPath.map(x => x + 1);
        return [resultPath, this.bestCost];
    }

    private heapify(heap: Node[]): void {
        heap.sort((a, b) => a.cost - b.cost);
    }

    private heapPush(heap: Node[], node: Node): void {
        heap.push(node);
        heap.sort((a, b) => a.cost - b.cost);
    }

    private heapPop(heap: Node[]): Node {
        return heap.shift()!;
    }
}

