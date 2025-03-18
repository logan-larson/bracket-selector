<script lang="ts">
  import type { Game as GameType } from '../stores';
  import Team from './Team.svelte';
  
  export let game: GameType;
  export let isAnimating: boolean = false;
  export let side: 'left' | 'right' | 'center' = 'left';
</script>

<div class="game" id={game.id} class:left={side === 'right'} class:right={side === 'left'} class:center={side === 'center'}>
  <div class="teams">
    <Team 
      team={game.team1} 
      winner={game.winner === game.team1} 
      highlight={isAnimating && game.winner === game.team1} 
    />
    <Team 
      team={game.team2} 
      winner={game.winner === game.team2}
      highlight={isAnimating && game.winner === game.team2}
    />
  </div>
  {#if side !== 'center'}
    <div class="connector-wrapper">
      <div class="connector" class:left-connector={side === 'left'} class:right-connector={side === 'right'}></div>
      <div class="vertical-connector"></div>
    </div>
  {/if}
</div>

<style>
  .game {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 4px;
    margin: 8px 0;
    width: 190px;
  }
  
  .teams {
    display: flex;
    flex-direction: column;
    gap: 4px;
    position: relative;
    z-index: 1;
  }
  
  .connector-wrapper {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 20px;
    z-index: 0;
  }
  
  .connector {
    position: absolute;
    top: 50%;
    height: 2px;
    background-color: var(--border-color);
    transform: translateY(-50%);
  }
  
  .vertical-connector {
    position: absolute;
    top: 17px;
    bottom: 17px;
    width: 2px;
    background-color: var(--border-color);
  }
  
  .left .connector-wrapper {
    right: -20px;
  }
  
  .right .connector-wrapper {
    left: -20px;
  }
  
  .left-connector {
    right: 0;
    width: 20px;
  }
  
  .right-connector {
    left: 0;
    width: 20px;
  }
  
  .left .vertical-connector {
    right: 0;
  }
  
  .right .vertical-connector {
    left: 0;
  }
  
  /* Additional styles for center alignment */
  .center {
    align-self: center;
  }
</style> 