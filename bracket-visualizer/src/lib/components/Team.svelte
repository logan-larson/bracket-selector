<script lang="ts">
  import type { Team } from '../stores';
  
  export let team: Team | null = null;
  export let winner: boolean = false;
  export let highlight: boolean = false;
</script>

<div class="team {winner ? 'winner' : ''} {highlight ? 'highlight' : ''}" class:empty={!team}>
  {#if team}
    <div class="seed">{team.seed}</div>
    <div class="info">
      <div class="name">{team.name || `${team.region} ${team.seed}`}</div>
      {#if team.image}
        <div class="image-container">
          <img src={team.image} alt="{team.name || `${team.region} ${team.seed}`}" />
        </div>
      {/if}
    </div>
  {:else}
    <div class="placeholder">TBD</div>
  {/if}
</div>

<style>
  .team {
    display: flex;
    align-items: center;
    padding: 8px;
    border-radius: 4px;
    background-color: white;
    border: 1px solid var(--border-color);
    margin: 2px 0;
    height: 40px;
    width: 200px;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    gap: 8px;
    overflow: hidden;
  }
  
  .winner {
    border-color: var(--primary-color);
    background-color: rgba(0, 71, 171, 0.1);
    font-weight: bold;
  }
  
  .seed {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    background-color: var(--primary-color);
    color: white;
    border-radius: 50%;
    font-size: 12px;
    font-weight: bold;
  }
  
  .info {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    overflow: hidden;
  }
  
  .name {
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .empty {
    background-color: #f9f9f9;
    color: #999;
  }
  
  .placeholder {
    width: 100%;
    text-align: center;
    font-style: italic;
    font-size: 12px;
  }
  
  .image-container {
    width: 24px;
    height: 24px;
    overflow: hidden;
    border-radius: 50%;
    margin-left: 8px;
  }
  
  .image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style> 