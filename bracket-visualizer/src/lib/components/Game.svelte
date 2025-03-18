<script lang="ts">
  import type { Game as GameType } from '../stores';
  import Team from './Team.svelte';
  
  export let game: GameType;
  export let isAnimating: boolean = false;
  export let side: 'left' | 'right' | 'center' = 'left';
  export let isActive: boolean = false;
</script>

<div class="game" id={game.id} 
  class:left={side === 'left'} 
  class:right={side === 'right'} 
  class:center={side === 'center'}
  class:active={isActive}>
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
    transition: all 0.3s ease;
  }
  
  .active {
    transform: scale(1.05);
    z-index: 10;
  }
  
  .active .teams {
    box-shadow: 0 0 8px rgba(255, 199, 44, 0.8);
  }
  
  .teams {
    display: flex;
    flex-direction: column;
    gap: 4px;
    position: relative;
    z-index: 1;
    transition: box-shadow 0.3s ease;
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