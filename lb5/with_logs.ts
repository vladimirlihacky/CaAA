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
        console.log(`[ADD_PATTERN] Начало добавления паттерна: "${pattern[0]}" (id: ${pattern[1]})`);
        let node = this.root

        for (const char of pattern[0]) {
            console.log(`[ADD_PATTERN] Обработка символа "${char}"`);
            if (!node.children[char]) {
                console.log(`[ADD_PATTERN] Создание нового узла для символа "${char}"`);
                node.children[char] = new Node();
            } else {
                console.log(`[ADD_PATTERN] Узел для символа "${char}" уже существует`);
            }
            node = node.children[char];
        }

        node.output.push(pattern);
        console.log(`[ADD_PATTERN] Паттерн "${pattern[0]}" добавлен в узел. Выходы узла:`, node.output);
    }

    private setLinks() {
        console.log('[SET_LINKS] Начало установки fail-ссылок');
        const queue: Node[] = [];

        for (const char in this.root.children) {
            const child = this.root.children[char];
            console.log(`[SET_LINKS] Инициализация ребенка корня "${char}"`);
            child.fail = this.root;
            queue.push(child);
            console.log(`[SET_LINKS] Ребенок "${char}" добавлен в очередь`);
        }

        while (queue.length > 0) {
            const node = queue.shift()!;
            console.log(`[SET_LINKS] Обработка узла. Дети узла: [${Object.keys(node.children).join(', ')}]`);

            for (const char in node.children) {
                const child = node.children[char];
                console.log(`[SET_LINKS] Обработка ребенка "${char}"`);
                queue.push(child);
                console.log(`[SET_LINKS] Ребенок "${char}" добавлен в очередь`);

                let fail = node.fail;
                console.log(`[SET_LINKS] Поиск fail-узла для ребенка "${char}". Начальный fail:`, 
                    fail === this.root ? 'корень' : `узел с детями [${Object.keys(fail!.children).join(', ')}]`);

                while (fail && !(char in fail.children)) {
                    console.log(`[SET_LINKS] Fail-узел не имеет ребенка "${char}", переход к следующему fail-узлу`);
                    fail = fail.fail;
                }

                if (!fail) {
                    child.fail = this.root;
                    console.log(`[SET_LINKS] Fail-узел не найден, установлен корень для ребенка "${char}"`);
                } else {
                    child.fail = fail.children[char];
                    console.log(`[SET_LINKS] Найден fail-узел для ребенка "${char}"`);
                }

                const outputsBefore = [...child.output];
                child.output.push(...child.fail.output);
                console.log(`[SET_LINKS] Обновление выходов ребенка "${char}":`, {
                    было: outputsBefore,
                    добавлено: child.fail.output,
                    стало: child.output
                });
            }
        }
        console.log('[SET_LINKS] Завершение установки fail-ссылок');
    }

    public search(text: string): SearchEntry[] {
        console.log(`[SEARCH] Начало поиска в тексте: "${text}"`);
        let node = this.root;
        const results: SearchEntry[] = [];

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            console.log(`[SEARCH] Символ "${char}" на позиции ${i}`);

            while (node !== this.root && !node.children[char]) {
                console.log(`[SEARCH] Переход по fail-ссылке от узла с детьми [${Object.keys(node.children).join(', ')}]`);
                node = node.fail!;
            }

            if (node.children[char]) {
                node = node.children[char];
                console.log(`[SEARCH] Переход к ребенку "${char}". Текущие выходы узла:`, node.output);
            } else {
                console.log(`[SEARCH] Ребенок "${char}" не найден, остаемся в корне`);
            }

            if (node.output.length > 0) {
                console.log(`[SEARCH] Найдены паттерны в позиции ${i}:`, node.output);
                for (const pattern of node.output) {
                    results.push({
                        pattern,
                        at: i - pattern[0].length + 1
                    });
                }
            }
        }

        console.log('[SEARCH] Поиск завершен. Найденные результаты:', results);
        return results;
    }

    public getMaxEdgesFromNode(): number {
        console.log('[MAX_EDGES] Начало вычисления максимального количества дуг из одной вершины');
        let maxEdges = 0;
        const queue: Node[] = [this.root];

        while (queue.length > 0) {
            const node = queue.shift()!;
            const edgeCount = Object.keys(node.children).length;
            
            console.log(`[MAX_EDGES] Узел имеет ${edgeCount} исходящих дуг. Текущий максимум: ${maxEdges}`);
            
            if (edgeCount > maxEdges) {
                maxEdges = edgeCount;
                console.log(`[MAX_EDGES] Обновлен максимум: ${maxEdges}`);
            }

            for (const child of Object.values(node.children)) {
                queue.push(child);
            }
        }

        console.log(`[MAX_EDGES] Максимальное количество дуг из одной вершины: ${maxEdges}`);
        return maxEdges;
    }

    public cutPatternsFromText(text: string): string {
        console.log(`[CUT_PATTERNS] Начало вырезания паттернов из текста: "${text}"`);
        
        const results = this.search(text);
        console.log(`[CUT_PATTERNS] Найдено вхождений паттернов: ${results.length}`);

        const keepChars = new Array(text.length).fill(true);
        
        for (const result of results) {
            const start = result.at;
            const end = start + result.pattern[0].length - 1;
            console.log(`[CUT_PATTERNS] Вырезаем паттерн "${result.pattern[0]}" с позиции ${start} до ${end}`);
            
            for (let i = start; i <= end; i++) {
                if (i >= 0 && i < text.length) {
                    keepChars[i] = false;
                }
            }
        }

        let remainingText = '';
        for (let i = 0; i < text.length; i++) {
            if (keepChars[i]) {
                remainingText += text[i];
            }
        }

        console.log(`[CUT_PATTERNS] Остаток строки после вырезания: "${remainingText}"`);
        return remainingText;
    }

    constructor(patterns: string[]) {
        console.log('[CONSTRUCTOR] Создание SearchTree с паттернами:', patterns);
        this.patterns = patterns.map((p, i) => [p, i] as Pattern);
        
        console.log('[CONSTRUCTOR] Добавление паттернов в дерево');
        for (const pattern of this.patterns) {
            this.addPattern(pattern);
        }

        console.log('[CONSTRUCTOR] Построение fail-ссылок');
        this.setLinks();
        console.log('[CONSTRUCTOR] Дерево построено');
    }
}

export function processTextWithSearchTree(patterns: string[], text: string) {
    console.log('=== ОБРАБОТКА ТЕКСТА С ПОИСКОВЫМ ДЕРЕВОМ ===');
    const searchTree = new SearchTree(patterns);
    
    const maxEdges = searchTree.getMaxEdgesFromNode();
    console.log(`✓ Максимальное количество дуг из одной вершины: ${maxEdges}`);
    
    const remainingText = searchTree.cutPatternsFromText(text);
    console.log(`✓ Остаток строки после вырезания паттернов: "${remainingText}"`);
    
    return {
        maxEdges,
        remainingText
    };
}

export class WildcardSearchTree extends SearchTree {
    private positions: number[]

    constructor(
        private pattern: string, 
        private wildcard: string,
    ) {
        console.log(`[WILDCARD_CONSTRUCTOR] Создание WildcardSearchTree с паттерном: "${pattern}", wildcard: "${wildcard}"`);
        
        const patterns = pattern.split(wildcard).filter(s => s);
        console.log(`[WILDCARD_CONSTRUCTOR] Извлеченные фрагменты паттерна:`, patterns);

        const positions = [];
        console.log(`[WILDCARD_CONSTRUCTOR] Определение позиций фрагментов в исходном паттерне`);

        let flag = true; 
        for(let i = 0; i < pattern.length; i++) {
            if(pattern[i] !== wildcard && flag) {
                console.log(`[WILDCARD_CONSTRUCTOR] Найден начальный символ фрагмента на позиции ${i} (символ: "${pattern[i]}")`);
                positions.push(i);
                flag = false;
            }

            if(pattern[i] === wildcard) {
                console.log(`[WILDCARD_CONSTRUCTOR] Найден wildcard на позиции ${i}, сброс флага`);
                flag = true;
            }
        }

        console.log(`[WILDCARD_CONSTRUCTOR] Рассчитанные позиции фрагментов:`, positions);

        super(patterns);
        this.positions = positions;
        console.log(`[WILDCARD_CONSTRUCTOR] WildcardSearchTree создан. Количество фрагментов: ${patterns.length}, позиции:`, positions);
    }

    public search(text: string): SearchEntry[] {
        console.log(`[WILDCARD_SEARCH] Начало поиска с wildcard в тексте: "${text}"`);
        console.log(`[WILDCARD_SEARCH] Исходный паттерн: "${this.pattern}", wildcard: "${this.wildcard}"`);

        if(this.patterns.length === 0) {
            console.log(`[WILDCARD_SEARCH] Нет фрагментов для поиска, возвращаем пустой результат`);
            return [];
        }

        console.log(`[WILDCARD_SEARCH] Вызов поиска фрагментов в базовом классе`);
        const fragmentMatches = super.search(text);
        console.log(`[WILDCARD_SEARCH] Найдено совпадений фрагментов: ${fragmentMatches.length}`, fragmentMatches);

        const matches: Record<number, number[]> = {};
        console.log(`[WILDCARD_SEARCH] Анализ совпадений фрагментов для поиска полного паттерна`);

        for(const { pattern, at } of fragmentMatches) {
            const [ fragment, idx ] = pattern;
            const offset = this.positions[idx];
            const start = at - offset; 

            console.log(`[WILDCARD_SEARCH] Обработка фрагмента "${fragment}" (индекс: ${idx}) на позиции ${at}`);
            console.log(`[WILDCARD_SEARCH] Смещение фрагмента в паттерне: ${offset}, расчетная стартовая позиция: ${start}`);

            if(start >= 0 && start <= text.length - this.pattern.length) {
                console.log(`[WILDCARD_SEARCH] Стартовая позиция ${start} валидна. Добавление фрагмента ${idx} в matches[${start}]`);
                matches[start] ??= []; 
                matches[start].push(idx);
                console.log(`[WILDCARD_SEARCH] Текущее состояние matches[${start}]:`, matches[start]);
            } else {
                console.log(`[WILDCARD_SEARCH] Стартовая позиция ${start} невалидна (выходит за границы текста)`);
            }
        } 

        console.log(`[WILDCARD_SEARCH] Анализ завершен. Найдено потенциальных стартовых позиций: ${Object.keys(matches).length}`);
        console.log(`[WILDCARD_SEARCH] Состояние matches:`, matches);

        const results: SearchEntry[] = [];
        const sortedPositions = Object.keys(matches).map(Number).sort((a, b) => a - b);
        console.log(`[WILDCARD_SEARCH] Отсортированные позиции для проверки:`, sortedPositions);

        for(const position of sortedPositions) {
            const matched = new Set(matches[position]);
            console.log(`[WILDCARD_SEARCH] Проверка позиции ${position}. Найдены фрагменты:`, Array.from(matched));
            console.log(`[WILDCARD_SEARCH] Ожидаемое количество фрагментов: ${this.patterns.length}, найдено уникальных: ${matched.size}`);

            if(matched.size === this.patterns.length) {
                console.log(`[WILDCARD_SEARCH] ✓ Найден полный паттерн на позиции ${position}`);
                results.push({ pattern: [this.pattern, 0], at: Number(position + 1) });
            } else {
                console.log(`[WILDCARD_SEARCH] ✗ Позиция ${position} не содержит все необходимые фрагменты`);
            }
        }

        console.log(`[WILDCARD_SEARCH] Поиск завершен. Найдено полных совпадений: ${results.length}`, results);
        return results;
    }
}
