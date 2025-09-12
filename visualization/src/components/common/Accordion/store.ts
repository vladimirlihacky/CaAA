import { writable } from "svelte/store";

type Groups = Record<string, any[]>

export const groups = writable<Groups>({})
export const groupPush = (group: string | undefined, id: string) => {
    if(!group) return; 

    groups.update(val => ({
        ...val, 
        name: [...val[group] ?? [], id]
    }))
}
export const expand = (group: string | undefined, id: string) => {
    
}