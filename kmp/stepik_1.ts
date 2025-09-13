import readline from "node:readline/promises"
import { KMP } from ".";

(async () => {
    const rl = readline.createInterface({
        input: process.stdin, 
        output: process.stdout,
        terminal: false
    })

    const readInput: Promise<string[]> = new Promise((resolve) => {
        const input: string[] = []; 

        rl.on('line', (line) => {
            input.push(line)
            if(input.length == 2) {
                rl.close()
                resolve(input)
            }
        })
    })

    readInput.then(input => {
        console.log(KMP(input[0], input[1]))
    })
})()