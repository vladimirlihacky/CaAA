export function computeLPS(str: string): number[] {
    const lps: number[] = Array.from({length: str.length}, () => 0);

    for(let i = 1; i < str.length; i++) {
        let k = lps[i - 1];

        while((k > 0) && (str[i] != str[k])) k = lps[k - 1];

        if(str[i] == str[k]) k++;

        lps[i] = k;
    }

    return lps;
}

export function KMP(needle: string, haystack: string): number[] {
    let k = 0; 
    let A = [];
    const lps = computeLPS(needle);

    for(let i = 0; i < haystack.length; i++) {
        while(k > 0 && haystack[i] != needle[k]) {
            k = lps[k - 1];
        }

        if(haystack[i] == needle[k]) {
            k = k + 1;
        }

        if(k == needle.length) {
            A.push(i - needle.length + 1)
            k = lps[k - 1]
        }
    }

    return A
}

export function naive(needle: string, haystack: string): number[] {
    const matches = []
    
    for(let i = 0; i < haystack.length - needle.length + 1; i++) {
        let m = true; 
        for(let j = 0; j < needle.length; j++) {
            if(haystack[i + j] != needle[j]) {
                m = false; 
                break;
            }
        }

        if(m) matches.push(i);
    }

    return matches
}

