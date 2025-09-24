export type Cost = number; 

export type Matrix<T> = T[][];

export type Operation = {
    name: string, 
    cost: Cost,
    call: (matrix: Matrix<Step>, i: number, j: number, a: string, b: string) => {
        cost: Cost, 
        i: number, 
        j: number
    },
};

export type Step = {
    operation: Operation,
    cost: number,
    i: number, 
    j: number,
    currentState: string, 
}

export type LevenshteinParams = {
    costDelete?: Cost, 
    costInsert?: Cost, 
    costReplace?: Cost, 
    additionalOperations?: Operation[],
}

export class Levenshtein {
    public delete: Operation = {
        name: "delete", 
        cost: 1, 
        call: function(matrix, i, j, a, b) {
            return {
                cost: matrix[i - 1][j].cost + this.cost, 
                i: i - 1, 
                j: j
            }
        }
    };
    public insert: Operation = {
        name: "insert", 
        cost: 1, 
        call: function(matrix, i, j, a, b) {
            return {
                cost: matrix[i][j - 1].cost + this.cost, 
                i: i, 
                j: j - 1
            }
        }
    }; 
    public replace: Operation = {
        name: "replace", 
        cost: 1, 
        call: function(matrix, i, j, a, b) {
            return {
                cost: matrix[i - 1][j - 1].cost + this.cost,
                i: i - 1, 
                j: j - 1
            }
        }
    };
    public match: Operation = {
        name: "match", 
        cost: 0, 
        call: function(matrix, i, j, a, b) { 
            if(a[i - 1] == b[j - 1]) {
                return {
                    cost: matrix[i - 1][j - 1].cost + this.cost,
                    i: i - 1, 
                    j: j - 1
                }
            }

            return {
                cost: Infinity,
                i: i - 1, 
                j: j - 1
            };
        }
    }
    public readonly additionalOperations: Operation[] = [];

    public operations: Operation[] = [
        this.match,
        this.delete, 
        this.insert, 
        this.replace, 
        ...this.additionalOperations
    ]
    
    constructor({
        costDelete, 
        costInsert,
        costReplace,
        additionalOperations
    }: LevenshteinParams) {
        this.delete.cost = costDelete ?? 1; 
        this.insert.cost = costInsert ?? 1; 
        this.replace.cost = costReplace ?? 1;
        this.additionalOperations = additionalOperations ?? [];
        this.operations.push(...this.additionalOperations)
    }

    public matrix(a: string, b: string): Matrix<Step> {
        return this.fillMatrix(a, b);
    }

    public steps(a: string, b: string): Step[] {
        const matrix = this.fillMatrix(a, b) 
        const steps = []

        let i = a.length; 
        let j = b.length; 
        
        while(i != 0 || j != 0) {
            const step = matrix[i][j]

            steps.push(step)

            i = step.i 
            j = step.j 
        }

        return steps.reverse()
    }

    public distance(a: string, b: string): Cost {
        return this.fillMatrix(a, b)[a.length][b.length].cost
    }

    private fillMatrix(a: string, b: string): Matrix<Step> {
        const matrix: Matrix<Step> = this.initMatrix(a.length, b.length);

        for(let i = 1; i < a.length + 1; i++) {
            for(let j = 1; j < b.length + 1; j++) {
                const steps: Step[] = this.operations.map(op => ({
                    ...op.call(matrix, i, j, a, b),
                    operation: op, 
                    currentState: "",
                }))

                let bestStep = steps[0]
                for(let step of steps) {
                    if(step.cost < bestStep.cost) {
                        bestStep = step;
                    }
                }

                matrix[i][j] = bestStep
            }
        }

        return matrix
    }

    private initMatrix(m: number, n: number): Matrix<Step> {
        const matrix: Matrix<Step> = Array.from(
            new Array(m + 1), 
            () => Array.from(new Array(n + 1))
        ) 

        this.delete = this.operations.find(e => e.name == "delete") ?? this.delete;
        this.insert = this.operations.find(e => e.name == "insert") ?? this.insert;

        for(let i = 0; i < m + 1; i++) {
            matrix[i][0] = { 
                operation: this.delete, 
                cost: i * this.delete.cost, 
                i: i - 1, 
                j: 0,
                currentState: ""
            };
        }

        for(let j = 0; j < n + 1; j++) {
            matrix[0][j] = {
                operation: this.insert, 
                currentState: "", 
                cost: j * this.insert.cost, 
                i: 0, 
                j: j - 1
            }
        }

        return matrix;
    }
}