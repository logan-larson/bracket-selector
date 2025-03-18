<script lang="ts">
  import type { Round as RoundType } from '../stores';
  import Game from './Game.svelte';
  
  export let round: RoundType;
  export let isCurrentRound: boolean = false;
  export let currentGameIndex: number = -1;
</script>

<div class="round">
  <h3 class="round-title">{round.name}</h3>
  <div class="games">
    {#each round.games as game, index}
      <Game 
        {game} 
        isAnimating={isCurrentRound && index === currentGameIndex && game.winner !== null} 
      />
    {/each}
  </div>
</div>

<style>
  .round {
    display: flex;
    flex-direction: column;
    min-width: 240px;
  }
  
  .round-title {
    text-align: center;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    color: var(--primary-color);
  }
  
  .games {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  /* Adjust spacing for each round */
  :global(.round:nth-child(2) .games) {
    padding-top: 24px;
  }
  
  :global(.round:nth-child(3) .games) {
    padding-top: 70px;
    gap: 83px;
  }
  
  :global(.round:nth-child(4) .games) {
    padding-top: 177px;
    gap: 209px;
  }
  
  :global(.round:nth-child(5) .games) {
    padding-top: 386px;
    gap: 462px;
  }
  
  :global(.round:nth-child(6) .games) {
    padding-top: 606px;
  }
</style> 