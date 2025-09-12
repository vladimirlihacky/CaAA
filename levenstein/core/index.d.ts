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
