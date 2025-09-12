<script lang="ts">
    import { nanoid } from "nanoid";

    type Props = {
        value?: string | number,
        label?: string,
    }
    let { 
        value = $bindable(), 
        label, 
    }: Props = $props();

    let id = nanoid();
</script>

<div class="input-wrapper">
    <label class="input-label" for={id}>
        {label}
    </label>
    <input class="input input-text" name={id} min="0" type={typeof value == "number" ? "number" : "text"} bind:value={value}>
</div>

<style>
    .input-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        width: 100%;
    }

    .input-label {
        font-family: 'IBM Plex Mono';
        font-size: var(--font-size-sm);
    }

    .input {
        padding: 1rem;
        height: 50px;
        display: flex;
        align-items: center;
        background-color: var(--background-secondary);
        border: none;
        font-family: 'IBM Plex Mono';
        -moz-appearance: textfield; 
    }

    .input:focus {
        outline: 3px solid var(--color-accent);
        border-radius: 0.25rem;
        background-color: rgba(255, 255, 255, 0.1);
    }
</style>