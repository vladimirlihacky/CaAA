const readline = require("node:readline/promises")

type Pattern = [string, number]

type SearchEntry = {
    pattern: Pattern, 
    at: number
}

class Node {
    constructor(
        public children: Record<string, Node> = {},
        public output: Pattern[] = [],
        public fail: Node | null = null,
    ) {}
}
class SearchTree {
    protected patterns: Pattern[]
    public root: Node = new Node()

    public addPattern(pattern: Pattern) {
        let node = this.root

        for (const char of pattern[0]) {
            node.children[char] ??= new Node()
            node = node.children[char]
        }

        node.output.push(pattern);
    }

    private setLinks() {
        const queue: Node[] = []

        for (const char in this.root.children) {
            const child = this.root.children[char]

            child.fail = this.root;
            queue.push(child)

        }

        while (queue.length > 0) {
            const node = queue.shift()!

            for (const char in node.children) {
                const child = node.children[char]

                queue.push(child)

                let fail = node.fail
                while (fail && !(char in fail.children)) {
                    fail = fail.fail
                }

                if (!fail) {
                    child.fail = this.root
                } else {
                    child.fail = fail.children[char]
                }

                child.output.push(...child.fail.output)
            }
        }
    }

    public search(text: string): SearchEntry[] {
        let node = this.root 
        const results = []

        for(let i = 0; i < text.length; i++) {
            const char = text[i]

            while(!node.children[char] && node.fail) {
                node = node.fail
            }

            if(node.children[char]) {
                node = node.children[char]
            } else {
                node = this.root
            }

            for(const pattern of node.output) {
                results.push({ pattern: pattern, at: i - pattern[0].length + 1 })
            }
        }

        return results
    }

    constructor(patterns: string[]) {
        this.patterns = patterns.map((p, i) => [p, i] as Pattern);
        for (const pattern of this.patterns) {
            this.addPattern(pattern);
        }
        this.setLinks()
    }
}

class WildcardSearchTree extends SearchTree {
    private positions: number[]

    constructor(
        private pattern: string, 
        private wildcard: string,
    ) {
        const patterns = pattern.split(wildcard).filter(s => s)
        const positions = [];

        let flag = true; 
        for(let i = 0; i < pattern.length; i++) {
            if(pattern[i] !== wildcard && flag) {
                positions.push(i)
                flag = false;
            }

            if(pattern[i] === wildcard) {
                flag = true;
            }
        }

        super(patterns)
        this.positions = positions
    }

    public search(text: string): SearchEntry[] {
        if(this.patterns.length === 0) return [];

        const fragmentMatches = super.search(text)
        const matches: Record<number, number[]> = {}

        for(const { pattern, at } of fragmentMatches) {
            const [ fragment, idx ] = pattern;
            const offset = this.positions[idx]
            const start = at - offset; 

            if(start >= 0 && start <= text.length - this.pattern.length) {
                matches[start] ??= []; 
                matches[start].push(idx)
            }
        } 

        const results: SearchEntry[] = []
        for(const position of Object.keys(matches).toSorted().map(Number)) {
            const matched = new Set(matches[position])

            if(matched.size === this.patterns.length) {
                results.push({ pattern: [this.pattern, 0], at: Number(position + 1) })
            }
        }

        return results
    }
}

(async () => {
    const rl = readline.createInterface({
        input: process.stdin, 
        output: process.stdout,
        terminal: false
    })

    const readInput: Promise<{
            text: string, 
            pattern: string, 
            joker: string,
        }> = new Promise((resolve) => {
        const input: {
            text: string, 
            pattern: string, 
            joker: string,
        } = {
            text: "", 
            pattern: "", 
            joker: "",
        }; 

        rl.on('line', (line: string) => {
            if(input.text.length == 0) {
                input.text = line.trim(); 
                return;
            }

            if(input.pattern.length == 0) {
                input.pattern = line.trim(); 
                return;
            }

            if (input.joker.length == 0) {
                input.joker = (line.trim());
                rl.close();
                resolve(input);
                return;
            }
        })

        return input
    })

    readInput.then(input => {
        const searchTree = new WildcardSearchTree(input.pattern, input.joker)

        console.log(
            searchTree
                .search(input.text)
                .map(entry => entry.at)
                .sort((a, b) => a - b)
                .join("\n")
        )
    })
})()