<script lang="ts">

import Arrow from "./Arrow.svelte"
import { nanoid } from "nanoid";
import { groupPush } from "./store";
import { slide as transition } from "svelte/transition";
import { cubicOut as easing } from "svelte/easing"
type Props = {
    title: string, 
    children: any,
    expanded?: boolean,
    group?: string
}

let {
    title,
    children,
    expanded = false,
    group,
}: Props = $props()

let id = nanoid();
groupPush(group, id);
</script>

<div class="accordion">
    <div class="accordion-header" onclick={() => expanded = !expanded}>
        <div class="accordion-title">
            { title }
        </div>
        <div class="accordion-arrow">
            <Arrow />
        </div>
    </div>   

    {#if expanded}
    <div transition:transition={{ duration: 200, easing }} class="accordion-content">
        {@render children?.()}
    </div>
    {/if}
</div>

<style>
    .accordion {
        display: flex;
        flex-direction: column;
        align-items: start;
        width: 100%;
    }
    .accordion-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 0.25rem 0;
        cursor: pointer;
    }
    .accordion-title {
        font-size: var(--font-size-sm);
        font-family: 'IBM Plex Mono';
        font-weight: 400;
    }
    .accordion-arrow {
        width: 1rem;
        height: 1rem;
    }
    .accordion-content {
        /* background-color: var(--background-secondary); */
        width: 100%;
    }
</style>