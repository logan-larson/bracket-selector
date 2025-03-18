<script lang="ts">
  import type { Round as RoundType } from '../stores';
  import Game from './Game.svelte';
  
  export let round: RoundType;
  export let isCurrentRound: boolean = false;
  export let currentGameIndex: number = -1;
  export let side: 'left' | 'right' | 'center' = 'left';
  
  $: roundName = round.name.replace(/ \(Left\)| \(Right\)/g, '');
</script>

<div class="round" class:left={side === 'left'} class:right={side === 'right'} class:center={side === 'center'}>
  <h3 class="round-title">{roundName}</h3>
  <div class="games">
    {#each round.games as game, index}
      <Game 
        {game} 
        isAnimating={isCurrentRound && index === currentGameIndex && game.winner !== null} 
        {side}
      />
    {/each}
  </div>
</div>

<style>
  .round {
    display: flex;
    flex-direction: column;
    min-width: 180px;
    margin: 0 6px;
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
  
  /* Left side rounds */
  .left .games {
    align-items: flex-end;
  }
  
  /* Right side rounds */
  .right .games {
    align-items: flex-start;
  }
  
  /* Adjust spacing for different rounds */
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
  
  /* Championship */
  .center .games {
    justify-content: center;
  }
  
  /* Final Four */
  :global(.bracket-center > :first-child .games) {
    padding-top: 160px;
    gap: 260px;
  }
  
  /* Championship */
  :global(.bracket-center > :last-child .games) {
    padding-top: 290px;
  }
</style> 