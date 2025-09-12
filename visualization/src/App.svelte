<script lang="ts">
  
import Accordion from "./components/common/Accordion/Accordion.svelte";
import Container from "./components/common/Container.svelte";
import TextInput from "./components/common/Input/TextInput.svelte";
import { 
  Levenshtein as Base, 
  type LevenshteinParams, 
  type Operation 
} from "caaa_levenshtein";

import { fade as transition } from "svelte/transition";
import { cubicOut as easing } from "svelte/easing";

class Levenshtein extends Base {
  public source: string = $state("google")
  public destination: string = $state("facebook")

  constructor(params: LevenshteinParams) {
    super(params);

    const _operations: Operation[] = $state([])
    for(const operation of this.operations) {
      const _operation = $state(operation) 
      _operations.push(_operation)
    }

    this.operations = _operations;
  }

  matrix() {
    return super.matrix(this.source.trim(), this.destination.trim());
  }
  
  distance() {
    return super.distance(this.source.trim(), this.destination.trim());
  }
  
  steps() {
    return super.steps(this.source.trim(), this.destination.trim());
  }
}

const levenshtein = new Levenshtein({})
</script>

<main>
  <div class="sidebar">
    <Container title="Input">
      <TextInput label="Source" bind:value={levenshtein.source} />
      <TextInput label="Destination" bind:value={levenshtein.destination} />
      <code>
        Distance: { JSON.stringify(levenshtein.distance(), null, "  ") }
      </code>
    </Container>
    <Container title="Operation costs">
      {#each levenshtein.operations as operation, i }
        <Accordion title={operation.name} group="operations" expanded>
          <TextInput bind:value={operation.cost} />
        </Accordion>
      {/each}
    </Container>
  </div>
  <div class="content">
    <div class="header">
      Matrix
    </div>
    <div class="matrix">
      {#each levenshtein.matrix() as row, i ([levenshtein.source, levenshtein.destination])}
        <div class="matrix-row">
          {#each row as col, j }
          {@const isFinalStep = levenshtein.steps().filter(e => JSON.stringify(e) == JSON.stringify(col)).length != 0 }
            <div 
              in:transition|global={{ delay: (i * row.length + j) * 10, duration: 500, easing }} 
              class="matrix-cell {isFinalStep || (i + j == 0)? 'matrix-cell-active' : ''}">
              <div class="matrix-cell-operation">
                { i + j == 0 ? 'start' : col.operation.name }
              </div>
              <div class="matrix-cell-cost">
                { col.cost }
              </div>
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</main>

<style>
  main {
    height: 100vh;
    display: grid;
    grid-template-columns: 360px 1fr;
  }

  .sidebar {
    height: 100vh;
    overflow-y: auto;
    scrollbar-width: thin;
    background-color: var(--background-secondary);
  }

  .content {
    padding: 24px 50px;
    display: flex;
    flex-direction: column;
    gap: 2.25rem;
  }

  .matrix {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .matrix-row {
    display: flex;
    gap: 0.5rem;
  }

  .matrix-cell {
    display: flex;
    flex-direction: column;
    gap: 0.25em;
    align-items: start;
    height: 80px;
    aspect-ratio: 16/9;
    background-color: var(--background-secondary);
    padding: 1rem;
  }

  .matrix-cell-active {
    background-color: var(--color-accent);
  }

  .matrix-cell-operation {
    font-family: 'IBM Plex Mono';
    font-size: var(--font-size-sm);
  }

  .matrix-cell-cost {
    font-family: 'IBM Plex Mono';
    font-weight: 600;
    font-size: var(--font-size-lg);
  }

  .header {
    font-size: var(--font-size-lg);
    font-weight: 600;
  }
</style>