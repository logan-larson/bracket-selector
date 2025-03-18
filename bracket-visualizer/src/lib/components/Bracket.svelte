<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { bracketStore } from '../stores';
  import Round from './Round.svelte';
  
  let interval: number | null = null;
  let generationSpeed = 500; // ms between games

  function startGeneration() {
    bracketStore.generateBracket();
    
    interval = window.setInterval(() => {
      bracketStore.advanceGeneration();
    }, generationSpeed);
  }
  
  // Watch for generation completion
  $: if (!$bracketStore.isGenerating && interval !== null) {
    clearInterval(interval);
    interval = null;
  }
  
  function resetBracket() {
    if (interval !== null) {
      clearInterval(interval);
      interval = null;
    }
    
    bracketStore.resetBracket();
  }
  
  onDestroy(() => {
    if (interval !== null) {
      clearInterval(interval);
    }
  });
</script>

<div class="bracket-container">
  <div class="controls">
    <button on:click={startGeneration} disabled={$bracketStore.isGenerating}>
      Generate Bracket
    </button>
    <button on:click={resetBracket} disabled={$bracketStore.isGenerating}>
      Reset
    </button>
    <div class="speed-control">
      <label for="speed">Generation Speed:</label>
      <input 
        type="range" 
        id="speed" 
        min="100" 
        max="1000" 
        step="100" 
        bind:value={generationSpeed}
        disabled={$bracketStore.isGenerating}
      />
      <span>{generationSpeed}ms</span>
    </div>
  </div>
  
  <div class="bracket">
    {#each $bracketStore.rounds as round, i}
      <Round 
        {round} 
        isCurrentRound={i === $bracketStore.currentRound}
        currentGameIndex={$bracketStore.currentGame}
      />
    {/each}
  </div>
</div>

<style>
  .bracket-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 100%;
    overflow-x: auto;
  }
  
  .controls {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 16px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .speed-control {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }
  
  .bracket {
    display: flex;
    gap: 40px;
    padding: 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    overflow-x: auto;
  }
</style> 