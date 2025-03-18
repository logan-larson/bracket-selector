<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { bracketStore } from '../stores';
  import Round from './Round.svelte';
  
  let interval: number | null = null;
  let generationSpeed = 100; // ms between games

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
  
  // Group rounds by position
  $: leftRounds = $bracketStore.rounds.filter(round => round.position === 'left');
  $: rightRounds = $bracketStore.rounds.filter(round => round.position === 'right');
  $: centerRounds = $bracketStore.rounds.filter(round => round.position === 'center');
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
    <!-- Left side rounds -->
    <div class="bracket-side left-side">
      {#each leftRounds as round, i}
        {@const roundIndex = $bracketStore.rounds.findIndex(r => r.name === round.name)}
        <Round 
          {round} 
          isCurrentRound={roundIndex === $bracketStore.currentRound}
          currentGameIndex={$bracketStore.currentGame}
          side="left"
        />
      {/each}
    </div>
    
    <!-- Center rounds (Final Four & Championship) -->
    <div class="bracket-center">
      {#each centerRounds as round, i}
        {@const roundIndex = $bracketStore.rounds.findIndex(r => r.name === round.name)}
        <Round 
          {round} 
          isCurrentRound={roundIndex === $bracketStore.currentRound}
          currentGameIndex={$bracketStore.currentGame}
          side="center"
        />
      {/each}
    </div>
    
    <!-- Right side rounds -->
    <div class="bracket-side right-side">
      {#each rightRounds as round, i}
        {@const roundIndex = $bracketStore.rounds.findIndex(r => r.name === round.name)}
        <Round 
          {round} 
          isCurrentRound={roundIndex === $bracketStore.currentRound}
          currentGameIndex={$bracketStore.currentGame}
          side="right"
        />
      {/each}
    </div>
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
    padding: 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    overflow-x: auto;
    justify-content: center;
    gap: 10px;
  }
  
  .bracket-side {
    display: flex;
    gap: 10px;
  }
  
  .left-side {
    flex-direction: row;
  }
  
  .right-side {
    flex-direction: row-reverse; /* Reverse to make games flow toward center */
  }
  
  .bracket-center {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0 10px;
    min-width: 220px;
  }
</style> 