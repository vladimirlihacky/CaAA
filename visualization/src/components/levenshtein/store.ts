import { writable } from "svelte/store";
import type { Operation } from "caaa_levenshtein";

type Store = {
    source: string, 
    destination: string, 
    
}

const store = writable({
    source: "",
    destination: "", 
    operations: {

    }
})