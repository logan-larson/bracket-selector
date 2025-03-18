<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { bracketStore } from '../stores';
  import Round from './Round.svelte';
  
  let interval: number | null = null;
  let generationSpeed = 350; // ms between games

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
  
  // Watch for speed changes during generation
  $: if (interval !== null && $bracketStore.isGenerating) {
    clearInterval(interval);
    interval = window.setInterval(() => {
      bracketStore.advanceGeneration();
    }, generationSpeed);
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
  
  // Get championship info
  $: championship = centerRounds.find(r => r.name === 'Championship');
  $: champion = championship?.games[0]?.winner;
  
  // Convert speed value to descriptive text
  $: speedLabel = generationSpeed <= 100 ? 'Very Fast' : 
                  generationSpeed <= 250 ? 'Fast' : 
                  generationSpeed <= 500 ? 'Medium' :
                  generationSpeed <= 750 ? 'Slow' : 'Very Slow';
  
  // Count games completed and remaining
  $: completedGames = $bracketStore.rounds.reduce((acc, round) => {
    return acc + round.games.filter(game => game.winner !== null).length;
  }, 0);
  
  $: totalPossibleGames = $bracketStore.rounds.reduce((acc, round) => {
    return acc + round.games.length;
  }, 0);
  
  $: pendingCount = $bracketStore.pendingGames ? $bracketStore.pendingGames.length : 0;
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
      <label for="speed">Speed:</label>
      <input 
        type="range" 
        id="speed" 
        min="100" 
        max="1000" 
        step="50" 
        bind:value={generationSpeed}
        disabled={$bracketStore.isGenerating}
      />
      <span class="speed-label">{speedLabel}</span>
    </div>
    
    {#if $bracketStore.isGenerating}
      <div class="generation-status">
        <div class="progress-indicator"></div>
        <span>Generating: {completedGames} games complete • {pendingCount} pending</span>
      </div>
    {/if}
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
    
    <!-- Center rounds (Championship) -->
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
  
  {#if !$bracketStore.isGenerating && completedGames > 0 && champion}
    <div class="champion-banner">
      <div class="champion">
        <h2>🏆 CHAMPION 🏆</h2>
        <div class="champion-name">
          {champion.name || `${champion.region} ${champion.seed}`}
        </div>
        {#if champion.image}
          <div class="champion-image">
            <img src={champion.image} alt="Champion" />
          </div>
        {/if}
      </div>
    </div>
  {/if}
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
    flex-wrap: wrap;
  }
  
  .speed-control {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }
  
  .speed-label {
    min-width: 70px;
    text-align: left;
    font-size: 14px;
    color: var(--primary-color);
    font-weight: 500;
  }
  
  .generation-status {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: 16px;
    font-size: 14px;
    color: var(--secondary-color);
    animation: pulse 2s infinite;
  }
  
  .progress-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: var(--secondary-color);
    animation: blink 1s infinite;
  }
  
  @keyframes pulse {
    0% { opacity: 0.7; }
    50% { opacity: 1; }
    100% { opacity: 0.7; }
  }
  
  @keyframes blink {
    0% { transform: scale(0.8); }
    50% { transform: scale(1.2); }
    100% { transform: scale(0.8); }
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
  
  .champion-banner {
    background-color: var(--highlight-color);
    padding: 16px;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    animation: fadeIn 1s ease-in;
  }
  
  .champion {
    color: var(--primary-color);
  }
  
  .champion h2 {
    font-size: 24px;
    margin-bottom: 8px;
    color: #003b8e;
  }
  
  .champion-name {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 12px;
  }
  
  .champion-image {
    width: 120px;
    height: 120px;
    margin: 0 auto;
    border-radius: 50%;
    overflow: hidden;
    border: 4px solid var(--primary-color);
  }
  
  .champion-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style> 