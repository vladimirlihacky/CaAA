import readline from "node:readline/promises"

export type TypeName = "string" | "number" | `${"string" | "number"}[${number}]`

export type Typedef<T extends Record<string, TypeName> = Record<string, TypeName>> = {
    [K in keyof T]: T[K]
}

type SchemaToType<T extends Record<string, TypeName>> = {
    [K in keyof T]: T[K] extends "string" ? string :
        T[K] extends "number" ? number :
        T[K] extends `string[${infer N}]` ? string[] :
        T[K] extends `number[${infer N}]` ? number[] :
        never
}

export class IO {
    protected options: Parameters<typeof readline.createInterface>[0]

    constructor(options: typeof this.options) {
        this.options = options
    }

    private createInterface(): readline.Interface {
        return readline.createInterface(this.options)
    }

    private async readLines(n: number): Promise<string[]> {
        const io = this.createInterface()
        
        const read = new Promise<string[]>((resolve, reject) => {
            const lines: string[] = []
            let remaining = n;
            
            io.addListener("line", (line: string) => {
                lines.push(line); 
                remaining -= 1;

                if(!remaining) {
                    io.close()
                    return resolve(lines)
                }
            })
        })

        return await read;
    }

    private parseArrayType(typeDef: string): { type: "string" | "number"; length: number } | null {
        const match = typeDef.match(/^(string|number)\[(\d+)\]$/);
        if (!match) return null;
        
        return {
            type: match[1] as "string" | "number",
            length: parseInt(match[2], 10)
        };
    }

    private isArrayType(typeDef: string): boolean {
        return /^(string|number)\[\d+\]$/.test(typeDef);
    }

    private calculateTotalLines(schema: Record<string, TypeName>): number {
        let totalLines = 0;
        
        for (const typeDef of Object.values(schema)) {
            if (this.isArrayType(typeDef)) {
                const parsed = this.parseArrayType(typeDef);
                if (parsed) {
                    totalLines += parsed.length;
                }
            } else {
                totalLines += 1;
            }
        }
        
        return totalLines;
    }

    public async read<T extends Record<string, TypeName>>(what: T): Promise<SchemaToType<T>> {
        const entries = Object.entries(what);
        const totalLines = this.calculateTotalLines(what);
        const lines = await this.readLines(totalLines);
        const result = {} as SchemaToType<T>;
        
        let currentLineIndex = 0;

        for (const [key, typeDef] of entries) {
            if (this.isArrayType(typeDef)) {
                const parsed = this.parseArrayType(typeDef);
                if (!parsed) {
                    throw new Error(`Invalid array type definition: ${typeDef}`);
                }
                
                const arrayLength = parsed.length;
                const arrayLines = lines.slice(currentLineIndex, currentLineIndex + arrayLength);
                currentLineIndex += arrayLength;
                
                if (parsed.type === "string") {
                    (result as any)[key] = arrayLines;
                } else if (parsed.type === "number") {
                    (result as any)[key] = arrayLines.map(Number);
                }
            } else {
                const line = lines[currentLineIndex];
                currentLineIndex += 1;
                
                if (typeDef === "string") {
                    (result as any)[key] = line;
                } else if (typeDef === "number") {
                    (result as any)[key] = Number(line);
                }
            }
        }

        return result;
    }
}