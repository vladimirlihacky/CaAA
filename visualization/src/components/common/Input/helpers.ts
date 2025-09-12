export const objectReplacer = (key: any, value: any) => {
    switch(typeof value) {
        case "function": 
            return value.toString();
        default: 
            return value;
    }
}