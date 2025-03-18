<script lang="ts">
  import type { Game as GameType } from '../stores';
  import Team from './Team.svelte';
  
  export let game: GameType;
  export let isAnimating: boolean = false;
</script>

<div class="game" id={game.id}>
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
  <div class="connector"></div>
</div>

<style>
  .game {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 4px;
    margin: 8px 0;
  }
  
  .teams {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .connector {
    position: absolute;
    right: -20px;
    top: 50%;
    width: 20px;
    height: 2px;
    background-color: var(--border-color);
    transform: translateY(-50%);
  }
</style> 