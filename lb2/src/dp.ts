import { type Path, type Matrix } from "./common"

export class DynamicProgrammingTSP {
    private matrix: Matrix;
    private n: number;
    private start: number;

    constructor(matrix: Matrix, startCity: number) {
        this.matrix = matrix.map(row => [...row]);
        this.n = matrix.length;
        this.start = startCity;
    }

    solve(): [Path, number] {
        if (this.n > 20) {
            throw new Error("Динамическое программирование неэффективно для n > 20");
        }

        const dp: { [mask: number]: { [last: number]: [number, number] } } = {};

        const startMask = 1 << this.start;
        dp[startMask] = {};
        dp[startMask][this.start] = [0, -1];

        for (let mask = 1; mask < (1 << this.n); mask++) {
            if (!(mask & startMask)) continue; 

            if (!dp[mask]) continue;

            for (let last = 0; last < this.n; last++) {
                if (!(mask & (1 << last)) || !dp[mask][last]) continue;

                const [currentCost] = dp[mask][last];

                for (let next = 0; next < this.n; next++) {
                    if (mask & (1 << next)) continue; 
                    if (this.matrix[last][next] === Infinity) continue;

                    const newMask = mask | (1 << next);
                    const newCost = currentCost + this.matrix[last][next];

                    if (!dp[newMask]) dp[newMask] = {};

                    if (!dp[newMask][next] || newCost < dp[newMask][next][0]) {
                        dp[newMask][next] = [newCost, last];
                    }
                }
            }
        }

        const fullMask = (1 << this.n) - 1;
        let minCost = Infinity;
        let lastCity = -1;

        for (let city = 0; city < this.n; city++) {
            if (dp[fullMask] && dp[fullMask][city] && this.matrix[city][this.start] !== Infinity) {
                const totalCost = dp[fullMask][city][0] + this.matrix[city][this.start];
                if (totalCost < minCost) {
                    minCost = totalCost;
                    lastCity = city;
                }
            }
        }

        if (minCost === Infinity) {
            throw new Error("Решение не найдено");
        }

        const path = this.reconstructPath(dp, fullMask, lastCity);
        return [path.map(x => x + 1), minCost];
    }

    private reconstructPath(dp: { [mask: number]: { [last: number]: [number, number] } },
        mask: number, lastCity: number): number[] {
        const path: number[] = [];
        let currentMask = mask;
        let currentCity = lastCity;

        while (currentCity !== -1) {
            path.push(currentCity);
            const [cost, prevCity] = dp[currentMask][currentCity];
            currentMask = currentMask ^ (1 << currentCity);
            currentCity = prevCity;
        }
        path.reverse()
        path.push(this.start);
        return path;
    }
}
