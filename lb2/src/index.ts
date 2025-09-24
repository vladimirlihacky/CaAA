import { ApproximateTSP } from "./approximate"
import readline from "readline/promises"
import { LittleTSP } from "./little";
import { createReadStream, fstat } from "fs";
import { DynamicProgrammingTSP } from "./dp";

async function main() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    let n = -1; 
    
    const input = new Promise((resolve) => {
        const r = []
        rl.addListener("line", (line) => {
            if(n === -1) {
                return n = Number(line);
            }

            if(r.length < n) {
                r.push(line)

                if(r.length === n) {
                    rl.close()
                    resolve(r)
                }
            }
        })
    })
    const matrix = (await input).map(r => r.split(" ").map(Number))
    const tsp = new DynamicProgrammingTSP(matrix, 0);
    const [path, cost] = tsp.solve();
    console.log(path.slice(0, -1)!.map(e => e - 1).join(" "));
    console.log(cost)
}

main()