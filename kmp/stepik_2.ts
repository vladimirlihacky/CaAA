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
        if(input[0].length != input[1].length) {
            console.log(-1)
            return
        }
        const matches = KMP(input[1], input[0].repeat(2));
        console.log(matches.length > 0 ? matches[0] : -1)
    })
})()