<script lang="ts">

type Props = {
    title?: string, 
    children: any,
}

const {
    title,
    children
}: Props = $props()

</script>

<div class="container">
    {#if title}
    <div class="container-title">
        { title }
    </div>
    {/if}

    <div class="container-content">
        {@render children?.()}
    </div>
</div>

<style>
    .container {
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: start;
        width: 100%;
    }

    .container-title {
        font-size: 1.25rem;
        font-weight: 600;
    }

    .container-content {
        display: flex;
        flex-direction: column;
        align-items: start;
        gap: 0.25rem;
        width: 100%;
    }
</style>