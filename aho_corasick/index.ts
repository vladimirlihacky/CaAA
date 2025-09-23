export type Pattern = [string, number]

export type SearchEntry = {
    pattern: Pattern, 
    at: number
}

export class Node {
    constructor(
        public children: Record<string, Node> = {},
        public output: Pattern[] = [],
        public fail: Node | null = null,
    ) {}
}
export class SearchTree {
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