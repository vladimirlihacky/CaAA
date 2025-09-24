import { type SearchEntry, SearchTree } from ".";

export class WildcardSearchTree extends SearchTree {
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