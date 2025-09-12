<script lang="ts">

type Props = {
    value?: string, 
    lang?: string
}
let {
    value = $bindable(),
    lang = 'json'
}: Props = $props()

</script>

<pre class="input input-code json-highlighter language-javascript" contenteditable="true" bind:textContent={value}>
    
</pre>
