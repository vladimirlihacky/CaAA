import { IO } from "./io";

type Square = { x: number, y: number, side: number }

class Board {
    private height: number;
    private width: number;
    private filled: number[] = [];
    private best: Square[];
    private variants: Square[][] = [];

    constructor(width: number, height: number) {
        this.height = height;
        this.width = width;
        this.filled = new Array(height).fill(0);
        this.best = Array.from({ length: width * height + 1 });
    }

    search() {
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
                if(squares.length === this.best.length) {
                    this.variants.push(squares)
                } else {
                    this.variants = [squares]
                    this.best = squares;
                }
                continue main;
            }

            if ((filled[y] >> x) & 1) {
                stack.push({ x: x + 1, y, squares, filled })
            } else if (squares.length + 1 <= this.best.length) {
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
                
                for (let side: number = 1; side <= maxSquareSize; side++) {
                    for (let offset: number = 0; offset < side; offset++) {
                        filled[y + side - 1] |= 1 << (x + offset);
                        filled[y + offset] |= 1 << (x + side - 1);
                    }

                    stack.push({ y: y, x: x + side, squares: [...squares, { x: x, y: y, side }], filled: [...filled]});
                }
            }
        }
    }

    private gcd(a: number, b: number): number {
        a = Math.abs(a);
        b = Math.abs(b);
        
        if (a === b) {
            if (a === 0) return 0;
            
            for (let i = Math.min(a - 1, Math.abs(a)); i > 0; i--) {
                if (a % i === 0) {
                    return i;
                }
            }
            return 1;
        }

        if (b === 0) {
            return a;
        }
        
        return this.gcd(b, a % b);
    }

    solve() {
        let gcd = this.gcd(this.width, this.height);

        this.height /= gcd;
        this.width /= gcd;

        this.search();

        return this.variants.map(variant => variant.map(({ x, y, side }) => ({ x: x * gcd, y: y * gcd, side: side * gcd })));
    }
}

(async () => {
    const io = new IO({ input: process.stdin, output: process.stdout })
    const { side } = await io.read({ side: "number" })

    console.log(
        new Board(side, side)
        .solve()
        .at(0)!
        .map(({ x, y, side }) => `${x} ${y} ${side}`)
        .join("\n")
    )
})()