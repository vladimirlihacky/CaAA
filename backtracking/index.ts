import { IO } from "./io";

type Square = { x: number, y: number, side: number }

class Board {
    private height: number;
    private width: number;
    private filled: number[] = [];
    private best: Square[];

    constructor(width: number, height: number) {
        this.height = height;
        this.width = width;
        this.filled = new Array(height).fill(0);
        this.best = Array.from({ length: width * height + 1 });
    }

    searchIter() {
        const stack: { x: number, y: number, squares: Square[], filled: number[] }[] = [
            { x: 0, y: 0, squares: [], filled: [...this.filled] }
        ]

        main: while (stack.length != 0) {
            let { x, y, squares, filled: tmp } = stack.pop()!;
            const filled = [...tmp]

            if (x === this.width) {
                y++;
                x = 0;
            }

            if (y === this.height) {
                this.best = squares;
                continue main;
            }

            if ((filled[y] >> x) & 1) {
                stack.push({ x: x + 1, y, squares, filled })
            } else if (squares.length + 1 < this.best.length) {
                let maxRows: number = 0;
                let maxCols: number = 0;

                check: for (let checkRow: number = y; checkRow < this.height; checkRow++) {
                    if ((filled[checkRow] >> x) & 1) break check;
                    maxRows++;
                }

                check: for (let checkCol: number = x; checkCol < this.width; checkCol++) {
                    if ((filled[y] >> checkCol) & 1) break check;
                    maxCols++;
                }

                let maxSquareSize: number = Math.min(maxRows, maxCols, this.width - 1, this.height - 1)
                
                const tmp = []
                for (let side: number = 1; side <= maxSquareSize; side++) {
                    for (let offset: number = 0; offset < side; offset++) {
                        filled[y + side - 1] |= 1 << (x + offset);
                        filled[y + offset] |= 1 << (x + side - 1);
                    }

                    tmp.push({ y: y, x: x + side, squares: [...squares, { x: x, y: y, side }], filled: [...filled]});
                }

                while(tmp.length != 0) {
                    stack.push(tmp.pop()!)
                }
            }
        }
    }

    search(y: number, x: number, squares: Square[]) {

        if (x === this.width) {
            y++;
            x = 0;
        }

        if (y === this.height) {
            this.best = squares;
            return;
        }

        if ((this.filled[y] >> x) & 1) {
            this.search(y, x + 1, squares)
        } else if (squares.length + 1 < this.best.length) {
            let maxRows: number = 0;
            let maxCols: number = 0;

            for (let checkRow: number = y; checkRow < this.height; checkRow++) {
                if ((this.filled[checkRow] >> x) & 1) break;
                maxRows++;
            }

            for (let checkCol: number = x; checkCol < this.width; checkCol++) {
                if ((this.filled[y] >> checkCol) & 1) break;
                maxCols++;
            }

            let maxSquareSize: number = Math.min(maxRows, maxCols, this.width - 1, this.height - 1)

            for (let side: number = 1; side <= maxSquareSize; side++) {
                for (let offset: number = 0; offset < side; offset++) {
                    this.filled[y + side - 1] |= 1 << (x + offset);
                    this.filled[y + offset] |= 1 << (x + side - 1);
                }

                this.search(y, x + side, [...squares, { x: x, y: y, side }]);
            }

            for (let r: number = y; r < y + maxSquareSize; r++) {
                for (let c: number = x; c < x + maxSquareSize; c++) {
                    this.filled[r] ^= 1 << c;
                }
            }
        }
    }

    solve() {
        this.search(0, 0, []);

        return this.best;
    }

    solveIter() {
        this.searchIter();

        return this.best;
    }
}